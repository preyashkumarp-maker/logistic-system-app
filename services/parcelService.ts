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
    where
} from 'firebase/firestore';

import { db } from '@/firebase/config';
import { Parcel, ParcelStatus, ParcelTrackingEvent } from '@/types/parcel';
import { generateTrackingNumber } from '@/utils/tracking';

const PARCELS = 'parcels';

export const createParcel = async (data: Partial<Parcel>) => {
  const parcel: Omit<Parcel, 'id'> = {
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
    createdAt: serverTimestamp() as any,
    updatedAt: serverTimestamp() as any,
    estimatedDeliveryDate: data.estimatedDeliveryDate ?? new Date(Date.now() + 1000 * 60 * 60 * 24 * 5).toISOString(),
  };

  const ref = await addDoc(collection(db, PARCELS), parcel as any);
  return { id: ref.id, ...parcel } as Parcel;
};

export const getParcels = async (): Promise<Parcel[]> => {
  const q = query(collection(db, PARCELS), orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((docSnap) => {
    const data = docSnap.data() as Partial<Parcel>;
    delete data.id;
    return { id: docSnap.id, ...data } as Parcel;
  });
};

export const getParcelById = async (id: string): Promise<Parcel | null> => {
  const ref = doc(db, PARCELS, id);
  const snapshot = await getDoc(ref);
  if (!snapshot.exists()) return null;
  const data = snapshot.data() as Partial<Parcel>;
  delete data.id;
  return { id: snapshot.id, ...data } as Parcel;
};

export const updateParcel = async (id: string, data: Partial<Parcel>) => {
  const ref = doc(db, PARCELS, id);
  await updateDoc(ref, {
    ...data,
    updatedAt: serverTimestamp(),
  });
};

export const deleteParcel = async (id: string) => {
  await deleteDoc(doc(db, PARCELS, id));
};

export const listenToParcels = (callback: (items: Parcel[]) => void) =>
  onSnapshot(query(collection(db, PARCELS), orderBy('createdAt', 'desc')), (snapshot) => {
    callback(
      snapshot.docs.map((docSnap) => {
        const data = docSnap.data() as Partial<Parcel>;
        delete data.id;
        return { id: docSnap.id, ...data } as Parcel;
      }),
    );
  });

export const listenToParcel = (id: string, callback: (item: Parcel | null) => void) =>
  onSnapshot(doc(db, PARCELS, id), (snapshot) => {
    if (!snapshot.exists()) {
      callback(null);
      return;
    }
    const data = snapshot.data() as Partial<Parcel>;
    delete data.id;
    callback({ id: snapshot.id, ...data } as Parcel);
  });

export const addParcelEvent = async (parcelId: string, event: ParcelTrackingEvent) => {
  await addDoc(collection(db, 'parcelTracking', parcelId, 'events'), {
    ...event,
    timestamp: serverTimestamp(),
  });
};

export const getParcelEvents = async (parcelId: string): Promise<ParcelTrackingEvent[]> => {
  const q = query(collection(db, 'parcelTracking', parcelId, 'events'), orderBy('timestamp', 'asc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((docSnap) => {
    const data = docSnap.data() as Partial<ParcelTrackingEvent>;
    delete data.id;
    return { id: docSnap.id, ...data } as ParcelTrackingEvent;
  });
};

export const listenToParcelEvents = (parcelId: string, callback: (events: ParcelTrackingEvent[]) => void) =>
  onSnapshot(query(collection(db, 'parcelTracking', parcelId, 'events'), orderBy('timestamp', 'asc')), (snapshot) => {
    callback(
      snapshot.docs.map((docSnap) => {
        const data = docSnap.data() as Partial<ParcelTrackingEvent>;
        delete data.id;
        return { id: docSnap.id, ...data } as ParcelTrackingEvent;
      }),
    );
  });

export const searchParcels = async (search: string) => {
  const q = query(collection(db, PARCELS), where('trackingNumber', '>=', search.toUpperCase()), where('trackingNumber', '<=', `${search.toUpperCase()}\uf8ff`));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((docSnap) => {
    const data = docSnap.data() as Partial<Parcel>;
    delete data.id;
    return { id: docSnap.id, ...data } as Parcel;
  });
};

export const updateParcelStatus = async (id: string, status: ParcelStatus, latitude?: number, longitude?: number, updatedBy?: string) => {
  const ref = doc(db, PARCELS, id);
  await updateDoc(ref, {
    status,
    currentLocation: latitude !== undefined && longitude !== undefined ? { latitude, longitude } : undefined,
    updatedAt: serverTimestamp(),
  });

  if (latitude !== undefined && longitude !== undefined) {
    await addParcelEvent(id, { status, latitude, longitude, updatedBy });
  }
};
