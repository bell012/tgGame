<template>
  <!-- PC 好友明细页外层容器 -->
  <section class="mx-auto w-full max-w-[1120px] px-6 py-6 font-['Inter']">
    <!-- PC 好友明细页卡片容器 -->
    <div class="mx-auto max-w-[420px] overflow-hidden rounded-[20px] bg-bg-1">
      <!-- PC 头部区域 -->
      <div class="flex items-center justify-between px-[14px] pb-[12px] pt-[20px]">
        <div class="h-11 w-11"></div>

        <h1 class="text-center text-[24px] font-[700] leading-[29px] text-text-1">
          {{ props.pageTitle }}
        </h1>

        <button
          type="button"
          class="flex h-11 w-11 items-center justify-center rounded-[12px] bg-opacity-5"
          @click="$emit('go-rules')"
        >
          <RuleIcon class="h-5 w-5 text-text-1" />
        </button>
      </div>

      <!-- PC 好友明细页主体内容 -->
      <ReferralFriendDetailPageContent
        :active-date-tab="props.activeDateTab"
        :active-stats-tab="props.activeStatsTab"
        :avatar-alt="props.avatarAlt"
        :empty-alt="props.emptyAlt"
        :empty-dark-image="props.emptyDarkImage"
        :empty-light-image="props.emptyLightImage"
        :empty-text="props.emptyText"
        :last-login-time-label="props.lastLoginTimeLabel"
        :member-info="props.memberInfo"
        :name-label="props.nameLabel"
        :total-title="props.totalTitle"
        :user-id-label="props.userIdLabel"
        :date-tabs="props.dateTabs"
        :stats-tabs="props.statsTabs"
        :summary-list="props.summaryList"
        :table-columns="props.tableColumns"
        :table-list="props.tableList"
        @change-date-tab="$emit('change-date-tab', $event)"
        @change-stats-tab="$emit('change-stats-tab', $event)"
        @copy-account="$emit('copy-account')"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import RuleIcon from '@/static/svg/rule.svg?component'
import ReferralFriendDetailPageContent from './components/ReferralFriendDetailPageContent.vue'
import type {
  ReferralFriendDetailDateTabValue,
  ReferralFriendDetailMemberInfo,
  ReferralFriendDetailStatsTabValue,
  ReferralFriendDetailSummaryItem,
  ReferralFriendDetailTabItem,
  ReferralFriendDetailTableRow
} from './shared'

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
  pageTitle: string
  totalTitle: string
  userIdLabel: string
  dateTabs: ReferralFriendDetailTabItem<ReferralFriendDetailDateTabValue>[]
  statsTabs: ReferralFriendDetailTabItem<ReferralFriendDetailStatsTabValue>[]
  summaryList: ReferralFriendDetailSummaryItem[]
  tableColumns: string[]
  tableList: ReferralFriendDetailTableRow[]
}

const props = defineProps<Props>()

defineEmits<{
  'go-rules': []
  'change-date-tab': [value: ReferralFriendDetailDateTabValue]
  'change-stats-tab': [value: ReferralFriendDetailStatsTabValue]
  'copy-account': []
}>()
</script>
