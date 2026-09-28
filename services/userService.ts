import { collection, doc, getDocs, onSnapshot, orderBy, query, updateDoc, where } from 'firebase/firestore';

import { db } from '@/firebase/config';
import { createDriver } from '@/services/driverService';
import { AppUserProfile, UserRole } from '@/types/auth';

const mapUser = (snapshot: { id: string; data: () => object }) => ({
  ...(snapshot.data() as Omit<AppUserProfile, 'id'>),
  id: snapshot.id,
});

export const listenToUsers = (callback: (users: AppUserProfile[]) => void) => {
  return onSnapshot(
    query(collection(db, 'users'), orderBy('createdAt', 'desc')),
    (snapshot) => callback(snapshot.docs.map(mapUser)),
    () => callback([]),
  );
};

export const updateUserRole = async (uid: string, role: Exclude<UserRole, 'admin'>) => {
  await updateDoc(doc(db, 'users', uid), {
    role,
    updatedAt: new Date().toISOString(),
  });

  if (role === 'driver') {
    const existingDriver = await getDocs(query(collection(db, 'drivers'), where('authUserId', '==', uid)));
    if (existingDriver.empty) {
      const profileSnapshot = await getDocs(query(collection(db, 'users'), where('__name__', '==', uid)));
      const profile = profileSnapshot.docs[0]?.data() as AppUserProfile | undefined;
      await createDriver({
        authUserId: uid,
        name: profile?.name ?? '',
        email: profile?.email ?? '',
        phone: profile?.phone ?? '',
      });
    }
  }
};