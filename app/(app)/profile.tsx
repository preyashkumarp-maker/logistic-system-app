import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/common/Button';
import { ErrorMessage } from '@/components/common/ErrorMessage';
import { Input } from '@/components/common/Input';
import { Loading } from '@/components/common/Loading';
import { COLORS } from '@/constants/colors';
import { useAuth } from '@/hooks/useAuth';
import { logoutUser, updateUserProfile } from '@/services/authService';
import { validatePhone, validateRequired } from '@/utils/validation';

const PROFILE_FIELDS: { key: 'email' | 'phone' | 'role'; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { key: 'email', label: 'Email', icon: 'mail-outline' },
  { key: 'phone', label: 'Phone', icon: 'call-outline' },
  { key: 'role', label: 'Role', icon: 'shield-checkmark-outline' },
];

export default function ProfileScreen() {
  const { profile, loading } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  if (loading) return <Loading label="Loading profile" />;

  const handleLogout = async () => {
    await logoutUser();
    router.replace('/login');
  };

  const startEditing = () => {
    setName(profile?.name ?? '');
    setPhone(profile?.phone ?? '');
    setError('');
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (validateRequired(name) || validatePhone(phone)) {
      setError('Please enter a valid name and phone number.');
      return;
    }

    setSaving(true);
    setError('');
    try {
      if (profile) {
        await updateUserProfile(profile.id, { name: name.trim(), phone: phone.trim() });
      }
      setIsEditing(false);
    } catch (saveError: any) {
      setError(saveError?.message ?? 'Unable to update profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.heading}>Profile</Text>

        {!isEditing ? (
          <View style={styles.heroCard}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarInitial}>{(profile?.name ?? 'U').charAt(0).toUpperCase()}</Text>
            </View>
            <Text style={styles.heroName}>{profile?.name ?? 'N/A'}</Text>
            <View style={styles.roleBadge}>
              <Text style={styles.roleBadgeText}>{(profile?.role ?? 'admin').toUpperCase()}</Text>
            </View>
          </View>
        ) : null}

        {isEditing ? (
          <View style={styles.card}>
            {error ? <ErrorMessage message={error} /> : null}
            <Input label="Name" value={name} onChangeText={setName} icon="person-outline" />
            <Input label="Phone" value={phone} onChangeText={setPhone} keyboardType="phone-pad" icon="call-outline" />
            <Button title="Save Changes" onPress={handleSave} loading={saving} style={styles.spacer} />
            <Button title="Cancel" onPress={() => setIsEditing(false)} variant="secondary" />
          </View>
        ) : (
          <View style={styles.card}>
            {PROFILE_FIELDS.map((field) => (
              <View key={field.key} style={styles.infoRow}>
                <View style={styles.infoIconWrap}>
                  <Ionicons name={field.icon} size={17} color={COLORS.primary} />
                </View>
                <View>
                  <Text style={styles.label}>{field.label}</Text>
                  <Text style={styles.value}>{profile?.[field.key] ?? 'N/A'}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {!isEditing ? (
          <>
            <Button title="Edit Profile" onPress={startEditing} variant="outline" icon="create-outline" style={styles.actionButton} />
            <Button title="Logout" onPress={handleLogout} variant="danger" icon="log-out-outline" />
          </>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 20, paddingBottom: 120 },
  heading: { fontSize: 24, fontWeight: '800', color: COLORS.text, marginBottom: 18 },
  heroCard: {
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 16,
  },
  avatarCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarInitial: { color: '#fff', fontWeight: '800', fontSize: 26 },
  heroName: { fontSize: 19, fontWeight: '800', color: COLORS.text },
  roleBadge: { marginTop: 8, backgroundColor: COLORS.primaryLight, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 5 },
  roleBadgeText: { color: COLORS.primary, fontSize: 11, fontWeight: '700', letterSpacing: 0.4 },
  card: { backgroundColor: COLORS.surface, borderRadius: 16, padding: 18, borderWidth: 1, borderColor: COLORS.border, marginBottom: 18 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 10 },
  infoIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: { color: COLORS.textMuted, fontSize: 12 },
  value: { color: COLORS.text, fontSize: 15.5, fontWeight: '700', marginTop: 2 },
  spacer: { marginBottom: 12 },
  actionButton: { marginBottom: 12 },
});

