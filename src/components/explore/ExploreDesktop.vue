<template>
  <!-- PC 端搜索弹窗 -->
  <teleport to="body">
    <transition name="search-modal-fade">
      <div
        v-if="modelValue"
        class="fixed inset-0 z-[9999] bg-[var(--color-background-level-1)] overflow-hidden"
        @click.self="close"
      >
        <!-- 全屏容器（内容可滚动） -->
        <div class="w-full h-full overflow-y-auto">
          <!-- 居中内容面板（宽度 65%） -->
          <div class="w-full flex justify-center">
            <!-- 面板从底部上滑 -->
            <transition name="search-panel-up">
              <div v-if="modelValue" class="w-[65%] max-w-[900px] min-w-[520px]">
                <!-- 关闭按钮 -->
                <div class="w-full flex justify-end p-4">
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
                  <!-- 顶部搜索 -->
                  <TopInput />

                  <!-- 顶部横行滚动tab选择） -->
                  <div class="w-full my-3.5">111</div>

                  <!-- 排序和供应商筛选 -->
                  <div class="w-full flex items-center justify-between gap-[11px]">
                    <!-- 排序 -->
                    <div
                      class="px-2.5 py-[11px] w-full flex justify-between items-center border border-[var(--color-border-level-1)] bg-[var(--color-opacity-6)] rounded-lg"
                      @click="sortVisible = true"
                    >
                      <div class="flex items-center font-medium text-xs">
                        <div class="mr-2.5">{{ t('locales.search.sort') }}</div>
                        <div>{{ currentSort.name }}</div>
                      </div>
                      <div>
                        <pull_down class="w-2 h-2" />
                      </div>
                    </div>

                    <!-- 供应商 -->
                    <div
                      class="px-2.5 py-[11px] w-full flex justify-between items-center border border-[var(--color-border-level-1)] bg-[var(--color-opacity-6)] rounded-lg"
                    >
                      <div class="flex items-center font-medium text-xs">
                        <div class="mr-2.5">{{ t('locales.search.providers') }}</div>
                        <div>All</div>
                      </div>
                      <div>
                        <pull_down class="w-2 h-2" />
                      </div>
                    </div>
                  </div>

                  <!-- 排序弹窗 -->
                  <SortPopup
                    v-model:visible="sortVisible"
                    :sortList="sortList"
                    :selectedId="currentSort.id"
                    @confirm="handleSortConfirm"
                  />
                </div>
              </div>
            </transition>
          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import TopInput from '@/components/explore/TopInput.vue'
import SortPopup from '@/components/explore/mobile/SortPopup.vue'
import pull_down from '@/static/svg/explore/pull-down.svg?component'
import CloseIcon from '@/static/svg/close.svg?component'

interface Props {
  modelValue: boolean
}

defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [val: boolean]
}>()

const { t } = useI18n()

/* ===================== 排序筛选 ===================== */
const sortList = ref([
  { id: 1, name: '热门' },
  { id: 2, name: '最新' },
  { id: 3, name: 'A-Z' },
  { id: 4, name: 'Z-A' }
])
const currentSort = ref(sortList.value[0])
const sortVisible = ref(false)

const handleSortConfirm = (_val: object) => {
  currentSort.value = _val
  console.log('-------', _val)
  sortVisible.value = false
}

const close = () => {
  emit('update:modelValue', false)
}
</script>

<style scoped lang="scss">
/* 面板从底部上滑/下滑 */
.search-panel-up-enter-active,
.search-panel-up-leave-active {
  transition: transform 0.3s ease;
  will-change: transform;
}
.search-panel-up-enter-from,
.search-panel-up-leave-to {
  transform: translate3d(0, 100%, 0);
}
.search-panel-up-enter-to,
.search-panel-up-leave-from {
  transform: translate3d(0, 0, 0);
}
</style>
