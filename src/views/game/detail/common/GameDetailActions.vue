<template>
  <div class="flex shrink-0 items-start" :class="mobile ? 'gap-3' : 'gap-[26px]'">
    <button
      type="button"
      :aria-label="t('gameDetail.favoriteTooltip')"
      :aria-pressed="isFavorite"
      :disabled="isUpdating"
      :title="countText"
      class="flex items-center font-normal text-text-2 disabled:cursor-wait"
      :class="mobile ? 'w-[30px] flex-col' : 'min-h-9 gap-1 rounded bg-bg-2 px-2 py-1 text-xs'"
      @click="toggleFavorite"
    >
      <span
        v-if="mobile"
        class="relative z-[1] flex h-[13.33px] w-full items-center justify-center rounded-[2.67px] bg-bg-3 px-0.5 text-center text-[9px] leading-[9px]"
        ><span class="truncate">{{ countText }}</span></span
      >
      <span
        :class="
          mobile
            ? '-mt-[3px] flex h-7 w-full items-center justify-center rounded-[5px] bg-bg-2'
            : 'flex'
        "
      >
        <component
          :is="mobile ? FavoriteOutline : FavoriteIcon"
          :class="[
            mobile ? 'size-[17.33px]' : 'size-7',
            isFavorite ? 'text-secondary-7' : 'text-icon-2'
          ]"
          aria-hidden="true"
        />
      </span>
      <span v-if="!mobile">{{ countText }}</span>
    </button>
    <button
      type="button"
      :aria-label="t('gameDetail.demo')"
      class="flex items-center font-normal text-text-2"
      :class="mobile ? 'w-[30px] flex-col' : 'min-h-9 gap-1 rounded bg-bg-2 px-2 py-1 text-xs'"
    >
      <span
        v-if="mobile"
        class="relative z-[1] flex h-[13.33px] w-full items-center justify-center rounded-[2.67px] bg-bg-3 text-[9px] leading-[9px]"
        >{{ t('gameDetail.demo') }}</span
      >
      <span
        :class="
          mobile
            ? '-mt-[3px] flex h-7 w-full items-center justify-center rounded-[5px] bg-bg-2'
            : 'flex'
        "
      >
        <DemoIcon
          :class="mobile ? 'size-[17.33px]' : 'size-7'"
          class="text-icon-2"
          aria-hidden="true"
        />
      </span>
      <span v-if="!mobile">{{ t('gameDetail.demo') }}</span>
    </button>
  </div>
</template>
<script setup lang="ts">
import { computed, inject, ref, type Ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useGameFavorite } from '@/composables/useGameFavorite'
import FavoriteIcon from '@/static/svg/game/detail/top/favorite.svg?component'
import FavoriteOutline from '@/static/svg/game/detail/top/favorite-outline.svg?component'
import DemoIcon from '@/static/svg/game/detail/top/demo.svg?component'

defineProps<{ mobile?: boolean }>()
const { t } = useI18n()
const { isFavorite, isUpdating, toggleFavorite } = useGameFavorite()
const count = inject<Ref<number | null>>('game-detail-collections-count', ref(null))
const countText = computed(() => (count.value === null ? '--' : String(count.value)))
</script>
