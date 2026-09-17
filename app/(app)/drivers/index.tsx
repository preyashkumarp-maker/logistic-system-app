import { Link, router } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/common/Button';
import { EmptyState } from '@/components/common/EmptyState';
import { Loading } from '@/components/common/Loading';
import { DriverCard } from '@/components/driver/DriverCard';
import { useDrivers } from '@/hooks/useDrivers';

export default function DriversScreen() {
  const { drivers, loading } = useDrivers();

  if (loading) return <Loading label="Loading drivers" />;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Drivers</Text>
        <Link href="/drivers/create" asChild>
          <Button title="Add Driver" onPress={() => undefined} />
        </Link>
      </View>

      {drivers.length === 0 ? (
        <EmptyState title="No drivers" message="Add a driver to assign deliveries." />
      ) : (
        drivers.map((driver) => (
          <DriverCard
            key={driver.id}
            driver={driver}
            onPress={() => router.push({ pathname: '/drivers/[id]', params: { id: driver.id } })}
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
  title: { fontSize: 28, fontWeight: '800', color: '#0f172a' },
});
