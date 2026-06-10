import type { LuckySpinPrize } from '../../shared/types'
import { useIsMobile } from '@/composables/useMediaQuery'
import { LUCKY_SPIN_ASSETS } from '../../shared/assets'
import { WHEEL_SEGMENT_COUNT } from '../../shared/constants'
import { LUCKY_SPIN_TOKENS, TICKET_PC_TOKENS } from '../../shared/design-tokens'
import { computed, type MaybeRefOrGetter, toValue } from 'vue'

/** 8 格转盘：第 0 格对齐 12 点方向（半格偏移） */
export const LUCKY_WHEEL_OFFSET_DEGREE = -22.5

/** 停转后 12 点扇形高亮闪烁总时长（约 3 次） */
export const LUCKY_WHEEL_HIGHLIGHT_DURATION_MS = 1200

/** GO 按钮按压反馈时长 */
export const LUCKY_WHEEL_GO_PRESS_MS = 180

export const LUCKY_WHEEL_DEFAULT_CONFIG = {
  offsetDegree: LUCKY_WHEEL_OFFSET_DEGREE,
  accelerationTime: 1200,
  decelerationTime: 2200,
  speed: 22,
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

const MOBILE_WHEEL_PRIZE_STYLE = {
  fontSize: LUCKY_WHEEL_DEFAULT_STYLE.fontSize,
  iconSize: 40,
  textTop: '14%',
  iconTop: '28%'
} as const

export const useLuckyWheelConfig = (prizesSource: MaybeRefOrGetter<LuckySpinPrize[]>) => {
  const isMobile = useIsMobile()
  const sortedPrizes = computed(() => sortPrizes(toValue(prizesSource)))

  const wheelPrizeStyle = computed(() =>
    isMobile.value
      ? MOBILE_WHEEL_PRIZE_STYLE
      : {
          fontSize: TICKET_PC_TOKENS.wheelPrizeFontSize,
          iconSize: TICKET_PC_TOKENS.wheelPrizeIconSize,
          textTop: TICKET_PC_TOKENS.wheelPrizeTextTop,
          iconTop: TICKET_PC_TOKENS.wheelPrizeIconTop
        }
  )

  const defaultStyle = computed(() => ({
    ...LUCKY_WHEEL_DEFAULT_STYLE,
    fontSize: wheelPrizeStyle.value.fontSize
  }))

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

      const { iconSize, iconTop, textTop, fontSize } = wheelPrizeStyle.value

      if (prize.icon) {
        imgs.push({
          src: prize.icon,
          top: iconTop,
          width: `${iconSize}px`,
          height: `${iconSize}px`
        })
      }

      return {
        imgs,
        fonts: [
          {
            text: prize.label,
            top: textTop,
            fontColor: '#FFFFFF',
            fontSize,
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
    defaultStyle,
    buttons: LUCKY_WHEEL_BUTTONS
  }
}
