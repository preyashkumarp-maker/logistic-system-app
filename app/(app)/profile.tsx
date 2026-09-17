import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/common/Button';
import { ErrorMessage } from '@/components/common/ErrorMessage';
import { Input } from '@/components/common/Input';
import { Loading } from '@/components/common/Loading';
import { useAuth } from '@/hooks/useAuth';
import { logoutUser, updateUserProfile } from '@/services/authService';
import { validatePhone, validateRequired } from '@/utils/validation';

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
    <View style={styles.container}>
      <Text style={styles.heading}>Profile</Text>

      {isEditing ? (
        <View style={styles.card}>
          {error ? <ErrorMessage message={error} /> : null}
          <Input label="Name" value={name} onChangeText={setName} />
          <Input label="Phone" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
          <Button title="Save" onPress={handleSave} disabled={saving} />
          <View style={styles.spacer} />
          <Button title="Cancel" onPress={() => setIsEditing(false)} variant="secondary" />
        </View>
      ) : (
        <View style={styles.card}>
          <Text style={styles.label}>Name</Text>
          <Text style={styles.value}>{profile?.name ?? 'N/A'}</Text>
          <Text style={styles.label}>Email</Text>
          <Text style={styles.value}>{profile?.email ?? 'N/A'}</Text>
          <Text style={styles.label}>Phone</Text>
          <Text style={styles.value}>{profile?.phone ?? 'N/A'}</Text>
          <Text style={styles.label}>Role</Text>
          <Text style={styles.value}>{profile?.role ?? 'admin'}</Text>
        </View>
      )}

      {!isEditing ? (
        <>
          <Button title="Edit Profile" onPress={startEditing} variant="secondary" />
          <View style={styles.spacer} />
          <Button title="Logout" onPress={handleLogout} variant="danger" />
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc', padding: 20 },
  heading: { fontSize: 28, fontWeight: '800', color: '#0f172a', marginBottom: 18 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 18, borderWidth: 1, borderColor: '#e2e8f0', marginBottom: 18 },
  label: { color: '#64748b', fontSize: 12, marginTop: 10 },
  value: { color: '#0f172a', fontSize: 18, fontWeight: '700', marginTop: 4 },
  spacer: { height: 12 },
});
