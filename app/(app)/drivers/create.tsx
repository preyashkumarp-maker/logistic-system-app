import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { DriverForm, DriverFormValues } from '@/components/driver/DriverForm';
import { createDriver } from '@/services/driverService';

export default function CreateDriverScreen() {
  const handleSubmit = async (values: DriverFormValues) => {
    await createDriver({ ...values, status: 'AVAILABLE' });
    router.back();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add Driver</Text>
      <DriverForm submitLabel="Save Driver" onSubmit={handleSubmit} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc', padding: 20, paddingBottom: 100, },
  title: { fontSize: 28, fontWeight: '800', color: '#0f172a', marginBottom: 18 },
});
