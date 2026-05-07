<template>
  <!-- 统计标签内容区域 -->
  <section class="flex flex-col gap-[10px] sm:gap-[16px]">
    <!-- H5 图表区域 -->
    <section v-if="props.isMobile" class="overflow-hidden rounded-[10px] bg-bg-2">
      <!-- H5 图表顶部标签栏 -->
      <div class="bg-bg-2 px-[14px] pt-[14px]">
        <!-- H5 图表标签列表 -->
        <div class="flex items-end gap-[3px]">
          <!-- H5 图表标签按钮 -->
          <button
            v-for="(chart, index) in props.chartCards"
            :key="chart.title"
            type="button"
            class="flex flex-1 flex-col items-center gap-[8px]"
            @click="handleChangeMobileChart(index)"
          >
            <!-- H5 图表标签文字 -->
            <span
              class="w-full text-center text-[14px]"
              :class="
                activeMobileChartIndex === index
                  ? 'font-[700] leading-[17px] text-text-1'
                  : 'font-[500] leading-[17px] text-text-2'
              "
            >
              {{ chart.title }}
            </span>

            <!-- H5 图表标签选中线 -->
            <span
              class="h-[2px] w-full rounded-full"
              :class="activeMobileChartIndex === index ? 'bg-theme-primary' : 'bg-transparent'"
            ></span>
          </button>
        </div>
      </div>

      <!-- H5 当前图表 -->
      <ReferralDetailsStatsChart
        v-if="activeMobileChart"
        :title="activeMobileChart.title"
        :x-axis-data="activeMobileChart.xAxisData"
        :series-data="activeMobileChart.seriesData"
        :show-header="false"
      />
    </section>

    <!-- PC 图表区域 -->
    <section v-else class="grid gap-[10px] sm:grid-cols-2 sm:gap-[16px]">
      <!-- 单个统计图表 -->
      <ReferralDetailsStatsChart
        v-for="chart in props.chartCards"
        :key="chart.title"
        :title="chart.title"
        :x-axis-data="chart.xAxisData"
        :series-data="chart.seriesData"
      />
    </section>

    <!-- 充值统计区域 -->
    <section class="overflow-hidden rounded-[10px] bg-bg-2">
      <!-- 充值统计标题和日期栏 -->
      <div
        class="relative flex h-[40px] items-center justify-between px-[14px] sm:h-[120px] sm:px-[42px]"
      >
        <!-- 充值统计标题 -->
        <h3
          class="text-[14px] font-[400] leading-[17px] text-text-1 sm:text-[42px] sm:leading-[51px]"
        >
          {{ props.topUpTitle }}
        </h3>

        <!-- 日期选择按钮 -->
        <button
          type="button"
          class="flex items-center gap-[7px] sm:gap-[21px]"
          @click="$emit('open-date-picker')"
        >
          <!-- 日期文本 -->
          <span
            class="text-[16px] font-[700] leading-[19px] text-text-1 sm:text-[36px] sm:leading-[44px]"
          >
            {{ props.dateLabel }}
          </span>

          <!-- 下拉图标按钮 -->
          <span
            class="flex h-[20px] w-[20px] items-center justify-center rounded-[6px] bg-opacity-10 sm:h-[60px] sm:w-[60px] sm:rounded-[18px]"
          >
            <ArrowDownIcon class="h-[10px] w-[10px] text-text-2 sm:h-[24px] sm:w-[24px]" />
          </span>
        </button>

        <!-- 充值统计标题分割线 -->
        <span
          class="pointer-events-none absolute inset-x-0 bottom-0 h-px origin-bottom scale-y-100 bg-opacity-5"
        ></span>
      </div>

      <!-- 充值统计主体区域 -->
      <div class="flex flex-col gap-[10px] p-[14px] sm:gap-[16px] sm:p-[24px]">
        <!-- 充值统计汇总卡片 -->
        <section class="overflow-hidden rounded-[10px] bg-bg-3">
          <!-- 汇总列表 -->
          <div class="grid h-[66px] grid-cols-3 items-stretch py-[14px] sm:h-[140px] sm:py-[24px]">
            <!-- 汇总单项 -->
            <div
              v-for="(item, index) in props.topUpSummaryList"
              :key="item.label"
              class="relative flex h-full flex-col items-center justify-center gap-[5px] sm:gap-[12px]"
            >
              <!-- 汇总数值 -->
              <div
                class="w-full text-center text-[16px] font-[700] leading-[19px] text-text-1 sm:text-[34px] sm:leading-[41px]"
              >
                {{ item.value }}
              </div>

              <!-- 汇总标题 -->
              <div
                class="w-full text-center text-[11px] font-[400] leading-[13px] text-text-3 sm:px-[10px] sm:text-[18px] sm:leading-[22px]"
              >
                {{ item.label }}
              </div>

              <!-- 汇总项分割线 -->
              <span
                v-if="index !== props.topUpSummaryList.length - 1"
                class="pointer-events-none absolute inset-y-0 right-0 w-px origin-right scale-x-100 bg-opacity-5"
              ></span>
            </div>
          </div>
        </section>

        <!-- 充值统计表格 -->
        <section class="overflow-hidden rounded-[10px] bg-bg-3">
          <!-- 表格行列表 -->
          <div>
            <!-- 表格行 -->
            <div
              v-for="(row, index) in props.topUpTableRows"
              :key="row.method"
              class="relative grid h-[48px] grid-cols-3 items-center px-[12px] sm:h-[92px] sm:px-[20px]"
            >
              <!-- 行内分割线 -->
              <span
                v-if="index !== props.topUpTableRows.length - 1"
                class="pointer-events-none absolute inset-x-0 bottom-0 h-px origin-bottom scale-y-100 bg-opacity-5"
              ></span>

              <!-- 支付方式 -->
              <div
                class="text-center text-[13px] font-[400] leading-[16px] text-text-1 sm:text-[24px] sm:leading-[29px]"
              >
                {{ row.method }}
              </div>

              <!-- 充值金额 -->
              <div
                class="text-center text-[13px] font-[400] leading-[16px] text-text-1 sm:text-[24px] sm:leading-[29px]"
              >
                {{ row.amount }}
              </div>

              <!-- 充值次数 -->
              <div
                class="text-center text-[13px] font-[400] leading-[16px] text-text-1 sm:text-[24px] sm:leading-[29px]"
              >
                {{ row.count }}
              </div>
            </div>
          </div>
        </section>
      </div>
    </section>
  </section>
</template>

<script setup lang="ts">
import ArrowDownIcon from '@/static/svg/arrow_down.svg?component'
import { computed, ref, watch } from 'vue'
import type {
  ReferralDetailsStatsChartCard,
  ReferralDetailsTopUpSummaryItem,
  ReferralDetailsTopUpTableRow
} from '../shared'
import ReferralDetailsStatsChart from './ReferralDetailsStatsChart.vue'

interface Props {
  isMobile: boolean
  dateLabel: string
  topUpTitle: string
  chartCards: ReferralDetailsStatsChartCard[]
  topUpSummaryList: ReferralDetailsTopUpSummaryItem[]
  topUpTableRows: ReferralDetailsTopUpTableRow[]
}

const props = defineProps<Props>()
const activeMobileChartIndex = ref(0)

/**
 * 返回 H5 当前激活的图表数据。
 */
const activeMobileChart = computed(() => props.chartCards[activeMobileChartIndex.value] ?? null)

defineEmits<{
  'open-date-picker': []
}>()

/**
 * 处理切换 H5 图表标签。
 */
function handleChangeMobileChart(index: number) {
  activeMobileChartIndex.value = index
}

watch(
  () => props.chartCards.length,
  length => {
    if (length === 0) {
      activeMobileChartIndex.value = 0
      return
    }

    if (activeMobileChartIndex.value > length - 1) {
      activeMobileChartIndex.value = 0
    }
  }
)
</script>
