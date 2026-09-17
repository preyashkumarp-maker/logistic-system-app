import { Link, router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/common/Button';
import { EmptyState } from '@/components/common/EmptyState';
import { Loading } from '@/components/common/Loading';
import { TrackingMap } from '@/components/tracking/TrackingMap';
import { COLORS } from '@/constants/colors';
import { DRIVER_STATUS_COLORS } from '@/constants/status';
import { deleteDriver, listenToDrivers } from '@/services/driverService';
import { Driver } from '@/types/driver';
import { formatDateTime } from '@/utils/date';
import { formatLocation } from '@/utils/tracking';

export default function DriverDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [driver, setDriver] = useState<Driver | null | undefined>(undefined);

  useEffect(() => {
    if (!id) return;
    const unsubscribe = listenToDrivers((items) => {
      setDriver(items.find((item) => item.id === id) ?? null);
    });
    return () => unsubscribe();
  }, [id]);

  if (driver === undefined) return <Loading label="Loading driver" />;
  if (driver === null) return <EmptyState title="Driver not found" message="This driver may have been removed." />;

  const handleDelete = () => {
    Alert.alert('Delete Driver', `Are you sure you want to remove ${driver.name}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteDriver(driver.id);
            router.back();
          } catch (deleteError: any) {
            Alert.alert('Unable to delete driver', deleteError?.message ?? 'Please try again.');
          }
        },
      },
    ]);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.headerRow}>
        <Text style={styles.name}>{driver.name}</Text>
        <View style={[styles.badge, { backgroundColor: `${DRIVER_STATUS_COLORS[driver.status]}22` }]}>
          <Text style={[styles.badgeText, { color: DRIVER_STATUS_COLORS[driver.status] }]}>{driver.status}</Text>
        </View>
      </View>

      {driver.currentLocation ? (
        <TrackingMap driverLocation={driver.currentLocation} />
      ) : (
        <View style={styles.noLocation}>
          <Text style={styles.noLocationText}>No live location available yet.</Text>
        </View>
      )}

      <View style={styles.card}>
        <Row label="Phone" value={driver.phone} />
        <Row label="Email" value={driver.email} />
        <Row label="Vehicle Number" value={driver.vehicleNumber} />
        <Row label="Vehicle Type" value={driver.vehicleType} />
        <Row label="Current Location" value={formatLocation(driver.currentLocation)} />
        <Row label="Last Updated" value={formatDateTime(driver.updatedAt)} last />
      </View>

      <View style={styles.actions}>
        <Link href={{ pathname: '/drivers/edit', params: { id: driver.id } }} asChild>
          <Button title="Edit Driver" onPress={() => undefined} variant="secondary" />
        </Link>
        <Button title="Delete Driver" onPress={handleDelete} variant="danger" style={styles.spacedButton} />
      </View>
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
  content: { padding: 20 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  name: { fontSize: 24, fontWeight: '800', color: COLORS.text },
  badge: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999 },
  badgeText: { fontWeight: '700', fontSize: 11, textTransform: 'uppercase' },
  noLocation: { height: 140, borderRadius: 16, backgroundColor: '#fff', borderWidth: 1, borderColor: COLORS.border, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  noLocationText: { color: COLORS.textMuted },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: COLORS.border, marginTop: 20, marginBottom: 20 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  rowLast: { borderBottomWidth: 0 },
  rowLabel: { color: COLORS.textMuted, fontSize: 13 },
  rowValue: { color: COLORS.text, fontWeight: '600', fontSize: 13, maxWidth: '60%', textAlign: 'right' },
  actions: { marginBottom: 20 },
  spacedButton: { marginTop: 10 },
});
