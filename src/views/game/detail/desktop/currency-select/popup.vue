<template>
  <div>
    <transition name="popup-fade">
      <div
        v-show="visible"
        class="tp-mask fixed z-[9999] inset-0 bg-[var(--color-mask-60)]"
        @click.self="close"
      />
    </transition>
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

          <!-- 选择的内容 -->
          <div class="max-h-[268px] overflow-y-auto">
            <div class="flex flex-col">
              <div
                v-for="(item, inx) in filteredOptions"
                :key="inx"
                class="tp-item mb-2.5 px-2.5 flex items-center justify-between h-[42px] rounded-lg cursor-pointer"
                :class="isSelected(item) ? 'bg-[var(--color-opacity-10)]' : ''"
                @click="confirm(item)"
              >
                <div class="flex items-center gap-[10px]">
                  <img :src="item.icon" alt="" class="w-5 h-5 object-contain" />
                  <div>{{ item.label }}</div>
                </div>
                <ChecedIcon v-if="isSelected(item)" class="w-5 h-5 cursor-pointer" />
                <UnchecedIcon v-else class="w-5 h-5 cursor-pointer" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { computed, inject, ref, Ref } from 'vue'
import SearchIcon from '@/static/svg/search-icon.svg?component'
import CloseIcon from '@/static/svg/close.svg?component'
import ChecedIcon from '@/static/svg/explore/radio-checked2.svg?component'
import UnchecedIcon from '@/static/svg/radio-unchecked.svg?component'

type OptionItem = { value: string; label: string; icon: string }

defineProps<{
  visible: boolean
  desktop?: boolean
}>()

const emit = defineEmits<{
  'update:visible': [val: boolean]
}>()

const keyword = ref('')

// const tabIndex = ref(0)

// options数据
const selectOptions = inject('currency-select-options') as Ref<OptionItem[]>
// 选中那一条数据
const selectedId = inject('currency-select-selected-id') as Ref<string>
const onSelect = inject<(item: OptionItem) => void>('currency-select-on-select')

const filteredOptions = computed(() => {
  const searchKeyword = keyword.value.trim().toUpperCase()
  if (!searchKeyword) {
    return selectOptions.value
  }

  return selectOptions.value.filter(item => {
    const label = item.label.toUpperCase()
    const value = item.value.toUpperCase()
    return label.includes(searchKeyword) || value.includes(searchKeyword)
  })
})

// 关闭popup
const close = () => {
  emit('update:visible', false)
}

// const tabIndexClick = (index: number) => {
//   tabIndex.value = index
// }

const isSelected = (item: OptionItem) => {
  return item.value === selectedId.value
}

const confirm = (item: OptionItem) => {
  if (onSelect) {
    onSelect(item)
  } else {
    selectedId.value = item.value
  }
  close()
}
</script>
<style scoped lang="scss">
@use '@/styles/mixins' as *;
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
.active {
  background-color: var(--color-input-level-2);
  height: 100%;
  border-radius: 10px;
}
</style>
