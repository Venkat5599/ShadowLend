import React, { useEffect, useRef } from 'react'
import { View, Text, StyleSheet, Animated, Easing } from 'react-native'
import { colors, fonts, fontSize, spacing, borderRadius } from '@/constants/theme'
import { Icon } from './icon'

interface PrivacyShieldAnimationProps {
  isActive: boolean
  amount?: string
  token?: string
  isDark?: boolean
}

export function PrivacyShieldAnimation({ 
  isActive, 
  amount = '0', 
  token = 'USDC',
  isDark = false 
}: PrivacyShieldAnimationProps) {
  const shieldScale = useRef(new Animated.Value(0)).current
  const shieldOpacity = useRef(new Animated.Value(0)).current
  const encryptAnim = useRef(new Animated.Value(0)).current
  const particleAnims = useRef([...Array(8)].map(() => ({
    x: new Animated.Value(0),
    y: new Animated.Value(0),
    opacity: new Animated.Value(0),
  }))).current
  const pulseAnim = useRef(new Animated.Value(1)).current
  const lockRotate = useRef(new Animated.Value(0)).current

  useEffect(() => {
    if (isActive) {
      // Shield entrance
      Animated.sequence([
        Animated.parallel([
          Animated.spring(shieldScale, {
            toValue: 1,
            friction: 6,
            tension: 80,
            useNativeDriver: true,
          }),
          Animated.timing(shieldOpacity, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
        ]),
        // Encryption effect
        Animated.timing(encryptAnim, {
          toValue: 1,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]).start()

      // Particle animations
      particleAnims.forEach((particle, index) => {
        const angle = (index / 8) * Math.PI * 2
        const delay = index * 100

        Animated.loop(
          Animated.sequence([
            Animated.delay(delay),
            Animated.parallel([
              Animated.timing(particle.x, {
                toValue: Math.cos(angle) * 60,
                duration: 1500,
                easing: Easing.out(Easing.ease),
                useNativeDriver: true,
              }),
              Animated.timing(particle.y, {
                toValue: Math.sin(angle) * 60,
                duration: 1500,
                easing: Easing.out(Easing.ease),
                useNativeDriver: true,
              }),
              Animated.sequence([
                Animated.timing(particle.opacity, {
                  toValue: 1,
                  duration: 300,
                  useNativeDriver: true,
                }),
                Animated.timing(particle.opacity, {
                  toValue: 0,
                  duration: 1200,
                  useNativeDriver: true,
                }),
              ]),
            ]),
            Animated.parallel([
              Animated.timing(particle.x, { toValue: 0, duration: 0, useNativeDriver: true }),
              Animated.timing(particle.y, { toValue: 0, duration: 0, useNativeDriver: true }),
            ]),
          ])
        ).start()
      })

      // Pulse animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ).start()

      // Lock rotation
      Animated.loop(
        Animated.timing(lockRotate, {
          toValue: 1,
          duration: 3000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start()
    }
  }, [isActive])

  const encryptedAmount = encryptAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [amount, '●●●●●', '🔒 Encrypted'],
  })

  const lockSpin = lockRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  })

  if (!isActive) return null

  return (
    <View style={styles.container}>
      {/* Particles */}
      {particleAnims.map((particle, index) => (
        <Animated.View
          key={index}
          style={[
            styles.particle,
            {
              opacity: particle.opacity,
              transform: [
                { translateX: particle.x },
                { translateY: particle.y },
              ],
            },
          ]}
        />
      ))}

      {/* Shield */}
      <Animated.View
        style={[
          styles.shieldContainer,
          {
            opacity: shieldOpacity,
            transform: [
              { scale: shieldScale },
              { scale: pulseAnim },
            ],
          },
        ]}
      >
        <View style={[styles.shieldOuter, isDark && styles.shieldOuterDark]}>
          <View style={[styles.shieldInner, isDark && styles.shieldInnerDark]}>
            <Animated.View style={{ transform: [{ rotate: lockSpin }] }}>
              <Icon name="lock" size={32} color={colors.primary} />
            </Animated.View>
          </View>
        </View>
      </Animated.View>

      {/* Encryption Status */}
      <View style={styles.statusContainer}>
        <Text style={[styles.statusLabel, isDark && styles.textSecondaryDark]}>
          Encrypting with Arcium MXE
        </Text>
        <View style={styles.amountContainer}>
          <Text style={[styles.tokenText, isDark && styles.textDark]}>{token}</Text>
          <Animated.Text style={[styles.amountText, isDark && styles.textDark]}>
            {amount}
          </Animated.Text>
        </View>
        <View style={styles.progressBar}>
          <Animated.View 
            style={[
              styles.progressFill,
              {
                width: encryptAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0%', '100%'],
                }),
              },
            ]} 
          />
        </View>
        <Text style={styles.encryptedLabel}>🔒 Privacy Protected</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl,
  },
  particle: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  shieldContainer: {
    marginBottom: spacing.lg,
  },
  shieldOuter: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(19, 109, 236, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shieldOuterDark: {
    backgroundColor: 'rgba(19, 109, 236, 0.2)',
  },
  shieldInner: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(19, 109, 236, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shieldInnerDark: {
    backgroundColor: 'rgba(19, 109, 236, 0.3)',
  },
  statusContainer: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  statusLabel: {
    fontSize: fontSize.sm,
    fontFamily: fonts.medium,
    color: colors.textSecondary,
  },
  textSecondaryDark: {
    color: colors.dark.textSecondary,
  },
  textDark: {
    color: colors.dark.text,
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.xs,
  },
  tokenText: {
    fontSize: fontSize.lg,
    fontFamily: fonts.semiBold,
    color: colors.textPrimary,
  },
  amountText: {
    fontSize: 28,
    fontFamily: fonts.bold,
    color: colors.textPrimary,
  },
  progressBar: {
    width: 200,
    height: 4,
    backgroundColor: 'rgba(19, 109, 236, 0.2)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
  encryptedLabel: {
    fontSize: fontSize.sm,
    fontFamily: fonts.semiBold,
    color: colors.success,
    marginTop: spacing.xs,
  },
})
