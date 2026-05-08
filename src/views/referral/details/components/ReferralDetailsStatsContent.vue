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

    <!-- PC 统计区域 -->
    <section v-else class="flex w-full max-w-[1032px] flex-col gap-[16px]">
      <!-- 导航块 -->
      <nav class="flex h-[32px] items-center gap-[16px]">
        <!-- 按钮块 -->
        <button
          v-for="option in pcDateOptions"
          :key="option.value"
          type="button"
          class="flex h-[32px] shrink-0 items-center rounded-[52px] px-[24px] text-[14px] font-[700] leading-[17px]"
          :class="
            props.activeDateValue === option.value
              ? 'border border-theme-primary bg-theme-3 text-text-1'
              : 'bg-bg-2 text-text-2'
          "
          @click="$emit('change-date', option.value)"
        >
          {{ option.label }}
        </button>
      </nav>

      <section class="overflow-hidden rounded-[16px] bg-bg-2 pb-[20px]">
        <div class="flex h-[40px] items-center">
          <!-- 按钮块 -->
          <button
            v-for="(chart, index) in props.chartCards"
            :key="chart.title"
            type="button"
            class="flex h-[40px] flex-1 flex-col items-center justify-between pt-[12px]"
            @click="handleChangeMobileChart(index)"
          >
            <span
              class="text-center text-[14px] font-[700] leading-[17px]"
              :class="activeMobileChartIndex === index ? 'text-text-1' : 'text-text-2'"
            >
              {{ chart.title }}
            </span>

            <span
              class="h-[2px] w-full rounded-[10px]"
              :class="activeMobileChartIndex === index ? 'bg-theme-primary' : 'bg-transparent'"
            ></span>
          </button>
        </div>

        <ReferralDetailsStatsChart
          v-if="activeMobileChart"
          :title="activeMobileChart.title"
          :x-axis-data="activeMobileChart.xAxisData"
          :series-data="activeMobileChart.seriesData"
          :show-header="false"
          :show-container="false"
          content-padding-class="px-[20px] pt-[2px] pb-[0]"
          chart-height-class="h-[359px]"
        />
      </section>
    </section>

    <!-- 充值统计区域 -->
    <section
      class="bg-bg-2"
      :class="
        props.isMobile
          ? 'overflow-hidden rounded-[10px]'
          : 'overflow-visible w-full max-w-[1032px] rounded-[12px] px-[24px] py-[16px]'
      "
    >
      <!-- 充值统计标题和日期栏 -->
      <div
        class="relative flex items-center justify-between"
        :class="props.isMobile ? 'h-[40px] px-[14px]' : 'h-[48px]'"
      >
        <!-- 充值统计标题 -->
        <h3
          class="text-text-1"
          :class="
            props.isMobile
              ? 'text-[14px] font-[400] leading-[17px]'
              : 'text-[16px] font-[700] leading-[19px]'
          "
        >
          {{ props.topUpTitle }}
        </h3>

        <!-- 日期选择按钮 -->
        <button
          v-if="props.isMobile"
          type="button"
          class="flex items-center gap-[7px]"
          @click="$emit('open-date-picker')"
        >
          <!-- 日期文本 -->
          <span class="text-text-1 text-[16px] font-[700] leading-[19px]">
            {{ props.dateLabel }}
          </span>

          <!-- 下拉图标按钮 -->
          <span
            class="flex h-[20px] w-[20px] items-center justify-center rounded-[6px] bg-opacity-10"
          >
            <ArrowDownIcon class="h-[10px] w-[10px] text-text-2" />
          </span>
        </button>

        <CustomSelect
          v-else
          class="w-[300px]"
          :model-value="props.activeDateValue"
          :options="pcSelectDateOptions"
          @update:model-value="$emit('change-date', $event as ReferralDetailsDateFilterValue)"
        />

        <!-- 充值统计标题分割线 -->
        <span
          v-if="props.isMobile"
          class="pointer-events-none absolute inset-x-0 bottom-0 h-px origin-bottom scale-y-100 bg-opacity-5"
        ></span>
      </div>

      <!-- 充值统计主体区域 -->
      <div
        class="flex flex-col"
        :class="props.isMobile ? 'gap-[10px] p-[14px]' : 'gap-[16px] pt-[16px] pb-[0]'"
      >
        <!-- 充值统计汇总卡片 -->
        <section
          class="overflow-hidden"
          :class="props.isMobile ? 'rounded-[10px] bg-bg-3' : 'rounded-[16px] bg-[#2D3131]'"
        >
          <!-- 汇总列表 -->
          <div
            class="grid grid-cols-3 items-stretch"
            :class="props.isMobile ? 'h-[66px] py-[14px]' : 'h-[76px] py-[12px]'"
          >
            <!-- 汇总单项 -->
            <div
              v-for="(item, index) in props.topUpSummaryList"
              :key="item.label"
              class="relative flex h-full flex-col items-center justify-center"
              :class="props.isMobile ? 'gap-[5px]' : 'gap-[8px]'"
            >
              <!-- 汇总数值 -->
              <div
                class="w-full text-center font-[700] text-text-1"
                :class="
                  props.isMobile ? 'text-[16px] leading-[19px]' : 'text-[18px] leading-[22px]'
                "
              >
                {{ item.value }}
              </div>

              <!-- 汇总标题 -->
              <div
                class="w-full text-center font-[400]"
                :class="
                  props.isMobile
                    ? 'text-[11px] leading-[13px] text-text-3'
                    : 'px-[10px] text-[14px] leading-[20px] text-[#7B7D7D]'
                "
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
        <section
          class="overflow-hidden"
          :class="props.isMobile ? 'rounded-[10px] bg-bg-3' : 'rounded-[16px] bg-[#2D3131]'"
        >
          <!-- 表格行列表 -->
          <div>
            <!-- 表格行 -->
            <div
              v-for="(row, index) in props.topUpTableRows"
              :key="row.method"
              class="relative grid grid-cols-3 items-center"
              :class="props.isMobile ? 'h-[48px] px-[12px]' : 'h-[50px]'"
            >
              <!-- 行内分割线 -->
              <span
                v-if="index !== props.topUpTableRows.length - 1"
                class="pointer-events-none absolute inset-x-0 bottom-0 h-px origin-bottom scale-y-100 bg-opacity-5"
              ></span>

              <!-- 支付方式 -->
              <div
                class="text-center font-[400] text-text-1"
                :class="
                  props.isMobile ? 'text-[13px] leading-[16px]' : 'text-[14px] leading-[20px]'
                "
              >
                {{ row.method }}
              </div>

              <!-- 充值金额 -->
              <div
                class="text-center font-[400] text-text-1"
                :class="
                  props.isMobile ? 'text-[13px] leading-[16px]' : 'text-[14px] leading-[20px]'
                "
              >
                {{ row.amount }}
              </div>

              <!-- 充值次数 -->
              <div
                class="text-center font-[400] text-text-1"
                :class="
                  props.isMobile ? 'text-[13px] leading-[16px]' : 'text-[14px] leading-[20px]'
                "
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
import CustomSelect from '@/components/common/CustomSelect.vue'
import ArrowDownIcon from '@/static/svg/arrow_down.svg?component'
import { computed, ref, watch } from 'vue'
import type {
  ReferralDetailsDateFilterValue,
  ReferralDetailsDateOption,
  ReferralDetailsStatsChartCard,
  ReferralDetailsTopUpSummaryItem,
  ReferralDetailsTopUpTableRow
} from '../shared'
import ReferralDetailsStatsChart from './ReferralDetailsStatsChart.vue'

interface Props {
  isMobile: boolean
  dateLabel: string
  activeDateValue: ReferralDetailsDateFilterValue
  dateOptions: ReferralDetailsDateOption[]
  topUpTitle: string
  chartCards: ReferralDetailsStatsChartCard[]
  topUpSummaryList: ReferralDetailsTopUpSummaryItem[]
  topUpTableRows: ReferralDetailsTopUpTableRow[]
}

const props = defineProps<Props>()
const activeMobileChartIndex = ref(0)
const pcDateOptions = computed(() => props.dateOptions.filter(item => item.value !== 'all'))
const pcSelectDateOptions = computed(() =>
  props.dateOptions.map(item => ({
    label: item.label,
    value: item.value
  }))
)

/**
 * 返回 H5 当前激活的图表数据。
 */
const activeMobileChart = computed(() => props.chartCards[activeMobileChartIndex.value] ?? null)

defineEmits<{
  'open-date-picker': []
  'change-date': [value: ReferralDetailsDateFilterValue]
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
