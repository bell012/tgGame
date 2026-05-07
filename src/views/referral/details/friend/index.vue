<template>
  <!-- 好友明细页根容器 -->
  <div>
    <!-- H5 好友明细页容器 -->
    <div
      v-if="isReady && isMobile"
      class="fixed inset-0 flex flex-col overflow-hidden bg-bg-1 sm:hidden"
    >
      <!-- H5 头部导航栏 -->
      <H5Header
        :title="t('referral.friendDetailPage.title')"
        :show-sort="true"
        :right-icon="RuleIcon"
        @sort="handleGoRules"
      />

      <!-- H5 滚动内容区域 -->
      <div class="flex-1 overflow-y-auto">
        <!-- H5 好友明细页内容 -->
        <ReferralFriendDetailPageContent
          :active-date-tab="activeDateTab"
          :active-stats-tab="activeStatsTab"
          :avatar-alt="t('referral.detailsPage.avatarAlt')"
          :empty-alt="t('common.noData')"
          :empty-dark-image="emptyDarkImage"
          :empty-light-image="emptyLightImage"
          :empty-text="t('common.noData')"
          :last-login-time-label="t('referral.friendDetailPage.labels.lastLoginTime')"
          :member-info="memberInfo"
          :name-label="t('referral.friendDetailPage.labels.name')"
          :total-title="t('referral.friendDetailPage.total')"
          :user-id-label="t('referral.friendDetailPage.labels.userId')"
          :date-tabs="dateTabs"
          :stats-tabs="statsTabs"
          :summary-list="currentSummaryList"
          :table-columns="currentTableColumns"
          :table-list="currentTableList"
          @change-date-tab="handleChangeDateTab"
          @change-stats-tab="handleChangeStatsTab"
          @copy-account="handleCopyAccount"
        />
      </div>
    </div>

    <!-- PC 好友明细页容器 -->
    <div v-else-if="isReady" class="min-h-screen bg-bg-1">
      <!-- PC 好友明细页布局 -->
      <PcLayout
        :page-title="t('referral.friendDetailPage.title')"
        :active-date-tab="activeDateTab"
        :active-stats-tab="activeStatsTab"
        :avatar-alt="t('referral.detailsPage.avatarAlt')"
        :empty-alt="t('common.noData')"
        :empty-dark-image="emptyDarkImage"
        :empty-light-image="emptyLightImage"
        :empty-text="t('common.noData')"
        :last-login-time-label="t('referral.friendDetailPage.labels.lastLoginTime')"
        :member-info="memberInfo"
        :name-label="t('referral.friendDetailPage.labels.name')"
        :total-title="t('referral.friendDetailPage.total')"
        :user-id-label="t('referral.friendDetailPage.labels.userId')"
        :date-tabs="dateTabs"
        :stats-tabs="statsTabs"
        :summary-list="currentSummaryList"
        :table-columns="currentTableColumns"
        :table-list="currentTableList"
        @close="handleClosePopup"
        @change-date-tab="handleChangeDateTab"
        @change-stats-tab="handleChangeStatsTab"
        @copy-account="handleCopyAccount"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import Api from '@/api'
import H5Header from '@/components/common/H5Header.vue'
import { useIsMobile } from '@/composables/useMediaQuery'
import RuleIcon from '@/static/svg/rule.svg?component'
import { copyTextWithFallback } from '@/utils/clipboard'
import { navigateTo } from '@/utils/router'
import { showToast } from 'vant'
import { computed, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import ReferralFriendDetailPageContent from './components/ReferralFriendDetailPageContent.vue'
import PcLayout from './pc-layout.vue'
import {
  buildReferralFriendDetailDateRange,
  createReferralFriendDetailDateTabs,
  createReferralFriendDetailGameColumns,
  createReferralFriendDetailGameRows,
  createReferralFriendDetailGameSummary,
  createReferralFriendDetailMember,
  createReferralFriendDetailTopUpRows,
  createReferralFriendDetailStatsTabs,
  createReferralFriendDetailTopUpColumns,
  createReferralFriendDetailTopUpSummary,
  getReferralFriendDetailEmptyDarkImage,
  getReferralFriendDetailEmptyLightImage,
  type ReferralFriendDetailDateTabValue,
  type ReferralFriendDetailGameStatItem,
  type ReferralFriendDetailMemberResult,
  type ReferralFriendDetailTopUpStatResult,
  type ReferralFriendDetailStatsTabValue
} from './shared'

const { t } = useI18n()
const route = useRoute()
const isMobile = useIsMobile()
const isReady = ref(false)
const activeDateTab = ref<ReferralFriendDetailDateTabValue>('today')
const activeStatsTab = ref<ReferralFriendDetailStatsTabValue>('game-stats')
const memberDetailResult = ref<ReferralFriendDetailMemberResult | null>(null)
const gameStatsResult = ref<ReferralFriendDetailGameStatItem[]>([])
const topUpStatsResult = ref<ReferralFriendDetailTopUpStatResult | null>(null)
const emptyDarkImage = getReferralFriendDetailEmptyDarkImage()
const emptyLightImage = getReferralFriendDetailEmptyLightImage()
const currentAgentChannelId = computed(() => (isMobile.value ? '4' : '3'))

/**
 * 从路由参数中解析好友 rowId。
 */
const userIdFromRoute = computed(() => {
  const userId = route.query.userId ?? route.query.id
  return typeof userId === 'string' && userId ? userId : undefined
})

/**
 * 从路由参数中解析好友 VIP 等级。
 */
const vipIdFromRoute = computed(() => {
  const vipId = route.query.vipId
  const nextVipId = Number(vipId)

  return Number.isFinite(nextVipId) ? nextVipId : undefined
})

/**
 * 生成好友基础信息。
 */
const memberInfo = computed(() =>
  createReferralFriendDetailMember(memberDetailResult.value, vipIdFromRoute.value)
)

/**
 * 生成日期筛选标签。
 */
const dateTabs = computed(() => createReferralFriendDetailDateTabs(t))

/**
 * 生成统计类型标签。
 */
const statsTabs = computed(() => createReferralFriendDetailStatsTabs(t))

/**
 * 生成当前汇总数据。
 */
const currentSummaryList = computed(() =>
  activeStatsTab.value === 'game-stats'
    ? createReferralFriendDetailGameSummary(t, gameStatsResult.value)
    : createReferralFriendDetailTopUpSummary(t, topUpStatsResult.value)
)

/**
 * 生成当前表头数据。
 */
const currentTableColumns = computed(() =>
  activeStatsTab.value === 'game-stats'
    ? createReferralFriendDetailGameColumns(t)
    : createReferralFriendDetailTopUpColumns(t)
)

/**
 * 生成当前表格数据。
 */
const currentTableList = computed(() =>
  activeStatsTab.value === 'game-stats'
    ? createReferralFriendDetailGameRows(t, gameStatsResult.value)
    : createReferralFriendDetailTopUpRows(topUpStatsResult.value)
)

/**
 * 处理页面初始化完成状态，避免首屏端态抖动。
 */
onMounted(() => {
  isReady.value = true
})

watch(
  () => [userIdFromRoute.value, currentAgentChannelId.value] as const,
  () => {
    void fetchReferralFriendDetailData()
  },
  {
    immediate: true
  }
)

/**
 * 获取好友详情页基础信息和统计数据。
 */
async function fetchReferralFriendDetailData() {
  const userId = userIdFromRoute.value

  if (!userId) {
    memberDetailResult.value = null
    gameStatsResult.value = []
    topUpStatsResult.value = null
    return
  }

  try {
    const memberResponse = await Api.user.getSubMemberById({
      rowId: userId
    })

    memberDetailResult.value = memberResponse?.result ?? null
    await fetchReferralFriendDetailStats()
  } catch (error) {
    console.error('[referral-friend-detail] fetch member detail failed:', error)
    memberDetailResult.value = null
    gameStatsResult.value = []
    topUpStatsResult.value = null
  }
}

/**
 * 获取好友详情页当前日期下的统计数据。
 */
async function fetchReferralFriendDetailStats() {
  const userId = String(memberDetailResult.value?.rowId ?? userIdFromRoute.value ?? '')
  const userAccount = String(memberDetailResult.value?.memberId ?? '')

  if (!userId || !userAccount) {
    gameStatsResult.value = []
    topUpStatsResult.value = null
    return
  }

  const dateRange = buildReferralFriendDetailDateRange(activeDateTab.value)
  const queryParam = {
    userAccount,
    userId,
    ...dateRange
  }

  try {
    const [gameResponse, topUpResponse] = await Promise.all([
      Api.agent.queryReferralFriendGameStats(queryParam, {
        channelId: currentAgentChannelId.value
      }),
      Api.agent.queryReferralFriendTopUpStats(queryParam, {
        channelId: currentAgentChannelId.value
      })
    ])

    gameStatsResult.value = Array.isArray(gameResponse?.result) ? gameResponse.result : []
    topUpStatsResult.value =
      topUpResponse?.result && typeof topUpResponse.result === 'object'
        ? topUpResponse.result
        : null
  } catch (error) {
    console.error('[referral-friend-detail] fetch friend stats failed:', error)
    gameStatsResult.value = []
    topUpStatsResult.value = null
  }
}

/**
 * 处理跳转规则页。
 */
const handleGoRules = () => {
  navigateTo('/referral/rules')
}

/**
 * 处理关闭 PC 好友明细弹窗。
 */
const handleClosePopup = () => {
  navigateTo('/referral/details')
}

/**
 * 处理复制会员账号。
 */
const handleCopyAccount = async () => {
  const copied = await copyTextWithFallback(memberInfo.value.account)

  showToast({
    message: copied ? t('referral.copySuccess') : t('referral.copyFailed'),
    type: copied ? 'success' : 'fail'
  })
}

/**
 * 处理切换日期筛选。
 */
const handleChangeDateTab = (value: ReferralFriendDetailDateTabValue) => {
  activeDateTab.value = value
  void fetchReferralFriendDetailStats()
}

/**
 * 处理切换统计类型。
 */
const handleChangeStatsTab = (value: ReferralFriendDetailStatsTabValue) => {
  activeStatsTab.value = value
}
</script>
