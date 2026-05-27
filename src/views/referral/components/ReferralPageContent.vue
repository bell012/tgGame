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
        <div v-if="props.mode !== 'pc'" class="grid grid-cols-4 gap-2.5">
          <!-- 快捷入口按钮 -->
          <button
            v-for="item in props.quickActions"
            :key="item.id"
            type="button"
            class="flex flex-col items-center justify-start gap-2 rounded-[10px]"
            @click="$emit('quick-action', item.id)"
          >
            <!-- 快捷入口图标 -->
            <img :src="item.icon" :alt="item.label" class="h-[46px] w-[46px] object-contain" />

            <!-- 快捷入口文案 -->
            <span class="text-center text-sm font-[400] leading-[17px] text-text-1">
              {{ item.label }}
            </span>
          </button>
        </div>

        <!-- 活动横幅 -->
        <div
          class="overflow-hidden"
          :class="props.mode === 'pc' ? 'rounded-[16px]' : 'rounded-[10px]'"
        >
          <!-- 横幅骨架占位 -->
          <div
            v-if="props.bannerLoading || props.bannerSlides.length === 0"
            class="w-full animate-pulse bg-bg-2"
            :class="props.mode === 'pc' ? 'h-[180px]' : 'h-[100px]'"
          ></div>

          <!-- 横幅轮播区域 -->
          <div v-else class="relative">
            <!-- 横幅轮播组件 -->
            <Swipe
              class="w-full"
              :autoplay="props.bannerSlides.length > 1 ? bannerAutoplayInterval : 0"
              :show-indicators="false"
              :touchable="props.bannerSlides.length > 1"
              lazy-render
              @change="handleBannerChange"
            >
              <!-- 横幅轮播项 -->
              <SwipeItem v-for="slide in props.bannerSlides" :key="slide.rowId">
                <!-- 横幅点击按钮 -->
                <button type="button" class="block w-full" @click="$emit('banner-click', slide)">
                  <!-- 横幅图片 -->
                  <img
                    :src="slide.url"
                    alt="referral banner"
                    class="w-full object-cover"
                    :class="props.mode === 'pc' ? 'h-[180px]' : 'h-[100px]'"
                  />
                </button>
              </SwipeItem>
            </Swipe>

            <!-- <div
              v-if="props.bannerSlides.length > 1"
              class="pointer-events-none absolute inset-x-0 bottom-2 flex items-center justify-center gap-1.5"
            >
              <span
                v-for="(slide, index) in props.bannerSlides"
                :key="`banner-indicator-${slide.rowId}`"
                class="rounded-full transition-all duration-300"
                :class="
                  bannerActiveIndex === index
                    ? 'h-[5px] w-6 bg-theme-primary'
                    : 'h-[5px] w-[5px] bg-common-100/30'
                "
              ></span>
            </div> -->
          </div>
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
          <!-- 社交分享骨架列表 -->
          <div
            v-if="props.socialChannelsLoading"
            class="flex min-w-max"
            :class="props.mode === 'pc' ? 'gap-6' : 'gap-3.5'"
          >
            <!-- 社交分享骨架项 -->
            <div
              v-for="index in socialChannelSkeletonCount"
              :key="`social-channel-skeleton-${index}`"
              class="flex flex-col items-center"
              :class="props.mode === 'pc' ? 'w-[88px] gap-3' : 'w-[60px] gap-2'"
            >
              <!-- 社交分享骨架图标 -->
              <div
                class="animate-pulse rounded-[15px] bg-bg-4"
                :class="props.mode === 'pc' ? 'h-[72px] w-[72px]' : 'h-10 w-10'"
              ></div>

              <!-- 社交分享骨架文案 -->
              <div
                class="animate-pulse rounded-full bg-bg-4"
                :class="props.mode === 'pc' ? 'h-4 w-16' : 'h-3 w-12'"
              ></div>
            </div>
          </div>

          <!-- 社交分享按钮列表 -->
          <div v-else class="flex min-w-max" :class="props.mode === 'pc' ? 'gap-6' : 'gap-3.5'">
            <!-- 社交分享按钮 -->
            <button
              v-for="item in props.socialChannels"
              :key="`${item.shareName}-${item.sort}`"
              type="button"
              class="flex flex-col items-center"
              :class="props.mode === 'pc' ? 'w-[88px] gap-3' : 'w-[60px] gap-2'"
              @click="$emit('share-channel', item)"
            >
              <!-- 社交分享图标容器 -->
              <div
                class="flex items-center justify-center"
                :class="props.mode === 'pc' ? 'h-[72px] w-[72px]' : 'h-10 w-10'"
              >
                <!-- 社交分享图标 -->
                <img
                  :src="item.shareDomainImage"
                  :alt="item.shareName"
                  class="h-full w-full object-contain"
                />
              </div>

              <!-- 社交分享文案 -->
              <span
                class="w-full text-center font-[400] text-text-1"
                :class="props.mode === 'pc' ? 'text-sm leading-[20px]' : 'text-xs leading-[15px]'"
              >
                {{ item.shareName }}
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
        class="rounded-[10px] bg-bg-2"
        :class="props.mode === 'pc' ? 'h-[96px] w-full rounded-[16px] p-[24px]' : 'px-3.5 py-3.5'"
      >
        <template v-if="props.mode === 'pc'">
          <!-- 佣金概览区域内容 -->
          <div class="flex h-[48px] w-full items-center gap-[24px] self-stretch">
            <!-- 左侧佣金信息区域 -->
            <div class="flex h-[48px] min-w-0 flex-[1_1_0%] items-center gap-[16px]">
              <!-- 标题区域 -->
              <div class="flex h-[20px] min-w-0 flex-[0_1_auto] items-center gap-[8px]">
                <!-- 佣金图标 -->
                <CommissionOverviewPcIcon
                  class="h-[20px] w-[20px] shrink-0 text-text-1"
                  :aria-label="props.estimatedCommissionLabel"
                />

                <!-- 佣金标题 -->
                <p
                  class="flex h-[19px] min-w-0 items-center truncate whitespace-nowrap text-[16px] font-[700] leading-[19px] text-text-1"
                >
                  {{ `${props.estimatedCommissionLabel}：` }}
                </p>
              </div>

              <!-- 佣金额度 -->
              <span
                class="flex h-[48px] min-w-0 flex-[0_1_auto] items-center whitespace-nowrap text-[40px] font-[700] leading-[48px] text-theme-primary"
              >
                {{ props.estimatedCommissionAmount }}
              </span>
            </div>

            <!-- 领取佣金按钮 -->
            <button
              type="button"
              class="flex h-[48px] w-full min-w-[120px] max-w-[280px] flex-[1_1_220px] items-center justify-center gap-[10px] rounded-[8px] px-[8px] text-[14px] font-[700] leading-[17px] text-text-4"
              :class="isClaimDisabled ? 'cursor-not-allowed bg-theme-2' : 'bg-theme-primary'"
              :disabled="isClaimDisabled"
              @click="$emit('claim')"
            >
              {{ props.claimText }}
            </button>
          </div>
        </template>

        <template v-else>
          <!-- 佣金概览移动端布局 -->
          <div class="flex items-center justify-between">
            <!-- 佣金概览左侧 -->
            <div class="flex min-w-0 items-center gap-2.5">
              <!-- 佣金图标 -->
              <img
                :src="props.commissionCoinImage"
                :alt="props.estimatedCommissionLabel"
                class="h-10 w-10 rounded-full object-cover"
              />

              <!-- 佣金文案区域 -->
              <div class="flex min-w-0 flex-col gap-1.5">
                <!-- 佣金标题 -->
                <p class="text-xs font-[400] leading-[15px] text-text-1">
                  {{ props.estimatedCommissionLabel }}
                </p>

                <!-- 佣金额度 -->
                <div class="flex items-center gap-[7px]">
                  <!-- 佣金额度文本 -->
                  <span class="text-lg font-[700] leading-[22px] text-text-1">
                    {{ props.estimatedCommissionAmount }}
                  </span>

                  <!-- 佣金额度右侧装饰图 -->
                  <img
                    :src="inviteTaskRightImage"
                    alt="commission amount icon"
                    class="h-[14px] w-[14px] object-contain"
                  />
                </div>
              </div>
            </div>

            <!-- 领取佣金按钮 -->
            <button
              type="button"
              class="flex h-[35px] w-[94px] shrink-0 items-center justify-center rounded-[10px] text-sm font-[700] text-text-4"
              :class="isClaimDisabled ? 'cursor-not-allowed bg-theme-2' : 'bg-theme-primary'"
              :disabled="isClaimDisabled"
              @click="$emit('claim')"
            >
              {{ props.claimText }}
            </button>
          </div>
        </template>
      </section>

      <!-- 佣金加码骨架区域 -->
      <section
        v-if="props.commissionBoostLoading"
        class="flex flex-col items-center justify-center bg-bg-2"
        :class="
          props.mode === 'pc'
            ? 'h-[447px] w-full gap-[24px] rounded-[16px] pb-[24px]'
            : 'gap-2.5 rounded-[10px] pb-2.5'
        "
      >
        <!-- 周维度切换骨架 -->
        <div
          class="w-full bg-bg-2"
          :class="props.mode === 'pc' ? 'h-[52px] pt-[12px]' : 'h-[42px]'"
        >
          <div class="flex w-full" :class="props.mode === 'pc' ? 'h-[40px]' : 'h-[27px] gap-px'">
            <div
              class="animate-pulse rounded-[10px] bg-bg-4"
              :class="props.mode === 'pc' ? 'h-full flex-1' : 'h-full flex-1'"
            ></div>
            <div
              class="animate-pulse rounded-[10px] bg-bg-4"
              :class="props.mode === 'pc' ? 'h-full flex-1' : 'h-full flex-1'"
            ></div>
          </div>
        </div>

        <!-- 顶部统计卡片骨架 -->
        <div
          class="flex items-center bg-bg-3"
          :class="
            props.mode === 'pc'
              ? 'mx-[24px] h-[98px] self-stretch gap-[33px] rounded-[16px] py-[24px]'
              : 'min-h-[82px] w-[calc(100%-28px)] gap-[14px] rounded-[10px] px-[14px] py-[14px]'
          "
        >
          <div
            class="flex flex-1 flex-col items-center"
            :class="props.mode === 'pc' ? 'gap-[13px]' : 'gap-[5px]'"
          >
            <div
              class="animate-pulse rounded-full bg-bg-4"
              :class="props.mode === 'pc' ? 'h-[17px] w-[96px]' : 'h-[19px] w-[72px]'"
            ></div>
            <div
              class="animate-pulse rounded-full bg-bg-4"
              :class="props.mode === 'pc' ? 'h-[20px] w-[160px]' : 'h-[13px] w-[100px]'"
            ></div>
          </div>

          <div
            class="animate-pulse rounded-[10px] bg-bg-4"
            :class="props.mode === 'pc' ? 'h-[28px] w-[56px]' : 'h-[20px] w-[42px]'"
          ></div>

          <div
            class="flex flex-1 flex-col items-center"
            :class="props.mode === 'pc' ? 'gap-[13px]' : 'gap-[5px]'"
          >
            <div
              class="animate-pulse rounded-full bg-bg-4"
              :class="props.mode === 'pc' ? 'h-[17px] w-[80px]' : 'h-[19px] w-[60px]'"
            ></div>
            <div
              class="animate-pulse rounded-full bg-bg-4"
              :class="props.mode === 'pc' ? 'h-[20px] w-[88px]' : 'h-[13px] w-[56px]'"
            ></div>
          </div>
        </div>

        <!-- 等级规则区域骨架 -->
        <div
          class="flex w-full flex-col items-start overflow-hidden bg-bg-3"
          :class="
            props.mode === 'pc'
              ? 'mx-[24px] h-[225px] self-stretch gap-[24px] rounded-[16px]'
              : 'w-[calc(100%-28px)] gap-[14px] rounded-[10px]'
          "
        >
          <div
            class="flex w-full flex-col items-center"
            :class="props.mode === 'pc' ? 'h-[84px] justify-center gap-[24px]' : 'gap-[14px]'"
          >
            <div
              class="box-border flex w-full items-center justify-between border-b border-white/[0.06]"
              :class="
                props.mode === 'pc'
                  ? 'h-[48px] px-[24px] py-[12px]'
                  : 'h-[40px] px-[14px] py-[10px]'
              "
            >
              <div
                class="flex items-center"
                :class="props.mode === 'pc' ? 'gap-[24px]' : 'gap-[10px]'"
              >
                <div
                  class="animate-pulse rounded-full bg-bg-4"
                  :class="props.mode === 'pc' ? 'h-[20px] w-[141px]' : 'h-[14px] w-[90px]'"
                ></div>
                <div
                  class="animate-pulse rounded-full bg-bg-4"
                  :class="props.mode === 'pc' ? 'h-[20px] w-[127px]' : 'h-[14px] w-[82px]'"
                ></div>
              </div>
              <div
                class="animate-pulse rounded-[8px] bg-bg-4"
                :class="props.mode === 'pc' ? 'h-[24px] w-[24px]' : 'h-[20px] w-[20px]'"
              ></div>
            </div>

            <div
              class="relative rounded-[30px] bg-theme-3"
              :class="
                props.mode === 'pc'
                  ? 'mx-[24px] h-[12px] self-stretch'
                  : 'mb-[14px] h-[8px] w-[calc(100%-28px)]'
              "
            >
              <div
                class="absolute left-0 top-0 h-full rounded-[30px] bg-bg-4"
                :class="props.mode === 'pc' ? 'w-[32%]' : 'w-[28%]'"
              ></div>
            </div>
          </div>

          <div class="w-full overflow-x-auto">
            <div
              class="flex items-start"
              :class="
                props.mode === 'pc'
                  ? 'h-[45px] w-full justify-between px-[24px]'
                  : 'w-[412px] gap-[30px] px-[14px]'
              "
            >
              <div
                v-for="index in props.mode === 'pc' ? 7 : 5"
                :key="`commission-boost-skeleton-level-${index}`"
                class="flex shrink-0 flex-col items-center justify-center"
                :class="
                  props.mode === 'pc'
                    ? 'h-[45px] min-w-[96px] gap-[8px]'
                    : 'min-h-[52px] w-[55px] gap-[5px]'
                "
              >
                <div
                  class="animate-pulse rounded-full bg-bg-4"
                  :class="props.mode === 'pc' ? 'h-[17px] w-[44px]' : 'h-[14px] w-[38px]'"
                ></div>
                <div
                  class="animate-pulse rounded-full bg-bg-4"
                  :class="props.mode === 'pc' ? 'h-[20px] w-[96px]' : 'h-[15px] w-[55px]'"
                ></div>
              </div>
            </div>
          </div>

          <div
            class="box-border flex w-full items-center justify-between border-t border-white/[0.06]"
            :class="
              props.mode === 'pc' ? 'h-[48px] px-[24px] py-[12px]' : 'h-[40px] px-[14px] py-[10px]'
            "
          >
            <div
              class="animate-pulse rounded-full bg-bg-4"
              :class="props.mode === 'pc' ? 'h-[20px] w-[160px]' : 'h-[14px] w-[110px]'"
            ></div>
            <div
              class="flex items-center"
              :class="props.mode === 'pc' ? 'gap-[8px]' : 'gap-[10px]'"
            >
              <div
                class="animate-pulse rounded-full bg-bg-4"
                :class="props.mode === 'pc' ? 'h-[20px] w-[36px]' : 'h-[14px] w-[28px]'"
              ></div>
              <div
                class="animate-pulse rounded-[8px] bg-bg-4"
                :class="props.mode === 'pc' ? 'h-[24px] w-[24px]' : 'h-[20px] w-[20px]'"
              ></div>
            </div>
          </div>
        </div>
      </section>

      <!-- 邀请任务卡片 -->
      <section
        v-else-if="!props.showCommissionBoost"
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
              class="flex w-fit items-center rounded-full bg-opacity-15 text-common-100"
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
              class="absolute rounded-full bg-opacity-10 blur-[2px]"
              :class="
                props.mode === 'pc'
                  ? 'right-[26px] top-[-48px] h-[110px] w-[110px]'
                  : 'right-[10px] top-[-22px] h-[52px] w-[52px]'
              "
            ></div>

            <!-- 邀请任务装饰图 -->
            <img
              :src="inviteTaskDecorationImage"
              alt="reward decoration"
              class="relative object-contain opacity-95"
              :class="
                props.mode === 'pc'
                  ? 'h-[128px] w-[128px] translate-x-[-8px]'
                  : 'h-[68px] w-[68px] translate-x-[-8px]'
              "
            />
          </div>
        </div>
      </section>

      <!-- 佣金加码统计区域 -->
      <section
        v-else
        class="flex flex-col items-center justify-center bg-bg-2"
        :class="
          props.mode === 'pc'
            ? 'h-[447px] w-full gap-[24px] rounded-[16px] pb-[24px]'
            : 'gap-2.5 rounded-[10px] pb-2.5'
        "
      >
        <!-- 周维度切换区域 -->
        <div
          class="relative w-full bg-bg-2"
          :class="
            props.mode === 'pc' ? 'h-[52px] pt-[12px] rounded-[16px] ' : 'rounded-[10px] h-[42px]'
          "
        >
          <!-- 周维度切换栏 -->
          <div
            class="absolute bottom-0 right-0 flex w-full"
            :class="props.mode === 'pc' ? 'h-[40px]' : 'h-[27px] gap-px'"
          >
            <!-- 本周按钮 -->
            <button
              type="button"
              class="flex flex-1 flex-col items-center"
              :class="
                props.mode === 'pc'
                  ? 'h-[40px] justify-between gap-[8px] self-stretch pt-[12px]'
                  : 'gap-2'
              "
              @click="$emit('change-commission-boost-period-tab', 'current')"
            >
              <div
                class="flex w-full items-center justify-center text-center font-[700]"
                :class="
                  props.mode === 'pc'
                    ? [
                        'h-[17px] w-[72px] text-[14px] leading-[17px]',
                        props.activeCommissionBoostPeriodTab === 'current'
                          ? 'text-text-1'
                          : 'text-text-2'
                      ]
                    : [
                        'h-[17px] text-[14px] leading-[17px]',
                        props.activeCommissionBoostPeriodTab === 'current'
                          ? 'text-text-1'
                          : 'text-text-2'
                      ]
                "
              >
                {{ props.currentPeriodText }}
              </div>
              <div
                v-if="props.activeCommissionBoostPeriodTab === 'current'"
                class="w-full self-stretch rounded-[10px] bg-theme-primary"
                :class="props.mode === 'pc' ? 'h-[2px]' : 'h-[2px]'"
              ></div>
            </button>

            <!-- 上周按钮 -->
            <button
              type="button"
              class="flex flex-1 flex-col items-center"
              :class="
                props.mode === 'pc'
                  ? 'h-[40px] justify-between gap-[8px] self-stretch pt-[12px]'
                  : 'gap-2'
              "
              @click="$emit('change-commission-boost-period-tab', 'previous')"
            >
              <div
                class="flex w-full items-center justify-center text-center font-[700]"
                :class="
                  props.mode === 'pc'
                    ? [
                        'h-[17px] w-[72px] text-[14px] leading-[17px]',
                        props.activeCommissionBoostPeriodTab === 'previous'
                          ? 'text-text-1'
                          : 'text-text-2'
                      ]
                    : [
                        'h-[17px] text-[14px] leading-[17px]',
                        props.activeCommissionBoostPeriodTab === 'previous'
                          ? 'text-text-1'
                          : 'text-text-2'
                      ]
                "
              >
                {{ props.previousPeriodText }}
              </div>
              <div
                v-if="props.activeCommissionBoostPeriodTab === 'previous'"
                class="w-full self-stretch rounded-[10px] bg-theme-primary"
                :class="props.mode === 'pc' ? 'h-[2px]' : 'h-[2px]'"
              ></div>
            </button>
          </div>
        </div>

        <!-- 顶部统计卡片 -->
        <div
          class="flex items-center bg-bg-3"
          :class="
            props.mode === 'pc'
              ? 'mx-[24px] h-[98px] self-stretch gap-[33px] rounded-[16px] py-[24px]'
              : 'min-h-[82px] w-[calc(100%-28px)] gap-[14px] rounded-[10px] px-[14px] py-[14px]'
          "
        >
          <div
            class="flex flex-1 flex-col items-center"
            :class="props.mode === 'pc' ? 'h-[50px] gap-[13px]' : 'gap-[5px]'"
          >
            <div
              class="flex w-full items-center justify-center text-center font-[700] text-text-1"
              :class="
                props.mode === 'pc'
                  ? 'h-[17px] text-[14px] leading-[17px]'
                  : 'h-[19px] text-[16px] leading-[19px]'
              "
            >
              {{ props.commissionBoostEstimatedCommission }}
            </div>
            <div
              class="flex items-center justify-center text-center font-[400] text-text-3"
              :class="
                props.mode === 'pc'
                  ? 'h-[20px] w-full text-[14px] leading-[20px]'
                  : 'w-full text-[11px] leading-[13px]'
              "
            >
              {{ props.estimatedCommissionLabel }}
            </div>
          </div>

          <img
            :src="commissionBoostArrowImage"
            alt="commission boost arrow"
            class="object-contain"
            :class="props.mode === 'pc' ? 'h-[28px] w-[56px]' : 'h-[20px] w-[42px]'"
          />

          <div
            class="flex flex-1 flex-col items-center"
            :class="props.mode === 'pc' ? 'h-[50px] gap-[13px]' : 'gap-[5px]'"
          >
            <div
              class="flex w-full items-center justify-center text-center font-[700] text-text-1"
              :class="
                props.mode === 'pc'
                  ? 'h-[17px] text-[14px] leading-[17px]'
                  : 'h-[19px] text-[16px] leading-[19px]'
              "
            >
              {{ props.commissionBoostFriendsDelta }}
            </div>
            <div
              class="flex items-center justify-center text-center font-[400]"
              :class="
                props.mode === 'pc'
                  ? 'h-[20px] w-full text-[14px] leading-[20px] text-text-3'
                  : 'w-full text-[11px] leading-[13px] text-text-1'
              "
            >
              {{ props.friendsText }}
            </div>
          </div>
        </div>

        <!-- 等级规则区域 -->
        <div
          class="flex flex-col items-start overflow-hidden bg-bg-3"
          :class="
            props.mode === 'pc'
              ? 'mx-[24px] h-[225px] self-stretch gap-[24px] rounded-[16px]'
              : 'w-[calc(100%-28px)] gap-[14px] rounded-[10px]'
          "
        >
          <!-- 当前等级区域 -->
          <div
            class="flex w-full flex-col items-center"
            :class="props.mode === 'pc' ? 'h-[84px] justify-center gap-[24px]' : 'gap-[14px]'"
          >
            <div
              class="box-border flex w-full items-center justify-between border-b border-white/[0.06]"
              :class="
                props.mode === 'pc'
                  ? 'h-[48px] gap-[274px] px-[24px] py-[12px]'
                  : 'h-[40px] gap-[10px] px-[14px] py-[10px]'
              "
            >
              <div
                class="flex items-center"
                :class="props.mode === 'pc' ? 'h-[20px] w-[292px] gap-[24px]' : 'flex-1 gap-[10px]'"
              >
                <div
                  class="flex items-center"
                  :class="props.mode === 'pc' ? 'h-[20px] w-[141px] gap-[8px]' : 'gap-[5px]'"
                >
                  <div
                    class="text-text-2"
                    :class="
                      props.mode === 'pc'
                        ? 'h-[20px] w-fit shrink-0 whitespace-nowrap text-center text-[14px] leading-[20px]'
                        : 'text-[12px] leading-[14px]'
                    "
                  >
                    {{ props.currentLevelText }}
                  </div>
                  <div
                    class="text-text-1"
                    :class="
                      props.mode === 'pc'
                        ? 'h-[20px] w-[42px] text-center text-[14px] leading-[20px]'
                        : 'text-[12px] leading-[14px]'
                    "
                  >
                    {{ props.commissionBoostCurrentLevelRate }}
                  </div>
                </div>

                <div
                  class="flex items-center"
                  :class="props.mode === 'pc' ? 'h-[20px] w-[137px] gap-[8px]' : 'gap-[5px]'"
                >
                  <div
                    class="text-text-2"
                    :class="
                      props.mode === 'pc'
                        ? 'h-[20px] w-fit shrink-0 whitespace-nowrap text-center text-[14px] leading-[20px]'
                        : 'text-[12px] leading-[14px]'
                    "
                  >
                    {{ props.activeFriendsText }}
                  </div>
                  <div
                    class="text-text-1"
                    :class="
                      props.mode === 'pc'
                        ? 'h-[20px] w-[23px] text-center text-[14px] leading-[20px]'
                        : 'text-[12px] leading-[14px]'
                    "
                  >
                    {{ props.commissionBoostActiveFriends }}
                  </div>
                </div>
              </div>

              <button
                type="button"
                class="relative shrink-0 rounded-[18px] bg-opacity-10"
                :class="
                  props.mode === 'pc'
                    ? 'h-[24px] w-[24px] rounded-[8px]'
                    : 'h-[20px] w-[20px] rounded-[6px]'
                "
                @click="$emit('open-rules')"
              >
                <span
                  class="absolute left-1/2 top-1/2 block -translate-x-1/2 -translate-y-1/2 rotate-45 border-r-[3px] border-t-[3px] border-text-2"
                  :class="
                    props.mode === 'pc'
                      ? 'h-[8px] w-[8px] border-r-[2px] border-t-[2px]'
                      : 'h-[6px] w-[6px] border-r-[2px] border-t-[2px]'
                  "
                ></span>
              </button>
            </div>
            <!-- commission boost -->
            <div
              class="relative rounded-[30px] bg-theme-3"
              :class="
                props.mode === 'pc'
                  ? 'mx-[24px] h-[12px] self-stretch'
                  : 'mb-[14px] h-[8px] w-[calc(100%-28px)]'
              "
            >
              <div
                class="absolute left-0 top-0 h-full rounded-[30px] bg-theme-primary"
                :style="{ width: `${props.commissionBoostProgressPercent}%` }"
              ></div>
              <div
                class="absolute top-1/2 rounded-full bg-theme-primary"
                :class="
                  props.mode === 'pc'
                    ? 'h-[24px] w-[24px] -translate-y-1/2'
                    : 'h-[14px] w-[14px] -translate-y-1/2'
                "
                :style="{
                  left: `calc(${props.commissionBoostProgressPercent}% - ${props.mode === 'pc' ? 12 : 7}px)`
                }"
              ></div>
            </div>
          </div>

          <!-- 佣金等级列表 -->

          <!-- 佣金等级列表 -->
          <div class="w-full overflow-x-auto">
            <div
              class="flex items-start"
              :class="
                props.mode === 'pc'
                  ? 'h-[45px] w-full justify-between px-[24px]'
                  : 'w-[412px] gap-[30px] px-[14px]'
              "
            >
              <div
                v-for="item in props.commissionBoostLevels"
                :key="item.id"
                class="flex shrink-0 flex-col items-center justify-center"
                :class="
                  props.mode === 'pc'
                    ? getCommissionBoostLevelPcClass(item)
                    : 'min-h-[52px] w-[55px] gap-[5px]'
                "
              >
                <div
                  class="flex items-center justify-center text-center font-[700] text-text-1"
                  :class="
                    props.mode === 'pc'
                      ? 'h-[17px] text-[14px] leading-[17px]'
                      : 'text-[14px] leading-[17px]'
                  "
                >
                  {{ item.rateText }}
                </div>
                <div
                  class="flex items-center justify-center text-center font-[400] text-text-1"
                  :class="
                    props.mode === 'pc'
                      ? 'h-[20px] text-[14px] leading-[20px]'
                      : 'text-[12px] leading-[15px]'
                  "
                >
                  {{ item.activeFriendsText }}
                </div>
              </div>
            </div>
          </div>
          <!-- 底部规则入口 -->
          <div
            class="box-border flex w-full items-center justify-between border-t border-white/[0.06]"
            :class="
              props.mode === 'pc'
                ? 'h-[48px] gap-[274px] px-[24px] py-[12px]'
                : 'h-[40px] gap-[10px] px-[14px] py-[10px]'
            "
          >
            <div
              class="text-text-2"
              :class="
                props.mode === 'pc'
                  ? 'h-[20px] w-fit shrink-0 whitespace-nowrap text-center text-[14px] leading-[20px]'
                  : 'text-[12px] leading-[14px]'
              "
            >
              {{ props.dataUpdatesEveryHourText }}
            </div>

            <button
              type="button"
              class="flex items-center"
              :class="
                props.mode === 'pc'
                  ? 'h-[24px] w-[68px] justify-start gap-[8px]'
                  : 'h-[20px] w-[61px] justify-end gap-[10px]'
              "
              @click="$emit('open-rules')"
            >
              <span
                class="text-text-1"
                :class="
                  props.mode === 'pc'
                    ? 'h-[20px] w-[36px] text-[14px] leading-[20px]'
                    : 'text-[12px] leading-[14px]'
                "
              >
                {{ props.rulesText }}
              </span>
              <span
                class="relative shrink-0 rounded-[18px] bg-opacity-10"
                :class="
                  props.mode === 'pc'
                    ? 'h-[24px] w-[24px] rounded-[8px]'
                    : 'h-[20px] w-[20px] rounded-[6px]'
                "
              >
                <span
                  class="absolute left-1/2 top-1/2 block -translate-x-1/2 -translate-y-1/2 rotate-45 border-r-[3px] border-t-[3px] border-text-2"
                  :class="
                    props.mode === 'pc'
                      ? 'h-[8px] w-[8px] border-r-[2px] border-t-[2px]'
                      : 'h-[6px] w-[6px] border-r-[2px] border-t-[2px]'
                  "
                ></span>
              </span>
            </button>
          </div>
        </div>
      </section>
    </div>
  </section>
</template>

<script setup lang="ts">
import commissionBoostArrowImage from '@/static/img/referral/commission-boost-arrow.png'
import inviteTaskDecorationH5Image from '@/static/img/referral/invite-task-banner-h5.png'
import inviteTaskDecorationPcImage from '@/static/img/referral/invite-task-banner-pc.png'
import inviteTaskRightImage from '@/static/img/referral/invite-task-right.png'
import CommissionOverviewPcIcon from '@/static/svg/referral/yongjin 1.svg?component'
import { Swipe, SwipeItem } from 'vant'
import { computed, ref, watch } from 'vue'
import type {
  ReferralBannerSlide,
  ReferralCommissionBoostLevelView,
  ReferralCommissionBoostPeriodTabKey,
  ReferralQuickAction,
  ReferralQuickActionId,
  ReferralSocialChannel
} from '../shared'

interface Props {
  mode: 'mobile' | 'pc'
  quickActions: ReferralQuickAction[]
  marqueeMessages: string[]
  socialChannels: ReferralSocialChannel[]
  socialChannelsLoading: boolean
  bannerLoading: boolean
  bannerSlides: ReferralBannerSlide[]
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
  commissionBoostLoading: boolean
  showCommissionBoost: boolean
  activeCommissionBoostPeriodTab: ReferralCommissionBoostPeriodTabKey
  commissionBoostEstimatedCommission: string
  commissionBoostFriendsDelta: string
  commissionBoostCurrentLevelRate: string
  commissionBoostActiveFriends: string
  commissionBoostProgressPercent: number
  commissionBoostLevels: ReferralCommissionBoostLevelView[]
  currentPeriodText: string
  previousPeriodText: string
  friendsText: string
  currentLevelText: string
  activeFriendsText: string
  dataUpdatesEveryHourText: string
  rulesText: string
}

const props = defineProps<Props>()

defineEmits<{
  'quick-action': [value: ReferralQuickActionId]
  'share-channel': [value: ReferralSocialChannel]
  'share-guide': []
  'copy-message': []
  claim: []
  'task-details': []
  'banner-click': [value: ReferralBannerSlide]
  'change-commission-boost-period-tab': [value: ReferralCommissionBoostPeriodTabKey]
  'open-rules': []
}>()

const isClaimDisabled = computed(() => Number(props.estimatedCommissionAmount) <= 0)

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

/**
 * 生成社交分享区域骨架数量。
 */
const socialChannelSkeletonCount = computed(() => 6)
const inviteTaskDecorationImage = computed(() =>
  props.mode === 'pc' ? inviteTaskDecorationPcImage : inviteTaskDecorationH5Image
)

/**
 * 生成佣金加码等级列表在 PC 端的固定宽度类名。
 */
const getCommissionBoostLevelPcClass = (item: ReferralCommissionBoostLevelView) => {
  const index = props.commissionBoostLevels.findIndex(level => level.id === item.id)

  return index === 0 || index === props.commissionBoostLevels.length - 1
    ? 'h-[45px] w-[120px] gap-[8px]'
    : 'h-[45px] w-[120px] gap-[8px]'
}

const bannerAutoplayInterval = 3000
const bannerActiveIndex = ref(0)

/**
 * 处理横幅轮播切换。
 */
const handleBannerChange = (index: number) => {
  bannerActiveIndex.value = index
}

watch(
  () => props.bannerSlides,
  slides => {
    if (bannerActiveIndex.value >= slides.length) {
      bannerActiveIndex.value = 0
    }
  },
  {
    deep: true,
    immediate: true
  }
)
</script>

<style scoped>
.referral-marquee-track {
  justify-content: center;
  will-change: transform;
}

.referral-marquee-track-animated {
  justify-content: flex-start;
  animation: referral-marquee-slide-left 25s linear infinite;
}

.referral-marquee-track-animated:hover {
  animation-play-state: paused;
}

@keyframes referral-marquee-slide-left {
  from {
    transform: translateX(0);
  }

  to {
    transform: translateX(-50%);
  }
}
</style>
