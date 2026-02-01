import { clusterApiUrl } from '@solana/web3.js'
import { SolanaCluster } from '@wallet-ui/react-native-web3js'

export class AppConfig {
  static name = 'shadowlend'
  static uri = 'https://example.com'

  // Program Configuration
  static programId = 'EKPFnwquVeawEBxn5iaNw9NXpyh1Axto7P3C1EHBXScy'
  static arciumClusterOffset = 0
  
  static networks: SolanaCluster[] = [
    {
      id: 'solana:localnet',
      label: 'Localnet',
      url: 'http://127.0.0.1:8899',
    },
    {
      id: 'solana:devnet',
      label: 'Devnet',
      url: clusterApiUrl('devnet'),
    },
    {
      id: 'solana:testnet',
      label: 'Testnet',
      url: clusterApiUrl('testnet'),
    },
  ]
}
