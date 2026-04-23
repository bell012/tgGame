<template>
  <!-- PC 页面主体 -->
  <section class="flex flex-col gap-6">
    <!-- 顶部区域 -->
    <section class="flex flex-col gap-4">
      <!-- 页面标题 -->
      <h2 class="flex h-6 items-center text-[20px] font-[700] leading-6 text-text-1 capitalize">
        Referral
      </h2>

      <!-- 顶部标签栏 -->
      <nav class="grid h-10 grid-cols-4 rounded-lg bg-bg-2">
        <!-- 标签按钮 -->
        <button
          v-for="tab in tabs"
          :key="tab.key"
          type="button"
          class="rounded-lg text-sm font-[700] leading-[17px] transition-colors"
          :class="tab.active ? 'bg-bg-3 text-text-1' : 'text-text-2 hover:text-text-1'"
          @click="handleTabClick(tab.key)"
        >
          {{ tab.label }}
        </button>
      </nav>
    </section>

    <!-- 内容区域 -->
    <section class="flex flex-col gap-4">
      <!-- Referral 主页面 -->
      <template v-if="activeTabKey === 'referral'">
        <!-- 佣金模块 -->
        <section class="flex flex-col gap-4">
          <!-- 佣金标题行 -->
          <div class="flex items-center gap-2">
            <!-- 佣金标题 -->
            <p class="text-base font-[700] leading-[19px] text-text-1">
              {{ $t('referral.myCommission') }}
            </p>

            <!-- 佣金提示 -->
            <p class="text-xs font-[400] leading-[15px] text-text-2">
              {{ `(${$t('referral.claimHint')})` }}
            </p>
          </div>

          <!-- 佣金卡片 -->
          <article class="relative h-[180px] overflow-hidden rounded-2xl bg-bg-2">
            <!-- 右上角分享按钮 -->
            <button
              type="button"
              class="absolute right-0 top-0 h-10 w-[180px] rounded-[0px_16px] bg-theme-primary"
              @click="handleShare"
            >
              <!-- 按钮内容 -->
              <span
                class="absolute left-1/2 top-1/2 flex h-[19px] w-[128px] -translate-x-1/2 -translate-y-1/2 items-center gap-1"
              >
                <!-- 按钮文案 -->
                <span
                  class="flex h-[19px] w-[108px] items-center justify-center text-center text-base font-[700] leading-[19px] text-text-4"
                >
                  {{ $t('referral.shareToEarn') }}
                </span>

                <!-- 方向图标 -->
                <DirectionIcon class="h-4 w-4" aria-hidden="true" />
              </span>
            </button>

            <!-- 佣金内容容器 -->
            <div class="absolute left-10 top-6 flex flex-col gap-9">
              <!-- 佣金信息行 -->
              <div class="flex items-center gap-4">
                <!-- 佣金标题组 -->
                <div class="flex items-center gap-2">
                  <!-- 佣金图标 -->
                  <div
                    class="flex h-5 w-5 items-center justify-center rounded-full bg-secondary-3 text-xs font-[700] text-theme-primary"
                  >
                    $
                  </div>

                  <!-- 佣金标题文本 -->
                  <p class="text-base font-[700] leading-[19px] text-text-1">
                    {{ `${$t('referral.estimatedCommission')} :` }}
                  </p>
                </div>

                <!-- 佣金金额 -->
                <p class="text-[40px] font-[700] leading-[48px] text-theme-primary">
                  {{ estimatedCommission }}
                </p>
              </div>

              <!-- 领取按钮 -->
              <button
                type="button"
                class="relative z-10 inline-flex h-10 w-40 items-center justify-center rounded-lg bg-theme-primary"
                @click="handleClaim"
              >
                <!-- 领取文案 -->
                <span class="text-sm font-[700] leading-[17px] text-text-4">
                  {{ $t('referral.claim') }}
                </span>
              </button>
            </div>

            <!-- 佣金装饰图 -->
            <img
              :src="commissionHero"
              alt=""
              class="pointer-events-none absolute bottom-0 right-[100px] h-[156px] w-[309px] object-contain"
            />
          </article>
        </section>

        <!-- 数据概览模块 -->
        <section class="flex flex-col gap-4">
          <!-- 数据标题行 -->
          <div class="flex items-center gap-2">
            <!-- 数据标题 -->
            <p class="text-base font-[700] leading-[19px] text-text-1">
              {{ $t('referral.dataOverview') }}
            </p>

            <!-- 数据提示 -->
            <p class="text-xs font-[400] leading-[15px] text-text-2">
              {{ `(${$t('referral.statisticsHint')})` }}
            </p>
          </div>

          <!-- 数据卡片网格 -->
          <section class="grid grid-cols-3 gap-5">
            <!-- 数据卡片 -->
            <article
              v-for="metric in referralMetrics"
              :key="metric.key"
              class="h-[104px] rounded-2xl bg-bg-2"
            >
              <!-- 数据卡片内容 -->
              <div class="flex h-full flex-col items-center justify-center gap-2 text-center">
                <!-- 数据值 -->
                <p class="text-2xl font-[700] leading-[29px] text-theme-primary">
                  {{ metric.value }}
                </p>

                <!-- 数据标题 -->
                <p class="text-base font-[400] leading-[19px] text-text-1">
                  {{ metric.label }}
                </p>
              </div>
            </article>
          </section>
        </section>

        <!-- 分享卡片 -->
        <article class="rounded-[30px] bg-bg-2 p-6">
          <!-- 分享卡片主体 -->
          <div class="flex items-center justify-between gap-6">
            <!-- 二维码区域 -->
            <div
              class="flex h-[200px] w-[200px] items-center justify-center rounded-2xl bg-opacity-5"
            >
              <!-- 二维码画布 -->
              <canvas
                ref="pcQrCodeCanvas"
                class="h-[162px] w-[162px] rounded-xl bg-common-100 p-1"
              ></canvas>
            </div>

            <!-- 右侧分享内容 -->
            <div class="flex flex-1 flex-col gap-6">
              <!-- 分享说明区 -->
              <div class="flex flex-col gap-3">
                <!-- 分享说明文本 -->
                <p class="text-base font-[400] leading-[19px] text-text-1">
                  {{ $t('referral.shareHint') }}
                </p>

                <!-- 查看二维码按钮 -->
                <button
                  type="button"
                  class="inline-flex h-10 w-40 items-center justify-center rounded-lg bg-theme-primary"
                  @click="handleOpenQr"
                >
                  <!-- 查看二维码文案 -->
                  <span class="text-sm font-[700] leading-[17px] text-text-4">
                    {{ $t('referral.viewQrCode') }}
                  </span>
                </button>
              </div>

              <!-- 邀请链接区 -->
              <div class="flex flex-col gap-3">
                <!-- 邀请链接标题 -->
                <p class="text-sm font-[700] leading-[17px] text-text-1">
                  {{ $t('referral.myReferralLink') }}
                </p>

                <!-- 邀请链接容器 -->
                <div
                  class="flex h-12 items-center justify-between gap-4 rounded-lg border border-opacity-10 bg-mask-20 px-4"
                >
                  <!-- 邀请链接文本 -->
                  <p class="min-w-0 flex-1 truncate text-sm font-[700] leading-[17px] text-text-1">
                    {{ referralLink }}
                  </p>

                  <!-- 复制按钮 -->
                  <button
                    type="button"
                    class="inline-flex h-8 w-20 items-center justify-center rounded-lg bg-secondary-3"
                    @click="handleCopy"
                  >
                    <!-- 复制文案 -->
                    <span class="text-xs font-[700] leading-[15px] text-theme-primary">
                      {{ $t('referral.copy') }}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </article>
      </template>

      <!-- Commission Records 页面 -->
      <template v-else-if="activeTabKey === 'commission-records'">
        <!-- 佣金记录主容器 -->
        <section class="rounded-[12px] bg-bg-2 p-6">
          <!-- 顶部筛选区域 -->
          <div class="flex items-center justify-between gap-2">
            <!-- 搜索框 -->
            <label
              class="flex h-12 w-[330px] items-center gap-3 rounded-lg border border-opacity-10 bg-mask-20 px-3"
            >
              <!-- 搜索图标 -->
              <SearchIcon class="h-4 w-4 text-text-2" />

              <!-- 搜索输入框 -->
              <input
                v-model="searchKeyword"
                type="text"
                :placeholder="$t('referral.commissionRecords.searchPlaceholder')"
                class="min-w-0 flex-1 bg-transparent text-sm font-[700] leading-[17px] text-text-1 outline-none placeholder:text-text-3"
              />
            </label>

            <!-- 下拉筛选组 -->
            <div class="flex items-center gap-2">
              <!-- 游戏类型筛选 -->
              <CustomSelect
                class="w-[330px]"
                v-model="filters.settlementType"
                :options="settlementTypeOptions"
                :placeholder="$t('referral.commissionRecords.filterTitles.settlementType')"
              />

              <!-- 状态筛选 -->
              <CustomSelect
                class="w-[330px]"
                v-model="filters.status"
                :options="statusOptions"
                :placeholder="$t('referral.commissionRecords.filterTitles.status')"
              />
            </div>
          </div>

          <!-- 记录列表区域 -->
          <div class="mt-4 rounded-lg border border-opacity-5 bg-bg-2">
            <!-- 列表表头 -->
            <div class="grid h-12 grid-cols-4 items-center rounded-t-lg bg-bg-3 px-4">
              <!-- 表头: 账号 -->
              <p class="text-center text-sm font-[700] leading-[17px] text-text-1">
                {{ $t('referral.commissionRecords.table.account') }}
              </p>

              <!-- 表头: 结算周期 -->
              <p class="text-center text-sm font-[700] leading-[17px] text-text-1">
                {{ $t('referral.commissionRecords.table.settlementType') }}
              </p>

              <!-- 表头: 佣金 -->
              <p class="text-center text-sm font-[700] leading-[17px] text-text-1">
                {{ $t('referral.commissionRecords.table.commission') }}
              </p>

              <!-- 表头: 时间 -->
              <p class="text-center text-sm font-[700] leading-[17px] text-text-1">
                {{ $t('referral.commissionRecords.table.dateTime') }}
              </p>
            </div>

            <!-- 列表内容 -->
            <div v-if="currentPageRecords.length > 0">
              <!-- 列表行 -->
              <div
                v-for="item in currentPageRecords"
                :key="item.id"
                class="grid h-14 grid-cols-4 items-center border-b border-opacity-5 px-4 last:border-b-0"
              >
                <!-- 列: 账号 -->
                <p class="truncate text-center text-sm font-[700] leading-[17px] text-text-1">
                  {{ item.account }}
                </p>

                <!-- 列: 游戏 -->
                <p class="text-center text-sm font-[700] leading-[17px] text-text-1">
                  {{ item.settlementLabel }}
                </p>

                <!-- 列: 佣金 -->
                <p
                  class="text-center text-sm font-[700] leading-[17px]"
                  :class="getCommissionClass(item.commission)"
                >
                  {{ formatCommission(item.commission) }}
                </p>

                <!-- 列: 时间 -->
                <p class="truncate text-center text-sm font-[700] leading-[17px] text-text-2">
                  {{ item.time }}
                </p>
              </div>
            </div>

            <div
              v-else-if="commissionRecordsLoading"
              class="flex h-[240px] items-center justify-center text-sm font-[700] text-text-2"
            >
              {{ $t('common.loading') }}
            </div>

            <!-- 空状态 -->
            <div
              v-else
              class="flex h-[240px] items-center justify-center text-sm font-[700] text-text-2"
            >
              {{ $t('referral.commissionRecords.empty') }}
            </div>
          </div>

          <!-- 底部汇总与分页 -->
          <div class="mt-4 flex items-center justify-between gap-4">
            <!-- 汇总金额 -->
            <p class="text-sm font-[700] leading-[17px] text-text-1">
              {{
                $t('referral.commissionRecords.totalAmount', { amount: formatAmount(totalAmount) })
              }}
            </p>

            <!-- 分页条（参照 ResponsiveGridPager） -->
            <div class="flex items-center justify-center">
              <!-- 上一页按钮 -->
              <button
                type="button"
                class="px-[9px] h-[35px] rounded-tl-lg rounded-bl-lg text-xs flex items-center justify-center bg-[var(--color-background-level-2)]"
                :class="canPrev ? 'text-text-1' : 'text-text-2 opacity-50'"
                :disabled="!canPrev"
                @click="goPrev"
              >
                <LeftArrow class="w-2 h-2" />
              </button>

              <!-- 页码状态 -->
              <div
                class="mx-[2px] px-2.5 py-1 flex items-center bg-[var(--color-background-level-2)]"
              >
                <!-- 当前页码 -->
                <div
                  class="rounded-md flex items-center justify-center bg-[var(--color-background-level-3)] font-bold text-xs text-text-1 leading-[12px] px-[7px] py-[7px]"
                >
                  {{ page < 10 ? `0${page}` : page }}
                </div>

                <!-- of 文案 -->
                <span class="mx-[2px] text-xs text-text-2 lowercase">of</span>

                <!-- 总页码 -->
                <span
                  class="rounded-md flex items-center justify-center font-bold text-xs text-text-1 leading-[12px] px-[7px] py-[7px]"
                >
                  {{ totalPages }}
                </span>
              </div>

              <!-- 下一页按钮 -->
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
        </section>
      </template>

      <!-- Referral Records 页面 -->
      <template v-else-if="activeTabKey === 'referral-records'">
        <!-- 推荐记录主容器 -->
        <section class="rounded-[12px] bg-bg-2 p-6">
          <!-- 顶部筛选区域 -->
          <div class="flex items-center justify-between gap-2">
            <!-- 搜索框 -->
            <label
              class="flex h-12 w-[330px] items-center gap-3 rounded-lg border border-opacity-10 bg-mask-20 px-3"
            >
              <!-- 搜索图标 -->
              <SearchIcon class="h-4 w-4 text-text-2" />

              <!-- 搜索输入框 -->
              <input
                v-model="referralSearchKeyword"
                type="text"
                :placeholder="$t('referral.referralRecords.searchPlaceholder')"
                class="min-w-0 flex-1 bg-transparent text-sm font-[700] leading-[17px] text-text-1 outline-none placeholder:text-text-3"
              />
            </label>

            <!-- 下拉筛选组 -->
            <div class="flex items-center gap-2">
              <!-- 状态筛选 -->
              <CustomSelect
                class="w-[330px]"
                v-model="referralFilters.status"
                :options="referralStatusOptions"
                :placeholder="$t('referral.referralRecords.filterTitles.status')"
              />

              <!-- 时间筛选 -->
              <CustomSelect
                class="w-[330px]"
                v-model="referralFilters.time"
                :options="referralTimeOptions"
                :placeholder="$t('referral.referralRecords.filterTitles.time')"
              />
            </div>
          </div>

          <!-- 记录列表区域 -->
          <div class="mt-4 rounded-lg border border-opacity-5 bg-bg-2">
            <!-- 列表表头 -->
            <div class="grid h-12 grid-cols-3 items-center rounded-t-lg bg-bg-3 px-4">
              <!-- 表头: 账号 -->
              <p class="text-center text-sm font-[700] leading-[17px] text-text-1">Account</p>

              <!-- 表头: 状态 -->
              <p class="text-center text-sm font-[700] leading-[17px] text-text-1">Status</p>

              <!-- 表头: 时间 -->
              <p class="text-center text-sm font-[700] leading-[17px] text-text-1">Date & Time</p>
            </div>

            <!-- 列表内容 -->
            <div v-if="currentReferralPageRecords.length > 0">
              <!-- 列表行 -->
              <div
                v-for="item in currentReferralPageRecords"
                :key="item.id"
                class="grid h-14 grid-cols-3 items-center border-b border-opacity-5 px-4 last:border-b-0"
              >
                <!-- 列: 账号 -->
                <p class="truncate text-center text-sm font-[700] leading-[17px] text-text-1">
                  {{ item.account }}
                </p>

                <!-- 列: 状态 -->
                <p
                  class="text-center text-sm font-[700] leading-[17px]"
                  :class="getReferralStatusClass(item.status)"
                >
                  {{ getReferralStatusLabel(item.status) }}
                </p>

                <!-- 列: 时间 -->
                <p class="truncate text-center text-sm font-[700] leading-[17px] text-text-2">
                  {{ item.time }}
                </p>
              </div>
            </div>

            <!-- 空状态 -->
            <div
              v-else
              class="flex h-[240px] items-center justify-center text-sm font-[700] text-text-2"
            >
              {{ $t('referral.referralRecords.empty') }}
            </div>
          </div>

          <!-- 底部分页区域 -->
          <div class="mt-4 flex items-center justify-center">
            <!-- 分页条（参照 ResponsiveGridPager） -->
            <div class="flex items-center justify-center">
              <!-- 上一页按钮 -->
              <button
                type="button"
                class="px-[9px] h-[35px] rounded-tl-lg rounded-bl-lg text-xs flex items-center justify-center bg-[var(--color-background-level-2)]"
                :class="referralCanPrev ? 'text-text-1' : 'text-text-2 opacity-50'"
                :disabled="!referralCanPrev"
                @click="goReferralPrev"
              >
                <LeftArrow class="w-2 h-2" />
              </button>

              <!-- 页码状态 -->
              <div
                class="mx-[2px] px-2.5 py-1 flex items-center bg-[var(--color-background-level-2)]"
              >
                <!-- 当前页码 -->
                <div
                  class="rounded-md flex items-center justify-center bg-[var(--color-background-level-3)] font-bold text-xs text-text-1 leading-[12px] px-[7px] py-[7px]"
                >
                  {{ referralPage < 10 ? `0${referralPage}` : referralPage }}
                </div>

                <!-- of 文案 -->
                <span class="mx-[2px] text-xs text-text-2 lowercase">of</span>

                <!-- 总页码 -->
                <span
                  class="rounded-md flex items-center justify-center font-bold text-xs text-text-1 leading-[12px] px-[7px] py-[7px]"
                >
                  {{ referralTotalPages }}
                </span>
              </div>

              <!-- 下一页按钮 -->
              <button
                type="button"
                class="px-[9px] h-[35px] rounded-tr-lg rounded-br-lg text-xs bg-[var(--color-background-level-2)] flex items-center justify-center"
                :class="referralCanNext ? 'text-text-1' : 'text-text-2 opacity-50'"
                :disabled="!referralCanNext"
                @click="goReferralNext"
              >
                <RightArrow class="w-2 h-2" />
              </button>
            </div>
          </div>
        </section>
      </template>

      <!-- 其他 tab 占位内容 -->
      <template v-else>
        <!-- 占位容器 -->
        <section class="flex h-[320px] items-center justify-center rounded-[12px] bg-bg-2">
          <!-- 占位文案 -->
          <p class="text-sm font-[700] leading-[17px] text-text-2">
            {{ $t('referral.comingSoon') }}
          </p>
        </section>
      </template>
    </section>
  </section>
</template>

<script setup lang="ts">
import Api from '@/api'
import CustomSelect from '@/components/common/CustomSelect.vue'
import commissionHero from '@/static/img/referral/referral-commission-hero.png'
import DirectionIcon from '@/static/svg/direction-right.svg?component'
import LeftArrow from '@/static/svg/explore/left-arrow.svg?component'
import RightArrow from '@/static/svg/explore/right-arrow.svg?component'
import SearchIcon from '@/static/svg/search-icon.svg?component'
import { formatTimestamp } from '@/utils/date'
import QRCode from 'qrcode'
import { computed, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import type { ReferralMetric, ReferralTab } from './useReferralPage'

type ActiveTabKey = 'referral' | 'commission-records' | 'referral-records' | 'commission-rules'
type CommissionFilterStatus = 'all' | '0' | '1' | '2'
type SettlementFilterType = 'all' | '1' | '2' | '3'
type ReferralRecordStatus = 'valid' | 'invalid'
type ReferralRecordPeriod = 'today' | 'week' | 'month'
type ReferralFilterStatus = 'all' | ReferralRecordStatus
type ReferralFilterTime = 'all' | ReferralRecordPeriod

interface CommissionRecordItem {
  id: string
  account: string
  settlementType: number
  settlementLabel: string
  commission: number
  creationTime: number
  time: string
  status: number
  statusLabel: string
}

interface ReferralRecordItem {
  id: number
  account: string
  status: ReferralRecordStatus
  period: ReferralRecordPeriod
  time: string
}

interface Props {
  tabs: ReferralTab[]
  estimatedCommission: string
  referralMetrics: ReferralMetric[]
  referralLink: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'tab-click': [tabKey: string]
  claim: []
  'open-qr': []
  copy: []
  share: []
}>()

const { t } = useI18n()
const pcQrCodeCanvas = ref<HTMLCanvasElement>()

const searchKeyword = ref('')
const page = ref(1)
const pageSize = 10
const commissionTotalPages = ref(1)
const commissionTotal = ref(0)
const commissionRecordsLoading = ref(false)
const referralSearchKeyword = ref('')
const referralPage = ref(1)
const referralPageSize = 10

const filters = ref<{
  settlementType: SettlementFilterType
  status: CommissionFilterStatus
}>({
  settlementType: 'all',
  status: 'all'
})
const referralFilters = ref<{ status: ReferralFilterStatus; time: ReferralFilterTime }>({
  status: 'all',
  time: 'all'
})

const commissionRecords = ref<CommissionRecordItem[]>([])

const referralRecords = ref<ReferralRecordItem[]>([
  { id: 1, account: '972345678', status: 'valid', period: 'today', time: '12/18/2026 11:14:15 AM' },
  {
    id: 2,
    account: '972345679',
    status: 'invalid',
    period: 'today',
    time: '12/18/2026 10:11:23 AM'
  },
  { id: 3, account: '972345680', status: 'valid', period: 'week', time: '12/17/2026 09:45:51 AM' },
  { id: 4, account: '972345681', status: 'valid', period: 'week', time: '12/16/2026 08:20:12 AM' },
  {
    id: 5,
    account: '972345682',
    status: 'invalid',
    period: 'week',
    time: '12/15/2026 04:31:04 PM'
  },
  { id: 6, account: '972345683', status: 'valid', period: 'month', time: '12/12/2026 01:14:15 PM' },
  { id: 7, account: '972345684', status: 'valid', period: 'month', time: '12/10/2026 07:14:15 PM' },
  {
    id: 8,
    account: '972345685',
    status: 'invalid',
    period: 'month',
    time: '12/08/2026 06:14:15 PM'
  },
  { id: 9, account: '972345686', status: 'valid', period: 'month', time: '12/06/2026 03:14:15 PM' },
  {
    id: 10,
    account: '972345687',
    status: 'valid',
    period: 'month',
    time: '12/05/2026 12:14:15 PM'
  },
  {
    id: 11,
    account: '972345688',
    status: 'invalid',
    period: 'month',
    time: '12/04/2026 11:14:15 AM'
  },
  { id: 12, account: '972345689', status: 'valid', period: 'month', time: '12/03/2026 09:14:15 AM' }
])

const settlementTypeOptions = computed(() => [
  { label: t('referral.commissionRecords.filters.all'), value: 'all' },
  { label: t('referral.commissionRecords.filters.daily'), value: '1' },
  { label: t('referral.commissionRecords.filters.weekly'), value: '2' },
  { label: t('referral.commissionRecords.filters.monthly'), value: '3' }
])

const statusOptions = computed(() => [
  { label: t('referral.commissionRecords.filters.all'), value: 'all' },
  { label: t('referral.commissionRecords.filters.unclaimed'), value: '0' },
  { label: t('referral.commissionRecords.filters.claimed'), value: '1' },
  { label: t('referral.commissionRecords.filters.expired'), value: '2' }
])

const referralStatusOptions = computed(() => [
  { label: t('referral.referralRecords.filters.all'), value: 'all' },
  { label: t('referral.referralRecords.filters.valid'), value: 'valid' },
  { label: t('referral.referralRecords.filters.invalid'), value: 'invalid' }
])

const referralTimeOptions = computed(() => [
  { label: t('referral.referralRecords.filters.all'), value: 'all' },
  { label: t('referral.referralRecords.filters.today'), value: 'today' },
  { label: t('referral.referralRecords.filters.week'), value: 'week' },
  { label: t('referral.referralRecords.filters.month'), value: 'month' }
])

const activeTabKey = computed<ActiveTabKey>(() => {
  const activeTab = props.tabs.find(tab => tab.active)
  return (activeTab?.key as ActiveTabKey) ?? 'referral'
})

const filteredCommissionRecords = computed(() => {
  const keyword = searchKeyword.value.trim().toLowerCase()

  return commissionRecords.value.filter(item => {
    const matchesKeyword =
      keyword.length === 0 ||
      item.account.toLowerCase().includes(keyword) ||
      item.settlementLabel.toLowerCase().includes(keyword) ||
      item.statusLabel.toLowerCase().includes(keyword)

    return matchesKeyword
  })
})

const filteredReferralRecords = computed(() => {
  const keyword = referralSearchKeyword.value.trim().toLowerCase()

  return referralRecords.value.filter(item => {
    const matchesKeyword = keyword.length === 0 || item.account.toLowerCase().includes(keyword)
    const matchesStatus =
      referralFilters.value.status === 'all' || item.status === referralFilters.value.status
    const matchesTime =
      referralFilters.value.time === 'all' || item.period === referralFilters.value.time

    return matchesKeyword && matchesStatus && matchesTime
  })
})

const totalPages = computed(() => Math.max(1, commissionTotalPages.value))

const currentPageRecords = computed(() => filteredCommissionRecords.value)

const referralTotalPages = computed(() =>
  Math.max(1, Math.ceil(filteredReferralRecords.value.length / referralPageSize))
)

const currentReferralPageRecords = computed(() => {
  const start = (referralPage.value - 1) * referralPageSize
  return filteredReferralRecords.value.slice(start, start + referralPageSize)
})

const totalAmount = computed(() =>
  filteredCommissionRecords.value.reduce((sum, item) => sum + item.commission, 0)
)

const canPrev = computed(() => page.value > 1)
const canNext = computed(() => page.value < totalPages.value)
const referralCanPrev = computed(() => referralPage.value > 1)
const referralCanNext = computed(() => referralPage.value < referralTotalPages.value)

const getSettlementTypeLabel = (settlementType: number) => {
  const labelMap: Record<number, string> = {
    1: t('referral.commissionRecords.filters.daily'),
    2: t('referral.commissionRecords.filters.weekly'),
    3: t('referral.commissionRecords.filters.monthly')
  }

  return labelMap[settlementType] || '--'
}

const getCommissionStatusLabel = (status: number) => {
  const labelMap: Record<number, string> = {
    0: t('referral.commissionRecords.filters.unclaimed'),
    1: t('referral.commissionRecords.filters.claimed'),
    2: t('referral.commissionRecords.filters.expired')
  }

  return labelMap[status] || '--'
}

const mapCommissionRecord = (item: any): CommissionRecordItem => {
  const settlementType = Number(item?.settlementType ?? 0)
  const status = Number(item?.status ?? 0)
  const creationTime = Number(item?.creationTime ?? 0)

  return {
    id: String(item?.rowId ?? `${item?.userId ?? ''}-${creationTime}-${status}`),
    account: String(item?.userAccount || item?.userId || '--'),
    settlementType,
    settlementLabel: getSettlementTypeLabel(settlementType),
    commission: Number(item?.amount ?? 0),
    creationTime,
    time: formatTimestamp(creationTime),
    status,
    statusLabel: getCommissionStatusLabel(status)
  }
}

const fetchCommissionRecords = async (targetPage = 1) => {
  commissionRecordsLoading.value = true

  try {
    const param: Record<string, unknown> = {
      current: targetPage,
      size: pageSize
    }

    if (filters.value.settlementType !== 'all') {
      param.settlementType = Number(filters.value.settlementType)
    }

    if (filters.value.status !== 'all') {
      param.status = Number(filters.value.status)
    }

    const response = await Api.agent.queryCommissionRecords(param, {
      channelId: '3'
    })
    const result = response?.result || {}

    commissionRecords.value = Array.isArray(result.records)
      ? result.records.map(mapCommissionRecord)
      : []
    page.value = Number(result.current || targetPage)
    commissionTotalPages.value = Number(result.pages || 1)
    commissionTotal.value = Number(result.total || 0)
  } catch (error) {
    console.error(error)
    commissionRecords.value = []
    commissionTotalPages.value = 1
    commissionTotal.value = 0
  } finally {
    commissionRecordsLoading.value = false
  }
}

// 生成 PC 端代理邀请二维码。
const generatePcQRCode = async () => {
  if (!pcQrCodeCanvas.value) return

  try {
    await QRCode.toCanvas(pcQrCodeCanvas.value, props.referralLink, {
      width: 162,
      margin: 0,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    })
  } catch (error) {
    console.error(error)
  }
}

// 格式化金额文本。
const formatAmount = (amount: number) => {
  return amount.toFixed(2)
}

// 格式化佣金文本。
const formatCommission = (amount: number) => {
  return `${amount >= 0 ? '+' : ''}${amount.toFixed(2)}`
}

// 获取佣金颜色类名。
const getCommissionClass = (amount: number) => {
  return amount >= 0 ? 'text-theme-primary' : 'text-secondary-2'
}

// 获取推荐状态文案。
const getReferralStatusLabel = (status: ReferralRecordStatus) => {
  return t(`referral.referralRecords.filters.${status}`)
}

// 获取推荐状态颜色类名。
const getReferralStatusClass = (status: ReferralRecordStatus) => {
  return status === 'valid' ? 'text-theme-primary' : 'text-secondary-2'
}

// 设置分页页码。
const setPage = async (targetPage: number) => {
  const nextPage = Math.min(Math.max(1, targetPage), Math.max(1, totalPages.value))
  if (nextPage === page.value) return
  await fetchCommissionRecords(nextPage)
}

// 切换到上一页。
const goPrev = () => {
  void setPage(page.value - 1)
}

// 切换到下一页。
const goNext = () => {
  void setPage(page.value + 1)
}

// 设置推荐记录分页页码。
const setReferralPage = (targetPage: number) => {
  const nextPage = Math.min(Math.max(1, targetPage), Math.max(1, referralTotalPages.value))
  if (nextPage === referralPage.value) return
  referralPage.value = nextPage
}

// 切换推荐记录到上一页。
const goReferralPrev = () => {
  setReferralPage(referralPage.value - 1)
}

// 切换推荐记录到下一页。
const goReferralNext = () => {
  setReferralPage(referralPage.value + 1)
}

// 处理标签点击。
const handleTabClick = (tabKey: string) => {
  emit('tab-click', tabKey)
}

// 处理领取按钮点击。
const handleClaim = () => {
  emit('claim')
}

// 处理查看二维码点击。
const handleOpenQr = () => {
  emit('open-qr')
}

// 处理复制按钮点击。
const handleCopy = () => {
  emit('copy')
}

// 处理分享按钮点击。
const handleShare = () => {
  emit('share')
}

// 监听筛选条件变化后重置页码。
watch([() => filters.value.settlementType, () => filters.value.status], () => {
  void fetchCommissionRecords(1)
})

watch(searchKeyword, () => {
  page.value = 1
})

// 监听推荐记录筛选条件变化后重置页码。
watch(
  [referralSearchKeyword, () => referralFilters.value.status, () => referralFilters.value.time],
  () => {
    referralPage.value = 1
  }
)

// 监听总页数变化后校正当前页码。
watch(totalPages, nextTotalPages => {
  if (page.value > nextTotalPages) {
    page.value = nextTotalPages
  }
})

// 监听推荐记录总页数变化后校正当前页码。
watch(referralTotalPages, nextTotalPages => {
  if (referralPage.value > nextTotalPages) {
    referralPage.value = nextTotalPages
  }
})

// 监听链接变化后刷新 PC 二维码。
watch(
  () => props.referralLink,
  () => {
    generatePcQRCode()
  }
)

// 页面挂载后初始化 PC 二维码。
onMounted(() => {
  generatePcQRCode()
  void fetchCommissionRecords(1)
})
</script>
