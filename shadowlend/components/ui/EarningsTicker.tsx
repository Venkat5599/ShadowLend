import React, { useEffect, useRef, useState } from 'react'
import { View, Text, StyleSheet, Animated, Easing } from 'react-native'
import { colors, fonts, fontSize, spacing, borderRadius } from '@/constants/theme'
import { Icon } from './icon'

interface EarningsTickerProps {
  depositedAmount: number
  apy: number // Annual percentage yield (e.g., 8.2 for 8.2%)
  token?: string
  isDark?: boolean
}

export function EarningsTicker({ 
  depositedAmount, 
  apy, 
  token = 'USDC',
  isDark = false 
}: EarningsTickerProps) {
  const [earnings, setEarnings] = useState(0)
  const pulseAnim = useRef(new Animated.Value(1)).current
  const glowAnim = useRef(new Animated.Value(0.5)).current

  // Calculate earnings per second
  const earningsPerSecond = (depositedAmount * (apy / 100)) / (365 * 24 * 60 * 60)

  useEffect(() => {
    if (depositedAmount <= 0) return

    // Update earnings every 100ms for smooth animation
    const interval = setInterval(() => {
      setEarnings(prev => prev + (earningsPerSecond * 0.1))
    }, 100)

    // Pulse animation when earnings update
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.02,
          duration: 500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start()

    // Glow animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 0.8,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0.5,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start()

    return () => clearInterval(interval)
  }, [depositedAmount, earningsPerSecond])

  const formatEarnings = (value: number) => {
    if (value < 0.000001) return '0.000000'
    if (value < 0.01) return value.toFixed(6)
    if (value < 1) return value.toFixed(4)
    return value.toFixed(2)
  }

  if (depositedAmount <= 0) return null

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      <Animated.View style={[styles.glowBackground, { opacity: glowAnim }]} />
      
      <View style={styles.header}>
        <View style={styles.liveIndicator}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>LIVE</Text>
        </View>
        <Text style={[styles.label, isDark && styles.textSecondaryDark]}>
          Earnings This Session
        </Text>
      </View>

      <Animated.View style={[styles.earningsRow, { transform: [{ scale: pulseAnim }] }]}>
        <Text style={styles.plusSign}>+</Text>
        <Text style={styles.earningsValue}>${formatEarnings(earnings)}</Text>
        <Text style={[styles.tokenLabel, isDark && styles.textSecondaryDark]}>{token}</Text>
      </Animated.View>

      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Icon name="trending-up" size={14} color={colors.success} />
          <Text style={[styles.statText, isDark && styles.textSecondaryDark]}>
            {apy}% APY
          </Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.statItem}>
          <Icon name="schedule" size={14} color={colors.primary} />
          <Text style={[styles.statText, isDark && styles.textSecondaryDark]}>
            ${(earningsPerSecond * 60 * 60 * 24).toFixed(4)}/day
          </Text>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(34, 197, 94, 0.08)',
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.2)',
    overflow: 'hidden',
  },
  containerDark: {
    backgroundColor: 'rgba(34, 197, 94, 0.12)',
    borderColor: 'rgba(34, 197, 94, 0.3)',
  },
  glowBackground: {
    position: 'absolute',
    top: -50,
    left: -50,
    right: -50,
    bottom: -50,
    backgroundColor: colors.success,
    borderRadius: 100,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(34, 197, 94, 0.2)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.success,
  },
  liveText: {
    fontSize: 10,
    fontFamily: fonts.bold,
    color: colors.success,
    letterSpacing: 1,
  },
  label: {
    fontSize: fontSize.xs,
    fontFamily: fonts.medium,
    color: colors.textSecondary,
  },
  textSecondaryDark: {
    color: colors.dark.textSecondary,
  },
  earningsRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: spacing.sm,
  },
  plusSign: {
    fontSize: 20,
    fontFamily: fonts.bold,
    color: colors.success,
    marginRight: 2,
  },
  earningsValue: {
    fontSize: 32,
    fontFamily: fonts.bold,
    color: colors.success,
    fontVariant: ['tabular-nums'],
  },
  tokenLabel: {
    fontSize: fontSize.sm,
    fontFamily: fonts.medium,
    color: colors.textSecondary,
    marginLeft: spacing.xs,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: fontSize.xs,
    fontFamily: fonts.medium,
    color: colors.textSecondary,
  },
  divider: {
    width: 1,
    height: 12,
    backgroundColor: 'rgba(34, 197, 94, 0.3)',
    marginHorizontal: spacing.md,
  },
})
