<template>
  <!-- 供应商 -->
  <div
    class="px-2.5 py-[11px] w-full flex justify-between items-center border border-[var(--color-border-level-1)] bg-[var(--color-opacity-6)] rounded-lg"
    @click="SupplierVisible = true"
  >
    <div class="flex items-center font-medium text-xs">
      <div class="mr-2.5">{{ t('locales.search.providers') }}</div>
      <div>{{ supplierLabel }}</div>
    </div>
    <div>
      <pull_down class="w-2 h-2" />
    </div>
  </div>
  <!-- 供应商弹窗 -->
  <SupplierPopup
    v-model:visible="SupplierVisible"
    :supplierList="supplierList"
    :selectedIds="currentSupplierIds"
    @confirm="handleSupplierConfirm"
  />
</template>
<script setup lang="ts">
import { ref, computed } from 'vue'
import SupplierPopup from '@/components/explore/mobile/SupplierPopup.vue'
import pull_down from '@/static/svg/explore/pull-down.svg?component'
import wlImg from '@/static/img/supplier/wl.png'
import pgImg from '@/static/img/supplier/pg.png'
import fgImg from '@/static/img/supplier/fg.png'
import jlImg from '@/static/img/supplier/jl.png'
import { useI18n } from 'vue-i18n'
const { t } = useI18n()

/* ===================== 供应商选择 ===================== */
const supplierList = ref([
  { id: 1, url: wlImg },
  { id: 2, url: pgImg },
  { id: 3, url: fgImg },
  { id: 4, url: jlImg }
]) // 供应商列表
type Id = number | string

const currentSupplierIds = ref<Id[]>([]) // 多选结果
const SupplierVisible = ref(false)

const handleSupplierConfirm = (ids: Id[]) => {
  currentSupplierIds.value = ids
  console.log('----->', currentSupplierIds.value)
  SupplierVisible.value = false
}

const supplierLabel = computed(() => {
  const n = currentSupplierIds.value.length
  return n ? `+${n}` : t('locales.search.all')
})
/* ===================== end===================== */
</script>
<style scoped lang="scss"></style>
