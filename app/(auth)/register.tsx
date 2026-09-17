import { Link, router } from 'expo-router';
import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/common/Button';
import { ErrorMessage } from '@/components/common/ErrorMessage';
import { Input } from '@/components/common/Input';
import { Loading } from '@/components/common/Loading';
import { registerUser } from '@/services/authService';
import { validateConfirmPassword, validateEmail, validatePassword, validatePhone, validateRequired } from '@/utils/validation';

export default function RegisterScreen() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '', phone: '' });
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

  if (loading) return <Loading label="Creating account" />;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Create account</Text>

        {error ? <ErrorMessage message={error} /> : null}

        <Input label="Full Name" value={form.name} onChangeText={(value: string) => handleChange('name', value)} placeholder="John Smith" error={validationErrors.name} />
        <Input label="Email" value={form.email} onChangeText={(value: string) => handleChange('email', value)} placeholder="john@email.com" keyboardType="email-address" error={validationErrors.email} />
        <Input label="Phone Number" value={form.phone} onChangeText={(value: string) => handleChange('phone', value)} placeholder="9876543210" keyboardType="phone-pad" error={validationErrors.phone} />
        <Input label="Password" value={form.password} onChangeText={(value: string) => handleChange('password', value)} placeholder="••••••••" secureTextEntry error={validationErrors.password} />
        <Input label="Confirm Password" value={form.confirmPassword} onChangeText={(value: string) => handleChange('confirmPassword', value)} placeholder="••••••••" secureTextEntry error={validationErrors.confirmPassword} />

        <Button title="Register" onPress={handleSubmit} />

        <Text style={styles.footerText}>
          Already registered? <Link href="/login" style={styles.link}>Login</Link>
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, justifyContent: 'center', padding: 24, backgroundColor: '#f8fafc' },
  card: { backgroundColor: '#fff', borderRadius: 20, padding: 24, borderWidth: 1, borderColor: '#e2e8f0' },
  title: { fontSize: 28, fontWeight: '800', color: '#0f172a', marginBottom: 18 },
  footerText: { marginTop: 18, textAlign: 'center', color: '#475569' },
  link: { color: '#2563eb', fontWeight: '700' },
});
