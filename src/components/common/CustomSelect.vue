<template>
  <!-- pc端公共下拉框组件 -->
  <div class="relative w-[240px]" v-click-outside="closeDropdown">
    <div
      class="select-box bg-input-3 text-text-1 rounded-lg border border-opacity-5 h-[48px] text-sm px-3 flex items-center justify-between"
      :class="props.disabled ? 'cursor-default opacity-70' : 'cursor-pointer'"
      @click="toggleDropdown"
    >
      <div class="flex items-center gap-2">
        <!-- string -->
        <img
          v-if="typeof selectedOption?.icon === 'string'"
          :src="selectedOption.icon"
          class="w-6 h-6 object-contain"
        />

        <!-- component -->
        <component v-else-if="selectedOption?.icon" :is="selectedOption.icon" class="w-6 h-6" />

        <span>
          {{ selectedLabel }}
        </span>
      </div>
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
          <div class="flex items-center gap-2">
            <!-- icon: string (图片) -->
            <img
              v-if="typeof option.icon === 'string'"
              :src="option.icon"
              class="w-6 h-6 object-contain"
            />

            <!-- icon: 组件 -->
            <component v-else-if="option.icon" :is="option.icon" class="w-6 h-6" />
            <span class="text-text-1 text-sm">
              {{ option.label }}
            </span>
          </div>
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
import ArrowDownIcon from '@/static/svg/arrow_down.svg?component'
import DropDownDefaultIcon from '@/static/svg/drop_down _default.svg?component'
import DropDownSelectionIcon from '@/static/svg/drop_down _selection.svg?component'
import type { Component } from 'vue'
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

interface Option {
  label: string
  value: string
  icon?: string | Component
}

interface Props {
  modelValue: string
  options: Option[]
  placeholder?: string
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: '',
  disabled: false
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'disabled-click': []
}>()

const isOpen = ref(false)

const selectedLabel = computed(() => {
  return selectedOption.value?.label || props.placeholder || t('customSelect.placeholder')
})

const selectedOption = computed(() => {
  return props.options.find(opt => opt.value === props.modelValue)
})

const toggleDropdown = () => {
  if (props.disabled) {
    emit('disabled-click')
    return
  }

  isOpen.value = !isOpen.value
}

const closeDropdown = () => {
  isOpen.value = false
}

const selectOption = (option: Option) => {
  if (props.disabled) {
    return
  }

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
