import { Ionicons } from '@expo/vector-icons';
import { Link, router } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/common/Button';
import { ErrorMessage } from '@/components/common/ErrorMessage';
import { Input } from '@/components/common/Input';
import { COLORS } from '@/constants/colors';
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

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <View style={styles.brandWrap}>
            <View style={styles.logo}>
              <Ionicons name="cube" size={30} color="#fff" />
            </View>
            <Text style={styles.brandTitle}>Logistics Tracker</Text>
            <Text style={styles.brandSubtitle}>Manage parcels and drivers on the go</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.title}>Welcome back</Text>
            <Text style={styles.subtitle}>Sign in to continue</Text>

            {error ? <ErrorMessage message={error} /> : null}

            <Input label="Email" value={email} onChangeText={setEmail} placeholder="name@email.com" keyboardType="email-address" icon="mail-outline" />
            <Input label="Password" value={password} onChangeText={setPassword} placeholder="••••••••" secureTextEntry icon="lock-closed-outline" />

            <Button title="Login" onPress={handleSubmit} loading={loading} style={styles.submitButton} />

            <Text style={styles.footerText}>
              Don't have an account?{' '}
              <Link href="/register" style={styles.link}>Register</Link>
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
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  brandWrap: { alignItems: 'center', marginBottom: 28 },
  logo: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
  },
  brandTitle: { fontSize: 22, fontWeight: '800', color: COLORS.text },
  brandSubtitle: { marginTop: 4, fontSize: 13, color: COLORS.textMuted },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 22,
    padding: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  title: { fontSize: 24, fontWeight: '800', color: COLORS.text, marginBottom: 6 },
  subtitle: { fontSize: 14, color: COLORS.textMuted, marginBottom: 20 },
  submitButton: { marginTop: 4 },
  footerText: { marginTop: 20, textAlign: 'center', color: COLORS.textMuted, fontSize: 13.5 },
  link: { color: COLORS.primary, fontWeight: '700' },
});

