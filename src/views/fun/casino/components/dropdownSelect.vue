<template>
  <div class="relative">
    <!-- 触发按钮 -->
    <button
      ref="triggerRef"
      @click.stop="togglePopup"
      class="w-full flex items-center justify-between px-2.5 py-[11px] bg-bg-2 rounded-lg border border-solid border-[var(--color-opacity-10)]"
    >
      <div class="flex items-center flex-1 text-xs">
        <span class="mr-2.5 text-text-2">{{ label }}:</span>
        <span class="text-text-1">
          {{ selectedLabel }}
        </span>
      </div>
      <span
        class="fill-text-1 w-5 h-5 rounded-[6px] bg-[var(--color-opacity-10)] flex items-center justify-center"
      >
        <component :is="casinoIcons.dropdown_chevron" class="w-2 h-2 fill-current" />
      </span>
    </button>

    <!-- 遮罩 -->
    <transition name="popup-fade">
      <div
        v-show="popupShow"
        class="fixed inset-0 z-[9998]"
        :class="{ 'bg-[var(--color-mask-60-1)]': isMobile }"
        @click.self="closePopup"
      />
    </transition>

    <!-- 弹窗 -->
    <transition :name="isMobile ? 'up-down' : 'desktop-up-down'">
      <div
        v-show="popupShow"
        class="fixed left-0 bottom-0 z-[9999] w-full"
        :class="popupClass"
        :style="isMobile ? {} : { top: desktopTop }"
      >
        <div
          ref="popupRef"
          class="bg-[var(--color-background-level-1)] rounded-t-xl pt-2.5 px-3.5 flex flex-col"
          :class="{
            'max-h-[75vh]': isMobile,
            'max-h-[16rem] overflow-y-auto rounded-xl desktop-popup-inner': !isMobile
          }"
        >
          <!-- 顶部栏 -->
          <div v-if="isMobile" class="mb-2.5 flex items-center justify-between">
            <div class="w-7" />
            <div class="text-base font-bold text-[var(--color-text-level-1)]">Select</div>
            <button
              @click.stop="closePopup"
              class="flex h-7 w-7 items-center justify-center rounded bg-[var(--color-opacity-10)]"
            >
              <CloseIcon class="h-4 w-4 stroke-text-1" />
            </button>
          </div>

          <!-- 搜索框 -->
          <div v-if="search" class="relative mb-2.5">
            <SearchIcon
              class="absolute left-2.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] opacity-50"
            />
            <input
              v-model="keyword"
              type="text"
              :placeholder="t('home.search')"
              class="w-full h-[42px] pl-[38px] pr-11 rounded-lg bg-[var(--color-opacity-6)] border border-[var(--color-border-level-1)] text-text-1 text-xs font-[600] outline-none focus:border-theme-primary placeholder:text-text-2"
            />
          </div>

          <!-- 选项列表 -->
          <div class="flex-1 overflow-y-auto" :class="{ 'pb-[58px]': Multi }">
            <div class="flex flex-col">
              <div
                v-for="item in filteredOptions"
                :key="item.value"
                class="mb-2.5 flex h-[42px] items-center rounded-lg px-2.5 cursor-pointer"
                :class="{
                  'bg-[var(--color-opacity-10)]': isSelected(item),
                  'justify-between': !Multi
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
                <div v-if="Multi" class="ml-2.5 flex items-center w-[100px] h-[22px]">
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

          <!-- 清空按钮 -->
          <div
            v-if="Multi"
            class="absolute inset-x-0 bottom-0 flex items-center py-[15px] border-t border-[var(--color-opacity-10)] bg-[var(--color-background-level-2)]"
          >
            <button type="button" class="flex items-center justify-center w-full" @click="clearAll">
              <ClearIcon class="w-3.5 h-3.5" />
              <div class="ml-1.5 text-theme-primary text-xs font-[500]">{{ clearLabel }}</div>
            </button>
          </div>

          <!-- 安全区 -->
          <div v-if="isMobile" style="padding-bottom: env(safe-area-inset-bottom)"></div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, watch, onBeforeUnmount } from 'vue'
import { useI18n } from 'vue-i18n'
import { useIsMobile } from '@/composables/useMediaQuery'
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
  clearLabel: { type: String, default: 'Clear' }
})

const emit = defineEmits<{
  (e: 'update:selected', val: string): void
  (e: 'update:selected-list', val: string[]): void
}>()

const isMobile = useIsMobile()
const popupShow = ref(false)
const keyword = ref('')

const selectedLabel = computed(() => {
  if (props.Multi) return props.selectedList.length > 0 ? `+${props.selectedList.length}` : 'All'
  else {
    const sel = props.options.find(o => o.value === props.selected)
    return sel ? sel.label : ''
  }
})

const popupClass = computed(() => {
  if (isMobile.value) return 'fixed left-0 bottom-0 w-full'

  return [
    'desktop-popup',
    popupPlacement.value === 'top' ? 'desktop-popup-top' : 'desktop-popup-bottom'
  ]
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
@use '../../../../styles/mixins' as *;
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
