<template>
  <!-- PC 端搜索弹窗 -->
  <teleport to="body">
    <transition name="search-modal-fade">
      <div
        v-if="modelValue"
        class="fixed inset-0 z-[9999] bg-[var(--color-mask-96-3)] overflow-hidden"
      >
        <div class="w-full h-full flex justify-center overflow-y-auto">
          <div class="h-full w-full mx-auto max-w-[1248px]">
            <!-- 【标题】和【关闭按钮】 -->
            <div
              class="w-full flex justify-end p-4 sticky left-0 top-0 z-10 bg-[var(--color-mask-100-4)]"
            >
              <div class="flex-1 flex justify-center text-base font-bold items-center">
                {{ t('bottom_tab_bar.explore') }}
              </div>
              <button
                class="w-8 h-8 rounded-lg bg-[var(--color-background-level-3)] flex items-center justify-center"
                @click="close"
                aria-label="close"
              >
                <CloseIcon class="w-4 h-4 stroke-text-2" />
              </button>
            </div>
            <!-- 内容区域 -->
            <div class="px-4 pb-6">
              <explore />
            </div>
          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script setup lang="ts">
import CloseIcon from '@/static/svg/close.svg?component'
import Explore from '@/components/explore/index.vue'
import { provide, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

interface Props {
  modelValue: boolean
}

defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [val: boolean]
}>()
const { t } = useI18n()

const isCloseDesktopModal = ref(false)
provide('search-close-desktop-modal', isCloseDesktopModal)
watch(
  () => isCloseDesktopModal.value,
  val => {
    if (val) {
      isCloseDesktopModal.value = false
      emit('update:modelValue', false)
    }
  }
)

const close = () => {
  emit('update:modelValue', false)
}
</script>

<style scoped lang="scss">
.explore-pop {
  width: 100%;
  height: 100%;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 9999;
  overflow: hidden;
}

.search-modal-fade-enter-active,
.search-modal-fade-leave-active {
  transition: all 0.3s ease;
}

.search-modal-fade-enter-from,
.search-modal-fade-leave-to {
  opacity: 0;
  transform: translateY(15px);
}
</style>
