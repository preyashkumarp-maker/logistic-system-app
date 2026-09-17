import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';

import { storage } from './config';

export const uploadFile = async (path: string, file: Blob | Uint8Array | ArrayBuffer) => {
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
};
