import { ref } from 'vue'
import chipImage from '@/static/svg/hash_game/chouma.svg?url'
import chipSoundUrl from '@/static/mp3/hash/chouma.mp3?url'
import type { ChipOrigin } from './chipMotion'

type RefLike<T> = { value: T }
type ChipOption = { value: number; hue: number }
type LandedChip = { id: number; amount: number; filter: string }
type ChipFlight = {
  id: number
  option: string
  landedChip: LandedChip
  origin: ChipOrigin
  x: number
  y: number
  size: number
}

/** 为 H5 和 PC 共用投注筹码动画、金额累计、音效与清空逻辑。 */
export function useBetChipAnimation<Key extends string>(options: {
  selectedChip: RefLike<number>
  chipOptions: RefLike<readonly ChipOption[]>
  soundEnabled: RefLike<boolean>
  slotSize: number
  rightInset: number
  selectBet: (key: Key) => void
}) {
  const maxVisibleChips = 6
  const chipStackStep = (8 / 60) * options.slotSize
  const betTotals = ref<Record<string, number>>({})
  const landedChips = ref<Record<string, LandedChip[]>>({})
  const chipFlights = ref<ChipFlight[]>([])
  let sequence = 0

  /** 判断指定投注项是否已有本地下注金额。 */
  const hasBetAmount = (key: string) => (betTotals.value[key] || 0) > 0

  /** 计算金额徽标随当前筹码堆叠上移的距离。 */
  const getChipStackOffset = (key: string) =>
    Math.min(maxVisibleChips - 1, Math.max(0, (landedChips.value[key]?.length || 0) - 1)) *
    chipStackStep

  /** 在音效开关开启时播放一次下注筹码音效。 */
  const playChipSound = () => {
    if (!options.soundEnabled.value || typeof Audio === 'undefined') return
    const sound = new Audio(chipSoundUrl)
    void sound.play().catch(() => {})
  }

  /** 累加投注金额并创建飞向对应投注项的筹码动画。 */
  const handleBetOptionClick = (event: MouseEvent, key: Key) => {
    playChipSound()
    const target = event.currentTarget
    const selectedAmount = options.selectedChip.value
    const source = document.querySelector<HTMLElement>(`[data-chip-value="${selectedAmount}"]`)
    const id = ++sequence
    const hue = options.chipOptions.value.find(chip => chip.value === selectedAmount)?.hue ?? 0
    const chipElement = source?.querySelector('img')
    const landedChip = {
      id,
      amount: selectedAmount,
      filter: chipElement?.style.filter || `hue-rotate(${hue}deg)`
    }

    betTotals.value[key] = (betTotals.value[key] || 0) + selectedAmount
    options.selectBet(key)

    const visibleAndFlying =
      (landedChips.value[key]?.length || 0) +
      chipFlights.value.filter(flight => flight.option === key).length
    const layer = Math.min(visibleAndFlying, maxVisibleChips - 1)

    if (target instanceof HTMLElement && source) {
      const targetRect = target.getBoundingClientRect()
      const sourceRect = source.getBoundingClientRect()
      if (
        targetRect.width > 0 &&
        targetRect.height > 0 &&
        sourceRect.width > 0 &&
        sourceRect.height > 0
      ) {
        chipFlights.value.push({
          id,
          option: key,
          landedChip,
          origin: {
            image: chipImage,
            amount: selectedAmount,
            x: sourceRect.left + sourceRect.width / 2,
            y: sourceRect.top + sourceRect.height / 2,
            size: Math.min(sourceRect.width, sourceRect.height),
            filter: landedChip.filter
          },
          x: targetRect.right - options.rightInset - options.slotSize / 2,
          y:
            targetRect.top +
            targetRect.height * 0.48 +
            options.slotSize / 2 -
            layer * chipStackStep,
          size: Math.min(options.slotSize, targetRect.width * 0.3)
        })
        return
      }
    }

    if (visibleAndFlying < maxVisibleChips) {
      landedChips.value[key] = [...(landedChips.value[key] || []), landedChip]
    }
  }

  /** 动画结束后在堆叠未满时放置筹码，并移除飞行状态。 */
  const finishChipFlight = (id: number) => {
    const finishedFlight = chipFlights.value.find(flight => flight.id === id)
    if (
      finishedFlight &&
      (landedChips.value[finishedFlight.option]?.length || 0) < maxVisibleChips
    ) {
      landedChips.value[finishedFlight.option] = [
        ...(landedChips.value[finishedFlight.option] || []),
        finishedFlight.landedChip
      ]
    }
    chipFlights.value = chipFlights.value.filter(flight => flight.id !== id)
  }

  /** 清空投注金额、已放置筹码和正在飞行的筹码。 */
  const clearBetChips = () => {
    betTotals.value = {}
    landedChips.value = {}
    chipFlights.value = []
  }

  return {
    maxVisibleChips,
    chipStackStep,
    betTotals,
    landedChips,
    chipFlights,
    hasBetAmount,
    getChipStackOffset,
    handleBetOptionClick,
    finishChipFlight,
    clearBetChips
  }
}
