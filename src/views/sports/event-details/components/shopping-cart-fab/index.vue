<template>
  <button
    type="button"
    class="fixed z-30 h-[54px] w-[54px] shrink-0 border-0 bg-transparent p-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-theme-primary"
    :style="fabStyle"
    :aria-label="ariaLabel"
    data-testid="event-details-shopping-cart-fab"
    @click="emit('click')"
  >
    <span class="relative block h-full w-full">
      <img
        class="block h-full w-full object-contain"
        :src="shoppingIcon"
        alt=""
        draggable="false"
        aria-hidden="true"
      />
      <span
        v-if="count > 0"
        class="absolute right-0 top-0 flex h-4 min-w-4 -translate-y-0.5 translate-x-0.5 items-center justify-center rounded-full bg-secondary-2 px-0.5 text-xs font-bold leading-4 text-common-100"
        aria-hidden="true"
        data-testid="event-details-shopping-cart-fab-count"
      >
        {{ count > 99 ? '99+' : count }}
      </span>
    </span>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useLayoutStore } from '@/stores/layout'
import shoppingIcon from '../../shopping.svg?url'

withDefaults(
  defineProps<{
    count?: number
    ariaLabel?: string
  }>(),
  {
    count: 0,
    ariaLabel: 'Bet slip'
  }
)

const emit = defineEmits<{ click: [] }>()

const layoutStore = useLayoutStore()

const fabStyle = computed(() => ({
  right: `calc(14px + env(safe-area-inset-right))`,
  bottom: `calc(${layoutStore.BOTTOM_TAB_HEIGHT + 14}px + env(safe-area-inset-bottom))`
}))
</script>
