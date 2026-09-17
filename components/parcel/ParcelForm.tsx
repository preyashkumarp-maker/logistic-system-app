import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/common/Button';
import { ErrorMessage } from '@/components/common/ErrorMessage';
import { Input } from '@/components/common/Input';
import { COLORS } from '@/constants/colors';
import { PARCEL_STATUSES } from '@/constants/status';
import { Driver } from '@/types/driver';
import { Parcel, ParcelStatus } from '@/types/parcel';
import { validateRequired } from '@/utils/validation';

export interface ParcelFormValues {
  senderName: string;
  senderPhone: string;
  receiverName: string;
  receiverPhone: string;
  pickupAddress: string;
  deliveryAddress: string;
  packageType: string;
  packageWeight: string;
  status: ParcelStatus;
  driverId?: string;
}

interface ParcelFormProps {
  initialValues?: Partial<Parcel>;
  drivers?: Driver[];
  showStatusAndDriver?: boolean;
  submitLabel: string;
  onSubmit: (values: ParcelFormValues) => Promise<void> | void;
}

export function ParcelForm({ initialValues, drivers = [], showStatusAndDriver, submitLabel, onSubmit }: ParcelFormProps) {
  const [form, setForm] = useState<ParcelFormValues>({
    senderName: initialValues?.senderName ?? '',
    senderPhone: initialValues?.senderPhone ?? '',
    receiverName: initialValues?.receiverName ?? '',
    receiverPhone: initialValues?.receiverPhone ?? '',
    pickupAddress: initialValues?.pickupAddress ?? '',
    deliveryAddress: initialValues?.deliveryAddress ?? '',
    packageType: initialValues?.packageType ?? 'Standard',
    packageWeight: initialValues?.packageWeight ?? '',
    status: initialValues?.status ?? 'CREATED',
    driverId: initialValues?.driverId,
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (field: keyof ParcelFormValues, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async () => {
    const required: (keyof ParcelFormValues)[] = ['senderName', 'receiverName', 'pickupAddress', 'deliveryAddress', 'packageWeight'];
    const missing = required.find((field) => validateRequired(form[field] as string));
    if (missing) {
      setError('Please fill in all required fields.');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      await onSubmit(form);
    } catch (submitError: any) {
      setError(submitError?.message ?? 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {error ? <ErrorMessage message={error} /> : null}

      <Text style={styles.sectionTitle}>Sender</Text>
      <Input label="Sender Name" value={form.senderName} onChangeText={(value) => handleChange('senderName', value)} placeholder="Full name" />
      <Input label="Sender Phone" value={form.senderPhone} onChangeText={(value) => handleChange('senderPhone', value)} placeholder="9876543210" keyboardType="phone-pad" />

      <Text style={styles.sectionTitle}>Receiver</Text>
      <Input label="Receiver Name" value={form.receiverName} onChangeText={(value) => handleChange('receiverName', value)} placeholder="Full name" />
      <Input label="Receiver Phone" value={form.receiverPhone} onChangeText={(value) => handleChange('receiverPhone', value)} placeholder="9876543210" keyboardType="phone-pad" />

      <Text style={styles.sectionTitle}>Shipment</Text>
      <Input label="Pickup Address" value={form.pickupAddress} onChangeText={(value) => handleChange('pickupAddress', value)} placeholder="Pickup address" />
      <Input label="Delivery Address" value={form.deliveryAddress} onChangeText={(value) => handleChange('deliveryAddress', value)} placeholder="Delivery address" />
      <Input label="Package Type" value={form.packageType} onChangeText={(value) => handleChange('packageType', value)} placeholder="e.g. Documents, Electronics" />
      <Input label="Package Weight" value={form.packageWeight} onChangeText={(value) => handleChange('packageWeight', value)} placeholder="e.g. 2.5 kg" />

      {showStatusAndDriver ? (
        <>
          <Text style={styles.sectionTitle}>Status</Text>
          <View style={styles.chipRow}>
            {PARCEL_STATUSES.map((statusOption) => (
              <Pressable
                key={statusOption}
                onPress={() => setForm((prev) => ({ ...prev, status: statusOption }))}
                style={[styles.chip, form.status === statusOption && styles.chipActive]}
              >
                <Text style={[styles.chipText, form.status === statusOption && styles.chipTextActive]}>{statusOption}</Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.sectionTitle}>Assign Driver</Text>
          <View style={styles.chipRow}>
            <Pressable
              onPress={() => setForm((prev) => ({ ...prev, driverId: undefined }))}
              style={[styles.chip, !form.driverId && styles.chipActive]}
            >
              <Text style={[styles.chipText, !form.driverId && styles.chipTextActive]}>Unassigned</Text>
            </Pressable>
            {drivers.map((driver) => (
              <Pressable
                key={driver.id}
                onPress={() => setForm((prev) => ({ ...prev, driverId: driver.id }))}
                style={[styles.chip, form.driverId === driver.id && styles.chipActive]}
              >
                <Text style={[styles.chipText, form.driverId === driver.id && styles.chipTextActive]}>{driver.name}</Text>
              </Pressable>
            ))}
          </View>
        </>
      ) : null}

      <Button title={submitLabel} onPress={handleSubmit} disabled={submitting} style={styles.submitButton} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { paddingBottom: 40 },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: COLORS.textMuted, textTransform: 'uppercase', marginTop: 8, marginBottom: 10 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  chip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, borderWidth: 1, borderColor: COLORS.border, backgroundColor: '#fff' },
  chipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  chipText: { fontSize: 12, fontWeight: '600', color: COLORS.textMuted },
  chipTextActive: { color: '#fff' },
  submitButton: { marginTop: 12 },
});
