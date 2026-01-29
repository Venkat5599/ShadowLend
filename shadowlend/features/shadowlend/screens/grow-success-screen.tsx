import { View, Text, StyleSheet, ScrollView } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { colors, spacing, fontSize, borderRadius, fonts } from '@/constants/theme'
import { Button, Icon, Card, SuccessCelebration, AnimatedBackground } from '@/components/ui'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { useTheme } from '@/features/theme'

export function GrowSuccessScreen() {
  const router = useRouter()
  const { isDark } = useTheme()
  const params = useLocalSearchParams<{ amount: string; asset: string }>()
  const amount = params.amount || '500'
  const asset = params.asset || 'USDC'

  return (
    <SafeAreaView style={[styles.container, isDark && styles.containerDark]} edges={['top']}>
      <AnimatedBackground isDark={isDark} />
      
      <View style={styles.header}>
        <View style={styles.placeholder} />
        <View style={styles.headerCenter}>
          <Text style={[styles.headerTitle, isDark && styles.textDark]}>Grow Assets</Text>
          <Text style={styles.headerStep}>Step 3 of 3</Text>
        </View>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.progressContainer}>
        <View style={[styles.progressDot, styles.progressComplete]} />
        <View style={[styles.progressDot, styles.progressComplete]} />
        <View style={[styles.progressDot, styles.progressComplete]} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Success Celebration with Confetti */}
        <SuccessCelebration
          isVisible={true}
          amount={`$${parseFloat(amount).toLocaleString()}`}
          token={asset}
          action="deposit"
          isDark={isDark}
        />

        {/* Summary Card */}
        <Card style={[styles.summaryCard, isDark && styles.cardDark] as any}>
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, isDark && styles.textSecondaryDark]}>Amount Deposited</Text>
            <Text style={[styles.summaryValue, isDark && styles.textDark]}>${parseFloat(amount).toLocaleString()} {asset}</Text>
          </View>
          <View style={[styles.divider, isDark && styles.dividerDark]} />
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, isDark && styles.textSecondaryDark]}>Current APY</Text>
            <Text style={styles.summaryValueGreen}>8.2%</Text>
          </View>
          <View style={[styles.divider, isDark && styles.dividerDark]} />
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, isDark && styles.textSecondaryDark]}>Est. Daily Earnings</Text>
            <Text style={styles.summaryValueGreen}>+${(parseFloat(amount) * 0.082 / 365).toFixed(4)}</Text>
          </View>
          <View style={[styles.divider, isDark && styles.dividerDark]} />
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, isDark && styles.textSecondaryDark]}>Transaction ID</Text>
            <Text style={[styles.txId, isDark && styles.textSecondaryDark]}>5xK7...mN9p</Text>
          </View>
        </Card>

        {/* Info Box */}
        <View style={[styles.infoBox, isDark && styles.infoBoxDark]}>
          <Icon name="trending-up" size={20} color={colors.success} />
          <Text style={[styles.infoText, isDark && styles.textSecondaryDark]}>
            Your yield will start accruing immediately. Check your portfolio to track real-time earnings.
          </Text>
        </View>
      </ScrollView>

      <View style={[styles.footer, isDark && styles.footerDark]}>
        <Button
          title="View Portfolio"
          icon="account-balance-wallet"
          iconPosition="left"
          size="lg"
          fullWidth
          onPress={() => router.replace('/(tabs)' as any)}
        />
        <Button
          title="Make Another Deposit"
          variant="outline"
          size="lg"
          fullWidth
          onPress={() => router.replace('/grow' as any)}
          style={styles.secondaryButton}
        />
      </View>
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
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  headerCenter: {
    alignItems: 'center',
  },
  headerTitle: {
    color: colors.textPrimary,
    fontSize: fontSize.sm,
    fontFamily: fonts.headingBold,
  },
  headerStep: {
    color: colors.primary,
    fontSize: fontSize.xs,
    fontFamily: fonts.headingMedium,
  },
  placeholder: {
    width: 48,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
  },
  progressDot: {
    width: 48,
    height: 6,
    borderRadius: borderRadius.full,
    backgroundColor: colors.textMuted,
  },
  progressComplete: {
    backgroundColor: colors.success,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  summaryCard: {
    marginBottom: spacing.md,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  summaryLabel: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
  },
  summaryValue: {
    color: colors.textPrimary,
    fontSize: fontSize.sm,
    fontFamily: fonts.headingSemiBold,
  },
  summaryValueGreen: {
    color: colors.success,
    fontSize: fontSize.md,
    fontFamily: fonts.headingBold,
  },
  txId: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    fontFamily: 'monospace',
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    padding: spacing.md,
    backgroundColor: colors.successLight,
    borderRadius: borderRadius.lg,
  },
  infoBoxDark: {
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
  },
  infoText: {
    flex: 1,
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    lineHeight: 20,
  },
  footer: {
    padding: spacing.lg,
    paddingBottom: spacing.xl,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: spacing.sm,
  },
  footerDark: {
    backgroundColor: colors.dark.card,
    borderTopColor: colors.dark.border,
  },
  secondaryButton: {
    marginTop: 0,
  },
})
