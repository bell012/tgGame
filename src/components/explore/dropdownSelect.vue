<template>
  <div class="relative font-['Inter']">
    <button
      ref="triggerRef"
      type="button"
      class="flex w-full items-center justify-between rounded-lg border border-solid border-opacity-10 sm:border-opacity-6 max-sm:bg-opacity-5 sm:bg-bg-5 px-2.5 py-[11px]"
      @click.stop="togglePopup"
    >
      <div class="flex flex-1 items-center text-xs">
        <span class="mr-2.5 text-text-2">{{ label }}:</span>
        <span class="text-text-1">
          {{ selectedLabel }}
        </span>
      </div>
      <span
        class="flex h-5 w-5 items-center justify-center rounded-[6px] bg-opacity-10 text-text-1"
      >
        <component
          :is="casinoIcons.dropdown_chevron"
          class="h-2 w-2 fill-current [&_path]:fill-current"
        />
      </span>
    </button>

    <Transition v-bind="maskFadeTransition">
      <div
        v-show="popupShow"
        class="fixed inset-0 z-[9998]"
        :class="{ 'bg-mask-60-1': isMobile }"
        @click.self="closePopup"
      />
    </Transition>

    <Transition v-bind="popupMoveTransition">
      <div v-show="popupShow" :class="popupShellClass" :style="isMobile ? {} : { top: desktopTop }">
        <div
          ref="popupRef"
          class="flex flex-col bg-bg-1"
          :class="[
            isMobile
              ? 'max-h-[75vh] rounded-t-xl px-3.5 pt-2.5'
              : 'explore-select-panel--desktop pointer-events-auto absolute left-0 max-h-[16rem] w-full overflow-y-auto'
          ]"
        >
          <div v-if="isMobile" class="mb-2.5 flex items-center justify-between">
            <div class="w-7 shrink-0" />
            <div class="text-base font-bold text-text-1">Select</div>
            <button
              type="button"
              class="flex size-[28px] shrink-0 items-center justify-center rounded bg-opacity-10"
              @click.stop="closePopup"
            >
              <CloseIcon class="h-2.5 w-2.5 text-text-1" />
            </button>
          </div>

          <div v-if="search" class="relative mb-2.5">
            <SearchIcon
              class="pointer-events-none absolute left-2.5 top-1/2 size-[18px] -translate-y-1/2 text-icon-2 [&_svg]:block [&_svg]:h-full [&_svg]:w-full [&_svg]:max-h-full [&_svg]:max-w-full"
              aria-hidden="true"
            />
            <input
              v-model="keyword"
              type="text"
              :placeholder="t('home.search')"
              class="h-[42px] w-full rounded-lg border border-opacity-10 bg-input-1 py-0 pl-9 pr-11 text-sm font-medium text-text-1 outline-none placeholder:text-text-2 focus:border-theme-primary"
            />
          </div>

          <div class="flex-1 overflow-y-auto" :class="{ 'pb-[58px]': Multi }">
            <div class="flex flex-col" :class="{ 'explore-select-list--desktop': !isMobile }">
              <div
                v-for="item in filteredOptions"
                :key="item.value"
                class="explore-select-item flex items-center"
                :class="{
                  'explore-select-item--selected': isSelected(item),
                  'justify-between': !Multi,
                  'mb-2.5 h-[42px] px-2.5': isMobile
                }"
                @click="selectItem(item)"
              >
                <span
                  v-if="!Multi"
                  class="explore-select-item-label"
                  :class="{ 'explore-select-item-label--selected': isSelected(item) && !isMobile }"
                >
                  {{ item.label }}
                </span>
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
                  :class="
                    Multi
                      ? [
                          'explore-select-checkbox',
                          isSelected(item)
                            ? 'explore-select-checkbox--checked'
                            : 'explore-select-checkbox--unchecked'
                        ]
                      : [
                          'explore-select-radio',
                          isSelected(item)
                            ? 'explore-select-radio--checked'
                            : 'explore-select-radio--unchecked'
                        ]
                  "
                />
                <div v-if="Multi" class="ml-2.5 h-[22px] min-w-0 flex items-center justify-start">
                  <gameRemoteImg
                    class="!bg-transparent h-[22px] max-h-[22px]"
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
            class="absolute inset-x-0 bottom-0 flex items-center border-t border-opacity-10 bg-bg-2 py-[15px]"
          >
            <button type="button" class="flex w-full items-center justify-center" @click="clearAll">
              <ClearIcon class="h-3.5 w-3.5" />
              <div class="ml-1.5 text-xs font-medium text-theme-primary">{{ clearLabel }}</div>
            </button>
          </div>

          <div v-if="isMobile" class="pb-[env(safe-area-inset-bottom)]" />
        </div>
      </div>
    </Transition>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, watch, onBeforeUnmount } from 'vue'
import { useI18n } from 'vue-i18n'
import { useIsMobile } from '@/composables/useMediaQuery'
import CloseIcon from '@/static/svg/close.svg?component'
import RadioCheckedIcon from '@/static/svg/explore/radio-checked2.svg?component'
import RadioUncheckedIcon from '@/static/svg/radio-unchecked.svg?component'
import CubeChecedIcon from '@/static/svg/cube-checked.svg?component'
import CubeUnchecedIcon from '@/static/svg/cube-unchecked.svg?component'
import ClearIcon from '@/static/svg/clear.svg?component'
import SearchIcon from '@/static/svg/explore/search.svg?component'
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
const popupShow = ref(false)
const keyword = ref('')

const maskFadeTransition = {
  enterActiveClass: 'transition-opacity duration-[250ms] ease-out',
  leaveActiveClass: 'transition-opacity duration-[250ms] ease-out',
  enterFromClass: 'opacity-0',
  leaveToClass: 'opacity-0'
} as const

const popupMoveTransition = computed(() => {
  if (isMobile.value) {
    return {
      enterActiveClass: 'transition-transform duration-300 ease-out [will-change:transform]',
      leaveActiveClass: 'transition-transform duration-300 ease-out [will-change:transform]',
      enterFromClass: 'translate-y-full',
      leaveToClass: 'translate-y-full',
      enterToClass: 'translate-y-0',
      leaveFromClass: 'translate-y-0'
    }
  }

  const enterFromY = popupPlacement.value === 'top' ? '-translate-y-[10px]' : 'translate-y-[10px]'

  return {
    enterActiveClass: 'transition-all duration-200 ease-in-out',
    leaveActiveClass: 'transition-all duration-200 ease-in-out',
    enterFromClass: `opacity-0 ${enterFromY}`,
    leaveToClass: 'opacity-0 -translate-y-5',
    enterToClass: 'opacity-100 translate-y-0',
    leaveFromClass: 'opacity-100 translate-y-0'
  }
})

const popupShellClass = computed(() =>
  isMobile.value
    ? 'fixed inset-x-0 bottom-0 z-[9999] w-full'
    : 'pointer-events-none absolute left-0 z-[9999] w-full'
)

const selectedLabel = computed(() => {
  if (props.Multi) return props.selectedList.length > 0 ? `+${props.selectedList.length}` : 'All'
  else {
    const sel = props.options.find(o => o.value === props.selected)
    return sel ? sel.label : ''
  }
})

const filteredOptions = computed(() => {
  if (!keyword.value) return props.options
  const k = keyword.value.toLowerCase()
  return props.options.filter(
    item => item.label.toLowerCase().includes(k) || item.value.toLowerCase().includes(k)
  )
})

const triggerRef = ref<HTMLElement | null>(null)
const popupRef = ref<HTMLElement | null>(null)
const popupPlacement = ref<'bottom' | 'top'>('bottom')
const desktopTop = ref('calc(100% + 5px)')

const togglePopup = () => (popupShow.value = !popupShow.value)
const closePopup = () => (popupShow.value = false)

const isSelected = (item: { value: string }) =>
  props.Multi ? props.selectedList.includes(item.value) : props.selected === item.value

const selectItem = (item: { value: string }) => {
  if (props.Multi) {
    const idx = props.selectedList.indexOf(item.value)
    const newList = [...props.selectedList]
    if (idx >= 0) newList.splice(idx, 1)
    else newList.push(item.value)
    emit('update:selected-list', newList)
  } else {
    emit('update:selected', item.value)
    closePopup()
  }
}

const clearAll = () => {
  emit('update:selected-list', [])

  if (isMobile.value) {
    closePopup()
  }
}

const GAP = 5
const updatePopupPlacement = () => {
  if (!triggerRef.value || !popupRef.value) return

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

watch(popupShow, val => {
  if (val && isMobile.value) {
    document.body.classList.add('overflow-hidden')
  } else if (val && !isMobile.value) {
    requestAnimationFrame(() => updatePopupPlacement())
  } else {
    document.body.classList.remove('overflow-hidden')
  }
})

onBeforeUnmount(() => document.body.classList.remove('overflow-hidden'))
</script>

<style scoped lang="scss">
@use './explore-select-icons.scss';
</style>
