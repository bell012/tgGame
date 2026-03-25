<template>
  <div class="w-full">
    <!-- grid：H5 3列 / PC 8列；-->
    <div v-if="items?.length" class="grid w-full gap-[11px] grid-cols-3 sm:grid-cols-8">
      <div v-for="(item, i) in items" :key="getItemKey(item, i)" class="min-w-0">
        <slot name="item" :item="item" :index="i">
          <div
            class="w-full aspect-[0.75] rounded-lg bg-[var(--color-opacity-6)] border border-[var(--color-border-level-1)]"
          />
        </slot>
      </div>
    </div>

    <!-- 列表无数据时显示 -->
    <div v-else class="w-full flex justify-center items-center flex-col mt-[17px]">
      <img :src="defaultImg" alt="empty" class="w-[220px] h-[200px] object-contain mb-2.5" />
      <div class="text-xs text-center">{{ t('search.stay') }}</div>
    </div>

    <!-- 上一页 / 当前页码/总页码 / 下一页 -->
    <div v-if="showPager && items?.length" class="mt-4 flex items-center justify-center">
      <button
        type="button"
        class="px-[9px] h-[35px] rounded-tl-lg rounded-bl-lg text-xs flex items-center justify-center bg-[var(--color-background-level-2)]"
        :class="canPrev ? 'text-text-1' : 'text-text-2 opacity-50'"
        :disabled="!canPrev"
        @click="goPrev"
      >
        <LeftArrow class="w-2 h-2" />
      </button>

      <div class="mx-[2px] px-2.5 py-1 flex items-center bg-[var(--color-background-level-2)]">
        <!-- 当前页码-->
        <div
          class="rounded-md flex items-center justify-center bg-[var(--color-background-level-3)] font-bold text-xs text-text-1 leading-[12px] px-[7px] py-[7px]"
        >
          {{ page < 10 ? '0' + page : page }}
        </div>

        <!-- of -->
        <span class="mx-[2px] text-xs text-text-2 lowercase">of</span>

        <!-- 总页码 -->
        <span
          class="rounded-md flex items-center justify-center font-bold text-xs text-text-1 leading-[12px] px-[7px] py-[7px]"
          >{{ totalPages }}</span
        >
      </div>

      <button
        type="button"
        class="px-[9px] h-[35px] rounded-tr-lg rounded-br-lg text-xs bg-[var(--color-background-level-2)] flex items-center justify-center"
        :class="canNext ? 'text-text-1' : 'text-text-2 opacity-50'"
        :disabled="!canNext"
        @click="goNext"
      >
        <RightArrow class="w-2 h-2" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import LeftArrow from '@/static/svg/explore/left-arrow.svg?component'
import RightArrow from '@/static/svg/explore/right-arrow.svg?component'
import defaultImg from '@/static/img/explore/default.png'
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
const props = withDefaults(
  defineProps<{
    /** 当前页要渲染的列表 */
    items: Record<string, any>[]
    /** 当前页码 */
    page: number
    /** 总页数 */
    totalPages: number
    /** 用于 v-for 的 key */
    keyField?: string
    /** 上一页/下一页文案 */
    prevText?: string
    nextText?: string
    /** 是否显示分页条 */
    showPager?: boolean
  }>(),
  {
    items: () => [],
    page: 1,
    totalPages: 1,
    prevText: '上一页',
    nextText: '下一页',
    showPager: true
  }
)

const emit = defineEmits<{
  'update:page': [page: number]
  change: [page: number]
}>()

const canPrev = computed(() => props.page > 1)
const canNext = computed(() => props.page < props.totalPages)

const setPage = (p: number) => {
  const next = Math.min(Math.max(1, p), Math.max(1, props.totalPages))
  if (next === props.page) return
  emit('update:page', next)
  emit('change', next)
}

const goPrev = () => setPage(props.page - 1)
const goNext = () => setPage(props.page + 1)

type Key = string | number

const getItemKey = (item: any, index: number): Key =>
  (props.keyField && item?.[props.keyField]) ?? item?.id ?? index
</script>

<style scoped lang="scss"></style>
