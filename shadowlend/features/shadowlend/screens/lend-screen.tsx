import { View, Text, StyleSheet, ScrollView, Pressable, Modal, useWindowDimensions } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { colors, spacing, fontSize, borderRadius, fonts } from '@/constants/theme'
import { Button, Icon, TokenIcon, GlassCard, AnimatedBackground } from '@/components/ui'
import { useTheme } from '@/features/theme'
import { useRouter } from 'expo-router'
import { useState } from 'react'

interface Pool {
  id: string
  name: string
  symbol: string
  apy: string
  tvl: string
  color: string
  totalSupplied: string
  totalBorrowed: string
  utilization: string
  collateralFactor: string
  liquidationThreshold: string
}

const POOLS: Pool[] = [
  {
    id: 'usdc',
    name: 'USDC Pool',
    symbol: 'USDC',
    apy: '8.2%',
    tvl: '$2.4M',
    color: '#2775ca',
    totalSupplied: '$2,400,000',
    totalBorrowed: '$1,680,000',
    utilization: '70%',
    collateralFactor: '80%',
    liquidationThreshold: '85%',
  },
  {
    id: 'sol',
    name: 'SOL Pool',
    symbol: 'SOL',
    apy: '5.8%',
    tvl: '$1.8M',
    color: '#9945FF',
    totalSupplied: '$1,800,000',
    totalBorrowed: '$900,000',
    utilization: '50%',
    collateralFactor: '75%',
    liquidationThreshold: '80%',
  },
  {
    id: 'usdt',
    name: 'USDT Pool',
    symbol: 'USDT',
    apy: '7.5%',
    tvl: '$1.2M',
    color: '#26A17B',
    totalSupplied: '$1,200,000',
    totalBorrowed: '$780,000',
    utilization: '65%',
    collateralFactor: '80%',
    liquidationThreshold: '85%',
  },
]

export function LendScreen() {
  const { isDark, toggleTheme } = useTheme()
  const router = useRouter()
  const [selectedPool, setSelectedPool] = useState<Pool | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const { width } = useWindowDimensions()
  const isSmallScreen = width < 600

  const handleSupply = (pool: Pool) => {
    router.push({
      pathname: '/grow',
      params: { asset: pool.symbol, poolId: pool.id }
    } as any)
  }

  const handleDetails = (pool: Pool) => {
    setSelectedPool(pool)
    setShowDetailsModal(true)
  }

  return (
    <SafeAreaView style={[styles.container, isDark && styles.containerDark]} edges={['top']}>
      <AnimatedBackground isDark={isDark} />
      
      <View style={styles.header}>
        <Text style={[styles.headerTitle, isDark && styles.textDark]}>Lend</Text>
        <View style={styles.headerRight}>
          <Pressable style={[styles.themeButton, isDark && styles.themeButtonDark]} onPress={toggleTheme}>
            <Icon name={isDark ? 'light-mode' : 'dark-mode'} size={20} color={isDark ? colors.dark.text : colors.textPrimary} />
          </Pressable>
          <Pressable style={styles.infoButton}>
            <Icon name="info-outline" size={24} color={isDark ? colors.dark.textSecondary : colors.textSecondary} />
          </Pressable>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.statsRow}>
          <GlassCard isDark={isDark} intensity="medium" style={styles.statCard}>
            <View style={styles.statHeader}>
              <Icon name="account-balance" size={18} color={colors.primary} />
              <Text style={[styles.statLabel, isDark && styles.textSecondaryDark]}>Deposits</Text>
            </View>
            <Text style={[styles.statValue, isDark && styles.textDark]} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.8}>
              $4.25K
            </Text>
            <View style={styles.statBadge}>
              <Icon name="trending-up" size={12} color={colors.success} />
              <Text style={styles.statBadgeText}>+2.4%</Text>
            </View>
          </GlassCard>
          <GlassCard isDark={isDark} intensity="medium" style={styles.statCard}>
            <View style={styles.statHeader}>
              <Icon name="percent" size={18} color={colors.success} />
              <Text style={[styles.statLabel, isDark && styles.textSecondaryDark]}>Avg APY</Text>
            </View>
            <Text style={[styles.statValue, isDark && styles.textDark]} numberOfLines={1}>
              7.2%
            </Text>
            <View style={styles.statBadge}>
              <Icon name="verified" size={12} color={colors.primary} />
              <Text style={[styles.statBadgeText, { color: colors.primary }]}>Safe</Text>
            </View>
          </GlassCard>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isDark && styles.textDark]}>Available Pools</Text>
          <Text style={[styles.sectionSubtitle, isDark && styles.textSecondaryDark]}>
            Earn yield while keeping your deposits private
          </Text>
        </View>

        <View style={styles.poolList}>
          {POOLS.map((pool) => (
            <GlassCard key={pool.id} isDark={isDark} intensity="medium">
              <View style={styles.poolCardContent}>
                <View style={styles.poolHeader}>
                  <TokenIcon symbol={pool.symbol} size={48} backgroundColor={pool.color} />
                  <View style={styles.poolInfo}>
                    <Text style={[styles.poolName, isDark && styles.textDark]}>{pool.name}</Text>
                    <Text style={[styles.poolTvl, isDark && styles.textSecondaryDark]}>TVL: {pool.tvl}</Text>
                  </View>
                  <View style={styles.poolApy}>
                    <Text style={[styles.apyLabel, isDark && styles.textSecondaryDark]}>APY</Text>
                    <Text style={styles.apyValue}>{pool.apy}</Text>
                  </View>
                </View>
                <View style={[styles.poolActions, isSmallScreen && styles.poolActionsVertical]}>
                  <Pressable
                    style={[styles.umbraButton, styles.umbraButtonPrimary, isDark && styles.umbraButtonPrimaryDark]}
                    onPress={() => handleSupply(pool)}
                  >
                    <Text style={styles.umbraButtonTextPrimary}>Supply</Text>
                  </Pressable>
                  <Pressable
                    style={[styles.umbraButton, styles.umbraButtonOutline, isDark && styles.umbraButtonOutlineDark]}
                    onPress={() => handleDetails(pool)}
                  >
                    <Text style={[styles.umbraButtonTextOutline, isDark && styles.umbraButtonTextOutlineDark]}>Details</Text>
                  </Pressable>
                </View>
              </View>
            </GlassCard>
          ))}
        </View>

        <View style={[styles.privacyNote, isDark && styles.privacyNoteDark]}>
          <Icon name="shield" size={20} color={colors.primary} />
          <Text style={[styles.privacyNoteText, isDark && { color: colors.primary }]}>
            All deposits are shielded using Arcium MXE. Your balance remains private.
          </Text>
        </View>
      </ScrollView>

      {/* Pool Details Modal */}
      <Modal
        visible={showDetailsModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowDetailsModal(false)}
      >
        <SafeAreaView style={[styles.modalContainer, isDark && styles.containerDark]}>
          <View style={[styles.modalHeader, isDark && styles.modalHeaderDark]}>
            <Text style={[styles.modalTitle, isDark && styles.textDark]}>
              {selectedPool?.name} Details
            </Text>
            <Pressable onPress={() => setShowDetailsModal(false)} style={styles.closeButton}>
              <Icon name="close" size={24} color={isDark ? colors.dark.text : colors.textPrimary} />
            </Pressable>
          </View>

          {selectedPool && (
            <ScrollView style={styles.modalContent}>
              {/* Pool Header */}
              <View style={styles.modalPoolHeader}>
                <View style={[styles.modalPoolIcon, { backgroundColor: selectedPool.color }]}>
                  <Text style={styles.modalPoolIconText}>{selectedPool.symbol}</Text>
                </View>
                <View style={styles.modalPoolInfo}>
                  <Text style={[styles.modalPoolName, isDark && styles.textDark]}>
                    {selectedPool.name}
                  </Text>
                  <View style={styles.apyBadge}>
                    <Text style={styles.apyBadgeText}>{selectedPool.apy} APY</Text>
                  </View>
                </View>
              </View>

              {/* Stats Grid */}
              <View style={styles.statsGrid}>
                <View style={[styles.statItem, isDark && styles.statItemDark]}>
                  <Text style={[styles.statItemLabel, isDark && styles.textSecondaryDark]}>Total Supplied</Text>
                  <Text style={[styles.statItemValue, isDark && styles.textDark]}>{selectedPool.totalSupplied}</Text>
                </View>
                <View style={[styles.statItem, isDark && styles.statItemDark]}>
                  <Text style={[styles.statItemLabel, isDark && styles.textSecondaryDark]}>Total Borrowed</Text>
                  <Text style={[styles.statItemValue, isDark && styles.textDark]}>{selectedPool.totalBorrowed}</Text>
                </View>
                <View style={[styles.statItem, isDark && styles.statItemDark]}>
                  <Text style={[styles.statItemLabel, isDark && styles.textSecondaryDark]}>Utilization</Text>
                  <Text style={[styles.statItemValue, isDark && styles.textDark]}>{selectedPool.utilization}</Text>
                </View>
                <View style={[styles.statItem, isDark && styles.statItemDark]}>
                  <Text style={[styles.statItemLabel, isDark && styles.textSecondaryDark]}>TVL</Text>
                  <Text style={[styles.statItemValue, isDark && styles.textDark]}>{selectedPool.tvl}</Text>
                </View>
              </View>

              {/* Risk Parameters */}
              <View style={[styles.riskCard, isDark && styles.cardDark]}>
                <Text style={[styles.riskTitle, isDark && styles.textDark]}>Risk Parameters</Text>
                <View style={styles.riskRow}>
                  <Text style={[styles.riskLabel, isDark && styles.textSecondaryDark]}>Collateral Factor</Text>
                  <Text style={[styles.riskValue, isDark && styles.textDark]}>{selectedPool.collateralFactor}</Text>
                </View>
                <View style={[styles.riskDivider, isDark && styles.dividerDark]} />
                <View style={styles.riskRow}>
                  <Text style={[styles.riskLabel, isDark && styles.textSecondaryDark]}>Liquidation Threshold</Text>
                  <Text style={[styles.riskValue, isDark && styles.textDark]}>{selectedPool.liquidationThreshold}</Text>
                </View>
              </View>

              {/* Privacy Info */}
              <View style={[styles.modalPrivacyInfo, isDark && styles.modalPrivacyInfoDark]}>
                <Icon name="lock" size={20} color={colors.success} />
                <View style={styles.modalPrivacyText}>
                  <Text style={[styles.modalPrivacyTitle, isDark && styles.textDark]}>Privacy Protected</Text>
                  <Text style={[styles.modalPrivacyDesc, isDark && styles.textSecondaryDark]}>
                    All deposits in this pool are encrypted using Arcium MXE. Your balance and transaction history remain private.
                  </Text>
                </View>
              </View>

              {/* Action Button */}
              <Button
                title={`Supply ${selectedPool.symbol}`}
                size="lg"
                fullWidth
                onPress={() => {
                  setShowDetailsModal(false)
                  handleSupply(selectedPool)
                }}
                style={styles.modalSupplyButton}
              />
            </ScrollView>
          )}
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
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
  headerTitle: {
    color: colors.textPrimary,
    fontSize: fontSize.xxl,
    fontFamily: fonts.headingBold,
  },
  infoButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xxl,
    paddingTop: spacing.sm, // Add top padding for shadow visibility
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  statCard: {
    flex: 1,
    gap: spacing.sm,
    minWidth: 0,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  statLabel: {
    color: colors.textSecondary,
    fontSize: fontSize.xs,
    fontFamily: fonts.headingMedium,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statValue: {
    color: colors.textPrimary,
    fontSize: 28,
    fontFamily: fonts.headingBold,
    letterSpacing: -0.5,
  },
  statBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
  },
  statBadgeText: {
    color: colors.success,
    fontSize: 11,
    fontFamily: fonts.headingSemiBold,
  },
  section: {
    marginBottom: spacing.md,
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: fontSize.xl,
    fontFamily: fonts.headingBold,
    marginBottom: spacing.xs,
  },
  sectionSubtitle: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
  },
  poolList: {
    gap: spacing.md,
    marginTop: spacing.xs, // Add margin for shadow visibility
  },
  poolCardContent: {
    gap: spacing.md,
  },
  poolHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  poolInfo: {
    flex: 1,
    gap: 2,
  },
  poolName: {
    color: colors.textPrimary,
    fontSize: fontSize.lg,
    fontFamily: fonts.headingSemiBold,
  },
  poolTvl: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
  },
  poolApy: {
    alignItems: 'flex-end',
  },
  apyLabel: {
    color: colors.textSecondary,
    fontSize: fontSize.xs,
    textTransform: 'uppercase',
  },
  apyValue: {
    color: colors.success,
    fontSize: fontSize.xl,
    fontFamily: fonts.headingBold,
  },
  poolActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  poolActionsVertical: {
    flexDirection: 'column',
  },
  umbraButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm + 2,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 40,
    // Umbra-style soft shadow
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  umbraButtonPrimary: {
    backgroundColor: colors.primary,
    flex: 1,
  },
  umbraButtonPrimaryDark: {
    backgroundColor: colors.dark.accent,
  },
  umbraButtonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.border,
    flex: 1,
  },
  umbraButtonOutlineDark: {
    borderColor: colors.dark.border,
  },
  umbraButtonTextPrimary: {
    color: colors.white,
    fontSize: fontSize.sm,
    fontFamily: fonts.semiBold,
  },
  umbraButtonTextOutline: {
    color: colors.textPrimary,
    fontSize: fontSize.sm,
    fontFamily: fonts.semiBold,
  },
  umbraButtonTextOutlineDark: {
    color: colors.dark.text,
  },
  privacyNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primaryLight,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginTop: spacing.lg,
  },
  privacyNoteDark: {
    backgroundColor: 'rgba(19, 109, 236, 0.15)',
  },
  privacyNoteText: {
    flex: 1,
    color: colors.primary,
    fontSize: fontSize.sm,
    lineHeight: 20,
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: colors.backgroundLight,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalHeaderDark: {
    borderBottomColor: colors.dark.border,
  },
  modalTitle: {
    color: colors.textPrimary,
    fontSize: fontSize.xl,
    fontFamily: fonts.bold,
  },
  closeButton: {
    padding: spacing.sm,
  },
  modalContent: {
    flex: 1,
    padding: spacing.lg,
  },
  modalPoolHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  modalPoolIcon: {
    width: 64,
    height: 64,
    borderRadius: borderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalPoolIconText: {
    color: colors.white,
    fontSize: fontSize.xl,
    fontFamily: fonts.bold,
  },
  modalPoolInfo: {
    flex: 1,
    gap: spacing.xs,
  },
  modalPoolName: {
    color: colors.textPrimary,
    fontSize: fontSize.xxl,
    fontFamily: fonts.bold,
  },
  apyBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.successLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
  },
  apyBadgeText: {
    color: colors.success,
    fontSize: fontSize.sm,
    fontFamily: fonts.bold,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  statItem: {
    width: '48%',
    backgroundColor: colors.white,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statItemDark: {
    backgroundColor: colors.dark.card,
    borderColor: colors.dark.border,
  },
  statItemLabel: {
    color: colors.textSecondary,
    fontSize: fontSize.xs,
    fontFamily: fonts.medium,
    marginBottom: spacing.xs,
  },
  statItemValue: {
    color: colors.textPrimary,
    fontSize: fontSize.lg,
    fontFamily: fonts.bold,
  },
  riskCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  riskTitle: {
    color: colors.textPrimary,
    fontSize: fontSize.md,
    fontFamily: fonts.bold,
    marginBottom: spacing.md,
  },
  riskRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  riskLabel: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
  },
  riskValue: {
    color: colors.textPrimary,
    fontSize: fontSize.sm,
    fontFamily: fonts.semiBold,
  },
  riskDivider: {
    height: 1,
    backgroundColor: colors.border,
  },
  modalPrivacyInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    backgroundColor: colors.successLight,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.lg,
  },
  modalPrivacyInfoDark: {
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
  },
  modalPrivacyText: {
    flex: 1,
    gap: 4,
  },
  modalPrivacyTitle: {
    color: colors.textPrimary,
    fontSize: fontSize.sm,
    fontFamily: fonts.semiBold,
  },
  modalPrivacyDesc: {
    color: colors.textSecondary,
    fontSize: fontSize.xs,
    lineHeight: 18,
  },
  modalSupplyButton: {
    marginTop: spacing.md,
  },
})
