/**
 * Study Labs — Cyber Design Tokens
 * Brand: study.io | Application: Study Labs (io.study.labs)
 */

export const CYBER_TOKENS = {
  colors: {
    // Primary Brand
    neonOrange: '#F97316',
    secondaryOrange: '#EA580C',
    orangeGlow: 'rgba(249, 115, 22, 0.45)',

    // Cyber Accents
    electricCyan: '#22D3EE',
    cyanGlow: 'rgba(34, 211, 238, 0.4)',
    cyberViolet: '#A855F7',
    violetGlow: 'rgba(168, 85, 247, 0.4)',
    cyberMagenta: '#EC4899',
    magentaGlow: 'rgba(236, 72, 153, 0.4)',
    cyberGold: '#FACC15',
    goldGlow: 'rgba(250, 204, 21, 0.45)',
    cyberGreen: '#34D399',
    greenGlow: 'rgba(52, 211, 153, 0.4)',

    // Dark Cyber Surfaces
    darkBg: '#090D16',
    darkCard: '#131A29',
    darkCardElevated: '#1E293B',
    darkBorder: '#334155',
    darkBorderSubtle: '#1E293B',

    // Light Surfaces
    lightBg: '#FFF7ED',
    lightCard: '#FFFFFF',
    lightBorder: '#FED7AA',
    lightBorderSubtle: '#F1F5F9',
  },

  typography: {
    fontWeights: {
      regular: '400' as const,
      medium: '500' as const,
      semibold: '600' as const,
      bold: '700' as const,
      extraBold: '800' as const,
    },
    sizes: {
      xs: 11,
      sm: 13,
      md: 15,
      lg: 18,
      xl: 22,
      xxl: 28,
      display: 34,
    },
  },

  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
  },

  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    full: 9999,
  },

  glow: {
    orange: {
      shadowColor: '#F97316',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.35,
      shadowRadius: 10,
      elevation: 6,
    },
    cyan: {
      shadowColor: '#22D3EE',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.35,
      shadowRadius: 10,
      elevation: 6,
    },
    gold: {
      shadowColor: '#FACC15',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.4,
      shadowRadius: 12,
      elevation: 8,
    },
  },
};

