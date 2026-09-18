import { useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/common/Button';
import { EmptyState } from '@/components/common/EmptyState';
import { Loading } from '@/components/common/Loading';
import { ParcelStatusBadge } from '@/components/parcel/ParcelStatusBadge';
import { TrackingMap } from '@/components/tracking/TrackingMap';
import { TrackingTimeline } from '@/components/tracking/TrackingTimeline';
import { COLORS } from '@/constants/colors';
import { useDrivers } from '@/hooks/useDrivers';
import { getParcelEvents, listenToParcel, listenToParcelEvents } from '@/services/parcelService';
import { startLiveTracking, stopLiveTracking } from '@/services/trackingService';
import { Parcel, ParcelTrackingEvent } from '@/types/parcel';
import { formatDateTime } from '@/utils/date';
import { formatLocation } from '@/utils/tracking';

export default function TrackingScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { drivers } = useDrivers();
  const [parcel, setParcel] = useState<Parcel | null | undefined>(undefined);
  const [events, setEvents] = useState<ParcelTrackingEvent[]>([]);
  const [isTracking, setIsTracking] = useState(false);
  const trackingDriverId = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (!id) return undefined;
    const unsubscribeParcel = listenToParcel(id, setParcel);
    const unsubscribeEvents = listenToParcelEvents(id, setEvents);
    getParcelEvents(id).then(setEvents);

    return () => {
      unsubscribeParcel();
      unsubscribeEvents();
    };
  }, [id]);

  useEffect(() => {
    return () => {
      if (isTracking) {
        stopLiveTracking(trackingDriverId.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (parcel === undefined) return <Loading label="Loading tracking data" />;
  if (parcel === null) return <EmptyState title="Parcel not found" message="This parcel may have been deleted." />;

  const driver = drivers.find((item) => item.id === parcel.driverId);

  const handleStartTracking = async () => {
    if (!parcel.driverId) {
      Alert.alert('No driver assigned', 'Assign a driver to this parcel before starting live tracking.');
      return;
    }

    try {
      trackingDriverId.current = parcel.driverId;
      await startLiveTracking(parcel.id, parcel.driverId);
      setIsTracking(true);
    } catch (trackingError: any) {
      Alert.alert('Unable to start tracking', trackingError?.message ?? 'Please try again.');
    }
  };

  const handleStopTracking = async () => {
    await stopLiveTracking(trackingDriverId.current);
    setIsTracking(false);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Track {parcel.trackingNumber}</Text>

      <TrackingMap parcel={parcel} driverLocation={driver?.currentLocation ?? parcel.currentLocation ?? null} />

      <View style={styles.card}>
        <Row label="Tracking Number" value={parcel.trackingNumber} />
        <Row label="Driver" value={driver?.name ?? 'Unassigned'} />
        <Row label="Vehicle Number" value={driver?.vehicleNumber ?? 'N/A'} />
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Current Status</Text>
          <ParcelStatusBadge status={parcel.status} />
        </View>
        <Row label="Current Location" value={formatLocation(driver?.currentLocation ?? parcel.currentLocation)} />
        <Row label="Last Updated" value={formatDateTime(parcel.updatedAt)} last />
      </View>

      <View style={styles.actions}>
        {isTracking ? (
          <Button title="Stop Live Tracking" onPress={handleStopTracking} variant="danger" />
        ) : (
          <Button title="Start Live Tracking" onPress={handleStartTracking} />
        )}
        <Text style={styles.hint}>
          Live tracking uses this device&apos;s GPS to simulate the assigned driver&apos;s location updates.
        </Text>
      </View>

      <Text style={styles.sectionTitle}>Tracking Timeline</Text>
      <TrackingTimeline events={events} />
    </ScrollView>
  );
}

function Row({ label, value, last }: { label: string; value: string; last?: boolean }) {
  return (
    <View style={[styles.row, last && styles.rowLast]}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 20, paddingBottom: 100, },
  title: { fontSize: 22, fontWeight: '800', color: COLORS.text, marginBottom: 16 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: COLORS.border, marginTop: 20 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  rowLast: { borderBottomWidth: 0 },
  rowLabel: { color: COLORS.textMuted, fontSize: 13 },
  rowValue: { color: COLORS.text, fontWeight: '600', fontSize: 13, maxWidth: '60%', textAlign: 'right' },
  actions: { marginTop: 20, marginBottom: 20 },
  hint: { marginTop: 10, color: COLORS.textMuted, fontSize: 12, textAlign: 'center' },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: COLORS.text, marginBottom: 8 },
});
