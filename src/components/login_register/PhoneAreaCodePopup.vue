<template>
  <!-- 手机区号弹窗 -->
  <Teleport to="body">
    <template v-if="variant === 'mobile'">
      <transition name="area-code-mask">
        <div
          v-if="modelValue"
          class="fixed inset-0 bg-mask-60-1"
          :style="{ zIndex: maskZIndex }"
          @click="handleClose"
        />
      </transition>

      <transition name="area-code-sheet">
        <div
          v-if="modelValue"
          class="fixed bottom-0 left-0 w-full"
          :style="{ zIndex: panelZIndex }"
        >
          <div class="area-code-sheet-panel flex h-[60vh] flex-col rounded-t-xl bg-bg-5 p-[14px]">
            <div class="mb-[24px] text-center text-base font-[700] text-text-1">
              {{ t('common.select_country') }}
            </div>
            <AreaCodeList />
          </div>
        </div>
      </transition>
    </template>

    <Transition v-else name="fade-accordion">
      <div
        v-if="modelValue"
        ref="popupRef"
        class="fixed z-[10020] flex h-[320px] flex-col overflow-hidden rounded-lg bg-bg-5 p-3"
        :style="desktopPopupStyle"
      >
        <AreaCodeList />
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, defineComponent, h, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import SearchIcon from '@/static/svg/login/sousuo.svg?skipsvgo'
import SelectedIcon from '@/static/svg/login/selected.svg?skipsvgo'
import { getPhoneAreaCodeOptions } from '@/utils/phone-input'

type AreaCodePopupVariant = 'desktop' | 'mobile'

interface Props {
  modelValue: boolean
  selectedCode?: string
  anchorEl?: HTMLElement | null
  variant?: AreaCodePopupVariant
  maskZIndex?: number
  panelZIndex?: number
}

const props = withDefaults(defineProps<Props>(), {
  selectedCode: '',
  anchorEl: null,
  variant: 'desktop',
  maskZIndex: 10020,
  panelZIndex: 10021
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  select: [areaCode: string]
}>()

const { t } = useI18n()
const popupRef = ref<HTMLElement | null>(null)
const searchKeyword = ref('')
const desktopPopupStyle = ref<Record<string, string>>({})
const phoneAreaCodeOptions = getPhoneAreaCodeOptions()
const DESKTOP_POPUP_HEIGHT = 320
const DESKTOP_POPUP_GAP = 4
const DESKTOP_POPUP_VIEWPORT_PADDING = 12

const filteredPhoneAreaCodeOptions = computed(() => {
  const keyword = searchKeyword.value.trim().toLowerCase()

  if (!keyword) {
    return phoneAreaCodeOptions
  }

  return phoneAreaCodeOptions.filter(option => option.searchText.includes(keyword))
})

/**
 * 关闭区号弹窗并清空搜索内容。
 */
const handleClose = () => {
  searchKeyword.value = ''
  emit('update:modelValue', false)
}

/**
 * 选择区号后通知父组件写入表单，并关闭弹窗。
 */
const handleSelect = (areaCode: string) => {
  emit('select', areaCode)
  handleClose()
}

/**
 * 根据触发输入框计算 PC 区号下拉框的位置和动画高度。
 */
const updateDesktopPopupPosition = () => {
  const anchor = props.anchorEl

  if (!anchor) {
    return
  }

  const rect = anchor.getBoundingClientRect()
  const preferredTop = rect.bottom + DESKTOP_POPUP_GAP
  const fallbackTop = rect.top - DESKTOP_POPUP_GAP - DESKTOP_POPUP_HEIGHT
  const popupTop =
    preferredTop + DESKTOP_POPUP_HEIGHT + DESKTOP_POPUP_VIEWPORT_PADDING > window.innerHeight
      ? Math.max(DESKTOP_POPUP_VIEWPORT_PADDING, fallbackTop)
      : preferredTop

  desktopPopupStyle.value = {
    top: `${popupTop}px`,
    left: `${rect.left}px`,
    width: `${rect.width}px`,
    height: `${DESKTOP_POPUP_HEIGHT}px`,
    '--fade-accordion-max-height': `${DESKTOP_POPUP_HEIGHT}px`
  }
}

/**
 * 窗口尺寸或滚动变化时刷新 PC 区号下拉框位置。
 */
const handleDesktopWindowChange = () => {
  if (!props.modelValue || props.variant !== 'desktop') {
    return
  }

  updateDesktopPopupPosition()
}

/**
 * 点击 PC 下拉框外部时关闭区号弹窗。
 */
const handleDesktopOutsidePointerDown = (event: PointerEvent) => {
  const target = event.target as Node | null

  if (!target) {
    return
  }

  if (props.anchorEl?.contains(target) || popupRef.value?.contains(target)) {
    return
  }

  handleClose()
}

/**
 * 绑定 PC 区号下拉框打开期间需要的全局监听。
 */
const attachDesktopPopupListeners = () => {
  window.addEventListener('resize', handleDesktopWindowChange)
  window.addEventListener('scroll', handleDesktopWindowChange, true)
  document.addEventListener('pointerdown', handleDesktopOutsidePointerDown, true)
}

/**
 * 移除 PC 区号下拉框的全局监听。
 */
const detachDesktopPopupListeners = () => {
  window.removeEventListener('resize', handleDesktopWindowChange)
  window.removeEventListener('scroll', handleDesktopWindowChange, true)
  document.removeEventListener('pointerdown', handleDesktopOutsidePointerDown, true)
}

const AreaCodeList = defineComponent({
  name: 'AreaCodeList',
  setup() {
    return () =>
      h('div', { class: 'contents' }, [
        h('div', { class: 'relative mb-[8px] shrink-0' }, [
          h(SearchIcon, {
            class: 'absolute left-3 top-1/2 h-6 w-6 -translate-y-1/2 text-icon-3'
          }),
          h('input', {
            value: searchKeyword.value,
            type: 'text',
            placeholder: t('common.search_country'),
            class:
              'auth-input-placeholder h-10 w-full rounded-[12px] border border-opacity-10 bg-opacity-6 pl-11 pr-3 text-sm font-[400] text-text-1 outline-none transition-colors focus:border-theme-primary placeholder:text-text-3',
            onInput: (event: Event) => {
              searchKeyword.value = (event.target as HTMLInputElement).value
            },
            onClick: (event: Event) => event.stopPropagation()
          })
        ]),
        h(
          'div',
          { class: 'min-h-0 flex-1 space-y-2 overflow-y-auto' },
          filteredPhoneAreaCodeOptions.value.map(option =>
            h(
              'button',
              {
                key: option.code,
                type: 'button',
                class: [
                  'flex h-10 w-full items-center justify-between rounded-[8px] px-3 text-left text-sm font-[400] text-text-1 transition-colors',
                  option.code === props.selectedCode ? 'bg-bg-3 font-[700]' : 'hover:bg-opacity-6'
                ],
                onClick: (event: Event) => {
                  event.stopPropagation()
                  handleSelect(option.code)
                }
              },
              [
                h('span', `${option.country} (${option.display})`),
                option.code === props.selectedCode
                  ? h(SelectedIcon, { class: 'h-4 w-4 text-theme-primary' })
                  : null
              ]
            )
          )
        )
      ])
  }
})

watch(
  () => props.modelValue,
  async isOpen => {
    if (!isOpen) {
      detachDesktopPopupListeners()
      searchKeyword.value = ''
      return
    }

    if (props.variant !== 'desktop') {
      return
    }

    await nextTick()
    updateDesktopPopupPosition()
    attachDesktopPopupListeners()
  }
)

onBeforeUnmount(() => {
  detachDesktopPopupListeners()
})
</script>

<style scoped lang="scss">
.area-code-sheet-panel {
  padding-bottom: calc(1rem + env(safe-area-inset-bottom));
}

.area-code-mask-enter-active,
.area-code-mask-leave-active {
  transition: opacity 0.25s ease;
}

.area-code-mask-enter-from,
.area-code-mask-leave-to {
  opacity: 0;
}

.area-code-mask-enter-to,
.area-code-mask-leave-from {
  opacity: 1;
}

.area-code-sheet-enter-active,
.area-code-sheet-leave-active {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.area-code-sheet-enter-from,
.area-code-sheet-leave-to {
  transform: translateY(100%);
}

.area-code-sheet-enter-to,
.area-code-sheet-leave-from {
  transform: translateY(0);
}
</style>
