import { MD3LightTheme, MD3DarkTheme } from 'react-native-paper';

// SecureGuardian Color Palette
export const colors = {
  // Primary Colors
  primary: '#1a73e8',      // Deep Blue
  primaryDark: '#1557b0',  // Darker Blue
  primaryLight: '#4285f4', // Lighter Blue
  
  // Accent Colors
  accent: '#f95d6a',       // Coral
  accentDark: '#e53e3e',   // Darker Coral
  accentLight: '#ff7875',  // Lighter Coral
  
  // Secondary Colors
  secondary: '#00c29a',    // Mint Green
  secondaryDark: '#00a085', // Darker Mint
  secondaryLight: '#26d0ce', // Lighter Mint
  
  // Neutral Colors
  slate: '#546e7a',        // Slate Gray
  slateDark: '#37474f',    // Darker Slate
  slateLight: '#78909c',   // Lighter Slate
  
  // Status Colors
  success: '#00c29a',      // Success (Mint Green)
  warning: '#ff9800',      // Warning (Orange)
  error: '#f95d6a',        // Error (Coral)
  info: '#1a73e8',         // Info (Deep Blue)
  
  // Background Colors
  background: '#ffffff',    // Light Background
  backgroundDark: '#121212', // Dark Background
  surface: '#f8f9fa',      // Light Surface
  surfaceDark: '#1e1e1e',  // Dark Surface
  
  // Text Colors
  text: '#212529',         // Primary Text
  textSecondary: '#6c757d', // Secondary Text
  textLight: '#ffffff',    // Light Text
  textDisabled: '#adb5bd', // Disabled Text
  
  // Security Status Colors
  secure: '#00c29a',       // Secure Status
  moderate: '#1a73e8',     // Moderate Risk
  vulnerable: '#ff9800',   // Vulnerable Status
  critical: '#f95d6a',     // Critical Threat
  
  // Transparency Overlays
  overlay: 'rgba(0, 0, 0, 0.5)',
  overlayLight: 'rgba(255, 255, 255, 0.9)',
  backdrop: 'rgba(0, 0, 0, 0.3)',
};

// Light Theme
export const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: colors.primary,
    primaryContainer: colors.primaryLight,
    secondary: colors.secondary,
    secondaryContainer: colors.secondaryLight,
    tertiary: colors.accent,
    tertiaryContainer: colors.accentLight,
    surface: colors.surface,
    surfaceVariant: '#f1f3f4',
    background: colors.background,
    error: colors.error,
    errorContainer: '#ffebee',
    onPrimary: colors.textLight,
    onSecondary: colors.textLight,
    onTertiary: colors.textLight,
    onSurface: colors.text,
    onSurfaceVariant: colors.textSecondary,
    onBackground: colors.text,
    onError: colors.textLight,
    outline: colors.slate,
    outlineVariant: colors.slateLight,
    inverseSurface: colors.slate,
    inverseOnSurface: colors.textLight,
    inversePrimary: colors.primaryLight,
    shadow: colors.overlay,
    scrim: colors.backdrop,
    surfaceDisabled: '#f5f5f5',
    onSurfaceDisabled: colors.textDisabled,
  },
};

// Dark Theme
export const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: colors.primaryLight,
    primaryContainer: colors.primaryDark,
    secondary: colors.secondaryLight,
    secondaryContainer: colors.secondaryDark,
    tertiary: colors.accentLight,
    tertiaryContainer: colors.accentDark,
    surface: colors.surfaceDark,
    surfaceVariant: '#2d2d2d',
    background: colors.backgroundDark,
    error: colors.accentLight,
    errorContainer: '#5d1a1a',
    onPrimary: colors.text,
    onSecondary: colors.text,
    onTertiary: colors.text,
    onSurface: colors.textLight,
    onSurfaceVariant: colors.slateLight,
    onBackground: colors.textLight,
    onError: colors.textLight,
    outline: colors.slateLight,
    outlineVariant: colors.slate,
    inverseSurface: colors.textLight,
    inverseOnSurface: colors.text,
    inversePrimary: colors.primary,
    shadow: 'rgba(0, 0, 0, 0.8)',
    scrim: 'rgba(0, 0, 0, 0.6)',
    surfaceDisabled: '#1a1a1a',
    onSurfaceDisabled: '#666666',
  },
};

// Default theme (light)
export const secureGuardianTheme = lightTheme;

// Typography Scale
export const typography = {
  displayLarge: {
    fontSize: 57,
    lineHeight: 64,
    fontWeight: '400',
    letterSpacing: -0.25,
  },
  displayMedium: {
    fontSize: 45,
    lineHeight: 52,
    fontWeight: '400',
    letterSpacing: 0,
  },
  displaySmall: {
    fontSize: 36,
    lineHeight: 44,
    fontWeight: '400',
    letterSpacing: 0,
  },
  headlineLarge: {
    fontSize: 32,
    lineHeight: 40,
    fontWeight: '600',
    letterSpacing: 0,
  },
  headlineMedium: {
    fontSize: 28,
    lineHeight: 36,
    fontWeight: '600',
    letterSpacing: 0,
  },
  headlineSmall: {
    fontSize: 24,
    lineHeight: 32,
    fontWeight: '600',
    letterSpacing: 0,
  },
  titleLarge: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '500',
    letterSpacing: 0,
  },
  titleMedium: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '500',
    letterSpacing: 0.15,
  },
  titleSmall: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
    letterSpacing: 0.1,
  },
  bodyLarge: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400',
    letterSpacing: 0.15,
  },
  bodyMedium: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400',
    letterSpacing: 0.25,
  },
  bodySmall: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '400',
    letterSpacing: 0.4,
  },
  labelLarge: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
    letterSpacing: 0.1,
  },
  labelMedium: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  labelSmall: {
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '500',
    letterSpacing: 0.5,
  },
};

// Spacing Scale
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
};

// Elevation/Shadow
export const elevation = {
  level0: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  level1: {
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 2,
    elevation: 1,
  },
  level2: {
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.16,
    shadowRadius: 4,
    elevation: 2,
  },
  level3: {
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  level4: {
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.24,
    shadowRadius: 16,
    elevation: 4,
  },
  level5: {
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.28,
    shadowRadius: 24,
    elevation: 5,
  },
};

// Border Radius
export const borderRadius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  full: 9999,
};

// Animation Durations
export const animations = {
  quick: 150,
  standard: 300,
  emphasized: 500,
  slow: 1000,
};

// Security Status Theme Colors
export const securityStatusColors = {
  SECURE: {
    primary: colors.secure,
    background: '#e8f5e8',
    text: '#1b5e20',
  },
  MODERATE: {
    primary: colors.moderate,
    background: '#e3f2fd',
    text: '#0d47a1',
  },
  VULNERABLE: {
    primary: colors.vulnerable,
    background: '#fff3e0',
    text: '#e65100',
  },
  CRITICAL: {
    primary: colors.critical,
    background: '#ffebee',
    text: '#c62828',
  },
};
