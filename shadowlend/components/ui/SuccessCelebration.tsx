import React, { useEffect, useRef } from 'react'
import { View, Text, StyleSheet, Animated, Easing, Dimensions } from 'react-native'
import { colors, fonts, fontSize, spacing, borderRadius } from '@/constants/theme'
import { Icon } from './icon'

const { width, height } = Dimensions.get('window')

interface SuccessCelebrationProps {
  isVisible: boolean
  amount?: string
  token?: string
  action?: 'deposit' | 'withdraw' | 'borrow' | 'repay'
  isDark?: boolean
}

const CONFETTI_COLORS = ['#6C5CE7', '#00D4AA', '#FFD93D', '#FF6B6B', '#4ECDC4', '#A29BFE']

export function SuccessCelebration({ 
  isVisible, 
  amount = '0',
  token = 'USDC',
  action = 'deposit',
  isDark = false 
}: SuccessCelebrationProps) {
  const scaleAnim = useRef(new Animated.Value(0)).current
  const opacityAnim = useRef(new Animated.Value(0)).current
  const checkAnim = useRef(new Animated.Value(0)).current
  const ringAnim = useRef(new Animated.Value(0)).current
  const confettiAnims = useRef([...Array(20)].map(() => ({
    x: new Animated.Value(0),
    y: new Animated.Value(0),
    rotate: new Animated.Value(0),
    opacity: new Animated.Value(0),
  }))).current

  useEffect(() => {
    if (isVisible) {
      // Main animation sequence
      Animated.sequence([
        Animated.parallel([
          Animated.spring(scaleAnim, {
            toValue: 1,
            friction: 5,
            tension: 100,
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
        ]),
        Animated.spring(checkAnim, {
          toValue: 1,
          friction: 4,
          useNativeDriver: true,
        }),
      ]).start()

      // Ring expansion
      Animated.loop(
        Animated.sequence([
          Animated.timing(ringAnim, {
            toValue: 1,
            duration: 1500,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(ringAnim, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
        ])
      ).start()

      // Confetti animations
      confettiAnims.forEach((confetti, index) => {
        const startX = (Math.random() - 0.5) * 100
        const endX = (Math.random() - 0.5) * width
        const endY = height * 0.6 + Math.random() * 200
        const delay = Math.random() * 500

        Animated.sequence([
          Animated.delay(delay),
          Animated.parallel([
            Animated.timing(confetti.x, {
              toValue: endX,
              duration: 2000 + Math.random() * 1000,
              easing: Easing.out(Easing.quad),
              useNativeDriver: true,
            }),
            Animated.timing(confetti.y, {
              toValue: endY,
              duration: 2000 + Math.random() * 1000,
              easing: Easing.in(Easing.quad),
              useNativeDriver: true,
            }),
            Animated.timing(confetti.rotate, {
              toValue: Math.random() * 10,
              duration: 2000,
              useNativeDriver: true,
            }),
            Animated.sequence([
              Animated.timing(confetti.opacity, {
                toValue: 1,
                duration: 200,
                useNativeDriver: true,
              }),
              Animated.delay(1500),
              Animated.timing(confetti.opacity, {
                toValue: 0,
                duration: 500,
                useNativeDriver: true,
              }),
            ]),
          ]),
        ]).start()
      })
    }
  }, [isVisible])

  if (!isVisible) return null

  const getActionText = () => {
    switch (action) {
      case 'deposit': return 'Deposited'
      case 'withdraw': return 'Withdrawn'
      case 'borrow': return 'Borrowed'
      case 'repay': return 'Repaid'
      default: return 'Completed'
    }
  }

  return (
    <View style={styles.container}>
      {/* Confetti */}
      {confettiAnims.map((confetti, index) => (
        <Animated.View
          key={index}
          style={[
            styles.confetti,
            {
              backgroundColor: CONFETTI_COLORS[index % CONFETTI_COLORS.length],
              width: 8 + Math.random() * 8,
              height: 8 + Math.random() * 8,
              borderRadius: Math.random() > 0.5 ? 100 : 2,
              opacity: confetti.opacity,
              transform: [
                { translateX: confetti.x },
                { translateY: confetti.y },
                { rotate: confetti.rotate.interpolate({
                  inputRange: [0, 10],
                  outputRange: ['0deg', '3600deg'],
                })},
              ],
            },
          ]}
        />
      ))}

      {/* Success Circle */}
      <Animated.View
        style={[
          styles.successContainer,
          {
            opacity: opacityAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        {/* Expanding Ring */}
        <Animated.View
          style={[
            styles.ring,
            {
              opacity: ringAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.5, 0],
              }),
              transform: [
                { scale: ringAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [1, 2],
                })},
              ],
            },
          ]}
        />

        <View style={styles.successCircle}>
          <Animated.View style={{ transform: [{ scale: checkAnim }] }}>
            <Icon name="check" size={48} color={colors.white} />
          </Animated.View>
        </View>
      </Animated.View>

      {/* Success Text */}
      <Animated.View style={[styles.textContainer, { opacity: opacityAnim }]}>
        <Text style={[styles.successTitle, isDark && styles.textDark]}>
          {getActionText()} Successfully!
        </Text>
        <View style={styles.amountRow}>
          <Text style={styles.amountValue}>{amount}</Text>
          <Text style={[styles.tokenText, isDark && styles.textSecondaryDark]}>{token}</Text>
        </View>
        <View style={styles.privacyBadge}>
          <Icon name="lock" size={14} color={colors.success} />
          <Text style={styles.privacyText}>Privacy Protected</Text>
        </View>
      </Animated.View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl,
  },
  confetti: {
    position: 'absolute',
    top: 0,
  },
  successContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  ring: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: colors.success,
  },
  successCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.success,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.success,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 10,
  },
  textContainer: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  successTitle: {
    fontSize: fontSize.xxl,
    fontFamily: fonts.bold,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  textDark: {
    color: colors.dark.text,
  },
  textSecondaryDark: {
    color: colors.dark.textSecondary,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.xs,
  },
  amountValue: {
    fontSize: 36,
    fontFamily: fonts.bold,
    color: colors.success,
  },
  tokenText: {
    fontSize: fontSize.lg,
    fontFamily: fonts.semiBold,
    color: colors.textSecondary,
  },
  privacyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    marginTop: spacing.sm,
  },
  privacyText: {
    fontSize: fontSize.sm,
    fontFamily: fonts.semiBold,
    color: colors.success,
  },
})
