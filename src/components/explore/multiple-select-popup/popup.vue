<template>
  <div>
    <!-- 遮罩淡入淡出 -->
    <transition name="popup-fade">
      <div
        v-show="visible"
        class="tp-mask fixed z-[9999] inset-0 bg-[var(--color-mask-60-1)]"
        @click.self="close"
      />
    </transition>
    <!-- 面板 -->
    <transition :name="desktop ? 'desktop-up-down' : 'up-down'">
      <div v-show="visible" class="fixed z-[9999] left-0 bottom-0 w-full lg:relative">
        <div class="tp-panel bg-[var(--color-background-level-2)] rounded-t-xl pt-2.5 px-3.5">
          <div class="tp-header flex items-center justify-between mb-2.5" v-if="!desktop">
            <div></div>
            <div class="tp-title text-base font-bold text-[var(--color-text-level-1)]">
              {{ t('search.select') }}
            </div>
            <div
              @click="close"
              class="tp-close w-7 h-7 rounded bg-[var(--color-opacity-10)] flex items-center justify-center"
            >
              <CloseIcon class="stroke-text-1 w-4 h-4" />
            </div>
          </div>
          <!-- 选择的内容 -->
          <div class="flex flex-col">
            <div class="tp-search-wrap relative mb-[10px]">
              <SearchIcon
                class="tp-search-icon absolute left-2.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] fill-none stroke-text-2 opacity-50"
              />
              <input
                :placeholder="t('search.placeholder')"
                v-model="keyword"
                class="tp-search-input w-full h-[42px] pl-[40px] pr-11 rounded-lg bg-[var(--color-opacity-6)] border border-[var(--color-border-level-1)] text-text-1 text-xs font-[600] outline-none focus:border-theme-primary placeholder:text-text-2"
              />
            </div>
            <div class="tp-list max-h-[268px] overflow-auto">
              <div
                v-for="item in optionItems"
                :key="item.value"
                class="tp-item mb-2.5 px-2.5 flex items-center justify-start h-[42px] rounded-lg cursor-pointer"
                :class="isSelected(item) ? 'tp-item-active' : ''"
                @click="confirm(item)"
              >
                <ChecedIcon v-if="isSelected(item)" class="tp-check-icon w-5 h-5 cursor-pointer" />
                <UnchecedIcon v-else class="tp-check-icon w-5 h-5 cursor-pointer" />
                <div class="provider-logo-box">
                  <img
                    v-if="shouldShowLogo(item)"
                    class="provider-logo-image"
                    :src="resolveLogoSrc(item)"
                    :alt="getBrandName(item) || 'brand'"
                    loading="lazy"
                    decoding="async"
                    @error="handleLogoError(item)"
                  />
                  <div v-else class="provider-logo-fallback">
                    {{ getBrandName(item) || '--' }}
                  </div>
                </div>
              </div>
            </div>
            <!-- 底部按钮 -->
            <div
              class="tp-footer flex items-center border-t border-[var(--color-opacity-10)] bg-[var(--color-background-level-2)] w-full"
            >
              <button
                type="button"
                class="tp-clear-btn flex items-center justify-center w-full"
                @click="clearAll"
              >
                <ClearIcon class="w-3.5 h-3.5" />
                <div class="ml-1.5 text-theme-primary text-xs font-[500]">
                  {{ t('search.botClear') }}
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>
<script setup lang="ts">
import CloseIcon from '@/static/svg/close.svg?component'
import ChecedIcon from '@/static/svg/explore/cube-checked.svg?component'
import UnchecedIcon from '@/static/svg/explore/cube-unchecked.svg?component'
import SearchIcon from '@/static/svg/search-icon.svg?component'
import { useI18n } from 'vue-i18n'
import ClearIcon from '@/static/svg/explore/clear.svg?component'
import { computed, ref, watch } from 'vue'

interface OptionItem {
  value: string
  label: string
  icon?: string
  logo?: string
  brandName?: string
  providerName?: string
  brandCode?: string
  brandId?: string | number
  [key: string]: string | number | undefined
}

const props = defineProps<{
  visible: boolean
  dataList: OptionItem[]
  selectedIds: string[]
  desktop?: boolean
}>()

const emit = defineEmits<{
  'update:visible': [val: boolean]
  confirm: [val: string[]]
}>()

const baseUrl = import.meta.env.VITE_GAME_IMAGE_BASE_URL
const isAbsoluteLogoUrl = (value: string) => /^(https?:\/\/|\/\/|data:|blob:)/i.test(value)

const { t } = useI18n()
const keyword = ref('')
const brokenLogoMap = ref<Record<string, boolean>>({})

watch(
  () => props.visible,
  visible => {
    if (visible) {
      brokenLogoMap.value = {}
    }
  }
)

const close = () => {
  emit('update:visible', false)
}

const optionItems = computed(() => {
  if (!keyword.value) {
    return props.dataList
  }
  const normalizedKeyword = keyword.value.trim().toLowerCase()
  return props.dataList.filter(item => getBrandName(item).toLowerCase().includes(normalizedKeyword))
})

const getOptionKey = (item: OptionItem) => {
  return String(item.value ?? item.brandId ?? item.brandName ?? item.providerName ?? '')
}

const getBrandName = (item: OptionItem) => {
  return String(item.brandName ?? item.providerName ?? '')
}

const resolveLogoSrc = (item: OptionItem) => {
  const icon = [item.icon, item.logo, item.label]
    .map(value => String(value ?? '').trim())
    .find(Boolean)
  if (!icon) return ''
  if (isAbsoluteLogoUrl(icon)) {
    return icon
  }

  const normalizedBaseUrl = String(baseUrl ?? '').replace(/\/+$/, '')
  const normalizedIcon = icon.replace(/^\/+/, '')

  if (!normalizedBaseUrl) {
    return icon
  }

  return `${normalizedBaseUrl}/${normalizedIcon}`
}

const getLogoKey = (item: OptionItem) => {
  return `${getOptionKey(item)}::${resolveLogoSrc(item)}`
}

const shouldShowLogo = (item: OptionItem) => {
  const key = getLogoKey(item)
  return Boolean(resolveLogoSrc(item)) && !brokenLogoMap.value[key]
}

const handleLogoError = (item: OptionItem) => {
  brokenLogoMap.value[getLogoKey(item)] = true
}

const getBrandCode = (item: OptionItem) => String(item.brandCode ?? '').trim()

const isSelected = (item: OptionItem) => {
  const brandCode = getBrandCode(item)
  if (!brandCode) return false
  const index = props.selectedIds?.indexOf(brandCode)
  return index !== -1
}

const confirm = (item: OptionItem) => {
  const brandCode = getBrandCode(item)
  if (!brandCode) return

  const arr = [...props.selectedIds]
  if (isSelected(item)) {
    arr.splice(arr.indexOf(brandCode), 1)
  } else {
    arr.push(brandCode)
  }
  emit('confirm', arr)
}

const clearAll = () => {
  emit('confirm', [])
}
</script>
<style scoped lang="scss">
@use '../../../styles/mixins' as *;
/* 面板 */
.tp-mask {
  backdrop-filter: blur(2px);
}

.tp-panel {
  padding-bottom: calc(12px + env(safe-area-inset-bottom));
  overflow: hidden;
  border-radius: 16px 16px 0 0;
  border-top: 1px solid var(--color-opacity-10);
  background: linear-gradient(
    180deg,
    var(--color-background-level-2) 0%,
    var(--color-background-level-4) 100%
  );
  box-shadow: 0 -18px 44px rgba(0, 0, 0, 0.38);
}
@include popup-transition;
// 设置的弹窗打开关闭的过渡动画
.desktop-up-down-enter-active,
.desktop-up-down-leave-active {
  transition: all 0.2s ease;
}
.desktop-up-down-enter-from,
.desktop-up-down-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

.tp-header {
  position: relative;
  margin-bottom: 14px;
}

.tp-header::before {
  content: '';
  position: absolute;
  left: 50%;
  top: -6px;
  transform: translateX(-50%);
  width: 48px;
  height: 4px;
  border-radius: 999px;
  // background: var(--color-opacity-15);
}

.tp-title {
  font-size: 22px;
  line-height: 1;
}

.tp-close {
  border: 1px solid var(--color-opacity-10);
  transition:
    transform 0.2s ease,
    background-color 0.2s ease,
    border-color 0.2s ease;
}

.tp-close:active {
  transform: scale(0.96);
}

.tp-search-wrap {
  margin-bottom: 12px;
}

.tp-search-icon {
  left: 13px;
  opacity: 0.62;
}

.tp-search-input {
  height: 44px;
  border-radius: 12px;
  border: 1px solid var(--color-opacity-15);
  background: var(--color-background-level-4);
  font-size: 14px;
  font-weight: 600;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease,
    background-color 0.2s ease;
}

.tp-search-input::placeholder {
  font-weight: 500;
}

.tp-search-input:focus {
  border-color: var(--color-theme-level-2);
  box-shadow: 0 0 0 2px var(--color-theme-level-3);
  background: var(--color-background-level-3);
}

.tp-list {
  max-height: 288px;
  padding-right: 2px;
}

.tp-list::-webkit-scrollbar {
  width: 4px;
}

.tp-list::-webkit-scrollbar-thumb {
  border-radius: 999px;
  background: var(--color-opacity-15);
}

.tp-item {
  min-height: 46px;
  margin-bottom: 8px;
  padding-inline: 10px;
  gap: 10px;
  border: 1px solid transparent;
  background: var(--color-background-level-4);
  transition:
    border-color 0.2s ease,
    background-color 0.2s ease,
    transform 0.12s ease;
}

.tp-item:last-child {
  margin-bottom: 0;
}

.tp-item:active {
  transform: scale(0.995);
}

.tp-item-active {
  border-color: var(--color-theme-level-2);
  background: linear-gradient(90deg, var(--color-theme-level-3) 0%, var(--color-opacity-5) 75%);
}

.tp-check-icon {
  flex: 0 0 20px;
  min-width: 20px;
}

.provider-logo-box {
  margin-left: 0;
  width: 100%;
  max-width: 100%;
  flex: 1 1 auto;
  min-width: 0;
  height: 30px;
  padding: 4px 10px;
  border-radius: 8px;
  border: 1px solid var(--color-opacity-10);
  background: linear-gradient(
    180deg,
    var(--color-background-level-3) 0%,
    var(--color-background-level-4) 100%
  );
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  transition:
    border-color 0.2s ease,
    background-color 0.2s ease;
}

.tp-item-active .provider-logo-box {
  border-color: var(--color-theme-level-2);
  background: var(--color-background-level-3);
}

.provider-logo-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
}

.provider-logo-fallback {
  width: 100%;
  text-align: center;
  color: var(--color-text-level-1);
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.tp-footer {
  margin-top: 4px;
  padding: 6px 0 2px;
}

.tp-clear-btn {
  height: 30px;
  border-radius: 10px;
  border: 1px solid transparent;
  transition:
    background-color 0.2s ease,
    border-color 0.2s ease;
}

.tp-clear-btn:active {
  background: var(--color-theme-level-3);
  border-color: var(--color-theme-level-2);
}

@media (min-width: 1024px) {
  .tp-panel {
    border-radius: 12px;
    border: 1px solid var(--color-opacity-10);
    box-shadow: 0 10px 28px rgba(0, 0, 0, 0.26);
  }

  .tp-list {
    max-height: 268px;
  }

  .provider-logo-box {
    width: 100%;
    max-width: 100%;
    flex: 1 1 auto;
  }
}
</style>
