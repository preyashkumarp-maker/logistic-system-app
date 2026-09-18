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
  updateDoc,
  where,
} from 'firebase/firestore';

import { auth, db } from '@/firebase/config';
import { Parcel, ParcelStatus, ParcelTrackingEvent } from '@/types/parcel';
import { generateTrackingNumber } from '@/utils/tracking';

const PARCELS = 'parcels';

const getCurrentUser = () => {
  const user = auth.currentUser;

  if (!user) {
    throw new Error('You must be signed in.');
  }

  return user;
};

export const createParcel = async (data: Partial<Parcel>) => {
  const user = getCurrentUser();

  const parcel: Omit<Parcel, 'id'> & { userId: string } = {
    trackingNumber: data.trackingNumber ?? generateTrackingNumber(),
    senderName: data.senderName ?? '',
    senderPhone: data.senderPhone ?? '',
    receiverName: data.receiverName ?? '',
    receiverPhone: data.receiverPhone ?? '',
    pickupAddress: data.pickupAddress ?? '',
    deliveryAddress: data.deliveryAddress ?? '',
    packageType: data.packageType ?? 'Standard',
    packageWeight: data.packageWeight ?? '0 kg',
    status: data.status ?? 'CREATED',
    driverId: data.driverId,
    currentLocation: data.currentLocation,
    userId: user.uid,
    createdAt: serverTimestamp() as any,
    updatedAt: serverTimestamp() as any,
    estimatedDeliveryDate:
      data.estimatedDeliveryDate ??
      new Date(Date.now() + 1000 * 60 * 60 * 24 * 5).toISOString(),
  };

  const ref = await addDoc(collection(db, PARCELS), parcel);

  await addParcelEvent(ref.id, {
    status: parcel.status,
    latitude: parcel.currentLocation?.latitude,
    longitude: parcel.currentLocation?.longitude,
  });

  return { id: ref.id, ...parcel } as Parcel;
};

export const getParcels = async (): Promise<Parcel[]> => {
  const user = getCurrentUser();

  const q = query(
    collection(db, PARCELS),
    where('userId', '==', user.uid),
    orderBy('createdAt', 'desc'),
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((docSnap) => {
    const data = docSnap.data() as Partial<Parcel>;
    delete data.id;

    return {
      id: docSnap.id,
      ...data,
    } as Parcel;
  });
};

export const getParcelById = async (
  id: string,
): Promise<Parcel | null> => {
  getCurrentUser();

  const ref = doc(db, PARCELS, id);
  const snapshot = await getDoc(ref);

  if (!snapshot.exists()) return null;

  const data = snapshot.data() as Partial<Parcel>;
  delete data.id;

  return {
    id: snapshot.id,
    ...data,
  } as Parcel;
};

export const updateParcel = async (
  id: string,
  data: Partial<Parcel>,
) => {
  getCurrentUser();

  const ref = doc(db, PARCELS, id);

  await updateDoc(ref, {
    ...data,
    updatedAt: serverTimestamp(),
  });

  if (data.status) {
    await addParcelEvent(id, {
      status: data.status,
      latitude: data.currentLocation?.latitude,
      longitude: data.currentLocation?.longitude,
    });
  }
};

export const deleteParcel = async (id: string) => {
  getCurrentUser();

  await deleteDoc(doc(db, PARCELS, id));
};

export const listenToParcels = (
  callback: (items: Parcel[]) => void,
) => {
  const user = auth.currentUser;

  if (!user) {
    callback([]);
    return () => {};
  }

  const q = query(
    collection(db, PARCELS),
    where('userId', '==', user.uid),
    orderBy('createdAt', 'desc'),
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const parcels = snapshot.docs.map((docSnap) => {
        const data = docSnap.data() as Partial<Parcel>;
        delete data.id;

        return {
          id: docSnap.id,
          ...data,
        } as Parcel;
      });

      callback(parcels);
    },
    (error) => {
      console.error('Parcel listener error:', error);
      callback([]);
    },
  );
};

export const listenToParcel = (
  id: string,
  callback: (item: Parcel | null) => void,
) => {
  getCurrentUser();

  return onSnapshot(
    doc(db, PARCELS, id),
    (snapshot) => {
      if (!snapshot.exists()) {
        callback(null);
        return;
      }

      const data = snapshot.data() as Partial<Parcel>;
      delete data.id;

      callback({
        id: snapshot.id,
        ...data,
      } as Parcel);
    },
    (error) => {
      console.error('Parcel listener error:', error);
      callback(null);
    },
  );
};

export const addParcelEvent = async (
  parcelId: string,
  event: ParcelTrackingEvent,
) => {
  const user = getCurrentUser();

  await addDoc(
    collection(db, 'parcelTracking', parcelId, 'events'),
    {
      ...event,
      updatedBy: event.updatedBy ?? user.uid,
      timestamp: serverTimestamp(),
    },
  );
};

export const getParcelEvents = async (
  parcelId: string,
): Promise<ParcelTrackingEvent[]> => {
  getCurrentUser();

  const q = query(
    collection(db, 'parcelTracking', parcelId, 'events'),
    orderBy('timestamp', 'asc'),
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((docSnap) => {
    const data = docSnap.data() as Partial<ParcelTrackingEvent>;

    return {
      id: docSnap.id,
      ...data,
    } as ParcelTrackingEvent;
  });
};

export const listenToParcelEvents = (
  parcelId: string,
  callback: (events: ParcelTrackingEvent[]) => void,
) => {
  getCurrentUser();

  const q = query(
    collection(db, 'parcelTracking', parcelId, 'events'),
    orderBy('timestamp', 'asc'),
  );

  return onSnapshot(
    q,
    (snapshot) => {
      callback(
        snapshot.docs.map((docSnap) => {
          const data =
            docSnap.data() as Partial<ParcelTrackingEvent>;

          return {
            id: docSnap.id,
            ...data,
          } as ParcelTrackingEvent;
        }),
      );
    },
    (error) => {
      console.error('Tracking listener error:', error);
      callback([]);
    },
  );
};

export const searchParcels = async (search: string) => {
  const user = getCurrentUser();

  const searchValue = search.toUpperCase();

  const q = query(
    collection(db, PARCELS),
    where('userId', '==', user.uid),
    where('trackingNumber', '>=', searchValue),
    where(
      'trackingNumber',
      '<=',
      `${searchValue}\uf8ff`,
    ),
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((docSnap) => {
    const data = docSnap.data() as Partial<Parcel>;
    delete data.id;

    return {
      id: docSnap.id,
      ...data,
    } as Parcel;
  });
};

export const updateParcelStatus = async (
  id: string,
  status: ParcelStatus,
  latitude?: number,
  longitude?: number,
  updatedBy?: string,
) => {
  getCurrentUser();

  const ref = doc(db, PARCELS, id);

  await updateDoc(ref, {
    status,
    currentLocation:
      latitude !== undefined && longitude !== undefined
        ? { latitude, longitude }
        : undefined,
    updatedAt: serverTimestamp(),
  });

  if (
    latitude !== undefined &&
    longitude !== undefined
  ) {
    await addParcelEvent(id, {
      status,
      latitude,
      longitude,
      updatedBy,
    });
  }
};