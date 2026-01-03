import { execFile } from "node:child_process";
import * as fs from "node:fs";
import * as path from "node:path";
import { promisify } from "node:util";
import { nanoid } from "nanoid";
import * as vscode from "vscode";

import { ensureSignedIn, getFirebaseClients } from "./firebase";
import {
	extToContentType,
	isLikelyImageFile,
	parseClipboardPathToLocalFile,
} from "./paths";

const CTX_OVERRIDE = "markdownImageUploader.overridePaste";
const execFileAsync = promisify(execFile);

async function readMacClipboardFilePaths(): Promise<string[]> {
	// macOS FinderでファイルをCmd+Cした場合、VS Codeのclipboard textはファイル名だけになることがある。
	// そのケースでは、macOSのクリップボードに入っている「ファイル参照」をosascriptで取得する。
	//
	// 実際のペーストボードの型は環境/状況で変わるため、複数の方法で段階的に試す:
	// - AppleScript: alias list / alias / «class furl»（file URL）
	// - JXA(AppKit): public.file-url / NSFilenamesPboardType

	const runAppleScript = async (script: string) => {
		try {
			const { stdout, stderr } = await execFileAsync(
				"osascript",
				["-e", script],
				{
					maxBuffer: 1024 * 1024,
				},
			);
			return { stdout: String(stdout ?? ""), stderr: String(stderr ?? "") };
		} catch (e) {
			// osascript の構文エラーなどで非0終了しても、他方式のフォールバックへ進めるようにする
			return { stdout: "", stderr: String(e) };
		}
	};

	const runJxa = async (script: string) => {
		try {
			const { stdout, stderr } = await execFileAsync(
				"osascript",
				["-l", "JavaScript", "-e", script],
				{ maxBuffer: 1024 * 1024 },
			);
			return { stdout: String(stdout ?? ""), stderr: String(stderr ?? "") };
		} catch (e) {
			return { stdout: "", stderr: String(e) };
		}
	};

	const parseStdoutLines = (stdout: string) =>
		stdout
			.split(/\r?\n/)
			.map((s) => s.trim())
			.filter(Boolean);

	// 1) alias list
	{
		const script = `
      try
        set theFiles to the clipboard as alias list
        set out to {}
        repeat with f in theFiles
          set end of out to POSIX path of f
        end repeat
        set AppleScript's text item delimiters to "\\n"
        return out as text
      on error
        return ""
      end try
    `;
		const { stdout } = await runAppleScript(script);
		const paths = parseStdoutLines(stdout);
		if (paths.length) return paths;
	}

	// 2) alias (単一)
	{
		const script = `
      try
        set f to (the clipboard as alias)
        return POSIX path of f
      on error
        return ""
      end try
    `;
		const { stdout } = await runAppleScript(script);
		const paths = parseStdoutLines(stdout);
		if (paths.length) return paths;
	}

	// 3) «class furl» (file URL) -> alias
	{
		const script = `
      try
        set u to (the clipboard as «class furl»)
        set f to (u as alias)
        return POSIX path of f
      on error
        return ""
      end try
    `;
		const { stdout } = await runAppleScript(script);
		const paths = parseStdoutLines(stdout);
		if (paths.length) return paths;
	}

	// 4) JXA(AppKit)でpublic.file-url/NSFilenamesPboardTypeを読む（Finderコピーで最も当たりやすい）
	{
		const script = `
      ObjC.import('AppKit');
      const pb = $.NSPasteboard.generalPasteboard;
      let paths = [];

      // Legacy
      try {
        const legacy = pb.propertyListForType('NSFilenamesPboardType');
        if (legacy) paths = paths.concat(ObjC.unwrap(legacy));
      } catch (e) {}

      // Modern: pasteboard items with public.file-url
      try {
        const items = ObjC.unwrap(pb.pasteboardItems);
        if (items) {
          for (const item of items) {
            const s = ObjC.unwrap(item.stringForType('public.file-url'));
            if (!s) continue;
            const url = $.NSURL.URLWithString(s);
            if (!url) continue;
            const p = ObjC.unwrap(url.path);
            if (p) paths.push(p);
          }
        }
      } catch (e) {}

      // uniq + output
      const uniq = Array.from(new Set(paths.filter(Boolean)));
      uniq.join('\\n');
    `;

		const { stdout } = await runJxa(script);
		const paths = parseStdoutLines(stdout);
		if (paths.length) return paths;
	}

	return [];
}

function getConfig() {
	const cfg = vscode.workspace.getConfiguration("markdownImageUploader");
	return {
		uploadRootFolder: cfg.get<string>("uploadRootFolder", "").trim(),
		overridePasteInMarkdown: cfg.get<boolean>("overridePasteInMarkdown", true),
		firebaseApiKey: cfg.get<string>("firebaseApiKey", "").trim(),
		firebaseAuthDomain: cfg.get<string>("firebaseAuthDomain", "").trim(),
		firebaseProjectId: cfg.get<string>("firebaseProjectId", "").trim(),
		firebaseStorageBucket: cfg.get<string>("firebaseStorageBucket", "").trim(),
		firebaseAppId: cfg.get<string>("firebaseAppId", "").trim(),
		authEmail: cfg.get<string>("authEmail", "").trim(),
		authPassword: cfg.get<string>("authPassword", ""),
		useAnonymousAuth: cfg.get<boolean>("useAnonymousAuth", true),
		debug: cfg.get<boolean>("debug", false),
	};
}

function createLogger() {
	const output = vscode.window.createOutputChannel("Markdown Image Uploader", {
		log: true,
	});

	const ts = () => new Date().toISOString();
	const line = (level: "INFO" | "WARN" | "ERROR", message: string) => {
		output.appendLine(`[${ts()}] [${level}] ${message}`);
	};

	return {
		output,
		info: (msg: string) => line("INFO", msg),
		warn: (msg: string) => line("WARN", msg),
		error: (msg: string) => line("ERROR", msg),
	};
}

async function refreshContextKey() {
	const { overridePasteInMarkdown } = getConfig();
	await vscode.commands.executeCommand(
		"setContext",
		CTX_OVERRIDE,
		overridePasteInMarkdown,
	);
}

function getMarkdownBaseName(editor: vscode.TextEditor): string {
	const filename = editor.document.fileName;
	if (!filename || filename === "Untitled-1" || editor.document.isUntitled)
		return "untitled";
	return path.parse(filename).name || "untitled";
}

function getUploadObjectPath(
	uploadRootFolder: string,
	mdBaseName: string,
	imageFilePath: string,
): string {
	const ext = path.extname(imageFilePath).toLowerCase();
	const id = nanoid(10);
	return `${uploadRootFolder}/${mdBaseName}/${id}${ext}`;
}

async function pasteFallback() {
	// Default paste behavior
	await vscode.commands.executeCommand("editor.action.clipboardPasteAction");
}

export function activate(context: vscode.ExtensionContext) {
	const log = createLogger();
	context.subscriptions.push(log.output);

	const cfgAtActivate = getConfig();
	log.info(
		`activate() called. overridePasteInMarkdown=${cfgAtActivate.overridePasteInMarkdown} debug=${cfgAtActivate.debug}`,
	);
	if (cfgAtActivate.debug) log.output.show(true);

	void refreshContextKey().catch((e) => {
		log.error(`Failed to refresh context key: ${String(e)}`);
	});

	context.subscriptions.push(
		vscode.workspace.onDidChangeConfiguration((e) => {
			if (
				e.affectsConfiguration("markdownImageUploader.overridePasteInMarkdown")
			) {
				const cfg = getConfig();
				log.info(
					`Config changed: overridePasteInMarkdown=${cfg.overridePasteInMarkdown}`,
				);
				void refreshContextKey().catch((err) => {
					log.error(`Failed to refresh context key: ${String(err)}`);
				});
			}
			if (e.affectsConfiguration("markdownImageUploader.debug")) {
				const cfg = getConfig();
				log.info(`Config changed: debug=${cfg.debug}`);
				if (cfg.debug) log.output.show(true);
			}
		}),
	);

	context.subscriptions.push(
		vscode.commands.registerCommand("markdownImageUploader.paste", async () => {
			const cfg = getConfig();
			const debug = cfg.debug;

			try {
				const editor = vscode.window.activeTextEditor;
				if (!editor) {
					if (debug) log.warn("No activeTextEditor; aborting.");
					return;
				}

				const lang = editor.document.languageId;
				if (lang !== "markdown") {
					if (debug) log.info(`Non-markdown editor (${lang}); fallback paste.`);
					await pasteFallback();
					return;
				}

				const clipboardText = (await vscode.env.clipboard.readText()).trim();
				if (debug) log.info(`Clipboard text: ${JSON.stringify(clipboardText)}`);

				let localPath = parseClipboardPathToLocalFile(clipboardText);

				// macOSのみ: Finderの「ファイルをコピー」→VS Code貼り付けが「ファイル名だけ」になる問題へのフォールバック
				// - clipboardTextがファイルパスとして解釈できない / もしくは存在しない場合に、osascriptで実パスを取得して補完する
				if (
					process.platform === "darwin" &&
					(!localPath || !fs.existsSync(localPath))
				) {
					try {
						const macPaths = await readMacClipboardFilePaths();
						if (debug) log.info(`macPaths: ${JSON.stringify(macPaths)}`);
						const candidate = macPaths.find((p) => fs.existsSync(p));
						if (candidate) {
							if (debug)
								log.info(`macOS clipboard file path detected: ${candidate}`);
							localPath = candidate;
						}
					} catch (e) {
						if (debug) {
							log.warn(`macOS clipboard fallback failed: ${String(e)}`);
						}
					}
				}

				if (!localPath) {
					if (debug) {
						log.info(
							"Clipboard is not a file path string. This extension only handles 'image file path text' (not image binary clipboard). Fallback paste.",
						);
					}
					await pasteFallback();
					return;
				}

				if (!fs.existsSync(localPath)) {
					if (debug) log.warn(`File does not exist: ${localPath}; fallback.`);
					await pasteFallback();
					return;
				}
				const st = fs.statSync(localPath);
				if (!st.isFile() || !isLikelyImageFile(localPath)) {
					if (debug) {
						log.warn(
							`Not an image file: ${localPath} (isFile=${st.isFile()} ext=${path.extname(localPath)})`,
						);
					}
					await pasteFallback();
					return;
				}

				if (
					!cfg.firebaseApiKey ||
					!cfg.firebaseAuthDomain ||
					!cfg.firebaseProjectId ||
					!cfg.firebaseStorageBucket
				) {
					log.warn("Firebase config is missing; showing error and fallback.");
					vscode.window.showErrorMessage(
						"Markdown Image Uploader: Firebase設定が不足しています（apiKey/authDomain/projectId/storageBucket）。settings.json を設定してください。",
					);
					await pasteFallback();
					return;
				}

				const mdBaseName = getMarkdownBaseName(editor);
				const objectPath = getUploadObjectPath(
					cfg.uploadRootFolder,
					mdBaseName,
					localPath,
				);
				const contentType = extToContentType(
					path.extname(localPath).toLowerCase(),
				);
				log.info(
					`Uploading: localPath=${localPath} uploadRootFolder=${cfg.uploadRootFolder} objectPath=${objectPath}`,
				);

				await vscode.window.withProgress(
					{
						location: vscode.ProgressLocation.Notification,
						title: "Uploading image to Firebase Storage…",
						cancellable: false,
					},
					async () => {
						const bytes = await fs.promises.readFile(localPath);
						const { auth, storage, storageRef, uploadBytes, getDownloadURL } =
							getFirebaseClients({
								apiKey: cfg.firebaseApiKey,
								authDomain: cfg.firebaseAuthDomain,
								projectId: cfg.firebaseProjectId,
								storageBucket: cfg.firebaseStorageBucket,
								appId: cfg.firebaseAppId || undefined,
							});

						await ensureSignedIn(auth, {
							email: cfg.authEmail || undefined,
							password: cfg.authPassword || undefined,
							useAnonymousAuth: cfg.useAnonymousAuth,
						});

						const ref = storageRef(storage, objectPath);
						await uploadBytes(
							ref,
							bytes,
							contentType ? { contentType } : undefined,
						);
						const url = await getDownloadURL(ref);

						const alt = path.parse(localPath).name;
						const md = `![${alt}](${url})`;

						await editor.edit((editBuilder) => {
							for (const sel of editor.selections) {
								editBuilder.replace(sel, md);
							}
						});

						log.info(`Upload completed. URL inserted.`);
					},
				);
			} catch (e) {
				log.error(`Unhandled error in command: ${String(e)}`);
				vscode.window.showErrorMessage(
					`Markdown Image Uploader: エラーが発生しました。Outputの「Markdown Image Uploader」ログを確認してください。`,
				);
				await pasteFallback();
			}
		}),
	);

	context.subscriptions.push(
		vscode.commands.registerCommand("markdownImageUploader.openLogs", () => {
			log.output.show(true);
		}),
	);
}

export function deactivate() {
	// noop
}
