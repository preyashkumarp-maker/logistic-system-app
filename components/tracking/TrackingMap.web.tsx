import { StyleSheet, Text, View } from 'react-native';

import { Parcel } from '@/types/parcel';

interface TrackingMapProps {
  parcel?: Parcel | null;
  driverLocation?: {
    latitude: number;
    longitude: number;
  } | null;
}

export function TrackingMap({ parcel, driverLocation }: TrackingMapProps) {
  const location = driverLocation ?? parcel?.currentLocation;
  const hasLocation = location
    && Number.isFinite(location.latitude)
    && Number.isFinite(location.longitude);

  return (
    <View style={styles.container} accessibilityLabel="Live map preview">
      <Text style={styles.title}>Live map available in the mobile app</Text>
      <Text style={styles.detail}>
        {hasLocation
          ? `${location.latitude.toFixed(5)}, ${location.longitude.toFixed(5)}`
          : 'Live location is not available yet.'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 300,
    borderRadius: 16,
    backgroundColor: '#e2e8f0',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: { color: '#0f172a', fontWeight: '700', textAlign: 'center' },
  detail: { color: '#475569', marginTop: 8, textAlign: 'center' },
});
