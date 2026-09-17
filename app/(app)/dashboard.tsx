import { Ionicons } from '@expo/vector-icons';
import { Link, router } from 'expo-router';
import { useMemo } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EmptyState } from '@/components/common/EmptyState';
import { Loading } from '@/components/common/Loading';
import { ParcelCard } from '@/components/parcel/ParcelCard';
import { COLORS } from '@/constants/colors';
import { useAuth } from '@/hooks/useAuth';
import { useDrivers } from '@/hooks/useDrivers';
import { useParcels } from '@/hooks/useParcels';
import { Parcel } from '@/types/parcel';

const STAT_CARDS: { key: keyof ReturnType<typeof buildStats>; label: string; icon: keyof typeof Ionicons.glyphMap; color: string }[] = [
  { key: 'total', label: 'Total Parcels', icon: 'cube', color: COLORS.primary },
  { key: 'pending', label: 'Pending', icon: 'time-outline', color: COLORS.warning },
  { key: 'inTransit', label: 'In Transit', icon: 'car-outline', color: COLORS.info },
  { key: 'outForDelivery', label: 'Out for Delivery', icon: 'navigate-outline', color: '#8b5cf6' },
  { key: 'delivered', label: 'Delivered', icon: 'checkmark-circle-outline', color: COLORS.success },
  { key: 'drivers', label: 'Total Drivers', icon: 'people-outline', color: COLORS.secondary },
];

function buildStats(parcels: Parcel[], driverCount: number) {
  return {
    total: parcels.length,
    pending: parcels.filter((parcel) => ['CREATED', 'PICKED_UP'].includes(parcel.status)).length,
    inTransit: parcels.filter((parcel) => parcel.status === 'IN_TRANSIT').length,
    outForDelivery: parcels.filter((parcel) => parcel.status === 'OUT_FOR_DELIVERY').length,
    delivered: parcels.filter((parcel) => parcel.status === 'DELIVERED').length,
    drivers: driverCount,
  };
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

export default function DashboardScreen() {
  const { profile } = useAuth();
  const { parcels, loading } = useParcels();
  const { drivers } = useDrivers();

  const recentParcels = useMemo(() => parcels.slice(0, 4), [parcels]);

  const stats = useMemo(() => buildStats(parcels, drivers.length), [parcels, drivers]);

  if (loading) return <Loading label="Loading dashboard" />;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.eyebrow}>{getGreeting()}</Text>
            <Text style={styles.title}>{profile?.name ?? 'Operator'}</Text>
          </View>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarInitial}>{(profile?.name ?? 'O').charAt(0).toUpperCase()}</Text>
          </View>
        </View>

        <View style={styles.grid}>
          {STAT_CARDS.map((stat) => (
            <View key={stat.key} style={styles.card}>
              <View style={[styles.cardIconWrap, { backgroundColor: `${stat.color}1a` }]}>
                <Ionicons name={stat.icon} size={18} color={stat.color} />
              </View>
              <Text style={styles.cardValue}>{stats[stat.key]}</Text>
              <Text style={styles.cardLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        <View style={styles.actionsRow}>
          <Link href="/parcels/create" asChild>
            <Pressable style={styles.quickAction}>
              <View style={[styles.quickIconWrap, { backgroundColor: COLORS.primaryLight }]}>
                <Ionicons name="add-circle-outline" size={20} color={COLORS.primary} />
              </View>
              <Text style={styles.quickActionText}>Create Parcel</Text>
            </Pressable>
          </Link>
          <Link href="/drivers/create" asChild>
            <Pressable style={styles.quickAction}>
              <View style={[styles.quickIconWrap, { backgroundColor: COLORS.successLight }]}>
                <Ionicons name="person-add-outline" size={20} color={COLORS.success} />
              </View>
              <Text style={styles.quickActionText}>Add Driver</Text>
            </Pressable>
          </Link>
          <Link href="/parcels" asChild>
            <Pressable style={styles.quickAction}>
              <View style={[styles.quickIconWrap, { backgroundColor: COLORS.infoLight }]}>
                <Ionicons name="search-outline" size={20} color={COLORS.info} />
              </View>
              <Text style={styles.quickActionText}>Track Parcel</Text>
            </Pressable>
          </Link>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Parcels</Text>
          <Link href="/parcels" style={styles.viewAll}>View all</Link>
        </View>

        {recentParcels.length === 0 ? (
          <EmptyState title="No parcels yet" message="Add a parcel to start tracking operations." icon="cube-outline" />
        ) : (
          recentParcels.map((parcel) => (
            <ParcelCard
              key={parcel.id}
              parcel={parcel}
              onPress={() => router.push({ pathname: '/parcels/[id]', params: { id: parcel.id } })}
            />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 20, paddingBottom: 120 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  eyebrow: { fontSize: 13, color: COLORS.textMuted, fontWeight: '600' },
  title: { fontSize: 24, fontWeight: '800', color: COLORS.text, marginTop: 2 },
  avatarCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: { color: '#fff', fontWeight: '800', fontSize: 17 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 20 },
  card: {
    width: '31.5%',
    marginBottom: 12,
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...Platform.select({
      ios: { shadowColor: COLORS.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 1, shadowRadius: 6 },
      android: { elevation: 1 },
    }),
  },
  cardIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  cardLabel: { color: COLORS.textMuted, fontSize: 11, marginTop: 3 },
  cardValue: { fontSize: 22, fontWeight: '800', color: COLORS.text },
  actionsRow: { flexDirection: 'row', gap: 10, marginBottom: 24 },
  quickAction: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
    alignItems: 'center',
  },
  quickIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  quickActionText: { fontSize: 11.5, fontWeight: '700', color: COLORS.text, textAlign: 'center' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: COLORS.text },
  viewAll: { fontSize: 13, fontWeight: '700', color: COLORS.primary },
});

