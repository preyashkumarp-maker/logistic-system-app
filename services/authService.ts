import { User } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

import {
  logout,
  setDisplayName,
  signIn,
  signUp,
} from '@/firebase/auth';

import { db } from '@/firebase/config';
import { AppUserProfile } from '@/types/auth';

export const createUserProfile = async (
  user: User,
  values: {
    name: string;
    email: string;
    phone: string;
  },
) => {
  const profile: AppUserProfile = {
    id: user.uid,
    name: values.name,
    email: values.email,
    phone: values.phone,

    // Every normal signup is a USER.
    // Admin/driver roles must be assigned separately.
    role: 'user',

    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  await setDoc(doc(db, 'users', user.uid), profile);

  return profile;
};

export const getUserProfile = async (
  uid: string,
): Promise<AppUserProfile | null> => {
  const profileSnap = await getDoc(
    doc(db, 'users', uid),
  );

  if (!profileSnap.exists()) {
    return null;
  }

  return {
    ...(profileSnap.data() as Omit<AppUserProfile, 'id'>),
    id: profileSnap.id,
  };
};

export const updateUserProfile = async (
  uid: string,
  values: {
    name?: string;
    phone?: string;
  },
) => {
  await setDoc(
    doc(db, 'users', uid),
    {
      ...values,
      updatedAt: new Date().toISOString(),
    },
    {
      merge: true,
    },
  );
};

export const registerUser = async (values: {
  name: string;
  email: string;
  password: string;
  phone: string;
}) => {
  const credential = await signUp(
    values.email,
    values.password,
  );

  await setDisplayName(
    credential.user,
    values.name,
  );

  await createUserProfile(
    credential.user,
    {
      name: values.name,
      email: values.email,
      phone: values.phone,
    },
  );

  return credential.user;
};

export const loginUser = async (
  email: string,
  password: string,
) => {
  return signIn(email, password);
};

export const logoutUser = async () => {
  return logout();
};