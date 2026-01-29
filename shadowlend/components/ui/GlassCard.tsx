import { View, StyleSheet, ViewStyle } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { colors, borderRadius, spacing } from '@/constants/theme'
import { ReactNode } from 'react'

interface GlassCardProps {
  children: ReactNode
  style?: ViewStyle
  isDark?: boolean
  intensity?: 'light' | 'medium' | 'strong'
}

export function GlassCard({ children, style, isDark, intensity = 'medium' }: GlassCardProps) {
  const getColors = () => {
    if (isDark) {
      switch (intensity) {
        case 'light': 
          return ['rgba(19, 47, 76, 0.4)', 'rgba(19, 47, 76, 0.2)'] // Dark teal with transparency
        case 'medium': 
          return ['rgba(19, 47, 76, 0.6)', 'rgba(19, 47, 76, 0.4)']
        case 'strong': 
          return ['rgba(19, 47, 76, 0.8)', 'rgba(19, 47, 76, 0.6)']
      }
    } else {
      switch (intensity) {
        case 'light': 
          return ['rgba(255, 255, 255, 0.4)', 'rgba(255, 255, 255, 0.2)']
        case 'medium': 
          return ['rgba(255, 255, 255, 0.6)', 'rgba(255, 255, 255, 0.4)']
        case 'strong': 
          return ['rgba(255, 255, 255, 0.75)', 'rgba(255, 255, 255, 0.6)']
      }
    }
  }

  return (
    <View style={[styles.container, style]}>
      <LinearGradient
        colors={getColors() as [string, string, ...string[]]}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={[styles.border, isDark && styles.borderDark]} />
        <View style={styles.content}>{children}</View>
      </LinearGradient>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    borderRadius: borderRadius.xl,
    overflow: 'visible',
    // Enhanced Umbra-style soft shadow - more visible
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 6,
  },
  gradient: {
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    // Additional colored glow for depth
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
  },
  border: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  borderDark: {
    borderColor: 'rgba(0, 212, 255, 0.15)',
  },
  content: {
    padding: spacing.lg,
  },
})
