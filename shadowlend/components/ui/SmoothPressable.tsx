import { Pressable, PressableProps, Animated, ViewStyle } from 'react-native'
import { useRef } from 'react'

interface SmoothPressableProps extends PressableProps {
  children: React.ReactNode
  style?: ViewStyle | ViewStyle[]
  scaleValue?: number
}

/**
 * Umbra-style smooth pressable with subtle scale animation
 */
export function SmoothPressable({ 
  children, 
  style, 
  scaleValue = 0.97,
  ...props 
}: SmoothPressableProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: scaleValue,
      useNativeDriver: true,
      speed: 50,
      bounciness: 0,
    }).start()
  }

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start()
  }

  return (
    <Pressable
      {...props}
      onPressIn={(e) => {
        handlePressIn()
        props.onPressIn?.(e)
      }}
      onPressOut={(e) => {
        handlePressOut()
        props.onPressOut?.(e)
      }}
    >
      <Animated.View style={[style, { transform: [{ scale: scaleAnim }] }]}>
        {children}
      </Animated.View>
    </Pressable>
  )
}
