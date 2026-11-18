<template>
  <div
    class="flex flex-col overflow-hidden bg-bg-5 font-inter"
    :class="
      props.displayMode === 'pc'
        ? 'w-[400px] rounded-[20px] shadow-[0_0_20px_0_var(--color-mask-20)]'
        : 'size-full'
    "
  >
    <RedPacketHistory
      v-if="view === 'history' && historyItem"
      :item="historyItem"
      @back="setView('list')"
      @open-mine="setView('mine')"
    />
    <MyRedemptions v-else-if="view === 'mine'" @back="setView('history')" />

    <div v-show="view === 'list'" class="relative flex min-h-0 flex-1 flex-col">
      <!-- PC 头部；H5 由页面使用公共头部 -->
      <div
        v-if="props.displayMode === 'pc'"
        class="relative flex h-[58px] shrink-0 items-center justify-center bg-bg-2"
      >
        <span class="text-[18px] font-[700] leading-[22px] text-text-1">{{
          t('menu.red-packet')
        }}</span>
        <button
          type="button"
          aria-label="close"
          class="absolute right-[10px] top-[14px] size-[30px]"
          @click="emit('close')"
        >
          <CloseIcon class="size-full" />
        </button>
      </div>

      <div
        ref="listRef"
        class="red-packet-scrollbar flex min-h-0 flex-1 flex-col gap-[20px] overflow-y-auto p-[20px_10px] bg-bg-1"
      >
        <div ref="sentinelRef" class="h-px shrink-0 -mb-5" />
        <RedPacketCard
          v-for="item in displayList"
          :key="item.redEnvelopeId"
          :item="item"
          @click="handleRedPacketClick"
        />

        <div v-if="showEmptyMessage" class="flex w-full gap-[5px]">
          <img :src="tgAvatar" alt="" class="size-[50px] shrink-0" />
          <div class="flex w-[260px] flex-col gap-[4px]">
            <div
              class="flex items-center justify-between pl-[6px] text-[14px] leading-[20px] text-text-3"
            >
              <span>{{ t('redPacketPanel.emptySender') }}</span>
              <span>{{ t('redPacketPanel.emptyTime') }}</span>
            </div>
            <div class="flex items-start">
              <span class="flex h-[32px] shrink-0 items-center">
                <EmptyBubbleEar class="h-[13px] w-[9px]" />
              </span>
              <p
                class="w-[232px] rounded-[6px] bg-bg-3 px-[10px] py-[6px] text-[14px] leading-[20px] text-text-1"
              >
                {{ t('redPacketPanel.emptyMessage') }}
              </p>
            </div>
          </div>
        </div>

        <RedPacketListStatus v-else-if="showLoadError" class="m-auto" error @retry="retry" />
      </div>

      <!-- 底部输入栏仅展示，不可交互 -->
      <div class="flex shrink-0 items-center gap-[10px] bg-bg-2 p-[10px]">
        <input
          type="text"
          readonly
          tabindex="-1"
          :placeholder="t('redPacketPanel.muted')"
          class="pointer-events-none min-w-0 flex-1 rounded-[10px] bg-opacity-5 px-[12px] py-[10px] text-[14px] leading-[20px] text-text-3 outline-none placeholder:text-text-3"
        />
        <button
          type="button"
          disabled
          tabindex="-1"
          class="size-[44px] shrink-0 cursor-default"
          :aria-label="t('redPacketPanel.send')"
        >
          <SendIcon class="size-full" />
        </button>
      </div>

      <RedPacketPopup
        v-if="popupState"
        :key="popupState.item.redEnvelopeId"
        :item="popupState.item"
        :schedule="popupState.schedule"
        @close="popupState = null"
        @navigate="handleNavigate"
        @claimed="handleClaimed"
        @history="openHistory"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import '../red-packet.css'
import { computed, nextTick, ref, shallowRef, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import Api from '@/api'
import type { RedEnvelopeItem, RedEnvelopeSchedule } from '@/api/interface/red-envelope'
import { useDisplayCurrency } from '@/composables/useDisplayCurrency'
import CloseIcon from '@/static/svg/red-packet/close.svg?component'
import EmptyBubbleEar from '@/static/svg/red-packet/empty-bubble-ear.svg?component'
import SendIcon from '@/static/svg/red-packet/send.svg?component'
import tgAvatar from '@/static/svg/red-packet/tg-avatar.svg?url'
import { navigateTo } from '@/utils/router'
import {
  useRedPacketList,
  type RedPacketDisplayMode,
  type RedPacketPanelView
} from '../useRedPacketList'
import MyRedemptions from './MyRedemptions.vue'
import RedPacketCard from './RedPacketCard.vue'
import RedPacketHistory from './RedPacketHistory.vue'
import RedPacketListStatus from './RedPacketListStatus.vue'
import RedPacketPopup from './RedPacketPopup.vue'

const props = withDefaults(defineProps<{ displayMode?: RedPacketDisplayMode }>(), {
  displayMode: 'pc'
})

const emit = defineEmits<{ close: []; 'update:view': [view: RedPacketPanelView] }>()

const { t } = useI18n()

const listRef = ref<HTMLElement | null>(null)
const sentinelRef = ref<HTMLElement | null>(null)

const { list, displayList, loading, error, retry, updateItem, markReady } = useRedPacketList({
  displayMode: () => props.displayMode,
  sentinel: sentinelRef,
  root: listRef
})

const { currentCurrencyCode } = useDisplayCurrency()

// 列表被清空（切币种刷新）时作废还没执行的滚动修正
let layoutGeneration = 0

watch(
  () => list.value.length,
  (count, prevCount) => {
    const container = listRef.value
    if (!container) return
    if (count === 0) {
      layoutGeneration += 1
      return
    }

    const generation = layoutGeneration
    const beforeHeight = container.scrollHeight
    const beforeTop = container.scrollTop
    const isFirstPage = prevCount === 0

    nextTick(() => {
      const nextContainer = listRef.value
      if (generation !== layoutGeneration || !nextContainer) return

      if (isFirstPage) {
        nextContainer.scrollTop = nextContainer.scrollHeight
        markReady()
        return
      }

      nextContainer.scrollTop = beforeTop + (nextContainer.scrollHeight - beforeHeight)
    })
  },
  { flush: 'pre' }
)

// 第一页被渠道过滤成空列表时，仍然要打开哨兵，才能继续加载后面的页
watch(loading, (isLoading, wasLoading) => {
  if (wasLoading && !isLoading && list.value.length === 0) {
    markReady()
  }
})

const isListEmpty = computed(() => !loading.value && list.value.length === 0)
const showLoadError = computed(() => isListEmpty.value && !!error.value)
const showEmptyMessage = computed(() => isListEmpty.value && !error.value)

const popupState = shallowRef<{ item: RedEnvelopeItem; schedule: RedEnvelopeSchedule } | null>(null)
const scheduleLoadingId = ref<number | null>(null)

const handleRedPacketClick = async (item: RedEnvelopeItem) => {
  if (scheduleLoadingId.value !== null) return
  scheduleLoadingId.value = item.redEnvelopeId
  try {
    const schedule = await Api.redEnvelope.getActivitySchedule(item.redEnvelopeId)
    popupState.value = { item, schedule }
  } finally {
    scheduleLoadingId.value = null
  }
}

const handleClaimed = (schedule: RedEnvelopeSchedule) => {
  if (!popupState.value) return
  updateItem(popupState.value.item.redEnvelopeId, {
    receiveState: 1,
    amount: schedule.amount ?? popupState.value.item.amount
  })
}

const view = ref<RedPacketPanelView>('list')
const historyItem = shallowRef<RedEnvelopeItem | null>(null)

const setView = (nextView: RedPacketPanelView) => {
  view.value = nextView
  emit('update:view', nextView)
}

watch(currentCurrencyCode, (value, oldValue) => {
  if (!value || value === oldValue) return
  popupState.value = null
  historyItem.value = null
  if (view.value !== 'list') setView('list')
})

const openHistory = () => {
  if (!popupState.value) return
  historyItem.value = popupState.value.item
  popupState.value = null
  setView('history')
}

const handleNavigate = (path: string) => {
  popupState.value = null
  if (props.displayMode === 'pc') emit('close')
  navigateTo(path)
}
</script>
