<template>
  <div class="flex items-center gap-[4px]">
    <img
      v-for="i in count"
      :key="i"
      :src="i <= activeCount ? StarActiveIcon : StarIcon"
      :alt="i <= activeCount ? 'Active Star' : 'Inactive Star'"
      class="size-[15px]"
    />
  </div>
</template>
<script setup lang="ts">
import StarIcon from '@/static/svg/game/detail/comment/star.svg?url'
import StarActiveIcon from '@/static/svg/game/detail/comment/star_active.svg?url'

withDefaults(
  defineProps<{
    count: number
    activeCount?: number
  }>(),
  {
    activeCount: 0
  }
)
</script>
