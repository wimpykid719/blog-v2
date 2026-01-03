import { type FirebaseApp, initializeApp } from "firebase/app";
import {
  type Auth,
  getAuth,
  signInAnonymously,
  signInWithEmailAndPassword,
} from "firebase/auth";
import {
  type FirebaseStorage,
  getDownloadURL,
  getStorage,
  ref as storageRef,
  uploadBytes,
} from "firebase/storage";

type FirebaseConfig = {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  appId?: string;
};

type AuthConfig = {
  email?: string;
  password?: string;
  useAnonymousAuth: boolean;
};

let singleton:
  | {
      key: string;
      app: FirebaseApp;
      auth: Auth;
      storage: FirebaseStorage;
    }
  | undefined;

function makeKey(c: FirebaseConfig) {
  return [
    c.apiKey,
    c.authDomain,
    c.projectId,
    c.storageBucket,
    c.appId ?? "",
  ].join("|");
}

export function getFirebaseClients(config: FirebaseConfig) {
  const key = makeKey(config);
  if (!singleton || singleton.key !== key) {
    const app = initializeApp({
      apiKey: config.apiKey,
      authDomain: config.authDomain,
      projectId: config.projectId,
      storageBucket: config.storageBucket,
      appId: config.appId,
    });
    singleton = {
      key,
      app,
      auth: getAuth(app),
      storage: getStorage(app),
    };
  }

  return {
    app: singleton.app,
    auth: singleton.auth,
    storage: singleton.storage,
    storageRef,
    uploadBytes,
    getDownloadURL,
  };
}

export async function ensureSignedIn(auth: Auth, cfg: AuthConfig) {
  if (auth.currentUser) return;

  const email = cfg.email?.trim();
  const password = cfg.password;

  if (email && password) {
    await signInWithEmailAndPassword(auth, email, password);
    return;
  }

  if (cfg.useAnonymousAuth) {
    await signInAnonymously(auth);
  }
}
