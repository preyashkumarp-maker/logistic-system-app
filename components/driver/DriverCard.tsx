import { Ionicons } from '@expo/vector-icons';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { COLORS } from '@/constants/colors';
import { DRIVER_STATUS_COLORS } from '@/constants/status';
import { Driver } from '@/types/driver';

export function DriverCard({ driver, onPress }: { driver: Driver; onPress?: () => void }) {
  const statusColor = DRIVER_STATUS_COLORS[driver.status];
  const initials = driver.name
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <Pressable style={({ pressed }) => [styles.card, pressed && styles.cardPressed]} onPress={onPress}>
      <View style={styles.row}>
        <View style={styles.avatarRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <View>
            <Text style={styles.name}>{driver.name}</Text>
            <Text style={styles.meta}>{driver.phone}</Text>
          </View>
        </View>
        <View style={[styles.badge, { backgroundColor: `${statusColor}1a`, borderColor: `${statusColor}55` }]}>
          <View style={[styles.dot, { backgroundColor: statusColor }]} />
          <Text style={[styles.badgeText, { color: statusColor }]}>{driver.status.replace(/_/g, ' ')}</Text>
        </View>
      </View>
      <View style={styles.divider} />
      <View style={styles.footerRow}>
        <View style={styles.metaItem}>
          <Ionicons name="car-outline" size={14} color={COLORS.textSubtle} />
          <Text style={styles.footerMeta}>{driver.vehicleNumber} · {driver.vehicleType}</Text>
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
      ios: { shadowColor: COLORS.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 1, shadowRadius: 8 },
      android: { elevation: 2 },
    }),
  },
  cardPressed: { opacity: 0.9, transform: [{ scale: 0.995 }] },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  avatarRow: { flexDirection: 'row', alignItems: 'center', gap: 12, flexShrink: 1 },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: COLORS.primary, fontWeight: '800', fontSize: 14 },
  name: { fontSize: 15.5, fontWeight: '700', color: COLORS.text },
  meta: { color: COLORS.textMuted, marginTop: 3, fontSize: 12.5 },
  divider: { height: 1, backgroundColor: COLORS.border, marginTop: 14, marginBottom: 10 },
  footerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  footerMeta: { color: COLORS.textSubtle, fontSize: 12.5 },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 9, paddingVertical: 6, borderRadius: 999, borderWidth: 1 },
  dot: { width: 6, height: 6, borderRadius: 3 },
  badgeText: { fontWeight: '700', fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.3 },
});

