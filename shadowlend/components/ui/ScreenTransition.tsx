import React, { useEffect, useRef } from 'react'
import { Animated, ViewStyle } from 'react-native'

interface ScreenTransitionProps {
  children: React.ReactNode
  style?: ViewStyle
}

export function ScreenTransition({ children, style }: ScreenTransitionProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(20)).current

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 9,
        tension: 50,
        useNativeDriver: true,
      }),
    ]).start()
  }, [])

  return (
    <Animated.View
      style={[
        style,
        {
          flex: 1,
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      {children}
    </Animated.View>
  )
}
