<template>
  <!-- 好友明细页内容容器 -->
  <section class="relative overflow-hidden font-['Inter']">
    <!-- 页面主体内容 -->
    <main class="px-[14px] pt-[14px] pb-[30px]">
      <!-- 会员信息卡片 -->
      <section class="overflow-hidden rounded-[10px] bg-bg-2">
        <!-- 会员基础信息 -->
        <div class="flex h-[83px] items-center gap-[10px] px-[14px]">
          <!-- 头像容器 -->
          <div
            class="flex h-[55px] w-[55px] shrink-0 items-center justify-center rounded-full bg-opacity-15"
          >
            <!-- 会员头像 -->
            <img
              class="h-[47px] w-[47px] rounded-full object-cover"
              :src="props.memberInfo.avatar"
              :alt="props.avatarAlt"
            />
          </div>

          <!-- 会员文字信息 -->
          <div class="flex min-w-0 flex-1 flex-col gap-[7px]">
            <!-- 会员 ID 行 -->
            <div class="flex items-center gap-[4px]">
              <!-- 会员账号 -->
              <span
                class="max-w-[110px] truncate text-[14px] font-[700] leading-[17px] text-text-1"
              >
                {{ props.memberInfo.account }}
              </span>

              <!-- 复制按钮 -->
              <button
                type="button"
                class="flex h-[16px] w-[16px] items-center justify-center"
                @click="$emit('copy-account')"
              >
                <CopyIcon class="h-[14px] w-[14px]" />
              </button>

              <!-- VIP 等级 -->
              <span
                class="flex h-[16px] items-center justify-center rounded-[5px_5px_5px_0] bg-theme-3 px-[6px] text-[10px] font-[400] leading-[12px] text-theme-primary"
              >
                {{ props.memberInfo.vipLevel }}
              </span>
            </div>

            <!-- 最后登录时间 -->
            <div class="flex items-center gap-[4px] text-[12px] leading-[15px]">
              <!-- 最后登录标题 -->
              <span class="shrink-0 text-text-2">
                {{ props.lastLoginTimeLabel }}
              </span>

              <!-- 最后登录值 -->
              <span class="min-w-0 truncate text-text-1">
                {{ props.memberInfo.lastLoginTime }}
              </span>
            </div>
          </div>
        </div>

        <!-- 会员扩展信息 -->
        <div class="relative grid h-[35px] grid-cols-2 items-center px-[14px]">
          <!-- 会员扩展信息分割线 -->
          <span
            class="pointer-events-none absolute inset-x-0 top-0 h-px origin-top scale-y-100 bg-opacity-5"
          ></span>

          <!-- 用户 ID -->
          <div
            class="flex min-w-0 items-center justify-center gap-[4px] text-[12px] leading-[15px]"
          >
            <!-- 用户 ID 标题 -->
            <span class="shrink-0 text-text-2">
              {{ props.userIdLabel }}
            </span>

            <!-- 用户 ID 值 -->
            <span class="truncate text-text-1">
              {{ props.memberInfo.userId }}
            </span>
          </div>

          <!-- 用户名称 -->
          <div
            class="flex min-w-0 items-center justify-center gap-[4px] text-[12px] leading-[15px]"
          >
            <!-- 名称标题 -->
            <span class="shrink-0 text-text-2">
              {{ props.nameLabel }}
            </span>

            <!-- 名称值 -->
            <span class="truncate text-text-1">
              {{ props.memberInfo.name }}
            </span>
          </div>
        </div>
      </section>

      <!-- 日期筛选标签区域 -->
      <nav
        ref="dateTabNavRef"
        class="mt-[14px] cursor-grab overflow-x-auto overflow-y-hidden scrollbar-hide touch-pan-x active:cursor-grabbing"
        @wheel.stop.prevent="handleDateTabWheel"
        @pointerdown="handleDateTabPointerDown"
        @pointermove="handleDateTabPointerMove"
        @pointerup="handleDateTabPointerUp"
        @pointercancel="handleDateTabPointerUp"
        @mouseleave="handleDateTabPointerLeave"
      >
        <!-- 日期筛选列表 -->
        <div class="flex w-max items-center gap-[8px]">
          <!-- 日期筛选项 -->
          <button
            v-for="item in props.dateTabs"
            :key="item.value"
            type="button"
            class="box-border flex h-[30.67px] shrink-0 flex-col items-start justify-center gap-[3.33px] rounded-[18px] px-[20px] py-[8px]"
            :class="
              props.activeDateTab === item.value
                ? 'border border-solid border-theme-primary bg-theme-3'
                : 'bg-bg-2'
            "
            @click="handleDateTabClick(item.value)"
          >
            <span
              class="flex items-center text-[12px]"
              :class="
                props.activeDateTab === item.value
                  ? 'font-[700] leading-[14.67px] text-common-100'
                  : 'font-[500] leading-[18px] text-text-2'
              "
            >
              {{ item.label }}
            </span>
          </button>
        </div>
      </nav>

      <!-- 统计类型标签区域 -->
      <section class="relative mt-[20px]">
        <!-- 统计类型列表 -->
        <div class="flex items-start gap-[20px]">
          <!-- 统计类型项 -->
          <button
            v-for="item in props.statsTabs"
            :key="item.value"
            type="button"
            class="flex flex-col items-center gap-[8px] pb-[8px]"
            @click="$emit('change-stats-tab', item.value)"
          >
            <!-- 统计类型文字 -->
            <span
              class="text-[14px] leading-[17px]"
              :class="
                props.activeStatsTab === item.value
                  ? 'font-[700] text-text-1'
                  : 'font-[500] text-text-2'
              "
            >
              {{ item.label }}
            </span>

            <!-- 选中下划线 -->
            <span
              v-if="props.activeStatsTab === item.value"
              class="h-[2px] w-[56px] rounded-full bg-theme-primary"
            ></span>
          </button>
        </div>

        <!-- 统计类型区域分割线 -->
        <span class="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-opacity-5"></span>
      </section>

      <!-- 汇总统计卡片 -->
      <section class="mt-[20px] overflow-hidden rounded-[10px] bg-bg-2">
        <!-- 汇总标题区域 -->
        <div class="relative flex h-[37px] items-center px-[14px]">
          <!-- 标题文字 -->
          <h2 class="text-[14px] font-[400] leading-[17px] text-text-1">
            {{ props.totalTitle }}
          </h2>

          <!-- 汇总标题分割线 -->
          <span
            class="pointer-events-none absolute inset-x-0 bottom-0 h-px origin-bottom scale-y-100 bg-opacity-5"
          ></span>
        </div>

        <!-- 汇总内容 -->
        <div class="grid h-[66px] grid-cols-2 items-stretch py-[14px]">
          <!-- 汇总项 -->
          <div
            v-for="(item, index) in props.summaryList"
            :key="item.label"
            class="relative flex h-full flex-col items-center justify-center gap-[5px]"
          >
            <!-- 汇总值 -->
            <div class="w-full text-center text-[16px] font-[700] leading-[19px] text-text-1">
              {{ item.value }}
            </div>

            <!-- 汇总标题 -->
            <div class="w-full text-center text-[11px] font-[400] leading-[13px] text-text-3">
              {{ item.label }}
            </div>

            <!-- 汇总项分割线 -->
            <span
              v-if="index === 0"
              class="pointer-events-none absolute inset-y-0 right-0 w-px origin-right scale-x-100 bg-opacity-5"
            ></span>
          </div>
        </div>
      </section>

      <!-- 数据表格 -->
      <section class="mt-[14px] overflow-hidden rounded-[10px] bg-bg-2">
        <!-- 表头 -->
        <div class="grid h-[35px] grid-cols-3 items-center">
          <!-- 表头单元格 -->
          <div
            v-for="column in props.tableColumns"
            :key="column"
            class="px-[4px] text-center text-[12px] font-[400] leading-[15px] text-text-2"
          >
            {{ column }}
          </div>
        </div>

        <!-- 有数据表格内容 -->
        <div v-if="props.tableList.length > 0">
          <!-- 表格行 -->
          <div
            v-for="(row, index) in props.tableList"
            :key="row.id"
            class="grid h-[37px] grid-cols-3 items-center"
            :class="index % 2 === 0 ? 'bg-opacity-5' : 'bg-transparent'"
          >
            <!-- 第一列 -->
            <div class="px-[4px] text-center text-[14px] font-[400] leading-[17px] text-text-1">
              {{ row.name }}
            </div>

            <!-- 第二列 -->
            <div class="px-[4px] text-center text-[14px] font-[400] leading-[17px] text-text-1">
              {{ row.amount }}
            </div>

            <!-- 第三列 -->
            <div class="px-[4px] text-center text-[14px] font-[400] leading-[17px] text-text-1">
              {{ row.countOrProfit }}
            </div>
          </div>
        </div>
      </section>

      <!-- 无数据状态 -->
      <section v-if="props.tableList.length === 0" class="flex flex-col items-center pt-[30px]">
        <!-- 空状态组件 -->
        <ThemedEmptyState
          :dark-image="props.emptyDarkImage"
          :light-image="props.emptyLightImage"
          :image-alt="props.emptyAlt"
          :message="props.emptyText"
          container-class="mt-0"
          image-class="h-[200px] w-[220px] object-contain"
          text-class="mt-[10px] text-center text-[12px] font-[500] leading-[18px] text-text-1"
        />
      </section>
    </main>
  </section>
</template>

<script setup lang="ts">
import ThemedEmptyState from '@/components/common/ThemedEmptyState.vue'
import CopyIcon from '@/static/svg/copy.svg?component'
import { ref } from 'vue'
import type {
  ReferralFriendDetailDateTabValue,
  ReferralFriendDetailMemberInfo,
  ReferralFriendDetailStatsTabValue,
  ReferralFriendDetailSummaryItem,
  ReferralFriendDetailTabItem,
  ReferralFriendDetailTableRow
} from '../shared'

interface Props {
  activeDateTab: ReferralFriendDetailDateTabValue
  activeStatsTab: ReferralFriendDetailStatsTabValue
  avatarAlt: string
  emptyAlt: string
  emptyDarkImage: string
  emptyLightImage: string
  emptyText: string
  lastLoginTimeLabel: string
  memberInfo: ReferralFriendDetailMemberInfo
  nameLabel: string
  totalTitle: string
  userIdLabel: string
  dateTabs: ReferralFriendDetailTabItem<ReferralFriendDetailDateTabValue>[]
  statsTabs: ReferralFriendDetailTabItem<ReferralFriendDetailStatsTabValue>[]
  summaryList: ReferralFriendDetailSummaryItem[]
  tableColumns: string[]
  tableList: ReferralFriendDetailTableRow[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'change-date-tab': [value: ReferralFriendDetailDateTabValue]
  'change-stats-tab': [value: ReferralFriendDetailStatsTabValue]
  'copy-account': []
}>()

const dateTabNavRef = ref<HTMLElement | null>(null)
const isDateTabDragging = ref(false)
const didDateTabDrag = ref(false)
const dateTabPointerStartX = ref(0)
const dateTabScrollStartLeft = ref(0)

/**
 * 处理点击日期筛选标签。
 */
function handleDateTabClick(value: ReferralFriendDetailDateTabValue) {
  if (didDateTabDrag.value) {
    didDateTabDrag.value = false
    return
  }

  emit('change-date-tab', value)
}

/**
 * 处理日期筛选标签区域滚轮横向滚动。
 */
function handleDateTabWheel(event: WheelEvent) {
  const container = dateTabNavRef.value

  if (!container) {
    return
  }

  const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY

  container.scrollLeft += delta
}

/**
 * 处理日期筛选标签区域拖拽开始。
 */
function handleDateTabPointerDown(event: PointerEvent) {
  const container = dateTabNavRef.value

  if (!container || container.scrollWidth <= container.clientWidth) {
    return
  }

  isDateTabDragging.value = true
  didDateTabDrag.value = false
  dateTabPointerStartX.value = event.clientX
  dateTabScrollStartLeft.value = container.scrollLeft
}

/**
 * 处理日期筛选标签区域拖拽移动。
 */
function handleDateTabPointerMove(event: PointerEvent) {
  const container = dateTabNavRef.value

  if (!container || !isDateTabDragging.value) {
    return
  }

  const deltaX = event.clientX - dateTabPointerStartX.value

  if (Math.abs(deltaX) > 4) {
    didDateTabDrag.value = true
    event.preventDefault()
  }

  container.scrollLeft = dateTabScrollStartLeft.value - deltaX
}

/**
 * 处理日期筛选标签区域拖拽结束。
 */
function handleDateTabPointerUp() {
  const container = dateTabNavRef.value

  if (!container || !isDateTabDragging.value) {
    return
  }

  isDateTabDragging.value = false
}

/**
 * 处理日期筛选标签区域鼠标离开。
 */
function handleDateTabPointerLeave() {
  isDateTabDragging.value = false
}
</script>
