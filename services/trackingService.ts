import * as Location from 'expo-location';
import {
    doc,
    onSnapshot,
    serverTimestamp,
    updateDoc,
    writeBatch,
} from 'firebase/firestore';

import { APP_CONFIG } from '@/constants/config';
import { db } from '@/firebase/config';
import { ParcelLocation } from '@/types/parcel';

let locationSubscription: Location.LocationSubscription | null = null;

export const startLiveTracking = async (
  parcelId: string,
  driverId: string,
) => {
  // Request location permission
  const { status } =
    await Location.requestForegroundPermissionsAsync();

  if (status !== 'granted') {
    throw new Error(
      'Location permission is required to start live tracking.',
    );
  }

  // Stop previous tracking if running
  if (locationSubscription) {
    locationSubscription.remove();
    locationSubscription = null;
  }

  // Get current location immediately
  const currentLocation =
    await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    });

  await updateLocation(
    parcelId,
    driverId,
    currentLocation.coords,
  );

  // Continue watching location
  locationSubscription =
    await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,
        timeInterval: APP_CONFIG.trackingUpdateIntervalMs,
        distanceInterval: APP_CONFIG.trackingDistanceFilter,
      },
      async (location) => {
        try {
          await updateLocation(
            parcelId,
            driverId,
            location.coords,
          );
        } catch (error) {
          console.error(
            'Location update failed:',
            error,
          );
        }
      },
    );
};

const updateLocation = async (
  parcelId: string,
  driverId: string,
  coords: Location.LocationObjectCoords,
) => {
  const location = {
    latitude: coords.latitude,
    longitude: coords.longitude,
    accuracy: coords.accuracy ?? undefined,
    heading: coords.heading ?? undefined,
    speed: coords.speed ?? undefined,
  };

  // Update parcel location
  const batch = writeBatch(db);
  batch.update(doc(db, 'parcels', parcelId), {
    currentLocation: location,
    driverId,
    updatedAt: serverTimestamp(),
  });

  // Update driver location
  batch.update(doc(db, 'drivers', driverId), {
    currentLocation: location,
    status: 'ON_DELIVERY',
    updatedAt: serverTimestamp(),
  });
  await batch.commit();
};

export const stopLiveTracking = async (
  driverId?: string,
) => {
  if (locationSubscription) {
    locationSubscription.remove();
    locationSubscription = null;
  }

  if (driverId) {
    try {
      await updateDoc(doc(db, 'drivers', driverId), {
        status: 'AVAILABLE',
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error(
        'Unable to update driver status:',
        error,
      );
    }
  }
};

export const listenToTrackingLocation = (
  parcelId: string,
  callback: (location: ParcelLocation | null) => void,
) => {
  return onSnapshot(
    doc(db, 'parcels', parcelId),
    (snapshot) => {
      const location = snapshot.data()?.currentLocation as ParcelLocation | undefined;
      callback(location ?? null);
    },
    () => callback(null),
  );
};