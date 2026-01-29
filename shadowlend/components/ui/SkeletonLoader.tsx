import { useEffect, useRef } from 'react'
import { View, StyleSheet, Animated, ViewStyle } from 'react-native'
import { colors, borderRadius } from '@/constants/theme'

interface SkeletonLoaderProps {
  width?: number | string
  height?: number
  borderRadius?: number
  style?: ViewStyle
  isDark?: boolean
}

export function SkeletonLoader({ 
  width = '100%', 
  height = 20, 
  borderRadius: radius = borderRadius.md,
  style,
  isDark 
}: SkeletonLoaderProps) {
  const shimmerAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start()
  }, [])

  const opacity = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  })

  return (
    <View style={[styles.container, { width, height, borderRadius: radius }, style]}>
      <Animated.View
        style={[
          styles.shimmer,
          isDark ? styles.shimmerDark : styles.shimmerLight,
          { opacity },
        ]}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    backgroundColor: colors.border,
  },
  shimmer: {
    width: '100%',
    height: '100%',
  },
  shimmerLight: {
    backgroundColor: colors.textMuted,
  },
  shimmerDark: {
    backgroundColor: colors.dark.border,
  },
})
