<template>
  <!-- 规则页内容容器 -->
  <section class="relative overflow-hidden" style="font-family: Inter, avertastd, sans-serif">
    <!-- 页面主要内容区域 -->
    <main class="px-[14px] pt-[20px] pb-[30px]">
      <!-- Guide 区域 -->
      <section class="mb-[20px]">
        <!-- Guide 标题 -->
        <h2 class="mb-[10px] text-[14px] font-[400] leading-[17px] text-text-1">
          {{ props.guideTitle }}
        </h2>

        <!-- Guide 封面卡片 -->
        <div class="relative h-[195px] overflow-hidden rounded-[10px] bg-bg-2">
          <!-- Guide 封面图片 -->
          <img class="h-full w-full object-cover" :src="props.guideImage" :alt="props.guideTitle" />

          <!-- Guide 封面遮罩 -->
          <div class="absolute inset-0 bg-mask-40"></div>

          <!-- Guide 播放按钮 -->
          <button
            type="button"
            class="absolute left-1/2 top-1/2 flex h-[50px] w-[50px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-mask-60-1"
            @click="$emit('play-guide')"
          >
            <!-- 播放图标 -->
            <svg viewBox="0 0 24 24" fill="currentColor" class="ml-[2px] h-5 w-5 text-common-100">
              <path
                d="M8 6.82v10.36c0 .79.87 1.27 1.54.84l8.14-5.18a1 1 0 0 0 0-1.68L9.54 5.98A1 1 0 0 0 8 6.82Z"
              />
            </svg>
          </button>
        </div>
      </section>

      <!-- How to Earn 区域 -->
      <section class="mb-[20px]">
        <!-- How to Earn 标题 -->
        <h2 class="mb-[10px] text-[14px] font-[400] leading-[17px] text-text-1">
          {{ props.howToEarnTitle }}
        </h2>

        <!-- How to Earn 卡片 -->
        <div class="rounded-[10px] bg-bg-2 p-[14px]">
          <!-- How to Earn 步骤列表 -->
          <div class="flex flex-col gap-[20px]">
            <!-- 单个步骤项 -->
            <div
              v-for="item in props.earnSteps"
              :key="item.step"
              class="flex items-center gap-[10px]"
            >
              <!-- 步骤图标容器 -->
              <div
                class="flex h-[50px] w-[50px] shrink-0 items-center justify-center rounded-full bg-common-100/10"
              >
                <!-- 分享图标 -->
                <svg
                  v-if="item.icon === 'share'"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  class="h-[30px] w-[30px] text-text-2"
                >
                  <path
                    d="M18 16.1c-.76 0-1.44.3-1.96.78l-7.13-4.15c.05-.23.09-.47.09-.73s-.04-.5-.09-.73l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-2.97-3-2.97-3 1.31-3 2.97c0 .26.04.53.09.76l-7.05 4.11A2.99 2.99 0 0 0 6 9.03c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92 0-1.61-1.31-2.93-2.92-2.93Z"
                  />
                </svg>

                <!-- 奖励图标 -->
                <svg
                  v-else-if="item.icon === 'reward'"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  class="h-[30px] w-[30px] text-text-2"
                >
                  <path
                    d="m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2Z"
                  />
                </svg>

                <!-- 解锁图标 -->
                <svg
                  v-else
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  class="h-[30px] w-[30px] text-text-2"
                >
                  <path
                    d="M17 8H9V6c0-1.66 1.34-3 3-3 1.31 0 2.42.84 2.83 2h2.07A5.03 5.03 0 0 0 12 1C9.24 1 7 3.24 7 6v2c-1.1 0-2 .9-2 2v11c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2Zm-4 9.73V20h-2v-2.27a2 2 0 1 1 2 0Z"
                  />
                </svg>
              </div>

              <!-- 步骤文案区域 -->
              <div class="flex min-h-[34px] flex-1 flex-col justify-center gap-[5px]">
                <!-- 步骤标题 -->
                <p class="text-[12px] font-[700] leading-[15px] text-text-1">
                  {{ item.step }}
                </p>

                <!-- 步骤说明 -->
                <p class="text-[12px] font-[400] leading-[15px] text-text-1">
                  {{ item.text }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Referral Rules 区域 -->
      <section>
        <!-- Referral Rules 标题 -->
        <h2 class="mb-[10px] text-[14px] font-[400] leading-[17px] text-text-1">
          {{ props.referralRulesTitle }}
        </h2>

        <!-- Referral Rules 表格卡片 -->
        <div class="overflow-hidden rounded-[10px] bg-bg-2">
          <!-- 表格表头 -->
          <div class="grid h-[35px] grid-cols-3 items-center">
            <!-- 表头单元格 -->
            <div
              v-for="column in props.tableColumns"
              :key="column"
              class="text-center text-[12px] font-[400] leading-[15px] text-text-2"
            >
              {{ column }}
            </div>
          </div>

          <!-- 表格数据区域 -->
          <div>
            <!-- 表格数据行 -->
            <div
              v-for="(row, index) in props.referralRules"
              :key="row.level"
              class="grid h-[37px] grid-cols-3 items-center"
              :class="index % 2 === 0 ? 'bg-common-100/5' : 'bg-transparent'"
            >
              <!-- 等级单元格 -->
              <div class="text-center text-[14px] font-[400] leading-[17px] text-text-1">
                {{ row.level }}
              </div>

              <!-- 有效好友单元格 -->
              <div class="text-center text-[14px] font-[400] leading-[17px] text-text-1">
                {{ row.activeFriends }}
              </div>

              <!-- 佣金比例单元格 -->
              <div class="text-center text-[14px] font-[400] leading-[17px] text-text-1">
                {{ row.rate }}
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>

    <!-- 页面底部操作区 -->
    <footer
      class="bg-bg-1 px-[14px] pt-[30px]"
      :class="
        props.mode === 'mobile'
          ? 'sticky bottom-0 pb-[calc(env(safe-area-inset-bottom)+30px)]'
          : 'pb-[30px]'
      "
    >
      <!-- 邀请按钮 -->
      <button
        type="button"
        class="h-[40px] w-full rounded-[8px] bg-theme-2 text-[14px] font-[700] leading-[17px] text-text-4"
        @click="$emit('invite')"
      >
        {{ props.inviteText }}
      </button>
    </footer>
  </section>
</template>

<script setup lang="ts">
import type { ReferralRulesRow, ReferralRulesStep } from '../shared'

interface Props {
  mode: 'mobile' | 'pc'
  guideTitle: string
  guideImage: string
  howToEarnTitle: string
  referralRulesTitle: string
  inviteText: string
  tableColumns: string[]
  earnSteps: ReferralRulesStep[]
  referralRules: ReferralRulesRow[]
}

const props = defineProps<Props>()

defineEmits<{
  'play-guide': []
  invite: []
}>()
</script>
