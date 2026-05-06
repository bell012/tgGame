<template>
  <div class="flex items-center" :style="{ gap: `${gap}px` }">
    <span
      v-for="i in count"
      :key="i"
      class="relative block overflow-hidden"
      :class="clickable ? 'cursor-pointer' : ''"
      :style="starStyle"
      @click="handleClick(i)"
    >
      <span class="sr-only">
        {{
          getStarFillPercent(i) > 0
            ? t('gameDetail.starActiveAlt')
            : t('gameDetail.starInactiveAlt')
        }}
      </span>
      <StarIcon class="star-symbol size-full" />
      <span
        v-if="getStarFillPercent(i) > 0"
        class="absolute left-0 top-0 h-full overflow-hidden"
        :style="{ width: `${getStarFillPercent(i)}%` }"
      >
        <StarActiveIcon class="star-symbol-active h-full" :style="{ width: `${props.size}px` }" />
      </span>
    </span>
  </div>
</template>
<script setup lang="ts">
import StarIcon from '@/static/svg/game/detail/comment/star.svg?component'
import StarActiveIcon from '@/static/svg/game/detail/comment/star_active.svg?component'
import { useI18n } from 'vue-i18n'
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    count: number
    activeCount?: number
    clickable?: boolean
    size?: number
    gap?: number
  }>(),
  {
    activeCount: 0,
    clickable: false,
    size: 15,
    gap: 4
  }
)

const emit = defineEmits<{
  change: [value: number]
}>()
const { t } = useI18n()

const starStyle = computed(() => ({
  width: `${props.size}px`,
  height: `${props.size}px`
}))

const getStarFillPercent = (index: number) => {
  const fillValue = Math.max(0, Math.min(1, props.activeCount - index + 1))
  return Math.round(fillValue * 100)
}

const handleClick = (value: number) => {
  if (!props.clickable) {
    return
  }
  emit('change', value)
}
</script>

<style scoped lang="scss">
.star-symbol :deep(path) {
  fill: var(--review-star-muted);
}

.star-symbol-active :deep(path) {
  fill: var(--review-star-active);
}
</style>
