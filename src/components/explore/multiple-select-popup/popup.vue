<template>
  <div>
    <!-- 遮罩淡入淡出 -->
    <transition name="popup-fade">
      <div
        v-show="visible"
        class="tp-mask fixed z-[9999] inset-0 bg-[var(--color-mask-60)]"
        @click.self="close"
      />
    </transition>
    <!-- 面板 -->
    <transition :name="desktop ? 'desktop-up-down' : 'up-down'">
      <div v-show="visible" class="fixed z-[9999] left-0 bottom-0 w-full lg:relative">
        <div class="tp-panel bg-[var(--color-background-level-2)] rounded-t-xl pt-2.5 px-3.5">
          <div class="tp-header flex items-center justify-between mb-2.5" v-if="!desktop">
            <div></div>
            <div class="text-base font-bold text-[var(--color-text-level-1)]">Select</div>
            <div
              @click="close"
              class="w-7 h-7 rounded bg-[var(--color-opacity-10)] flex items-center justify-center"
            >
              <CloseIcon class="stroke-text-1 w-4 h-4" />
            </div>
          </div>
          <!-- 选择的内容 -->
          <div class="flex flex-col">
            <div class="relative mb-[10px]">
              <SearchIcon
                class="absolute left-2.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] fill-none stroke-text-2 opacity-50"
              />
              <input
                placeholder="搜寻"
                v-model="keyword"
                class="w-full h-[42px] pl-[40px] pr-11 rounded-lg bg-[var(--color-opacity-6)] border border-[var(--color-border-level-1)] text-text-1 text-xs font-[600] outline-none focus:border-theme-primary placeholder:text-text-2"
              />
            </div>
            <div class="max-h-[268px] overflow-auto">
              <div
                v-for="item in optionItems"
                :key="item.value"
                class="tp-item mb-2.5 px-2.5 flex items-center justify-start h-[42px] rounded-lg cursor-pointer"
                :class="isSelected(item) ? 'bg-[var(--color-opacity-10)]' : ''"
                @click="confirm(item)"
              >
                <ChecedIcon v-if="isSelected(item)" class="w-5 h-5 cursor-pointer" />
                <UnchecedIcon v-else class="w-5 h-5 cursor-pointer" />
                <div class="ml-2.5 flex items-center w-[100px]">
                  <img class="w-full h-full object-contain" :src="item?.label" />
                </div>
              </div>
            </div>
            <!-- 底部按钮 -->
            <div
              class="flex items-center py-[15px] border-t border-[var(--color-opacity-10)] bg-[var(--color-background-level-2)] w-full"
            >
              <button
                type="button"
                class="flex items-center justify-center w-full"
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
import { computed, ref } from 'vue'

interface OptionItem {
  value: string
  label: string
  [key: string]: string | number
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

const { t } = useI18n()
const keyword = ref('')

const close = () => {
  emit('update:visible', false)
}

const optionItems = computed(() => {
  if (!keyword.value) {
    return props.dataList
  }
  return props.dataList.filter(i => (i.providerName as string).indexOf(keyword.value) !== -1)
})

const isSelected = (item: OptionItem) => {
  const index = props.selectedIds?.indexOf(item.value)
  return index !== -1
}

const confirm = (item: OptionItem) => {
  const arr = [...props.selectedIds]
  if (isSelected(item)) {
    arr.splice(arr.indexOf(item.value), 1)
  } else {
    arr.push(item.value)
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
.tp-panel {
  padding-bottom: env(safe-area-inset-bottom);
  overflow: hidden;
  border-radius: 10px;
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
</style>
