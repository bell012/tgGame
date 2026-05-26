<template>
  <div class="relative">
    <button
      ref="triggerRef"
      class="dropdown-trigger flex h-[42px] w-full items-center justify-between px-2.5"
      @click.stop="togglePopup"
    >
      <div class="flex flex-1 items-center text-xs">
        <span class="mr-2.5 font-normal text-text-2">{{ label }}:</span>
        <span class="text-text-1 font-bold">
          {{ selectedLabel }}
        </span>
      </div>
      <span
        class="flex h-5 w-5 items-center justify-center rounded-[6px] bg-[var(--color-opacity-10)] text-text-1"
      >
        <component
          :is="casinoIcons.dropdown_chevron"
          class="h-2 w-2 fill-current [&_path]:fill-current"
        />
      </span>
    </button>

    <transition name="popup-fade">
      <div
        v-if="isMobile"
        v-show="popupShow"
        class="fixed inset-0 z-[9998] bg-[var(--color-mask-60-1)]"
        @click.self="closePopup"
      />
    </transition>

    <transition :name="isMobile ? 'up-down' : 'desktop-up-down'">
      <div
        v-show="popupShow"
        ref="popupWrapRef"
        :class="isMobile ? 'fixed bottom-0 left-0 z-[9999] w-full' : popupClass"
        :style="isMobile ? {} : { top: desktopTop }"
      >
        <div
          ref="popupRef"
          class="flex flex-col"
          :class="{
            'max-h-[75vh] rounded-t-xl bg-bg-1 px-3.5 pt-2.5': isMobile,
            'desktop-popup-inner max-h-[19.75rem] overflow-y-auto rounded-lg p-3': !isMobile
          }"
        >
          <div v-if="isMobile" class="mb-[20px] flex items-center justify-between">
            <div class="w-7" />
            <div class="text-base font-bold text-[var(--color-text-level-1)]">Select</div>
            <button
              class="flex h-7 w-7 items-center justify-center rounded-[8px] bg-[var(--color-opacity-10)]"
              @click.stop="closePopup"
            >
              <CloseIcon class="h-2.5 w-2.5 text-text-1" />
            </button>
          </div>

          <div v-if="search" class="relative" :class="isMobile ? 'mb-[20px]' : 'mb-3'">
            <component
              :is="SearchIcon"
              class="absolute left-2.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-icon-2 fill-current [&_path]:fill-current [&_svg]:block [&_svg]:h-full [&_svg]:w-full"
            />
            <input
              v-model="keyword"
              type="text"
              :placeholder="t('home.search')"
              class="dropdown-search-input h-[42px] w-full rounded-lg border pl-[38px] pr-11 text-[14px] font-[500] text-text-1 outline-none placeholder:font-[500] placeholder:text-text-2 focus:border-theme-primary"
            />
          </div>

          <div class="flex-1 overflow-y-auto" :class="{ 'pb-[58px]': Multi }">
            <div class="flex flex-col" :class="{ 'desktop-popup-list': !isMobile }">
              <div
                v-for="item in filteredOptions"
                :key="item.value"
                class="dropdown-item flex cursor-pointer items-center rounded-lg"
                :class="{
                  'mb-[20px] h-[42px] px-2.5': isMobile,
                  'h-[44px] px-3': !isMobile,
                  'justify-between': !Multi,
                  'bg-[var(--color-opacity-10)]': isMobile && isSelected(item),
                  'desktop-popup-item--selected': !isMobile && !Multi && isSelected(item)
                }"
                @click="selectItem(item)"
              >
                <span v-if="!Multi" class="text-text-1" :class="sortItemTextClass(item)">
                  {{ item.label }}
                </span>
                <span
                  v-if="Multi"
                  class="dropdown-checkbox box-border inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-[6px] border"
                  :class="
                    isSelected(item) ? 'dropdown-checkbox--checked' : 'dropdown-checkbox--unchecked'
                  "
                >
                  <span
                    v-if="isSelected(item)"
                    class="dropdown-checkbox-mark text-[12px] font-bold leading-none"
                  >
                    ✓
                  </span>
                </span>
                <component
                  v-else-if="!isMobile"
                  :is="isSelected(item) ? RadioCheckedIcon : RadioUncheckedIcon"
                  :class="[
                    'dropdown-radio-icon h-4 w-4 shrink-0',
                    isSelected(item)
                      ? 'dropdown-radio-icon--checked'
                      : 'dropdown-radio-icon--unchecked'
                  ]"
                />
                <span
                  v-else
                  class="dropdown-checkbox box-border inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-[6px] border"
                  :class="
                    isSelected(item) ? 'dropdown-checkbox--checked' : 'dropdown-checkbox--unchecked'
                  "
                >
                  <span
                    v-if="isSelected(item)"
                    class="dropdown-checkbox-mark text-[12px] font-bold leading-none"
                  >
                    ✓
                  </span>
                </span>
                <div v-if="Multi" class="ml-2.5 flex h-[30px] w-[100px] items-center">
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
            class="dropdown-clear-bar absolute inset-x-0 bottom-0 flex items-center border-t py-[15px]"
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
import ClearIcon from '@/static/svg/clear.svg?component'
import SearchIcon from '@/static/svg/explore/search.svg?component'
import RadioCheckedIcon from '@/static/svg/explore/radio-checked2.svg?component'
import RadioUncheckedIcon from '@/static/svg/radio-unchecked.svg?component'
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
const isLightTheme = computed(() => themeStore.theme === 'light')
const popupShow = ref(false)
const keyword = ref('')

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
const popupWrapRef = ref<HTMLElement | null>(null)
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

const sortItemTextClass = (item: { value: string }) => {
  if (isMobile.value) {
    return 'font-[700]'
  }

  if (isLightTheme.value) {
    return 'text-[13px] font-normal leading-none'
  }

  return isSelected(item)
    ? 'text-[13px] font-bold leading-none'
    : 'text-[13px] font-normal leading-none'
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

const onDocumentClick = (event: MouseEvent) => {
  if (!popupShow.value || isMobile.value) {
    return
  }

  const target = event.target as Node
  if (triggerRef.value?.contains(target) || popupWrapRef.value?.contains(target)) {
    return
  }

  closePopup()
}

watch(popupShow, value => {
  if (value && isMobile.value) {
    document.body.classList.add('overflow-hidden')
  } else if (value && !isMobile.value) {
    requestAnimationFrame(() => updatePopupPlacement())
    document.addEventListener('mousedown', onDocumentClick)
  } else {
    document.body.classList.remove('overflow-hidden')
    document.removeEventListener('mousedown', onDocumentClick)
  }
})

onBeforeUnmount(() => {
  document.body.classList.remove('overflow-hidden')
  document.removeEventListener('mousedown', onDocumentClick)
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
  z-index: 1;
}

.dropdown-radio-icon--unchecked :deep(circle),
.dropdown-radio-icon--unchecked :deep(rect) {
  stroke: var(--color-opacity-6);
  fill: none;
}

.dropdown-radio-icon--checked :deep(rect) {
  stroke: var(--color-theme-level-1);
  fill: none;
}

.dropdown-checkbox--unchecked {
  border-color: var(--color-icon-level-3);
  background: transparent;
}

.dropdown-checkbox--checked {
  border-color: var(--color-theme-level-1);
  background-color: var(--color-theme-level-1);
}

.dropdown-checkbox-mark {
  color: #ffffff;
}

@media (min-width: 768px) {
  .dropdown-trigger,
  .desktop-popup-inner {
    border-radius: 8px;
    border: 1px solid var(--color-opacity-6);
    background: var(--color-background-level-5);
  }

  .dropdown-item {
    box-sizing: border-box;
    background-color: transparent;
  }

  .dropdown-item.desktop-popup-item--selected {
    background-color: var(--color-background-level-3);
  }

  :global(:root.light) .dropdown-item.desktop-popup-item--selected {
    background-color: var(--color-theme-level-3);
  }

  .dropdown-search-input {
    border-radius: 8px;
    border: 1px solid var(--color-opacity-6);
    background: var(--color-input-level-1);
  }

  .dropdown-clear-bar {
    border-top: 1px solid var(--color-opacity-6);
    background: var(--color-background-level-5);
  }
}

@media (max-width: 767px) {
  .dropdown-trigger {
    border-color: var(--color-opacity-6);
    background: var(--color-opacity-10);
  }

  .dropdown-search-input {
    border-color: var(--color-opacity-6);
    background: var(--color-background-level-2);
  }

  :global(:root.light) .dropdown-search-input {
    background: #ffffff;
  }

  .dropdown-clear-bar {
    border-color: var(--color-opacity-6);
    background: var(--color-background-level-2);
  }
}
</style>
