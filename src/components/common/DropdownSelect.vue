<template>
  <div class="relative font-['Inter']">
    <!-- 触发按钮 -->
    <div ref="triggerRef">
      <slot name="trigger" :toggle="togglePopup" :open="popupShow">
        <button
          type="button"
          class="flex w-full items-center justify-between rounded-lg border border-solid border-opacity-10 sm:border-opacity-6 max-sm:bg-opacity-5 sm:bg-bg-5 px-2.5 py-[11px]"
          @click.stop="togglePopup"
        >
          <div class="flex flex-1 items-center text-xs sm:mr-2 sm:min-w-0">
            <span class="mr-2.5 text-text-2 sm:truncate">{{ label }}:</span>
            <span class="text-text-1 sm:truncate">
              {{ selectedLabel }}
            </span>
          </div>
          <span
            class="flex h-5 w-5 items-center justify-center rounded-[6px] bg-opacity-10 text-text-1 sm:shrink-0"
          >
            <component
              :is="casinoIcons.dropdown_chevron"
              class="h-2 w-2 fill-current [&_path]:fill-current"
            />
          </span>
        </button>
      </slot>
    </div>

    <Teleport to="body">
      <!-- 遮罩 -->
      <Transition v-bind="maskFadeTransition">
        <div
          v-if="isMobile || desktopBackdrop"
          v-show="popupShow"
          class="fixed inset-0"
          :style="{ zIndex: popupZIndex - 1 }"
          :class="{ 'bg-mask-60-1': isMobile }"
          @click.self="closePopup"
        />
      </Transition>

      <!-- 弹窗 -->
      <Transition v-bind="popupMoveTransition">
        <div
          v-show="popupShow"
          :class="popupShellClass"
          :style="[isMobile ? undefined : desktopStyle, { zIndex: popupZIndex }]"
        >
          <LiquidGlass v-if="!isMobile" />
          <div
            ref="popupRef"
            class="flex flex-col px-3.5 pt-2.5"
            :class="[
              isMobile
                ? 'max-h-[75vh] rounded-t-xl bg-bg-1'
                : 'relative z-[1] max-h-[16rem] w-full overflow-y-auto rounded-lg'
            ]"
          >
            <!-- 顶部栏 -->
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
                class="h-[42px] w-full rounded-lg border border-opacity-10 bg-input-1 py-0 pl-9 pr-11 text-sm font-medium text-text-1 outline-none placeholder:text-text-2 focus:border-theme-primary sm:h-10 sm:border-transparent sm:bg-opacity-10 sm:text-[13px] sm:placeholder:font-bold"
              />
            </div>

            <!-- 选项列表 -->
            <div
              class="flex-1 overflow-y-auto"
              :class="Multi ? (isMobile ? 'pb-[58px]' : 'mb-[58px] min-h-0') : ''"
            >
              <div class="flex flex-col">
                <div
                  v-for="item in filteredOptions"
                  :key="item.value"
                  class="mb-2.5 flex h-[42px] cursor-pointer items-center rounded-lg px-2.5"
                  :class="{
                    'bg-bg-2': isSelected(item) && isMobile,
                    'bg-opacity-10': isSelected(item) && !isMobile,
                    'justify-between': !Multi || (Multi && isMobile)
                  }"
                  @click="selectItem(item)"
                >
                  <span v-if="!Multi">{{ item.label }}</span>
                  <div v-if="Multi && isMobile" class="flex min-w-0 flex-1 items-center">
                    <div class="flex h-[22px] w-[22px] shrink-0 items-center justify-center">
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
                    <span class="ml-2.5 truncate text-[13px] font-normal leading-none text-text-1">
                      {{ item.label }}
                    </span>
                  </div>
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
                            'size-5 shrink-0 min-[641px]:size-4',
                            isSelected(item) ? 'text-theme-primary' : 'text-opacity-10'
                          ]
                        : 'h-5 w-5 shrink-0'
                    "
                  />
                  <div
                    v-if="Multi && !isMobile"
                    class="ml-2.5 flex h-[22px] min-w-0 items-center justify-start"
                  >
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

            <!-- 清空按钮 -->
            <div
              v-if="Multi"
              class="absolute inset-x-0 bottom-0 flex items-center border-t border-opacity-10 py-[15px]"
              :class="isMobile ? 'bg-bg-2' : 'bg-transparent'"
            >
              <button
                type="button"
                class="flex w-full items-center justify-center"
                @click="clearAll"
              >
                <ClearIcon class="h-3.5 w-3.5" />
                <div class="ml-1.5 text-xs font-medium text-theme-primary">{{ clearLabel }}</div>
              </button>
            </div>

            <!-- 安全区 -->
            <div v-if="isMobile" class="pb-[env(safe-area-inset-bottom)]" />
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, watch, onBeforeUnmount, onDeactivated } from 'vue'
import type { CSSProperties } from 'vue'
import LiquidGlass from '@/components/common/LiquidGlass.vue'
import { useI18n } from 'vue-i18n'
import { useIsMobile } from '@/composables/useMediaQuery'
import { usePageScrollLock } from '@/composables/usePageScrollLock'
import CloseIcon from '@/static/svg/close.svg?component'
import RadioCheckedIcon from '@/static/svg/radio-checked-hollow.svg?component'
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
  selected: { type: String, default: '' }, // 单选
  selectedList: { type: Array as () => string[], default: () => [] }, // 多选
  label: { type: String, default: '' },
  search: { type: Boolean, default: false },
  Multi: { type: Boolean, default: false },
  clearLabel: { type: String, default: 'Clear' },
  popupWidth: { type: Number, default: undefined },
  desktopBackdrop: { type: Boolean, default: false },
  zIndex: { type: Number, default: undefined }
})

const emit = defineEmits<{
  (e: 'update:selected', val: string): void
  (e: 'update:selected-list', val: string[]): void
}>()

const isMobile = useIsMobile()
// 页面级 PC 下拉框低于顶部栏（50）；H5 和显式指定的弹层层级保持原样。
const popupZIndex = computed(() => props.zIndex ?? (isMobile.value ? 9999 : 40))
const popupShow = ref(false)
const keyword = ref('')

usePageScrollLock(() => popupShow.value && isMobile.value)

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
    ? "fixed inset-x-0 bottom-0 w-full font-['Inter']"
    : "tg-glass-tokens fixed overflow-hidden rounded-lg font-['Inter'] [box-shadow:var(--glass-shadow)] motion-reduce:!transition-none"
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
const desktopStyle = ref<CSSProperties>({})

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
let triggerOffset: { left: number; top: number } | undefined
const updatePopupPlacement = () => {
  if (!popupShow.value || isMobile.value || !triggerRef.value || !popupRef.value) return

  const triggerRect = triggerRef.value.getBoundingClientRect()
  const width = Math.min(props.popupWidth ?? triggerRect.width, window.innerWidth)
  if (popupRef.value.parentElement) {
    popupRef.value.parentElement.style.width = `${width}px`
  }
  // Reset the viewport cap before measuring, so a larger viewport can restore the original height.
  popupRef.value.style.maxHeight = ''
  const popupHeight = popupRef.value.offsetHeight
  const viewportHeight = window.innerHeight

  const spaceBelow = Math.max(0, viewportHeight - triggerRect.bottom - GAP)
  const spaceAbove = Math.max(0, triggerRect.top - GAP)

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

  const height = Math.min(popupHeight, popupPlacement.value === 'bottom' ? spaceBelow : spaceAbove)
  popupRef.value.style.maxHeight = `${height}px`
  const left = Math.max(0, Math.min(triggerRect.left, window.innerWidth - width))
  const top =
    popupPlacement.value === 'bottom' ? triggerRect.bottom + GAP : triggerRect.top - GAP - height
  triggerOffset = { left: left - triggerRect.left, top: top - triggerRect.top }
  desktopStyle.value = {
    left: `${left}px`,
    width: `${width}px`,
    top: `${top}px`
  }
}

const followTriggerScroll = () => {
  if (!popupShow.value || isMobile.value || !triggerRef.value || !triggerOffset) return
  const rect = triggerRef.value.getBoundingClientRect()
  desktopStyle.value = {
    ...desktopStyle.value,
    left: `${rect.left + triggerOffset.left}px`,
    top: `${rect.top + triggerOffset.top}px`
  }
}

let placementFrame = 0
let placementNeedsMeasure = false
const schedulePlacement = () => {
  placementNeedsMeasure = true
  cancelAnimationFrame(placementFrame)
  placementFrame = requestAnimationFrame(() => {
    placementNeedsMeasure = false
    updatePopupPlacement()
  })
}
const onPageScroll = (event: Event) => {
  if (event.target instanceof Node && popupRef.value?.parentElement?.contains(event.target)) return
  if (placementNeedsMeasure) return
  cancelAnimationFrame(placementFrame)
  placementFrame = requestAnimationFrame(followTriggerScroll)
}
const onOutsideClick = (event: MouseEvent) => {
  if (
    event.target instanceof Node &&
    !triggerRef.value?.contains(event.target) &&
    !popupRef.value?.parentElement?.contains(event.target)
  ) {
    event.preventDefault()
    event.stopPropagation()
    closePopup()
  }
}
const onLayoutTransitionEnd = (event: TransitionEvent) => {
  if (
    event.propertyName === 'margin-left' &&
    event.target instanceof HTMLElement &&
    event.target.matches('main.main-layout-content')
  ) {
    schedulePlacement()
  }
}
const stopPlacementTracking = () => {
  cancelAnimationFrame(placementFrame)
  placementNeedsMeasure = false
  triggerOffset = undefined
  window.removeEventListener('resize', schedulePlacement)
  window.removeEventListener('scroll', onPageScroll, true)
  window.removeEventListener('transitionend', onLayoutTransitionEnd)
  document.removeEventListener('click', onOutsideClick, true)
}
watch(
  [popupShow, isMobile],
  ([open, mobile]) => {
    stopPlacementTracking()
    if (mobile && popupRef.value) popupRef.value.style.maxHeight = ''
    if (open && !mobile) {
      schedulePlacement()
      window.addEventListener('resize', schedulePlacement)
      window.addEventListener('scroll', onPageScroll, true)
      window.addEventListener('transitionend', onLayoutTransitionEnd)
      if (!props.desktopBackdrop) document.addEventListener('click', onOutsideClick, true)
    }
  },
  { flush: 'post' }
)
watch(
  filteredOptions,
  () => {
    if (popupShow.value && !isMobile.value) schedulePlacement()
  },
  { flush: 'post' }
)
onBeforeUnmount(stopPlacementTracking)
onDeactivated(() => {
  closePopup()
  stopPlacementTracking()
})
</script>
