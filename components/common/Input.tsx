import { StyleSheet, Text, TextInput, View } from 'react-native';

import { COLORS } from '@/constants/colors';

interface InputProps {
  label?: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  error?: string;
}

export function Input({ label, value, onChangeText, placeholder, secureTextEntry, keyboardType, error }: InputProps) {
  return (
    <View style={styles.fieldWrap}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#94a3b8"
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        style={[styles.input, error ? styles.inputError : null]}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  fieldWrap: { marginBottom: 14 },
  label: { fontSize: 12, fontWeight: '600', color: COLORS.textMuted, marginBottom: 6 },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#dbe2ea',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 15,
    color: COLORS.text,
  },
  inputError: { borderColor: '#ef4444' },
  error: { marginTop: 6, color: '#ef4444', fontSize: 12 },
});
