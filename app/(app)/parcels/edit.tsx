import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { EmptyState } from '@/components/common/EmptyState';
import { Loading } from '@/components/common/Loading';
import { ParcelForm, ParcelFormValues } from '@/components/parcel/ParcelForm';
import { useDrivers } from '@/hooks/useDrivers';
import { getParcelById, updateParcel } from '@/services/parcelService';
import { Parcel } from '@/types/parcel';

export default function EditParcelScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { drivers } = useDrivers();
  const [parcel, setParcel] = useState<Parcel | null | undefined>(undefined);

  useEffect(() => {
    if (!id) return;
    getParcelById(id).then(setParcel);
  }, [id]);

  if (parcel === undefined) return <Loading label="Loading parcel" />;
  if (parcel === null) return <EmptyState title="Parcel not found" message="This parcel may have been deleted." />;

  const handleSubmit = async (values: ParcelFormValues) => {
    await updateParcel(parcel.id, values);
    router.back();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Edit Parcel</Text>
      <ParcelForm
        initialValues={parcel}
        drivers={drivers}
        showStatusAndDriver
        submitLabel="Save Changes"
        onSubmit={handleSubmit}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc', padding: 20 },
  title: { fontSize: 28, fontWeight: '800', color: '#0f172a', marginBottom: 18 },
});
