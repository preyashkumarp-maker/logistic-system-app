import { Link, router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/common/Button';
import { EmptyState } from '@/components/common/EmptyState';
import { Loading } from '@/components/common/Loading';
import { ParcelCard } from '@/components/parcel/ParcelCard';
import { useAuth } from '@/hooks/useAuth';
import { useParcels } from '@/hooks/useParcels';
import { Parcel } from '@/types/parcel';

export default function DashboardScreen() {
  const { profile } = useAuth();
  const { parcels, loading } = useParcels();
  const [recentParcels, setRecentParcels] = useState<Parcel[]>([]);

  useEffect(() => {
    setRecentParcels(parcels.slice(0, 4));
  }, [parcels]);

  const stats = useMemo(() => {
    return {
      total: parcels.length,
      pending: parcels.filter((parcel) => ['CREATED', 'PICKED_UP'].includes(parcel.status)).length,
      inTransit: parcels.filter((parcel) => parcel.status === 'IN_TRANSIT').length,
      outForDelivery: parcels.filter((parcel) => parcel.status === 'OUT_FOR_DELIVERY').length,
      delivered: parcels.filter((parcel) => parcel.status === 'DELIVERED').length,
    };
  }, [parcels]);

  if (loading) return <Loading label="Loading dashboard" />;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.eyebrow}>Overview</Text>
          <Text style={styles.title}>Logistics Dashboard</Text>
        </View>
        <Text style={styles.user}>Hi, {profile?.name ?? 'Operator'}</Text>
      </View>

      <View style={styles.grid}>
        <View style={styles.card}><Text style={styles.cardLabel}>Total Parcels</Text><Text style={styles.cardValue}>{stats.total}</Text></View>
        <View style={styles.card}><Text style={styles.cardLabel}>Pending</Text><Text style={styles.cardValue}>{stats.pending}</Text></View>
        <View style={styles.card}><Text style={styles.cardLabel}>In Transit</Text><Text style={styles.cardValue}>{stats.inTransit}</Text></View>
        <View style={styles.card}><Text style={styles.cardLabel}>Out for Delivery</Text><Text style={styles.cardValue}>{stats.outForDelivery}</Text></View>
        <View style={styles.card}><Text style={styles.cardLabel}>Delivered</Text><Text style={styles.cardValue}>{stats.delivered}</Text></View>
      </View>

      <View style={styles.actionsRow}>
        <Link href="/parcels/create" asChild>
          <Button title="Create Parcel" onPress={() => undefined} style={styles.button} />
        </Link>
        <Link href="/drivers/create" asChild>
          <Button title="Add Driver" onPress={() => undefined} variant="secondary" style={styles.button} />
        </Link>
        <Link href="/parcels" asChild>
          <Button title="Track Parcel" onPress={() => undefined} variant="secondary" style={styles.button} />
        </Link>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Recent Parcels</Text>
      </View>

      {recentParcels.length === 0 ? (
        <EmptyState title="No parcels yet" message="Add a parcel to start tracking operations." />
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
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  content: { padding: 20 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 },
  eyebrow: { fontSize: 12, textTransform: 'uppercase', color: '#2563eb', fontWeight: '700' },
  title: { fontSize: 28, fontWeight: '800', color: '#0f172a' },
  user: { fontSize: 14, color: '#475569' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 18 },
  card: { width: '48%', marginBottom: 12, backgroundColor: '#fff', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#e2e8f0' },
  cardLabel: { color: '#64748b', fontSize: 12 },
  cardValue: { marginTop: 8, fontSize: 28, fontWeight: '800', color: '#0f172a' },
  actionsRow: { flexDirection: 'column', gap: 10, marginBottom: 18 },
  button: { marginBottom: 8 },
  sectionHeader: { marginBottom: 12 },
  sectionTitle: { fontSize: 20, fontWeight: '800', color: '#0f172a' },
});
