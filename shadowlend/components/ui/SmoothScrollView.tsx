import React from 'react'
import { ScrollView, ScrollViewProps, Platform } from 'react-native'

interface SmoothScrollViewProps extends ScrollViewProps {
  children: React.ReactNode
}

export function SmoothScrollView({ children, ...props }: SmoothScrollViewProps) {
  return (
    <ScrollView
      {...props}
      // Enable smooth scrolling on all platforms
      scrollEventThrottle={16} // 60fps
      decelerationRate="fast"
      bounces={true}
      bouncesZoom={false}
      alwaysBounceVertical={true}
      showsVerticalScrollIndicator={false}
      // iOS specific optimizations
      {...(Platform.OS === 'ios' && {
        scrollIndicatorInsets: { right: 1 },
      })}
      // Android specific optimizations
      {...(Platform.OS === 'android' && {
        overScrollMode: 'always',
        nestedScrollEnabled: true,
      })}
    >
      {children}
    </ScrollView>
  )
}
