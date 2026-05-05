<template>
  <div class="flex items-center gap-[4px]">
    <span
      v-for="i in count"
      :key="i"
      class="relative block size-[15px] overflow-hidden"
      :class="clickable ? 'cursor-pointer' : ''"
      @click="handleClick(i)"
    >
      <SmartImage
        :src="StarIcon"
        :alt="
          getStarFillPercent(i) > 0
            ? t('gameDetail.starActiveAlt')
            : t('gameDetail.starInactiveAlt')
        "
        class="size-[15px]"
      />
      <SmartImage
        v-if="getStarFillPercent(i) > 0"
        :src="StarActiveIcon"
        alt=""
        class="absolute left-0 top-0 size-[15px]"
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

const props = withDefaults(
  defineProps<{
    count: number
    activeCount?: number
    clickable?: boolean
  }>(),
  {
    activeCount: 0,
    clickable: false
  }
)

const emit = defineEmits<{
  change: [value: number]
}>()
const { t } = useI18n()

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
