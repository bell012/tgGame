<template>
  <!-- 推荐详情页内容容器 -->
  <section class="relative overflow-hidden" style="font-family: Inter, avertastd, sans-serif">
    <!-- 页面主体内容 -->
    <main class="px-[14px] pt-[14px] pb-[30px]">
      <!-- 顶部标签区域 -->
      <nav
        class="mb-[14px] overflow-x-auto"
        :class="props.isMobile ? '' : 'w-full max-w-[1032px] overflow-hidden rounded-[8px] bg-bg-2'"
      >
        <!-- 标签列表 -->
        <div
          class="flex items-center"
          :class="props.isMobile ? 'w-max gap-[8px]' : 'h-[40px] w-full gap-0'"
        >
          <!-- 标签按钮 -->
          <button
            v-for="item in props.tabs"
            :key="item.value"
            type="button"
            class="flex items-center justify-center"
            :class="
              props.isMobile
                ? props.activeTab === item.value
                  ? 'h-[31px] shrink-0 rounded-full border border-theme-primary bg-theme-3 px-[20px] text-[12px] font-[700] leading-[15px] text-common-100'
                  : 'h-[31px] shrink-0 rounded-full bg-bg-2 px-[20px] text-[12px] font-[500] leading-[15px] text-text-2'
                : props.activeTab === item.value
                  ? 'h-[40px] flex-1 rounded-[8px] bg-[#3B4142] text-[14px] font-[700] leading-[17px] text-white'
                  : 'h-[40px] flex-1 rounded-[8px] text-[14px] font-[700] leading-[17px] text-text-2'
            "
            @click="$emit('change-tab', item.value)"
          >
            {{ item.label }}
          </button>
        </div>
      </nav>

      <!-- 统计标签页内容 -->
      <ReferralDetailsStatsContent
        v-if="props.activeTab === 'stats'"
        :is-mobile="props.isMobile"
        :date-label="props.dateLabel"
        :active-date-value="props.activeDateValue"
        :date-options="props.dateOptions"
        :top-up-title="props.topUpTitle"
        :chart-cards="props.statsChartCards"
        :top-up-summary-list="props.topUpSummaryList"
        :top-up-table-rows="props.topUpTableRows"
        @open-date-picker="$emit('open-date-picker')"
        @change-date="$emit('change-date', $event)"
      />

      <ReferralDetailsRewardHistoryContent
        v-else-if="props.activeTab === 'reward-history'"
        :is-mobile="props.isMobile"
        :date-label="props.dateLabel"
        :active-date-value="props.activeDateValue"
        :date-options="props.dateOptions"
        :total-commission-label="props.totalCommissionLabel"
        :total-commission="props.rewardHistoryTotalCommission"
        :time-label="props.rewardHistoryTimeLabel"
        :commission-label="props.rewardHistoryCommissionLabel"
        :currency-code="props.rewardHistoryCurrencyCode"
        :reward-history-rows="props.rewardHistoryRows"
        :empty-text="props.emptyText"
        :empty-alt="props.emptyAlt"
        :empty-dark-image="props.emptyDarkImage"
        :empty-light-image="props.emptyLightImage"
        @open-date-picker="$emit('open-date-picker')"
        @change-date="$emit('change-date', $event)"
      />

      <ReferralDetailsClaimHistoryContent
        v-else-if="props.activeTab === 'claim-history'"
        :is-mobile="props.isMobile"
        :date-label="props.dateLabel"
        :active-date-value="props.activeDateValue"
        :date-options="props.dateOptions"
        :total-commission-label="props.totalCommissionLabel"
        :total-commission="props.claimHistoryTotalCommission"
        :time-label="props.claimHistoryTimeLabel"
        :rewards-label="props.claimHistoryRewardsLabel"
        :currency-code="props.claimHistoryCurrencyCode"
        :claim-history-rows="props.claimHistoryRows"
        :empty-text="props.emptyText"
        :empty-alt="props.emptyAlt"
        :empty-dark-image="props.emptyDarkImage"
        :empty-light-image="props.emptyLightImage"
        @open-date-picker="$emit('open-date-picker')"
        @change-date="$emit('change-date', $event)"
      />

      <!-- 好友标签页内容 -->
      <template v-else-if="props.activeTab === 'friends'">
        <template v-if="props.isMobile">
          <section class="mb-[10px] overflow-hidden rounded-[10px] bg-bg-2">
            <div class="relative flex h-[40px] items-center justify-between px-[14px]">
              <!-- 按钮块 -->
              <button
                type="button"
                class="flex items-center gap-[7px]"
                @click="$emit('open-date-picker')"
              >
                <span class="text-[16px] font-[700] leading-[19px] text-text-1">
                  {{ props.dateLabel }}
                </span>
                <span
                  class="flex h-[20px] w-[20px] items-center justify-center rounded-[6px] bg-opacity-10"
                >
                  <ArrowDownIcon class="h-[10px] w-[10px] text-text-2" />
                </span>
              </button>

              <!-- 按钮块 -->
              <button
                type="button"
                class="flex h-[20px] items-center justify-center rounded-full bg-theme-3 px-[14px] text-[11px] font-[400] leading-[13px] text-theme-primary"
                @click="$emit('open-filter')"
              >
                {{ props.filterText }}
              </button>

              <span
                class="pointer-events-none absolute inset-x-0 bottom-0 h-px origin-bottom scale-y-100 bg-opacity-5"
              ></span>
            </div>

            <div class="grid h-[66px] grid-cols-3 items-stretch py-[14px]">
              <div
                v-for="(item, index) in props.summaryList"
                :key="item.label"
                class="relative flex h-full flex-col items-center justify-center gap-[5px]"
              >
                <div class="w-full text-center text-[16px] font-[700] leading-[19px] text-text-1">
                  {{ item.value }}
                </div>

                <div class="w-full text-center text-[11px] font-[400] leading-[13px] text-text-3">
                  {{ item.label }}
                </div>
                <span
                  v-if="index !== props.summaryList.length - 1"
                  class="pointer-events-none absolute inset-y-0 right-0 w-px origin-right scale-x-100 bg-opacity-5"
                ></span>
              </div>
            </div>
          </section>

          <section v-if="props.friendsList.length > 0" class="flex flex-col gap-[10px]">
            <!-- 内容块 -->
            <article
              v-for="item in props.friendsList"
              :key="item.id"
              class="relative overflow-hidden rounded-[10px] bg-bg-2"
            >
              <div
                class="absolute right-0 top-0 flex h-[19px] items-center justify-center rounded-bl-[10px] rounded-tr-[10px] bg-opacity-5 px-[10px] text-[11px] font-[400] leading-[13px]"
                :class="item.status === 'active' ? 'text-theme-primary' : 'text-text-2'"
              >
                {{ item.statusText }}
              </div>

              <div class="flex h-[83px] items-center gap-[10px] px-[14px] pt-[14px]">
                <div
                  class="flex h-[55px] w-[55px] shrink-0 items-center justify-center rounded-full bg-opacity-15"
                >
                  <img
                    class="h-[47px] w-[47px] rounded-full object-cover"
                    :src="item.avatar"
                    :alt="props.avatarAlt"
                  />
                </div>

                <div class="flex min-w-0 flex-1 flex-col gap-[7px]">
                  <div class="flex items-center gap-[4px]">
                    <div
                      class="max-w-[120px] truncate text-[14px] font-[700] leading-[17px] text-text-1"
                    >
                      {{ item.id }}
                    </div>

                    <div
                      class="flex h-[16px] items-center justify-center rounded-[5px_5px_5px_0] bg-theme-3 px-[6px] text-[10px] font-[400] leading-[12px] text-theme-primary"
                    >
                      {{ item.vipLevel }}
                    </div>
                  </div>

                  <div class="flex items-center justify-between gap-[4px]">
                    <div class="flex items-center gap-[4px]">
                      <span class="text-[12px] font-[400] leading-[15px] text-text-2">
                        {{ props.depositLabel }}
                      </span>
                      <span class="text-[14px] font-[700] leading-[17px] text-text-1">
                        {{ item.deposit }}
                      </span>
                    </div>

                    <div class="flex items-center gap-[4px]">
                      <span class="text-[12px] font-[400] leading-[15px] text-text-2">
                        {{ props.validBetsLabel }}
                      </span>
                      <span class="text-[14px] font-[700] leading-[17px] text-text-1">
                        {{ item.validBets }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div class="relative flex h-[40px] items-center justify-between px-[14px]">
                <span
                  class="pointer-events-none absolute inset-x-0 top-0 h-px origin-top scale-y-100 bg-opacity-5"
                ></span>

                <div class="text-[12px] font-[400] leading-[15px] text-text-2">
                  {{ item.createTime }}
                </div>

                <!-- 按钮块 -->
                <button
                  type="button"
                  class="flex items-center gap-[7px]"
                  @click="$emit('go-friend-detail', item)"
                >
                  <span class="text-[12px] font-[400] leading-[15px] text-text-1">
                    {{ props.detailText }}
                  </span>

                  <span
                    class="flex h-[20px] w-[20px] items-center justify-center rounded-[6px] bg-opacity-10"
                  >
                    <ArrowRightIcon class="h-[12px] w-[12px] text-text-2" />
                  </span>
                </button>
              </div>
            </article>
          </section>

          <section v-else class="flex flex-col items-center pt-[60px]">
            <ThemedEmptyState
              :dark-image="props.emptyDarkImage"
              :light-image="props.emptyLightImage"
              :image-alt="props.emptyAlt"
              :message="props.emptyText"
              container-class="mt-0"
              image-class="h-[200px] w-[220px] object-contain"
              text-class="mt-[10px] text-center text-[12px] font-[500] leading-[18px] text-text-1"
            />

            <!-- 按钮块 -->
            <button
              type="button"
              class="mt-[20px] h-[40px] w-[200px] rounded-[8px] bg-theme-primary text-[14px] font-[700] leading-[17px] text-text-4"
              @click="$emit('show-poster')"
            >
              {{ props.emptyActionText }}
            </button>
          </section>
        </template>

        <template v-else>
          <section class="flex w-full max-w-[1032px] flex-col gap-[24px]">
            <div class="flex w-full flex-col items-center gap-[24px]">
              <div class="flex w-full flex-col gap-[8px]">
                <div class="flex h-[48px] items-center gap-[12px]">
                  <CustomSelect
                    class="w-[336px]"
                    :model-value="props.activeDateValue"
                    :options="pcFriendsDateOptions"
                    @update:model-value="
                      $emit('change-date', $event as ReferralDetailsDateFilterValue)
                    "
                  />
                  <CustomSelect
                    class="w-[336px]"
                    :model-value="props.friendsLinkSourceValue"
                    :options="props.friendsLinkSourceOptions"
                    :placeholder="props.friendsLinkSourceLabel"
                    :use-placeholder-when-all="true"
                    @update:model-value="$emit('change-friends-link-source-filter', $event)"
                  />
                  <CustomSelect
                    class="w-[336px]"
                    :model-value="props.friendsRegistrationTimeValue"
                    :options="props.friendsRegistrationTimeOptions"
                    :placeholder="props.friendsRegistrationTimeLabel"
                    :use-placeholder-when-all="true"
                    @update:model-value="
                      $emit(
                        'change-friends-registration-time-filter',
                        $event as ReferralDetailsDateFilterValue
                      )
                    "
                  />
                </div>

                <section class="flex h-[76px] rounded-[16px] bg-bg-2">
                  <div class="flex w-full items-start justify-between py-[12px]">
                    <div
                      v-for="(item, index) in props.summaryList"
                      :key="item.label"
                      class="flex h-[52px] flex-1 flex-col items-center justify-center gap-[8px]"
                      :class="
                        index !== props.summaryList.length - 1 ? 'border-r border-white/[0.06]' : ''
                      "
                    >
                      <div
                        class="min-w-[80px] text-center text-[18px] font-[700] leading-[22px] text-white"
                      >
                        {{ item.value }}
                      </div>

                      <div class="text-center text-[14px] font-[400] leading-[20px] text-[#7B7D7D]">
                        {{ item.label }}
                      </div>
                    </div>
                  </div>
                </section>
              </div>

              <section v-if="props.friendsList.length > 0" class="flex w-full flex-col gap-[8px]">
                <!-- 内容块 -->
                <article
                  v-for="item in props.friendsList"
                  :key="item.id"
                  class="relative flex h-[112px] overflow-hidden rounded-[16px] bg-bg-2"
                >
                  <div
                    class="absolute left-0 top-0 z-[1] flex h-[23px] min-w-[80px] items-center justify-center rounded-br-[16px] bg-white/[0.06] px-[16px] text-[12px] font-[400] leading-[15px]"
                    :class="item.status === 'active' ? 'text-theme-primary' : 'text-text-2'"
                  >
                    {{ item.statusText }}
                  </div>

                  <div
                    class="flex h-full w-full items-center gap-[20px] px-[24px] pt-[28px] pb-[20px] pr-[20px]"
                  >
                    <div
                      class="flex h-[64px] w-[64px] shrink-0 items-center justify-center rounded-full bg-white/[0.15]"
                    >
                      <img
                        class="h-[54px] w-[54px] rounded-full object-cover"
                        :src="item.avatar"
                        :alt="props.avatarAlt"
                      />
                    </div>

                    <div class="flex min-w-0 flex-1 flex-col gap-[12px]">
                      <div class="flex items-start gap-[12px]">
                        <div class="flex min-w-0 flex-1 items-center gap-[5.83px]">
                          <div
                            class="max-w-[120px] truncate text-[20px] font-[700] leading-[24px] text-white"
                          >
                            {{ item.id }}
                          </div>

                          <div
                            class="flex h-[24px] items-center justify-center rounded-[8px_8px_8px_0] bg-theme-3 px-[10px] text-[14px] font-[400] leading-[20px] text-theme-primary"
                          >
                            {{ item.vipLevel }}
                          </div>
                        </div>

                        <div class="text-[16px] font-[400] leading-[19px] text-text-2">
                          {{ item.createTime }}
                        </div>
                      </div>

                      <div class="flex items-center justify-center gap-[159px]">
                        <div class="flex flex-1 items-center gap-[5.83px]">
                          <span class="text-[16px] font-[400] leading-[19px] text-text-2">
                            {{ props.depositLabel }}
                          </span>
                          <span class="text-[20px] font-[700] leading-[24px] text-white">
                            {{ item.deposit }}
                          </span>
                        </div>

                        <div class="flex flex-1 items-center gap-[5.83px]">
                          <span class="text-[16px] font-[400] leading-[19px] text-text-2">
                            {{ props.validBetsLabel }}
                          </span>
                          <span class="text-[20px] font-[700] leading-[24px] text-white">
                            {{ item.validBets }}
                          </span>
                        </div>

                        <!-- 按钮块 -->
                        <button
                          type="button"
                          class="flex flex-1 items-center justify-end gap-[12px]"
                          @click="$emit('go-friend-detail', item)"
                        >
                          <span class="text-[16px] font-[400] leading-[19px] text-white">
                            {{ props.detailText }}
                          </span>
                          <span
                            class="flex h-[28px] w-[28px] items-center justify-center rounded-[8.4px] bg-white/10"
                          >
                            <ArrowRightIcon class="h-[11.2px] w-[11.2px] text-text-2" />
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              </section>

              <section v-else class="flex w-full flex-col items-center pt-[60px]">
                <ThemedEmptyState
                  :dark-image="props.emptyDarkImage"
                  :light-image="props.emptyLightImage"
                  :image-alt="props.emptyAlt"
                  :message="props.emptyText"
                  container-class="mt-0"
                  image-class="h-[200px] w-[220px] object-contain"
                  text-class="mt-[10px] text-center text-[12px] font-[500] leading-[18px] text-text-1"
                />

                <!-- 按钮块 -->
                <button
                  type="button"
                  class="mt-[20px] h-[40px] w-[200px] rounded-[8px] bg-theme-primary text-[14px] font-[700] leading-[17px] text-text-4"
                  @click="$emit('show-poster')"
                >
                  {{ props.emptyActionText }}
                </button>
              </section>
            </div>
          </section>
        </template>
      </template>

      <!-- 其他标签页空状态 -->
      <section v-else class="flex flex-col items-center pt-[60px]">
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
import CustomSelect from '@/components/common/CustomSelect.vue'
import ThemedEmptyState from '@/components/common/ThemedEmptyState.vue'
import ArrowDownIcon from '@/static/svg/arrow_down.svg?component'
import ArrowRightIcon from '@/static/svg/arrow_right.svg?component'
import { computed } from 'vue'
import type {
  ReferralDetailsClaimHistoryRow,
  ReferralDetailsDateFilterValue,
  ReferralDetailsDateOption,
  ReferralDetailsFriendItem,
  ReferralDetailsRewardHistoryRow,
  ReferralDetailsStatsChartCard,
  ReferralDetailsSummaryItem,
  ReferralDetailsTabItem,
  ReferralDetailsTabValue,
  ReferralDetailsTopUpSummaryItem,
  ReferralDetailsTopUpTableRow
} from '../shared'
import ReferralDetailsClaimHistoryContent from './ReferralDetailsClaimHistoryContent.vue'
import ReferralDetailsRewardHistoryContent from './ReferralDetailsRewardHistoryContent.vue'
import ReferralDetailsStatsContent from './ReferralDetailsStatsContent.vue'

interface Props {
  isMobile: boolean
  activeTab: ReferralDetailsTabValue
  dateLabel: string
  activeDateValue: ReferralDetailsDateFilterValue
  dateOptions: ReferralDetailsDateOption[]
  filterText: string
  friendsLinkSourceLabel: string
  friendsRegistrationTimeLabel: string
  depositLabel: string
  validBetsLabel: string
  totalCommissionLabel: string
  rewardHistoryTimeLabel: string
  rewardHistoryCommissionLabel: string
  claimHistoryTimeLabel: string
  claimHistoryRewardsLabel: string
  detailText: string
  emptyActionText: string
  emptyText: string
  emptyAlt: string
  avatarAlt: string
  emptyDarkImage: string
  emptyLightImage: string
  tabs: ReferralDetailsTabItem[]
  summaryList: ReferralDetailsSummaryItem[]
  friendsList: ReferralDetailsFriendItem[]
  friendsLinkSourceValue: string
  friendsRegistrationTimeValue: ReferralDetailsDateFilterValue
  friendsLinkSourceOptions: Array<{ label: string; value: string }>
  friendsRegistrationTimeOptions: Array<{ label: string; value: string }>
  topUpTitle: string
  statsChartCards: ReferralDetailsStatsChartCard[]
  topUpSummaryList: ReferralDetailsTopUpSummaryItem[]
  topUpTableRows: ReferralDetailsTopUpTableRow[]
  rewardHistoryTotalCommission: string
  rewardHistoryCurrencyCode: string
  rewardHistoryRows: ReferralDetailsRewardHistoryRow[]
  claimHistoryTotalCommission: string
  claimHistoryCurrencyCode: string
  claimHistoryRows: ReferralDetailsClaimHistoryRow[]
}

const props = defineProps<Props>()

const pcFriendsDateOptions = computed(() =>
  props.dateOptions.map(item => ({
    label: item.label,
    value: item.value
  }))
)

defineEmits<{
  'change-tab': [value: ReferralDetailsTabValue]
  'change-date': [value: ReferralDetailsDateFilterValue]
  'open-date-picker': []
  'open-filter': []
  'change-friends-link-source-filter': [value: string]
  'change-friends-registration-time-filter': [value: ReferralDetailsDateFilterValue]
  'go-friend-detail': [value: ReferralDetailsFriendItem]
  'show-poster': []
}>()
</script>
