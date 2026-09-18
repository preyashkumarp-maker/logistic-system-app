import * as Location from 'expo-location';
import {
  doc,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore';

import { db } from '@/firebase/config';

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
        timeInterval: 5000,
        distanceInterval: 10,
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
  await updateDoc(doc(db, 'parcels', parcelId), {
    currentLocation: location,
    driverId,
    updatedAt: serverTimestamp(),
  });

  // Update driver location
  await updateDoc(doc(db, 'drivers', driverId), {
    currentLocation: location,
    status: 'ON_DELIVERY',
    updatedAt: serverTimestamp(),
  });
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