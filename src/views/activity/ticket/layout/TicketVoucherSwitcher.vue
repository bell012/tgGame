<template>
  <div>
    <!-- PC：票券数 + 网格（无底板背景） -->
    <template v-if="variant === 'grid'">
      <button
        v-if="showPcVoucherFooter"
        type="button"
        class="flex w-full items-center justify-center gap-1 text-common-80"
        :style="pcVoucherFooterTextStyle"
        @click="emit('openVoucherList')"
      >
        <span>{{ t('luckySpinPage.youHave') }}</span>
        <span class="font-[700]" :style="{ color: pcVoucherLayout.countHighlight }">{{
          totalVouchers
        }}</span>
        <span>{{ t('luckySpinPage.vouchers') }} ›</span>
      </button>

      <div v-if="showPcVoucherGrid && gridSlots.length" class="w-full" :style="pcGridPanelStyle">
        <div class="mx-auto grid w-max overflow-visible" :style="pcGridStyle">
          <template v-for="slot in gridSlots" :key="slot.id">
            <button
              v-if="!slot.isPlaceholder"
              type="button"
              class="pc-grid-item flex min-h-0 min-w-0 items-center justify-center border-0 bg-transparent p-0 transition-all"
              :style="getPcGridItemStyle(slot)"
              :aria-label="slot.label"
              @click="slot.gameIndex != null && emit('select', slot.gameIndex)"
            >
              <img
                :src="resolveIcon(slot)"
                :alt="slot.label ?? slot.id"
                class="block h-full w-full shrink-0 object-contain"
              />
            </button>
            <div v-else :style="pcGridPlaceholderStyle" aria-hidden="true" />
          </template>
        </div>
      </div>
    </template>

    <!-- H5：横向 scroll-snap -->
    <div
      v-else-if="variant === 'carousel' && games.length"
      class="ticket-voucher-carousel-row mx-auto flex w-full max-w-[340px] items-center justify-center overflow-visible leading-none"
      :style="carouselRowStyle"
    >
      <button
        v-if="showArrows"
        type="button"
        class="ticket-voucher-carousel-nav flex shrink-0 items-center justify-center self-center text-white transition-opacity hover:opacity-80"
        :style="carouselNavBtnStyle"
        :aria-label="t('luckySpinPage.prev')"
        @click="emit('prev')"
      >
        <ArrowLeft2Icon class="shrink-0 fill-current" :style="carouselNavIconStyle" />
      </button>

      <div
        ref="viewportRef"
        class="ticket-voucher-carousel-viewport flex shrink-0 items-center overflow-y-visible overscroll-contain scroll-smooth"
        :class="[
          isScrollable
            ? 'ticket-voucher-carousel-viewport--scrollable snap-x snap-mandatory overflow-x-auto touch-pan-x'
            : 'overflow-x-hidden'
        ]"
        :style="viewportStyle"
      >
        <div
          class="flex w-max items-center"
          :class="isScrollable ? '' : 'mx-auto justify-center'"
          :style="carouselTrackStyle"
        >
          <button
            v-for="(game, index) in games"
            :key="game.id"
            :ref="element => setItemRef(element, index)"
            type="button"
            class="ticket-voucher-carousel-item flex shrink-0 snap-center snap-always items-center justify-center overflow-visible border-0 bg-transparent p-0 shadow-none outline-none"
            :style="getCarouselItemStyle(isGameActive(index))"
            :aria-label="game.label"
            @click="emit('select', index)"
          >
            <img
              :src="resolveCarouselIcon(game)"
              :alt="game.label ?? game.id"
              class="block shrink-0 object-contain transition-transform duration-200 ease-out"
              :style="getCarouselIconImgStyle(isGameActive(index))"
              @load="handleItemImageLoad(index)"
            />
          </button>
        </div>
      </div>

      <button
        v-if="showArrows"
        type="button"
        class="ticket-voucher-carousel-nav flex shrink-0 items-center justify-center self-center text-white transition-opacity hover:opacity-80"
        :style="carouselNavBtnStyle"
        :aria-label="t('luckySpinPage.next')"
        @click="emit('next')"
      >
        <ArrowRightIcon class="shrink-0 fill-current" :style="carouselNavIconStyle" />
      </button>
    </div>

    <button
      v-if="variant !== 'grid'"
      type="button"
      class="flex w-full items-center justify-center gap-1 text-common-80"
      :style="voucherFooterTextStyle"
      @click="emit('openVoucherList')"
    >
      <span>{{ t('luckySpinPage.youHave') }}</span>
      <span class="font-[700]" :style="{ color: voucherLayout.countHighlight }">{{
        totalVouchers
      }}</span>
      <span>{{ t('luckySpinPage.vouchers') }} ›</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import type { TicketVoucherFooterData, VoucherGameItem } from '../shared/types'
import { getGameIcon } from '../shared/constants'
import {
  useTicketVoucherCarousel,
  VOUCHER_CAROUSEL_TRACK_WIDTH
} from './composables/useTicketVoucherCarousel'
import {
  useTicketVoucherSwitcher,
  VOUCHER_GRID_COLUMNS,
  type VoucherGridSlot
} from './composables/useTicketVoucherSwitcher'
import ArrowLeft2Icon from '@/static/svg/arrow_left2.svg?component'
import ArrowRightIcon from '@/static/svg/arrow_right.svg?component'
import { TICKET_PC_LAYOUT } from '../shared/layout-tokens/ticketPcLayout'
import {
  TICKET_MOBILE_LAYOUT,
  VOUCHER_CAROUSEL_ROW_MIN_HEIGHT
} from '../shared/layout-tokens/ticketMobileLayout'
import { computed, type CSSProperties } from 'vue'
import { useI18n } from 'vue-i18n'

const props = withDefaults(
  defineProps<
    TicketVoucherFooterData & {
      variant?: 'carousel' | 'grid'
      /** PC grid：是否渲染「您有 N 张票券」 */
      showPcVoucherFooter?: boolean
      /** PC grid：是否渲染券种网格 */
      showPcVoucherGrid?: boolean
    }
  >(),
  {
    variant: 'carousel',
    showPcVoucherFooter: true,
    showPcVoucherGrid: true
  }
)

const emit = defineEmits<{
  select: [index: number]
  prev: []
  next: []
  openVoucherList: []
}>()

const { t } = useI18n()
const { gridSlots, resolveIcon, isSlotActive, isGameActive } = useTicketVoucherSwitcher(props)

const voucherLayout = TICKET_MOBILE_LAYOUT.voucher
const pcVoucherLayout = TICKET_PC_LAYOUT.voucher
const carouselLayout = TICKET_MOBILE_LAYOUT.voucherCarousel

const pcVoucherFooterTextStyle = {
  fontSize: `${pcVoucherLayout.footerTextSize}px`
}

const pcGridPanelStyle = computed(() => ({
  marginTop: props.showPcVoucherGrid ? `${pcVoucherLayout.footerToGridGap}px` : '0'
}))

const pcGridStyle = {
  columnGap: `${pcVoucherLayout.itemColumnGap}px`,
  rowGap: `${pcVoucherLayout.itemRowGap}px`,
  gridTemplateColumns: `repeat(${VOUCHER_GRID_COLUMNS}, minmax(0, ${pcVoucherLayout.itemWidth}px))`,
  gridAutoRows: `minmax(0, ${pcVoucherLayout.itemHeight}px)`
}

const pcGridPlaceholderStyle = {
  width: `${pcVoucherLayout.itemWidth}px`,
  height: `${pcVoucherLayout.itemHeight}px`
}

const pcActiveItemScale = pcVoucherLayout.activeItemWidth / pcVoucherLayout.itemWidth

const getPcGridItemStyle = (slot: VoucherGridSlot): CSSProperties => {
  const active = isSlotActive(slot)

  return {
    width: `${pcVoucherLayout.itemWidth}px`,
    height: `${pcVoucherLayout.itemHeight}px`,
    minWidth: 0,
    minHeight: 0,
    borderRadius: `${pcVoucherLayout.itemRadius}px`,
    opacity: active ? 1 : 0.75,
    transform: active ? `scale(${pcActiveItemScale})` : 'none',
    transformOrigin: 'center center',
    position: active ? 'relative' : 'static',
    zIndex: active ? 1 : 0
  }
}

/** H5 券种条仅用本地 Figma 对齐图，避免接口 imageUrl 带入多余描边/光晕 */
const resolveCarouselIcon = (game: VoucherGameItem) => getGameIcon(game.gameId ?? 'lucky_spin')

const carouselNavBtnStyle = {
  width: `${carouselLayout.navBtnSize}px`,
  height: `${carouselLayout.navBtnSize}px`,
  borderRadius: `${carouselLayout.navBtnRadius}px`,
  border: carouselLayout.navBtnBorder,
  backgroundColor: carouselLayout.navBtnBg
}

const carouselNavIconStyle = {
  width: `${carouselLayout.navIconSize}px`,
  height: `${carouselLayout.navIconSize}px`
}

const voucherFooterTextStyle = computed(() =>
  props.variant === 'carousel'
    ? {
        marginTop: `${voucherLayout.footerMarginTop}px`,
        fontSize: `${voucherLayout.footerTextSize}px`
      }
    : { fontSize: `${voucherLayout.footerTextSize}px` }
)

const carouselIconSizePx = carouselLayout.iconSize

const getCarouselItemStyle = (active: boolean) => ({
  width: `${carouselLayout.slotSize}px`,
  height: `${VOUCHER_CAROUSEL_ROW_MIN_HEIGHT}px`,
  borderRadius: `${carouselLayout.itemRadius}px`,
  opacity: active ? 1 : carouselLayout.inactiveOpacity,
  border: 'none',
  boxShadow: 'none',
  outline: 'none'
})

const getCarouselIconImgStyle = (active: boolean) => {
  const scale = active ? carouselLayout.activeScale : 1

  return {
    width: `${carouselIconSizePx}px`,
    height: `${carouselIconSizePx}px`,
    transform: `scale(${scale})`,
    transformOrigin: 'center'
  }
}

const activeIndex = computed(() => props.activeIndex)
const gamesCount = computed(() => props.games.length)

const {
  viewportRef,
  showArrows,
  isScrollable,
  trackPaddingStyle,
  setItemRef,
  scrollToActiveIndex
} = useTicketVoucherCarousel({
  gamesCount,
  activeIndex
})

const carouselTrackStyle = computed(() => ({
  gap: `${carouselLayout.slotGap}px`,
  ...(trackPaddingStyle.value ?? {})
}))

const carouselRowStyle = computed(() => ({
  gap: `${carouselLayout.navGap}px`,
  height: `${VOUCHER_CAROUSEL_ROW_MIN_HEIGHT}px`
}))

const viewportStyle = computed(() => ({
  width: `${VOUCHER_CAROUSEL_TRACK_WIDTH}px`,
  minHeight: `${VOUCHER_CAROUSEL_ROW_MIN_HEIGHT}px`
}))

const handleItemImageLoad = (index: number) => {
  if (index === props.activeIndex) {
    scrollToActiveIndex(index, 'auto')
  }
}
</script>

<style scoped lang="scss">
.ticket-voucher-carousel-viewport--scrollable {
  display: flex;
  align-items: center;
  scrollbar-width: none;
  -ms-overflow-style: none;
  -webkit-overflow-scrolling: touch;
}

.ticket-voucher-carousel-viewport--scrollable::-webkit-scrollbar {
  display: none;
}
</style>
