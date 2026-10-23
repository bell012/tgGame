<template>
  <footer class="flex flex-col items-center px-3.5 pb-6 pt-8" :class="{ 'font-inter': !isMobile }">
    <div class="flex items-center" :class="isMobile ? 'gap-3' : 'gap-4'">
      <span
        class="shrink-0 text-text-2"
        :class="isMobile ? 'text-sm' : 'text-xs font-normal leading-[15px]'"
        >{{ t('sports.eventDetails.oddsFormatLabel') }}</span
      >
      <div
        ref="root"
        class="relative"
        :class="isMobile ? 'min-w-[140px]' : 'w-52'"
        @keydown.esc="open = false"
      >
        <button
          type="button"
          class="inline-flex w-full items-center justify-between gap-2 border-0 text-text-1 disabled:cursor-not-allowed disabled:opacity-60"
          :class="
            isMobile
              ? 'h-9 rounded-lg bg-bg-2 pl-4 pr-3 text-sm'
              : 'h-[31px] rounded-[40px] bg-bg-2 px-4 text-xs font-normal leading-[15px]'
          "
          :disabled="disabled"
          :aria-expanded="open"
          :aria-label="t('sports.eventDetails.oddsFormatLabel')"
          :aria-haspopup="isMobile ? 'dialog' : 'listbox'"
          @click="toggle"
        >
          <span>{{
            t(
              `sports.eventDetails.${isMobile ? 'oddsFormatTypes' : 'oddsFormatShortTypes'}.${oddsType}`
            )
          }}</span>
          <component
            :is="isMobile ? ChevronIcon : CaretUp"
            class="shrink-0 transition-transform motion-reduce:transition-none"
            :class="[
              isMobile ? 'h-2 w-2 text-text-1' : 'h-3 w-3 text-text-2 duration-300 ease-[ease]',
              { 'rotate-180': isMobile && open, '-rotate-180': !isMobile && !open }
            ]"
            aria-hidden="true"
          />
        </button>
        <div
          v-if="open && !isMobile"
          role="listbox"
          :aria-label="t('sports.eventDetails.oddsFormatOptionsAria')"
          class="absolute left-0 z-30 h-[104px] w-full overflow-hidden rounded-xl bg-bg-5 shadow-xl"
          :class="openUpward ? 'bottom-[calc(100%+8px)]' : 'top-[calc(100%+8px)]'"
          :style="{ maxHeight: `${menuMaxHeight}px` }"
        >
          <div class="odds-options h-full overflow-y-auto overscroll-contain">
            <button
              v-for="option in options"
              :key="option.value"
              type="button"
              role="option"
              :aria-selected="oddsType === option.value"
              class="flex h-[23px] w-full items-center bg-transparent px-4 py-1 text-left text-xs font-normal leading-[15px] text-text-1 hover:bg-bg-2 focus-visible:bg-bg-2"
              @click="choose(option.value)"
            >
              {{ option.label }}
            </button>
          </div>
        </div>
      </div>
    </div>
    <p
      class="text-center text-xs"
      :class="
        isMobile
          ? 'mt-6 max-w-[640px] leading-relaxed text-text-3'
          : 'mt-4 max-w-[516px] font-normal leading-[15px] text-text-2'
      "
    >
      {{ t('sports.eventDetails.oddsFormatDisclaimer') }}
    </p>
    <OddsFormatSheet
      v-if="isMobile"
      v-model="open"
      :selected="oddsType"
      :options="options"
      @select="choose"
    />
  </footer>
</template>

<script setup lang="ts">
import { computed, onMounted, onScopeDispose, onDeactivated, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { useIsMobile } from '@/composables/useMediaQuery'
import type { SportsOddsType } from '@/api/interface/sport'
import ChevronIcon from '@/static/svg/casino/dropdown_chevron.svg?component'
import CaretUp from '@/static/svg/sports/caret-up.svg?component'
import OddsFormatSheet from '../../event-details/components/odds-format-sheet/index.vue'
import { ODDS_TYPES } from '../../shared/odds'
import { useSportsOdds } from '../../composables/useSportsOdds'

const { t } = useI18n()
const route = useRoute()
const isMobile = useIsMobile()
const { oddsType, disabled, select } = useSportsOdds()
const root = ref<HTMLElement | null>(null)
const open = ref(false)
const openUpward = ref(false)
const menuMaxHeight = ref(104)
const toggle = () => {
  if (disabled.value) return
  if (!open.value && !isMobile.value && root.value) {
    const rect = root.value.getBoundingClientRect()
    const above = rect.top - 72
    const below = window.innerHeight - rect.bottom - 12
    openUpward.value = below < 104 && above > below
    menuMaxHeight.value = Math.max(23, Math.min(104, openUpward.value ? above : below))
  }
  open.value = !open.value
}
const options = computed(() =>
  ODDS_TYPES.map(value => ({ value, label: t(`sports.eventDetails.oddsFormatTypes.${value}`) }))
)
const choose = (value: SportsOddsType) => {
  select(value)
  open.value = false
}
const outside = (event: MouseEvent) => {
  if (!isMobile.value && event.target instanceof Node && !root.value?.contains(event.target))
    open.value = false
}
watch([disabled, isMobile, () => route.fullPath], () => {
  open.value = false
})
onMounted(() => document.addEventListener('click', outside))
onDeactivated(() => {
  open.value = false
})
onScopeDispose(() => document.removeEventListener('click', outside))
</script>

<style scoped lang="scss">
.odds-options {
  scrollbar-width: none;
  mask-image: linear-gradient(
    to bottom,
    transparent,
    black 24px,
    black calc(100% - 24px),
    transparent
  );

  &::-webkit-scrollbar {
    display: none;
  }
}
</style>
