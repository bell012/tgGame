<template>
  <div class="mx-auto w-full max-w-[1296px] px-[14px] pt-[16px]">
    <nav
      ref="gameTabsRef"
      class="scrollbar-none mb-[16px] flex select-none gap-[10px] overflow-x-auto overscroll-x-contain rounded-[12px] bg-bg-2 px-[20px] py-[14px]"
      :class="isDraggingGameTabs ? 'cursor-grabbing' : 'cursor-grab'"
      :aria-label="t('hashGame.games')"
    >
      <button
        v-for="game in hashGames"
        :key="game.gameCode"
        data-scroll-center
        type="button"
        class="shrink-0 rounded-[6px] px-[12px] py-[10px] text-[14px]"
        :class="
          selectedHashGameCode === game.gameCode
            ? 'bg-theme-primary font-bold text-text-4'
            : 'bg-bg-3 text-text-1'
        "
        :aria-pressed="selectedHashGameCode === game.gameCode"
        @click="selectHashGame(game.gameCode)"
      >
        {{ game.gameName }}
      </button>
    </nav>

    <div class="grid grid-cols-[minmax(0,2.3fr)_minmax(280px,1fr)] gap-[16px]">
      <main class="min-w-0 rounded-[12px] bg-bg-2 p-[24px]">
        <header class="mb-[36px] flex items-center justify-between">
          <div class="flex items-center gap-[10px]">
            <h1 class="text-[16px] font-bold text-text-1">{{ hashGameName }}</h1>
            <span
              v-if="defaultOdds !== '—'"
              class="rounded-[4px] bg-bg-3 px-[10px] py-[3px] text-[12px] text-text-2"
              >{{ defaultOdds }} x</span
            >
          </div>
          <div class="flex gap-[10px]">
            <button
              type="button"
              class="flex items-center gap-[10px] rounded-[6px] bg-bg-3 px-[10px] py-[6px] text-[14px] text-text-2"
              @click="openRecentBets"
            >
              <RecentIcon class="size-[20px] text-icon-2" />{{ t('hashGame.recentBets') }}
            </button>
            <button
              type="button"
              class="flex items-center gap-[10px] rounded-[6px] bg-bg-3 px-[10px] py-[6px] text-[14px] text-text-2"
              @click="rulesPopupOpen = true"
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
                round.lastBlock
              }}</strong>
              <a
                v-if="round.explorerUrl"
                :href="round.explorerUrl"
                target="_blank"
                rel="noopener noreferrer"
                class="rounded-[4px] bg-theme-primary px-[4px] py-[2px] text-[12px] text-text-4"
                >{{ t('hashGame.verify') }}</a
              >
            </div>
          </div>
          <div
            class="relative mx-auto grid size-[40px] place-items-center rounded-full border-[5px] border-secondary-10 border-l-bg-1 text-[16px] font-[700] text-text-1"
          >
            {{ round.countdown }}
          </div>
          <div class="text-secondary-10">
            <p class="text-[14px] font-[700] text-secondary-10">
              {{ t('hashGame.currentBlock') }}
            </p>
            <strong
              class="mt-[6px] block text-[24px] text-secondary-10 font-[700] underline underline-offset-1"
              >{{ round.currentBlock }}</strong
            >
          </div>
        </section>

        <div class="mb-[20px] flex items-center pl-[18%]">
          <ResultArrowIcon2 class="h-[15px] w-[120px] text-theme-primary" />
          <span class="text-[12px] font-[700] text-text-2"
            >{{ hashParts.before }}<b class="text-theme-primary">{{ hashParts.digit }}</b
            >{{ hashParts.after }}</span
          >
          <span v-if="roundOutcome" class="mx-[4px] text-[14px] font-[700] text-theme-primary">
            ({{ roundOutcome }})
          </span>
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
            <div v-if="roadmapModes.length > 1" class="flex gap-[6px]">
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
              <span
                v-for="entry in roadmap.counts"
                :key="entry.key"
                class="flex items-center gap-[4px] text-[14px] font-[700] text-text-2"
              >
                <i
                  class="grid size-[20px] place-items-center rounded-full text-[14px] not-italic text-white"
                  :style="{ background: entry.color }"
                  >{{ entry.label }}</i
                >{{ entry.count }}
              </span>
            </div>
            <div class="flex items-center">
              <span class="text-[14px] text-secondary-8">{{ roadmap.streak }}</span>
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
          <div
            v-if="roadmap.columns.length"
            ref="roadmapViewport"
            class="select-none overflow-x-auto overscroll-x-contain"
            :class="isDraggingRoadmap ? 'cursor-grabbing' : 'cursor-grab'"
            :aria-label="t('hashGame.history')"
            tabindex="0"
          >
            <div class="flex w-max gap-[4px]">
              <div
                v-for="(column, columnIndex) in roadmap.columns"
                :key="columnIndex"
                class="grid grid-rows-5 gap-[4px]"
              >
                <span
                  v-for="(cell, rowIndex) in column"
                  :key="rowIndex"
                  class="grid size-[20px] place-items-center rounded-full text-[14px] text-white"
                  :class="{ invisible: !cell }"
                  :style="{ background: cell?.color }"
                  :aria-hidden="!cell"
                  >{{ cell?.label }}</span
                >
              </div>
            </div>
          </div>
          <p
            v-else-if="roadmap.emptyMessage"
            class="py-3 text-center text-sm text-text-3"
            role="status"
          >
            {{ roadmap.emptyMessage }}
          </p>
        </section>

        <section class="mt-[20px]">
          <div class="mb-[10px] flex items-center gap-[6px]">
            <h2 class="text-[16px] font-bold text-text-1">{{ t('hashGame.betting') }}</h2>
            <span
              class="rounded-[4px] bg-gradient-to-r from-[#0090FF] to-[#6200FF] px-[4px] py-[2px] text-[12px] font-bold text-white"
              >{{ t('hashGame.fairness') }}</span
            >
          </div>
          <div ref="betGridRef" class="grid gap-[10px]" :style="betGridStyle">
            <div
              v-for="option in betOptions"
              :key="option.key"
              :data-bet-option="option.key"
              type="button"
              class="relative rounded-[8px] border border-input-1 bg-bg-3 px-[12px] pt-[16px] pb-[12px] text-left cursor-pointer"
              :class="{ 'border-theme-primary': hasBetAmount(option.key) }"
              :aria-pressed="hasBetAmount(option.key)"
              :disabled="betBusy"
              @click="selectBet(option.key)"
            >
              <span
                v-if="hasBetAmount(option.key)"
                class="pointer-events-none absolute right-[30px] z-[2] flex w-max translate-x-1/2 items-center justify-center rounded-[36px] bg-theme-primary px-[8px] py-[0px] text-[10px] font-[700] text-text-4 transition-[top] duration-200"
                :style="{ top: `calc(48% - 6px - ${getChipStackOffset(option.key)}px)` }"
              >
                {{ betTotals[option.key] }}
              </span>
              <span
                class="pointer-events-none absolute right-[12px] top-[50%] z-[1] size-[36px] text-[12px]"
                data-chip-stack
                aria-hidden="true"
              >
                <span
                  v-for="(chip, layer) in landedChips[option.key] || []"
                  :key="chip.id"
                  class="absolute inset-0"
                  :style="{
                    transform: `translateY(${-layer * chipStackStep}px)`,
                    zIndex: layer + 1
                  }"
                >
                  <BetChip :amount="chip.amount" :filter="chip.filter" />
                </span>
              </span>
              <span
                class="absolute top-[3px] left-[7px] text-[12px]"
                :class="hasBetAmount(option.key) ? 'text-text-1' : 'text-text-2'"
                >{{ option.odds }}</span
              >
              <strong
                class="mb-[12px] block text-center text-[24px] font-[700]"
                :style="{ color: option.color }"
                >{{ option.label }}</strong
              >
              <span class="flex items-center justify-center gap-[10px] text-[12px]">
                <span
                  class="flex items-center gap-[6px] rounded-[4px] bg-opacity-6 px-[6px] py-[4px]"
                  :class="hasBetAmount(option.key) ? 'text-text-1' : 'text-text-2'"
                  ><PeopleIcon
                    class="size-[14px]"
                    :class="hasBetAmount(option.key) ? 'text-icon-1' : 'text-icon-2'"
                  />{{ option.people }}</span
                >
                <span
                  class="flex items-center gap-[6px] rounded-[4px] bg-opacity-6 px-[6px] py-[4px]"
                  :class="hasBetAmount(option.key) ? 'text-text-1' : 'text-text-2'"
                  ><AmountIcon
                    class="size-[14px]"
                    :class="hasBetAmount(option.key) ? 'text-icon-1' : 'text-icon-2'"
                  />{{ option.amount }}</span
                >
              </span>
              <span class="mt-[10px] block h-[4px] overflow-hidden rounded bg-opacity-6">
                <i
                  class="block h-full rounded-[inherit]"
                  :style="{ width: option.progress + '%', background: option.color }"
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
        >
          <button
            type="button"
            class="relative size-[50px] shrink-0 brightness-[0.7]"
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
            :data-chip-value="chip.value"
            data-scroll-center
            type="button"
            class="relative size-[50px] shrink-0 rounded-full brightness-[0.7] transition-[filter] duration-[180ms] aria-pressed:brightness-100 motion-reduce:transition-none"
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

        <footer
          class="mt-[0px] grid gap-[10px]"
          :class="quickBetEnabled ? 'grid-cols-2' : 'grid-cols-3'"
        >
          <button
            type="button"
            class="flex h-[40px] items-center justify-center gap-[8px] rounded-[8px] bg-bg-3 text-[14px] font-[700] text-text-1 disabled:opacity-50"
            :disabled="!canCancelBet"
            @click="cancelBet"
          >
            <CancelIcon class="size-[16px] text-icon-2" />{{ t('hashGame.cancel') }}
          </button>
          <button
            type="button"
            class="flex h-[40px] items-center justify-center gap-[8px] rounded-[8px] bg-bg-3 text-[14px] font-[700] text-text-1 disabled:opacity-50"
            :disabled="!canRepeatBet"
            @click="repeatBets"
          >
            <RepeatIcon class="size-[16px] text-icon-2" />{{ t('hashGame.repeat') }}
          </button>
          <button
            v-if="!quickBetEnabled"
            type="button"
            :disabled="!canConfirmBet"
            class="flex h-[40px] items-center justify-center gap-[8px] rounded-[8px] bg-bg-3 text-[14px] font-[700] text-text-1 disabled:opacity-50"
            @click="confirmBets"
          >
            <ConfirmIcon class="size-[16px] text-icon-2" />{{ t('hashGame.confirmBet') }}
          </button>
        </footer>
      </main>

      <!-- 聊天 -->
      <aside
        class="flex min-w-0 min-h-0 flex-col overflow-hidden rounded-[12px] bg-bg-2 px-[10px] pb-[10px]"
      >
        <div class="min-h-0 flex-1 overflow-y-auto text-[14px] text-text-2">
          <HashGameChat
            v-if="chatVisible"
            :messages="props.page.chatMessages.value"
            variant="pc"
            class="mx-[6px]"
          />
        </div>
        <HashPcChatComposer
          :game-code="selectedHashGameCode"
          :config="props.page.chatConfig.value"
        />
      </aside>
    </div>

    <!-- 投注记录弹窗 -->
    <RecentBetsPopup
      v-model:visible="recentBetsOpen"
      variant="pc"
      :currency-code="currentCurrencyCode"
      :currency-icon="currentCurrencyIcon"
      :balance-text="currentBalanceText"
      :game-name="hashGameName"
      :bets="recentBets"
      :summary="recentBetSummary"
      @select-bet="openBetDetailPopup"
    />
    <!-- 投注记录详情弹窗 -->
    <HashGameBetDetailPopup
      v-model:visible="betDetailPopupOpen"
      variant="pc"
      :bet="selectedBetDetail"
    />
    <!-- 历史投注 -->
    <HistoryPopup v-model:visible="historyPopupOpen" :records="historyRecords" variant="pc" />
    <!-- 筹码设置 -->
    <ChipEditorPopup :page="props.page" variant="pc" />
    <!-- 规则弹窗 -->
    <HashGameRules
      v-model:visible="rulesPopupOpen"
      variant="pc"
      :games="hashGames"
      :initial-game-code="selectedHashGameCode"
    />
    <!-- 飞筹码动画 -->
    <Teleport to="body">
      <FlyingChip
        v-for="flight in chipFlights"
        :key="flight.id"
        :origin="flight.origin"
        :x="flight.x"
        :y="flight.y"
        :size="flight.size"
        @finish="finishChipFlight(flight.id)"
      />
    </Teleport>
  </div>
  <CommonFooter class="mt-[55px]" />
  <HashSettlementPopup
    :notice="props.page.currentSettlement.value"
    :sound-enabled="musicEnabled"
    @dismiss="props.page.dismissSettlement"
  />
</template>

<script setup lang="ts">
import CommonFooter from '@/components/commonFooter.vue'
import { useHorizontalScroll } from '@/composables/useHorizontalScroll'
import backgroundMusicOffIcon from '@/static/svg/hash_game/beijing_guan.svg?url'
import backgroundMusicOnIcon from '@/static/svg/hash_game/beijing_kai.svg?url'
import CancelIcon from '@/static/svg/hash_game/cancel.svg?component'
import chipImage from '@/static/svg/hash_game/chouma.svg?url'
import chipEditorImage from '@/static/svg/hash_game/chouma_bianji.svg?url'
import ConfirmIcon from '@/static/svg/hash_game/confirm.svg?component'
import HistoryArrowIcon from '@/static/svg/hash_game/jiantou_you.svg?component'
import AmountIcon from '@/static/svg/hash_game/jine.svg?component'
import RecentIcon from '@/static/svg/hash_game/recent.svg?component'
import PeopleIcon from '@/static/svg/hash_game/renshu.svg?component'
import RepeatIcon from '@/static/svg/hash_game/repeat.svg?component'
import RulesIcon from '@/static/svg/hash_game/rules.svg?component'
import SettingsIcon from '@/static/svg/hash_game/shezhi.svg?component'
import musicOffIcon from '@/static/svg/hash_game/yinyue_guan.svg?url'
import musicOnIcon from '@/static/svg/hash_game/yinyue_kai.svg?url'
import ResultArrowIcon2 from '@/static/svg/hash_game/zhixiang2.svg?component'
import { onBeforeUnmount, onMounted, ref } from 'vue'
import HashGameBetDetailPopup from './bet-detail.vue'
import BetChip from './components/BetChip.vue'
import ChipEditorPopup from './components/ChipEditorPopup.vue'
import { formatChipAmount } from './components/chipMotion'
import FlyingChip from './components/FlyingChip.vue'
import HashGameChat from './components/HashGameChat.vue'
import HashPcChatComposer from './components/HashPcChatComposer.vue'
import HashSettlementPopup from './components/HashSettlementPopup.vue'
import HistoryPopup from './components/HistoryPopup.vue'
import QuickBetPopupContent from './components/QuickBetPopupContent.vue'
import RecentBetsPopup from './components/RecentBetsPopup.vue'
import { useBetChipAnimation } from './components/useBetChipAnimation'
import type { HashGameBetDetail, HashGamePageState } from './index'
import HashGameRules from './rules.vue'

// PC 视图只保留聊天输入草稿；周期、路单、投注和开关都读写 index.ts 共享状态。
const props = defineProps<{ page: HashGamePageState }>()
const {
  t,
  hashGames,
  hashGameName,
  selectedHashGameCode,
  selectHashGame,
  roadmapMode,
  chipOptions,
  selectedChip,
  round,
  roundOutcome,
  hashParts,
  defaultOdds,
  roadmap,
  roadmapModes,
  betGridStyle,
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
  loadRecentBets,
  openRecords,
  selectBet,
  betChips,
  betTotals,
  betBusy,
  hasBetAmount,
  canCancelBet,
  canRepeatBet,
  canConfirmBet,
  chooseChip,
  cancelBet,
  repeatBets,
  confirmBets,
  openChipEditor,
  toggleQuickBetPopup,
  toggleQuickBet,
  closeQuickBetPopup,
  toggleBackgroundMusic,
  toggleMusic
} = props.page

const recentBetsOpen = ref(false)
/** 打开弹窗时刷新当前玩法的近期投注。 */
const openRecentBets = () => {
  recentBetsOpen.value = true
  void loadRecentBets()
}
const { viewport: gameTabsRef, dragging: isDraggingGameTabs } = useHorizontalScroll({
  centerOnClick: true
})
const { viewport: chipTrackRef, dragging: isDraggingChips } = useHorizontalScroll({
  centerOnClick: true
})
const { viewport: roadmapViewport, dragging: isDraggingRoadmap } = useHorizontalScroll({
  endOnChange: () => roadmap.value.columns
})
const betGridRef = ref<HTMLElement | null>(null)
const { chipStackStep, landedChips, chipFlights, getChipStackOffset, finishChipFlight } =
  useBetChipAnimation({
    chips: betChips,
    chipTrack: chipTrackRef,
    betGrid: betGridRef,
    soundEnabled: musicEnabled,
    slotSize: 36
  })
const betDetailPopupOpen = ref(false)
const selectedBetDetail = ref<HashGameBetDetail | null>(null)
const rulesPopupOpen = ref(false)
const quickBetPopupRef = ref<HTMLElement | null>(null)
const quickBetTriggerRef = ref<HTMLElement | null>(null)

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
onBeforeUnmount(() => document.removeEventListener('pointerdown', handleQuickBetOutsidePointerDown))

const soundButtons = [{ type: 'background' as const }, { type: 'music' as const }]

const openBetDetailPopup = (bet: HashGameBetDetail) => {
  selectedBetDetail.value = bet
  betDetailPopupOpen.value = true
}
</script>
