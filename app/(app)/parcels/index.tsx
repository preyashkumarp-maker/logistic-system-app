import { Ionicons } from '@expo/vector-icons';
import { Link, router } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

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

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 600);
  };

  if (loading) return <Loading label="Loading parcels" />;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>Parcels</Text>
          <Link href="/parcels/create" asChild>
            <Button title="New" icon="add" size="sm" onPress={() => undefined} />
          </Link>
        </View>

        <View style={styles.searchWrap}>
          <Ionicons name="search-outline" size={18} color={COLORS.textSubtle} style={styles.searchIcon} />
          <TextInput
            value={search}
            placeholder="Search tracking number or receiver"
            placeholderTextColor={COLORS.textSubtle}
            onChangeText={setSearch}
            style={styles.search}
          />
          {search ? (
            <Pressable onPress={() => setSearch('')} hitSlop={10}>
              <Ionicons name="close-circle" size={18} color={COLORS.textSubtle} />
            </Pressable>
          ) : null}
        </View>

        <FlatList
          horizontal
          data={STATUS_FILTERS}
          keyExtractor={(item) => item}
          showsHorizontalScrollIndicator={false}
          style={styles.filterRow}
          contentContainerStyle={styles.filterRowContent}
          renderItem={({ item }) => (
            <Pressable onPress={() => setStatus(item)} style={[styles.chip, status === item && styles.chipActive]}>
              <Text style={[styles.chipText, status === item && styles.chipTextActive]}>{item.replace(/_/g, ' ')}</Text>
            </Pressable>
          )}
        />

        {filtered.length === 0 ? (
          <EmptyState title="No parcels found" message="Try another search or create a new parcel." icon="search-outline" />
        ) : (
          <FlatList
            data={filtered}
            keyExtractor={(item) => item.id}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={COLORS.primary} />}
            renderItem={({ item }) => (
              <ParcelCard parcel={item} onPress={() => router.push({ pathname: '/parcels/[id]', params: { id: item.id } })} />
            )}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  container: { flex: 1, backgroundColor: COLORS.background, paddingHorizontal: 20, paddingTop: 16 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  title: { fontSize: 24, fontWeight: '800', color: COLORS.text },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
    marginBottom: 12,
  },
  searchIcon: { marginRight: 8 },
  search: { flex: 1, fontSize: 14, color: COLORS.text, height: '100%' },
  filterRow: { flexGrow: 0, marginBottom: 14 },
  filterRowContent: { paddingRight: 8 },
  chip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.surface, marginRight: 8 },
  chipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  chipText: { fontSize: 11.5, fontWeight: '600', color: COLORS.textMuted, textTransform: 'capitalize' },
  chipTextActive: { color: '#fff' },
  list: { paddingBottom: 120 },
});

