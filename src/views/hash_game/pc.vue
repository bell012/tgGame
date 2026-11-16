<template>
  <div class="mx-auto w-full max-w-[1296px] px-[14px] pt-[16px]">
    <nav
      class="mb-[16px] flex gap-[10px] overflow-x-auto rounded-[12px] bg-bg-2 px-[20px] py-[14px]"
    >
      <button
        v-for="period in periodOptions"
        :key="period"
        type="button"
        class="shrink-0 rounded-[6px] px-[12px] py-[10px] text-[14px]"
        :class="
          selectedPeriod === period
            ? 'bg-theme-primary font-bold text-text-4'
            : 'bg-bg-3 text-text-1'
        "
        :aria-pressed="selectedPeriod === period"
        @click="selectPeriod(period)"
      >
        {{ period }}s Hash
      </button>
    </nav>

    <div class="grid grid-cols-[minmax(0,2.3fr)_minmax(280px,1fr)] gap-[16px]">
      <main class="min-w-0 rounded-[12px] bg-bg-2 p-[24px]">
        <header class="mb-[36px] flex items-center justify-between">
          <div class="flex items-center gap-[10px]">
            <h1 class="text-[16px] font-bold text-text-1">{{ selectedPeriod }}s Hash</h1>
            <span class="rounded-[4px] bg-bg-3 px-[10px] py-[3px] text-[12px] text-text-2"
              >1.9 x</span
            >
          </div>
          <div class="flex gap-[10px]">
            <button
              type="button"
              class="flex items-center gap-[10px] rounded-[6px] bg-bg-3 px-[10px] py-[6px] text-[14px] text-text-2"
              @click="recentBetsOpen = true"
            >
              <RecentIcon class="size-[20px] text-icon-2" />{{ t('hashGame.recentBets') }}
            </button>
            <button
              type="button"
              class="flex items-center gap-[10px] rounded-[6px] bg-bg-3 px-[10px] py-[6px] text-[14px] text-text-2"
            >
              <RulesIcon class="size-[20px] text-icon-2" />{{ t('hashGame.gameRules') }}
            </button>
          </div>
        </header>

        <section class="grid grid-cols-[1fr_40px_1fr] items-center px-[12px] text-center">
          <div>
            <p class="text-[14px] font-[700] text-text-1">{{ t('hashGame.lastBlock') }}</p>
            <div class="mt-[6px] flex items-center justify-center gap-[2px]">
              <strong class="text-[24px] font-[700] text-text-1 underline underline-offset-1">{{
                mockRound.lastBlock
              }}</strong>
              <span
                class="rounded-[4px] bg-theme-primary px-[4px] py-[2px] text-[12px] text-text-4"
                >{{ t('hashGame.verify') }}</span
              >
            </div>
          </div>
          <div
            class="relative mx-auto grid size-[40px] place-items-center rounded-full border-[5px] border-secondary-10 border-l-bg-1 text-[16px] font-[700] text-text-1"
          >
            {{ mockRound.countdown }}
          </div>
          <div class="text-secondary-10">
            <p class="text-[14px] font-[700] text-secondary-10">
              {{ t('hashGame.currentBlock') }}
            </p>
            <strong
              class="mt-[6px] block text-[24px] text-secondary-10 font-[700] underline underline-offset-1"
              >{{ mockRound.currentBlock }}</strong
            >
          </div>
        </section>

        <div class="mb-[20px] flex items-center pl-[18%]">
          <ResultArrowIcon2 class="h-[15px] w-[120px] text-theme-primary" />
          <span class="text-[12px] font-[700] text-text-2"
            >{{ hashParts.before }}<b class="text-theme-primary">{{ hashParts.digit }}</b
            >{{ hashParts.after }}</span
          >
          <span class="mx-[4px] text-[14px] font-[700] text-text-2"
            >(<b class="text-secondary-2">{{ t('hashGame.odd') }}</b
            >、<b class="text-secondary-4">{{ t('hashGame.big') }}</b
            >)</span
          >
          <button
            type="button"
            class="flex items-center whitespace-nowrap text-[14px] font-[700] text-theme-primary"
            @click="openRecords"
          >
            {{ t('hashGame.history') }}
            <HistoryArrowIcon class="w-[16px] h-[16px] text-theme-primary" />
          </button>
        </div>

        <section class="mt-[0px]">
          <div
            class="relative mb-[20px] flex min-w-[150px] h-[30px] items-center justify-between gap-[12px]"
          >
            <div class="flex gap-[6px]">
              <button
                v-for="mode in roadmapModes"
                :key="mode"
                type="button"
                class="min-w-[150px] h-[30px] rounded-[6px] px-[12px] text-[14px]"
                :class="
                  roadmapMode === mode
                    ? 'bg-theme-primary font-[700] text-text-4'
                    : 'bg-bg-3 text-text-2'
                "
                @click="roadmapMode = mode"
              >
                {{ mode === 'size' ? t('hashGame.bigSmall') : t('hashGame.oddEven') }}
              </button>
            </div>
            <div class="flex items-center gap-[21px] whitespace-nowrap">
              <span class="flex items-center gap-[4px] text-[14px] font-[700] text-text-2">
                <i
                  class="grid size-[20px] place-items-center rounded-full bg-[#22A89A] text-[14px] not-italic text-white"
                  >{{ resultLabels.positive }}</i>{{ mockRound.positiveCount }}
              </span>
              <span class="flex items-center gap-[4px] text-[14px] font-[700] text-text-2">
                <i
                  class="grid size-[20px] place-items-center rounded-full bg-[#E63533] text-[14px] not-italic text-white"
                  >{{ resultLabels.negative }}</i>{{ mockRound.negativeCount }}
              </span>
            </div>
            <div class="flex items-center">
              <span class="text-[14px] text-secondary-8">{{ resultLabels.streak }}</span>
            </div>
            <div class="flex items-center gap-[10px]">
              <button
                v-for="sound in soundButtons"
                :key="sound.type"
                type="button"
                class="grid size-[30px] place-items-center rounded-[6px] bg-bg-3"
                :aria-label="sound.type === 'background' ? 'Background music' : 'Music'"
                :aria-pressed="sound.type === 'background' ? backgroundMusicEnabled : musicEnabled"
                @click="sound.type === 'background' ? toggleBackgroundMusic() : toggleMusic()"
              >
                <img
                  class="size-[18px] text-text-2"
                  :src="
                    sound.type === 'background'
                      ? backgroundMusicEnabled
                        ? backgroundMusicOnIcon
                        : backgroundMusicOffIcon
                      : musicEnabled
                        ? musicOnIcon
                        : musicOffIcon
                  "
                  alt=""
                />
              </button>
              <button
                type="button"
                ref="quickBetTriggerRef"
                class="grid size-[30px] place-items-center rounded-[6px] bg-bg-3"
                :aria-label="t('hashGame.quickBet')"
                :aria-expanded="quickBetPopupOpen"
                aria-controls="hash-game-quick-bet-popup"
                @click="toggleQuickBetPopup"
              >
                <SettingsIcon class="size-[18px] text-text-2" />
              </button>

              <!-- 快捷投注 -->
              <div
                v-if="quickBetPopupOpen"
                id="hash-game-quick-bet-popup"
                ref="quickBetPopupRef"
                class="absolute right-0 top-full z-10 mt-[8px] w-[440px]"
                @keydown.esc.stop.prevent="closeQuickBetPopup"
              >
                <QuickBetPopupContent
                  variant="pc"
                  :enabled="quickBetEnabled"
                  @toggle="toggleQuickBet"
                />
              </div>
            </div>
          </div>
          <div class="overflow-x-auto">
            <div class="flex w-max gap-[4px]">
              <div
                v-for="(column, columnIndex) in resultColumns"
                :key="columnIndex"
                class="grid grid-rows-5 gap-[4px]"
              >
                <span
                  v-for="cell in column"
                  :key="cell.id"
                  class="grid size-[20px] place-items-center rounded-full text-[14px] text-white"
                  :class="[
                    cell.positive ? 'bg-[#22A89A]' : 'bg-[#E63533]',
                    { invisible: !cell.filled }
                  ]"
                  >{{ cell.positive ? resultLabels.positive : resultLabels.negative }}</span
                >
              </div>
            </div>
          </div>
        </section>

        <section class="mt-[20px]">
          <div class="mb-[10px] flex items-center gap-[6px]">
            <h2 class="text-[16px] font-bold text-text-1">{{ t('hashGame.betting') }}</h2>
            <span
              class="rounded-[4px] bg-gradient-to-r from-[#0090FF] to-[#6200FF] px-[4px] py-[2px] text-[12px] font-bold text-white"
              >{{ t('hashGame.fairness') }}</span
            >
          </div>
          <div class="grid grid-cols-4 gap-[10px]">
            <div
              v-for="option in betOptions"
              :key="option.key"
              type="button"
              class="relative rounded-[8px] border border-input-1 bg-bg-3 px-[12px] pt-[16px] pb-[12px] text-left cursor-pointer"
              :class="{ 'border-theme-primary': selectedBet === option.key }"
              @click="selectBet(option.key)"
            >
              <span
                class="absolute top-[3px] left-[7px] text-[12px]"
                :class="selectedBet === option.key ? 'text-text-1' : 'text-text-2'"
                >{{ mockBet.odds }}</span
              >
              <strong
                class="mb-[12px] block text-center text-[24px] font-[700]"
                :style="{ color: option.color }"
                >{{ option.label }}</strong
              >
              <span class="flex items-center justify-center gap-[10px] text-[12px]">
                <span
                  class="flex items-center gap-[6px] rounded-[4px] bg-opacity-6 px-[6px] py-[4px]"
                  :class="selectedBet === option.key ? 'text-text-1' : 'text-text-2'"
                  ><PeopleIcon
                    class="size-[14px]"
                    :class="selectedBet === option.key ? 'text-icon-1' : 'text-icon-2'"
                  />{{ mockBet.people }}</span
                >
                <span
                  class="flex items-center gap-[6px] rounded-[4px] bg-opacity-6 px-[6px] py-[4px]"
                  :class="selectedBet === option.key ? 'text-text-1' : 'text-text-2'"
                  ><AmountIcon
                    class="size-[14px]"
                    :class="selectedBet === option.key ? 'text-icon-1' : 'text-icon-2'"
                  />{{ mockBet.amount }}</span
                >
              </span>
              <span class="mt-[10px] block h-[4px] overflow-hidden rounded bg-opacity-6">
                <i
                  class="block h-full rounded-[inherit]"
                  :style="{ width: mockBet.progress + '%', background: option.color }"
                />
              </span>
            </div>
          </div>
        </section>

        <!-- 编辑筹码 -->
        <section
          ref="chipTrackRef"
          class="scrollbar-none mt-[20px] flex touch-pan-x select-none items-center gap-[12px] overflow-x-auto overflow-y-hidden py-[4px] pb-[20px]"
          :class="isDraggingChips ? 'cursor-grabbing' : 'cursor-grab'"
          @pointerdown="onChipTrackPointerDown"
          @pointermove="onChipTrackPointerMove"
          @pointerup="onChipTrackPointerUp"
          @pointercancel="onChipTrackPointerCancel"
          @lostpointercapture="onChipTrackPointerCancel"
          @click.capture="suppressDraggedChipClick"
          @selectstart.prevent
          @dragstart.prevent
        >
          <button
            type="button"
            class="relative size-[50px] shrink-0"
            :aria-label="t('hashGame.editChips')"
            @click="openChipEditor"
          >
            <img :src="chipEditorImage" alt="" class="size-full object-contain" />
            <span
              class="absolute inset-0 grid place-items-center text-[12px] font-bold text-[#eee]"
            >
              {{ t('hashGame.edit') }}
            </span>
          </button>
          <button
            v-for="chip in chipOptions"
            :key="chip.id"
            type="button"
            class="relative size-[50px] shrink-0 rounded-full transition-transform"
            :class="selectedChip === chip.value ? 'scale-105' : ''"
            :aria-pressed="selectedChip === chip.value"
            @click="chooseChip(chip.value)"
          >
            <img
              :src="chipImage"
              alt=""
              class="size-full object-contain"
              :style="{ filter: 'hue-rotate(' + chip.hue + 'deg)' }"
            />
            <span
              class="absolute inset-0 grid place-items-center text-[18px] font-bold text-[#eee]"
              >{{ formatChipAmount(chip.value) }}</span
            >
          </button>
        </section>

        <footer class="mt-[0px] grid grid-cols-3 gap-[10px]">
          <button
            type="button"
            class="flex h-[40px] items-center justify-center gap-[8px] rounded-[8px] bg-bg-3 text-[14px] font-[700] text-text-1"
            @click="cancelSelection"
          >
            <CancelIcon class="size-[16px] text-icon-2" />{{ t('hashGame.cancel') }}
          </button>
          <button
            type="button"
            class="flex h-[40px] items-center justify-center gap-[8px] rounded-[8px] bg-bg-3 text-[14px] font-[700] text-text-1"
            @click="repeatSelection"
          >
            <RepeatIcon class="size-[16px] text-icon-2" />{{ t('hashGame.repeat') }}
          </button>
          <button
            type="button"
            class="flex h-[40px] items-center justify-center gap-[8px] rounded-[8px] bg-bg-3 text-[14px] font-[700] text-text-1"
          >
            <ConfirmIcon class="size-[16px] text-icon-2" />{{ t('hashGame.confirmBet') }}
          </button>
        </footer>
      </main>

      <!-- 聊天 -->
      <aside class="flex min-w-0 flex-col rounded-[12px] bg-bg-2 pt-[13px] px-[16px] pb-[16px]">
        <div class="min-h-0 flex-1 overflow-y-auto text-[14px] text-text-2">
          <p v-if="chatVisible">{{ t('hashGame.chat') }}</p>
        </div>
        <div class="flex items-center justify-between h-[44px] gap-[10px]">
          <div
            class="flex items-center justify-between flex-1 h-full rounded-[10px] bg-bg-3 py-[10px] px-[12px]"
          >
            <input
              v-model="chatDraft"
              class="flex-1 bg-transparent text-[14px] outline-none text-text-1 placeholder:text-text-3 pr-[2px]"
              :placeholder="t('hashGame.chat')"
            />
            <button type="button" :aria-label="t('hashGame.chat')">
              <img :src="emojiIcon" alt="" class="size-[24px] text-icon-2" />
            </button>
          </div>
          <div class="w-[44px] h-[44px] bg-bg-3 rounded-[10px] flex items-center justify-center">
            <button type="button" :aria-label="t('hashGame.chat')">
              <ChatIcon class="size-[22px] text-icon-2" />
            </button>
          </div>
        </div>
      </aside>
    </div>

    <!-- 投注记录弹窗 -->
    <RecentBetsPopup
      v-model:visible="recentBetsOpen"
      :currency-code="currentCurrencyCode"
      :currency-icon="currentCurrencyIcon"
      :balance-text="currentBalanceText"
      :period="selectedPeriod"
      :bets="recentBets"
      :summary="recentBetSummary"
    />
    <!-- 历史投注 -->
    <HistoryPopup v-model:visible="historyPopupOpen" :records="historyRecords" />
    <!-- 筹码设置 -->
    <ChipEditorPopup :page="props.page" />
  </div>
  <CommonFooter class="mt-[55px]" />
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import type { HashGamePageState } from './index'
import RecentBetsPopup from './components/RecentBetsPopup.vue'
import HistoryPopup from './components/HistoryPopup.vue'
import ChipEditorPopup from './components/ChipEditorPopup.vue'
import QuickBetPopupContent from './components/QuickBetPopupContent.vue'
import RecentIcon from '@/static/svg/hash_game/recent.svg?component'
import RulesIcon from '@/static/svg/hash_game/rules.svg?component'
import SettingsIcon from '@/static/svg/hash_game/shezhi.svg?component'
import CancelIcon from '@/static/svg/hash_game/cancel.svg?component'
import RepeatIcon from '@/static/svg/hash_game/repeat.svg?component'
import ConfirmIcon from '@/static/svg/hash_game/confirm.svg?component'
import PeopleIcon from '@/static/svg/hash_game/renshu.svg?component'
import AmountIcon from '@/static/svg/hash_game/jine.svg?component'
import ChatIcon from '@/static/svg/hash_game/liaotian.svg?component'
import HistoryArrowIcon from '@/static/svg/hash_game/jiantou_you.svg?component'
import ResultArrowIcon2 from '@/static/svg/hash_game/zhixiang2.svg?component'
import chipImage from '@/static/svg/hash_game/chouma.svg?url'
import chipEditorImage from '@/static/svg/hash_game/chouma_bianji.svg?url'
import backgroundMusicOnIcon from '@/static/svg/hash_game/beijing_kai.svg?url'
import backgroundMusicOffIcon from '@/static/svg/hash_game/beijing_guan.svg?url'
import musicOnIcon from '@/static/svg/hash_game/yinyue_kai.svg?url'
import musicOffIcon from '@/static/svg/hash_game/yinyue_guan.svg?url'
import emojiIcon from '@/static/svg/hash_game/biaoqing.svg?url'
import CommonFooter from '@/components/commonFooter.vue'

// PC 视图只保留聊天输入草稿；周期、路单、投注和开关都读写 index.ts 共享状态。
const props = defineProps<{ page: HashGamePageState }>()
const {
  t,
  selectedPeriod,
  periodOptions,
  roadmapMode,
  chipOptions,
  selectedChip,
  selectedBet,
  mockRound,
  hashParts,
  mockBet,
  resultLabels,
  resultColumns,
  betOptions,
  quickBetPopupOpen,
  quickBetEnabled,
  backgroundMusicEnabled,
  musicEnabled,
  chatVisible,
  currentCurrencyCode,
  currentCurrencyIcon,
  currentBalanceText,
  recentBets,
  recentBetSummary,
  historyPopupOpen,
  historyRecords,
  selectPeriod,
  openRecords,
  selectBet,
  chooseChip,
  cancelSelection,
  repeatSelection,
  openChipEditor,
  toggleQuickBetPopup,
  toggleQuickBet,
  closeQuickBetPopup,
  toggleBackgroundMusic,
  toggleMusic
} = props.page

const chatDraft = ref('')
const recentBetsOpen = ref(false)
const quickBetPopupRef = ref<HTMLElement | null>(null)
const quickBetTriggerRef = ref<HTMLElement | null>(null)
const chipTrackRef = ref<HTMLElement | null>(null)
const isDraggingChips = ref(false)
let chipPointerId: number | null = null
let chipDragStartX = 0
let chipDragStartScrollLeft = 0
let suppressChipClick = false
let clearChipClickTimer: ReturnType<typeof setTimeout> | undefined
const chipDragThreshold = 6

// 鼠标按住筹码栏并横向移动时记录起点；只有实际溢出时才启用拖动。
const onChipTrackPointerDown = (event: PointerEvent) => {
  if (event.pointerType !== 'mouse' || event.button !== 0) return
  const element = chipTrackRef.value
  if (!element || element.scrollWidth <= element.clientWidth) return

  if (clearChipClickTimer) clearTimeout(clearChipClickTimer)
  suppressChipClick = false
  chipPointerId = event.pointerId
  chipDragStartX = event.clientX
  chipDragStartScrollLeft = element.scrollLeft
}

// 超过拖动阈值后滚动筹码栏，并记录需要拦截浏览器合成点击。
const onChipTrackPointerMove = (event: PointerEvent) => {
  const element = chipTrackRef.value
  if (!element || event.pointerId !== chipPointerId) return
  if (!(event.buttons & 1)) {
    onChipTrackPointerCancel(event)
    return
  }

  const distance = event.clientX - chipDragStartX
  if (!isDraggingChips.value && Math.abs(distance) <= chipDragThreshold) return
  if (!isDraggingChips.value) {
    isDraggingChips.value = true
    suppressChipClick = true
    element.setPointerCapture(event.pointerId)
  }

  event.preventDefault()
  element.scrollLeft = Math.max(
    0,
    Math.min(element.scrollWidth - element.clientWidth, chipDragStartScrollLeft - distance)
  )
}

// 结束鼠标拖动并释放捕获；轻点仍由按钮自身的 click 事件处理。
const onChipTrackPointerUp = (event: PointerEvent) => {
  if (event.pointerId !== chipPointerId) return
  const element = chipTrackRef.value
  const wasDragging = isDraggingChips.value
  chipPointerId = null
  isDraggingChips.value = false
  if (element?.hasPointerCapture(event.pointerId)) element.releasePointerCapture(event.pointerId)

  if (wasDragging) {
    clearChipClickTimer = setTimeout(() => {
      suppressChipClick = false
      clearChipClickTimer = undefined
    }, 0)
  }
}

// 指针被系统取消或组件卸载时清理拖动状态。
const onChipTrackPointerCancel = (event: PointerEvent) => {
  if (event.pointerId !== chipPointerId) return
  const element = chipTrackRef.value
  chipPointerId = null
  isDraggingChips.value = false
  suppressChipClick = false
  if (clearChipClickTimer) clearTimeout(clearChipClickTimer)
  clearChipClickTimer = undefined
  if (element?.hasPointerCapture(event.pointerId)) element.releasePointerCapture(event.pointerId)
}

// 拖动结束后拦截合成 click，避免松开鼠标时误选筹码；键盘触发的 click 正常通过。
const suppressDraggedChipClick = (event: MouseEvent) => {
  if (!suppressChipClick || event.detail === 0) return
  suppressChipClick = false
  event.preventDefault()
  event.stopPropagation()
}

// 点击弹层与设置齿轮以外的区域时关闭弹层，不改动快捷投注开关值。
const handleQuickBetOutsidePointerDown = (event: PointerEvent) => {
  if (!quickBetPopupOpen.value || !(event.target instanceof Node)) return
  if (
    quickBetPopupRef.value?.contains(event.target) ||
    quickBetTriggerRef.value?.contains(event.target)
  ) {
    return
  }
  closeQuickBetPopup()
}

// 页面挂载期间监听外部点击，卸载时移除监听，避免重复绑定。
onMounted(() => document.addEventListener('pointerdown', handleQuickBetOutsidePointerDown))
onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', handleQuickBetOutsidePointerDown)
  if (clearChipClickTimer) clearTimeout(clearChipClickTimer)
  if (chipPointerId !== null) {
    const element = chipTrackRef.value
    if (element?.hasPointerCapture(chipPointerId)) element.releasePointerCapture(chipPointerId)
  }
})

const roadmapModes = ['size', 'parity'] as const
const soundButtons = [{ type: 'background' as const }, { type: 'music' as const }]

const formatChipAmount = (amount: number) => {
  if (amount >= 1000000) return `${Number((amount / 1000000).toFixed(1))}M`
  if (amount >= 10000) return `${Number((amount / 1000).toFixed(1))}K`
  return String(amount)
}
</script>
