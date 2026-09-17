import { Link, router } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, TextInput, View } from 'react-native';

import { Button } from '@/components/common/Button';
import { EmptyState } from '@/components/common/EmptyState';
import { Loading } from '@/components/common/Loading';
import { ParcelCard } from '@/components/parcel/ParcelCard';
import { COLORS } from '@/constants/colors';
import { PARCEL_STATUSES } from '@/constants/status';
import { useParcels } from '@/hooks/useParcels';

const STATUS_FILTERS = ['ALL', ...PARCEL_STATUSES];

export default function ParcelsScreen() {
  const { parcels, loading } = useParcels();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('ALL');
  const [refreshing, setRefreshing] = useState(false);

  const filtered = useMemo(() => {
    return parcels.filter((parcel) => {
      const matchesSearch =
        !search ||
        parcel.trackingNumber.toLowerCase().includes(search.toLowerCase()) ||
        parcel.receiverName.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = status === 'ALL' || parcel.status === status;
      return matchesSearch && matchesStatus;
    });
  }, [parcels, search, status]);

  if (loading) return <Loading label="Loading parcels" />;

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Parcels</Text>
        <Link href="/parcels/create" asChild>
          <Button title="New Parcel" onPress={() => undefined} />
        </Link>
      </View>

      <TextInput
        value={search}
        placeholder="Search tracking number or receiver"
        onChangeText={setSearch}
        style={styles.search}
      />

      <FlatList
        horizontal
        data={STATUS_FILTERS}
        keyExtractor={(item) => item}
        showsHorizontalScrollIndicator={false}
        style={styles.filterRow}
        renderItem={({ item }) => (
          <Pressable onPress={() => setStatus(item)} style={[styles.chip, status === item && styles.chipActive]}>
            <Text style={[styles.chipText, status === item && styles.chipTextActive]}>{item}</Text>
          </Pressable>
        )}
      />

      {filtered.length === 0 ? (
        <EmptyState title="No parcels found" message="Try another search or create a new parcel." />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => setRefreshing(false)} />}
          renderItem={({ item }) => (
            <ParcelCard parcel={item} onPress={() => router.push({ pathname: '/parcels/[id]', params: { id: item.id } })} />
          )}
          contentContainerStyle={styles.list}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc', padding: 20 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  title: { fontSize: 28, fontWeight: '800', color: '#0f172a' },
  search: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#dbe2ea',
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 46,
    marginBottom: 12,
  },
  filterRow: { flexGrow: 0, marginBottom: 14 },
  chip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, borderWidth: 1, borderColor: COLORS.border, backgroundColor: '#fff', marginRight: 8 },
  chipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  chipText: { fontSize: 12, fontWeight: '600', color: COLORS.textMuted },
  chipTextActive: { color: '#fff' },
  list: { paddingBottom: 24 },
});
