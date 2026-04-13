export interface CoinNetworkItem {
  text: string
}

export interface CoinItem {
  name: string
  symbol: string
  bgColor: string
  networks: CoinNetworkItem[]
}

export const DEFAULT_COINS: CoinItem[] = [
  {
    name: 'USDT',
    symbol: '₮',
    bgColor: '#50AF95',
    networks: [
      { text: 'Tron (TRC20)' },
      { text: 'Tron (BEP2)' },
      { text: 'Tron (ERC20)' },
      { text: 'Tron (BEPSC)' }
    ]
  },
  {
    name: 'USDC',
    symbol: '$',
    bgColor: '#2775CA',
    networks: [{ text: 'TRC20' }, { text: 'BEP2' }, { text: 'ERC20' }, { text: 'BEPSC' }]
  },
  {
    name: 'BTC',
    symbol: '₿',
    bgColor: '#F7931A',
    networks: [{ text: 'TRC20' }, { text: 'BEP2' }, { text: 'ERC20' }, { text: 'BEPSC' }]
  },
  {
    name: 'ETH',
    symbol: 'Ξ',
    bgColor: '#627EEA',
    networks: [{ text: 'TRC20' }, { text: 'BEP2' }, { text: 'ERC20' }, { text: 'BEPSC' }]
  }
]

export const resolveCoinNetworks = (coinCode: string) => {
  return DEFAULT_COINS.find(item => item.name === coinCode)?.networks ?? []
}
