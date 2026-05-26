<template>
  <div>
    <div class="review-score-overview flex flex-col lg:flex-row rounded-[10px] mb-[10px] p-[12px]">
      <div
        class="score-head lg:flex-1 flex items-center lg:justify-center justify-start gap-[40px]"
      >
        <div class="score-text">{{ scoreText }}</div>
        <div>
          <Star :count="5" :active-count="activeStarCount" :size="20" :gap="4" />
          <div class="text-[13px] text-[var(--color-text-level-2)] hidden lg:block">
            {{ outOfFiveText }}
          </div>
        </div>
      </div>
      <div class="rating-bars lg:flex-1 flex flex-col mt-[12px] gap-[6px]">
        <div class="flex items-center gap-[10px]">
          <Star :count="5" class="rating-bar-stars" :size="20" :gap="4" />
          <ProgressBar :percent="ratingProgressPercents[0] ?? 0" />
        </div>
        <div class="flex items-center gap-[10px]">
          <Star :count="4" class="rating-bar-stars" :size="20" :gap="4" />
          <ProgressBar :percent="ratingProgressPercents[1] ?? 0" />
        </div>
        <div class="flex items-center gap-[10px]">
          <Star :count="3" class="rating-bar-stars" :size="20" :gap="4" />
          <ProgressBar :percent="ratingProgressPercents[2] ?? 0" />
        </div>
        <div class="flex items-center gap-[10px]">
          <Star :count="2" class="rating-bar-stars" :size="20" :gap="4" />
          <ProgressBar :percent="ratingProgressPercents[3] ?? 0" />
        </div>
        <div class="flex items-center gap-[10px]">
          <Star :count="1" class="rating-bar-stars" :size="20" :gap="4" />
          <ProgressBar :percent="ratingProgressPercents[4] ?? 0" />
        </div>
      </div>
    </div>

    <!-- H5：双卡片纵向居中 -->
    <div class="review-action-cards flex gap-[6px] lg:hidden">
      <div
        class="review-action-card flex-1 flex flex-col justify-center items-center rounded-[7px]"
      >
        <div class="text-[var(--color-text-level-2)] text-[12px] text-center">
          {{ rateThisGameText }}
        </div>
        <Star
          :count="5"
          :active-count="userRating"
          :clickable="true"
          :size="20"
          :gap="4"
          class="flex justify-center mt-[4px]"
          @change="emit('rate-change', $event)"
        />
      </div>

      <div
        class="review-action-card flex-1 flex flex-col justify-center items-center rounded-[7px]"
      >
        <div class="text-[var(--color-text-level-2)] text-[12px] text-center">
          {{ ratingsText }}
        </div>
        <div
          v-if="displayRatingAvatarUrls.length > 0"
          class="flex justify-center items-center mt-[4px]"
        >
          <SmartImage
            v-for="(avatarUrl, avatarIndex) in displayRatingAvatarUrls"
            :key="`${avatarUrl}-${avatarIndex}`"
            alt=""
            :src="avatarUrl"
            class="rating-avatar -ml-[6px] first:ml-0"
          />
        </div>
      </div>
    </div>

    <!-- PC：左右一行 -->
    <div class="review-action-bar hidden lg:flex items-stretch rounded-[7px]">
      <div class="review-action-section review-action-section--rate">
        <div class="review-action-label">
          {{ rateThisGameText }}
        </div>
        <Star
          :count="5"
          :active-count="userRating"
          :clickable="true"
          :size="20"
          :gap="4"
          class="review-action-stars shrink-0"
          @change="emit('rate-change', $event)"
        />
      </div>

      <div class="review-action-divider" aria-hidden="true" />

      <div class="review-action-section review-action-section--ratings">
        <div class="review-action-label">
          {{ ratingsText }}
        </div>
        <div v-if="displayRatingAvatarUrls.length > 0" class="rating-avatars shrink-0">
          <SmartImage
            v-for="(avatarUrl, avatarIndex) in displayRatingAvatarUrls"
            :key="`${avatarUrl}-${avatarIndex}`"
            alt=""
            :src="avatarUrl"
            class="rating-avatar -ml-[6px] first:ml-0"
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

<style scoped lang="scss">
.review-score-overview {
  --review-star-active: var(--color-theme-level-1);
  --review-star-muted: #687779;
  background: #202424;
}

.score-head {
  width: 100%;
}

.score-text {
  width: 116px;
  flex-shrink: 0;
  color: var(--color-text-level-1);
  font-size: 24px;
  font-weight: 800;
  line-height: 26px;
  text-align: right;
}

@media (min-width: 1024px) {
  .score-text {
    width: auto;
    flex-shrink: 1;
    text-align: left;
  }
}

.rating-bars {
  width: 100%;
}

.rating-bar-stars {
  width: 116px;
  flex: 0 0 116px;
  --review-star-muted: var(--color-icon-level-2);
}

.review-action-card {
  --review-star-active: var(--color-theme-level-1);
  --review-star-muted: var(--color-icon-level-2);
  height: 76px;
  padding: 10px 8px;
  background: #202424;
}

@media (min-width: 1024px) {
  .review-action-bar {
    --review-star-active: var(--color-theme-level-1);
    --review-star-muted: var(--color-icon-level-2);
    min-height: 76px;
    background: #202424;
  }

  .review-action-section {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    min-width: 0;
    padding: 10px 12px;
  }

  .review-action-section--ratings {
    justify-content: center;
    gap: 10px;
  }

  .review-action-label {
    color: var(--color-text-level-2);
    font-size: 12px;
    line-height: 16px;
    white-space: nowrap;
  }

  .review-action-divider {
    width: 1px;
    margin: 12px 0;
    background: var(--color-opacity-10);
    flex-shrink: 0;
  }

  .rating-avatars {
    display: flex;
    align-items: center;
  }
}

.rating-avatar {
  width: 26px;
  height: 26px;
  min-width: 26px;
  border-radius: 26px;
  border: 1px solid #202424;
  object-fit: cover;
}

:global(:root.light .review-score-overview),
:global(:root.light .review-action-card),
:global(:root.light .review-action-bar) {
  --review-star-muted: var(--color-icon-level-2);
  background: #f4f4f4;
}

:global(:root.light .rating-avatar) {
  border-color: #ffffff;
}
</style>
