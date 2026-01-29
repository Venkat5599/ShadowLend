import React, { useEffect, useRef } from 'react'
import { View, Text, StyleSheet, Animated, Easing } from 'react-native'
import { colors, fonts, fontSize, spacing, borderRadius } from '@/constants/theme'
import { Icon } from './icon'

type TransactionStep = 'preparing' | 'encrypting' | 'processing' | 'confirming' | 'complete'

interface TransactionProgressProps {
  currentStep: TransactionStep
  isDark?: boolean
}

const STEPS: { key: TransactionStep; label: string; icon: string }[] = [
  { key: 'preparing', label: 'Preparing', icon: 'hourglass-empty' },
  { key: 'encrypting', label: 'Encrypting', icon: 'lock' },
  { key: 'processing', label: 'Processing', icon: 'sync' },
  { key: 'confirming', label: 'Confirming', icon: 'verified' },
  { key: 'complete', label: 'Complete', icon: 'check-circle' },
]

export function TransactionProgress({ currentStep, isDark = false }: TransactionProgressProps) {
  const progressAnim = useRef(new Animated.Value(0)).current
  const pulseAnims = useRef(STEPS.map(() => new Animated.Value(1))).current
  const spinAnim = useRef(new Animated.Value(0)).current

  const currentIndex = STEPS.findIndex(s => s.key === currentStep)

  useEffect(() => {
    // Progress bar animation
    Animated.timing(progressAnim, {
      toValue: (currentIndex + 1) / STEPS.length,
      duration: 500,
      easing: Easing.out(Easing.ease),
      useNativeDriver: false,
    }).start()

    // Pulse animation for current step
    if (currentStep !== 'complete') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnims[currentIndex], {
            toValue: 1.2,
            duration: 600,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnims[currentIndex], {
            toValue: 1,
            duration: 600,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ).start()
    }

    // Spin animation for processing icon
    if (currentStep === 'processing') {
      Animated.loop(
        Animated.timing(spinAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start()
    }
  }, [currentStep, currentIndex])

  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  })

  const getStepStatus = (index: number) => {
    if (index < currentIndex) return 'complete'
    if (index === currentIndex) return 'active'
    return 'pending'
  }

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      {/* Progress Bar */}
      <View style={styles.progressBarContainer}>
        <View style={[styles.progressBarBg, isDark && styles.progressBarBgDark]} />
        <Animated.View 
          style={[
            styles.progressBarFill,
            {
              width: progressAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ['0%', '100%'],
              }),
            },
          ]} 
        />
      </View>

      {/* Steps */}
      <View style={styles.stepsContainer}>
        {STEPS.map((step, index) => {
          const status = getStepStatus(index)
          const isActive = status === 'active'
          const isComplete = status === 'complete'

          return (
            <View key={step.key} style={styles.stepItem}>
              <Animated.View
                style={[
                  styles.stepIcon,
                  isComplete && styles.stepIconComplete,
                  isActive && styles.stepIconActive,
                  isDark && !isComplete && !isActive && styles.stepIconDark,
                  { transform: [{ scale: pulseAnims[index] }] },
                ]}
              >
                {step.key === 'processing' && isActive ? (
                  <Animated.View style={{ transform: [{ rotate: spin }] }}>
                    <Icon 
                      name={step.icon as any} 
                      size={16} 
                      color={isComplete ? colors.white : isActive ? colors.white : colors.textMuted} 
                    />
                  </Animated.View>
                ) : (
                  <Icon 
                    name={(isComplete ? 'check' : step.icon) as any} 
                    size={16} 
                    color={isComplete ? colors.white : isActive ? colors.white : colors.textMuted} 
                  />
                )}
              </Animated.View>
              <Text 
                style={[
                  styles.stepLabel,
                  isComplete && styles.stepLabelComplete,
                  isActive && styles.stepLabelActive,
                  isDark && styles.textSecondaryDark,
                ]}
              >
                {step.label}
              </Text>
            </View>
          )
        })}
      </View>

      {/* Current Status Message */}
      <View style={[styles.statusMessage, isDark && styles.statusMessageDark]}>
        <Icon 
          name={currentStep === 'complete' ? 'check-circle' : 'info'} 
          size={16} 
          color={currentStep === 'complete' ? colors.success : colors.primary} 
        />
        <Text style={[styles.statusText, isDark && styles.textSecondaryDark]}>
          {currentStep === 'preparing' && 'Preparing your transaction...'}
          {currentStep === 'encrypting' && 'Encrypting data with Arcium MXE...'}
          {currentStep === 'processing' && 'Processing on Solana network...'}
          {currentStep === 'confirming' && 'Waiting for confirmation...'}
          {currentStep === 'complete' && 'Transaction completed successfully!'}
        </Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  containerDark: {
    backgroundColor: colors.dark.card,
    borderColor: colors.dark.border,
  },
  progressBarContainer: {
    height: 4,
    borderRadius: 2,
    marginBottom: spacing.lg,
    overflow: 'hidden',
  },
  progressBarBg: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.border,
  },
  progressBarBgDark: {
    backgroundColor: colors.dark.border,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
  stepsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  stepItem: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  stepIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.backgroundLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepIconDark: {
    backgroundColor: colors.dark.background,
  },
  stepIconComplete: {
    backgroundColor: colors.success,
  },
  stepIconActive: {
    backgroundColor: colors.primary,
  },
  stepLabel: {
    fontSize: 10,
    fontFamily: fonts.medium,
    color: colors.textMuted,
    textAlign: 'center',
  },
  stepLabelComplete: {
    color: colors.success,
  },
  stepLabelActive: {
    color: colors.primary,
    fontFamily: fonts.semiBold,
  },
  textSecondaryDark: {
    color: colors.dark.textSecondary,
  },
  statusMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primaryLight,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
  },
  statusMessageDark: {
    backgroundColor: 'rgba(19, 109, 236, 0.15)',
  },
  statusText: {
    flex: 1,
    fontSize: fontSize.sm,
    fontFamily: fonts.medium,
    color: colors.textSecondary,
  },
})
