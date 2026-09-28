import AsyncStorage from '@react-native-async-storage/async-storage';
import { FirebaseApp, getApps, initializeApp } from 'firebase/app';
import { Auth, getAuth, initializeAuth } from 'firebase/auth';
import { Firestore, getFirestore, initializeFirestore } from 'firebase/firestore';
import { FirebaseStorage, getStorage } from 'firebase/storage';

// `getReactNativePersistence` is only published on firebase/auth's React Native
// build, not its public type declarations, so it must be accessed untyped.
const getReactNativePersistence = (require('firebase/auth') as { getReactNativePersistence: (storage: unknown) => import('firebase/auth').Persistence }).getReactNativePersistence;

const requiredEnv = (name: string) => {
  const value = process.env[name];
  if (!value || value.startsWith('your_')) {
    throw new Error(`Missing Firebase configuration: ${name}`);
  }
  return value;
};

const firebaseConfig = {
  apiKey: requiredEnv('EXPO_PUBLIC_FIREBASE_API_KEY'),
  authDomain: requiredEnv('EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN'),
  projectId: requiredEnv('EXPO_PUBLIC_FIREBASE_PROJECT_ID'),
  storageBucket: requiredEnv('EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET'),
  messagingSenderId: requiredEnv('EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID'),
  appId: requiredEnv('EXPO_PUBLIC_FIREBASE_APP_ID'),
  measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

export const firebaseApp: FirebaseApp = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

// Use AsyncStorage-backed persistence so the session survives app restarts.
// initializeAuth() throws if called more than once (e.g. Fast Refresh), so fall back to getAuth().
let authInstance: Auth;
try {
  authInstance = initializeAuth(firebaseApp, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} catch {
  authInstance = getAuth(firebaseApp);
}
export const auth: Auth = authInstance;

// ignoreUndefinedProperties prevents Firestore write errors when optional fields
// (e.g. driverId, currentLocation) are omitted from form data.
let firestoreInstance: Firestore;
try {
  firestoreInstance = initializeFirestore(firebaseApp, { ignoreUndefinedProperties: true });
} catch {
  firestoreInstance = getFirestore(firebaseApp);
}
export const db: Firestore = firestoreInstance;

export const storage: FirebaseStorage = getStorage(firebaseApp);

export { firebaseConfig };

