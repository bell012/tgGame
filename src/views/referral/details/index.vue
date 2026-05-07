<template>
  <!-- 推荐详情页根容器 -->
  <div>
    <!-- H5 推荐详情页容器 -->
    <div
      v-if="isReady && isMobile"
      class="fixed inset-0 flex flex-col overflow-hidden bg-bg-1 sm:hidden"
    >
      <!-- H5 头部导航栏 -->
      <H5Header
        :title="t('referral.detailsPage.title')"
        :show-sort="true"
        :right-icon="RuleIcon"
        @sort="handleGoRules"
      />

      <!-- H5 滚动内容区域 -->
      <div class="flex-1 overflow-y-auto">
        <!-- H5 推荐详情页内容 -->
        <ReferralDetailsPageContent
          :active-tab="activeTab"
          :date-label="currentDateLabel"
          :filter-text="t('referral.detailsPage.filter')"
          :deposit-label="t('referral.detailsPage.labels.deposit')"
          :valid-bets-label="t('referral.detailsPage.labels.validBets')"
          :detail-text="t('referral.detailsPage.detailText')"
          :empty-action-text="t('referral.detailsPage.showNow')"
          :empty-text="t('common.noData')"
          :empty-alt="t('common.noData')"
          :avatar-alt="t('referral.detailsPage.avatarAlt')"
          :empty-dark-image="emptyDarkImage"
          :empty-light-image="emptyLightImage"
          :tabs="tabs"
          :summary-list="summaryList"
          :friends-list="visibleFriendsList"
          @change-tab="handleChangeTab"
          @open-date-picker="handleOpenDatePicker"
          @open-filter="handleOpenFilter"
          @go-friend-detail="handleGoFriendDetail"
          @show-poster="handleShowInvitePoster"
        />
      </div>
    </div>

    <!-- PC 推荐详情页容器 -->
    <div v-else-if="isReady" class="min-h-screen bg-bg-1">
      <!-- PC 推荐详情页布局 -->
      <PcLayout
        :page-title="t('referral.detailsPage.title')"
        :active-tab="activeTab"
        :date-label="currentDateLabel"
        :filter-text="t('referral.detailsPage.filter')"
        :deposit-label="t('referral.detailsPage.labels.deposit')"
        :valid-bets-label="t('referral.detailsPage.labels.validBets')"
        :detail-text="t('referral.detailsPage.detailText')"
        :empty-action-text="t('referral.detailsPage.showNow')"
        :empty-text="t('common.noData')"
        :empty-alt="t('common.noData')"
        :avatar-alt="t('referral.detailsPage.avatarAlt')"
        :empty-dark-image="emptyDarkImage"
        :empty-light-image="emptyLightImage"
        :tabs="tabs"
        :summary-list="summaryList"
        :friends-list="visibleFriendsList"
        @change-tab="handleChangeTab"
        @open-date-picker="handleOpenDatePicker"
        @open-filter="handleOpenFilter"
        @go-friend-detail="handleGoFriendDetail"
        @show-poster="handleShowInvitePoster"
      />
    </div>

    <!-- 邀请海报弹窗 -->
    <InvitePosterPopup
      v-model="showInvitePosterPopup"
      :images="invitePosterImages"
      :save-text="t('referral.invitePoster.saveImage')"
      :copy-link-text="t('referral.invitePoster.copyLink')"
      :invite-text="t('referral.invitePoster.inviteNow')"
      :close-text="t('referral.closeDialog')"
      :image-alt="t('referral.invitePoster.posterAlt')"
      @save="handleSavePosterImage"
      @copy-link="handleCopyPosterLink"
      @invite="handleInviteNow"
    />

    <!-- H5 日期筛选弹窗 -->
    <FilterPopup
      v-if="isMobile"
      v-model:visible="showMobileDateFilterPopup"
      v-model="mobileDateFilterValues"
      :filter-groups="mobileDateFilterGroups"
      @apply="handleMobileDateFilterApply"
    />

    <!-- PC 好友详情弹窗 -->
    <FriendDetailPcPopup
      v-if="!isMobile && showFriendDetailPopup"
      :page-title="t('referral.friendDetailPage.title')"
      :active-date-tab="friendActiveDateTab"
      :active-stats-tab="friendActiveStatsTab"
      :avatar-alt="t('referral.detailsPage.avatarAlt')"
      :empty-alt="t('common.noData')"
      :empty-dark-image="friendEmptyDarkImage"
      :empty-light-image="friendEmptyLightImage"
      :empty-text="t('common.noData')"
      :last-login-time-label="t('referral.friendDetailPage.labels.lastLoginTime')"
      :member-info="friendMemberInfo"
      :name-label="t('referral.friendDetailPage.labels.name')"
      :total-title="t('referral.friendDetailPage.total')"
      :user-id-label="t('referral.friendDetailPage.labels.userId')"
      :date-tabs="friendDateTabs"
      :stats-tabs="friendStatsTabs"
      :summary-list="friendCurrentSummaryList"
      :table-columns="friendCurrentTableColumns"
      :table-list="friendCurrentTableList"
      @close="handleCloseFriendDetailPopup"
      @change-date-tab="handleChangeFriendDateTab"
      @change-stats-tab="handleChangeFriendStatsTab"
      @copy-account="handleCopyFriendAccount"
    />
  </div>
</template>

<script setup lang="ts">
import Api from '@/api'
import FilterPopup, { type FilterGroup } from '@/components/common/FilterPopup.vue'
import H5Header from '@/components/common/H5Header.vue'
import { useIsMobile } from '@/composables/useMediaQuery'
import RuleIcon from '@/static/svg/rule.svg?component'
import { copyTextWithFallback } from '@/utils/clipboard'
import { navigateTo } from '@/utils/router'
import { globalShowToast } from '@/utils/toast'
import { computed, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { getDefaultReferralLink } from '../shared'
import FriendDetailPcPopup from './friend/pc-layout.vue'
import {
  buildReferralFriendDetailDateRange,
  createReferralFriendDetailDateTabs,
  createReferralFriendDetailGameColumns,
  createReferralFriendDetailGameRows,
  createReferralFriendDetailGameSummary,
  createReferralFriendDetailMember,
  createReferralFriendDetailStatsTabs,
  createReferralFriendDetailTopUpColumns,
  createReferralFriendDetailTopUpRows,
  createReferralFriendDetailTopUpSummary,
  getReferralFriendDetailEmptyDarkImage,
  getReferralFriendDetailEmptyLightImage,
  type ReferralFriendDetailDateTabValue,
  type ReferralFriendDetailGameStatItem,
  type ReferralFriendDetailMemberResult,
  type ReferralFriendDetailStatsTabValue,
  type ReferralFriendDetailTopUpStatResult
} from './friend/shared'
import InvitePosterPopup from './components/InvitePosterPopup.vue'
import ReferralDetailsPageContent from './components/ReferralDetailsPageContent.vue'
import PcLayout from './pc-layout.vue'
import {
  buildReferralDetailsDateRange,
  createDefaultReferralDetailsFilterValues,
  createReferralDetailsDateOptions,
  createReferralDetailsFriends,
  createReferralDetailsSummaryList,
  createReferralDetailsTabs,
  getReferralDetailsDateLabel,
  getReferralDetailsEmptyDarkImage,
  getReferralDetailsEmptyLightImage,
  getReferralDetailsInvitePosterImages,
  normalizeReferralDetailsFilterValues,
  type ReferralDetailsFilterValues,
  type ReferralDetailsFriendItem,
  type ReferralDetailsStatsResult,
  type ReferralDetailsTabValue
} from './shared'

const { t } = useI18n()
const isMobile = useIsMobile()
const isReady = ref(false)
const activeTab = ref<ReferralDetailsTabValue>('friends')
const showInvitePosterPopup = ref(false)
const showMobileDateFilterPopup = ref(false)
const showFriendDetailPopup = ref(false)
const selectedFriendUserId = ref<string>()
const selectedFriendVipId = ref<number>()
const friendActiveDateTab = ref<ReferralFriendDetailDateTabValue>('today')
const friendActiveStatsTab = ref<ReferralFriendDetailStatsTabValue>('game-stats')
const friendMemberDetailResult = ref<ReferralFriendDetailMemberResult | null>(null)
const friendGameStatsResult = ref<ReferralFriendDetailGameStatItem[]>([])
const friendTopUpStatsResult = ref<ReferralFriendDetailTopUpStatResult | null>(null)
const mobileDateFilterValues = ref<Record<string, string | string[]>>({
  ...createDefaultReferralDetailsFilterValues()
})
const appliedDateFilterValues = ref<ReferralDetailsFilterValues>(
  createDefaultReferralDetailsFilterValues()
)
const detailsStatsResult = ref<ReferralDetailsStatsResult | null>(null)
const emptyDarkImage = getReferralDetailsEmptyDarkImage()
const emptyLightImage = getReferralDetailsEmptyLightImage()
const invitePosterImages = getReferralDetailsInvitePosterImages()
const friendEmptyDarkImage = getReferralFriendDetailEmptyDarkImage()
const friendEmptyLightImage = getReferralFriendDetailEmptyLightImage()
const referralLink = getDefaultReferralLink()
const currentAgentChannelId = computed(() => (isMobile.value ? '4' : '3'))

/**
 * 生成推荐详情页标签数据。
 */
const tabs = computed(() => createReferralDetailsTabs(t))

/**
 * 生成 H5 日期筛选弹窗配置。
 */
const mobileDateFilterGroups = computed<FilterGroup[]>(() => [
  {
    key: 'time',
    title: t('referral.detailsPage.dateSelection'),
    options: createReferralDetailsDateOptions(t).map(item => ({
      label: item.label,
      value: item.value
    }))
  }
])

/**
 * 生成推荐详情页当前日期文案。
 */
const currentDateLabel = computed(() =>
  getReferralDetailsDateLabel(t, appliedDateFilterValues.value.time)
)

/**
 * 生成推荐详情页统计数据。
 */
const summaryList = computed(() => createReferralDetailsSummaryList(t, detailsStatsResult.value))

/**
 * 生成推荐详情页好友列表数据。
 */
const friendsList = computed(() => createReferralDetailsFriends(t, detailsStatsResult.value))

/**
 * 根据当前标签返回展示列表。
 */
const visibleFriendsList = computed(() => (activeTab.value === 'friends' ? friendsList.value : []))

/**
 * 生成当前弹窗好友基础信息。
 */
const friendMemberInfo = computed(() =>
  createReferralFriendDetailMember(friendMemberDetailResult.value, selectedFriendVipId.value)
)

/**
 * 生成弹窗日期筛选标签。
 */
const friendDateTabs = computed(() => createReferralFriendDetailDateTabs(t))

/**
 * 生成弹窗统计类型标签。
 */
const friendStatsTabs = computed(() => createReferralFriendDetailStatsTabs(t))

/**
 * 生成弹窗当前汇总数据。
 */
const friendCurrentSummaryList = computed(() =>
  friendActiveStatsTab.value === 'game-stats'
    ? createReferralFriendDetailGameSummary(t, friendGameStatsResult.value)
    : createReferralFriendDetailTopUpSummary(t, friendTopUpStatsResult.value)
)

/**
 * 生成弹窗当前表头数据。
 */
const friendCurrentTableColumns = computed(() =>
  friendActiveStatsTab.value === 'game-stats'
    ? createReferralFriendDetailGameColumns(t)
    : createReferralFriendDetailTopUpColumns(t)
)

/**
 * 生成弹窗当前表格数据。
 */
const friendCurrentTableList = computed(() =>
  friendActiveStatsTab.value === 'game-stats'
    ? createReferralFriendDetailGameRows(t, friendGameStatsResult.value)
    : createReferralFriendDetailTopUpRows(friendTopUpStatsResult.value)
)

/**
 * 处理页面初始化完成状态，避免首屏端态抖动。
 */
onMounted(() => {
  isReady.value = true
})

watch(
  () => currentAgentChannelId.value,
  () => {
    void fetchReferralDetailsStats()
  },
  {
    immediate: true
  }
)

/**
 * 获取推荐详情页团队成员统计。
 */
async function fetchReferralDetailsStats() {
  try {
    const response = await Api.agent.queryReferralDetailsStats(
      buildReferralDetailsDateRange(appliedDateFilterValues.value.time),
      {
        channelId: currentAgentChannelId.value
      }
    )

    detailsStatsResult.value = response?.result ?? null
  } catch (error) {
    console.error('[referral-details] fetch referral details stats failed:', error)
    detailsStatsResult.value = null
  }
}

/**
 * 获取 PC 弹窗好友详情基础信息和统计数据。
 */
async function fetchSelectedFriendDetailData() {
  const userId = selectedFriendUserId.value

  if (!userId) {
    friendMemberDetailResult.value = null
    friendGameStatsResult.value = []
    friendTopUpStatsResult.value = null
    return
  }

  try {
    const memberResponse = await Api.user.getSubMemberById(
      {
        rowId: userId
      },
      {
        showErrorToast: false
      }
    )

    friendMemberDetailResult.value = memberResponse?.result ?? null
    await fetchSelectedFriendDetailStats()
  } catch (error) {
    console.error('[referral-details] fetch selected friend detail failed:', error)
    friendMemberDetailResult.value = null
    friendGameStatsResult.value = []
    friendTopUpStatsResult.value = null
  }
}

/**
 * 获取 PC 弹窗好友详情当前日期下的统计数据。
 */
async function fetchSelectedFriendDetailStats() {
  const userId = String(friendMemberDetailResult.value?.rowId ?? selectedFriendUserId.value ?? '')
  const userAccount = String(friendMemberDetailResult.value?.memberId ?? '')

  if (!userId || !userAccount) {
    friendGameStatsResult.value = []
    friendTopUpStatsResult.value = null
    return
  }

  const queryParam = {
    userAccount,
    userId,
    ...buildReferralFriendDetailDateRange(friendActiveDateTab.value)
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

    friendGameStatsResult.value = Array.isArray(gameResponse?.result) ? gameResponse.result : []
    friendTopUpStatsResult.value =
      topUpResponse?.result && typeof topUpResponse.result === 'object'
        ? topUpResponse.result
        : null
  } catch (error) {
    console.error('[referral-details] fetch selected friend stats failed:', error)
    friendGameStatsResult.value = []
    friendTopUpStatsResult.value = null
  }
}

/**
 * 处理跳转规则页。
 */
const handleGoRules = () => {
  navigateTo('/referral/rules')
}

/**
 * 处理切换标签。
 */
const handleChangeTab = (value: ReferralDetailsTabValue) => {
  activeTab.value = value
}

/**
 * 处理打开日期选择器。
 */
const handleOpenDatePicker = () => {
  if (isMobile.value) {
    showMobileDateFilterPopup.value = true
    return
  }

  globalShowToast({
    message: t('referral.comingSoon'),
    type: 'success'
  })
}

/**
 * 处理打开筛选弹窗。
 */
const handleOpenFilter = () => {
  if (isMobile.value) {
    showMobileDateFilterPopup.value = true
    return
  }

  globalShowToast({
    message: t('referral.comingSoon'),
    type: 'success'
  })
}

/**
 * 处理应用 H5 日期筛选。
 */
const handleMobileDateFilterApply = async (values: Record<string, string | string[]>) => {
  mobileDateFilterValues.value = {
    ...createDefaultReferralDetailsFilterValues(),
    ...values
  }
  appliedDateFilterValues.value = normalizeReferralDetailsFilterValues(values)
  await fetchReferralDetailsStats()
}

/**
 * 处理进入好友详情。
 */
const handleGoFriendDetail = (item: ReferralDetailsFriendItem) => {
  if (!isMobile.value) {
    selectedFriendUserId.value = item.userId
    selectedFriendVipId.value = item.vipId
    friendActiveDateTab.value = 'today'
    friendActiveStatsTab.value = 'game-stats'
    showFriendDetailPopup.value = true
    void fetchSelectedFriendDetailData()
    return
  }

  navigateTo('/referral/details/friend', {
    query: {
      userId: item.userId,
      vipId: String(item.vipId ?? '')
    }
  })
}

/**
 * 处理展示邀请海报弹窗。
 */
const handleShowInvitePoster = () => {
  showInvitePosterPopup.value = true
}

/**
 * 处理保存当前海报图片。
 */
const handleSavePosterImage = () => {
  globalShowToast({
    message: t('referral.invitePoster.saveHint'),
    type: 'success'
  })
}

/**
 * 处理复制推荐链接。
 */
const handleCopyPosterLink = async () => {
  const copied = await copyTextWithFallback(referralLink)

  globalShowToast({
    message: copied ? t('referral.copySuccess') : t('referral.copyFailed'),
    type: copied ? 'success' : 'fail'
  })
}

/**
 * 处理立即邀请。
 */
const handleInviteNow = () => {
  showInvitePosterPopup.value = false
  navigateTo('/referral')
}

/**
 * 处理关闭好友详情弹窗。
 */
const handleCloseFriendDetailPopup = () => {
  showFriendDetailPopup.value = false
  selectedFriendUserId.value = undefined
  selectedFriendVipId.value = undefined
  friendMemberDetailResult.value = null
  friendGameStatsResult.value = []
  friendTopUpStatsResult.value = null
}

/**
 * 处理切换好友详情日期筛选。
 */
const handleChangeFriendDateTab = (value: ReferralFriendDetailDateTabValue) => {
  friendActiveDateTab.value = value
  void fetchSelectedFriendDetailStats()
}

/**
 * 处理切换好友详情统计类型。
 */
const handleChangeFriendStatsTab = (value: ReferralFriendDetailStatsTabValue) => {
  friendActiveStatsTab.value = value
}

/**
 * 处理复制好友账号。
 */
const handleCopyFriendAccount = async () => {
  const copied = await copyTextWithFallback(friendMemberInfo.value.account)

  globalShowToast({
    message: copied ? t('referral.copySuccess') : t('referral.copyFailed'),
    type: copied ? 'success' : 'fail'
  })
}
</script>
