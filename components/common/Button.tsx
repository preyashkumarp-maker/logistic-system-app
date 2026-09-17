import { Pressable, StyleSheet, Text, ViewStyle } from 'react-native';

import { COLORS } from '@/constants/colors';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
  style?: ViewStyle;
}

export function Button({ title, onPress, variant = 'primary', disabled, style }: ButtonProps) {
  const backgroundColor =
    variant === 'secondary' ? '#e2e8f0' : variant === 'danger' ? '#ef4444' : COLORS.primary;

  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={[styles.button, { backgroundColor }, disabled && styles.disabled, style]}
    >
      <Text style={styles.label}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  disabled: {
    opacity: 0.6,
  },
});
