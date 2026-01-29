import { View, Text, StyleSheet, ScrollView, Pressable, Animated, Easing, TextInput, Modal } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { colors, spacing, fontSize, borderRadius, fonts } from '@/constants/theme'
import { Icon, AnimatedBackground, TokenIcon, GlassCard } from '@/components/ui'
import { useTheme } from '@/features/theme'
import { useState, useEffect, useRef } from 'react'

interface MarketAsset {
  id: string
  symbol: string
  name: string
  price: number
  change24h: number
  volume24h: number
  marketCap: number
  color: string
  supplyApy: number
  borrowApy: number
}

const MARKET_DATA: MarketAsset[] = [
  {
    id: 'sol',
    symbol: 'SOL',
    name: 'Solana',
    price: 142.50,
    change24h: 5.2,
    volume24h: 1240000000,
    marketCap: 62000000000,
    color: '#9945FF',
    supplyApy: 5.8,
    borrowApy: 8.2,
  },
  {
    id: 'usdc',
    symbol: 'USDC',
    name: 'USD Coin',
    price: 1.00,
    change24h: 0.01,
    volume24h: 8500000000,
    marketCap: 32000000000,
    color: '#2775CA',
    supplyApy: 8.2,
    borrowApy: 10.5,
  },
  {
    id: 'usdt',
    symbol: 'USDT',
    name: 'Tether',
    price: 1.00,
    change24h: -0.02,
    volume24h: 45000000000,
    marketCap: 95000000000,
    color: '#26A17B',
    supplyApy: 7.5,
    borrowApy: 9.8,
  },
  {
    id: 'ray',
    symbol: 'RAY',
    name: 'Raydium',
    price: 2.85,
    change24h: 12.4,
    volume24h: 85000000,
    marketCap: 420000000,
    color: '#5AC4BE',
    supplyApy: 12.5,
    borrowApy: 15.2,
  },
  {
    id: 'jup',
    symbol: 'JUP',
    name: 'Jupiter',
    price: 0.92,
    change24h: 8.7,
    volume24h: 320000000,
    marketCap: 1200000000,
    color: '#00D4AA',
    supplyApy: 6.2,
    borrowApy: 9.1,
  },
]

const formatNumber = (num: number): string => {
  if (num >= 1e9) return `$${(num / 1e9).toFixed(1)}B`
  if (num >= 1e6) return `$${(num / 1e6).toFixed(1)}M`
  return `$${num.toLocaleString()}`
}

const formatPrice = (price: number): string => {
  if (price < 0.01) return `$${price.toFixed(6)}`
  if (price < 1) return `$${price.toFixed(4)}`
  return `$${price.toFixed(2)}`
}

export function MarketScreen() {
  const { isDark, toggleTheme } = useTheme()
  const [assets] = useState<MarketAsset[]>(MARKET_DATA)
  const [filteredAssets, setFilteredAssets] = useState<MarketAsset[]>(MARKET_DATA)
  const [searchQuery, setSearchQuery] = useState('')
  const [showSearch, setShowSearch] = useState(false)
  const fadeAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start()
  }, [])

  // Filter assets based on search query
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredAssets(assets)
    } else {
      const query = searchQuery.toLowerCase()
      const filtered = assets.filter(
        asset =>
          asset.symbol.toLowerCase().includes(query) ||
          asset.name.toLowerCase().includes(query)
      )
      setFilteredAssets(filtered)
    }
  }, [searchQuery, assets])

  // Calculate totals
  const totalMarketCap = filteredAssets.reduce((sum, a) => sum + a.marketCap, 0)
  const totalVolume = filteredAssets.reduce((sum, a) => sum + a.volume24h, 0)

  return (
    <SafeAreaView style={[styles.container, isDark && styles.containerDark]} edges={['top']}>
      <AnimatedBackground isDark={isDark} />
      
      <View style={styles.header}>
        <Text style={[styles.headerTitle, isDark && styles.textDark]}>Market</Text>
        <View style={styles.headerRight}>
          <Pressable 
            style={[styles.searchButton, isDark && styles.searchButtonDark]} 
            onPress={() => setShowSearch(true)}
          >
            <Icon name="search" size={20} color={isDark ? colors.dark.text : colors.textPrimary} />
          </Pressable>
          <Pressable style={[styles.themeButton, isDark && styles.themeButtonDark]} onPress={toggleTheme}>
            <Icon name={isDark ? 'light-mode' : 'dark-mode'} size={20} color={isDark ? colors.dark.text : colors.textPrimary} />
          </Pressable>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Market Overview */}
        <Animated.View style={[styles.overviewSection, { opacity: fadeAnim }]}>
          <Text style={[styles.sectionTitle, isDark && styles.textDark]}>Overview</Text>
          <View style={styles.overviewCards}>
            <GlassCard isDark={isDark} intensity="medium" style={styles.overviewCard}>
              <Text style={[styles.overviewLabel, isDark && styles.textSecondaryDark]}>Total Market Cap</Text>
              <Text style={[styles.overviewValue, isDark && styles.textDark]}>{formatNumber(totalMarketCap)}</Text>
            </GlassCard>
            <GlassCard isDark={isDark} intensity="medium" style={styles.overviewCard}>
              <Text style={[styles.overviewLabel, isDark && styles.textSecondaryDark]}>24h Volume</Text>
              <Text style={[styles.overviewValue, isDark && styles.textDark]}>{formatNumber(totalVolume)}</Text>
            </GlassCard>
          </View>
        </Animated.View>

        {/* Assets List */}
        <Animated.View style={[styles.assetsSection, { opacity: fadeAnim }]}>
          <Text style={[styles.sectionTitle, isDark && styles.textDark]}>Assets</Text>
          {filteredAssets.length === 0 ? (
            <View style={styles.emptyState}>
              <Icon name="search-off" size={48} color={isDark ? colors.dark.textSecondary : colors.textSecondary} />
              <Text style={[styles.emptyText, isDark && styles.textSecondaryDark]}>
                No assets found matching "{searchQuery}"
              </Text>
            </View>
          ) : (
            <View style={styles.assetsList}>
              {filteredAssets.map((asset) => (
              <GlassCard key={asset.id} isDark={isDark} intensity="medium">
                <View style={styles.assetCardContent}>
                  <TokenIcon symbol={asset.symbol} size={44} backgroundColor={asset.color} />
                  <View style={styles.assetInfo}>
                    <Text style={[styles.assetSymbol, isDark && styles.textDark]}>{asset.symbol}</Text>
                    <Text style={[styles.assetName, isDark && styles.textSecondaryDark]}>{asset.name}</Text>
                  </View>
                  <View style={styles.apyInfo}>
                    <Text style={[styles.apyLabel, isDark && styles.textSecondaryDark]}>Supply APY</Text>
                    <Text style={styles.apyValue}>{asset.supplyApy}%</Text>
                  </View>
                  <View style={styles.assetPrice}>
                    <Text style={[styles.priceValue, isDark && styles.textDark]}>{formatPrice(asset.price)}</Text>
                    <Text style={[styles.priceChange, asset.change24h >= 0 ? styles.positive : styles.negative]}>
                      {asset.change24h >= 0 ? '+' : ''}{asset.change24h.toFixed(2)}%
                    </Text>
                  </View>
                </View>
              </GlassCard>
            ))}
          </View>
          )}
        </Animated.View>

        {/* Privacy Note */}
        <View style={[styles.privacyNote, isDark && styles.privacyNoteDark]}>
          <Icon name="shield" size={20} color={colors.primary} />
          <Text style={[styles.privacyNoteText, isDark && { color: colors.primary }]}>
            All lending and borrowing on ShadowLend is privacy-protected via Arcium MXE.
          </Text>
        </View>
      </ScrollView>

      {/* Search Modal */}
      <Modal
        visible={showSearch}
        animationType="fade"
        transparent
        onRequestClose={() => setShowSearch(false)}
      >
        <Pressable 
          style={styles.modalOverlay} 
          onPress={() => setShowSearch(false)}
        >
          <Pressable 
            style={[styles.searchModal, isDark && styles.searchModalDark]}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.searchHeader}>
              <View style={[styles.searchInputContainer, isDark && styles.searchInputContainerDark]}>
                <Icon name="search" size={20} color={isDark ? colors.dark.textSecondary : colors.textSecondary} />
                <TextInput
                  style={[styles.searchInput, isDark && styles.searchInputDark]}
                  placeholder="Search assets..."
                  placeholderTextColor={isDark ? colors.dark.textSecondary : colors.textSecondary}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  autoFocus
                />
                {searchQuery.length > 0 && (
                  <Pressable onPress={() => setSearchQuery('')}>
                    <Icon name="close" size={20} color={isDark ? colors.dark.textSecondary : colors.textSecondary} />
                  </Pressable>
                )}
              </View>
              <Pressable onPress={() => setShowSearch(false)} style={styles.cancelButton}>
                <Text style={[styles.cancelText, isDark && { color: colors.dark.accent }]}>Cancel</Text>
              </Pressable>
            </View>

            {/* Quick Results */}
            <ScrollView style={styles.searchResults}>
              {filteredAssets.map((asset) => (
                <Pressable
                  key={asset.id}
                  style={[styles.searchResultItem, isDark && styles.searchResultItemDark]}
                  onPress={() => {
                    setShowSearch(false)
                    // Could navigate to asset detail here
                  }}
                >
                  <TokenIcon symbol={asset.symbol} size={36} backgroundColor={asset.color} />
                  <View style={styles.searchResultInfo}>
                    <Text style={[styles.searchResultSymbol, isDark && styles.textDark]}>{asset.symbol}</Text>
                    <Text style={[styles.searchResultName, isDark && styles.textSecondaryDark]}>{asset.name}</Text>
                  </View>
                  <View style={styles.searchResultPrice}>
                    <Text style={[styles.searchResultPriceValue, isDark && styles.textDark]}>
                      ${formatPrice(asset.price)}
                    </Text>
                    <Text style={[styles.searchResultChange, asset.change24h >= 0 ? styles.positive : styles.negative]}>
                      {asset.change24h >= 0 ? '+' : ''}{asset.change24h.toFixed(2)}%
                    </Text>
                  </View>
                </Pressable>
              ))}
              {filteredAssets.length === 0 && searchQuery.length > 0 && (
                <View style={styles.noResults}>
                  <Icon name="search-off" size={48} color={isDark ? colors.dark.textSecondary : colors.textSecondary} />
                  <Text style={[styles.noResultsText, isDark && styles.textSecondaryDark]}>
                    No assets found
                  </Text>
                </View>
              )}
            </ScrollView>
          </Pressable>
        </Pressable>
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
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  searchButton: {
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
  searchButtonDark: {
    backgroundColor: colors.dark.card,
    borderColor: colors.dark.border,
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
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xxl,
    paddingTop: spacing.sm, // Add top padding for shadow visibility
  },
  overviewSection: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: fontSize.lg,
    fontFamily: fonts.headingSemiBold,
    marginBottom: spacing.md,
  },
  overviewCards: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.xs, // Add margin for shadow visibility
  },
  overviewCard: {
    flex: 1,
    alignItems: 'flex-start',
    gap: spacing.xs,
  },
  overviewLabel: {
    color: colors.textSecondary,
    fontSize: fontSize.xs,
    fontFamily: fonts.medium,
  },
  overviewValue: {
    color: colors.textPrimary,
    fontSize: fontSize.xl,
    fontFamily: fonts.headingBold,
  },
  assetsSection: {
    marginBottom: spacing.lg,
  },
  assetsList: {
    gap: spacing.sm,
    marginTop: spacing.xs, // Add margin for shadow visibility
  },
  assetCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  assetInfo: {
    flex: 1,
    gap: 2,
  },
  assetSymbol: {
    color: colors.textPrimary,
    fontSize: fontSize.md,
    fontFamily: fonts.headingSemiBold,
  },
  assetName: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
  },
  apyInfo: {
    alignItems: 'center',
    gap: 2,
  },
  apyLabel: {
    color: colors.textSecondary,
    fontSize: fontSize.xs,
  },
  apyValue: {
    color: colors.success,
    fontSize: fontSize.md,
    fontFamily: fonts.headingBold,
  },
  assetPrice: {
    alignItems: 'flex-end',
    gap: 2,
    minWidth: 80,
  },
  priceValue: {
    color: colors.textPrimary,
    fontSize: fontSize.md,
    fontFamily: fonts.headingSemiBold,
  },
  priceChange: {
    fontSize: fontSize.sm,
    fontFamily: fonts.medium,
  },
  positive: {
    color: colors.success,
  },
  negative: {
    color: colors.error,
  },
  privacyNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primaryLight,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginTop: spacing.md,
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
  // Search Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-start',
    paddingTop: spacing.xxl,
  },
  searchModal: {
    backgroundColor: colors.white,
    borderTopLeftRadius: borderRadius.xxl,
    borderTopRightRadius: borderRadius.xxl,
    flex: 1,
    marginTop: spacing.xl,
  },
  searchModalDark: {
    backgroundColor: colors.dark.background,
  },
  searchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.backgroundLight,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.md,
    height: 44,
  },
  searchInputContainerDark: {
    backgroundColor: colors.dark.card,
  },
  searchInput: {
    flex: 1,
    fontSize: fontSize.md,
    color: colors.textPrimary,
    fontFamily: fonts.regular,
  },
  searchInputDark: {
    color: colors.dark.text,
  },
  cancelButton: {
    paddingHorizontal: spacing.sm,
  },
  cancelText: {
    color: colors.primary,
    fontSize: fontSize.md,
    fontFamily: fonts.semiBold,
  },
  searchResults: {
    flex: 1,
  },
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  searchResultItemDark: {
    borderBottomColor: colors.dark.border,
  },
  searchResultInfo: {
    flex: 1,
    gap: 2,
  },
  searchResultSymbol: {
    color: colors.textPrimary,
    fontSize: fontSize.md,
    fontFamily: fonts.headingSemiBold,
  },
  searchResultName: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
  },
  searchResultPrice: {
    alignItems: 'flex-end',
    gap: 2,
  },
  searchResultPriceValue: {
    color: colors.textPrimary,
    fontSize: fontSize.md,
    fontFamily: fonts.headingSemiBold,
  },
  searchResultChange: {
    fontSize: fontSize.sm,
    fontFamily: fonts.medium,
  },
  noResults: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl,
    gap: spacing.md,
  },
  noResultsText: {
    color: colors.textSecondary,
    fontSize: fontSize.md,
  },
})
