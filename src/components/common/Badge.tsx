import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../../theme';

interface BadgeProps {
  label: string;
  variant?: 'primary' | 'success' | 'warning' | 'error' | 'info' | 'neutral';
  size?: 'sm' | 'md';
  style?: ViewStyle;
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  variant = 'primary',
  size = 'md',
  style,
}) => {
  const { colors, mode } = useTheme();

  const getColors = () => {
    switch (variant) {
      case 'primary':
        return {
          bg: mode === 'dark' ? '#431407' : '#FFEDD5',
          text: colors.primary,
        };
      case 'success':
        return {
          bg: colors.successBg,
          text: colors.success,
        };
      case 'warning':
        return {
          bg: colors.warningBg,
          text: colors.warning,
        };
      case 'error':
        return {
          bg: colors.errorBg,
          text: colors.error,
        };
      case 'info':
        return {
          bg: colors.infoBg,
          text: colors.info,
        };
      case 'neutral':
      default:
        return {
          bg: mode === 'dark' ? '#374151' : '#F1F5F9',
          text: colors.textSecondary,
        };
    }
  };

  const c = getColors();
  const paddingV = size === 'sm' ? 2 : 4;
  const paddingH = size === 'sm' ? 8 : 10;
  const fontSize = size === 'sm' ? 11 : 12;

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: c.bg,
          paddingVertical: paddingV,
          paddingHorizontal: paddingH,
        },
        style,
      ]}
    >
      <Text style={[styles.text, { color: c.text, fontSize }]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    borderRadius: 20,
    alignSelf: 'flex-start',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});

