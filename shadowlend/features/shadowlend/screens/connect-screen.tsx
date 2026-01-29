import { View, Text, StyleSheet, Animated, Easing, Pressable } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
import { colors, spacing, fontSize, borderRadius, fonts } from '@/constants/theme'
import { Icon, ShadowLendLogo, AnimatedBackground } from '@/components/ui'
import { useEffect, useRef, useCallback, useState } from 'react'
import { useTheme } from '@/features/theme'
import { useWallet } from '@/features/account/use-wallet'
import { useRouter } from 'expo-router'

export function ConnectScreen() {
  const { connect, connecting, connected } = useWallet()
  const { isDark, toggleTheme } = useTheme()
  const router = useRouter()
  const [hasAttemptedConnect, setHasAttemptedConnect] = useState(false)

  useEffect(() => {
    if (hasAttemptedConnect && connected) {
      const timer = setTimeout(() => {
        router.replace('/(tabs)' as any)
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [connected, hasAttemptedConnect, router])

  const handleConnect = useCallback(async () => {
    setHasAttemptedConnect(true)
    await connect()
  }, [connect])
  
  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(40)).current
  const scaleAnim = useRef(new Animated.Value(0.8)).current
  const feature1Anim = useRef(new Animated.Value(0)).current
  const feature2Anim = useRef(new Animated.Value(0)).current
  const feature3Anim = useRef(new Animated.Value(0)).current
  const buttonAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    // Staggered entrance animations
    Animated.sequence([
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 1000,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
      ]),
      Animated.stagger(120, [
        Animated.spring(feature1Anim, { toValue: 1, friction: 8, useNativeDriver: true }),
        Animated.spring(feature2Anim, { toValue: 1, friction: 8, useNativeDriver: true }),
        Animated.spring(feature3Anim, { toValue: 1, friction: 8, useNativeDriver: true }),
      ]),
      Animated.spring(buttonAnim, { toValue: 1, friction: 6, useNativeDriver: true }),
    ]).start()
  }, [])

  const getFeatureStyle = (anim: Animated.Value) => ({
    opacity: anim,
    transform: [
      { translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [30, 0] }) },
      { scale: anim.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1] }) },
    ],
  })

  return (
    <View style={styles.container}>
      {/* Animated Background */}
      <AnimatedBackground isDark={isDark} />
      
      {/* Background Gradient */}
      <LinearGradient
        colors={isDark 
          ? ['#0a1929', '#132f4c', '#0d2137'] // Dark teal gradient
          : ['#f0f4f8', '#e8eef5', '#f6f9fc']
        }
        style={styles.backgroundGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      <SafeAreaView style={styles.safeArea}>
        {/* Theme Toggle */}
        <View style={styles.topBar}>
          <View style={styles.spacer} />
          <Pressable 
            style={[styles.themeButton, isDark && styles.themeButtonDark]} 
            onPress={toggleTheme}
          >
            <Icon 
              name={isDark ? 'light-mode' : 'dark-mode'} 
              size={20} 
              color={isDark ? colors.dark.text : colors.textPrimary} 
            />
          </Pressable>
        </View>

        <View style={styles.content}>
          {/* Logo - Clean, no glow */}
          <Animated.View 
            style={[
              styles.logoContainer,
              {
                opacity: fadeAnim,
                transform: [
                  { translateY: slideAnim },
                  { scale: scaleAnim },
                ],
              },
            ]}
          >
            <ShadowLendLogo size={110} color={colors.primary} />
          </Animated.View>

          {/* Title & Description */}
          <Animated.View 
            style={[
              styles.textContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <Text style={[styles.title, isDark && styles.textDark]}>ShadowLend</Text>
            <View style={styles.subtitleContainer}>
              <View style={styles.subtitleLine} />
              <Text style={styles.subtitle}>Private Lending on Solana</Text>
              <View style={styles.subtitleLine} />
            </View>
            <Text style={[styles.description, isDark && styles.textSecondaryDark]}>
              Access liquidity while keeping your financial data private using Arcium's confidential computing network.
            </Text>
          </Animated.View>

          {/* Feature Cards */}
          <View style={styles.features}>
            <Animated.View style={[styles.featureItem, isDark && styles.featureItemDark, getFeatureStyle(feature1Anim)]}>
              <View style={[styles.featureIcon, isDark && styles.featureIconDark]}>
                <Icon name="visibility-off" size={22} color={colors.primary} />
              </View>
              <View style={styles.featureText}>
                <Text style={[styles.featureTitle, isDark && styles.textDark]}>Private Positions</Text>
                <Text style={[styles.featureDescription, isDark && styles.textSecondaryDark]}>Your balances stay hidden</Text>
              </View>
              <View style={styles.featureCheck}>
                <Icon name="check-circle" size={20} color={colors.success} />
              </View>
            </Animated.View>

            <Animated.View style={[styles.featureItem, isDark && styles.featureItemDark, getFeatureStyle(feature2Anim)]}>
              <View style={[styles.featureIcon, isDark && styles.featureIconDark]}>
                <Icon name="lock" size={22} color={colors.primary} />
              </View>
              <View style={styles.featureText}>
                <Text style={[styles.featureTitle, isDark && styles.textDark]}>Secure Computation</Text>
                <Text style={[styles.featureDescription, isDark && styles.textSecondaryDark]}>MXE-powered calculations</Text>
              </View>
              <View style={styles.featureCheck}>
                <Icon name="check-circle" size={20} color={colors.success} />
              </View>
            </Animated.View>

            <Animated.View style={[styles.featureItem, isDark && styles.featureItemDark, getFeatureStyle(feature3Anim)]}>
              <View style={[styles.featureIcon, isDark && styles.featureIconDark]}>
                <Icon name="verified" size={22} color={colors.primary} />
              </View>
              <View style={styles.featureText}>
                <Text style={[styles.featureTitle, isDark && styles.textDark]}>Attestation Verified</Text>
                <Text style={[styles.featureDescription, isDark && styles.textSecondaryDark]}>Trustless proof system</Text>
              </View>
              <View style={styles.featureCheck}>
                <Icon name="check-circle" size={20} color={colors.success} />
              </View>
            </Animated.View>
          </View>
        </View>

        {/* Footer */}
        <Animated.View 
          style={[
            styles.footer, 
            isDark && styles.footerDark,
            {
              opacity: buttonAnim,
              transform: [
                { translateY: buttonAnim.interpolate({ inputRange: [0, 1], outputRange: [50, 0] }) },
              ],
            },
          ]}
        >
          <Pressable
            style={[styles.connectButton, connecting && styles.connectButtonDisabled]}
            onPress={handleConnect}
            disabled={connecting}
          >
            <LinearGradient
              colors={connecting 
                ? ['#666', '#555'] 
                : isDark 
                  ? ['#00d4ff', '#00a8cc'] // Bright cyan gradient in dark mode
                  : [colors.primary, '#1a5fd4']
              }
              style={styles.connectButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Icon 
                name="account-balance-wallet" 
                size={22} 
                color={colors.white} 
              />
              <Text style={styles.connectButtonText}>
                {connecting ? "Connecting..." : "Connect Wallet"}
              </Text>
            </LinearGradient>
          </Pressable>
          
          <View style={styles.poweredByContainer}>
            <View style={styles.poweredByDot} />
            <Text style={styles.footerText}>Powered by Arcium MXE Network</Text>
          </View>
        </Animated.View>
      </SafeAreaView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  safeArea: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  spacer: {
    width: 44,
  },
  themeButton: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.full,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  themeButtonDark: {
    backgroundColor: 'rgba(30, 41, 59, 0.9)',
  },
  textDark: {
    color: colors.dark.text,
  },
  textSecondaryDark: {
    color: colors.dark.textSecondary,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 42,
    fontFamily: fonts.bold,
    marginBottom: spacing.sm,
    letterSpacing: -1,
  },
  subtitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  subtitleLine: {
    width: 24,
    height: 2,
    backgroundColor: colors.primary,
    borderRadius: 1,
  },
  subtitle: {
    color: colors.primary,
    fontSize: fontSize.lg,
    fontFamily: fonts.semiBold,
  },
  description: {
    color: colors.textSecondary,
    fontSize: fontSize.md,
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 320,
  },
  features: {
    gap: spacing.sm,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    padding: spacing.md,
    paddingVertical: spacing.md + 4,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.04)',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  featureItemDark: {
    backgroundColor: 'rgba(30, 41, 59, 0.9)',
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureIconDark: {
    backgroundColor: 'rgba(19, 109, 236, 0.2)',
  },
  featureText: {
    flex: 1,
    gap: 2,
  },
  featureTitle: {
    color: colors.textPrimary,
    fontSize: fontSize.md,
    fontFamily: fonts.semiBold,
  },
  featureDescription: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
  },
  featureCheck: {
    opacity: 0.9,
  },
  footer: {
    padding: spacing.lg,
    paddingBottom: spacing.xl,
    gap: spacing.md,
  },
  footerDark: {
    // No background needed with gradient
  },
  connectButton: {
    borderRadius: borderRadius.full, // Pill-shaped
    overflow: 'hidden',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
  connectButtonDisabled: {
    shadowOpacity: 0.1,
  },
  connectButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md + 4,
    paddingHorizontal: spacing.xl,
  },
  connectButtonText: {
    color: colors.white,
    fontSize: fontSize.lg,
    fontFamily: fonts.bold,
    letterSpacing: 0.3,
  },
  poweredByContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  poweredByDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#00D4AA',
  },
  footerText: {
    color: '#00D4AA',
    fontSize: fontSize.xs,
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    fontFamily: fonts.medium,
  },
})
