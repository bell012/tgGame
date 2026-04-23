export interface PayChannelTabConfigItem {
  key: string
  value: string
  i18nKey: string
  aliases?: string[]
}

export interface PayChannelTabOption extends PayChannelTabConfigItem {
  label: string
}

export const PAY_CHANNEL_TAB_LIST: PayChannelTabConfigItem[] = [
  { key: '0', value: '虚拟币', i18nKey: 'config:虚拟币' },
  { key: '1', value: '银联', i18nKey: 'config:银联' },
  { key: '2', value: '微信', i18nKey: 'config:微信' },
  { key: '3', value: '支付宝', i18nKey: 'config:支付宝' },
  { key: '4', value: 'VISA', i18nKey: 'config:VISA' },
  { key: '5', value: '泰达币USDT', i18nKey: 'config:泰达币USDT', aliases: ['USDT泰达币'] },
  { key: '8', value: '万事达', i18nKey: 'config:万事达' },
  { key: '9', value: 'PIX即时支付', i18nKey: 'config:PIX即时支付' },
  { key: '10', value: 'U币', i18nKey: 'config:U币' },
  { key: '11', value: '99钱包', i18nKey: 'config:99钱包' },
  { key: '12', value: 'VNPay', i18nKey: 'config:VNPay' },
  { key: '13', value: 'GCash', i18nKey: 'config:GCash' },
  { key: '14', value: 'momo', i18nKey: 'config:momo' },
  { key: '15', value: 'PayPal', i18nKey: 'config:PayPal' },
  { key: '16', value: 'ZaloPay', i18nKey: 'config:ZaloPay' },
  { key: '17', value: 'MAYA', i18nKey: 'config:MAYA' },
  { key: '18', value: 'GoPay', i18nKey: 'config:GoPay' },
  { key: '19', value: 'ToPay', i18nKey: 'config:ToPay' },
  { key: '20', value: 'CbrPay', i18nKey: 'config:CbrPay', aliases: ['C币钱包'] },
  { key: '21', value: 'KbyPay', i18nKey: 'config:KbyPay', aliases: ['K豆钱包'] },
  { key: '22', value: 'JdPay', i18nKey: 'config:JdPay', aliases: ['JD钱包'] },
  { key: '23', value: 'TgPay', i18nKey: 'config:TgPay' },
  { key: '24', value: 'OkPay', i18nKey: 'config:OkPay', aliases: ['okPay'] },
  { key: '25', value: 'FPay', i18nKey: 'config:FPay' },
  { key: '26', value: 'EbPay', i18nKey: 'config:EbPay' },
  { key: '27', value: 'BoBiPay', i18nKey: 'config:BoBiPay', aliases: ['波币钱包'] },
  { key: '28', value: 'AbPay', i18nKey: 'config:AbPay' },
  { key: '29', value: '钱通钱包', i18nKey: 'config:钱通钱包' },
  { key: '30', value: '钱能钱包', i18nKey: 'config:钱能钱包' },
  { key: '31', value: '988Pay', i18nKey: 'config:988Pay', aliases: ['988钱包'] },
  { key: '32', value: '808Pay', i18nKey: 'config:808Pay', aliases: ['808钱包'] },
  { key: '33', value: '365Pay', i18nKey: 'config:365Pay', aliases: ['365钱包'] },
  { key: '34', value: 'CbrUsdtPay', i18nKey: 'config:CbrUsdtPay' },
  { key: '35', value: '云闪付', i18nKey: 'config:云闪付' },
  { key: '36', value: '数字人民币', i18nKey: 'config:数字人民币' },
  { key: '37', value: '淘宝', i18nKey: 'config:淘宝' },
  { key: '38', value: 'QQ', i18nKey: 'config:QQ', aliases: ['QQ钱包'] },
  { key: '39', value: '支付宝快捷', i18nKey: 'config:支付宝快捷' },
  { key: '40', value: '微信快捷', i18nKey: 'config:微信快捷' },
  { key: '41', value: '银行卡快充', i18nKey: 'config:银行卡快充', aliases: ['银行卡'] },
  { key: '42', value: 'Upay钱包', i18nKey: 'config:Upay钱包' },
  { key: '43', value: '支付宝钱包', i18nKey: 'config:支付宝钱包' },
  { key: '44', value: 'USDT充值', i18nKey: 'config:USDT充值' },
  { key: '45', value: '俄罗斯支付', i18nKey: 'config:俄罗斯支付' },
  { key: '46', value: '天域支付', i18nKey: 'config:天域支付' },
  { key: '47', value: '全胜支付', i18nKey: 'config:全胜支付' },
  { key: '48', value: '北境支付', i18nKey: 'config:北境支付', aliases: ['北境代收'] },
  { key: '49', value: '青桔支付', i18nKey: 'config:青桔支付', aliases: ['青桔代收'] },
  { key: '50', value: '旭升支付', i18nKey: 'config:旭升支付', aliases: ['旭升代收'] },
  { key: '51', value: '艺博支付', i18nKey: 'config:艺博支付', aliases: ['艺博代收'] },
  { key: '52', value: '起源支付', i18nKey: 'config:起源支付', aliases: ['起源代收'] },
  { key: '53', value: '超越支付', i18nKey: 'config:超越支付', aliases: ['超越代收'] },
  { key: '54', value: '华耀支付', i18nKey: 'config:华耀支付', aliases: ['华耀代收'] },
  { key: '55', value: '古思特支付', i18nKey: 'config:古思特支付', aliases: ['古思特代收'] },
  { key: '56', value: '圣龙支付', i18nKey: 'config:圣龙支付', aliases: ['圣龙代收'] },
  { key: '57', value: '博威支付', i18nKey: 'config:博威支付', aliases: ['博威代收'] },
  { key: '58', value: '支付宝小额支付', i18nKey: 'config:支付宝小额支付' },
  { key: '59', value: 'GrabPay', i18nKey: 'config:GrabPay' },
  { key: '60', value: 'ShopeePay', i18nKey: 'config:ShopeePay' },
  { key: '61', value: '雷霆支付', i18nKey: 'config:雷霆支付' },
  { key: '62', value: '世界支付', i18nKey: 'config:世界支付' },
  { key: '63', value: 'ByYes982', i18nKey: 'config:ByYes982' },
  { key: '64', value: 'USDC', i18nKey: 'config:USDC' },
  { key: '65', value: 'BTC', i18nKey: 'config:BTC' },
  { key: '66', value: 'ETH', i18nKey: 'config:ETH' },
  { key: '67', value: 'TG支付宝', i18nKey: 'config:TG支付宝' },
  { key: '68', value: 'TG微信', i18nKey: 'config:TG微信' },
  { key: '69', value: 'TG银行卡', i18nKey: 'config:TG银行卡' },
  { key: '70', value: '全球付', i18nKey: 'config:全球付' },
  { key: '71', value: 'PG支付', i18nKey: 'config:PG支付' },
  { key: '72', value: '京东支付', i18nKey: 'config:京东支付' },
  { key: '73', value: '正元支付', i18nKey: 'config:正元支付' }
]

const normalizePayChannelValue = (value: unknown) =>
  String(value ?? '')
    .trim()
    .toLowerCase()

export const findPayChannelTab = (value: unknown) => {
  const normalizedValue = normalizePayChannelValue(value)
  if (!normalizedValue) return undefined

  return PAY_CHANNEL_TAB_LIST.find(item => {
    if (normalizePayChannelValue(item.value) === normalizedValue) {
      return true
    }

    return (item.aliases ?? []).some(alias => normalizePayChannelValue(alias) === normalizedValue)
  })
}

export const resolvePayChannelTabKey = (value: unknown) => findPayChannelTab(value)?.key ?? ''

export const createPayChannelTabList = (t: (key: string) => string): PayChannelTabOption[] =>
  PAY_CHANNEL_TAB_LIST.map(item => ({
    ...item,
    label: t(item.i18nKey)
  }))
