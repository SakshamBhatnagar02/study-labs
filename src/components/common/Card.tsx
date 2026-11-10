import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle, Platform } from 'react-native';
import { useTheme } from '../../theme';

interface CardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  variant?: 'elevated' | 'outlined' | 'flat';
  noPadding?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  style,
  variant = 'elevated',
  noPadding = false,
}) => {
  const { colors, mode } = useTheme();
  const useLightElevation = variant === 'elevated' && mode === 'light';

  const getBorderColor = () => {
    if (variant === 'outlined') return colors.border;
    return mode === 'dark' ? colors.border : colors.borderSubtle;
  };

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: getBorderColor(),
          borderWidth: variant === 'outlined' || mode === 'dark' ? 1 : StyleSheet.hairlineWidth,
          padding: noPadding ? 0 : 16,
        },
        useLightElevation && styles.lightShadow,
        style,
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  lightShadow: Platform.select({
    android: {
      // Avoid Android hardware elevation halo breaking rounded corners during sibling press transitions
      elevation: 0,
    },
    default: {
      shadowColor: '#EA580C',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.08,
      shadowRadius: 10,
    },
  }),
});
