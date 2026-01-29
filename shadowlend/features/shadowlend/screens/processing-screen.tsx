import { View, Text, StyleSheet, Animated, Easing } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { colors, spacing, fontSize, fonts, borderRadius } from '@/constants/theme'
import { Icon, AnimatedBackground } from '@/components/ui'
import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'expo-router'
import { Pressable } from 'react-native'
import { useTheme } from '@/features/theme'
import { LinearGradient } from 'expo-linear-gradient'

export function ProcessingScreen() {
  const router = useRouter()
  const { isDark } = useTheme()
  const [progress, setProgress] = useState(0)
  const [currentStep, setCurrentStep] = useState(0)
  
  // Animations
  const pulseAnim = useRef(new Animated.Value(1)).current
  const rotateAnim = useRef(new Animated.Value(0)).current
  const glowAnim = useRef(new Animated.Value(0)).current
  const fadeAnim = useRef(new Animated.Value(0)).current
  const particleAnims = useRef([...Array(6)].map(() => new Animated.Value(0))).current

  const steps = [
    { label: 'Initializing MXE', icon: 'settings' },
    { label: 'Encrypting data', icon: 'lock' },
    { label: 'Generating proof', icon: 'verified-user' },
    { label: 'Finalizing transaction', icon: 'check-circle' },
  ]

  useEffect(() => {
    // Fade in
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start()

    // Pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.15,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start()

    // Rotation animation
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 3000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start()

    // Glow animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start()

    // Particle animations
    particleAnims.forEach((anim, index) => {
      Animated.loop(
        Animated.sequence([
          Animated.delay(index * 300),
          Animated.timing(anim, {
            toValue: 1,
            duration: 2000,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
        ])
      ).start()
    })

    // Progress simulation
    const interval = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev + 1.5
        
        // Update step based on progress
        if (newProgress >= 25 && currentStep < 1) setCurrentStep(1)
        if (newProgress >= 50 && currentStep < 2) setCurrentStep(2)
        if (newProgress >= 75 && currentStep < 3) setCurrentStep(3)
        
        if (newProgress >= 100) {
          clearInterval(interval)
          setTimeout(() => router.replace('/(tabs)' as any), 800)
          return 100
        }
        return newProgress
      })
    }, 80)

    return () => clearInterval(interval)
  }, [pulseAnim, rotateAnim, glowAnim, router])

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  })

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.8],
  })

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      <AnimatedBackground isDark={isDark} />
      
      {/* Background Gradient */}
      <LinearGradient
        colors={isDark 
          ? ['#0a0f1a', '#101822', '#0d1520'] 
          : ['#f0f4f8', '#e8eef5', '#f6f9fc']
        }
        style={styles.backgroundGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      <SafeAreaView style={styles.safeArea}>
        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
          {/* Animated Particles */}
          <View style={styles.particlesContainer}>
            {particleAnims.map((anim, index) => {
              const angle = (index * 60) * Math.PI / 180
              const radius = 100
              const translateY = anim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, -radius * Math.sin(angle)],
              })
              const translateX = anim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, radius * Math.cos(angle)],
              })
              
              return (
                <Animated.View
                  key={index}
                  style={[
                    styles.particle,
                    {
                      opacity: anim.interpolate({
                        inputRange: [0, 0.5, 1],
                        outputRange: [0, 1, 0],
                      }),
                      transform: [
                        { translateX },
                        { translateY },
                        { scale: anim },
                      ],
                    },
                  ]}
                />
              )
            })}
          </View>

          {/* Main Loader */}
          <View style={styles.loaderContainer}>
            {/* Outer rotating ring */}
            <Animated.View
              style={[
                styles.rotatingRing,
                isDark && styles.rotatingRingDark,
                { transform: [{ rotate: spin }] },
              ]}
            >
              <LinearGradient
                colors={['rgba(19, 109, 236, 0.8)', 'rgba(19, 109, 236, 0.2)', 'rgba(19, 109, 236, 0)']}
                style={styles.ringGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              />
            </Animated.View>

            {/* Pulsing glow */}
            <Animated.View
              style={[
                styles.glowCircle,
                {
                  opacity: glowOpacity,
                  transform: [{ scale: pulseAnim }],
                },
              ]}
            />

            {/* Center icon */}
            <View style={[styles.centerIcon, isDark && styles.centerIconDark]}>
              <Icon name="shield" size={48} color={colors.primary} />
            </View>
          </View>

          {/* Status Badge */}
          <View style={styles.statusBadge}>
            <Animated.View 
              style={[
                styles.statusDot,
                {
                  opacity: glowAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.5, 1],
                  }),
                },
              ]}
            />
            <Text style={styles.statusText}>ARCIUM MXE ACTIVE</Text>
          </View>

          {/* Title */}
          <Text style={[styles.title, isDark && styles.textDark]}>
            Processing Transaction
          </Text>
          <Text style={[styles.subtitle, isDark && styles.textSecondaryDark]}>
            {steps[currentStep].label}
          </Text>

          {/* Progress Bar */}
          <View style={styles.progressContainer}>
            <View style={styles.progressHeader}>
              <Text style={[styles.progressLabel, isDark && styles.textSecondaryDark]}>
                Progress
              </Text>
              <Text style={styles.progressValue}>{Math.round(progress)}%</Text>
            </View>
            <View style={[styles.progressTrack, isDark && styles.progressTrackDark]}>
              <Animated.View
                style={[
                  styles.progressFill,
                  {
                    width: `${progress}%`,
                  },
                ]}
              >
                <LinearGradient
                  colors={['#136dec', '#1a5fd4', '#136dec']}
                  style={styles.progressGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                />
              </Animated.View>
            </View>
          </View>

          {/* Steps */}
          <View style={styles.stepsContainer}>
            {steps.map((step, index) => (
              <View key={index} style={styles.stepItem}>
                <View
                  style={[
                    styles.stepIcon,
                    isDark && styles.stepIconDark,
                    index <= currentStep && styles.stepIconActive,
                  ]}
                >
                  {index < currentStep ? (
                    <Icon name="check" size={16} color={colors.white} />
                  ) : (
                    <Icon 
                      name={step.icon as any} 
                      size={16} 
                      color={index === currentStep ? colors.white : (isDark ? colors.dark.textSecondary : colors.textSecondary)} 
                    />
                  )}
                </View>
                <Text
                  style={[
                    styles.stepLabel,
                    isDark && styles.textSecondaryDark,
                    index <= currentStep && styles.stepLabelActive,
                  ]}
                >
                  {step.label}
                </Text>
              </View>
            ))}
          </View>

          {/* Privacy Note */}
          <View style={[styles.privacyNote, isDark && styles.privacyNoteDark]}>
            <Icon name="lock" size={16} color={colors.primary} />
            <Text style={[styles.privacyText, isDark && styles.textSecondaryDark]}>
              Your transaction is encrypted end-to-end
            </Text>
          </View>

          {/* Powered By Badge */}
          <View style={styles.poweredByContainer}>
            <Text style={[styles.poweredByLabel, isDark && styles.textSecondaryDark]}>
              POWERED BY
            </Text>
            <Text style={styles.arciumText}>arcium</Text>
            <Text style={[styles.arciumSubtext, isDark && styles.textSecondaryDark]}>
              Confidential Computing
            </Text>
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
  containerDark: {
    backgroundColor: colors.dark.background,
  },
  safeArea: {
    flex: 1,
  },
  textDark: {
    color: colors.dark.text,
  },
  textSecondaryDark: {
    color: colors.dark.textSecondary,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  particlesContainer: {
    position: 'absolute',
    width: 300,
    height: 300,
    alignItems: 'center',
    justifyContent: 'center',
  },
  particle: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  loaderContainer: {
    width: 180,
    height: 180,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  rotatingRing: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    overflow: 'hidden',
  },
  rotatingRingDark: {
    opacity: 0.9,
  },
  ringGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 90,
    borderWidth: 3,
    borderColor: 'transparent',
  },
  glowCircle: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: colors.primary,
    opacity: 0.2,
  },
  centerIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 24,
    elevation: 12,
    borderWidth: 4,
    borderColor: 'rgba(19, 109, 236, 0.1)',
  },
  centerIconDark: {
    backgroundColor: colors.dark.card,
    borderColor: 'rgba(19, 109, 236, 0.2)',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
  },
  statusText: {
    color: colors.primary,
    fontSize: fontSize.xs,
    fontFamily: fonts.bold,
    letterSpacing: 1.5,
  },
  title: {
    color: colors.textPrimary,
    fontSize: fontSize.xxxl,
    fontFamily: fonts.bold,
    textAlign: 'center',
    marginBottom: spacing.xs,
    letterSpacing: -0.5,
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: fontSize.md,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  progressContainer: {
    width: '100%',
    maxWidth: 340,
    marginBottom: spacing.xl,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  progressLabel: {
    color: colors.textSecondary,
    fontSize: fontSize.xs,
    fontFamily: fonts.semiBold,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  progressValue: {
    color: colors.primary,
    fontSize: fontSize.xl,
    fontFamily: fonts.bold,
  },
  progressTrack: {
    height: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  progressTrackDark: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  progressFill: {
    height: '100%',
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  progressGradient: {
    width: '100%',
    height: '100%',
  },
  stepsContainer: {
    width: '100%',
    maxWidth: 340,
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  stepIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepIconDark: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  stepIconActive: {
    backgroundColor: colors.primary,
  },
  stepLabel: {
    flex: 1,
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    fontFamily: fonts.medium,
  },
  stepLabelActive: {
    color: colors.primary,
    fontFamily: fonts.semiBold,
  },
  privacyNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: 'rgba(19, 109, 236, 0.08)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    marginBottom: spacing.xl,
  },
  privacyNoteDark: {
    backgroundColor: 'rgba(19, 109, 236, 0.15)',
  },
  privacyText: {
    color: colors.textSecondary,
    fontSize: fontSize.xs,
    fontFamily: fonts.medium,
  },
  poweredByContainer: {
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.md,
  },
  poweredByLabel: {
    color: colors.textSecondary,
    fontSize: 10,
    fontFamily: fonts.medium,
    letterSpacing: 2,
    opacity: 0.6,
  },
  arciumText: {
    color: colors.primary,
    fontSize: 32,
    fontFamily: fonts.bold,
    letterSpacing: 2,
    textTransform: 'lowercase',
  },
  arciumSubtext: {
    color: colors.textSecondary,
    fontSize: fontSize.xs,
    fontFamily: fonts.medium,
    textAlign: 'center',
    opacity: 0.8,
  },
})
