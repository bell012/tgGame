import chipSvg from '@/static/svg/hash_game/chouma_bianji.svg?raw'

// 多币种筹码金额和筹码颜色
const PRESET_AMOUNTS = {
  CNY: [1, 5, 10, 20, 50, 100, 200, 500, 1000, 2000, 5000, 10000, 20000, 50000, 100000],
  PHP: [10, 20, 50, 100, 200, 500, 1000, 2000, 5000, 10000, 20000, 50000, 100000, 500000, 1000000],
  VND: [
    10000, 20000, 50000, 100000, 200000, 500000, 1000000, 2000000, 5000000, 10000000, 20000000,
    50000000, 100000000, 200000000, 500000000
  ]
}

// 每个配色依次定义外圈的顶部、底部和中央圆面，米色边块沿用原图。
export const CHIP_COLORS = {
  blue: ['#2469b5', '#183c76', '#164587'],
  green: ['#19a719', '#185c19', '#13840f'],
  gray: ['#535353', '#313131', '#464646'],
  rust: ['#a74113', '#66320d', '#88390e'],
  teal: ['#289ca8', '#155d71', '#136782'],
  lilac: ['#9161bd', '#573680', '#8050aa'],
  purple: ['#650eb6', '#390d69', '#52108c'],
  indigo: ['#2100b0', '#0e075f', '#1b0087'],
  skyBlue: ['#287ac4', '#22558f', '#2564a7'],
  emerald: ['#32a975', '#19664a', '#228459'],
  magenta: ['#b30d9d', '#650763', '#941181'],
  deepPurple: ['#5d0ea5', '#3b086a', '#53168c']
} as const

export type ChipColor = keyof typeof CHIP_COLORS
export type ChipOption = { id: number; value: number; color: ChipColor }

const PRESET_COLORS: readonly ChipColor[] = [
  'blue',
  'green',
  'gray',
  'rust',
  'teal',
  'lilac',
  'teal',
  'rust',
  'purple',
  'indigo',
  'skyBlue',
  'emerald',
  'magenta',
  'green',
  'deepPurple'
]
export const CUSTOM_CHIP_COLOR = 'teal'
export const CUSTOM_CHIP_IDS = Array.from({ length: 5 }, (_, index) => PRESET_COLORS.length + index)

export function getPresetChips(currency: string): ChipOption[] {
  const amounts =
    currency === 'PHP' || currency === 'VND' ? PRESET_AMOUNTS[currency] : PRESET_AMOUNTS.CNY
  return amounts.map((value, id) => ({ id, value, color: PRESET_COLORS[id] }))
}

const chipImages = new Map<ChipColor, string>()

export function getChipImage(color: ChipColor) {
  const existing = chipImages.get(color)
  if (existing) return existing
  const [top, bottom, center] = CHIP_COLORS[color]
  const svg = chipSvg.replace('#0E9DAA', top).replace('#155D71', bottom).replace('#006A85', center)
  const image = `data:image/svg+xml,${encodeURIComponent(svg)}`
  chipImages.set(color, image)
  return image
}

export function formatChipAmount(amount: number) {
  if (amount >= 1000000) return `${Number((amount / 1000000).toFixed(1))}M`
  if (amount >= 10000 || (amount >= 1000 && amount % 100 === 0)) {
    return `${Number((amount / 1000).toFixed(1))}K`
  }
  return String(amount)
}
