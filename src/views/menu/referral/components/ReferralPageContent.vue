<template>
  <!-- 推荐页内容区域 -->
  <section class="relative overflow-hidden" style="font-family: Inter, avertastd, sans-serif">
    <!-- 页面主体容器 -->
    <div
      :class="
        props.mode === 'pc'
          ? 'relative mx-auto flex max-w-[1041px] flex-col gap-5 px-0 pb-8'
          : 'relative flex flex-col gap-3.5 px-3.5 pb-6 pt-3.5'
      "
    >
      <!-- 快捷入口区域 -->
      <section class="flex flex-col gap-3.5">
        <!-- 快捷入口列表 -->
        <div :class="props.mode === 'pc' ? 'grid grid-cols-4 gap-5' : 'grid grid-cols-4 gap-2.5'">
          <!-- 快捷入口按钮 -->
          <button
            v-for="item in props.quickActions"
            :key="item.id"
            type="button"
            class="flex flex-col items-center justify-start"
            :class="props.mode === 'pc' ? 'gap-3 rounded-[16px]' : 'gap-2 rounded-[10px]'"
            @click="$emit('quick-action', item.id)"
          >
            <!-- 快捷入口图标 -->
            <img
              :src="item.icon"
              :alt="item.label"
              :class="
                props.mode === 'pc'
                  ? 'h-[68px] w-[68px] object-contain'
                  : 'h-[46px] w-[46px] object-contain'
              "
            />

            <!-- 快捷入口文案 -->
            <span
              class="text-center font-[400] text-text-1"
              :class="props.mode === 'pc' ? 'text-base leading-[20px]' : 'text-sm leading-[17px]'"
            >
              {{ item.label }}
            </span>
          </button>
        </div>

        <!-- 活动横幅 -->
        <div
          class="overflow-hidden"
          :class="props.mode === 'pc' ? 'rounded-[16px]' : 'rounded-[10px]'"
        >
          <img
            :src="props.bannerImage"
            alt="referral banner"
            class="w-full object-cover"
            :class="props.mode === 'pc' ? 'h-[180px]' : 'h-[100px]'"
          />
        </div>
      </section>

      <!-- 祝贺跑马灯区域 -->
      <section class="w-full overflow-hidden">
        <!-- 祝贺跑马灯轨道 -->
        <div
          class="referral-marquee-track flex w-max items-center"
          :class="{ 'referral-marquee-track-animated': shouldAnimateMarquee }"
        >
          <!-- 祝贺跑马灯文案 -->
          <div
            v-for="(message, index) in marqueeLoopMessages"
            :key="`marquee-${index}`"
            class="mr-2.5 flex shrink-0 items-center justify-center rounded-full bg-bg-2 text-center text-text-2 last:mr-0"
            :class="
              props.mode === 'pc'
                ? 'h-[44px] min-w-[420px] px-5 text-sm leading-[20px]'
                : 'h-[25px] min-w-[237px] px-3 text-xs leading-[15px]'
            "
          >
            {{ message }}
          </div>
        </div>
      </section>

      <!-- 社交分享区域 -->
      <section
        class="rounded-[10px] bg-bg-2"
        :class="props.mode === 'pc' ? 'rounded-[16px] p-5' : 'p-3.5'"
      >
        <!-- 社交分享按钮滚动区 -->
        <div class="overflow-x-auto">
          <!-- 社交分享按钮列表 -->
          <div class="flex min-w-max" :class="props.mode === 'pc' ? 'gap-6' : 'gap-3.5'">
            <!-- 社交分享按钮 -->
            <button
              v-for="item in props.socialChannels"
              :key="item.id"
              type="button"
              class="flex flex-col items-center"
              :class="props.mode === 'pc' ? 'w-[88px] gap-3' : 'w-[60px] gap-2'"
              @click="$emit('share-channel', item.id)"
            >
              <!-- 社交分享图标容器 -->
              <div
                class="flex items-center justify-center"
                :class="
                  props.mode === 'pc'
                    ? ['h-[72px] w-[72px]', item.iconClass || '']
                    : ['h-10 w-10', item.iconClass || '']
                "
              >
                <!-- 社交分享图标 -->
                <img :src="item.icon" :alt="item.label" class="h-full w-full object-contain" />
              </div>

              <!-- 社交分享文案 -->
              <span
                class="w-full text-center font-[400] text-text-1"
                :class="props.mode === 'pc' ? 'text-sm leading-[20px]' : 'text-xs leading-[15px]'"
              >
                {{ item.label }}
              </span>
            </button>
          </div>
        </div>

        <!-- 社交分享底部按钮区域 -->
        <div class="flex" :class="props.mode === 'pc' ? 'mt-5 gap-4' : 'mt-3.5 gap-3.5'">
          <!-- 分享说明按钮 -->
          <button
            type="button"
            class="flex flex-1 items-center justify-center rounded-[10px] bg-bg-4 font-[400] text-text-2"
            :class="props.mode === 'pc' ? 'h-[52px] text-base' : 'h-10 text-sm'"
            @click="$emit('share-guide')"
          >
            {{ props.howToShareText }}
          </button>

          <!-- 推荐文案按钮 -->
          <button
            type="button"
            class="flex flex-1 items-center justify-center rounded-[10px] bg-bg-4 font-[400] text-text-2"
            :class="props.mode === 'pc' ? 'h-[52px] text-base' : 'h-10 text-sm'"
            @click="$emit('copy-message')"
          >
            {{ props.referralMessageText }}
          </button>
        </div>
      </section>

      <!-- 佣金概览区域 -->
      <section
        class="flex items-center justify-between rounded-[10px] bg-bg-2"
        :class="props.mode === 'pc' ? 'rounded-[16px] px-5 py-5' : 'px-3.5 py-3.5'"
      >
        <!-- 佣金概览左侧 -->
        <div class="flex min-w-0 items-center" :class="props.mode === 'pc' ? 'gap-4' : 'gap-2.5'">
          <!-- 佣金图标 -->
          <img
            :src="props.commissionCoinImage"
            :alt="props.estimatedCommissionLabel"
            :class="
              props.mode === 'pc'
                ? 'h-[56px] w-[56px] rounded-full object-cover'
                : 'h-10 w-10 rounded-full object-cover'
            "
          />

          <!-- 佣金文案区域 -->
          <div class="flex min-w-0 flex-col" :class="props.mode === 'pc' ? 'gap-2' : 'gap-1.5'">
            <!-- 佣金标题 -->
            <p
              class="font-[400] text-text-1"
              :class="props.mode === 'pc' ? 'text-base leading-[20px]' : 'text-xs leading-[15px]'"
            >
              {{ props.estimatedCommissionLabel }}
            </p>

            <!-- 佣金额度 -->
            <div class="flex items-center" :class="props.mode === 'pc' ? 'gap-2.5' : 'gap-[7px]'">
              <!-- 佣金额度文本 -->
              <span
                class="font-[700] text-text-1"
                :class="
                  props.mode === 'pc' ? 'text-[24px] leading-[29px]' : 'text-lg leading-[22px]'
                "
              >
                {{ props.estimatedCommissionAmount }}
              </span>

              <!-- 佣金额度下拉装饰 -->
              <span
                class="flex items-center justify-center rounded-full border border-text-3 text-text-3"
                :class="
                  props.mode === 'pc'
                    ? 'h-[18px] w-[18px] text-[10px]'
                    : 'h-[14px] w-[14px] text-[8px]'
                "
              >
                ˅
              </span>
            </div>
          </div>
        </div>

        <!-- 领取佣金按钮 -->
        <button
          type="button"
          class="flex shrink-0 items-center justify-center rounded-[10px] bg-theme-primary font-[700] text-text-4"
          :class="
            props.mode === 'pc' ? 'h-[44px] w-[120px] text-base' : 'h-[35px] w-[94px] text-sm'
          "
          @click="$emit('claim')"
        >
          {{ props.claimText }}
        </button>
      </section>

      <!-- 邀请任务卡片 -->
      <section
        class="relative overflow-hidden rounded-[10px] bg-[linear-gradient(90deg,#0D934D_0%,#084524_100%)]"
        :class="props.mode === 'pc' ? 'min-h-[150px] rounded-[16px] p-5' : 'min-h-[82px] p-3.5'"
      >
        <!-- 邀请任务卡片主体 -->
        <div class="relative z-[1] flex h-full items-center justify-between gap-3">
          <!-- 邀请任务左侧文案 -->
          <div class="flex min-w-0 flex-col" :class="props.mode === 'pc' ? 'gap-3' : 'gap-2.5'">
            <!-- 邀请任务标题 -->
            <div
              class="flex min-w-0 flex-wrap items-center"
              :class="props.mode === 'pc' ? 'gap-2.5' : 'gap-1.5'"
            >
              <!-- 邀请任务前缀 -->
              <span
                class="font-[400] text-common-100"
                :class="
                  props.mode === 'pc' ? 'text-[24px] leading-[29px]' : 'text-sm leading-[17px]'
                "
              >
                {{ props.inviteRewardPrefix }}
              </span>

              <!-- 邀请任务人数 -->
              <span
                class="font-[700] text-secondary-6"
                :class="
                  props.mode === 'pc' ? 'text-[28px] leading-[34px]' : 'text-lg leading-[22px]'
                "
              >
                {{ props.inviteRewardCount }}
              </span>

              <!-- 邀请任务后缀 -->
              <span
                class="font-[400] text-common-100"
                :class="
                  props.mode === 'pc' ? 'text-[24px] leading-[29px]' : 'text-sm leading-[17px]'
                "
              >
                {{ props.inviteRewardSuffix }}
              </span>
            </div>

            <!-- 邀请任务奖励区域 -->
            <div class="flex items-center" :class="props.mode === 'pc' ? 'gap-2.5' : 'gap-1'">
              <!-- 邀请任务奖励图标 -->
              <img
                :src="props.commissionCoinImage"
                :alt="props.inviteRewardAmount"
                :class="
                  props.mode === 'pc'
                    ? 'h-7 w-7 object-contain'
                    : 'h-[15px] w-[15px] object-contain'
                "
              />

              <!-- 邀请任务奖励文本 -->
              <span
                class="font-[700] text-secondary-6"
                :class="
                  props.mode === 'pc' ? 'text-[28px] leading-[34px]' : 'text-lg leading-[22px]'
                "
              >
                {{ props.inviteRewardAmount }}
              </span>
            </div>

            <!-- 邀请任务操作按钮 -->
            <button
              type="button"
              class="flex w-fit items-center rounded-full bg-white/20 text-common-100"
              :class="
                props.mode === 'pc' ? 'gap-2 px-4 py-2 text-sm' : 'gap-1.5 px-3 py-1.5 text-xs'
              "
              @click="$emit('task-details')"
            >
              <!-- 邀请任务操作文案 -->
              <span>{{ props.taskDetailsText }}</span>

              <!-- 邀请任务操作箭头 -->
              <span>{{ '>' }}</span>
            </button>
          </div>

          <!-- 邀请任务右侧装饰 -->
          <div class="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2">
            <!-- 邀请任务装饰圆形 -->
            <div
              class="absolute rounded-full bg-white/10 blur-[2px]"
              :class="
                props.mode === 'pc'
                  ? 'right-[26px] top-[-48px] h-[110px] w-[110px]'
                  : 'right-[10px] top-[-22px] h-[52px] w-[52px]'
              "
            ></div>

            <!-- 邀请任务装饰金币 -->
            <img
              :src="props.commissionCoinImage"
              alt="reward decoration"
              class="relative object-contain opacity-90"
              :class="
                props.mode === 'pc'
                  ? 'h-[120px] w-[120px] rotate-[12deg] translate-x-[-10px]'
                  : 'h-[58px] w-[58px] rotate-[12deg] translate-x-[-8px]'
              "
            />
          </div>
        </div>
      </section>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type {
  ReferralQuickAction,
  ReferralQuickActionId,
  ReferralSocialChannel,
  ReferralSocialChannelId
} from '../shared'

interface Props {
  mode: 'mobile' | 'pc'
  quickActions: ReferralQuickAction[]
  marqueeMessages: string[]
  socialChannels: ReferralSocialChannel[]
  bannerImage: string
  commissionCoinImage: string
  estimatedCommissionLabel: string
  estimatedCommissionAmount: string
  claimText: string
  howToShareText: string
  referralMessageText: string
  inviteRewardPrefix: string
  inviteRewardCount: string
  inviteRewardSuffix: string
  inviteRewardAmount: string
  taskDetailsText: string
}

const props = defineProps<Props>()

defineEmits<{
  'quick-action': [value: ReferralQuickActionId]
  'share-channel': [value: ReferralSocialChannelId]
  'share-guide': []
  'copy-message': []
  claim: []
  'task-details': []
}>()

/**
 * 判断当前跑马灯是否需要自动滚动。
 */
const shouldAnimateMarquee = computed(() => props.marqueeMessages.length > 1)

/**
 * 生成无缝循环所需的跑马灯文案列表。
 */
const marqueeLoopMessages = computed(() =>
  shouldAnimateMarquee.value
    ? [...props.marqueeMessages, ...props.marqueeMessages]
    : props.marqueeMessages
)
</script>

<style scoped>
.referral-marquee-track {
  justify-content: center;
  will-change: transform;
}

.referral-marquee-track-animated {
  justify-content: flex-start;
  animation: referral-marquee-slide-left 14s linear infinite;
}

.referral-marquee-track-animated:hover {
  animation-play-state: paused;
}

@keyframes referral-marquee-slide-left {
  from {
    transform: translateX(100%);
  }

  to {
    transform: translateX(-50%);
  }
}
</style>
