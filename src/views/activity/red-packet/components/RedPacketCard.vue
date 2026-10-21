<template>
  <!-- 一条红包消息：头像 + 发送人信息 + 红包主体 -->
  <div class="flex w-full gap-[5px]">
    <img :src="tgAvatar" alt="" class="size-[50px] shrink-0" />

    <div class="flex w-[260px] flex-col gap-[4px]">
      <div
        class="flex items-center justify-between pl-[6px] text-[14px] leading-[20px] text-[#7B7D7D]"
      >
        <span>{{ props.item.sender }}</span>
        <span>{{ props.item.date }}</span>
      </div>

      <button
        type="button"
        class="relative h-[92px] w-[260px] cursor-pointer text-left font-inter"
        :class="{ 'opacity-50': props.item.dimmed }"
        @click="emit('click', props.item)"
      >
        <img :src="bubbleEar" alt="" class="absolute left-0 top-[10px] h-[11px] w-[6px]" />
        <span class="absolute inset-y-0 left-[6px] right-0 rounded-[6px] bg-[#F3674C]" />

        <span class="absolute left-[18px] top-[10.5px] flex w-[230px] flex-col gap-[9px]">
          <span class="flex items-center gap-[11px]">
            <img :src="redPacketIcon" alt="" class="h-[40px] w-[34px] shrink-0" />
            <span class="flex flex-col justify-center gap-[4px] text-[#FFD59E]">
              <span class="text-[16px] font-[700] leading-[19px]">{{ props.item.title }}</span>
              <span v-if="props.item.subtitle" class="text-[12px] leading-[15px]">
                {{ props.item.subtitle }}
              </span>
            </span>
          </span>

          <span class="flex flex-col gap-[6px]">
            <span class="h-px w-full bg-[#E65A3F]" />
            <span class="flex items-center justify-between text-[12px] leading-[15px]">
              <span class="text-[#FFD59E]">{{ props.item.source }}</span>
              <span class="flex items-center gap-[4px] text-[#F7FF4B]">
                <img :src="clockIcon" alt="" class="size-[12px]" />
                {{ props.item.time }}
              </span>
            </span>
          </span>
        </span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import redPacketIcon from '@/static/svg/chat/public/red-packet-icon.svg?url'
import bubbleEar from '@/static/svg/red-packet/bubble-ear.svg?url'
import clockIcon from '@/static/svg/red-packet/clock.svg?url'
import tgAvatar from '@/static/svg/red-packet/tg-avatar.svg?url'
import type { RedPacketItem } from '../mock'

const props = defineProps<{ item: RedPacketItem }>()

const emit = defineEmits<{ click: [item: RedPacketItem] }>()
</script>
