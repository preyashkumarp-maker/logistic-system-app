import { Ionicons } from '@expo/vector-icons';
import { Link, router } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/common/Button';
import { EmptyState } from '@/components/common/EmptyState';
import { Loading } from '@/components/common/Loading';
import { DriverCard } from '@/components/driver/DriverCard';
import { COLORS } from '@/constants/colors';
import { useDrivers } from '@/hooks/useDrivers';

export default function DriversScreen() {
  const { drivers, loading } = useDrivers();
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const filtered = useMemo(() => {
    if (!search) return drivers;
    return drivers.filter((driver) => driver.name.toLowerCase().includes(search.toLowerCase()));
  }, [drivers, search]);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 600);
  };

  if (loading) return <Loading label="Loading drivers" />;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>Drivers</Text>
          <Link href="/drivers/create" asChild>
            <Button title="Add" icon="add" size="sm" onPress={() => undefined} />
          </Link>
        </View>

        <View style={styles.searchWrap}>
          <Ionicons name="search-outline" size={18} color={COLORS.textSubtle} style={styles.searchIcon} />
          <TextInput
            value={search}
            placeholder="Search driver by name"
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

        {filtered.length === 0 ? (
          <EmptyState title="No drivers" message="Add a driver to assign deliveries." icon="people-outline" />
        ) : (
          <FlatList
            data={filtered}
            keyExtractor={(item) => item.id}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={COLORS.primary} />}
            renderItem={({ item }) => (
              <DriverCard driver={item} onPress={() => router.push({ pathname: '/drivers/[id]', params: { id: item.id } })} />
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
    marginBottom: 14,
  },
  searchIcon: { marginRight: 8 },
  search: { flex: 1, fontSize: 14, color: COLORS.text, height: '100%' },
  list: { paddingBottom: 120 },
});

