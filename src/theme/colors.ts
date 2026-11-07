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
  
  bgDark: '#111827',
  cardDark: '#1F2937',
  textDark: '#F9FAFB',
  textDarkSecondary: '#94A3B8',
  borderDark: '#374151',
  borderDarkSubtle: '#1E293B',
  
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
    surface: isDark ? '#1E293B' : '#FAFAF9',
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
    shadow: isDark ? 'rgba(0, 0, 0, 0.4)' : 'rgba(249, 115, 22, 0.1)',
  };
};

