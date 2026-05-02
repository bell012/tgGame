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
          :invite-text="t('referral.cta')"
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
          @invite="handleInvite"
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
        :invite-text="t('referral.cta')"
        :empty-text="t('common.noData')"
        :empty-alt="t('common.noData')"
        :avatar-alt="t('referral.detailsPage.avatarAlt')"
        :empty-dark-image="emptyDarkImage"
        :empty-light-image="emptyLightImage"
        :tabs="tabs"
        :summary-list="summaryList"
        :friends-list="visibleFriendsList"
        @go-rules="handleGoRules"
        @change-tab="handleChangeTab"
        @open-date-picker="handleOpenDatePicker"
        @open-filter="handleOpenFilter"
        @go-friend-detail="handleGoFriendDetail"
        @invite="handleInvite"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { showToast } from 'vant'
import { useI18n } from 'vue-i18n'
import H5Header from '@/components/common/H5Header.vue'
import { useIsMobile } from '@/composables/useMediaQuery'
import RuleIcon from '@/static/svg/rule.svg?component'
import { navigateTo } from '@/utils/router'
import ReferralDetailsPageContent from './components/ReferralDetailsPageContent.vue'
import PcLayout from './pc-layout.vue'
import {
  createReferralDetailsFriends,
  createReferralDetailsSummaryList,
  createReferralDetailsTabs,
  getReferralDetailsEmptyDarkImage,
  getReferralDetailsEmptyLightImage,
  type ReferralDetailsFriendItem,
  type ReferralDetailsTabValue
} from './shared'

const { t } = useI18n()
const isMobile = useIsMobile()
const isReady = ref(false)
const activeTab = ref<ReferralDetailsTabValue>('friends')
const emptyDarkImage = getReferralDetailsEmptyDarkImage()
const emptyLightImage = getReferralDetailsEmptyLightImage()

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
 * 处理页面初始化完成状态，避免首屏端态抖动。
 */
onMounted(() => {
  isReady.value = true
})

/**
 * 处理跳转规则页。
 */
const handleGoRules = () => {
  navigateTo('/menu/referral/rules')
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
  showToast({
    message: t('referral.comingSoon'),
    type: 'success'
  })
}

/**
 * 处理打开筛选弹窗。
 */
const handleOpenFilter = () => {
  showToast({
    message: t('referral.comingSoon'),
    type: 'success'
  })
}

/**
 * 处理邀请好友。
 */
const handleInvite = () => {
  navigateTo('/menu/referral')
}

/**
 * 处理进入好友详情。
 */
const handleGoFriendDetail = (item: ReferralDetailsFriendItem) => {
  navigateTo('/menu/referral/details/friend', {
    query: {
      id: item.id
    }
  })
}
</script>
