<template>
  <!-- 一条红包消息：头像 + 发送人信息 + 红包主体 -->
  <div class="flex w-full gap-[5px]">
    <img
      :src="avatarSrc"
      alt=""
      class="size-[50px] shrink-0 rounded-[8px] object-cover"
      @error="avatarFailed = true"
    />

    <div class="flex w-[260px] flex-col gap-[4px]">
      <div
        class="flex items-center justify-between gap-[8px] pl-[6px] text-[14px] leading-[20px] text-[#7B7D7D]"
      >
        <span class="truncate">{{ props.item.empName }}</span>
        <span class="shrink-0">{{ formatDateTime(props.item.createTime) }}</span>
      </div>

      <button
        type="button"
        class="relative h-[92px] w-[260px] cursor-pointer text-left font-inter"
        :class="{ 'opacity-50': dimmed }"
        @click="emit('click', props.item)"
      >
        <img :src="bubbleEar" alt="" class="absolute left-0 top-[10px] h-[11px] w-[6px]" />
        <span class="absolute inset-y-0 left-[6px] right-0 rounded-[6px] bg-[#F3674C]" />

        <span class="absolute left-[18px] top-[10.5px] flex w-[230px] flex-col gap-[9px]">
          <span class="flex items-center gap-[11px]">
            <img :src="redPacketIcon" alt="" class="h-[40px] w-[34px] shrink-0" />
            <span class="flex min-w-0 flex-col justify-center gap-[4px] text-[#FFD59E]">
              <span class="truncate text-[16px] font-[700] leading-[19px]">{{ title }}</span>
              <span v-if="subtitle" class="truncate text-[12px] leading-[15px]">
                {{ subtitle }}
              </span>
            </span>
          </span>

          <span class="flex flex-col gap-[6px]">
            <span class="h-px w-full bg-[#E65A3F]" />
            <span class="flex items-center justify-between gap-[8px] text-[12px] leading-[15px]">
              <span class="truncate text-[#FFD59E]">{{ props.item.redEnvelopeName }}</span>
              <span class="flex shrink-0 items-center gap-[4px] text-[#F7FF4B]">
                <img :src="clockIcon" alt="" class="size-[12px]" />
                {{ countdown }}
              </span>
            </span>
          </span>
        </span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { RedEnvelopeItem } from '@/api/interface/red-envelope'
import redPacketIcon from '@/static/svg/chat/public/red-packet-icon.svg?url'
import bubbleEar from '@/static/svg/red-packet/bubble-ear.svg?url'
import clockIcon from '@/static/svg/red-packet/clock.svg?url'
import tgAvatar from '@/static/svg/red-packet/tg-avatar.svg?url'
import { resolveGameImageUrl } from '@/utils/image'
import { getCurrencySymbol } from '@/utils/locale'
import { formatCountdown, formatDateTime, useNow } from '../useNow'

const props = defineProps<{ item: RedEnvelopeItem }>()

const emit = defineEmits<{ click: [item: RedEnvelopeItem] }>()

const now = useNow()
const avatarFailed = ref(false)

const avatarSrc = computed(() => {
  if (avatarFailed.value) return tgAvatar
  return resolveGameImageUrl(props.item.logo) || tgAvatar
})

const isDaily = computed(() => props.item.redEnvelopeType === 1)

const title = computed(() =>
  isDaily.value
    ? props.item.redEnvelopeDesc
    : `${getCurrencySymbol(props.item.currency)}${props.item.amount ?? 0}`
)

const subtitle = computed(() => (isDaily.value ? '' : props.item.redEnvelopeDesc))

const remainingMs = computed(() => (props.item.expiredTime ?? 0) - now.value)

const countdown = computed(() => formatCountdown(remainingMs.value))

const dimmed = computed(() => props.item.receiveState === 1 || remainingMs.value <= 0)
</script>
