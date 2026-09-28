import { useEffect, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EmptyState } from '@/components/common/EmptyState';
import { ErrorMessage } from '@/components/common/ErrorMessage';
import { Loading } from '@/components/common/Loading';
import { COLORS } from '@/constants/colors';
import { listenToUsers, updateUserRole } from '@/services/userService';
import { AppUserProfile, UserRole } from '@/types/auth';

export default function UsersScreen() {
  const [users, setUsers] = useState<AppUserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const unsubscribe = listenToUsers((items) => {
      setUsers(items);
      setLoading(false);
      setError('');
    });
    return unsubscribe;
  }, []);

  if (loading) return <Loading label="Loading users" />;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        <Text style={styles.title}>Users</Text>
        {error ? <ErrorMessage message={error} /> : null}
        {users.length === 0 && !error ? <EmptyState title="No users" message="Registered users will appear here." icon="people-outline" /> : null}
        <FlatList
          data={users}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <UserRow
              user={item}
              disabled={updatingId === item.id}
              onRoleChange={async (role) => {
                setUpdatingId(item.id);
                setError('');
                try {
                  await updateUserRole(item.id, role);
                } catch {
                  setError('Unable to update this user role. Please try again.');
                } finally {
                  setUpdatingId(null);
                }
              }}
            />
          )}
        />
      </View>
    </SafeAreaView>
  );
}

function UserRow({ user, disabled, onRoleChange }: { user: AppUserProfile; disabled: boolean; onRoleChange: (role: Exclude<UserRole, 'admin'>) => Promise<void> }) {
  return (
    <View style={styles.row}>
      <View style={styles.identity}>
        <Text style={styles.name}>{user.name}</Text>
        <Text style={styles.email}>{user.email}</Text>
      </View>
      <View style={styles.roles}>
        {(['user', 'driver'] as const).map((role) => (
          <Pressable key={role} disabled={disabled} onPress={() => onRoleChange(role)} style={[styles.role, user.role === role && styles.roleActive]}>
            <Text style={[styles.roleText, user.role === role && styles.roleTextActive]}>{role}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  container: { flex: 1, paddingHorizontal: 20, paddingTop: 16 },
  title: { fontSize: 24, fontWeight: '800', color: COLORS.text, marginBottom: 16 },
  list: { paddingBottom: 120 },
  row: { backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, borderRadius: 14, padding: 14, marginBottom: 10, gap: 12 },
  identity: { gap: 3 },
  name: { color: COLORS.text, fontSize: 15, fontWeight: '700' },
  email: { color: COLORS.textMuted, fontSize: 12 },
  roles: { flexDirection: 'row', gap: 8 },
  role: { borderWidth: 1, borderColor: COLORS.border, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 7 },
  roleActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  roleText: { color: COLORS.textMuted, fontSize: 12, fontWeight: '700', textTransform: 'capitalize' },
  roleTextActive: { color: '#fff' },
});