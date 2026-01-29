import { View, StyleSheet } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { MaterialIcons } from '@expo/vector-icons'
import { colors, borderRadius } from '@/constants/theme'

interface TabIconProps {
  name: keyof typeof MaterialIcons.glyphMap
  focused: boolean
  isDark?: boolean
}

export function TabIcon({ name, focused, isDark }: TabIconProps) {
  const getGradientColors = () => {
    if (!focused) {
      return isDark 
        ? ['rgba(144, 202, 249, 0.2)', 'rgba(144, 202, 249, 0.1)']
        : ['rgba(76, 108, 154, 0.2)', 'rgba(76, 108, 154, 0.1)']
    }

    // Different gradients for each icon when focused
    switch (name) {
      case 'home':
      case 'home-filled':
        return isDark 
          ? ['#00d4ff', '#0099cc'] // Cyan gradient
          : ['#136dec', '#0d5ac4'] // Blue gradient
      case 'savings':
        return isDark
          ? ['#00d4ff', '#00a8cc'] // Cyan gradient
          : ['#136dec', '#1a5fd4'] // Blue gradient
      case 'account-balance-wallet':
        return isDark
          ? ['#1e88e5', '#1565c0'] // Blue gradient
          : ['#136dec', '#0d5ac4'] // Blue gradient
      case 'show-chart':
      case 'history':
        return isDark
          ? ['#0a7ea4', '#0d5ac4'] // Teal to blue
          : ['#136dec', '#1a5fd4'] // Blue gradient
      case 'person':
      case 'person-outline':
        return isDark
          ? ['#00d4ff', '#0099cc'] // Cyan gradient
          : ['#136dec', '#0d5ac4'] // Blue gradient
      default:
        return isDark
          ? ['#00d4ff', '#0099cc']
          : ['#136dec', '#0d5ac4']
    }
  }

  const iconColor = focused 
    ? '#ffffff' 
    : isDark 
      ? colors.dark.textSecondary 
      : colors.textSecondary

  if (!focused) {
    // Simple icon when not focused
    return (
      <View style={styles.container}>
        <MaterialIcons name={name} size={26} color={iconColor} />
      </View>
    )
  }

  // Premium 3D gradient icon when focused
  return (
    <View style={styles.container}>
      <View style={[styles.iconWrapper, focused && styles.iconWrapperFocused]}>
        <LinearGradient
          colors={getGradientColors() as [string, string, ...string[]]}
          style={styles.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.iconInner}>
            <MaterialIcons name={name} size={26} color={iconColor} />
          </View>
        </LinearGradient>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 56,
    height: 40,
  },
  iconWrapper: {
    borderRadius: borderRadius.lg, // Changed from xl for tighter fit
    overflow: 'hidden',
  },
  iconWrapperFocused: {
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  gradient: {
    borderRadius: borderRadius.lg,
  },
  iconInner: {
    paddingHorizontal: 10, // Reduced from 12
    paddingVertical: 6, // Reduced from 8
    alignItems: 'center',
    justifyContent: 'center',
  },
})
