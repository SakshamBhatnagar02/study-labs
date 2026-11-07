import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
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

  const getBorderColor = () => {
    if (variant === 'outlined') return colors.border;
    return mode === 'dark' ? colors.border : 'transparent';
  };

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: getBorderColor(),
          borderWidth: variant === 'outlined' || mode === 'dark' ? 1 : 0,
          padding: noPadding ? 0 : 16,
          shadowColor: colors.shadow,
        },
        variant === 'elevated' && styles.shadow,
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
  shadow: {
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
});
