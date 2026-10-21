<template>
  <div
    class="flex flex-col overflow-hidden bg-[#292D2E] font-inter"
    :class="
      props.displayMode === 'pc'
        ? 'w-[400px] rounded-[20px] shadow-[0_0_20px_0_rgba(0,0,0,0.2)]'
        : 'size-full'
    "
  >
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
      class="red-packet-list flex min-h-0 flex-1 flex-col gap-[20px] overflow-y-auto p-[20px_10px]"
    >
      <RedPacketCard
        v-for="item in redPacketMockList"
        :key="item.id"
        :item="item"
        @click="handleRedPacketClick"
      />
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
  </div>
</template>

<script setup lang="ts">
import closeIcon from '@/static/svg/red-packet/close.svg?url'
import sendIcon from '@/static/svg/red-packet/send.svg?url'
import { redPacketMockList } from '../mock'
import RedPacketCard from './RedPacketCard.vue'

const props = withDefaults(defineProps<{ displayMode?: 'pc' | 'h5' }>(), {
  displayMode: 'pc'
})

const emit = defineEmits<{ close: [] }>()

// TODO: 接入领取接口
const handleRedPacketClick = () => {}
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
