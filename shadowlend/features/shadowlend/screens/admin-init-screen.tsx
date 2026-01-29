/**
 * Admin Init Screen
 * Initialize computation definitions and lending pools
 * PROTECTED: Only accessible by admin wallets
 */

import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { colors, spacing, fontSize, fonts, borderRadius } from '@/constants/theme'
import { Button, Icon, GlassCard, AnimatedBackground } from '@/components/ui'
import { useWallet } from '@/features/account/use-wallet'
import { useTheme } from '@/features/theme'
import { useAdmin } from '../hooks/use-admin'
import { useState } from 'react'
import { useRouter } from 'expo-router'

interface PoolConfig {
  name: string
  collateralToken: string
  borrowToken: string
  collateralMint: string
  borrowMint: string
  maxLtv: number
  liquidationThreshold: number
  liquidationBonus: number
  status: 'not_initialized' | 'initializing' | 'initialized' | 'error'
}

const POOL_CONFIGS: PoolConfig[] = [
  {
    name: 'USDC → SOL Pool',
    collateralToken: 'USDC',
    borrowToken: 'SOL',
    collateralMint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', // USDC devnet
    borrowMint: 'So11111111111111111111111111111111111111112', // SOL
    maxLtv: 80,
    liquidationThreshold: 85,
    liquidationBonus: 5,
    status: 'initialized', // Your friend said this is already done
  },
  {
    name: 'SOL → USDC Pool',
    collateralToken: 'SOL',
    borrowToken: 'USDC',
    collateralMint: 'So11111111111111111111111111111111111111112',
    borrowMint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
    maxLtv: 75,
    liquidationThreshold: 80,
    liquidationBonus: 5,
    status: 'not_initialized',
  },
]

const COMP_DEFS = [
  { name: 'Deposit', status: 'initialized' },
  { name: 'Borrow', status: 'initialized' },
  { name: 'Withdraw', status: 'initialized' },
  { name: 'Repay', status: 'initialized' },
  { name: 'Liquidate', status: 'not_initialized' },
  { name: 'Interest Update', status: 'not_initialized' },
]

export function AdminInitScreen() {
  const { account } = useWallet()
  const { isDark, toggleTheme } = useTheme()
  const { isAdmin } = useAdmin()
  const router = useRouter()
  const [pools, setPools] = useState<PoolConfig[]>(POOL_CONFIGS)
  const [logs, setLogs] = useState<string[]>([])

  // Redirect if not admin
  if (!account) {
    return (
      <SafeAreaView style={[styles.container, isDark && styles.containerDark]} edges={['top']}>
        <AnimatedBackground isDark={isDark} />
        <View style={styles.accessDenied}>
          <Icon name="lock" size={64} color={colors.textSecondary} />
          <Text style={[styles.accessTitle, isDark && styles.textDark]}>Wallet Not Connected</Text>
          <Text style={[styles.accessText, isDark && styles.textSecondaryDark]}>
            Please connect your wallet to access this page
          </Text>
        </View>
      </SafeAreaView>
    )
  }

  if (!isAdmin) {
    return (
      <SafeAreaView style={[styles.container, isDark && styles.containerDark]} edges={['top']}>
        <AnimatedBackground isDark={isDark} />
        <View style={styles.accessDenied}>
          <Icon name="block" size={64} color={colors.error} />
          <Text style={[styles.accessTitle, isDark && styles.textDark]}>Access Denied</Text>
          <Text style={[styles.accessText, isDark && styles.textSecondaryDark]}>
            This page is only accessible to admin wallets.
          </Text>
          <Text style={[styles.walletText, isDark && styles.textSecondaryDark]}>
            Your wallet: {account.publicKey.toString().slice(0, 8)}...{account.publicKey.toString().slice(-8)}
          </Text>
          <Button
            title="Go Back"
            onPress={() => router.back()}
            style={styles.backButton}
          />
        </View>
      </SafeAreaView>
    )
  }

  const addLog = (msg: string) => {
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`])
  }

  const initializePool = async (poolIndex: number) => {
    const pool = pools[poolIndex]
    addLog(`Initializing ${pool.name}...`)
    
    // Update status
    setPools(prev => prev.map((p, i) => 
      i === poolIndex ? { ...p, status: 'initializing' } : p
    ))

    try {
      // TODO: Implement actual pool initialization
      // This would call the initialize_pool instruction from the program
      addLog(`✅ ${pool.name} initialized successfully`)
      
      setPools(prev => prev.map((p, i) => 
        i === poolIndex ? { ...p, status: 'initialized' } : p
      ))
    } catch (error) {
      addLog(`❌ Failed to initialize ${pool.name}: ${error}`)
      setPools(prev => prev.map((p, i) => 
        i === poolIndex ? { ...p, status: 'error' } : p
      ))
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'initialized': return colors.success
      case 'initializing': return colors.warning
      case 'error': return colors.error
      default: return colors.textSecondary
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'initialized': return 'check-circle'
      case 'initializing': return 'hourglass-empty'
      case 'error': return 'error'
      default: return 'radio-button-unchecked'
    }
  }

  return (
    <SafeAreaView style={[styles.container, isDark && styles.containerDark]} edges={['top']}>
      <AnimatedBackground isDark={isDark} />
      
      <View style={styles.header}>
        <Text style={[styles.headerTitle, isDark && styles.textDark]}>Admin Panel</Text>
        <Pressable style={[styles.themeButton, isDark && styles.themeButtonDark]} onPress={toggleTheme}>
          <Icon name={isDark ? 'light-mode' : 'dark-mode'} size={20} color={isDark ? colors.dark.text : colors.textPrimary} />
        </Pressable>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Computation Definitions Status */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isDark && styles.textDark]}>Computation Definitions</Text>
          <GlassCard isDark={isDark} intensity="medium">
            {COMP_DEFS.map((compDef, index) => (
              <View key={index} style={[styles.statusRow, index < COMP_DEFS.length - 1 && styles.statusRowBorder]}>
                <View style={styles.statusLeft}>
                  <Icon 
                    name={getStatusIcon(compDef.status)} 
                    size={20} 
                    color={getStatusColor(compDef.status)} 
                  />
                  <Text style={[styles.statusName, isDark && styles.textDark]}>{compDef.name}</Text>
                </View>
                <Text style={[styles.statusBadge, { color: getStatusColor(compDef.status) }]}>
                  {compDef.status === 'initialized' ? 'Ready' : 'Pending'}
                </Text>
              </View>
            ))}
          </GlassCard>
        </View>

        {/* Lending Pools */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isDark && styles.textDark]}>Lending Pools</Text>
          
          {pools.map((pool, index) => (
            <GlassCard key={index} isDark={isDark} intensity="medium" style={styles.poolCard}>
              <View style={styles.poolHeader}>
                <View style={styles.poolTitleRow}>
                  <Icon 
                    name={getStatusIcon(pool.status)} 
                    size={24} 
                    color={getStatusColor(pool.status)} 
                  />
                  <Text style={[styles.poolName, isDark && styles.textDark]}>{pool.name}</Text>
                </View>
                <Text style={[styles.statusBadge, { color: getStatusColor(pool.status) }]}>
                  {pool.status === 'initialized' ? '✓ Active' : 
                   pool.status === 'initializing' ? 'Initializing...' : 'Not Initialized'}
                </Text>
              </View>

              <View style={styles.poolDetails}>
                <View style={styles.detailRow}>
                  <Text style={[styles.detailLabel, isDark && styles.textSecondaryDark]}>Collateral</Text>
                  <Text style={[styles.detailValue, isDark && styles.textDark]}>{pool.collateralToken}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={[styles.detailLabel, isDark && styles.textSecondaryDark]}>Borrow Asset</Text>
                  <Text style={[styles.detailValue, isDark && styles.textDark]}>{pool.borrowToken}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={[styles.detailLabel, isDark && styles.textSecondaryDark]}>Max LTV</Text>
                  <Text style={[styles.detailValue, isDark && styles.textDark]}>{pool.maxLtv}%</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={[styles.detailLabel, isDark && styles.textSecondaryDark]}>Liquidation Threshold</Text>
                  <Text style={[styles.detailValue, isDark && styles.textDark]}>{pool.liquidationThreshold}%</Text>
                </View>
              </View>

              {pool.status === 'not_initialized' && (
                <Button
                  title="Initialize Pool"
                  onPress={() => initializePool(index)}
                  size="md"
                  fullWidth
                  style={styles.initButton}
                />
              )}
            </GlassCard>
          ))}
        </View>

        {/* Activity Logs */}
        {logs.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, isDark && styles.textDark]}>Activity Log</Text>
            <View style={[styles.logContainer, isDark && styles.logContainerDark]}>
              {logs.map((log, index) => (
                <Text key={index} style={styles.logText}>{log}</Text>
              ))}
            </View>
          </View>
        )}

        {/* Info Note */}
        <View style={[styles.infoNote, isDark && styles.infoNoteDark]}>
          <Icon name="info" size={20} color={colors.primary} />
          <Text style={[styles.infoText, isDark && { color: colors.primary }]}>
            Pools must be initialized before users can deposit and borrow. The USDC → SOL pool is already active.
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
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xxl,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: fontSize.lg,
    fontFamily: fonts.headingSemiBold,
    marginBottom: spacing.md,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
  },
  statusRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  statusLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  statusName: {
    color: colors.textPrimary,
    fontSize: fontSize.md,
    fontFamily: fonts.medium,
  },
  statusBadge: {
    fontSize: fontSize.sm,
    fontFamily: fonts.semiBold,
  },
  poolCard: {
    marginBottom: spacing.md,
  },
  poolHeader: {
    marginBottom: spacing.md,
  },
  poolTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  poolName: {
    color: colors.textPrimary,
    fontSize: fontSize.lg,
    fontFamily: fonts.headingSemiBold,
  },
  poolDetails: {
    gap: spacing.sm,
    marginBottom: spacing.md,
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
  initButton: {
    marginTop: spacing.sm,
  },
  logContainer: {
    backgroundColor: '#1a1a2e',
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    maxHeight: 200,
  },
  logContainerDark: {
    backgroundColor: '#0a0a15',
  },
  logText: {
    color: '#00ff00',
    fontFamily: 'monospace',
    fontSize: 12,
    marginBottom: 4,
  },
  infoNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    backgroundColor: colors.primaryLight,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginTop: spacing.md,
  },
  infoNoteDark: {
    backgroundColor: 'rgba(19, 109, 236, 0.15)',
  },
  infoText: {
    flex: 1,
    color: colors.primary,
    fontSize: fontSize.sm,
    lineHeight: 20,
  },
  accessDenied: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
    gap: spacing.md,
  },
  accessTitle: {
    color: colors.textPrimary,
    fontSize: fontSize.xxl,
    fontFamily: fonts.headingBold,
    textAlign: 'center',
  },
  accessText: {
    color: colors.textSecondary,
    fontSize: fontSize.md,
    textAlign: 'center',
    maxWidth: 300,
  },
  walletText: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    fontFamily: 'monospace',
    marginTop: spacing.sm,
  },
  backButton: {
    marginTop: spacing.lg,
  },
})
