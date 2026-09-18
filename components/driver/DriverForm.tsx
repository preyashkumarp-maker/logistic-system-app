import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/common/Button';
import { ErrorMessage } from '@/components/common/ErrorMessage';
import { Input } from '@/components/common/Input';
import { COLORS } from '@/constants/colors';
import { DRIVER_STATUSES } from '@/constants/status';
import { Driver, DriverStatus } from '@/types/driver';
import { validateEmail, validatePhone, validateRequired } from '@/utils/validation';

export interface DriverFormValues {
  name: string;
  phone: string;
  email: string;
  vehicleNumber: string;
  vehicleType: string;
  status: DriverStatus;
}

interface DriverFormProps {
  initialValues?: Partial<Driver>;
  showStatus?: boolean;
  submitLabel: string;
  onSubmit: (values: DriverFormValues) => Promise<void> | void;
}

export function DriverForm({ initialValues, showStatus, submitLabel, onSubmit }: DriverFormProps) {
  const [form, setForm] = useState<DriverFormValues>({
    name: initialValues?.name ?? '',
    phone: initialValues?.phone ?? '',
    email: initialValues?.email ?? '',
    vehicleNumber: initialValues?.vehicleNumber ?? '',
    vehicleType: initialValues?.vehicleType ?? 'Van',
    status: initialValues?.status ?? 'AVAILABLE',
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (field: keyof DriverFormValues, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async () => {
    if (validateRequired(form.name) || !validateEmail(form.email) || validatePhone(form.phone) || validateRequired(form.vehicleNumber)) {
      setError('Please fill in all fields with valid values.');
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

      <Input label="Name" value={form.name} onChangeText={(value) => handleChange('name', value)} placeholder="Full name" />
      <Input label="Phone" value={form.phone} onChangeText={(value) => handleChange('phone', value)} placeholder="9876543210" keyboardType="phone-pad" />
      <Input label="Email" value={form.email} onChangeText={(value) => handleChange('email', value)} placeholder="driver@email.com" keyboardType="email-address" />
      <Input label="Vehicle Number" value={form.vehicleNumber} onChangeText={(value) => handleChange('vehicleNumber', value)} placeholder="e.g. MH12AB1234" />
      <Input label="Vehicle Type" value={form.vehicleType} onChangeText={(value) => handleChange('vehicleType', value)} placeholder="e.g. Van, Bike, Truck" />

      {showStatus ? (
        <>
          <Text style={styles.sectionTitle}>Status</Text>
          <View style={styles.chipRow}>
            {DRIVER_STATUSES.map((statusOption) => (
              <Pressable
                key={statusOption}
                onPress={() => setForm((prev) => ({ ...prev, status: statusOption }))}
                style={[styles.chip, form.status === statusOption && styles.chipActive]}
              >
                <Text style={[styles.chipText, form.status === statusOption && styles.chipTextActive]}>{statusOption}</Text>
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
  container: { paddingBottom: 40},
  sectionTitle: { fontSize: 13, fontWeight: '700', color: COLORS.textMuted, textTransform: 'uppercase', marginTop: 8, marginBottom: 10 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  chip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, borderWidth: 1, borderColor: COLORS.border, backgroundColor: '#fff' },
  chipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  chipText: { fontSize: 12, fontWeight: '600', color: COLORS.textMuted },
  chipTextActive: { color: '#fff' },
  submitButton: { marginTop: 12 },
});
