import { StyleSheet, Text, View } from 'react-native';

import { PARCEL_STATUS_COLORS } from '@/constants/status';
import { ParcelStatus } from '@/types/parcel';

export function ParcelStatusBadge({ status }: { status: ParcelStatus }) {
  const badgeColor = PARCEL_STATUS_COLORS[status] ?? '#64748b';

  return (
    <View style={[styles.badge, { backgroundColor: `${badgeColor}1a`, borderColor: `${badgeColor}55` }]}>
      <View style={[styles.dot, { backgroundColor: badgeColor }]} />
      <Text style={[styles.text, { color: badgeColor }]}>{status.replace(/_/g, ' ')}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  text: {
    fontSize: 10.5,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
});

