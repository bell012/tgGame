<template>
  <div class="relative">
    <button
      ref="triggerRef"
      class="flex w-full items-center justify-between rounded-lg border border-solid border-[var(--color-opacity-10)] bg-[var(--color-opacity-10)] px-2.5 py-[11px]"
      @click.stop="togglePopup"
    >
      <div class="flex flex-1 items-center text-xs">
        <span class="mr-2.5 text-text-2">{{ label }}:</span>
        <span class="text-text-1">
          {{ selectedLabel }}
        </span>
      </div>
      <span
        class="flex h-5 w-5 items-center justify-center rounded-[6px] bg-[var(--color-opacity-10)] fill-text-1"
      >
        <component :is="casinoIcons.dropdown_chevron" class="h-2 w-2 fill-current" />
      </span>
    </button>

    <transition name="popup-fade">
      <div
        v-show="popupShow"
        class="fixed inset-0 z-[9998]"
        :class="{ 'bg-[var(--color-mask-60-1)]': isMobile }"
        @click.self="closePopup"
      />
    </transition>

    <transition :name="isMobile ? 'up-down' : 'desktop-up-down'">
      <div
        v-show="popupShow"
        class="fixed bottom-0 left-0 z-[9999] w-full"
        :class="popupClass"
        :style="isMobile ? {} : { top: desktopTop }"
      >
        <div
          ref="popupRef"
          class="flex flex-col rounded-t-xl bg-[var(--color-background-level-1)] px-3.5 pt-2.5"
          :class="{
            'max-h-[75vh]': isMobile,
            'desktop-popup-inner max-h-[16rem] overflow-y-auto rounded-xl': !isMobile
          }"
        >
          <div v-if="isMobile" class="mb-2.5 flex items-center justify-between">
            <div class="w-7" />
            <div class="text-base font-bold text-[var(--color-text-level-1)]">Select</div>
            <button
              class="flex h-7 w-7 items-center justify-center rounded bg-[var(--color-opacity-10)]"
              @click.stop="closePopup"
            >
              <CloseIcon class="h-4 w-4 stroke-text-1" />
            </button>
          </div>

          <div v-if="search" class="relative mb-2.5">
            <component
              :is="isDarkTheme ? SearchBlackIcon : SearchIcon"
              class="absolute left-2.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 opacity-50"
            />
            <input
              v-model="keyword"
              type="text"
              :placeholder="t('home.search')"
              class="h-[42px] w-full rounded-lg border border-[var(--color-opacity-10)] pl-[38px] pr-11 text-xs font-[600] text-text-1 outline-none placeholder:text-text-2 focus:border-theme-primary"
              :class="isDarkTheme ? 'bg-[var(--color-background-level-3)]' : 'bg-white'"
            />
          </div>

          <div class="flex-1 overflow-y-auto" :class="{ 'pb-[58px]': Multi }">
            <div class="flex flex-col">
              <div
                v-for="item in filteredOptions"
                :key="item.value"
                class="mb-2.5 flex h-[42px] cursor-pointer items-center rounded-lg px-2.5"
                :class="{
                  'justify-between': !Multi,
                  'bg-[var(--color-opacity-10)]': isSelected(item)
                }"
                @click="selectItem(item)"
              >
                <span v-if="!Multi">{{ item.label }}</span>
                <component
                  :is="
                    isSelected(item)
                      ? Multi
                        ? CubeChecedIcon
                        : RadioCheckedIcon
                      : Multi
                        ? CubeUnchecedIcon
                        : RadioUncheckedIcon
                  "
                  class="h-5 w-5"
                />
                <div v-if="Multi" class="ml-2.5 flex h-[22px] w-[100px] items-center">
                  <gameRemoteImg
                    class="!bg-transparent"
                    :img="{
                      maintain: false,
                      src: item?.icon,
                      fit: 'contain' as const
                    }"
                    :alt="item?.label"
                  />
                </div>
              </div>
            </div>
          </div>

          <div
            v-if="Multi"
            class="absolute inset-x-0 bottom-0 flex items-center border-t border-[var(--color-opacity-10)] bg-[var(--color-background-level-2)] py-[15px]"
          >
            <button type="button" class="flex w-full items-center justify-center" @click="clearAll">
              <ClearIcon class="h-3.5 w-3.5" />
              <div class="ml-1.5 text-xs font-[500] text-theme-primary">{{ clearLabel }}</div>
            </button>
          </div>

          <div v-if="isMobile" style="padding-bottom: env(safe-area-inset-bottom)"></div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script lang="ts" setup>
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useIsMobile } from '@/composables/useMediaQuery'
import { useThemeStore } from '@/stores/theme'
import CloseIcon from '@/static/svg/close.svg?component'
import RadioCheckedIcon from '@/static/svg/radio-checked-hollow.svg?component'
import RadioUncheckedIcon from '@/static/svg/radio-unchecked.svg?component'
import CubeChecedIcon from '@/static/svg/cube-checked.svg?component'
import CubeUnchecedIcon from '@/static/svg/cube-unchecked.svg?component'
import ClearIcon from '@/static/svg/clear.svg?component'
import SearchIcon from '@/static/svg/explore/search.svg?component'
import SearchBlackIcon from '@/static/svg/explore/search_black.svg?component'
import { casinoIcons } from '@/static/svg/casino'
import gameRemoteImg from '@/components/common/gameRemoteImg.vue'

const { t } = useI18n()

const props = defineProps({
  options: {
    type: Array as () => { label: string; value: string; icon?: string }[],
    required: true
  },
  selected: { type: String, default: '' },
  selectedList: { type: Array as () => string[], default: () => [] },
  label: { type: String, default: '' },
  search: { type: Boolean, default: false },
  Multi: { type: Boolean, default: false },
  clearLabel: { type: String, default: 'Clear' }
})

const emit = defineEmits<{
  (e: 'update:selected', val: string): void
  (e: 'update:selected-list', val: string[]): void
}>()

const isMobile = useIsMobile()
const themeStore = useThemeStore()
const popupShow = ref(false)
const keyword = ref('')
const isDarkTheme = computed(() => themeStore.theme === 'dark')

const selectedLabel = computed(() => {
  if (props.Multi) {
    return props.selectedList.length > 0 ? `+${props.selectedList.length}` : 'All'
  }

  const selectedItem = props.options.find(item => item.value === props.selected)
  return selectedItem ? selectedItem.label : ''
})

const popupPlacement = ref<'bottom' | 'top'>('bottom')
const desktopTop = ref('calc(100% + 5px)')
const triggerRef = ref<HTMLElement | null>(null)
const popupRef = ref<HTMLElement | null>(null)

const popupClass = computed(() => {
  if (isMobile.value) {
    return 'fixed bottom-0 left-0 w-full'
  }

  return [
    'desktop-popup',
    popupPlacement.value === 'top' ? 'desktop-popup-top' : 'desktop-popup-bottom'
  ]
})

const filteredOptions = computed(() => {
  if (!keyword.value) {
    return props.options
  }

  const normalizedKeyword = keyword.value.toLowerCase()
  return props.options.filter(
    item =>
      item.label.toLowerCase().includes(normalizedKeyword) ||
      item.value.toLowerCase().includes(normalizedKeyword)
  )
})

const togglePopup = () => {
  popupShow.value = !popupShow.value
}

const closePopup = () => {
  popupShow.value = false
}

const isSelected = (item: { value: string }) => {
  return props.Multi ? props.selectedList.includes(item.value) : props.selected === item.value
}

const selectItem = (item: { value: string }) => {
  if (props.Multi) {
    const selectedIndex = props.selectedList.indexOf(item.value)
    const nextSelectedList = [...props.selectedList]

    if (selectedIndex >= 0) {
      nextSelectedList.splice(selectedIndex, 1)
    } else {
      nextSelectedList.push(item.value)
    }

    emit('update:selected-list', nextSelectedList)
    return
  }

  emit('update:selected', item.value)
  closePopup()
}

const clearAll = () => {
  emit('update:selected-list', [])

  if (isMobile.value) {
    closePopup()
  }
}

const GAP = 5
const updatePopupPlacement = () => {
  if (!triggerRef.value || !popupRef.value) {
    return
  }

  const triggerRect = triggerRef.value.getBoundingClientRect()
  const popupHeight = popupRef.value.offsetHeight
  const viewportHeight = window.innerHeight
  const spaceBelow = viewportHeight - triggerRect.bottom
  const spaceAbove = triggerRect.top
  const canBottom = spaceBelow >= popupHeight
  const canTop = spaceAbove >= popupHeight

  if (canBottom && canTop) {
    popupPlacement.value = spaceBelow >= spaceAbove ? 'bottom' : 'top'
  } else if (canBottom) {
    popupPlacement.value = 'bottom'
  } else if (canTop) {
    popupPlacement.value = 'top'
  } else {
    popupPlacement.value = spaceBelow >= spaceAbove ? 'bottom' : 'top'
  }

  desktopTop.value =
    popupPlacement.value === 'bottom' ? `calc(100% + ${GAP}px)` : `-${popupHeight + GAP}px`
}

watch(popupShow, value => {
  if (value && isMobile.value) {
    document.body.classList.add('overflow-hidden')
  } else if (value && !isMobile.value) {
    requestAnimationFrame(() => updatePopupPlacement())
  } else {
    document.body.classList.remove('overflow-hidden')
  }
})

onBeforeUnmount(() => {
  document.body.classList.remove('overflow-hidden')
})
</script>

<style scoped lang="scss">
@use '@/styles/mixins' as *;

@include popup-transition;

.desktop-up-down-enter-active,
.desktop-up-down-leave-active {
  transition: all 0.2s ease;
}

.desktop-up-down-enter-from,
.desktop-up-down-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

.desktop-up-down-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.desktop-popup[style*='-'] .desktop-up-down-enter-from {
  transform: translateY(-10px);
}

.desktop-popup {
  position: absolute;
  left: 0;
  width: 100%;
  pointer-events: none;
}

.desktop-popup-inner {
  position: absolute;
  left: 0;
  width: 100%;
  pointer-events: auto;
}
</style>
