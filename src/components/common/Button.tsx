import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { useTheme } from '../../theme';
import { SoundManager } from '../../services/soundManager';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  silent?: boolean;
  clickSfx?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  silent = false,
  clickSfx = false,
  icon,
  style,
  textStyle,
}) => {
  const { colors } = useTheme();

  const getBackgroundColor = () => {
    if (disabled) return colors.borderSubtle;
    switch (variant) {
      case 'primary': return colors.primary;
      case 'secondary': return colors.secondary;
      case 'danger': return colors.error;
      case 'outline': return 'transparent';
      case 'ghost': return 'transparent';
    }
  };

  const getTextColor = () => {
    if (disabled) return colors.textSecondary;
    switch (variant) {
      case 'primary':
      case 'secondary':
      case 'danger':
        return '#FFFFFF';
      case 'outline':
        return colors.primary;
      case 'ghost':
        return colors.text;
    }
  };

  const getBorderColor = () => {
    if (variant === 'outline') return disabled ? colors.borderSubtle : colors.primary;
    return 'transparent';
  };

  const paddingVertical = size === 'sm' ? 8 : size === 'lg' ? 14 : 11;
  const paddingHorizontal = size === 'sm' ? 12 : size === 'lg' ? 24 : 18;
  const fontSize = size === 'sm' ? 13 : size === 'lg' ? 16 : 14;

  return (
    <TouchableOpacity
      activeOpacity={0.75}
      onPress={() => {
        if (clickSfx && !silent) {
          SoundManager.playClick();
        }
        onPress();
      }}
      disabled={disabled || loading}
      style={[
        styles.button,
        {
          backgroundColor: getBackgroundColor(),
          borderColor: getBorderColor(),
          borderWidth: variant === 'outline' ? 1.5 : 0,
          paddingVertical,
          paddingHorizontal,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} size="small" />
      ) : (
        <>
          {icon && <>{icon}</>}
          <Text
            style={[
              styles.text,
              {
                color: getTextColor(),
                fontSize,
                marginLeft: icon ? 8 : 0,
              },
              textStyle,
            ]}
          >
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: '600',
    letterSpacing: 0.2,
  },
});

