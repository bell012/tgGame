<template>
  <!-- pc端公共下拉框组件 -->
  <div class="relative" v-click-outside="closeDropdown">
    <div
      class="select-box bg-input-3 text-text-1 rounded-lg border border-opacity-5 w-[240px] h-[48px] text-sm px-3 cursor-pointer flex items-center justify-between"
      @click="toggleDropdown"
    >
      <span>{{ selectedLabel }}</span>
      <div
        class="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center bg-opacity-10 w-6 h-6 rounded"
      >
        <ArrowDownIcon class="w-4 h-4" />
      </div>
    </div>

    <Transition name="dropdown">
      <div
        v-if="isOpen"
        class="absolute top-[56px] p-3 left-0 w-full bg-bg-5 rounded-lg border border-opacity-5 overflow-hidden z-50"
      >
        <div
          v-for="option in options"
          :key="option.value"
          class="flex items-center justify-between p-3 cursor-pointer rounded-lg hover:bg-bg-2"
          :class="{ 'bg-bg-3 font-[700]': option.value === modelValue }"
          @click="selectOption(option)"
        >
          <span class="text-text-1 text-sm">{{ option.label }}</span>
          <component
            :is="option.value === modelValue ? DropDownSelectionIcon : DropDownDefaultIcon"
            class="w-4 h-4"
          />
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import ArrowDownIcon from '@/static/svg/arrow_down.svg?component'
import DropDownDefaultIcon from '@/static/svg/drop_down _default.svg?component'
import DropDownSelectionIcon from '@/static/svg/drop_down _selection.svg?component'

const { t } = useI18n()

interface Option {
  label: string
  value: string
}

interface Props {
  modelValue: string
  options: Option[]
  placeholder?: string
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: ''
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const isOpen = ref(false)

const selectedLabel = computed(() => {
  const selected = props.options.find(opt => opt.value === props.modelValue)
  return selected ? selected.label : props.placeholder || t('customSelect.placeholder')
})

const toggleDropdown = () => {
  isOpen.value = !isOpen.value
}

const closeDropdown = () => {
  isOpen.value = false
}

const selectOption = (option: Option) => {
  emit('update:modelValue', option.value)
  closeDropdown()
}

// 点击外部关闭下拉框的指令
const vClickOutside = {
  mounted(el: any, binding: any) {
    el.clickOutsideEvent = (event: Event) => {
      if (!(el === event.target || el.contains(event.target as Node))) {
        binding.value()
      }
    }
    document.addEventListener('click', el.clickOutsideEvent)
  },
  unmounted(el: HTMLElement & { clickOutsideEvent?: (event: Event) => void }) {
    if (el.clickOutsideEvent) {
      document.removeEventListener('click', el.clickOutsideEvent)
    }
  }
}
</script>

<style scoped>
.select-box {
  transition:
    transform 60ms cubic-bezier(0.4, 0, 0.2, 1),
    opacity 60ms cubic-bezier(0.4, 0, 0.2, 1);
  will-change: transform;
}

.select-box:active {
  transform: translateY(2px) scale(0.998);
  opacity: 0.9;
}

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
