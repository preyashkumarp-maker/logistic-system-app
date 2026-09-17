import { Link, router } from 'expo-router';
import { useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/common/Button';
import { ErrorMessage } from '@/components/common/ErrorMessage';
import { Input } from '@/components/common/Input';
import { COLORS } from '@/constants/colors';
import { registerUser } from '@/services/authService';
import { validateConfirmPassword, validateEmail, validatePassword, validatePhone, validateRequired } from '@/utils/validation';

export default function RegisterScreen() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '', phone: '' });
  const [touched, setTouched] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const validationErrors = useMemo(() => ({
    name: validateRequired(form.name),
    email: validateEmail(form.email) ? '' : 'Enter a valid email address',
    password: validatePassword(form.password),
    confirmPassword: validateConfirmPassword(form.password, form.confirmPassword),
    phone: validatePhone(form.phone),
  }), [form]);

  const handleChange = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    setTouched(true);
    const hasErrors = Object.values(validationErrors).some(Boolean);
    if (hasErrors) {
      setError('Please correct the highlighted fields and try again.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await registerUser({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        phone: form.phone.trim(),
      });
      router.replace('/dashboard');
    } catch (registerError: any) {
      const message = registerError?.message ?? 'Registration failed';
      setError(message.includes('auth/') ? 'Unable to create your account right now.' : message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <View style={styles.card}>
            <Text style={styles.title}>Create account</Text>
            <Text style={styles.subtitle}>Join to start managing deliveries</Text>

            {error ? <ErrorMessage message={error} /> : null}

            <Input label="Full Name" value={form.name} onChangeText={(value: string) => handleChange('name', value)} placeholder="John Smith" icon="person-outline" error={touched ? validationErrors.name : ''} />
            <Input label="Email" value={form.email} onChangeText={(value: string) => handleChange('email', value)} placeholder="john@email.com" keyboardType="email-address" icon="mail-outline" error={touched ? validationErrors.email : ''} />
            <Input label="Phone Number" value={form.phone} onChangeText={(value: string) => handleChange('phone', value)} placeholder="9876543210" keyboardType="phone-pad" icon="call-outline" error={touched ? validationErrors.phone : ''} />
            <Input label="Password" value={form.password} onChangeText={(value: string) => handleChange('password', value)} placeholder="••••••••" secureTextEntry icon="lock-closed-outline" error={touched ? validationErrors.password : ''} />
            <Input label="Confirm Password" value={form.confirmPassword} onChangeText={(value: string) => handleChange('confirmPassword', value)} placeholder="••••••••" secureTextEntry icon="lock-closed-outline" error={touched ? validationErrors.confirmPassword : ''} />

            <Button title="Register" onPress={handleSubmit} loading={loading} style={styles.submitButton} />

            <Text style={styles.footerText}>
              Already registered? <Link href="/login" style={styles.link}>Login</Link>
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  flex: { flex: 1 },
  container: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  card: { backgroundColor: COLORS.surface, borderRadius: 22, padding: 24, borderWidth: 1, borderColor: COLORS.border },
  title: { fontSize: 26, fontWeight: '800', color: COLORS.text, marginBottom: 6 },
  subtitle: { fontSize: 14, color: COLORS.textMuted, marginBottom: 20 },
  submitButton: { marginTop: 4 },
  footerText: { marginTop: 20, textAlign: 'center', color: COLORS.textMuted, fontSize: 13.5 },
  link: { color: COLORS.primary, fontWeight: '700' },
});

