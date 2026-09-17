import { StyleSheet, Text, View } from 'react-native';

import { PARCEL_STATUS_COLORS } from '@/constants/status';
import { ParcelStatus } from '@/types/parcel';

export function ParcelStatusBadge({ status }: { status: ParcelStatus }) {
  const badgeColor = PARCEL_STATUS_COLORS[status] ?? '#64748b';

  return (
    <View style={[styles.badge, { backgroundColor: `${badgeColor}22`, borderColor: badgeColor }]}>
      <Text style={[styles.text, { color: badgeColor }]}>{status}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
  },
  text: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
});
