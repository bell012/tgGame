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
        <div
          class="relative overflow-hidden bg-bg-2"
          :class="
            props.mode === 'pc'
              ? 'w-full aspect-[1032/580] rounded-[16px]'
              : 'h-[195px] rounded-[10px]'
          "
        >
          <!-- Guide 封面图片 -->
          <img class="h-full w-full object-cover" :src="props.guideImage" :alt="props.guideTitle" />

          <!-- Guide 封面遮罩 -->
          <div class="absolute inset-0 bg-mask-40"></div>

          <!-- Guide 播放按钮 -->
          <button
            type="button"
            class="absolute left-1/2 top-1/2 flex h-[50px] w-[50px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full"
            @click="$emit('play-guide')"
          >
            <!-- 播放图标 -->
            <!-- <svg viewBox="0 0 24 24" fill="currentColor" class="ml-[2px] h-5 w-5 text-common-100">
              <path
                d="M8 6.82v10.36c0 .79.87 1.27 1.54.84l8.14-5.18a1 1 0 0 0 0-1.68L9.54 5.98A1 1 0 0 0 8 6.82Z"
              />
            </svg> -->
          </button>
        </div>
      </section>

      <!-- How to Earn 区域 -->
      <section class="mb-[20px]">
        <!-- How to Earn 标题 -->
        <h2
          class="mb-[10px] text-text-1"
          :class="
            props.mode === 'pc'
              ? 'text-[20px] font-[400] leading-[24px]'
              : 'text-[14px] font-[400] leading-[17px]'
          "
        >
          {{ props.howToEarnTitle }}
        </h2>

        <!-- How to Earn 卡片 -->
        <div
          class="bg-bg-2"
          :class="
            props.mode === 'pc' ? 'w-full rounded-[16px] p-[24px]' : 'rounded-[10px] p-[14px]'
          "
        >
          <template v-if="props.mode === 'pc'">
            <!-- How to Earn 步骤列表 -->
            <div class="grid h-[150px] w-full grid-cols-3">
              <!-- 单个步骤项 -->
              <div
                v-for="(item, index) in props.earnSteps"
                :key="item.step"
                class="flex h-[150px] min-w-0 items-center justify-center px-[40px]"
                :class="index === 1 ? 'border-x border-white/[0.06]' : ''"
              >
                <!-- 单个步骤内容 -->
                <div class="flex h-[150px] w-full flex-col items-center justify-center gap-[15px]">
                  <!-- 步骤标题图标组合 -->
                  <div class="flex flex-col items-center gap-[16px]">
                    <!-- 步骤图标容器 -->
                    <div
                      class="flex h-[60px] w-[60px] shrink-0 items-center justify-center rounded-full bg-common-100/10"
                    >
                      <!-- 步骤图片图标 -->
                      <img
                        :src="stepIconImages[index]"
                        :alt="item.step"
                        class="h-[36px] w-[36px] object-contain"
                      />
                    </div>

                    <!-- 步骤标题 -->
                    <p class="text-[16px] font-[700] leading-[19px] text-text-1">
                      {{ item.step }}
                    </p>
                  </div>

                  <!-- 步骤说明 -->
                  <p class="text-center text-[14px] font-[400] leading-[20px] text-text-1">
                    {{ item.text }}
                  </p>
                </div>
              </div>
            </div>
          </template>

          <template v-else>
            <!-- How to Earn 步骤列表 -->
            <div class="flex flex-col gap-[20px]">
              <!-- 单个步骤项 -->
              <div
                v-for="(item, index) in props.earnSteps"
                :key="item.step"
                class="flex items-center gap-[10px]"
              >
                <!-- 步骤图标容器 -->
                <div
                  class="flex h-[50px] w-[50px] shrink-0 items-center justify-center rounded-full bg-bg-3"
                >
                  <!-- 步骤图片图标 -->
                  <img
                    :src="stepIconImages[index]"
                    :alt="item.step"
                    class="h-[30px] w-[30px] object-contain"
                  />
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
          </template>
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
              :class="index % 2 === 0 ? 'bg-opacity-6' : 'bg-bg-2'"
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
                {{ row.rate + '%' }}
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
        class="h-[40px] w-full rounded-[8px] bg-theme-primary text-[14px] font-[700] leading-[17px] text-text-4"
        @click="$emit('invite')"
      >
        {{ props.inviteText }}
      </button>
    </footer>
  </section>
</template>

<script setup lang="ts">
import stepIconReward from '@/static/img/referral/rules-step-reward.png'
import stepIconShare from '@/static/img/referral/rules-step-share.png'
import stepIconUnlock from '@/static/img/referral/rules-step-unlock.png'
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
const stepIconImages = [stepIconShare, stepIconReward, stepIconUnlock]

defineEmits<{
  'play-guide': []
  invite: []
}>()
</script>
