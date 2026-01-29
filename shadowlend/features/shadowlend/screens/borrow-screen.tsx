import { View, Text, StyleSheet, ScrollView, Pressable, TextInput, Platform, useWindowDimensions } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { colors, spacing, fontSize, fonts, borderRadius } from '@/constants/theme'
import { Button, Icon, NumberPad, GlassCard, AnimatedBackground } from '@/components/ui'
import { useState, useRef } from 'react'
import { useTheme } from '@/features/theme'
import { useRouter } from 'expo-router'

const QUICK_PERCENTAGES = ['25%', '50%', '75%', '100%']

export function BorrowScreen() {
  const { isDark, toggleTheme } = useTheme()
  const router = useRouter()
  const [amount, setAmount] = useState('')
  const inputRef = useRef<TextInput>(null)
  const maxBorrow = 12400
  const availableCollateral = 15000
  
  // Use hook for responsive width detection
  const { width } = useWindowDimensions()
  const isMobileDevice = Platform.OS === 'ios' || Platform.OS === 'android'
  const showNumberPad = isMobileDevice

  const borrowAmount = parseFloat(amount) || 0
  const percentage = maxBorrow > 0 ? (borrowAmount / maxBorrow) * 100 : 0

  const handleQuickSelect = (pct: string) => {
    const percent = parseInt(pct) / 100
    const newAmount = Math.round(maxBorrow * percent)
    setAmount(newAmount.toString())
  }

  const handleNumberPress = (value: string) => {
    if (value === '.' && amount.includes('.')) return
    if (amount.includes('.')) {
      const decimals = amount.split('.')[1]
      if (decimals && decimals.length >= 2) return
    }
    const newAmount = amount + value
    if (parseFloat(newAmount) <= maxBorrow) {
      setAmount(newAmount)
    }
  }

  const handleDelete = () => {
    setAmount(prev => prev.slice(0, -1))
  }

  const handleDecimal = () => {
    if (!amount.includes('.')) {
      setAmount(prev => (prev === '' ? '0.' : prev + '.'))
    }
  }

  const handleTextChange = (text: string) => {
    const numValue = parseFloat(text) || 0
    if (numValue <= maxBorrow) {
      setAmount(text)
    }
  }

  const getSafetyColor = () => {
    if (percentage < 50) return colors.success
    if (percentage < 75) return colors.warning
    return colors.error
  }

  const getSafetyLevel = () => {
    if (percentage < 50) return 'HIGH'
    if (percentage < 75) return 'MEDIUM'
    return 'LOW'
  }

  const displayAmount = amount || '0'

  return (
    <SafeAreaView style={[styles.container, isDark && styles.containerDark]} edges={['top']}>
      <AnimatedBackground isDark={isDark} />
      
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Icon name="arrow-back-ios" size={20} color={isDark ? colors.dark.text : colors.textPrimary} />
        </Pressable>
        <Text style={[styles.headerTitle, isDark && styles.textDark]}>Borrow</Text>
        <View style={styles.headerRight}>
          <Pressable style={[styles.iconButton, isDark && styles.iconButtonDark]} onPress={toggleTheme}>
            <Icon name={isDark ? 'light-mode' : 'dark-mode'} size={20} color={isDark ? colors.dark.text : colors.textPrimary} />
          </Pressable>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Amount Section */}
        <GlassCard isDark={isDark} intensity="medium">
          <View style={styles.amountHeader}>
            <Text style={[styles.amountLabel, isDark && styles.textDark]}>Amount to Borrow</Text>
            <View style={[styles.safetyBadge, { backgroundColor: `${getSafetyColor()}15` }]}>
              <Icon name="verified-user" size={14} color={getSafetyColor()} />
              <Text style={[styles.safetyText, { color: getSafetyColor() }]}>
                SAFETY: {getSafetyLevel()}
              </Text>
            </View>
          </View>

          <Pressable 
            style={styles.amountDisplay}
            onPress={() => inputRef.current?.focus()}
          >
            <Text style={styles.currencySymbol}>$</Text>
            {showNumberPad ? (
              <Text style={styles.amountValue}>
                {borrowAmount.toLocaleString()}
              </Text>
            ) : (
              <TextInput
                ref={inputRef}
                style={[styles.amountInput, isDark && styles.amountInputDark]}
                value={amount}
                onChangeText={handleTextChange}
                placeholder="0"
                placeholderTextColor={isDark ? colors.dark.textSecondary : colors.textMuted}
                keyboardType="decimal-pad"
              />
            )}
          </Pressable>
          
          <Text style={[styles.maxText, isDark && styles.textSecondaryDark]}>
            of ${maxBorrow.toLocaleString()}
          </Text>

          {/* Quick Percentage Buttons */}
          <View style={styles.quickAmounts}>
            {QUICK_PERCENTAGES.map((pct) => {
              const isActive = Math.round(percentage) === parseInt(pct)
              return (
                <Pressable
                  key={pct}
                  style={[
                    styles.quickAmountBtn,
                    isDark && styles.quickAmountBtnDark,
                    isActive && styles.quickAmountBtnActive
                  ]}
                  onPress={() => handleQuickSelect(pct)}
                >
                  <Text style={[
                    styles.quickAmountText,
                    isDark && styles.textSecondaryDark,
                    isActive && styles.quickAmountTextActive
                  ]}>
                    {pct}
                  </Text>
                </Pressable>
              )
            })}
          </View>
        </GlassCard>

        {/* Summary Card */}
        <GlassCard isDark={isDark} intensity="medium" style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, isDark && styles.textSecondaryDark]}>You Receive</Text>
            <Text style={[styles.summaryValue, isDark && styles.textDark]}>
              ${borrowAmount.toLocaleString()}.00
            </Text>
          </View>
          <View style={[styles.divider, isDark && styles.dividerDark]} />
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, isDark && styles.textSecondaryDark]}>Interest Rate</Text>
            <Text style={styles.summaryValueGreen}>2.4% APR</Text>
          </View>
          <View style={[styles.divider, isDark && styles.dividerDark]} />
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, isDark && styles.textSecondaryDark]}>Collateral</Text>
            <Text style={[styles.summaryValue, isDark && styles.textDark]}>
              ${availableCollateral.toLocaleString()} USDC
            </Text>
          </View>
        </GlassCard>

        {/* Privacy Info */}
        <GlassCard isDark={isDark} intensity="light" style={styles.privacyInfo}>
          <View style={[styles.privacyIcon, isDark && styles.privacyIconDark]}>
            <Icon name="visibility-off" size={20} color={colors.primary} />
          </View>
          <View style={styles.privacyText}>
            <Text style={[styles.privacyTitle, isDark && styles.textDark]}>Shielded Transaction</Text>
            <Text style={[styles.privacyDescription, isDark && styles.textSecondaryDark]}>
              Your wallet history is hidden. Only you can see the source of these funds.
            </Text>
          </View>
        </GlassCard>
      </ScrollView>

      {/* Number Pad - Mobile Only */}
      {showNumberPad && (
        <NumberPad
          onPress={handleNumberPress}
          onDelete={handleDelete}
          onDecimal={handleDecimal}
        />
      )}

      {/* Footer */}
      <View style={[styles.footer, isDark && styles.footerDark]}>
        <Button
          title="BORROW USDC"
          icon="lock"
          iconPosition="left"
          size="lg"
          fullWidth
          disabled={borrowAmount <= 0}
          onPress={() => router.push({ pathname: '/processing' } as any)}
        />
        <Text style={styles.footerText}>Powered by ShadowLend Privacy Layer</Text>
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
    paddingVertical: spacing.md,
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    color: colors.textPrimary,
    fontSize: fontSize.lg,
    fontFamily: fonts.bold,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    // Umbra-style soft shadow
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  iconButtonDark: {
    backgroundColor: colors.dark.card,
    borderColor: colors.dark.border,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.lg,
    paddingTop: spacing.sm, // Add top padding for shadow visibility
  },
  amountHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  amountLabel: {
    color: colors.textPrimary,
    fontSize: fontSize.md,
    fontFamily: fonts.semiBold,
  },
  safetyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
  },
  safetyText: {
    fontSize: fontSize.xs,
    fontFamily: fonts.bold,
    letterSpacing: 0.5,
  },
  amountDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  currencySymbol: {
    color: colors.primary,
    fontSize: 48,
    fontFamily: fonts.bold,
  },
  amountValue: {
    color: colors.primary,
    fontSize: 48,
    fontFamily: fonts.bold,
  },
  amountInput: {
    color: colors.primary,
    fontSize: 48,
    fontFamily: fonts.bold,
    textAlign: 'center',
    minWidth: 150,
    paddingHorizontal: spacing.sm,
    borderWidth: 0,
    backgroundColor: 'transparent',
    outlineStyle: 'none',
  } as any,
  amountInputDark: {
    color: colors.primary,
  },
  maxText: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  quickAmounts: {
    flexDirection: 'row',
    gap: spacing.md, // Increased from spacing.sm
  },
  quickAmountBtn: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.backgroundLight,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    // Enhanced Umbra-style soft shadow - more visible
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  quickAmountBtnDark: {
    backgroundColor: colors.dark.background,
    borderColor: colors.dark.border,
  },
  quickAmountBtnActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  quickAmountText: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    fontFamily: fonts.semiBold,
  },
  quickAmountTextActive: {
    color: colors.white,
  },
  summaryCard: {
    marginBottom: spacing.md,
    marginTop: spacing.sm, // Add margin for shadow visibility
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
    fontSize: fontSize.md,
    fontFamily: fonts.semiBold,
  },
  summaryValueGreen: {
    color: colors.success,
    fontSize: fontSize.md,
    fontFamily: fonts.bold,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
  },
  privacyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginTop: spacing.sm, // Add margin for shadow visibility
  },
  privacyIcon: {
    width: 40,
    height: 40,
    backgroundColor: colors.primaryLight,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    // Enhanced Umbra-style soft shadow - more visible
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 3,
  },
  privacyIconDark: {
    backgroundColor: 'rgba(19, 109, 236, 0.2)',
  },
  privacyText: {
    flex: 1,
    gap: 2,
  },
  privacyTitle: {
    color: colors.textPrimary,
    fontSize: fontSize.sm,
    fontFamily: fonts.semiBold,
  },
  privacyDescription: {
    color: colors.textSecondary,
    fontSize: fontSize.xs,
    lineHeight: 16,
  },
  footer: {
    padding: spacing.lg,
    paddingBottom: spacing.xl,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  footerDark: {
    backgroundColor: colors.dark.card,
    borderTopColor: colors.dark.border,
  },
  footerText: {
    color: '#00D4AA',
    fontSize: fontSize.xs,
    textAlign: 'center',
    marginTop: spacing.md,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
})
