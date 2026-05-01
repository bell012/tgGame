<template>
  <!-- PC 推荐详情页外层容器 -->
  <section
    class="mx-auto w-full max-w-[1120px] px-6 py-6"
    style="font-family: Inter, avertastd, sans-serif"
  >
    <!-- PC 推荐详情页卡片容器 -->
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

      <!-- PC 推荐详情页主体内容 -->
      <ReferralDetailsPageContent
        :active-tab="props.activeTab"
        :date-label="props.dateLabel"
        :filter-text="props.filterText"
        :deposit-label="props.depositLabel"
        :valid-bets-label="props.validBetsLabel"
        :detail-text="props.detailText"
        :invite-text="props.inviteText"
        :empty-text="props.emptyText"
        :empty-alt="props.emptyAlt"
        :avatar-alt="props.avatarAlt"
        :empty-dark-image="props.emptyDarkImage"
        :empty-light-image="props.emptyLightImage"
        :tabs="props.tabs"
        :summary-list="props.summaryList"
        :friends-list="props.friendsList"
        @change-tab="$emit('change-tab', $event)"
        @open-date-picker="$emit('open-date-picker')"
        @open-filter="$emit('open-filter')"
        @go-friend-detail="$emit('go-friend-detail', $event)"
        @invite="$emit('invite')"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import RuleIcon from '@/static/svg/rule.svg?component'
import ReferralDetailsPageContent from './components/ReferralDetailsPageContent.vue'
import type {
  ReferralDetailsFriendItem,
  ReferralDetailsSummaryItem,
  ReferralDetailsTabItem,
  ReferralDetailsTabValue
} from './shared'

interface Props {
  pageTitle: string
  activeTab: ReferralDetailsTabValue
  dateLabel: string
  filterText: string
  depositLabel: string
  validBetsLabel: string
  detailText: string
  inviteText: string
  emptyText: string
  emptyAlt: string
  avatarAlt: string
  emptyDarkImage: string
  emptyLightImage: string
  tabs: ReferralDetailsTabItem[]
  summaryList: ReferralDetailsSummaryItem[]
  friendsList: ReferralDetailsFriendItem[]
}

const props = defineProps<Props>()

defineEmits<{
  'go-rules': []
  'change-tab': [value: ReferralDetailsTabValue]
  'open-date-picker': []
  'open-filter': []
  'go-friend-detail': [value: ReferralDetailsFriendItem]
  invite: []
}>()
</script>
