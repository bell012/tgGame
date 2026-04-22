<template>
  <div>
    <div
      class="flex flex-col lg:flex-row bg-[var(--color-background-level-1)] rounded-[10px] mb-[10px] p-[12px]"
    >
      <div class="lg:flex-1 flex justify-start items-center gap-[20px]">
        <div class="text-[26px] font-bold w-[100px] text-right">{{ scoreText }}</div>
        <div>
          <Star :count="5" :active-count="activeStarCount" />
          <div class="text-[13px] text-[var(--color-text-level-2)] hidden lg:block">
            {{ outOfFiveText }}
          </div>
        </div>
      </div>
      <div class="lg:flex-1 flex flex-col mt-[12px] gap-[10px]">
        <div class="flex justify-between items-center gap-[10px]">
          <Star :count="5" class="w-[100px]" />
          <ProgressBar :percent="ratingProgressPercents[0] ?? 0" />
        </div>
        <div class="flex justify-between items-center gap-[10px]">
          <Star :count="4" class="w-[100px]" />
          <ProgressBar :percent="ratingProgressPercents[1] ?? 0" />
        </div>
        <div class="flex justify-between items-center gap-[10px]">
          <Star :count="3" class="w-[100px]" />
          <ProgressBar :percent="ratingProgressPercents[2] ?? 0" />
        </div>
        <div class="flex justify-between items-center gap-[10px]">
          <Star :count="2" class="w-[100px]" />
          <ProgressBar :percent="ratingProgressPercents[3] ?? 0" />
        </div>
        <div class="flex justify-between items-center gap-[10px]">
          <Star :count="1" class="w-[100px]" />
          <ProgressBar :percent="ratingProgressPercents[4] ?? 0" />
        </div>
      </div>
    </div>

    <div class="flex gap-[20px]">
      <div
        class="flex-1 flex flex-col justify-center items-center bg-[var(--color-background-level-1)] rounded-[10px] p-[12px]"
      >
        <div class="text-[var(--color-text-level-2)] text-[12px] text-center">
          {{ rateThisGameText }}
        </div>
        <Star
          :count="5"
          :active-count="userRating"
          :clickable="true"
          class="flex justify-center mt-[4px]"
          @change="emit('rate-change', $event)"
        />
      </div>

      <div
        class="flex-1 flex flex-col justify-center items-center bg-[var(--color-background-level-1)] rounded-[10px] p-[12px]"
      >
        <div class="text-[var(--color-text-level-2)] text-[12px] text-center">
          {{ ratingsText }}
        </div>
        <div class="flex justify-center items-center mt-[4px]">
          <SmartImage
            v-for="(avatarUrl, avatarIndex) in displayRatingAvatarUrls"
            :key="`${avatarUrl}-${avatarIndex}`"
            alt=""
            :src="avatarUrl"
            class="size-[26px] rounded-[26px] border border-[var(--color-background-level-1)] -ml-[8px] first:ml-0"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import SmartImage from '@/components/common/SmartImage.vue'
import ProgressBar from './progress.vue'
import Star from './star.vue'

defineProps<{
  scoreText: string
  activeStarCount: number
  ratingProgressPercents: number[]
  userRating: number
  displayRatingAvatarUrls: string[]
  outOfFiveText: string
  rateThisGameText: string
  ratingsText: string
}>()

const emit = defineEmits<{
  'rate-change': [value: number]
}>()
</script>
