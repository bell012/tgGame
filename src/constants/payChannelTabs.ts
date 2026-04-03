export interface PayChannelTabConfigItem {
  key: string
  value: string
  i18nKey: string
}

export interface PayChannelTabOption extends PayChannelTabConfigItem {
  label: string
}

export const PAY_CHANNEL_TAB_LIST: PayChannelTabConfigItem[] = [
  { key: '1', value: '支付宝', i18nKey: 'config:支付宝' },
  { key: '2', value: '微信', i18nKey: 'config:微信' },
  { key: '3', value: '银行卡', i18nKey: 'config:银行卡' },
  { key: '4', value: '数字人民币', i18nKey: 'config:数字人民币' },
  { key: '5', value: 'QQ钱包', i18nKey: 'config:QQ钱包' },
  { key: '6', value: '云闪付', i18nKey: 'config:云闪付' },
  { key: '7', value: 'okPay', i18nKey: 'config:okPay' },
  { key: '8', value: '俄罗斯支付', i18nKey: 'config:俄罗斯支付' },
  { key: '9', value: '天域支付', i18nKey: 'config:天域支付' },
  { key: '10', value: '古思特代收', i18nKey: 'config:古思特代收' },
  { key: '11', value: '华耀代收', i18nKey: 'config:华耀代收' },
  { key: '12', value: '超越代收', i18nKey: 'config:超越代收' },
  { key: '13', value: '起源代收', i18nKey: 'config:起源代收' },
  { key: '14', value: '旭升代收', i18nKey: 'config:旭升代收' },
  { key: '15', value: '青桔代收', i18nKey: 'config:青桔代收' },
  { key: '16', value: '北境代收', i18nKey: 'config:北境代收' },
  { key: '17', value: '全胜支付', i18nKey: 'config:全胜支付' },
  { key: '18', value: 'U币', i18nKey: 'config:U币' },
  { key: '19', value: '365钱包', i18nKey: 'config:365钱包' },
  { key: '20', value: 'JD钱包', i18nKey: 'config:JD钱包' },
  { key: '21', value: 'K豆钱包', i18nKey: 'config:K豆钱包' },
  { key: '22', value: 'C币钱包', i18nKey: 'config:C币钱包' },
  { key: '23', value: '艺博代收', i18nKey: 'config:艺博代收' },
  { key: '24', value: '圣龙代收', i18nKey: 'config:圣龙代收' },
  { key: '25', value: '博威代收', i18nKey: 'config:博威代收' },
  { key: '26', value: 'GoPay', i18nKey: 'config:GoPay' },
  { key: '27', value: 'ToPay', i18nKey: 'config:ToPay' },
  { key: '28', value: 'TgPay', i18nKey: 'config:TgPay' },
  { key: '29', value: 'FPay', i18nKey: 'config:FPay' },
  { key: '30', value: 'EbPay', i18nKey: 'config:EbPay' },
  { key: '31', value: 'AbPay', i18nKey: 'config:AbPay' },
  { key: '32', value: '钱通钱包', i18nKey: 'config:钱通钱包' },
  { key: '33', value: '钱能钱包', i18nKey: 'config:钱能钱包' },
  { key: '34', value: '988钱包', i18nKey: 'config:988钱包' },
  { key: '35', value: '808钱包', i18nKey: 'config:808钱包' },
  { key: '36', value: '支付宝钱包', i18nKey: 'config:支付宝钱包' },
  { key: '37', value: '99钱包', i18nKey: 'config:99钱包' },
  { key: '38', value: '波币钱包', i18nKey: 'config:波币钱包' },
  { key: '39', value: 'GCash', i18nKey: 'config:GCash' },
  { key: '40', value: 'momo', i18nKey: 'config:momo' },
  { key: '41', value: 'PayPal', i18nKey: 'config:PayPal' },
  { key: '42', value: 'ZaloPay', i18nKey: 'config:ZaloPay' },
  { key: '43', value: 'MAYA', i18nKey: 'config:MAYA' },
  { key: '44', value: 'VNPay', i18nKey: 'config:VNPay' },
  { key: '45', value: 'USDT泰达币', i18nKey: 'config:USDT泰达币' },
  { key: '46', value: 'ByYes982', i18nKey: 'config:ByYes982' },
  { key: '47', value: 'USDC', i18nKey: 'config:USDC' },
  { key: '48', value: 'BTC', i18nKey: 'config:BTC' },
  { key: '49', value: 'ETH', i18nKey: 'config:ETH' },
  { key: '67', value: 'TG支付宝', i18nKey: 'config:TG支付宝' },
  { key: '68', value: 'TG微信', i18nKey: 'config:TG微信' },
  { key: '69', value: 'TG银行卡', i18nKey: 'config:TG银行卡' }
]

const normalizePayChannelValue = (value: unknown) =>
  String(value ?? '')
    .trim()
    .toLowerCase()

export const findPayChannelTab = (value: unknown) => {
  const normalizedValue = normalizePayChannelValue(value)
  if (!normalizedValue) return undefined

  return PAY_CHANNEL_TAB_LIST.find(item => normalizePayChannelValue(item.value) === normalizedValue)
}

export const resolvePayChannelTabKey = (value: unknown) => findPayChannelTab(value)?.key ?? ''

export const createPayChannelTabList = (t: (key: string) => string): PayChannelTabOption[] =>
  PAY_CHANNEL_TAB_LIST.map(item => ({
    ...item,
    label: t(item.i18nKey)
  }))
