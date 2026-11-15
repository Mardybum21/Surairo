import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore, doc, getDocFromServer } from 'firebase/firestore';

// In AI Studio or development builds, firebase-applet-config.json may be present.
// We load environmental overrides with fallback to the local applet config.
// @ts-ignore
import appletConfig from '../../firebase-applet-config.json';

const configFromJson: Record<string, any> = (appletConfig as any) || {};

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || configFromJson.apiKey || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || configFromJson.authDomain || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || configFromJson.projectId || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || configFromJson.storageBucket || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || configFromJson.messagingSenderId || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || configFromJson.appId || '',
};

export const isFirebaseAvailable = (): boolean => {
  return Boolean(firebaseConfig.apiKey && firebaseConfig.projectId);
};

let appInstance: FirebaseApp | null = null;
let authInstance: Auth | null = null;
let dbInstance: Firestore | null = null;

if (isFirebaseAvailable()) {
  try {
    appInstance = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    authInstance = getAuth(appInstance);
    // Use configured firestoreDatabaseId if specified, or standard default
    const databaseId = import.meta.env.VITE_FIREBASE_FIRESTORE_DATABASE_ID || configFromJson.firestoreDatabaseId;
    dbInstance = databaseId && databaseId !== '(default)'
      ? getFirestore(appInstance, databaseId)
      : getFirestore(appInstance);
  } catch (err) {
    console.warn('[SURARIO Firebase] Failed to initialize Firebase SDK:', err);
  }
} else {
  console.info('[SURARIO Firebase] Running in local offline mode. Firebase credentials not yet configured.');
}

export const app = appInstance;
export const auth = authInstance;
export const db = dbInstance;

/**
 * Validates connection to Firestore backend gracefully
 */
export async function testFirestoreConnection(): Promise<boolean> {
  if (!db) return false;
  try {
    // Tests connection to server without throwing uncaught app exceptions
    await getDocFromServer(doc(db, '_health', 'status'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('[SURARIO Firebase] Offline mode active.');
    }
    return false;
  }
}
