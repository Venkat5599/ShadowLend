import { View, Text, StyleSheet, ScrollView, Pressable, Animated, Easing, RefreshControl } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
import { colors, spacing, fontSize, borderRadius, fonts } from '@/constants/theme'
import { Button, Icon, ShadowLendLogo, EarningsTicker, GlassCard, MiniChart, AnimatedBackground } from '@/components/ui'
import { useRef, useEffect, useState } from 'react'
import { useRouter } from 'expo-router'
import { ConnectScreen } from './connect-screen'
import { useTheme } from '@/features/theme'
import { useWallet } from '@/features/account/use-wallet'
import { useUserObligation, useSolBalance } from '../hooks'

export function HomeScreen() {
  const router = useRouter()
  const { account, disconnect } = useWallet()
  const { isDark, toggleTheme } = useTheme()
  const [refreshing, setRefreshing] = useState(false)
  
  const { data: userPosition, isLoading: positionLoading } = useUserObligation()
  const { data: solBalance } = useSolBalance()

  // Generate mock chart data
  const [chartData] = useState(() => {
    const data = []
    for (let i = 0; i < 30; i++) {
      data.push(100 + Math.random() * 50 + i * 2)
    }
    return data
  })

  const handleDisconnect = async () => {
    await disconnect()
  }

  const onRefresh = async () => {
    setRefreshing(true)
    // Simulate refresh
    setTimeout(() => setRefreshing(false), 1500)
  }

  const depositedValue = userPosition?.depositedValueUsd ?? 0
  const borrowedValue = userPosition?.borrowedValueUsd ?? 0
  const totalPortfolioValue = depositedValue - borrowedValue
  const healthFactor = userPosition?.healthFactor ?? 999
  const isPositionSafe = healthFactor > 1.25

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(30)).current
  const cardAnim = useRef(new Animated.Value(0)).current
  const pulseAnim = useRef(new Animated.Value(1)).current
  const statsAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 600,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
      Animated.spring(cardAnim, {
        toValue: 1,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.spring(statsAnim, {
        toValue: 1,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start()

    // Pulse animation for status badge
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start()
  }, [])

  if (!account) {
    return <ConnectScreen />
  }

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      {/* Top Gradient Bar - Highly Visible */}
      <View style={styles.topGradientBar}>
        <LinearGradient
          colors={
            isDark
              ? ['rgba(0, 212, 255, 0.15)', 'rgba(0, 212, 255, 0.08)', 'transparent']
              : ['#136dec', '#4a90e2', 'transparent']
          }
          style={styles.gradientFill}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
        />
      </View>
      
      <SafeAreaView style={styles.safeArea} edges={['top']}>
      <Animated.View
        style={[
          styles.header,
          isDark && styles.headerDark,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <View style={styles.headerLeft}>
          <ShadowLendLogo size={32} color={colors.primary} />
          <Text style={[styles.welcomeText, isDark && styles.textSecondaryDark]}>Welcome to ShadowLend</Text>
        </View>
        <View style={styles.headerRight}>
          <Pressable style={[styles.themeButton, isDark && styles.themeButtonDark]} onPress={toggleTheme}>
            <Icon name={isDark ? 'light-mode' : 'dark-mode'} size={20} color={isDark ? colors.dark.text : colors.textPrimary} />
          </Pressable>
          <Pressable style={[styles.themeButton, isDark && styles.themeButtonDark]} onPress={handleDisconnect}>
            <Icon name="logout" size={20} color={colors.error} />
          </Pressable>
        </View>
      </Animated.View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        {/* Portfolio Card with Glass Effect */}
        <Animated.View
          style={{
            opacity: cardAnim,
            transform: [
              { scale: cardAnim.interpolate({ inputRange: [0, 1], outputRange: [0.95, 1] }) },
            ],
          }}
        >
          <GlassCard isDark={isDark} intensity="medium" style={styles.portfolioCard}>
            <View style={[styles.statusHeader, isDark && styles.statusHeaderDark, !isPositionSafe && styles.statusHeaderWarning]}>
              <Animated.View style={[styles.statusBadge, !isPositionSafe && styles.statusBadgeWarning, { transform: [{ scale: pulseAnim }] }]}>
                <Icon name={isPositionSafe ? "verified-user" : "warning"} size={28} color={isPositionSafe ? colors.success : colors.warning} />
              </Animated.View>
              <Text style={[styles.statusText, !isPositionSafe && styles.statusTextWarning]}>
                {positionLoading ? 'Loading...' : isPositionSafe ? 'Position Safe' : `Health: ${healthFactor.toFixed(2)}`}
              </Text>
            </View>

            <View style={styles.portfolioBody}>
              <Text style={[styles.portfolioLabel, isDark && styles.textSecondaryDark]}>Total Portfolio Value</Text>
              <Text style={[styles.portfolioValue, isDark && styles.textDark]}>
                ${totalPortfolioValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </Text>
              {solBalance && (
                <View style={styles.portfolioChange}>
                  <Icon name="account-balance-wallet" size={16} color={colors.primary} />
                  <Text style={styles.walletBalanceText}>{solBalance.balance.toFixed(4)} SOL</Text>
                </View>
              )}
            </View>

            {/* Mini Chart */}
            {totalPortfolioValue > 0 && (
              <View style={styles.chartContainer}>
                <MiniChart 
                  data={chartData} 
                  color={isPositionSafe ? colors.success : colors.warning}
                  isDark={isDark}
                  height={80}
                />
              </View>
            )}
          </GlassCard>
        </Animated.View>

        {/* Grow Button */}
        <Button
          title="Grow Now"
          icon="trending-up"
          size="lg"
          fullWidth
          onPress={() => router.push('/grow')}
          style={styles.growButton}
        />

        {/* Live Earnings Ticker */}
        {depositedValue > 0 && (
          <EarningsTicker
            depositedAmount={depositedValue}
            apy={8.2}
            token="USDC"
            isDark={isDark}
          />
        )}

        {/* Quick Stats with Glass Cards */}
        <Animated.View 
          style={[
            styles.statsRow,
            {
              opacity: statsAnim,
              transform: [{ translateY: statsAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }],
            },
          ]}
        >
          <GlassCard isDark={isDark} style={styles.statCard}>
            <Icon name="account-balance" size={20} color={colors.primary} />
            <Text style={[styles.statValue, isDark && styles.textDark]}>
              ${depositedValue.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </Text>
            <Text style={[styles.statLabel, isDark && styles.textSecondaryDark]}>Deposited</Text>
          </GlassCard>
          <GlassCard isDark={isDark} style={styles.statCard}>
            <Icon name="payments" size={20} color={colors.warning} />
            <Text style={[styles.statValue, isDark && styles.textDark]}>
              ${borrowedValue.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </Text>
            <Text style={[styles.statLabel, isDark && styles.textSecondaryDark]}>Borrowed</Text>
          </GlassCard>
        </Animated.View>

        {/* Info Footer */}
        <View style={styles.infoSection}>
          <View style={[styles.divider, isDark && styles.dividerDark]} />
          <Text style={[styles.infoText, isDark && styles.textSecondaryDark]}>
            ShadowLend uses Arcium MXE for confidential computation to keep your assets anonymous and secure.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundLight,
  },
  containerDark: {
    backgroundColor: colors.dark.background,
  },
  topGradientBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 200,
    zIndex: 0,
  },
  gradientFill: {
    flex: 1,
    opacity: 1.0, // Full visibility
  },
  safeArea: {
    flex: 1,
    backgroundColor: 'transparent',
    zIndex: 1,
  },
  textDark: {
    color: colors.dark.text,
  },
  textSecondaryDark: {
    color: colors.dark.textSecondary,
  },
  cardDark: {
    backgroundColor: colors.dark.card,
    borderColor: colors.dark.border,
  },
  dividerDark: {
    backgroundColor: colors.dark.border,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    zIndex: 10,
    backgroundColor: colors.white,
  },
  headerDark: {
    backgroundColor: colors.dark.card,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  welcomeText: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    fontFamily: fonts.headingMedium,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  themeButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    // Enhanced Umbra-style soft shadow - more visible
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  themeButtonDark: {
    backgroundColor: colors.dark.card,
    borderColor: colors.dark.border,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.md,
    gap: spacing.md,
    paddingBottom: spacing.xxl,
    paddingTop: spacing.sm, // Add top padding for shadow visibility
  },
  portfolioCard: {
    overflow: 'hidden',
    marginTop: spacing.sm, // Add margin for shadow visibility
  },
  statusHeader: {
    backgroundColor: 'rgba(34, 197, 94, 0.06)',
    paddingVertical: spacing.md,
    alignItems: 'center',
    gap: spacing.xs,
    marginHorizontal: -spacing.lg,
    marginTop: -spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  statusHeaderDark: {
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
  },
  statusBadge: {
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    padding: spacing.xs,
    borderRadius: borderRadius.full,
  },
  statusText: {
    color: colors.success,
    fontSize: fontSize.xs,
    fontFamily: fonts.headingBold,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  portfolioBody: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  portfolioLabel: {
    color: colors.textSecondary,
    fontSize: fontSize.xs,
    fontFamily: fonts.headingMedium,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  portfolioValue: {
    color: colors.textPrimary,
    fontSize: 44,
    fontFamily: fonts.headingBold,
    letterSpacing: -1,
    marginTop: spacing.xs,
  },
  portfolioChange: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: spacing.sm,
    backgroundColor: 'rgba(19, 109, 236, 0.1)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
  },
  walletBalanceText: {
    color: colors.primary,
    fontSize: fontSize.sm,
    fontFamily: fonts.headingSemiBold,
  },
  chartContainer: {
    marginTop: spacing.md,
    marginHorizontal: -spacing.lg,
    marginBottom: -spacing.lg,
  },
  statusHeaderWarning: {
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
  },
  statusBadgeWarning: {
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
  },
  statusTextWarning: {
    color: colors.warning,
  },
  growButton: {
    marginTop: spacing.xs,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.xs,
  },
  statValue: {
    color: colors.textPrimary,
    fontSize: fontSize.xl,
    fontFamily: fonts.headingBold,
  },
  statLabel: {
    color: colors.textSecondary,
    fontSize: fontSize.xs,
    fontFamily: fonts.headingMedium,
  },
  infoSection: {
    alignItems: 'center',
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  divider: {
    width: 40,
    height: 4,
    backgroundColor: colors.textMuted,
    borderRadius: borderRadius.full,
    opacity: 0.5,
  },
  infoText: {
    color: colors.textSecondary,
    fontSize: fontSize.xs,
    textAlign: 'center',
    maxWidth: 260,
    lineHeight: 18,
    opacity: 0.7,
  },
})
