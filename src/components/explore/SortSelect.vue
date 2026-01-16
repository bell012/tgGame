<template>
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
  <!-- 排序弹窗 -->
  <SortPopup
    v-model:visible="sortVisible"
    :sortList="sortList"
    :selectedId="currentSort.id"
    @confirm="handleSortConfirm"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import SortPopup from '@/components/explore/mobile/SortPopup.vue'
import pull_down from '@/static/svg/explore/pull-down.svg?component'
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
/* ===================== 排序筛选 ===================== */
const sortList = ref([
  { id: 1, name: '热门' },
  { id: 2, name: '最新' },
  { id: 3, name: 'A-Z' },
  { id: 4, name: 'Z-A' }
]) // 排序列表
const currentSort = ref(sortList.value[0]) // 当前选中的排序
const sortVisible = ref(false) // 排序弹窗显示隐藏

// 排序选择确认
const handleSortConfirm = (_val: object) => {
  currentSort.value = _val
  console.log('-------', _val)
  sortVisible.value = false
}
/* ===================== end===================== */
</script>

<style scoped lang="scss"></style>
