import { StyleSheet, Text, View } from 'react-native';

import { COLORS } from '@/constants/colors';

export function EmptyState({ title, message }: { title: string; message: string }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 18, fontWeight: '700', color: COLORS.text },
  message: { marginTop: 8, color: COLORS.textMuted, textAlign: 'center' },
});
