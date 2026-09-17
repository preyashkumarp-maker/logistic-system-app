import { Ionicons } from '@expo/vector-icons';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { ParcelStatusBadge } from '@/components/parcel/ParcelStatusBadge';
import { COLORS } from '@/constants/colors';
import { Parcel } from '@/types/parcel';
import { formatDate } from '@/utils/date';

export function ParcelCard({ parcel, onPress }: { parcel: Parcel; onPress?: () => void }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}>
      <View style={styles.headerRow}>
        <View style={styles.trackingRow}>
          <Ionicons name="cube" size={15} color={COLORS.primary} />
          <Text style={styles.tracking}>{parcel.trackingNumber}</Text>
        </View>
        <ParcelStatusBadge status={parcel.status} />
      </View>
      <Text style={styles.route}>{parcel.receiverName}</Text>
      <View style={styles.destinationRow}>
        <Ionicons name="location-outline" size={14} color={COLORS.textMuted} />
        <Text style={styles.destination} numberOfLines={1}>{parcel.deliveryAddress}</Text>
      </View>
      <View style={styles.divider} />
      <View style={styles.metaRow}>
        <View style={styles.metaItem}>
          <Ionicons name="person-outline" size={13} color={COLORS.textSubtle} />
          <Text style={styles.meta}>{parcel.driverId ? 'Assigned' : 'Unassigned'}</Text>
        </View>
        <View style={styles.metaItem}>
          <Ionicons name="time-outline" size={13} color={COLORS.textSubtle} />
          <Text style={styles.meta}>{formatDate(parcel.createdAt)}</Text>
        </View>
        <Ionicons name="chevron-forward" size={16} color={COLORS.textSubtle} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...Platform.select({
      ios: {
        shadowColor: COLORS.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 1,
        shadowRadius: 8,
      },
      android: { elevation: 2 },
    }),
  },
  cardPressed: { opacity: 0.9, transform: [{ scale: 0.995 }] },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  trackingRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  tracking: { fontWeight: '700', color: COLORS.text, fontSize: 14.5 },
  route: { marginTop: 12, fontSize: 16, fontWeight: '700', color: COLORS.text },
  destinationRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 5 },
  destination: { color: COLORS.textMuted, fontSize: 13, flexShrink: 1 },
  divider: { height: 1, backgroundColor: COLORS.border, marginTop: 12, marginBottom: 10 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4, flex: 1 },
  meta: { color: COLORS.textSubtle, fontSize: 12 },
});

