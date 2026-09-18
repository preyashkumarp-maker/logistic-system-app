import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { ParcelForm, ParcelFormValues } from '@/components/parcel/ParcelForm';
import { createParcel } from '@/services/parcelService';

export default function CreateParcelScreen() {
  const handleSubmit = async (values: ParcelFormValues) => {
    await createParcel({ ...values, status: 'CREATED' });
    router.back();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Parcel</Text>
      <ParcelForm submitLabel="Save Parcel" onSubmit={handleSubmit} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc', padding: 20, paddingBottom: 100, },
  title: { fontSize: 28, fontWeight: '800', color: '#0f172a', marginBottom: 18 },
});
