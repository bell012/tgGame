<template>
  <span class="inline-block overflow-hidden align-middle" data-testid="sports-team-logo">
    <img
      v-if="imageSrc && !failed"
      :key="imageSrc"
      ref="imageRef"
      :src="imageSrc"
      :alt="alt"
      class="block h-full w-full object-contain"
      draggable="false"
      @error="onImageError"
    />
    <component
      :is="sportIcon"
      v-else-if="sportIcon"
      class="block h-full w-full text-icon-2 [&_path]:fill-current [&_rect]:fill-current"
      :role="alt ? 'img' : undefined"
      :aria-label="alt || undefined"
      :aria-hidden="!alt || undefined"
    />
    <img v-else :src="defaultTeamIcon" :alt="alt" class="block h-full w-full object-contain" />
  </span>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import defaultTeamIcon from '@/static/img/explore/sports-team.png'
import { findSportItemBySportId } from '../sports-navigation/sport-items'

const props = withDefaults(
  defineProps<{
    src?: string
    sportId?: number
    alt?: string
  }>(),
  { alt: '' }
)

const imageSrc = computed(() => props.src?.trim() ?? '')
const sportIcon = computed(() => findSportItemBySportId(props.sportId)?.icon)
const imageRef = ref<HTMLImageElement | null>(null)
const failed = ref(false)

// 地址变化后重新加载队标；旧图片晚到的失败事件不影响新队标。
watch(imageSrc, () => (failed.value = false), { flush: 'sync' })
const onImageError = (event: Event) => {
  if (
    event.currentTarget === imageRef.value &&
    imageRef.value?.getAttribute('src') === imageSrc.value
  ) {
    failed.value = true
  }
}
</script>
