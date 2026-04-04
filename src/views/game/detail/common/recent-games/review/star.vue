<template>
  <div class="flex items-center gap-[4px]">
    <img
      v-for="i in count"
      :key="i"
      :src="i <= activeCount ? StarActiveIcon : StarIcon"
      :alt="i <= activeCount ? t('gameDetail.starActiveAlt') : t('gameDetail.starInactiveAlt')"
      class="size-[15px]"
      :class="clickable ? 'cursor-pointer' : ''"
      @click="handleClick(i)"
    />
  </div>
</template>
<script setup lang="ts">
import StarIcon from '@/static/svg/game/detail/comment/star.svg?url'
import StarActiveIcon from '@/static/svg/game/detail/comment/star_active.svg?url'
import { useI18n } from 'vue-i18n'

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

const handleClick = (value: number) => {
  if (!props.clickable) {
    return
  }
  emit('change', value)
}
</script>
