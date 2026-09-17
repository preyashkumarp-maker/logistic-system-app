import * as Location from 'expo-location';
import { doc, onSnapshot, serverTimestamp, updateDoc } from 'firebase/firestore';

import { APP_CONFIG } from '@/constants/config';
import { db } from '@/firebase/config';
import { setDriverLocation, updateDriverStatus } from '@/services/driverService';
import { addParcelEvent } from '@/services/parcelService';
import { ParcelLocation } from '@/types/parcel';

export const listenToTrackingLocation = (parcelId: string, callback: (location: ParcelLocation | null) => void) =>
  onSnapshot(doc(db, 'parcels', parcelId), (snapshot) => {
    if (!snapshot.exists()) {
      callback(null);
      return;
    }
    const data = snapshot.data() as any;
    callback(data.currentLocation ?? null);
  });

export const updateParcelLocation = async (parcelId: string, location: ParcelLocation) => {
  await updateDoc(doc(db, 'parcels', parcelId), {
    currentLocation: location,
    updatedAt: serverTimestamp(),
  });
};

export const requestLocationPermission = async (): Promise<boolean> => {
  const { status } = await Location.requestForegroundPermissionsAsync();
  return status === 'granted';
};

let activeWatcher: Location.LocationSubscription | null = null;

/**
 * Starts watching the device's GPS position and writes throttled updates to
 * both the parcel and driver documents. Uses a configurable time/distance
 * filter so it does not write on every GPS tick.
 */
export const startLiveTracking = async (
  parcelId: string,
  driverId: string,
  onUpdate?: (location: ParcelLocation) => void,
): Promise<void> => {
  const granted = await requestLocationPermission();
  if (!granted) {
    throw new Error('Location permission was denied. Enable it in device settings to start tracking.');
  }

  stopLiveTracking();

  activeWatcher = await Location.watchPositionAsync(
    {
      accuracy: Location.Accuracy.Balanced,
      timeInterval: APP_CONFIG.trackingUpdateIntervalMs,
      distanceInterval: APP_CONFIG.trackingDistanceFilter,
    },
    async (position) => {
      const location: ParcelLocation = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy ?? undefined,
        heading: position.coords.heading ?? undefined,
        speed: position.coords.speed ?? undefined,
        timestamp: new Date(position.timestamp).toISOString(),
      };

      await updateParcelLocation(parcelId, location);
      await setDriverLocation(driverId, location);
      onUpdate?.(location);
    },
  );
};

export const stopLiveTracking = async (driverId?: string): Promise<void> => {
  activeWatcher?.remove();
  activeWatcher = null;
  if (driverId) {
    await updateDriverStatus(driverId, 'AVAILABLE');
  }
};

export { addParcelEvent };

