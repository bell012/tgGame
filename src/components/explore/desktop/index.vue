<template>
  <!-- PC 端搜索弹窗 -->
  <teleport to="body">
    <transition name="search-modal-fade">
      <div
        v-if="props.modelValue"
        class="search-desktop-shell fixed inset-x-0 bottom-0 z-[9999] overflow-y-auto"
        :style="{ top: `${layoutStore.TOPNAV_HEIGHT}px` }"
      >
        <div class="mx-auto w-full max-w-[1336px] px-4 pb-6">
          <div
            class="search-desktop-header sticky left-0 top-0 z-10 flex h-14 w-full items-center justify-end"
          >
            <div class="flex flex-1 items-center justify-center text-sm font-bold">
              {{ t('bottom_tab_bar.explore') }}
            </div>
            <button
              class="search-desktop-close flex h-6 w-6 items-center justify-center rounded"
              @click="close"
              aria-label="close"
            >
              <CloseIcon class="h-2.5 w-2.5 text-text-2" />
            </button>
          </div>
          <explore />
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script setup lang="ts">
import CloseIcon from '@/static/svg/close.svg?component'
import Explore from '@/components/explore/index.vue'
import { useLayoutStore } from '@/stores/layout'
import { provide, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

interface Props {
  modelValue: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [val: boolean]
}>()
const { t } = useI18n()
const layoutStore = useLayoutStore()

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
.search-desktop-shell {
  background: var(--color-background-level-1);
}

.search-desktop-header {
  background: var(--color-background-level-1);
}

.search-desktop-close {
  background: var(--color-opacity-10);
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
