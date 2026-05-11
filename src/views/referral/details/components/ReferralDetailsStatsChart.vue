<template>
  <!-- 统计图表卡片 -->
  <component :is="props.showContainer ? 'section' : 'div'" :class="containerClass">
    <!-- 图表标题栏 -->
    <div v-if="props.showHeader" :class="headerClass">
      <!-- 图表标题 -->
      <h3
        class="text-[14px] font-[700] leading-[17px] text-text-1 sm:text-[20px] sm:leading-[24px]"
      >
        {{ props.title }}
      </h3>

      <!-- 图表标题分割线 -->
      <span
        class="pointer-events-none absolute inset-x-0 bottom-0 h-px origin-bottom scale-y-100 bg-opacity-5"
      ></span>
    </div>

    <!-- 图表内容区域 -->
    <div :class="contentClass">
      <!-- 图表挂载节点 -->
      <div ref="chartRef" :class="chartClass"></div>
    </div>
  </component>
</template>

<script setup lang="ts">
import * as echarts from 'echarts'
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'

interface Props {
  title: string
  xAxisData: string[]
  seriesData: number[]
  showHeader?: boolean
  showContainer?: boolean
  contentPaddingClass?: string
  chartHeightClass?: string
}

const props = withDefaults(defineProps<Props>(), {
  showHeader: true,
  showContainer: true,
  contentPaddingClass: 'px-[8px] py-[10px] sm:px-[18px] sm:py-[18px]',
  chartHeightClass: 'h-[180px] sm:h-[280px]'
})

const chartRef = ref<HTMLDivElement | null>(null)
let chartInstance: echarts.ECharts | null = null

const containerClass = computed(() =>
  props.showContainer ? 'overflow-hidden rounded-[10px] bg-bg-2' : ''
)

const headerClass = computed(
  () => 'relative flex h-[37px] items-center px-[14px] sm:h-[52px] sm:px-[24px]'
)

const contentClass = computed(() => props.contentPaddingClass)
const chartClass = computed(() => `${props.chartHeightClass} w-full`)

/**
 * 构建统计图表配置。
 */
function buildChartOption() {
  return {
    animation: false,
    grid: {
      left: 28,
      right: 16,
      top: 16,
      bottom: 24,
      containLabel: true
    },
    tooltip: {
      trigger: 'axis'
    },
    xAxis: {
      type: 'category',
      data: props.xAxisData,
      boundaryGap: false,
      axisLine: {
        show: false
      },
      axisTick: {
        show: false
      },
      axisLabel: {
        color: '#B3BEC1',
        fontSize: 12
      }
    },
    yAxis: {
      type: 'value',
      min: 0,
      splitLine: {
        lineStyle: {
          color: 'rgba(255, 255, 255, 0.1)',
          width: 1
        }
      },
      axisLine: {
        show: false
      },
      axisTick: {
        show: false
      },
      axisLabel: {
        color: '#B3BEC1',
        fontSize: 12
      }
    },
    series: [
      {
        type: 'line',
        data: props.seriesData,
        smooth: false,
        symbol: 'circle',
        symbolSize: 7,
        lineStyle: {
          color: '#2AEE88',
          width: 2
        },
        itemStyle: {
          color: '#2AEE88'
        },
        areaStyle: {
          color: 'rgba(42, 238, 136, 0.08)'
        }
      }
    ]
  }
}

/**
 * 初始化图表实例。
 */
function initChart() {
  if (!chartRef.value) {
    return
  }

  chartInstance = echarts.init(chartRef.value)
  updateChart()
}

/**
 * 更新图表配置。
 */
function updateChart() {
  if (!chartInstance) {
    return
  }

  chartInstance.setOption(buildChartOption())
}

/**
 * 处理浏览器窗口尺寸变化。
 */
function handleResize() {
  chartInstance?.resize()
}

watch(
  () => [props.xAxisData, props.seriesData],
  async () => {
    await nextTick()

    if (!chartInstance && chartRef.value) {
      initChart()
      return
    }

    updateChart()
  },
  {
    deep: true
  }
)

onMounted(async () => {
  await nextTick()
  initChart()
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  chartInstance?.dispose()
  chartInstance = null
})
</script>
