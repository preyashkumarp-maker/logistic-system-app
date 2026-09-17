import {
    createUserWithEmailAndPassword,
    signOut as firebaseSignOut,
    onAuthStateChanged,
    signInWithEmailAndPassword,
    updateProfile,
    User,
    UserCredential,
} from 'firebase/auth';

import { auth } from './config';

export const signUp = async (email: string, password: string): Promise<UserCredential> =>
  createUserWithEmailAndPassword(auth, email, password);

export const signIn = async (email: string, password: string): Promise<UserCredential> =>
  signInWithEmailAndPassword(auth, email, password);

export const logout = async (): Promise<void> => {
  await firebaseSignOut(auth);
};

export const setDisplayName = async (user: User, name: string): Promise<void> => {
  await updateProfile(user, { displayName: name });
};

export const subscribeToAuthState = (callback: (user: User | null) => void) =>
  onAuthStateChanged(auth, callback);
