import { Pressable, StyleSheet, Text, View } from 'react-native';

import { DRIVER_STATUS_COLORS } from '@/constants/status';
import { Driver } from '@/types/driver';

export function DriverCard({ driver, onPress }: { driver: Driver; onPress?: () => void }) {
  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View style={styles.row}>
        <Text style={styles.name}>{driver.name}</Text>
        <View style={[styles.badge, { backgroundColor: `${DRIVER_STATUS_COLORS[driver.status]}22` }]}>
          <Text style={[styles.badgeText, { color: DRIVER_STATUS_COLORS[driver.status] }]}>{driver.status}</Text>
        </View>
      </View>
      <Text style={styles.meta}>{driver.phone}</Text>
      <Text style={styles.meta}>{driver.vehicleNumber} • {driver.vehicleType}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#e2e8f0' },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  name: { fontSize: 16, fontWeight: '700', color: '#0f172a' },
  meta: { color: '#475569', marginTop: 6 },
  badge: { paddingHorizontal: 8, paddingVertical: 5, borderRadius: 999 },
  badgeText: { fontWeight: '700', fontSize: 11, textTransform: 'uppercase' },
});
