import React, { useState } from 'react'
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { colors, spacing, fontSize, borderRadius, fonts } from '@/constants/theme'
import { Icon, AnimatedBackground, TokenIcon, GlassCard } from '@/components/ui'
import { useTheme } from '@/features/theme'

interface Transaction {
  id: string
  type: 'deposit' | 'withdraw' | 'borrow' | 'repay'
  token: string
  amount: string
  apy?: string
  status: 'completed' | 'pending' | 'failed'
  timestamp: string
  date: string
  txHash: string
  color: string
  pool?: string
}

const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: '1',
    type: 'deposit',
    token: 'USDC',
    amount: '5,000.00',
    apy: '8.2%',
    status: 'completed',
    timestamp: '2 hours ago',
    date: 'Jan 18, 2026',
    txHash: '5KJp9...xY2m',
    color: '#2775CA',
    pool: 'USDC Pool',
  },
  {
    id: '2',
    type: 'borrow',
    token: 'SOL',
    amount: '25.50',
    apy: '5.8%',
    status: 'completed',
    timestamp: '5 hours ago',
    date: 'Jan 18, 2026',
    txHash: '7Mnq3...aB4k',
    color: '#9945FF',
    pool: 'SOL Pool',
  },
  {
    id: '3',
    type: 'deposit',
    token: 'USDT',
    amount: '3,200.00',
    apy: '7.5%',
    status: 'completed',
    timestamp: '1 day ago',
    date: 'Jan 17, 2026',
    txHash: '9Prt5...cD6n',
    color: '#26A17B',
    pool: 'USDT Pool',
  },
  {
    id: '4',
    type: 'repay',
    token: 'SOL',
    amount: '10.25',
    status: 'completed',
    timestamp: '1 day ago',
    date: 'Jan 17, 2026',
    txHash: '2Xvw7...eF8p',
    color: '#9945FF',
    pool: 'SOL Pool',
  },
  {
    id: '5',
    type: 'withdraw',
    token: 'USDC',
    amount: '1,500.00',
    status: 'completed',
    timestamp: '2 days ago',
    date: 'Jan 16, 2026',
    txHash: '4Zab9...gH0q',
    color: '#2775CA',
    pool: 'USDC Pool',
  },
  {
    id: '6',
    type: 'borrow',
    token: 'USDT',
    amount: '2,000.00',
    apy: '7.5%',
    status: 'completed',
    timestamp: '3 days ago',
    date: 'Jan 15, 2026',
    txHash: '6Bcd1...iJ2r',
    color: '#26A17B',
    pool: 'USDT Pool',
  },
  {
    id: '7',
    type: 'deposit',
    token: 'SOL',
    amount: '50.00',
    apy: '5.8%',
    status: 'completed',
    timestamp: '4 days ago',
    date: 'Jan 14, 2026',
    txHash: '8Def3...kL4s',
    color: '#9945FF',
    pool: 'SOL Pool',
  },
  {
    id: '8',
    type: 'repay',
    token: 'USDT',
    amount: '1,000.00',
    status: 'completed',
    timestamp: '5 days ago',
    date: 'Jan 13, 2026',
    txHash: '0Fgh5...mN6t',
    color: '#26A17B',
    pool: 'USDT Pool',
  },
]

export function HistoryScreen() {
  const { isDark, toggleTheme } = useTheme()
  const [filter, setFilter] = useState<'all' | 'deposit' | 'withdraw' | 'borrow' | 'repay'>('all')

  const filteredTransactions = filter === 'all' 
    ? MOCK_TRANSACTIONS 
    : MOCK_TRANSACTIONS.filter(tx => tx.type === filter)

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'deposit': return 'arrow-downward'
      case 'withdraw': return 'arrow-upward'
      case 'borrow': return 'account-balance-wallet'
      case 'repay': return 'payments'
      default: return 'swap-horiz'
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'deposit': return colors.success
      case 'withdraw': return colors.primary
      case 'borrow': return colors.warning
      case 'repay': return '#00D4AA'
      default: return colors.textSecondary
    }
  }

  const getTypeLabel = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1)
  }

  // Calculate stats
  const totalDeposited = MOCK_TRANSACTIONS
    .filter(tx => tx.type === 'deposit')
    .reduce((sum, tx) => sum + parseFloat(tx.amount.replace(/,/g, '')), 0)
  
  const totalBorrowed = MOCK_TRANSACTIONS
    .filter(tx => tx.type === 'borrow')
    .reduce((sum, tx) => sum + parseFloat(tx.amount.replace(/,/g, '')), 0)

  return (
    <SafeAreaView style={[styles.container, isDark && styles.containerDark]} edges={['top']}>
      <AnimatedBackground isDark={isDark} />
      
      <View style={styles.header}>
        <Text style={[styles.headerTitle, isDark && styles.textDark]}>History</Text>
        <Pressable style={[styles.themeButton, isDark && styles.themeButtonDark]} onPress={toggleTheme}>
          <Icon name={isDark ? 'light-mode' : 'dark-mode'} size={20} color={isDark ? colors.dark.text : colors.textPrimary} />
        </Pressable>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Stats Overview */}
        <View style={styles.statsRow}>
          <GlassCard isDark={isDark} intensity="medium" style={styles.statCard}>
            <Icon name="trending-up" size={20} color={colors.success} />
            <Text style={[styles.statValue, isDark && styles.textDark]}>
              ${totalDeposited.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </Text>
            <Text style={[styles.statLabel, isDark && styles.textSecondaryDark]}>Total Deposited</Text>
          </GlassCard>
          <GlassCard isDark={isDark} intensity="medium" style={styles.statCard}>
            <Icon name="account-balance-wallet" size={20} color={colors.warning} />
            <Text style={[styles.statValue, isDark && styles.textDark]}>
              ${totalBorrowed.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </Text>
            <Text style={[styles.statLabel, isDark && styles.textSecondaryDark]}>Total Borrowed</Text>
          </GlassCard>
        </View>

        {/* Filter Tabs */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.filterContainer}
          contentContainerStyle={styles.filterContent}
        >
          {['all', 'deposit', 'withdraw', 'borrow', 'repay'].map((type) => (
            <Pressable
              key={type}
              style={[
                styles.filterTab,
                isDark && styles.filterTabDark,
                filter === type && styles.filterTabActive,
                filter === type && isDark && styles.filterTabActiveDark,
              ]}
              onPress={() => setFilter(type as any)}
            >
              <Text
                style={[
                  styles.filterTabText,
                  isDark && styles.textSecondaryDark,
                  filter === type && styles.filterTabTextActive,
                ]}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* Transaction List */}
        <View style={styles.transactionList}>
          <Text style={[styles.sectionTitle, isDark && styles.textDark]}>
            {filter === 'all' ? 'All Transactions' : `${getTypeLabel(filter)} History`}
          </Text>
          
          {filteredTransactions.length === 0 ? (
            <View style={styles.emptyState}>
              <Icon name="history" size={48} color={isDark ? colors.dark.textSecondary : colors.textSecondary} />
              <Text style={[styles.emptyText, isDark && styles.textSecondaryDark]}>
                No {filter === 'all' ? '' : filter} transactions yet
              </Text>
            </View>
          ) : (
            filteredTransactions.map((tx) => (
              <GlassCard key={tx.id} isDark={isDark} intensity="medium" style={styles.transactionCard}>
                <View style={styles.transactionHeader}>
                  <View style={styles.transactionLeft}>
                    <View style={[styles.typeIcon, { backgroundColor: `${getTypeColor(tx.type)}15` }]}>
                      <Icon name={getTypeIcon(tx.type)} size={20} color={getTypeColor(tx.type)} />
                    </View>
                    <View style={styles.transactionInfo}>
                      <Text style={[styles.transactionType, isDark && styles.textDark]}>
                        {getTypeLabel(tx.type)} {tx.token}
                      </Text>
                      <Text style={[styles.transactionPool, isDark && styles.textSecondaryDark]}>
                        {tx.pool}
                      </Text>
                    </View>
                  </View>
                  <TokenIcon symbol={tx.token} size={32} backgroundColor={tx.color} />
                </View>

                <View style={styles.transactionDetails}>
                  <View style={styles.detailRow}>
                    <Text style={[styles.detailLabel, isDark && styles.textSecondaryDark]}>Amount</Text>
                    <Text style={[styles.detailValue, isDark && styles.textDark]}>
                      {tx.amount} {tx.token}
                    </Text>
                  </View>
                  {tx.apy && (
                    <View style={styles.detailRow}>
                      <Text style={[styles.detailLabel, isDark && styles.textSecondaryDark]}>APY</Text>
                      <Text style={[styles.detailValue, { color: colors.success }]}>{tx.apy}</Text>
                    </View>
                  )}
                  <View style={styles.detailRow}>
                    <Text style={[styles.detailLabel, isDark && styles.textSecondaryDark]}>Date</Text>
                    <Text style={[styles.detailValue, isDark && styles.textSecondaryDark]}>
                      {tx.date}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={[styles.detailLabel, isDark && styles.textSecondaryDark]}>Status</Text>
                    <View style={[styles.statusBadge, styles.statusCompleted]}>
                      <Icon name="check-circle" size={12} color={colors.success} />
                      <Text style={styles.statusText}>Completed</Text>
                    </View>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={[styles.detailLabel, isDark && styles.textSecondaryDark]}>Tx Hash</Text>
                    <Pressable style={styles.txHashContainer}>
                      <Text style={[styles.txHash, isDark && { color: colors.dark.accent }]}>
                        {tx.txHash}
                      </Text>
                      <Icon name="open-in-new" size={14} color={isDark ? colors.dark.accent : colors.primary} />
                    </Pressable>
                  </View>
                </View>
              </GlassCard>
            ))
          )}
        </View>

        {/* Privacy Note */}
        <View style={[styles.privacyNote, isDark && styles.privacyNoteDark]}>
          <Icon name="shield" size={20} color={colors.primary} />
          <Text style={[styles.privacyNoteText, isDark && { color: colors.primary }]}>
            All transactions are encrypted and private. Only you can see your history.
          </Text>
        </View>
      </ScrollView>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  headerTitle: {
    color: colors.textPrimary,
    fontSize: fontSize.xxl,
    fontFamily: fonts.headingBold,
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
  },
  themeButtonDark: {
    backgroundColor: colors.dark.card,
    borderColor: colors.dark.border,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xxl,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
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
    fontFamily: fonts.medium,
    textAlign: 'center',
  },
  filterContainer: {
    marginBottom: spacing.lg,
  },
  filterContent: {
    gap: spacing.sm,
    paddingHorizontal: spacing.xs,
  },
  filterTab: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterTabDark: {
    backgroundColor: colors.dark.card,
    borderColor: colors.dark.border,
  },
  filterTabActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterTabActiveDark: {
    backgroundColor: '#00d4ff',
    borderColor: '#00d4ff',
  },
  filterTabText: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    fontFamily: fonts.semiBold,
  },
  filterTabTextActive: {
    color: colors.white,
  },
  transactionList: {
    gap: spacing.md,
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: fontSize.lg,
    fontFamily: fonts.headingSemiBold,
    marginBottom: spacing.sm,
  },
  transactionCard: {
    gap: spacing.md,
  },
  transactionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
  },
  typeIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  transactionInfo: {
    flex: 1,
    gap: 2,
  },
  transactionType: {
    color: colors.textPrimary,
    fontSize: fontSize.md,
    fontFamily: fonts.headingSemiBold,
  },
  transactionPool: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
  },
  transactionDetails: {
    gap: spacing.sm,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
  },
  detailValue: {
    color: colors.textPrimary,
    fontSize: fontSize.sm,
    fontFamily: fonts.semiBold,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
  },
  statusCompleted: {
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
  },
  statusText: {
    color: colors.success,
    fontSize: fontSize.xs,
    fontFamily: fonts.semiBold,
  },
  txHashContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  txHash: {
    color: colors.primary,
    fontSize: fontSize.sm,
    fontFamily: fonts.medium,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl,
    gap: spacing.md,
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: fontSize.md,
    textAlign: 'center',
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
})
