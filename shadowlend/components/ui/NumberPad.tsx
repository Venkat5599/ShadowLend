import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity, Platform, Dimensions } from 'react-native'
import { colors, fonts, spacing, borderRadius } from '@/constants/theme'
import { useTheme } from '@/features/theme'
import { Icon } from './icon'
import { haptics } from '@/utils/haptics'

const { width } = Dimensions.get('window')

interface NumberPadProps {
  onPress: (value: string) => void
  onDelete: () => void
  onDecimal?: () => void
  disabled?: boolean
}

export function NumberPad({ onPress, onDelete, onDecimal, disabled = false }: NumberPadProps) {
  const { isDark } = useTheme()
  
  // Only show on mobile/tablet, not desktop
  if (Platform.OS === 'web' && width > 768) {
    return null
  }

  const keys = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['.', '0', 'delete'],
  ]

  const handleKeyPress = (key: string) => {
    if (disabled) return
    
    // Add haptic feedback
    haptics.selection()
    
    if (key === 'delete') {
      onDelete()
    } else if (key === '.') {
      onDecimal?.()
    } else {
      onPress(key)
    }
  }

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      {keys.map((row, rowIndex) => (
        <View key={rowIndex} style={styles.row}>
          {row.map((key) => (
            <TouchableOpacity
              key={key}
              style={[
                styles.key,
                isDark && styles.keyDark,
                disabled && styles.keyDisabled,
              ]}
              onPress={() => handleKeyPress(key)}
              activeOpacity={0.6}
              disabled={disabled}
            >
              {key === 'delete' ? (
                <Icon 
                  name="backspace" 
                  size={24} 
                  color={isDark ? colors.dark.text : colors.textPrimary} 
                />
              ) : (
                <Text style={[
                  styles.keyText,
                  isDark && styles.keyTextDark,
                  disabled && styles.keyTextDisabled,
                ]}>
                  {key}
                </Text>
              )}
            </TouchableOpacity>
          ))}
        </View>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.backgroundLight,
  },
  containerDark: {
    backgroundColor: colors.dark.background,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: spacing.sm,
  },
  key: {
    flex: 1,
    aspectRatio: 1.8,
    maxHeight: 56,
    marginHorizontal: spacing.xs,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.lg,
    backgroundColor: 'transparent',
  },
  keyDark: {
    backgroundColor: 'transparent',
  },
  keyDisabled: {
    opacity: 0.4,
  },
  keyText: {
    fontSize: 28,
    fontFamily: fonts.semiBold,
    color: colors.textPrimary,
  },
  keyTextDark: {
    color: colors.dark.text,
  },
  keyTextDisabled: {
    color: colors.textMuted,
  },
})
