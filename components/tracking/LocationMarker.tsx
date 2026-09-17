import { StyleSheet, Text, View } from 'react-native';

export function LocationMarker({ label, color }: { label: string; color: string }) {
  return (
    <View style={[styles.dot, { backgroundColor: color }]}>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  dot: {
    width: 12,
    height: 12,
    borderRadius: 999,
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: { fontSize: 10, fontWeight: '700', color: '#fff' },
});
