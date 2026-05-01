<template>
  <!-- 任务页内容区域 -->
  <section class="relative overflow-hidden" style="font-family: Inter, avertastd, sans-serif">
    <!-- 页面主体容器 -->
    <div
      class="relative mx-auto flex flex-col"
      :class="
        props.mode === 'pc' ? 'max-w-[960px] gap-6 px-6 pb-10 pt-4' : 'gap-3.5 px-3.5 pb-6 pt-3.5'
      "
    >
      <!-- 任务重置提示 -->
      <p
        class="font-[400] text-text-3"
        :class="props.mode === 'pc' ? 'text-sm leading-[22px]' : 'text-[11px] leading-[14px]'"
      >
        {{ props.resetHint }}
      </p>

      <!-- 可领取奖励卡片 -->
      <section
        class="flex items-center justify-between rounded-[10px] bg-bg-2"
        :class="props.mode === 'pc' ? 'rounded-[16px] px-5 py-5' : 'px-3.5 py-3.5'"
      >
        <!-- 可领取奖励左侧 -->
        <div class="flex min-w-0 items-center" :class="props.mode === 'pc' ? 'gap-4' : 'gap-2.5'">
          <!-- 可领取奖励图标 -->
          <img
            :src="props.coinImage"
            :alt="props.rewardsToClaimLabel"
            :class="
              props.mode === 'pc' ? 'h-[56px] w-[56px] object-contain' : 'h-10 w-10 object-contain'
            "
          />

          <!-- 可领取奖励文案 -->
          <div class="flex min-w-0 flex-col" :class="props.mode === 'pc' ? 'gap-2' : 'gap-1.5'">
            <!-- 可领取奖励标题 -->
            <p
              class="font-[400] text-common-100"
              :class="props.mode === 'pc' ? 'text-base leading-[20px]' : 'text-xs leading-[15px]'"
            >
              {{ props.rewardsToClaimLabel }}
            </p>

            <!-- 可领取奖励金额 -->
            <span
              class="font-[700] text-common-100"
              :class="props.mode === 'pc' ? 'text-[24px] leading-[29px]' : 'text-lg leading-[22px]'"
            >
              {{ props.rewardsToClaimAmount }}
            </span>
          </div>
        </div>

        <!-- 可领取奖励按钮 -->
        <button
          type="button"
          class="flex shrink-0 items-center justify-center rounded-[10px] font-[700] text-text-4"
          :class="
            props.mode === 'pc'
              ? 'h-[44px] w-[120px] bg-theme-2 text-base'
              : 'h-[35px] w-[94px] bg-theme-2 text-sm'
          "
          @click="$emit('claim')"
        >
          {{ props.claimText }}
        </button>
      </section>

      <!-- 任务标签区域 -->
      <section class="overflow-x-auto">
        <!-- 任务标签列表 -->
        <div class="flex w-max" :class="props.mode === 'pc' ? 'gap-3' : 'gap-2'">
          <!-- 任务标签按钮 -->
          <button
            v-for="item in props.tabs"
            :key="item.key"
            type="button"
            class="flex items-center rounded-full border text-left"
            :class="
              item.key === props.activeTab
                ? props.mode === 'pc'
                  ? 'border-theme-primary bg-theme-3 px-5 py-3 text-base font-[700] text-common-100'
                  : 'border-theme-primary bg-theme-3 px-4 py-2 text-sm font-[700] text-common-100'
                : props.mode === 'pc'
                  ? 'border-transparent bg-bg-2 px-5 py-3 text-base font-[500] text-text-2'
                  : 'border-transparent bg-bg-2 px-4 py-2 text-sm font-[500] text-text-2'
            "
            @click="$emit('tab-click', item.key)"
          >
            {{ item.label }}
          </button>
        </div>
      </section>

      <!-- 进度概览区域 -->
      <section
        class="grid overflow-hidden rounded-[10px] bg-bg-2"
        :class="props.mode === 'pc' ? 'grid-cols-2 rounded-[16px]' : 'grid-cols-2'"
      >
        <!-- 当前进度卡片 -->
        <div
          class="flex flex-col items-center justify-center border-r border-opacity-5"
          :class="
            props.mode === 'pc'
              ? 'min-h-[132px] gap-3 px-5 py-5'
              : 'min-h-[67px] gap-1.5 px-3 py-3.5'
          "
        >
          <!-- 当前进度数值行 -->
          <div class="flex items-center justify-center gap-1.5">
            <span
              class="font-[700] text-common-100"
              :class="props.mode === 'pc' ? 'text-[24px] leading-[29px]' : 'text-lg leading-[22px]'"
            >
              {{ props.currentProgressValue }}
            </span>
            <span
              class="font-[400] text-common-100"
              :class="props.mode === 'pc' ? 'text-base leading-[20px]' : 'text-xs leading-[15px]'"
            >
              {{ props.currentProgressUnit }}
            </span>
          </div>

          <!-- 当前进度说明行 -->
          <div class="flex items-center justify-center gap-1.5">
            <span
              class="font-[400] text-text-2"
              :class="props.mode === 'pc' ? 'text-sm leading-[20px]' : 'text-[11px] leading-[14px]'"
            >
              {{ props.currentProgressLabel }}
            </span>
            <span
              class="flex items-center justify-center rounded-full border border-text-2 text-text-2"
              :class="props.mode === 'pc' ? 'h-5 w-5 text-[10px]' : 'h-3.5 w-3.5 text-[8px]'"
            >
              ?
            </span>
          </div>
        </div>

        <!-- 本周最大奖励卡片 -->
        <div
          class="flex flex-col items-center justify-center"
          :class="
            props.mode === 'pc'
              ? 'min-h-[132px] gap-3 px-5 py-5'
              : 'min-h-[67px] gap-1.5 px-3 py-3.5'
          "
        >
          <!-- 本周最大奖励数值 -->
          <span
            class="font-[700] text-common-100"
            :class="props.mode === 'pc' ? 'text-[24px] leading-[29px]' : 'text-lg leading-[22px]'"
          >
            {{ props.maxRewardValue }}
          </span>

          <!-- 本周最大奖励说明 -->
          <span
            class="text-center font-[400] text-text-2"
            :class="props.mode === 'pc' ? 'text-sm leading-[20px]' : 'text-[11px] leading-[14px]'"
          >
            {{ props.maxRewardLabel }}
          </span>
        </div>
      </section>

      <!-- 奖励表格区域 -->
      <section
        class="overflow-hidden rounded-[10px] bg-bg-2"
        :class="props.mode === 'pc' ? 'rounded-[16px]' : ''"
      >
        <!-- 奖励表格头部 -->
        <div class="grid grid-cols-3 bg-bg-2">
          <!-- 奖励表格头部第一列 -->
          <div
            class="flex items-center justify-center text-center font-[400] text-text-2"
            :class="
              props.mode === 'pc' ? 'min-h-[64px] px-3 text-sm' : 'min-h-[34px] px-2 text-[11px]'
            "
          >
            {{ props.invitedSignUpsLabel }}
          </div>

          <!-- 奖励表格头部第二列 -->
          <div
            class="flex items-center justify-center text-center font-[400] text-text-2"
            :class="
              props.mode === 'pc' ? 'min-h-[64px] px-3 text-sm' : 'min-h-[34px] px-2 text-[11px]'
            "
          >
            {{ props.rewardLabel }}
          </div>

          <!-- 奖励表格头部第三列 -->
          <div
            class="flex items-center justify-center text-center font-[400] text-text-2"
            :class="
              props.mode === 'pc' ? 'min-h-[64px] px-3 text-sm' : 'min-h-[34px] px-2 text-[11px]'
            "
          >
            {{ props.statusLabel }}
          </div>
        </div>

        <!-- 奖励表格列表 -->
        <div>
          <!-- 奖励表格行 -->
          <div
            v-for="(item, index) in props.rewardRows"
            :key="`${item.invitedFriends}-${item.reward}`"
            class="grid grid-cols-3"
            :class="index % 2 === 0 ? 'bg-common-100/5' : ''"
          >
            <!-- 奖励表格行第一列 -->
            <div
              class="flex items-center justify-center text-center text-common-100"
              :class="
                props.mode === 'pc' ? 'min-h-[68px] px-3 text-base' : 'min-h-[37px] px-2 text-sm'
              "
            >
              {{ item.invitedFriends }}
            </div>

            <!-- 奖励表格行第二列 -->
            <div
              class="flex items-center justify-center text-center text-common-100"
              :class="
                props.mode === 'pc' ? 'min-h-[68px] px-3 text-base' : 'min-h-[37px] px-2 text-sm'
              "
            >
              {{ item.reward }}
            </div>

            <!-- 奖励表格行第三列 -->
            <div
              class="flex items-center justify-center text-center text-text-3"
              :class="
                props.mode === 'pc' ? 'min-h-[68px] px-3 text-base' : 'min-h-[37px] px-2 text-sm'
              "
            >
              {{ item.status }}
            </div>
          </div>
        </div>
      </section>

      <!-- 有效邀请说明区域 -->
      <section class="flex flex-col" :class="props.mode === 'pc' ? 'gap-4' : 'gap-2.5'">
        <!-- 有效邀请标题 -->
        <h2
          class="font-[400] text-common-100"
          :class="props.mode === 'pc' ? 'text-[20px] leading-[26px]' : 'text-sm leading-[17px]'"
        >
          {{ props.validInviteTitle }}
        </h2>

        <!-- 有效邀请内容卡片 -->
        <div
          class="rounded-[10px] bg-bg-2"
          :class="props.mode === 'pc' ? 'rounded-[16px] p-5' : 'p-3.5'"
        >
          <!-- 有效邀请说明文案 -->
          <p
            class="font-[400] text-text-2"
            :class="props.mode === 'pc' ? 'text-base leading-[26px]' : 'text-xs leading-[17px]'"
          >
            {{ props.validInviteDescription }}
          </p>
        </div>
      </section>

      <!-- 任务规则区域 -->
      <section class="flex flex-col" :class="props.mode === 'pc' ? 'gap-4' : 'gap-2.5'">
        <!-- 任务规则标题 -->
        <h2
          class="font-[400] text-common-100"
          :class="props.mode === 'pc' ? 'text-[20px] leading-[26px]' : 'text-sm leading-[17px]'"
        >
          {{ props.taskRulesTitle }}
        </h2>

        <!-- 任务规则图片卡片 -->
        <div
          class="overflow-hidden rounded-[10px] bg-bg-2"
          :class="props.mode === 'pc' ? 'rounded-[16px]' : ''"
        >
          <!-- 任务规则占位图片 -->
          <img
            :src="props.taskRulesImage"
            :alt="props.taskRulesTitle"
            class="h-full w-full object-cover"
          />
        </div>
      </section>

      <!-- 页面底部按钮区域 -->
      <section>
        <!-- 页面底部领取按钮 -->
        <button
          type="button"
          class="flex w-full items-center justify-center rounded-[10px] bg-theme-primary font-[700] text-text-4"
          :class="props.mode === 'pc' ? 'h-[56px] text-base' : 'h-10 text-sm'"
          @click="$emit('claim')"
        >
          {{ props.claimText }}
        </button>
      </section>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { ReferralTaskRewardRow, ReferralTaskTab, ReferralTaskTabKey } from '../shared'

interface Props {
  mode: 'mobile' | 'pc'
  resetHint: string
  rewardsToClaimLabel: string
  rewardsToClaimAmount: string
  coinImage: string
  claimText: string
  tabs: ReferralTaskTab[]
  activeTab: ReferralTaskTabKey
  currentProgressValue: string
  currentProgressUnit: string
  currentProgressLabel: string
  maxRewardValue: string
  maxRewardLabel: string
  invitedSignUpsLabel: string
  rewardLabel: string
  statusLabel: string
  rewardRows: ReferralTaskRewardRow[]
  validInviteTitle: string
  validInviteDescription: string
  taskRulesTitle: string
  taskRulesImage: string
}

const props = defineProps<Props>()

defineEmits<{
  claim: []
  'tab-click': [value: ReferralTaskTabKey]
}>()
</script>
