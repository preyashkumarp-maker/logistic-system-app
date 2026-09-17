import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { EmptyState } from '@/components/common/EmptyState';
import { Loading } from '@/components/common/Loading';
import { DriverForm, DriverFormValues } from '@/components/driver/DriverForm';
import { getDriverById, updateDriver } from '@/services/driverService';
import { Driver } from '@/types/driver';

export default function EditDriverScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [driver, setDriver] = useState<Driver | null | undefined>(undefined);

  useEffect(() => {
    if (!id) return;
    getDriverById(id).then(setDriver);
  }, [id]);

  if (driver === undefined) return <Loading label="Loading driver" />;
  if (driver === null) return <EmptyState title="Driver not found" message="This driver may have been removed." />;

  const handleSubmit = async (values: DriverFormValues) => {
    await updateDriver(driver.id, values);
    router.back();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Edit Driver</Text>
      <DriverForm initialValues={driver} showStatus submitLabel="Save Changes" onSubmit={handleSubmit} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc', padding: 20 },
  title: { fontSize: 28, fontWeight: '800', color: '#0f172a', marginBottom: 18 },
});
