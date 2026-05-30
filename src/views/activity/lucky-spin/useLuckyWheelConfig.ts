import type { LuckySpinPrize } from '@/components/common/lucky-spin/types'
import { LUCKY_SPIN_ASSETS } from '@/components/common/lucky-spin/assets'
import { WHEEL_SEGMENT_COUNT } from '@/components/common/lucky-spin/constants'
import { LUCKY_SPIN_TOKENS } from '@/components/common/lucky-spin/design-tokens'
import { computed, type MaybeRefOrGetter, toValue } from 'vue'

/** 8 格转盘：第 0 格对齐 12 点方向（半格偏移） */
export const LUCKY_WHEEL_OFFSET_DEGREE = -22.5

export const LUCKY_WHEEL_DEFAULT_CONFIG = {
  offsetDegree: LUCKY_WHEEL_OFFSET_DEGREE,
  accelerationTime: 2000,
  decelerationTime: 2000,
  speed: 20,
  /** 细分割线：露出 blocks 底色，替代扇区 PNG 抗锯齿造成的粗边 */
  gutter: '1px'
} as const

export const LUCKY_WHEEL_DEFAULT_STYLE = {
  fontColor: '#FFFFFF',
  fontSize: 13,
  fontWeight: '700',
  wordWrap: false
} as const

/** 透明占位，实际 GO 由外层按钮触发 */
export const LUCKY_WHEEL_BUTTONS = [{ radius: '1px', background: 'transparent' }] as const

const sortPrizes = (prizes: LuckySpinPrize[]) =>
  [...prizes].sort((a, b) => a.index - b.index).slice(0, WHEEL_SEGMENT_COUNT)

export const useLuckyWheelConfig = (prizesSource: MaybeRefOrGetter<LuckySpinPrize[]>) => {
  const sortedPrizes = computed(() => sortPrizes(toValue(prizesSource)))

  /** padding 仅由外层 disc inset 控制，避免与 blocks 双重收缩导致格位不绘制 */
  const blocks = computed(() => [
    {
      padding: '0px',
      background: LUCKY_SPIN_TOKENS.wheelInnerBg
    }
  ])

  const wheelPrizes = computed(() =>
    sortedPrizes.value.map((prize, index) => {
      const isLight = index % 2 === 0
      const segmentSrc = isLight
        ? LUCKY_SPIN_ASSETS.wheel.segmentLight
        : LUCKY_SPIN_ASSETS.wheel.segmentDark

      const imgs: Array<{
        src: string
        top?: string | number
        width?: string | number
        height?: string | number
      }> = [
        {
          src: segmentSrc,
          top: '0%',
          width: '100%',
          height: '100%'
        }
      ]

      if (prize.icon) {
        imgs.push({
          src: prize.icon,
          top: '28%',
          width: '40px',
          height: '40px'
        })
      }

      return {
        imgs,
        fonts: [
          {
            text: prize.label,
            top: '14%',
            fontColor: '#FFFFFF',
            fontSize: 13,
            fontWeight: '700',
            wordWrap: false
          }
        ]
      }
    })
  )

  return {
    sortedPrizes,
    blocks,
    wheelPrizes,
    defaultConfig: LUCKY_WHEEL_DEFAULT_CONFIG,
    defaultStyle: LUCKY_WHEEL_DEFAULT_STYLE,
    buttons: LUCKY_WHEEL_BUTTONS
  }
}
