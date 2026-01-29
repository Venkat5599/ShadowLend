import { View, Text, StyleSheet, TextInput, Pressable, ScrollView, Platform, useWindowDimensions } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { colors, spacing, fontSize, borderRadius, fonts } from '@/constants/theme'
import { Button, Icon, Toggle, NumberPad, GlassCard, AnimatedBackground, TokenIcon } from '@/components/ui'
import { useState, useRef } from 'react'
import { useRouter } from 'expo-router'
import { useTheme } from '@/features/theme'
import { useWallet } from '@/features/account/use-wallet'

const QUICK_PERCENTAGES = ['0%', '10%', '25%', '50%', '75%', '100%']

export function GrowScreen() {
  const router = useRouter()
  const { isDark, toggleTheme } = useTheme()
  const { disconnect } = useWallet()
  const [amount, setAmount] = useState('')
  const [privacyEnabled, setPrivacyEnabled] = useState(true)
  const inputRef = useRef<TextInput>(null)
  const availableBalance = 1240.5
  
  // Use hook for responsive width detection
  const { width } = useWindowDimensions()
  const isMobileDevice = Platform.OS === 'ios' || Platform.OS === 'android'
  const isSmallScreen = width <= 768
  const showNumberPad = isMobileDevice // Only show number pad on actual mobile devices

  const handleQuickSelect = (percentage: string) => {
    const pct = parseInt(percentage) / 100
    if (pct === 1) {
      setAmount(availableBalance.toString())
    } else if (pct === 0) {
      setAmount('')
    } else {
      setAmount((availableBalance * pct).toFixed(2))
    }
  }

  const handleNumberPress = (value: string) => {
    // Prevent multiple decimal points
    if (value === '.' && amount.includes('.')) return
    // Limit decimal places to 2
    if (amount.includes('.')) {
      const decimals = amount.split('.')[1]
      if (decimals && decimals.length >= 2) return
    }
    setAmount(prev => prev + value)
  }

  const handleDelete = () => {
    setAmount(prev => prev.slice(0, -1))
  }

  const handleDecimal = () => {
    if (!amount.includes('.')) {
      setAmount(prev => (prev === '' ? '0.' : prev + '.'))
    }
  }

  const handleDisconnect = async () => {
    await disconnect()
    router.replace('/(tabs)' as any)
  }

  const displayAmount = amount || '0'

  return (
    <SafeAreaView style={[styles.container, isDark && styles.containerDark]} edges={['top']}>
      <AnimatedBackground isDark={isDark} />
      
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Icon name="arrow-back-ios" size={20} color={isDark ? colors.dark.text : colors.textPrimary} />
        </Pressable>
        <Text style={[styles.headerTitle, isDark && styles.textDark]}>Deposit USDC</Text>
        <View style={styles.headerRight}>
          <Pressable style={[styles.iconButton, isDark && styles.iconButtonDark]} onPress={toggleTheme}>
            <Icon name={isDark ? 'light-mode' : 'dark-mode'} size={20} color={isDark ? colors.dark.text : colors.textPrimary} />
          </Pressable>
        </View>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          showNumberPad && styles.scrollContentWithPad
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Amount Display Section */}
        <GlassCard isDark={isDark} intensity="medium" style={styles.amountCard}>
          <View style={styles.amountHeader}>
            <TokenIcon symbol="USDC" size={32} backgroundColor="#2775CA" />
            <Text style={[styles.amountLabel, isDark && styles.textSecondaryDark]}>
              Enter Amount in USDC
            </Text>
          </View>
          
          <Pressable 
            style={styles.amountDisplay}
            onPress={() => inputRef.current?.focus()}
          >
            <View style={styles.amountRow}>
              <Text style={[styles.currencySymbol, isDark && styles.textDark]}>$</Text>
              {showNumberPad ? (
                // Mobile: Show text display, use NumberPad for input
                <Text style={[styles.amountText, isDark && styles.textDark]}>
                  {displayAmount}
                </Text>
              ) : (
                // Web/Desktop: Show editable TextInput
                <TextInput
                  ref={inputRef}
                  style={[styles.amountInput, isDark && styles.amountInputDark]}
                  value={amount}
                  onChangeText={setAmount}
                  placeholder="0"
                  placeholderTextColor={isDark ? colors.dark.textSecondary : colors.textMuted}
                  keyboardType="decimal-pad"
                  autoFocus={false}
                />
              )}
              <Text style={[styles.currencyLabel, isDark && styles.textSecondaryDark]}>USDC</Text>
            </View>
          </Pressable>

          <Text style={[styles.minMaxText, isDark && styles.textSecondaryDark]}>
            Min $1 - Max ${availableBalance.toLocaleString()}
          </Text>

          <Text style={[styles.balanceText, isDark && styles.textDark]}>
            Current Balance: <Text style={styles.balanceValue}>${availableBalance.toLocaleString()} USDC</Text>
          </Text>
        </GlassCard>

        {/* Quick Percentage Buttons */}
        <View style={styles.percentageRow}>
          {QUICK_PERCENTAGES.map((pct) => (
            <Pressable
              key={pct}
              style={[
                styles.percentageButton,
                isDark && styles.percentageButtonDark,
              ]}
              onPress={() => handleQuickSelect(pct)}
            >
              <Text style={[styles.percentageText, isDark && styles.textSecondaryDark]}>
                {pct}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Privacy Card */}
        <GlassCard isDark={isDark} intensity="medium" style={styles.privacyCard}>
          <View style={styles.privacyHeader}>
            <View style={[styles.privacyIconContainer, isDark && styles.privacyIconContainerDark]}>
              <Icon name="shield" size={24} color={colors.primary} />
            </View>
            <View style={styles.privacyTextContainer}>
              <Text style={[styles.privacyTitle, isDark && styles.textDark]}>Privacy Shield</Text>
              <Text style={[styles.privacySubtitle, isDark && styles.textSecondaryDark]}>Powered by Arcium MXE</Text>
            </View>
            <Toggle value={privacyEnabled} onValueChange={setPrivacyEnabled} />
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

      {/* Footer with CTA */}
      <View style={[styles.footer, isDark && styles.footerDark]}>
        <Button
          title="DEPOSIT USDC"
          size="lg"
          fullWidth
          onPress={() => router.push({ pathname: '/grow-confirm', params: { amount: amount || '0', asset: 'USDC' } } as any)}
          disabled={!amount || parseFloat(amount) <= 0}
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
    fontFamily: fonts.headingSemiBold,
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
    // Enhanced Umbra-style soft shadow - more visible
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  iconButtonDark: {
    backgroundColor: colors.dark.card,
    borderColor: colors.dark.border,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    paddingTop: spacing.sm, // Add top padding for shadow visibility
  },
  scrollContentWithPad: {
    paddingBottom: spacing.xs, // Less padding when NumberPad is visible
  },
  amountCard: {
    alignItems: 'center',
    marginBottom: spacing.lg, // Increased margin for shadow space
    marginTop: spacing.sm, // Add top margin for shadow visibility
  },
  amountHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  amountLabel: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    fontFamily: fonts.regular,
  },
  amountDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
    minHeight: 60,
    width: '100%',
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  currencySymbol: {
    color: colors.textPrimary,
    fontSize: 40,
    fontFamily: fonts.bold,
  },
  amountText: {
    color: colors.textPrimary,
    fontSize: 48,
    fontFamily: fonts.bold,
    minWidth: 60,
    textAlign: 'center',
  },
  currencyLabel: {
    color: colors.textSecondary,
    fontSize: fontSize.xl,
    fontFamily: fonts.semiBold,
  },
  amountInput: {
    color: colors.textPrimary,
    fontSize: 48,
    fontFamily: fonts.bold,
    textAlign: 'center',
    minWidth: 150,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderWidth: 0,
    backgroundColor: 'transparent',
    outlineStyle: 'none',
  } as any,
  amountInputDark: {
    color: colors.dark.text,
  },
  minMaxText: {
    color: colors.textSecondary,
    fontSize: fontSize.xs,
    fontFamily: fonts.regular,
    marginBottom: spacing.md,
  },
  balanceText: {
    color: colors.textPrimary,
    fontSize: fontSize.sm,
    fontFamily: fonts.regular,
  },
  balanceValue: {
    fontFamily: fonts.semiBold,
  },
  percentageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm, // Added gap for better spacing
    paddingHorizontal: spacing.sm,
    marginBottom: spacing.lg,
  },
  percentageButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    // Enhanced Umbra-style soft shadow - more visible
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  percentageButtonDark: {
    backgroundColor: colors.dark.card,
    borderColor: colors.dark.border,
  },
  percentageText: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    fontFamily: fonts.medium,
  },
  privacyCard: {
    marginTop: spacing.sm, // Add margin for shadow visibility
  },
  privacyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  privacyIconContainer: {
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
  privacyIconContainerDark: {
    backgroundColor: 'rgba(19, 109, 236, 0.2)',
  },
  privacyTextContainer: {
    flex: 1,
  },
  privacyTitle: {
    color: colors.textPrimary,
    fontSize: fontSize.lg,
    fontFamily: fonts.headingBold,
  },
  privacySubtitle: {
    color: colors.textSecondary,
    fontSize: fontSize.xs,
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
})
