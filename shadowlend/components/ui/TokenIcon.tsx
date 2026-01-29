import { View, Image, StyleSheet } from 'react-native'
import { colors } from '@/constants/theme'

interface TokenIconProps {
  symbol: string
  size?: number
  backgroundColor?: string
}

// Token logo URLs from popular CDNs
const TOKEN_LOGOS: Record<string, string> = {
  USDC: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png',
  SOL: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png',
  USDT: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB/logo.svg',
  RAY: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R/logo.png',
  JUP: 'https://static.jup.ag/jup/icon.png',
  BONK: 'https://arweave.net/hQiPZOsRZXGXBJd_82PhVdlM_hACsT_q6wqwf5cSY7I',
}

export function TokenIcon({ symbol, size = 44, backgroundColor }: TokenIconProps) {
  const logoUrl = TOKEN_LOGOS[symbol]

  if (!logoUrl) {
    // Fallback to colored circle with first letter
    return (
      <View style={[styles.fallback, { width: size, height: size, backgroundColor: backgroundColor || colors.primary }]}>
        <View style={styles.fallbackInner}>
          <Image
            source={{ uri: `https://ui-avatars.com/api/?name=${symbol}&background=random&color=fff&size=128` }}
            style={{ width: size, height: size, borderRadius: size / 2 }}
          />
        </View>
      </View>
    )
  }

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Image
        source={{ uri: logoUrl }}
        style={[styles.image, { width: size, height: size, borderRadius: size / 2 }]}
        resizeMode="cover"
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 9999,
    overflow: 'hidden',
    backgroundColor: colors.white,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  image: {
    borderRadius: 9999,
  },
  fallback: {
    borderRadius: 9999,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  fallbackInner: {
    width: '100%',
    height: '100%',
  },
})
