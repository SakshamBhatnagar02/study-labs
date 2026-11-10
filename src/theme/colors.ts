export const palette = {
  primary: '#F97316',
  secondary: '#EA580C',
  primaryLight: '#FFEDD5',
  primaryDark: '#C2410C',
  
  bgLight: '#FFF7ED',
  cardLight: '#FFFFFF',
  textLight: '#1F2937',
  textLightSecondary: '#64748B',
  borderLight: '#FED7AA',
  borderLightSubtle: '#F1F5F9',
  
  bgDark: '#0B1120',
  cardDark: '#162032',
  textDark: '#F9FAFB',
  textDarkSecondary: '#94A3B8',
  borderDark: '#4C6387',
  borderDarkSubtle: '#334766',
  
  success: '#16A34A',
  successLight: '#DCFCE7',
  error: '#DC2626',
  errorLight: '#FEE2E2',
  warning: '#F59E0B',
  warningLight: '#FEF3C7',
  info: '#3B82F6',
  infoLight: '#DBEAFE',
  
  subjectPhysics: '#0284C7',
  subjectChemistry: '#10B981',
  subjectMath: '#8B5CF6',
  subjectBiology: '#EC4899',
};

export type ThemeMode = 'light' | 'dark';

export const getThemeColors = (mode: ThemeMode) => {
  const isDark = mode === 'dark';
  return {
    isDark,
    primary: palette.primary,
    secondary: palette.secondary,
    primaryLight: isDark ? '#431407' : palette.primaryLight,
    background: isDark ? palette.bgDark : palette.bgLight,
    card: isDark ? palette.cardDark : palette.cardLight,
    surface: isDark ? '#1E2C43' : '#F8FAFC',
    inputBg: isDark ? '#0E1729' : '#F8FAFC',
    text: isDark ? palette.textDark : palette.textLight,
    textPrimary: isDark ? palette.textDark : palette.textLight,
    textSecondary: isDark ? palette.textDarkSecondary : palette.textLightSecondary,
    border: isDark ? palette.borderDark : palette.borderLight,
    borderSubtle: isDark ? palette.borderDarkSubtle : palette.borderLightSubtle,
    success: palette.success,
    successBg: isDark ? '#064E3B' : palette.successLight,
    error: palette.error,
    errorBg: isDark ? '#7F1D1D' : palette.errorLight,
    warning: palette.warning,
    warningBg: isDark ? '#78350F' : palette.warningLight,
    info: palette.info,
    infoBg: isDark ? '#1E3A8A' : palette.infoLight,
    cyan: '#22D3EE',
    cyanBg: isDark ? 'rgba(34, 211, 238, 0.2)' : '#CFFAFE',
    violet: '#A855F7',
    magenta: '#EC4899',
    gold: '#FACC15',
    goldBg: isDark ? 'rgba(250, 204, 21, 0.2)' : '#FEF9C3',
    shadow: isDark ? 'rgba(0, 0, 0, 0.4)' : 'rgba(249, 115, 22, 0.1)',
  };
};

