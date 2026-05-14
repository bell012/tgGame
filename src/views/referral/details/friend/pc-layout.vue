<template>
  <!-- PC 好友明细弹窗遮罩层 -->
  <div
    class="fixed inset-0 z-[9999] flex items-center justify-center bg-mask-60-1 px-4"
    @click.self="$emit('close')"
  >
    <!-- PC 好友明细弹窗容器 -->
    <section
      class="relative h-[704px] w-[480px] overflow-hidden rounded-[8px] bg-bg-1 font-['Inter']"
    >
      <!-- PC 弹窗头部 -->
      <div class="absolute inset-x-0 top-0 h-14 bg-bg-2">
        <!-- PC 标题和关闭按钮 -->
        <div class="absolute left-12 top-4 flex h-6 w-[384px] items-center justify-center">
          <!-- PC 弹窗标题 -->
          <div
            class="flex h-6 flex-1 items-center justify-center text-center text-[18px] font-[700] leading-[22px] capitalize text-text-1"
          >
            {{ props.pageTitle }}
          </div>
        </div>

        <!-- PC 关闭按钮 -->
        <button
          type="button"
          class="absolute right-4 top-4 flex h-6 w-6 items-center justify-center rounded-[4px] bg-bg-3"
          @click="$emit('close')"
        >
          <CloseIcon class="h-2.5 w-2.5 text-common-100" />
        </button>
      </div>

      <!-- PC 弹窗主体内容 -->
      <div class="absolute inset-x-0 bottom-0 top-14 overflow-y-auto overscroll-y-contain">
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
  </div>
</template>

<script setup lang="ts">
import CloseIcon from '@/static/svg/close.svg?component'
import { onBeforeUnmount, onMounted } from 'vue'
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

let previousBodyOverflow = ''
let previousHtmlOverflow = ''

defineEmits<{
  close: []
  'change-date-tab': [value: ReferralFriendDetailDateTabValue]
  'change-stats-tab': [value: ReferralFriendDetailStatsTabValue]
  'copy-account': []
}>()

onMounted(() => {
  previousBodyOverflow = document.body.style.overflow
  previousHtmlOverflow = document.documentElement.style.overflow
  document.body.style.overflow = 'hidden'
  document.documentElement.style.overflow = 'hidden'
})

onBeforeUnmount(() => {
  document.body.style.overflow = previousBodyOverflow
  document.documentElement.style.overflow = previousHtmlOverflow
})
</script>
