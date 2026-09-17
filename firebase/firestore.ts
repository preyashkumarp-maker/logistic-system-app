import { collection, doc, serverTimestamp, Timestamp } from 'firebase/firestore';

import { db } from './config';

export const getCollectionRef = (path: string) => collection(db, path);
export const getDocRef = (path: string, id: string) => doc(db, path, id);
export const nowTimestamp = () => serverTimestamp();

export const toDateValue = (value: Timestamp | { seconds: number; nanoseconds: number } | null | undefined) => {
  if (!value) return new Date();
  if (value instanceof Timestamp) return value.toDate();
  return new Date(value.seconds * 1000);
};
