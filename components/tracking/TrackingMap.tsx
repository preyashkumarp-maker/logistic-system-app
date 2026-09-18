import { doc, onSnapshot } from 'firebase/firestore';
import { useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import MapView, { Marker, Region } from 'react-native-maps';

import { db } from '@/firebase/config';
import { Parcel } from '@/types/parcel';

interface TrackingMapProps {
  parcel?: Parcel | null;
  driverLocation?: {
    latitude: number;
    longitude: number;
  } | null;
  initialRegion?: Region;
}

export function TrackingMap({
  parcel,
  driverLocation: initialDriverLocation,
  initialRegion,
}: TrackingMapProps) {
  const mapRef = useRef<MapView>(null);

  const [driverLocation, setDriverLocation] = useState(
    initialDriverLocation ?? null,
  );

  /*
   * Listen to live driver location from Firestore.
   *
   * Expected structure:
   *
   * parcels/{parcelId}
   *   currentLocation: {
   *     latitude: number,
   *     longitude: number
   *   }
   */
  useEffect(() => {
    if (!parcel?.id) return;

    const parcelRef = doc(db, 'parcels', parcel.id);

    const unsubscribe = onSnapshot(
      parcelRef,
      (snapshot) => {
        const data = snapshot.data();

        if (!data?.currentLocation) {
          return;
        }

        const location = {
          latitude: Number(data.currentLocation.latitude),
          longitude: Number(data.currentLocation.longitude),
        };

        if (
          Number.isFinite(location.latitude) &&
          Number.isFinite(location.longitude)
        ) {
          setDriverLocation(location);

          // Automatically move the map to the driver's new location
          mapRef.current?.animateToRegion(
            {
              latitude: location.latitude,
              longitude: location.longitude,
              latitudeDelta: 0.02,
              longitudeDelta: 0.02,
            },
            500,
          );
        }
      },
      (error) => {
        console.error('Live tracking error:', error);
      },
    );

    return unsubscribe;
  }, [parcel?.id]);

  // If parent sends a new driver location, update it too
  useEffect(() => {
    if (initialDriverLocation) {
      setDriverLocation(initialDriverLocation);
    }
  }, [initialDriverLocation]);

  const centre =
    driverLocation ??
    parcel?.currentLocation ?? {
      latitude: 19.076,
      longitude: 72.8777,
    };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={
          initialRegion ?? {
            latitude: centre.latitude,
            longitude: centre.longitude,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          }
        }
        showsUserLocation
        showsMyLocationButton
        zoomEnabled
        scrollEnabled
      >
        {/* LIVE DRIVER LOCATION */}
        {driverLocation ? (
          <Marker
            coordinate={driverLocation}
            title="Driver"
            description="Live driver location"
            pinColor="#2563eb"
          />
        ) : null}

        {/* PARCEL LOCATION */}
        {parcel?.currentLocation ? (
          <Marker
            coordinate={parcel.currentLocation}
            title="Parcel"
            description="Parcel location"
            pinColor="#22c55e"
          />
        ) : null}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 300,
    borderRadius: 16,
    overflow: 'hidden',
  },

  map: {
    width: '100%',
    height: '100%',
  },
});