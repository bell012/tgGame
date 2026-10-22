<template>
  <div
    class="flex flex-col overflow-hidden bg-[#292D2E] font-inter"
    :class="
      props.displayMode === 'pc'
        ? 'w-[400px] rounded-[20px] shadow-[0_0_20px_0_rgba(0,0,0,0.2)]'
        : 'size-full'
    "
  >
    <div class="relative flex min-h-0 flex-1 flex-col">
      <!-- PC 头部；H5 由页面使用公共头部 -->
      <div
        v-if="props.displayMode === 'pc'"
        class="relative flex h-[58px] shrink-0 items-center justify-center bg-[#323738]"
      >
        <span class="text-[18px] font-[700] leading-[22px] text-white">Red Packet</span>
        <button
          type="button"
          aria-label="close"
          class="absolute right-[10px] top-[14px] size-[30px]"
          @click="emit('close')"
        >
          <img :src="closeIcon" alt="" class="size-full" />
        </button>
      </div>

      <div
        ref="listRef"
        class="red-packet-list flex min-h-0 flex-1 flex-col gap-[20px] overflow-y-auto p-[20px_10px]"
      >
        <RedPacketCard
          v-for="item in list"
          :key="item.redEnvelopeId"
          :item="item"
          @click="handleRedPacketClick"
        />

        <div v-if="showEmptyMessage" class="flex w-full gap-[5px]">
          <img :src="tgAvatar" alt="" class="size-[50px] shrink-0" />
          <div class="flex w-[260px] flex-col gap-[4px]">
            <div
              class="flex items-center justify-between pl-[6px] text-[14px] leading-[20px] text-[#7B7D7D]"
            >
              <span>{{ t('redPacketPanel.emptySender') }}</span>
              <span>{{ t('redPacketPanel.emptyTime') }}</span>
            </div>
            <div class="flex items-start">
              <span class="flex h-[32px] shrink-0 items-center">
                <img :src="emptyBubbleEar" alt="" class="h-[13px] w-[9px]" />
              </span>
              <p
                class="w-[232px] rounded-[6px] bg-[#3B4142] px-[10px] py-[6px] text-[14px] leading-[20px] text-white"
              >
                {{ t('redPacketPanel.emptyMessage') }}
              </p>
            </div>
          </div>
        </div>

        <p
          v-else-if="showLoadError"
          class="m-auto text-center text-[14px] leading-[20px] text-[#7B7D7D]"
        >
          {{ t('redPacketPanel.loadFailed') }}
          <button type="button" class="ml-[4px] text-[#FFD59E]" @click="retry">
            {{ t('redPacketPanel.retry') }}
          </button>
        </p>

        <div ref="sentinelRef" class="h-px shrink-0" />
      </div>

      <!-- 底部输入栏仅展示，不可交互 -->
      <div class="flex shrink-0 items-center gap-[10px] bg-[#323738] p-[10px]">
        <input
          type="text"
          readonly
          tabindex="-1"
          placeholder="Muted..."
          class="pointer-events-none min-w-0 flex-1 rounded-[10px] bg-[rgba(255,255,255,0.06)] px-[12px] py-[10px] text-[14px] leading-[20px] text-[#7B7D7D] outline-none placeholder:text-[#7B7D7D]"
        />
        <button type="button" disabled tabindex="-1" class="size-[44px] shrink-0 cursor-default">
          <img :src="sendIcon" alt="" class="size-full" />
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
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, shallowRef } from 'vue'
import { useI18n } from 'vue-i18n'
import Api from '@/api'
import type { RedEnvelopeItem, RedEnvelopeSchedule } from '@/api/interface/red-envelope'
import closeIcon from '@/static/svg/red-packet/close.svg?url'
import emptyBubbleEar from '@/static/svg/red-packet/empty-bubble-ear.svg?url'
import sendIcon from '@/static/svg/red-packet/send.svg?url'
import tgAvatar from '@/static/svg/red-packet/tg-avatar.svg?url'
import { navigateTo } from '@/utils/router'
import { useRedPacketList, type RedPacketDisplayMode } from '../useRedPacketList'
import RedPacketCard from './RedPacketCard.vue'
import RedPacketPopup from './RedPacketPopup.vue'

const props = withDefaults(defineProps<{ displayMode?: RedPacketDisplayMode }>(), {
  displayMode: 'pc'
})

const emit = defineEmits<{ close: [] }>()

const { t } = useI18n()

const listRef = ref<HTMLElement | null>(null)
const sentinelRef = ref<HTMLElement | null>(null)

const { list, loading, error, retry, updateItem } = useRedPacketList({
  displayMode: () => props.displayMode,
  sentinel: sentinelRef,
  root: listRef
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

const handleNavigate = (path: string) => {
  popupState.value = null
  if (props.displayMode === 'pc') emit('close')
  navigateTo(path)
}
</script>

<style scoped>
.red-packet-list::-webkit-scrollbar {
  width: 6px;
}

.red-packet-list::-webkit-scrollbar-thumb {
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.06);
}
</style>
