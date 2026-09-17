import { StyleSheet, View } from 'react-native';
import MapView, { Marker, Region } from 'react-native-maps';

import { Parcel } from '@/types/parcel';

interface TrackingMapProps {
  parcel?: Parcel | null;
  driverLocation?: { latitude: number; longitude: number } | null;
  initialRegion?: Region;
}

export function TrackingMap({ parcel, driverLocation, initialRegion }: TrackingMapProps) {
  const centre = driverLocation ?? parcel?.currentLocation ?? { latitude: 19.076, longitude: 72.8777 };

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={
          initialRegion ?? {
            latitude: centre.latitude,
            longitude: centre.longitude,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          }
        }
      >
        {driverLocation ? (
          <Marker coordinate={driverLocation} title="Driver" pinColor="#2563eb" />
        ) : null}
        {parcel?.currentLocation ? (
          <Marker coordinate={parcel.currentLocation} title="Parcel" pinColor="#22c55e" />
        ) : null}
        {parcel?.pickupAddress ? null : null}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { height: 260, borderRadius: 16, overflow: 'hidden' },
  map: { width: '100%', height: '100%' },
});
