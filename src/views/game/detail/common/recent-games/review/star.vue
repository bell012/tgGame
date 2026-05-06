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
      <SmartImage
        :src="StarIcon"
        :alt="
          getStarFillPercent(i) > 0
            ? t('gameDetail.starActiveAlt')
            : t('gameDetail.starInactiveAlt')
        "
        class="size-full"
      />
      <SmartImage
        v-if="getStarFillPercent(i) > 0"
        :src="StarActiveIcon"
        alt=""
        class="absolute left-0 top-0 size-full"
        :style="{ clipPath: `inset(0 ${100 - getStarFillPercent(i)}% 0 0)` }"
      />
    </span>
  </div>
</template>
<script setup lang="ts">
import StarIcon from '@/static/svg/game/detail/comment/star.svg?url'
import StarActiveIcon from '@/static/svg/game/detail/comment/star_active.svg?url'
import { useI18n } from 'vue-i18n'
import SmartImage from '@/components/common/SmartImage.vue'
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
