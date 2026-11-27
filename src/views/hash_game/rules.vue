<template>
  <!-- pc和H5共用游戏规则 -->
  <Teleport to="body" :disabled="variant === 'h5'">
    <Transition name="bottom-sheet">
      <div
        v-if="variant === 'h5' || visible"
        :class="
          variant === 'pc'
            ? 'fixed inset-0 z-[1100] grid place-items-center bg-mask-60-1 p-[12px]'
            : 'fixed inset-0 flex min-h-0 flex-col overflow-hidden bg-bg-1'
        "
        @click.self="close"
        @keydown.esc.stop.prevent="close"
      >
        <section
          :class="
            variant === 'pc'
              ? 'bottom-sheet-panel flex max-h-[85vh] min-h-[85vh] w-full max-w-[480px] flex-col overflow-hidden rounded-[8px] bg-bg-1 text-text-1'
              : 'flex min-h-0 flex-1 flex-col overflow-hidden bg-bg-1'
          "
          :role="variant === 'pc' ? 'dialog' : undefined"
          :aria-modal="variant === 'pc' ? 'true' : undefined"
          :aria-labelledby="variant === 'pc' ? 'hash-game-rules-title' : undefined"
        >
          <header
            v-if="variant === 'pc'"
            class="grid h-[56px] shrink-0 grid-cols-[1fr_auto_1fr] items-center bg-bg-2 px-[16px]"
          >
            <span aria-hidden="true" />
            <h2 id="hash-game-rules-title" class="text-[18px] font-[700] text-text-1">
              {{ t('hashGame.gameRules') }}
            </h2>
            <button
              type="button"
              class="ml-auto grid size-[24px] place-items-center rounded-[4px] bg-opacity-10"
              :aria-label="t('common.close')"
              @click="close"
            >
              <CloseIcon class="size-[12px] text-icon-1" />
            </button>
          </header>
          <H5Header v-else :title="t('hashGame.gameRules')" />

          <main
            class="min-h-0 flex-1 overflow-y-auto overscroll-contain"
            :class="variant === 'pc' ? 'px-[16px] py-[16px]' : 'px-[12px] py-[12px]'"
          >
            <div
              v-if="games.length"
              ref="tabsViewport"
              class="scrollbar-none mb-[20px] flex select-none items-center overflow-x-auto overscroll-x-contain"
              :class="[
                variant === 'pc' ? 'gap-[8px]' : 'gap-[10px]',
                { 'cursor-grabbing': draggingTabs }
              ]"
              role="tablist"
              :aria-label="t('hashGame.gameRules')"
            >
              <button
                v-for="game in games"
                :key="game.gameCode"
                data-scroll-center
                type="button"
                role="tab"
                class="shrink-0 whitespace-nowrap"
                :class="[
                  variant === 'pc'
                    ? 'h-[32px] rounded-[16px] px-[24px] text-[14px]'
                    : 'h-[30px] rounded-[8px] px-[6px] text-[13px]',
                  selectedGame?.gameCode === game.gameCode
                    ? 'bg-theme-primary font-[600] text-text-4'
                    : 'bg-bg-2 font-[400] text-text-2'
                ]"
                :aria-selected="selectedGame?.gameCode === game.gameCode"
                @click="selectedGameCode = game.gameCode"
              >
                {{ game.gameName }}
              </button>
            </div>

            <div v-if="selectedGame" class="overflow-hidden">
              <img
                v-if="rulesImageUrl"
                :key="rulesImageUrl"
                :src="rulesImageUrl"
                :alt="selectedGame.gameName"
                class="block h-auto w-full rounded-[8px] object-contain"
              />
              <p
                v-else-if="!rulesImageLoading"
                class="py-[20px] text-center text-[14px] text-text-2"
              >
                {{ t('hashGame.rulesImageNotConfigured') }}
              </p>
            </div>
          </main>
        </section>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, shallowRef, toRef, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import type { HashGameLotteryGame, HashGameLotteryInfo } from '@/api/interface/hash_game.interface'
import { getHashGameInfo } from '@/api/modules/hash_game'
import H5Header from '@/components/common/H5Header.vue'
import { useDisplayCurrency } from '@/composables/useDisplayCurrency'
import { useHorizontalScroll } from '@/composables/useHorizontalScroll'
import CloseIcon from '@/static/svg/close.svg?component'
import { useSiteConfigStore } from '@/stores/siteConfig'
import { useThemeStore } from '@/stores/theme'
import { useUserStore } from '@/stores/user'
import { resolveGameImageUrl } from '@/utils/image'
import { requestHashGames } from './gameList'

const props = withDefaults(
  defineProps<{
    variant?: 'h5' | 'pc'
    games?: readonly HashGameLotteryGame[]
    initialGameCode?: string
    currencyCode?: string
    gameInfo?: HashGameLotteryInfo | null
  }>(),
  { variant: 'h5' }
)
const visible = defineModel<boolean>('visible', { default: false })
const { t, locale } = useI18n()
const { currentCurrencyCode } = useDisplayCurrency(toRef(props, 'currencyCode'))
const routeGames = shallowRef<HashGameLotteryGame[]>([])
const {
  viewport: tabsViewport,
  dragging: draggingTabs,
  centerItem: centerTab
} = useHorizontalScroll({ centerOnClick: true })

if (props.variant === 'h5') {
  useUserStore().syncStoredUserData()
  watch(
    [currentCurrencyCode, locale],
    async ([currency, language], _, onCleanup) => {
      let current = true
      onCleanup(() => {
        current = false
      })
      routeGames.value = []
      try {
        const games = await requestHashGames(currency, language)
        if (current) routeGames.value = games
      } catch (error) {
        if (current) console.error(error)
      }
    },
    { immediate: true }
  )
}

const games = computed(() => props.games ?? routeGames.value)
const selectedGameCode = ref(props.initialGameCode)
const selectedGame = computed(
  () => games.value.find(game => game.gameCode === selectedGameCode.value) ?? games.value[0]
)

watch([() => props.initialGameCode, visible], ([gameCode, isVisible], [, wasVisible]) => {
  if (props.variant === 'h5' || (isVisible && !wasVisible)) selectedGameCode.value = gameCode
})

watch(
  tabsViewport,
  viewport => {
    const tab = viewport?.querySelector<HTMLElement>('[aria-selected="true"]')
    if (tab) void centerTab(tab)
  },
  { flush: 'post' }
)

const siteConfig = useSiteConfigStore()
const themeStore = useThemeStore()
const rulesInfo = shallowRef<HashGameLotteryInfo | null>(null)
const rulesImageLoading = ref(false)
const rulesImageUrl = ref('')

watch(
  [selectedGame, currentCurrencyCode, visible, () => props.gameInfo],
  async ([game, currency, isVisible, pageInfo], _, onCleanup) => {
    rulesInfo.value = null
    rulesImageLoading.value = false
    if (!game || !currency || (props.variant === 'pc' && !isVisible)) return
    if (pageInfo?.gameCode === game.gameCode) {
      rulesInfo.value = pageInfo
      return
    }
    if (game.introImageDarkUrl?.trim() && game.introImageLightUrl?.trim()) return

    let current = true
    onCleanup(() => {
      current = false
    })
    rulesImageLoading.value = true
    try {
      const { result } = await getHashGameInfo({ gameCode: game.gameCode, currency })
      if (current && result?.gameCode === game.gameCode) rulesInfo.value = result
    } catch (error) {
      if (current) console.error(error)
    } finally {
      if (current) rulesImageLoading.value = false
    }
  },
  { immediate: true }
)

const rulesImagePath = computed(() => {
  const key = themeStore.theme === 'dark' ? 'introImageDarkUrl' : 'introImageLightUrl'
  return rulesInfo.value?.[key]?.trim() || selectedGame.value?.[key]
})

watch(
  [rulesImagePath, () => siteConfig.config],
  ([imagePath]) => {
    rulesImageUrl.value = resolveGameImageUrl(imagePath)
  },
  { immediate: true }
)

const close = () => {
  if (props.variant === 'pc') visible.value = false
}

const handleDocumentKeydown = (event: KeyboardEvent) => {
  if (props.variant === 'pc' && visible.value && event.key === 'Escape') close()
}

onMounted(() => document.addEventListener('keydown', handleDocumentKeydown))
onBeforeUnmount(() => document.removeEventListener('keydown', handleDocumentKeydown))
</script>
