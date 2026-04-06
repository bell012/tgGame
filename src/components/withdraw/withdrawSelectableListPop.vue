<template>
  <withdrawPopShell
    v-if="isMobile"
    v-model="visible"
    transition-type="bottom-sheet"
    @close="handleClose"
  >
    <div
      class="relative mx-auto flex max-h-[50vh] flex-col rounded-t-3xl bg-bg-1 px-[14px] pb-5 pt-[14px] font-['Inter']"
    >
      <div class="flex items-center justify-between">
        <h2 class="mx-auto text-xl font-bold leading-normal text-text-1">
          {{ title }}
        </h2>
        <button
          type="button"
          class="hidden absolute right-4 top-4 flex h-6 w-6 items-center justify-center rounded-md text-text-1"
          @click="handleClose"
        >
          <CloseIcon class="size-4" />
        </button>
      </div>

      <div class="mt-6 min-h-0 flex-1 space-y-3 overflow-y-auto pr-1">
        <button
          v-for="item in items"
          :key="item.id"
          type="button"
          class="flex w-full items-center justify-between rounded-[10px] bg-bg-2 p-[14px] text-left"
          @click="handleSelect(item.id)"
        >
          <div class="flex min-w-0 items-center">
            <div v-if="icon" class="mr-3 h-10 w-10 shrink-0 overflow-hidden rounded-full">
              <gameErrImg
                :img="{ src: icon, maintain: false, fit: 'contain' }"
                class="h-full w-full"
              />
            </div>
            <div class="min-w-0">
              <p v-if="item.subtitle" class="truncate text-sm leading-normal text-text-2">
                {{ item.subtitle }}
              </p>
              <p
                class="truncate leading-normal text-text-1"
                :class="item.subtitle ? 'text-base font-semibold' : 'text-base font-medium'"
              >
                {{ item.title }}
              </p>
            </div>
          </div>
          <RadioCheckedIcon
            v-if="selectedId === item.id"
            class="ml-1 h-5 w-5 shrink-0 text-theme-primary"
          />
          <RadioUncheckedIcon v-else class="ml-1 h-5 w-5 shrink-0 text-text-4" />
        </button>
      </div>

      <button
        type="button"
        class="mt-6 flex h-10 min-h-10 w-full shrink-0 items-center justify-center rounded-lg btn-primary text-sm font-bold text-common-900"
        @click="emit('add')"
      >
        <AddPlusIcon class="mr-2 h-4 w-4 text-current" />
        {{ addLabel }}
      </button>
    </div>
  </withdrawPopShell>

  <Transition v-else name="dropdown">
    <div
      v-if="visible"
      ref="dropdownRef"
      v-click-outside="handleClose"
      class="absolute left-0 z-50 flex w-full flex-col overflow-hidden rounded-lg border border-opacity-5 bg-bg-5 p-3 font-['Inter'] shadow-[0_10px_30px_rgba(0,0,0,0.25)]"
      :style="dropdownStyle"
    >
      <div class="min-h-0 flex-1 overflow-y-auto">
        <button
          v-for="item in items"
          :key="item.id"
          type="button"
          class="flex w-full items-center justify-between rounded-lg p-3 text-left hover:bg-bg-2"
          :class="{ 'bg-bg-3': selectedId === item.id }"
          @click="handleSelect(item.id)"
        >
          <div class="flex min-w-0 items-center">
            <div
              v-if="icon"
              class="mr-3 h-10 w-10 sm:h-6 sm:w-6 shrink-0 overflow-hidden rounded-full"
            >
              <gameErrImg
                :img="{ src: icon, maintain: false, fit: 'contain' }"
                class="h-full w-full"
              />
            </div>
            <div class="min-w-0 sm:flex sm:items-center sm:gap-1">
              <p
                v-if="item.subtitle"
                class="truncate text-sm leading-normal text-text-2 sm:shrink-0 sm:whitespace-nowrap sm:overflow-visible"
              >
                {{ item.subtitle }}
              </p>
              <p
                class="truncate text-sm leading-normal text-text-1 sm:min-w-0 sm:flex-1"
                :class="selectedId === item.id ? 'font-bold' : 'font-medium'"
              >
                {{ item.title }}
              </p>
            </div>
          </div>
          <RadioCheckedIcon
            v-if="selectedId === item.id"
            class="ml-1 h-5 w-5 shrink-0 text-theme-primary"
          />
          <RadioUncheckedIcon v-else class="ml-1 h-5 w-5 shrink-0 text-text-4" />
        </button>
      </div>

      <div class="shrink-0 bg-bg-5 pt-3">
        <button
          type="button"
          class="flex h-12 min-h-12 w-full items-center justify-center rounded-lg btn-primary text-base font-bold text-common-900"
          @click="emit('add')"
        >
          <AddPlusIcon class="mr-2 h-4 w-4 text-current" />
          {{ addLabel }}
        </button>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import { useIsMobile } from '@/composables/useMediaQuery'
import gameErrImg from '@/components/common/gameErrImg.vue'
import CloseIcon from '@/static/svg/close.svg?component'
import RadioCheckedIcon from '@/static/svg/radio-checked-hollow.svg?component'
import RadioUncheckedIcon from '@/static/svg/radio-unchecked.svg?component'
import AddPlusIcon from '@/static/svg/withdraw/add-plus.svg?component'
import withdrawPopShell from './withdrawPopShell.vue'

export interface WithdrawSelectableListItem {
  id: string
  title: string
  subtitle?: string
}

interface Props {
  modelValue: boolean
  title: string
  addLabel: string
  items: WithdrawSelectableListItem[]
  selectedId?: string | null
  icon?: string
  desktopDropdownHeight?: number
}

const props = withDefaults(defineProps<Props>(), {
  desktopDropdownHeight: 228
})
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  close: []
  add: []
  select: [id: string]
}>()

const isMobile = useIsMobile()
const dropdownRef = ref<HTMLElement | null>(null)
const dropdownStyle = ref<Record<string, string>>({
  top: 'calc(100% + 8px)',
  height: `${props.desktopDropdownHeight}px`,
  maxHeight: `${props.desktopDropdownHeight}px`,
  padding: '12px'
})

const visible = computed({
  get: () => props.modelValue,
  set: value => emit('update:modelValue', value)
})

const handleSelect = (id: string) => {
  emit('select', id)

  if (!isMobile.value) {
    handleClose()
  }
}

const handleClose = () => {
  emit('update:modelValue', false)
  emit('close')
}

const updateDropdownPosition = () => {
  if (isMobile.value || !dropdownRef.value) {
    return
  }

  const anchor = dropdownRef.value.parentElement

  if (!anchor) {
    return
  }

  const rect = anchor.getBoundingClientRect()
  const viewportPadding = 12
  const spaceBelow = window.innerHeight - rect.bottom - viewportPadding
  const spaceAbove = rect.top - viewportPadding
  const shouldOpenUp = spaceBelow < 220 && spaceAbove > spaceBelow
  const availableSpace = Math.max(0, shouldOpenUp ? spaceAbove : spaceBelow)
  const desiredHeight = props.desktopDropdownHeight
  const nextHeight = Math.max(0, Math.min(desiredHeight, availableSpace))

  dropdownStyle.value = {
    height: `${nextHeight}px`,
    maxHeight: `${nextHeight}px`,
    padding: '12px',
    top: shouldOpenUp ? 'auto' : 'calc(100% + 8px)',
    bottom: shouldOpenUp ? 'calc(100% + 8px)' : 'auto'
  }
}

watch(visible, async isVisible => {
  if (!isVisible || isMobile.value) {
    return
  }

  await nextTick()
  updateDropdownPosition()
  window.addEventListener('resize', updateDropdownPosition)
  window.addEventListener('scroll', updateDropdownPosition, true)
})

watch(visible, isVisible => {
  if (isVisible || isMobile.value) {
    return
  }

  window.removeEventListener('resize', updateDropdownPosition)
  window.removeEventListener('scroll', updateDropdownPosition, true)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', updateDropdownPosition)
  window.removeEventListener('scroll', updateDropdownPosition, true)
})

const vClickOutside = {
  mounted(el: HTMLElement, binding: { value: () => void }) {
    const clickOutsideEvent = (event: Event) => {
      if (!(el === event.target || el.contains(event.target as Node))) {
        binding.value()
      }
    }

    const target = el as HTMLElement & {
      clickOutsideEvent?: (event: Event) => void
      clickOutsideTimer?: number
    }

    target.clickOutsideEvent = clickOutsideEvent
    target.clickOutsideTimer = window.setTimeout(() => {
      document.addEventListener('click', clickOutsideEvent)
    }, 0)
  },
  unmounted(
    el: HTMLElement & { clickOutsideEvent?: (event: Event) => void; clickOutsideTimer?: number }
  ) {
    if (el.clickOutsideTimer) {
      window.clearTimeout(el.clickOutsideTimer)
    }

    if (el.clickOutsideEvent) {
      document.removeEventListener('click', el.clickOutsideEvent)
    }
  }
}
</script>

<style scoped>
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.2s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.dropdown-enter-to,
.dropdown-leave-from {
  opacity: 1;
  transform: translateY(0);
}
</style>
