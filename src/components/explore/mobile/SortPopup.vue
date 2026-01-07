<template>
  <!-- H5 端：排序弹窗 UI（逻辑来自 Core 的 slot props） -->
  <Teleport to="body">
    <!-- 遮罩淡入淡出 -->
    <transition name="popup-fade">
      <div
        v-show="visible"
        class="tp-mask fixed z-[9998] inset-0 bg-[var(--color-mask-60)]"
        @click.self="close"
      />
    </transition>

    <!-- 面板 -->
    <transition name="up-down">
      <div v-show="visible" class="fixed z-[9999] left-0 bottom-0 w-full">
        <div class="tp-panel bg-[var(--color-background-level-1)] rounded-t-xl pt-2.5 px-3.5">
          <div class="tp-header flex items-center justify-between mb-2.5">
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
            <div
              v-for="(item, inx) in list"
              :key="inx"
              class="tp-item mb-2.5 px-2.5 flex items-center justify-between h-[42px] rounded-lg"
              :class="isSelected(item) ? 'bg-[var(--color-opacity-10)]' : ''"
              @click="confirm(item)"
            >
              <div>{{ item.name }}</div>
              <ChecedIcon v-if="isSelected(item)" class="w-5 h-5" />
              <UnchecedIcon v-else class="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>
    </transition>
  </Teleport>
</template>

<script setup lang="ts">
import CloseIcon from '@/static/svg/close.svg?component'
import ChecedIcon from '@/static/svg/explore/radio-checked2.svg?component'
import UnchecedIcon from '@/static/svg/radio-unchecked.svg?component'

type OptionItem = { id: number | string; name: string }

defineProps<{
  visible: boolean
  list: OptionItem[]
  selectedId?: number | string
  close: () => void
  confirm: (item: OptionItem) => void
  isSelected: (item: OptionItem) => boolean
}>()
</script>

<style scoped lang="scss">
@use '../../../styles/mixins' as *;

/* 面板 */
.tp-panel {
  padding-bottom: env(safe-area-inset-bottom);
  overflow: hidden;
}

@include popup-transition;
</style>
