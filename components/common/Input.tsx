import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { COLORS } from '@/constants/colors';

interface InputProps {
  label?: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  icon?: keyof typeof Ionicons.glyphMap;
  multiline?: boolean;
  error?: string;
}

export function Input({ label, value, onChangeText, placeholder, secureTextEntry, keyboardType, icon, multiline, error }: InputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [isSecureVisible, setIsSecureVisible] = useState(false);
  const showToggle = !!secureTextEntry;

  return (
    <View style={styles.fieldWrap}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View
        style={[
          styles.inputWrap,
          multiline && styles.inputWrapMultiline,
          isFocused && styles.inputWrapFocused,
          error ? styles.inputWrapError : null,
        ]}
      >
        {icon ? <Ionicons name={icon} size={18} color={isFocused ? COLORS.primary : COLORS.textSubtle} style={styles.leftIcon} /> : null}
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={COLORS.textSubtle}
          secureTextEntry={showToggle && !isSecureVisible}
          keyboardType={keyboardType}
          multiline={multiline}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          style={[styles.input, multiline && styles.inputMultiline]}
        />
        {showToggle ? (
          <Pressable hitSlop={10} onPress={() => setIsSecureVisible((prev) => !prev)}>
            <Ionicons name={isSecureVisible ? 'eye-off-outline' : 'eye-outline'} size={19} color={COLORS.textSubtle} />
          </Pressable>
        ) : null}
      </View>
      {error ? (
        <View style={styles.errorRow}>
          <Ionicons name="alert-circle" size={13} color={COLORS.error} />
          <Text style={styles.error}>{error}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  fieldWrap: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '600', color: COLORS.textMuted, marginBottom: 7 },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    paddingHorizontal: 14,
  },
  inputWrapMultiline: {
    height: 100,
    alignItems: 'flex-start',
    paddingVertical: 12,
  },
  inputWrapFocused: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.surface,
  },
  inputWrapError: { borderColor: COLORS.error },
  leftIcon: { marginRight: 10 },
  input: {
    flex: 1,
    fontSize: 15,
    color: COLORS.text,
    height: '100%',
  },
  inputMultiline: {
    textAlignVertical: 'top',
  },
  errorRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6, gap: 5 },
  error: { color: COLORS.error, fontSize: 12 },
});

