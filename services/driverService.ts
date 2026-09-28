import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDoc,
    getDocs,
    onSnapshot,
    orderBy,
    query,
    serverTimestamp,
    setDoc,
    updateDoc,
    where,
} from 'firebase/firestore';

import { auth, db } from '@/firebase/config';
import { UserRole } from '@/types/auth';
import { Driver, DriverStatus } from '@/types/driver';

const DRIVERS = 'drivers';

const getCurrentUser = () => {
  const user = auth.currentUser;

  if (!user) {
    throw new Error('You must be signed in.');
  }

  return user;
};

export const createDriver = async (data: Partial<Driver>) => {
  const user = getCurrentUser();

  const driver: Omit<Driver, 'id'> & { userId: string } = {
    authUserId: data.authUserId,
    name: data.name ?? '',
    phone: data.phone ?? '',
    email: data.email ?? '',
    vehicleNumber: data.vehicleNumber ?? '',
    vehicleType: data.vehicleType ?? 'Van',
    status: data.status ?? 'AVAILABLE',
    currentLocation: data.currentLocation,
    userId: user.uid,
    createdAt: serverTimestamp() as any,
    updatedAt: serverTimestamp() as any,
  };

  const ref = data.authUserId
    ? doc(db, DRIVERS, data.authUserId)
    : await addDoc(collection(db, DRIVERS), driver);

  if (data.authUserId) {
    await setDoc(ref, driver);
  }

  return { id: ref.id, ...driver } as Driver;
};

export const getDrivers = async (): Promise<Driver[]> => {
  const user = getCurrentUser();

  const q = query(
    collection(db, DRIVERS),
    where('userId', '==', user.uid),
    orderBy('createdAt', 'desc'),
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((docSnap) => {
    const data = docSnap.data() as Partial<Driver>;
    delete data.id;

    return {
      id: docSnap.id,
      ...data,
    } as Driver;
  });
};

export const getDriverById = async (
  id: string,
): Promise<Driver | null> => {
  getCurrentUser();

  const ref = doc(db, DRIVERS, id);
  const snapshot = await getDoc(ref);

  if (!snapshot.exists()) return null;

  const data = snapshot.data() as Partial<Driver>;
  delete data.id;

  return {
    id: snapshot.id,
    ...data,
  } as Driver;
};

export const updateDriver = async (
  id: string,
  data: Partial<Driver>,
) => {
  getCurrentUser();

  const ref = doc(db, DRIVERS, id);

  await updateDoc(ref, {
    ...data,
    updatedAt: serverTimestamp(),
  });
};

export const deleteDriver = async (id: string) => {
  getCurrentUser();

  await deleteDoc(doc(db, DRIVERS, id));
};

export const listenToDrivers = (
  role: UserRole,
  uid: string,
  callback: (items: Driver[]) => void,
  onError?: (error: Error) => void,
) => {
  const user = auth.currentUser;

  if (!user) {
    callback([]);
    return () => {};
  }

  const q = role === 'admin'
    ? query(collection(db, DRIVERS), orderBy('createdAt', 'desc'))
    : query(collection(db, DRIVERS), where('authUserId', '==', uid), orderBy('createdAt', 'desc'));

  return onSnapshot(
    q,
    (snapshot) => {
      callback(
        snapshot.docs.map((docSnap) => {
          const data = docSnap.data() as Partial<Driver>;
          delete data.id;

          return {
            id: docSnap.id,
            ...data,
          } as Driver;
        }),
      );
    },
    (error) => {
      console.error('Driver listener error:', error);
      onError?.(error);
      callback([]);
    },
  );
};

export const setDriverLocation = async (
  id: string,
  location: {
    latitude: number;
    longitude: number;
    accuracy?: number;
    heading?: number;
    speed?: number;
    timestamp?: string | Date;
  },
) => {
  await updateDriver(id, {
    currentLocation: location,
    status: 'ON_DELIVERY',
  });
};

export const updateDriverStatus = async (
  id: string,
  status: DriverStatus,
) => {
  await updateDriver(id, { status });
};