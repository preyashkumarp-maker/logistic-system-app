import { Link, router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/common/Button';
import { EmptyState } from '@/components/common/EmptyState';
import { Loading } from '@/components/common/Loading';
import { ParcelStatusBadge } from '@/components/parcel/ParcelStatusBadge';
import { COLORS } from '@/constants/colors';
import { useDrivers } from '@/hooks/useDrivers';
import { deleteParcel, listenToParcel } from '@/services/parcelService';
import { Parcel } from '@/types/parcel';
import { formatDate, formatDateTime } from '@/utils/date';
import { formatLocation } from '@/utils/tracking';

export default function ParcelDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { drivers } = useDrivers();
  const [parcel, setParcel] = useState<Parcel | null | undefined>(undefined);

  useEffect(() => {
    if (!id) return;
    const unsubscribe = listenToParcel(id, setParcel);
    return () => unsubscribe();
  }, [id]);

  if (parcel === undefined) return <Loading label="Loading parcel" />;
  if (parcel === null) return <EmptyState title="Parcel not found" message="This parcel may have been deleted." />;

  const driver = drivers.find((item) => item.id === parcel.driverId);

  const handleDelete = () => {
    Alert.alert('Delete Parcel', `Are you sure you want to delete ${parcel.trackingNumber}? This cannot be undone.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteParcel(parcel.id);
            router.back();
          } catch (deleteError: any) {
            Alert.alert('Unable to delete parcel', deleteError?.message ?? 'Please try again.');
          }
        },
      },
    ]);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.headerRow}>
        <Text style={styles.tracking}>{parcel.trackingNumber}</Text>
        <ParcelStatusBadge status={parcel.status} />
      </View>

      <View style={styles.card}>
        <Row label="Sender" value={parcel.senderName} />
        <Row label="Sender Phone" value={parcel.senderPhone} />
        <Row label="Receiver" value={parcel.receiverName} />
        <Row label="Receiver Phone" value={parcel.receiverPhone} />
        <Row label="Pickup Address" value={parcel.pickupAddress} />
        <Row label="Delivery Address" value={parcel.deliveryAddress} />
        <Row label="Package Type" value={parcel.packageType} />
        <Row label="Weight" value={parcel.packageWeight} />
        <Row label="Driver" value={driver?.name ?? 'Unassigned'} />
        <Row label="Current Location" value={formatLocation(parcel.currentLocation)} />
        <Row label="Created" value={formatDate(parcel.createdAt)} />
        <Row label="Estimated Delivery" value={formatDate(parcel.estimatedDeliveryDate)} />
        <Row label="Last Updated" value={formatDateTime(parcel.updatedAt)} last />
      </View>

      <View style={styles.actions}>
        <Link href={{ pathname: '/tracking/[id]', params: { id: parcel.id } }} asChild>
          <Button title="Track Parcel" onPress={() => undefined} />
        </Link>
        <Link href={{ pathname: '/parcels/edit', params: { id: parcel.id } }} asChild>
          <Button title="Edit Parcel" onPress={() => undefined} variant="secondary" style={styles.spacedButton} />
        </Link>
        <Button title="Delete Parcel" onPress={handleDelete} variant="danger" style={styles.spacedButton} />
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
  tracking: { fontSize: 24, fontWeight: '800', color: COLORS.text },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: COLORS.border, marginBottom: 20 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  rowLast: { borderBottomWidth: 0 },
  rowLabel: { color: COLORS.textMuted, fontSize: 13 },
  rowValue: { color: COLORS.text, fontWeight: '600', fontSize: 13, maxWidth: '60%', textAlign: 'right' },
  actions: { marginBottom: 20 },
  spacedButton: { marginTop: 10 },
});
