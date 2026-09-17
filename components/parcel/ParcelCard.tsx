import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ParcelStatusBadge } from '@/components/parcel/ParcelStatusBadge';
import { COLORS } from '@/constants/colors';
import { Parcel } from '@/types/parcel';
import { formatDate } from '@/utils/date';

export function ParcelCard({ parcel, onPress }: { parcel: Parcel; onPress?: () => void }) {
  return (
    <Pressable onPress={onPress} style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.tracking}>{parcel.trackingNumber}</Text>
        <ParcelStatusBadge status={parcel.status} />
      </View>
      <Text style={styles.route}>{parcel.receiverName}</Text>
      <Text style={styles.destination}>{parcel.deliveryAddress}</Text>
      <View style={styles.metaRow}>
        <Text style={styles.meta}>Driver: {parcel.driverId ?? 'Unassigned'}</Text>
        <Text style={styles.meta}>{formatDate(parcel.createdAt)}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  tracking: { fontWeight: '700', color: COLORS.text, fontSize: 15 },
  route: { marginTop: 12, fontSize: 16, fontWeight: '600', color: COLORS.text },
  destination: { marginTop: 6, color: COLORS.textMuted },
  metaRow: { marginTop: 12, flexDirection: 'row', justifyContent: 'space-between' },
  meta: { color: COLORS.textMuted, fontSize: 12 },
});
