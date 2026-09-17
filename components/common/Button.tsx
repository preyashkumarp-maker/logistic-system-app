import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, Pressable, StyleSheet, Text, ViewStyle } from 'react-native';

import { COLORS } from '@/constants/colors';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'outline';
  size?: 'md' | 'sm';
  icon?: keyof typeof Ionicons.glyphMap;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
}

export function Button({ title, onPress, variant = 'primary', size = 'md', icon, loading, disabled, style }: ButtonProps) {
  const isDisabled = disabled || loading;

  const backgroundColor =
    variant === 'secondary'
      ? COLORS.surfaceMuted
      : variant === 'danger'
        ? COLORS.error
        : variant === 'outline'
          ? 'transparent'
          : COLORS.primary;

  const textColor = variant === 'secondary' ? COLORS.text : variant === 'outline' ? COLORS.primary : '#fff';
  const borderColor = variant === 'outline' ? COLORS.primary : 'transparent';

  return (
    <Pressable
      disabled={isDisabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        size === 'sm' && styles.buttonSm,
        { backgroundColor, borderColor, borderWidth: variant === 'outline' ? 1.5 : 0 },
        pressed && !isDisabled && styles.pressed,
        isDisabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={textColor} />
      ) : (
        <>
          {icon ? <Ionicons name={icon} size={18} color={textColor} style={styles.icon} /> : null}
          <Text style={[styles.label, size === 'sm' && styles.labelSm, { color: textColor }]}>{title}</Text>
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    borderRadius: 14,
    paddingVertical: 15,
    paddingHorizontal: 18,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
  },
  buttonSm: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    minHeight: 38,
    borderRadius: 10,
  },
  icon: {
    marginRight: 8,
  },
  label: {
    fontSize: 15,
    fontWeight: '700',
  },
  labelSm: {
    fontSize: 13,
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.99 }],
  },
  disabled: {
    opacity: 0.5,
  },
});

