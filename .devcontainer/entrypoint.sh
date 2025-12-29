#!/bin/sh

# package.json がなければ pnpm create create-next-app を実行
if [ ! -f "/workspace/app/package.json" ]; then
  echo "No package.json found, initializing Next.js project..."
  pnpm create next-app@latest app \
  --typescript \
  --tailwind \
  --biome \
  --app \
  --src-dir \
  --import-alias "@/*" \
  --turbopack \
  --react-compiler \
  --yes

  rm -rf /workspace/app/.gitignore

  # サプライチェーン攻撃対策: テンプレートファイルをコピー
  echo "Copying security configuration files..."
  if [ -f ".devcontainer/.npmrc" ]; then
    cp .devcontainer/.npmrc /workspace/app/.npmrc
  fi
  if [ -f ".devcontainer/.npmpackagejsonlintrc.json" ]; then
    cp .devcontainer/.npmpackagejsonlintrc.json /workspace/app/.npmpackagejsonlintrc.json
  fi
  if [ -f ".devcontainer/pnpm-workspace.yaml" ]; then
    cp .devcontainer/pnpm-workspace.yaml /workspace/app/pnpm-workspace.yaml
  fi

  # package.jsonにpackageManagerフィールドを追加（corepackで管理）
  cd /workspace/app || exit 1
  pnpm_version=$(pnpm -v)
  if [ -n "$pnpm_version" ]; then
    node -e "
      const fs = require('fs');
      const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      pkg.packageManager = 'pnpm@${pnpm_version}';
      fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2) + '\n');
    " || echo "Warning: Failed to add packageManager field to package.json"
  fi

  # npm-package-json-lintをインストールしてlintスクリプトを追加
  echo "Installing npm-package-json-lint..."
  pnpm add -D npm-package-json-lint || echo "Warning: Failed to install npm-package-json-lint"
  node -e "
    const fs = require('fs');
    const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    if (!pkg.scripts) pkg.scripts = {};
    pkg.scripts['lint:package-json'] = 'pnpm exec npmPkgJsonLint .';
    fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2) + '\n');
  " || echo "Warning: Failed to add lint:package-json script to package.json"
  cd /workspace || exit 1
else
  echo "package.json found, skipping Next.js project initialization."
  # 既存プロジェクトでもセキュリティ設定ファイルがなければコピー
  if [ ! -f "/workspace/app/.npmrc" ]; then
    echo "Copying security configuration files..."
    cp .devcontainer/.npmrc /workspace/app/.npmrc 2>/dev/null || true
    cp .devcontainer/.npmpackagejsonlintrc.json /workspace/app/.npmpackagejsonlintrc.json 2>/dev/null || true
    cp .devcontainer/pnpm-workspace.yaml /workspace/app/pnpm-workspace.yaml 2>/dev/null || true
  fi
  # node_modulesが存在しない場合は依存関係をインストール
  if [ ! -d "/workspace/app/node_modules" ]; then
    echo "node_modules not found, installing dependencies..."
    cd /workspace/app || exit 1
    pnpm install || echo "Warning: Failed to install dependencies"
    cd /workspace || exit 1
  fi
fi

cat .devcontainer/.zshrc >> ~/.zshrc
zsh && source ~/.zshrc

# # シェルを起動してコンテナが終了しないようにする
exec "$@"
