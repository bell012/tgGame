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
          :date-label="t('referral.detailsPage.date.today')"
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
        :date-label="t('referral.detailsPage.date.today')"
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
import H5Header from '@/components/common/H5Header.vue'
import { useIsMobile } from '@/composables/useMediaQuery'
import RuleIcon from '@/static/svg/rule.svg?component'
import { copyTextWithFallback } from '@/utils/clipboard'
import { navigateTo } from '@/utils/router'
import { globalShowToast } from '@/utils/toast'
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { getDefaultReferralLink } from '../shared'
import FriendDetailPcPopup from './friend/pc-layout.vue'
import {
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
  type ReferralFriendDetailStatsTabValue
} from './friend/shared'
import InvitePosterPopup from './components/InvitePosterPopup.vue'
import ReferralDetailsPageContent from './components/ReferralDetailsPageContent.vue'
import PcLayout from './pc-layout.vue'
import {
  createReferralDetailsFriends,
  createReferralDetailsSummaryList,
  createReferralDetailsTabs,
  getReferralDetailsEmptyDarkImage,
  getReferralDetailsEmptyLightImage,
  getReferralDetailsInvitePosterImages,
  type ReferralDetailsFriendItem,
  type ReferralDetailsTabValue
} from './shared'

const { t } = useI18n()
const isMobile = useIsMobile()
const isReady = ref(false)
const activeTab = ref<ReferralDetailsTabValue>('friends')
const showInvitePosterPopup = ref(false)
const showFriendDetailPopup = ref(false)
const selectedFriendAccount = ref<string>()
const friendActiveDateTab = ref<ReferralFriendDetailDateTabValue>('today')
const friendActiveStatsTab = ref<ReferralFriendDetailStatsTabValue>('game-stats')
const emptyDarkImage = getReferralDetailsEmptyDarkImage()
const emptyLightImage = getReferralDetailsEmptyLightImage()
const invitePosterImages = getReferralDetailsInvitePosterImages()
const friendEmptyDarkImage = getReferralFriendDetailEmptyDarkImage()
const friendEmptyLightImage = getReferralFriendDetailEmptyLightImage()
const referralLink = getDefaultReferralLink()

/**
 * 生成推荐详情页标签数据。
 */
const tabs = computed(() => createReferralDetailsTabs(t))

/**
 * 生成推荐详情页统计数据。
 */
const summaryList = computed(() => createReferralDetailsSummaryList(t))

/**
 * 生成推荐详情页好友列表示例数据。
 */
const friendsList = computed(() => createReferralDetailsFriends(t))

/**
 * 根据当前标签返回展示列表。
 */
const visibleFriendsList = computed(() => (activeTab.value === 'friends' ? friendsList.value : []))

/**
 * 生成当前弹窗好友基础信息。
 */
const friendMemberInfo = computed(() =>
  createReferralFriendDetailMember(selectedFriendAccount.value)
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
    ? createReferralFriendDetailGameSummary(t)
    : createReferralFriendDetailTopUpSummary(t)
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
    ? createReferralFriendDetailGameRows(t)
    : createReferralFriendDetailTopUpRows()
)

/**
 * 处理页面初始化完成状态，避免首屏端态抖动。
 */
onMounted(() => {
  isReady.value = true
})

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
  globalShowToast({
    message: t('referral.comingSoon'),
    type: 'success'
  })
}

/**
 * 处理打开筛选弹窗。
 */
const handleOpenFilter = () => {
  globalShowToast({
    message: t('referral.comingSoon'),
    type: 'success'
  })
}

/**
 * 处理进入好友详情。
 */
const handleGoFriendDetail = (item: ReferralDetailsFriendItem) => {
  if (!isMobile.value) {
    selectedFriendAccount.value = item.id
    friendActiveDateTab.value = 'today'
    friendActiveStatsTab.value = 'game-stats'
    showFriendDetailPopup.value = true
    return
  }

  navigateTo('/referral/details/friend', {
    query: {
      id: item.id
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
}

/**
 * 处理切换好友详情日期筛选。
 */
const handleChangeFriendDateTab = (value: ReferralFriendDetailDateTabValue) => {
  friendActiveDateTab.value = value
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
