import { computed, ref, watch, type Ref } from 'vue'
import chipSoundUrl from '@/static/mp3/hash/chouma.mp3?url'
import type { HashGameBetChip } from '../useHashGameBetting'
import type { ChipOrigin } from './chipMotion'

type LandedChip = { id: number; amount: number; filter: string }
type ChipFlight = {
  id: number
  origin: ChipOrigin
  x: number
  y: number
  size: number
}

/** 根据投注状态显示筹码，已取消或过期的筹码也会从动画中移除。 */
export function useBetChipAnimation(options: {
  chips: Readonly<Ref<readonly HashGameBetChip[]>>
  chipTrack: Ref<HTMLElement | null>
  betGrid: Ref<HTMLElement | null>
  soundEnabled: Readonly<Ref<boolean>>
  slotSize: number
}) {
  const maxVisibleChips = 6
  const chipStackStep = (8 / 60) * options.slotSize
  const chipFlights = ref<ChipFlight[]>([])
  let latestChipId = Math.max(0, ...options.chips.value.map(chip => chip.id))
  const chipFilter = (hue: number) => `hue-rotate(${hue}deg)`
  const landedChips = computed(() => {
    const flyingIds = new Set(chipFlights.value.map(flight => flight.id))
    const stacks: Record<string, LandedChip[]> = {}
    for (const chip of options.chips.value) {
      if (flyingIds.has(chip.id)) continue
      const stack = stacks[chip.option] ?? []
      stack.push({ id: chip.id, amount: chip.amount, filter: chipFilter(chip.hue) })
      stacks[chip.option] = stack.slice(-maxVisibleChips)
    }
    return stacks
  })

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

  const animateChip = (chip: HashGameBetChip, layer: number) => {
    const stack = options.betGrid.value?.querySelector(
      `[data-bet-option="${chip.option}"] [data-chip-stack]`
    )
    const track = options.chipTrack.value
    const source =
      track?.querySelector(`[data-chip-value="${chip.amount}"]`) ??
      track?.querySelector('[data-chip-value][aria-pressed="true"]')
    if (!stack || !source) return
    const stackRect = stack.getBoundingClientRect()
    const sourceRect = source.getBoundingClientRect()
    if (!stackRect.width || !stackRect.height || !sourceRect.width || !sourceRect.height) return
    chipFlights.value.push({
      id: chip.id,
      origin: {
        amount: chip.amount,
        x: sourceRect.left + sourceRect.width / 2,
        y: sourceRect.top + sourceRect.height / 2,
        size: Math.min(sourceRect.width, sourceRect.height),
        filter: chipFilter(chip.hue)
      },
      x: stackRect.left + stackRect.width / 2,
      y:
        stackRect.top + stackRect.height / 2 - Math.min(layer, maxVisibleChips - 1) * chipStackStep,
      size: stackRect.width
    })
  }

  watch(
    options.chips,
    chips => {
      const ids = new Set(chips.map(chip => chip.id))
      chipFlights.value = chipFlights.value.filter(flight => ids.has(flight.id))
      const layers: Record<string, number> = {}
      let added = false
      for (const chip of chips) {
        const layer = layers[chip.option] ?? 0
        if (chip.id > latestChipId) {
          animateChip(chip, layer)
          added = true
        }
        layers[chip.option] = layer + 1
      }
      if (added) {
        latestChipId = Math.max(latestChipId, ...ids)
        playChipSound()
      }
    },
    { flush: 'post' }
  )

  const finishChipFlight = (id: number) => {
    chipFlights.value = chipFlights.value.filter(flight => flight.id !== id)
  }

  return { chipStackStep, landedChips, chipFlights, getChipStackOffset, finishChipFlight }
}
