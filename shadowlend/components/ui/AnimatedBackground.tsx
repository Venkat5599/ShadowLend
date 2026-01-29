import { useEffect, useRef } from 'react'
import { View, StyleSheet, Animated, Dimensions } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'

const { height } = Dimensions.get('window')

interface AnimatedBackgroundProps {
  isDark?: boolean
}

export function AnimatedBackground({ isDark }: AnimatedBackgroundProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: false, // Changed to false for opacity on View
    }).start()
  }, [])

  return (
    <View style={styles.container} pointerEvents="none">
      {/* Top Gradient Bar - Umbra Style - Subtle but visible */}
      <Animated.View style={[styles.topGradient, { opacity: 1 }]}>
        <LinearGradient
          colors={
            isDark
              ? ['rgba(0, 212, 255, 0.15)', 'rgba(0, 212, 255, 0.08)', 'rgba(0, 212, 255, 0)']
              : ['rgba(19, 109, 236, 0.9)', 'rgba(19, 109, 236, 0.6)', 'rgba(19, 109, 236, 0.3)', 'rgba(19, 109, 236, 0)']
          }
          style={styles.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
        />
      </Animated.View>

      {/* Bottom Gradient */}
      <Animated.View style={[styles.bottomGradient, { opacity: 1 }]}>
        <LinearGradient
          colors={
            isDark
              ? ['rgba(0, 0, 0, 0)', 'rgba(10, 126, 164, 0.08)', 'rgba(10, 126, 164, 0.12)']
              : ['rgba(0, 0, 0, 0)', 'rgba(34, 197, 94, 0.3)', 'rgba(34, 197, 94, 0.5)']
          }
          style={styles.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
        />
      </Animated.View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
    zIndex: 0,
  },
  topGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: height * 0.5, // Increased to 50% of screen
    zIndex: 0,
  },
  bottomGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: height * 0.3, // Increased to 30% of screen
    zIndex: 0,
  },
  gradient: {
    width: '100%',
    height: '100%',
  },
})
