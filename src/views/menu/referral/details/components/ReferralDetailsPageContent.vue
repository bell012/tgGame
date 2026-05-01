<template>
  <!-- 推荐详情页内容容器 -->
  <section class="relative overflow-hidden" style="font-family: Inter, avertastd, sans-serif">
    <!-- 页面主体内容 -->
    <main class="px-[14px] pt-[14px] pb-[30px]">
      <!-- 顶部标签区域 -->
      <nav class="mb-[14px] overflow-x-auto">
        <!-- 标签列表 -->
        <div class="flex w-max items-center gap-[8px]">
          <!-- 标签按钮 -->
          <button
            v-for="item in props.tabs"
            :key="item.value"
            type="button"
            class="flex h-[31px] shrink-0 items-center justify-center rounded-full px-[20px] text-[12px] leading-[15px]"
            :class="
              props.activeTab === item.value
                ? 'border border-theme-primary bg-theme-3 font-[700] text-common-100'
                : 'bg-bg-2 font-[500] text-text-2'
            "
            @click="$emit('change-tab', item.value)"
          >
            {{ item.label }}
          </button>
        </div>
      </nav>

      <!-- 数据统计卡片 -->
      <section class="mb-[10px] overflow-hidden rounded-[10px] bg-bg-2">
        <!-- 日期和筛选操作区 -->
        <div class="relative flex h-[40px] items-center justify-between px-[14px]">
          <!-- 日期选择按钮 -->
          <button
            type="button"
            class="flex items-center gap-[7px]"
            @click="$emit('open-date-picker')"
          >
            <!-- 日期文本 -->
            <span class="text-[16px] font-[700] leading-[19px] text-text-1">
              {{ props.dateLabel }}
            </span>

            <!-- 下拉图标按钮 -->
            <span
              class="flex h-[20px] w-[20px] items-center justify-center rounded-[6px] bg-opacity-10"
            >
              <ArrowDownIcon class="h-[10px] w-[10px] text-text-2" />
            </span>
          </button>

          <!-- 筛选按钮 -->
          <button
            type="button"
            class="flex h-[20px] items-center justify-center rounded-full bg-theme-3 px-[14px] text-[11px] font-[400] leading-[13px] text-theme-primary"
            @click="$emit('open-filter')"
          >
            {{ props.filterText }}
          </button>

          <!-- 日期筛选区分割线 -->
          <span
            class="pointer-events-none absolute inset-x-0 bottom-0 h-px origin-bottom scale-y-100 bg-opacity-5"
          ></span>
        </div>

        <!-- 统计数据区域 -->
        <div class="grid h-[66px] grid-cols-3 items-stretch py-[14px]">
          <!-- 单个统计项 -->
          <div
            v-for="(item, index) in props.summaryList"
            :key="item.label"
            class="relative flex h-full flex-col items-center justify-center gap-[5px]"
          >
            <!-- 统计数值 -->
            <div class="w-full text-center text-[16px] font-[700] leading-[19px] text-text-1">
              {{ item.value }}
            </div>

            <!-- 统计标题 -->
            <div class="w-full text-center text-[11px] font-[400] leading-[13px] text-text-3">
              {{ item.label }}
            </div>

            <!-- 统计项分割线 -->
            <span
              v-if="index !== props.summaryList.length - 1"
              class="pointer-events-none absolute inset-y-0 right-0 w-px origin-right scale-x-100 bg-opacity-5"
            ></span>
          </div>
        </div>
      </section>

      <!-- 有数据列表状态 -->
      <section v-if="props.friendsList.length > 0" class="flex flex-col gap-[10px]">
        <!-- 好友卡片 -->
        <article
          v-for="item in props.friendsList"
          :key="item.id"
          class="relative overflow-hidden rounded-[10px] bg-bg-2"
        >
          <!-- 状态标签 -->
          <div
            class="absolute right-0 top-0 flex h-[19px] items-center justify-center rounded-bl-[10px] rounded-tr-[10px] bg-opacity-5 px-[10px] text-[11px] font-[400] leading-[13px]"
            :class="item.status === 'active' ? 'text-theme-primary' : 'text-text-2'"
          >
            {{ item.statusText }}
          </div>

          <!-- 好友基础信息区域 -->
          <div class="flex h-[83px] items-center gap-[10px] px-[14px] pt-[14px]">
            <!-- 头像容器 -->
            <div
              class="flex h-[55px] w-[55px] shrink-0 items-center justify-center rounded-full bg-opacity-15"
            >
              <!-- 好友头像 -->
              <img
                class="h-[47px] w-[47px] rounded-full object-cover"
                :src="item.avatar"
                :alt="props.avatarAlt"
              />
            </div>

            <!-- 好友信息区域 -->
            <div class="flex min-w-0 flex-1 flex-col gap-[7px]">
              <!-- 用户名和等级 -->
              <div class="flex items-center gap-[4px]">
                <!-- 用户 ID -->
                <div
                  class="max-w-[120px] truncate text-[14px] font-[700] leading-[17px] text-text-1"
                >
                  {{ item.id }}
                </div>

                <!-- VIP 等级 -->
                <div
                  class="flex h-[16px] items-center justify-center rounded-[5px_5px_5px_0] bg-theme-3 px-[6px] text-[10px] font-[400] leading-[12px] text-theme-primary"
                >
                  {{ item.vipLevel }}
                </div>
              </div>

              <!-- 充值和有效投注 -->
              <div class="flex items-center justify-between gap-[4px]">
                <!-- 充值信息 -->
                <div class="flex items-center gap-[4px]">
                  <span class="text-[12px] font-[400] leading-[15px] text-text-2">
                    {{ props.depositLabel }}
                  </span>
                  <span class="text-[14px] font-[700] leading-[17px] text-text-1">
                    {{ item.deposit }}
                  </span>
                </div>

                <!-- 有效投注信息 -->
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

          <!-- 卡片底部操作区 -->
          <div class="relative flex h-[40px] items-center justify-between px-[14px]">
            <!-- 好友卡片分割线 -->
            <span
              class="pointer-events-none absolute inset-x-0 top-0 h-px origin-top scale-y-100 bg-opacity-5"
            ></span>

            <!-- 注册时间 -->
            <div class="text-[12px] font-[400] leading-[15px] text-text-2">
              {{ item.createTime }}
            </div>

            <!-- 详情按钮 -->
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

      <!-- 无数据状态 -->
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

        <!-- 邀请按钮 -->
        <button
          type="button"
          class="mt-[20px] h-[40px] w-[200px] rounded-[8px] bg-theme-2 text-[14px] font-[700] leading-[17px] text-text-4"
          @click="$emit('invite')"
        >
          {{ props.inviteText }}
        </button>
      </section>
    </main>
  </section>
</template>

<script setup lang="ts">
import ThemedEmptyState from '@/components/common/ThemedEmptyState.vue'
import ArrowDownIcon from '@/static/svg/arrow_down.svg?component'
import ArrowRightIcon from '@/static/svg/arrow_right.svg?component'
import type {
  ReferralDetailsFriendItem,
  ReferralDetailsSummaryItem,
  ReferralDetailsTabItem,
  ReferralDetailsTabValue
} from '../shared'

interface Props {
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
  'change-tab': [value: ReferralDetailsTabValue]
  'open-date-picker': []
  'open-filter': []
  'go-friend-detail': [value: ReferralDetailsFriendItem]
  invite: []
}>()
</script>
