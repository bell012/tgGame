<template>
  <div class="mt-[12px]">
    <div
      class="flex flex-col bg-[var(--color-background-level-1)] rounded-[10px] mb-[10px] p-[12px]"
    >
      <div class="flex justify-start items-center gap-[20px]">
        <div class="text-[26px] font-bold w-[100px] text-right">3.0</div>
        <star :count="5" :active-count="3" />
      </div>
      <div class="flex flex-col mt-[12px] gap-[10px]">
        <div class="flex justify-between items-center gap-[10px]">
          <star :count="5" class="w-[100px]" />
          <progress-bar :percent="50" />
        </div>
        <div class="flex justify-between items-center gap-[10px]">
          <star :count="4" class="w-[100px]" />
          <progress-bar :percent="20" />
        </div>
        <div class="flex justify-between items-center gap-[10px]">
          <star :count="3" class="w-[100px]" />
          <progress-bar :percent="30" />
        </div>
        <div class="flex justify-between items-center gap-[10px]">
          <star :count="2" class="w-[100px]" />
          <progress-bar :percent="10" />
        </div>
        <div class="flex justify-between items-center gap-[10px]">
          <star :count="1" class="w-[100px]" />
          <progress-bar :percent="60" />
        </div>
      </div>
    </div>
    <div class="flex gap-[20px]">
      <div class="flex-1 bg-[var(--color-background-level-1)] rounded-[10px] p-[12px]">
        <div class="text-[var(--color-text-level-2)] text-[12px] text-center">Rate this Game</div>
        <star :count="5" class="flex justify-center mt-[4px]"></star>
      </div>
      <div class="flex-1 bg-[var(--color-background-level-1)] rounded-[10px] p-[12px]">
        <div class="text-[var(--color-text-level-2)] text-[12px] text-center">11 Ratings</div>
        <div class="flex justify-center items-center mt-[8px]">
          <img alt="" :src="PersonIcon" class="size-[26px] rounded-[26px]" />
          <img alt="" :src="PersonIcon" class="size-[26px] rounded-[26px]" />
          <img alt="" :src="PersonIcon" class="size-[26px] rounded-[26px]" />
          <img alt="" :src="PersonIcon" class="size-[26px] rounded-[26px]" />
          <img alt="" :src="PersonIcon" class="size-[26px] rounded-[26px]" />
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import Star from './star.vue'
import ProgressBar from './progress.vue'
import PersonIcon from '@/static/svg/game/detail/comment/person.svg?url'
</script>
