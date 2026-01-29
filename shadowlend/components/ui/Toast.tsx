import { useEffect, useRef } from 'react'
import { View, Text, StyleSheet, Animated, Pressable } from 'react-native'
import { colors, spacing, fontSize, fonts, borderRadius } from '@/constants/theme'
import { Icon } from './icon'

interface ToastProps {
  message: string
  type?: 'success' | 'error' | 'info' | 'warning'
  visible: boolean
  onDismiss: () => void
  duration?: number
  isDark?: boolean
}

export function Toast({ 
  message, 
  type = 'info', 
  visible, 
  onDismiss, 
  duration = 3000,
  isDark 
}: ToastProps) {
  const translateY = useRef(new Animated.Value(-100)).current
  const opacity = useRef(new Animated.Value(0)).current

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start()

      const timer = setTimeout(() => {
        handleDismiss()
      }, duration)

      return () => clearTimeout(timer)
    }
  }, [visible])

  const handleDismiss = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => onDismiss())
  }

  if (!visible) return null

  const getIcon = () => {
    switch (type) {
      case 'success': return 'check-circle'
      case 'error': return 'error'
      case 'warning': return 'warning'
      default: return 'info'
    }
  }

  const getColor = () => {
    switch (type) {
      case 'success': return colors.success
      case 'error': return colors.error
      case 'warning': return colors.warning
      default: return colors.primary
    }
  }

  return (
    <Animated.View
      style={[
        styles.container,
        isDark && styles.containerDark,
        {
          transform: [{ translateY }],
          opacity,
        },
      ]}
    >
      <View style={[styles.iconContainer, { backgroundColor: `${getColor()}15` }]}>
        <Icon name={getIcon() as any} size={20} color={getColor()} />
      </View>
      <Text style={[styles.message, isDark && styles.messageDark]}>{message}</Text>
      <Pressable onPress={handleDismiss} style={styles.closeButton}>
        <Icon name="close" size={18} color={isDark ? colors.dark.textSecondary : colors.textSecondary} />
      </Pressable>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60,
    left: spacing.md,
    right: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.white,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.xl,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    zIndex: 9999,
  },
  containerDark: {
    backgroundColor: colors.dark.card,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  message: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: fontSize.sm,
    fontFamily: fonts.medium,
  },
  messageDark: {
    color: colors.dark.text,
  },
  closeButton: {
    padding: spacing.xs,
  },
})
