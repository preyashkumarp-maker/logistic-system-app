import { Link, router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/common/Button';
import { ErrorMessage } from '@/components/common/ErrorMessage';
import { Input } from '@/components/common/Input';
import { Loading } from '@/components/common/Loading';
import { loginUser } from '@/services/authService';
import { validateEmail } from '@/utils/validation';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!validateEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!password.trim()) {
      setError('Password is required.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await loginUser(email.trim(), password);
      router.replace('/dashboard');
    } catch (loginError: any) {
      const message = loginError?.message ?? 'Unable to sign in';
      setError(message.includes('auth/') ? 'Login failed. Please check your email and password.' : message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading label="Signing in" />;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Logistics Tracking System</Text>
        <Text style={styles.subtitle}>Sign in to continue</Text>

        {error ? <ErrorMessage message={error} /> : null}

        <Input label="Email" value={email} onChangeText={setEmail} placeholder="name@email.com" keyboardType="email-address" />
        <Input label="Password" value={password} onChangeText={setPassword} placeholder="••••••••" secureTextEntry />

        <Button title="Login" onPress={handleSubmit} />

        <Text style={styles.footerText}>
          Don’t have an account?{' '}
          <Link href="/register" style={styles.link}>Register</Link>
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#f8fafc',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  title: { fontSize: 28, fontWeight: '800', color: '#0f172a', marginBottom: 8 },
  subtitle: { fontSize: 15, color: '#64748b', marginBottom: 18 },
  footerText: { marginTop: 18, textAlign: 'center', color: '#475569' },
  link: { color: '#2563eb', fontWeight: '700' },
});
