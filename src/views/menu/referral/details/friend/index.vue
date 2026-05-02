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
        @go-rules="handleGoRules"
        @change-date-tab="handleChangeDateTab"
        @change-stats-tab="handleChangeStatsTab"
        @copy-account="handleCopyAccount"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { showToast } from 'vant'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import H5Header from '@/components/common/H5Header.vue'
import { useIsMobile } from '@/composables/useMediaQuery'
import RuleIcon from '@/static/svg/rule.svg?component'
import { copyTextWithFallback } from '@/utils/clipboard'
import { navigateTo } from '@/utils/router'
import ReferralFriendDetailPageContent from './components/ReferralFriendDetailPageContent.vue'
import PcLayout from './pc-layout.vue'
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
} from './shared'

const { t } = useI18n()
const route = useRoute()
const isMobile = useIsMobile()
const isReady = ref(false)
const activeDateTab = ref<ReferralFriendDetailDateTabValue>('today')
const activeStatsTab = ref<ReferralFriendDetailStatsTabValue>('game-stats')
const emptyDarkImage = getReferralFriendDetailEmptyDarkImage()
const emptyLightImage = getReferralFriendDetailEmptyLightImage()

/**
 * 从路由参数中解析好友账号。
 */
const accountFromRoute = computed(() => {
  const account = route.query.id
  return typeof account === 'string' && account ? account : undefined
})

/**
 * 生成好友基础信息。
 */
const memberInfo = computed(() => createReferralFriendDetailMember(accountFromRoute.value))

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
    ? createReferralFriendDetailGameSummary(t)
    : createReferralFriendDetailTopUpSummary(t)
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
  navigateTo('/menu/referral/rules')
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
  handleFetchStats()
}

/**
 * 处理切换统计类型。
 */
const handleChangeStatsTab = (value: ReferralFriendDetailStatsTabValue) => {
  activeStatsTab.value = value
  handleFetchStats()
}

/**
 * 处理获取统计数据。
 */
const handleFetchStats = () => {
  // 预留接口接入点，当前页面使用静态示例数据。
}
</script>
