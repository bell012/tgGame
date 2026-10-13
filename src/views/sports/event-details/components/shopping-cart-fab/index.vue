<template>
  <button
    type="button"
    class="fixed z-30 h-[50px] w-[50px] shrink-0 bg-transparent p-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-theme-primary rounded-[24.667px] border border-[rgba(253,161,40,0.2)] bg-[linear-gradient(180deg,rgba(253,161,40,0.2)_0%,rgba(253,161,40,0)_100%),linear-gradient(180deg,rgba(60,60,60,0.9)_0%,rgba(39,39,39,0.9)_66.35%,rgba(43,43,43,0.9)_100%)] backdrop-blur-[1px]"
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
