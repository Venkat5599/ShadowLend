export const colors = {
  primary: '#136dec',
  primaryLight: 'rgba(19, 109, 236, 0.1)',
  primaryShadow: 'rgba(19, 109, 236, 0.25)',

  backgroundLight: '#f6f7f8',
  backgroundDark: '#101822',

  white: '#ffffff',
  black: '#0d131b',

  textPrimary: '#0d131b',
  textSecondary: '#4c6c9a',
  textMuted: '#cfd9e7',

  success: '#22c55e',
  successLight: 'rgba(34, 197, 94, 0.1)',
  successSoft: '#e8f5e9',

  warning: '#f59e0b',
  warningLight: 'rgba(245, 158, 11, 0.1)',

  error: '#ef4444',
  errorLight: 'rgba(239, 68, 68, 0.1)',

  border: '#e2e8f0',
  borderLight: 'rgba(226, 232, 240, 0.5)',

  cardBackground: '#ffffff',
  orcaBlue: '#e0e7ff',

  // Dark mode variants
  dark: {
    background: '#0a1929', // Dark teal/blue background
    card: '#132f4c', // Darker teal card
    text: '#e3f2fd', // Light cyan-tinted white
    textSecondary: '#90caf9', // Bright cyan for secondary text
    border: '#1e4976', // Teal border
    accent: '#00d4ff', // Bright cyan accent
  },
}

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
}

export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 24,
  full: 9999,
}

// Umbra-style shadow presets for consistent soft shadows
export const shadows = {
  soft: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  strong: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 8,
  },
  colored: (color: string) => ({
    shadowColor: color,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 3,
  }),
}

export const fontSize = {
  xs: 10,
  sm: 12,
  md: 14,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  display: 40,
}

export const fontWeight = {
  normal: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
  extrabold: '800' as const,
}

// Font families - Use Mugen Grotesk consistently across the app
// This ensures visual consistency like the Figma Crypto Trading App UI Kit
export const fonts = {
  // Primary font family - Mugen Grotesk for all text
  regular: 'MugenGrotesk',
  medium: 'MugenGrotesk-Medium',
  semiBold: 'MugenGrotesk-SemiBold',
  bold: 'MugenGrotesk-Bold',
  light: 'MugenGrotesk-Light',
  extraBold: 'MugenGrotesk-ExtraBold',
  
  // Legacy aliases for backward compatibility
  heading: 'MugenGrotesk',
  headingBold: 'MugenGrotesk-Bold',
  headingMedium: 'MugenGrotesk-Medium',
  headingSemiBold: 'MugenGrotesk-SemiBold',
  headingLight: 'MugenGrotesk-Light',
  
  // Body aliases (now using Mugen Grotesk for consistency)
  body: 'MugenGrotesk',
  bodyMedium: 'MugenGrotesk-Medium',
  bodySemiBold: 'MugenGrotesk-SemiBold',
  bodyBold: 'MugenGrotesk-Bold',
}
