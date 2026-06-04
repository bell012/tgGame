<template>
  <!-- PC 签到弹窗布局 -->
  <section
    v-if="isPc"
    class="relative h-[540px] w-[1000px] overflow-hidden rounded-[24px] bg-white/10 text-common-100 shadow-[0_24px_80px_rgba(0,0,0,0.36)] backdrop-blur-[18px]"
  >
    <!-- PC 左侧奖励内容区 -->
    <div
      class="absolute inset-y-0 left-0 w-[500px] bg-[linear-gradient(180deg,rgba(255,255,255,0.06)_0%,rgba(255,255,255,0.02)_100%)]"
    >
      <!-- PC 左侧内容容器 -->
      <div class="mx-auto flex w-[476px] flex-col items-center px-[12px] pt-[24px]">
        <!-- PC 标题文案组 -->
        <div class="flex flex-col items-center gap-[8px]">
          <template v-if="props.loading">
            <!-- PC 标题骨架 -->
            <div class="h-[34px] w-[300px] rounded-[8px] bg-white/15 animate-pulse"></div>
            <!-- PC 副标题骨架 -->
            <div class="h-[19px] w-[220px] rounded-[6px] bg-white/10 animate-pulse"></div>
            <!-- PC 时间骨架 -->
            <div class="h-[19px] w-[300px] rounded-[6px] bg-[#ffe2a7]/20 animate-pulse"></div>
          </template>
          <template v-else>
            <!-- PC 主标题 -->
            <h2
              class="bg-[linear-gradient(180deg,#fffdf8_0%,#f9cf7b_100%)] bg-clip-text text-center text-[28px] font-[700] leading-[34px] text-transparent"
            >
              {{ props.viewData.title }}
            </h2>
            <!-- PC 副标题 -->
            <p class="text-center text-[16px] font-[400] leading-[19px] text-common-100">
              {{ props.viewData.subtitle }}
            </p>
            <!-- PC 活动截止时间 -->
            <p class="text-center text-[16px] font-[400] leading-[19px] text-[#ffe2a7]">
              {{ promoEndsText }}
            </p>
          </template>
        </div>

        <!-- PC 分割线 -->
        <div class="mt-[24px] h-px w-full bg-white/10"></div>

        <!-- PC 奖励列表区 -->
        <section class="mt-[24px] flex w-full flex-col items-center gap-[24px]">
          <!-- PC 奖励列表标题 -->
          <div class="flex w-full items-center justify-center">
            <div
              v-if="props.loading"
              class="h-[19px] w-[190px] rounded-[6px] bg-white/10 animate-pulse"
            ></div>
            <p v-else class="text-[16px] font-[400] leading-[19px] text-common-100">
              {{ t('checkIn.rewardSectionTitle') }}
            </p>
          </div>

          <!-- PC 奖励卡片骨架网格 -->
          <div v-if="props.loading" class="grid w-full grid-cols-2 gap-[12px]">
            <!-- PC 单个奖励卡片骨架 -->
            <article
              v-for="item in pcSkeletonRewards"
              :key="`pc-skeleton-${item}`"
              class="flex h-[64px] items-center gap-[8px] rounded-[12px] border border-white/10 bg-white/10 px-[12px] py-[8px] animate-pulse"
            >
              <div class="h-[46px] w-[40px] shrink-0 rounded-[8px] bg-white/15"></div>
              <div class="flex min-w-0 flex-col gap-[7px]">
                <div class="h-[18px] w-[58px] rounded-[5px] bg-white/15"></div>
                <div class="h-[20px] w-[84px] rounded-[5px] bg-[#f7ff4b]/20"></div>
              </div>
            </article>
          </div>

          <!-- PC 奖励卡片网格 -->
          <div v-else class="grid w-full grid-cols-2 gap-[12px]">
            <!-- PC 单个奖励卡片 -->
            <article
              v-for="reward in rewards"
              :key="reward.day"
              class="relative isolate flex h-[64px] items-center gap-[8px] overflow-hidden rounded-[12px] border px-[12px] py-[8px]"
              :style="getPcRewardCardStyle(reward)"
            >
              <!-- PC 奖励图标 -->
              <img :src="reward.icon" alt="" class="h-[46px] w-[40px] shrink-0 object-contain" />

              <!-- PC 奖励文字区 -->
              <div class="min-w-0">
                <!-- PC 奖励天数 -->
                <p class="text-[18px] font-[400] leading-[22px] text-common-100">
                  {{ t('checkIn.dayLabel', { day: reward.day }) }}
                </p>
                <!-- PC 奖励金额 -->
                <div class="mt-[4px] flex items-center gap-[2px]">
                  <span class="text-[20px] font-[700] leading-[24px]" :style="reward.amountStyle">
                    {{ reward.currencySymbol }}
                  </span>
                  <p
                    class="text-[20px] font-[700] leading-[24px] tracking-[0.01em]"
                    :style="reward.amountStyle"
                  >
                    {{ reward.amount }}
                  </p>
                </div>
              </div>

              <!-- PC 已领取遮罩 -->
              <div
                v-if="reward.claimed"
                class="pointer-events-none absolute inset-0 z-10 rounded-[12px] bg-black/40"
              ></div>

              <!-- PC 已领取状态标签 -->
              <div
                v-if="reward.claimed"
                class="pointer-events-none absolute right-0 top-0 z-20 flex h-[20px] w-[68px] items-center justify-end rounded-bl-[12px] rounded-tr-[12px] bg-[rgba(42,238,136,0.2)] px-[8px] py-[2px]"
              >
                <span class="text-[13px] font-[400] leading-[16px] text-white/60">
                  {{ t('checkIn.claimed') }}
                </span>
              </div>
            </article>
          </div>
        </section>
      </div>
    </div>

    <!-- PC 右侧主视觉区 -->
    <div class="absolute inset-y-0 right-0 w-[500px] overflow-hidden">
      <!-- PC 规则按钮 -->
      <button
        type="button"
        class="absolute left-[16px] top-[16px] z-20 flex h-[32px] w-[32px] items-center justify-center rounded-[6px] bg-white/10"
        :aria-label="t('checkIn.rulesAriaLabel')"
        @click="$emit('rules')"
      >
        <img :src="CHECK_IN_RULES_BUTTON" alt="" class="h-[16px] w-[16px]" />
      </button>

      <!-- PC 关闭按钮 -->
      <button
        type="button"
        class="absolute right-[16px] top-[16px] z-20 flex h-[32px] w-[32px] items-center justify-center rounded-[6px] bg-white/10"
        :aria-label="t('checkIn.closeAriaLabel')"
        @click="$emit('close')"
      >
        <CloseIcon class="h-[9.43px] w-[9.43px] text-common-100" />
      </button>

      <template v-if="props.loading">
        <!-- PC 主视觉骨架 -->
        <div
          class="absolute left-1/2 top-[56px] h-[344px] w-[344px] -translate-x-1/2 rounded-[28px] bg-white/10 animate-pulse"
        ></div>

        <!-- PC 主操作按钮骨架 -->
        <div
          class="absolute bottom-[56px] left-1/2 h-[48px] w-[300px] -translate-x-1/2 rounded-[8px] bg-white/20 animate-pulse"
        ></div>
      </template>

      <template v-else>
        <!-- PC 未签到主视觉图 -->
        <img
          v-if="isHeroPending"
          :src="CHECK_IN_HERO_CLOSED"
          alt=""
          class="absolute left-1/2 top-[56px] z-10 h-[344px] w-[344px] -translate-x-1/2 object-contain"
        />

        <!-- PC 单奖励主视觉卡片 -->
        <div
          v-else-if="isHeroSingle && primaryAmountHeroReward"
          class="absolute left-1/2 top-[84px] h-[316px] w-[344px] -translate-x-1/2 rounded-[28px] bg-[linear-gradient(180deg,#2BBB76_0%,#41882C_100%)]"
        >
          <img
            :src="CHECK_IN_HERO_OPENED"
            alt=""
            class="absolute left-1/2 top-0 h-[180px] w-[180px] -translate-x-1/2 object-contain"
          />

          <div class="absolute inset-x-0 bottom-[28px] flex flex-col items-center gap-[8px]">
            <div class="flex h-[48px] items-center justify-center">
              <img
                :src="primaryAmountHeroReward.icon"
                alt=""
                class="h-[32px] w-[32px] object-contain"
              />
              <span class="text-[40px] font-[700] leading-[48px] text-[#F7FF4B]">
                {{ primaryAmountHeroReward.amount }}
              </span>
            </div>
            <p class="text-center text-[18px] font-[400] leading-[22px] text-common-100">
              {{ t('checkIn.rewardReceivedThisTime') }}
            </p>
            <p class="text-center text-[18px] font-[400] leading-[22px] text-common-100">
              {{ t('checkIn.congratulations') }}
            </p>
          </div>
        </div>

        <!-- PC 双奖励主视觉卡片 -->
        <div
          v-else-if="isHeroDouble"
          class="absolute left-1/2 top-[84px] flex h-[316px] w-[444px] -translate-x-1/2 gap-[12px]"
        >
          <div
            v-if="primaryAmountHeroReward"
            class="relative h-[316px] w-[216px] rounded-[32px] bg-[linear-gradient(180deg,#2BBB76_0%,#41882C_100%)]"
          >
            <img
              :src="CHECK_IN_HERO_OPENED"
              alt=""
              class="absolute left-1/2 top-0 h-[180px] w-[180px] -translate-x-1/2 object-contain"
            />

            <div class="absolute inset-x-0 bottom-[32px] flex flex-col items-center gap-[8px]">
              <div class="flex h-[48px] items-center justify-center">
                <img
                  :src="primaryAmountHeroReward.icon"
                  alt=""
                  class="h-[32px] w-[32px] object-contain"
                />
                <span class="text-[40px] font-[700] leading-[48px] text-[#F7FF4B]">
                  {{ primaryAmountHeroReward.amount }}
                </span>
              </div>
              <p class="text-center text-[16px] font-[400] leading-[19px] text-common-100">
                {{ t('checkIn.rewardReceivedThisTime') }}
              </p>
              <p class="text-center text-[16px] font-[400] leading-[19px] text-common-100">
                {{ t('checkIn.congratulations') }}
              </p>
            </div>
          </div>

          <div
            v-if="secondaryActionHeroReward"
            class="relative h-[316px] w-[216px] rounded-[32px] bg-[linear-gradient(180deg,#D14DF6_0%,#9B12DF_103.66%)]"
          >
            <img
              :src="secondaryActionHeroReward.icon"
              alt=""
              class="absolute left-1/2 top-[23px] h-[135px] w-[135px] -translate-x-1/2 object-contain"
            />

            <div class="absolute inset-x-0 bottom-[78px] flex flex-col items-center gap-[8px]">
              <p class="text-center text-[24px] font-[700] leading-[29px] text-[#F7FF4B]">
                {{
                  secondaryActionHeroReward.title ||
                  t(secondaryActionHeroReward.titleKey || 'checkIn.luckySpinReward')
                }}
              </p>
              <p class="text-center text-[16px] font-[400] leading-[19px] text-common-100">
                {{ t('checkIn.youGotAReward') }}
              </p>
            </div>

            <button
              type="button"
              class="absolute left-1/2 top-[254px] flex h-[42px] w-[136px] -translate-x-1/2 items-center justify-center rounded-[12px] border border-white/25 bg-white/25 text-[18px] font-[700] leading-[22px] text-common-100"
            >
              {{
                secondaryActionHeroReward.actionLabel ||
                t(secondaryActionHeroReward.actionKey || 'checkIn.useNow')
              }}
            </button>
          </div>
        </div>

        <!-- PC 主操作按钮 -->
        <button
          type="button"
          class="absolute bottom-[56px] left-1/2 z-20 flex h-[48px] w-[300px] -translate-x-1/2 items-center justify-center rounded-[8px] text-[14px] font-[700] leading-[17px] text-[#000000] transition-transform"
          :class="
            isActionDisabled
              ? 'cursor-not-allowed bg-[#FFFFFF80] shadow-none'
              : 'bg-theme-primary shadow-[0_12px_32px_rgba(42,238,136,0.36)] active:scale-[0.985]'
          "
          :disabled="isActionDisabled"
          @click="$emit('action')"
        >
          {{ t('checkIn.action') }}
        </button>
      </template>
    </div>
  </section>

  <!-- H5 签到弹窗布局 -->
  <section v-else class="relative h-[812px] w-full max-w-[375px] overflow-hidden text-common-100">
    <!-- H5 关闭按钮 -->
    <button
      type="button"
      class="absolute left-[14px] top-[58px] z-20 flex h-[25px] w-[25px] items-center justify-center"
      :aria-label="t('checkIn.closeAriaLabel')"
      @click="$emit('close')"
    >
      <img :src="CHECK_IN_CLOSE_BUTTON" alt="" class="h-[25px] w-[25px]" />
    </button>

    <!-- H5 规则按钮 -->
    <button
      type="button"
      class="absolute right-[14px] top-[58px] z-20 flex h-[25px] w-[25px] items-center justify-center"
      :aria-label="t('checkIn.rulesAriaLabel')"
      @click="$emit('rules')"
    >
      <img :src="CHECK_IN_RULES_BUTTON" alt="" class="h-[25px] w-[25px]" />
    </button>

    <!-- H5 标题文案区 -->
    <div
      class="absolute left-1/2 top-[97px] z-20 flex w-[280px] -translate-x-1/2 flex-col items-center gap-[5px]"
    >
      <template v-if="props.loading">
        <!-- H5 标题骨架 -->
        <div class="h-[29px] w-[250px] rounded-[8px] bg-white/15 animate-pulse"></div>
        <!-- H5 副标题骨架 -->
        <div class="h-[17px] w-[205px] rounded-[6px] bg-white/10 animate-pulse"></div>
        <!-- H5 时间骨架 -->
        <div class="h-[17px] w-[260px] rounded-[6px] bg-[#ffe2a7]/20 animate-pulse"></div>
      </template>
      <template v-else>
        <!-- H5 主标题 -->
        <h2
          class="bg-[linear-gradient(180deg,#fffdf8_0%,#f9cf7b_100%)] bg-clip-text text-center text-[24px] font-[700] leading-[29px] text-transparent"
        >
          {{ props.viewData.title }}
        </h2>
        <!-- H5 副标题 -->
        <p class="text-center text-[14px] font-[400] leading-[17px] text-common-100">
          {{ props.viewData.subtitle }}
        </p>
        <!-- H5 活动截止时间 -->
        <p class="text-center text-[14px] font-[400] leading-[17px] text-[#ffe2a7]">
          {{ promoEndsText }}
        </p>
      </template>
    </div>

    <template v-if="props.loading">
      <!-- H5 主视觉骨架 -->
      <div
        class="absolute left-1/2 top-[180px] h-[231px] w-[231px] -translate-x-1/2 rounded-[20px] bg-white/10 animate-pulse"
      ></div>

      <!-- H5 主操作按钮骨架 -->
      <div
        class="absolute left-[20px] top-[421px] z-20 h-[40px] w-[335px] rounded-[8px] bg-white/20 animate-pulse"
      ></div>
    </template>

    <template v-else>
      <!-- H5 主视觉区 -->
      <div
        v-if="isHeroPending"
        class="absolute left-1/2 top-[180px] h-[231px] w-[231px] -translate-x-1/2"
      >
        <!-- H5 未签到主视觉图 -->
        <img :src="CHECK_IN_HERO_CLOSED" alt="" class="h-full w-full object-contain" />
      </div>

      <!-- H5 单奖励主视觉卡片 -->
      <div
        v-else-if="isHeroSingle && primaryAmountHeroReward"
        class="absolute left-1/2 top-[190px] h-[210.67px] w-[230.67px] -translate-x-1/2 rounded-[20px] bg-[linear-gradient(180deg,#2BBB76_0%,#41882C_100%)]"
      >
        <img
          :src="CHECK_IN_HERO_OPENED"
          alt=""
          class="absolute left-1/2 top-0 h-[120px] w-[120px] -translate-x-1/2 object-contain"
        />

        <div class="absolute inset-x-0 bottom-[20px] flex flex-col items-center gap-[5px]">
          <div class="flex h-[31px] items-center justify-center gap-[1px]">
            <img
              :src="primaryAmountHeroReward.icon"
              alt=""
              class="h-[22px] w-[22px] object-contain"
            />
            <span class="text-[26px] font-[700] leading-[31px] text-[#F7FF4B]">
              {{ primaryAmountHeroReward.amount }}
            </span>
          </div>
          <p class="text-center text-[12px] font-[400] leading-[14.67px] text-common-100">
            {{ t('checkIn.rewardReceivedThisTime') }}
          </p>
          <p class="text-center text-[12px] font-[400] leading-[14.67px] text-common-100">
            {{ t('checkIn.congratulations') }}
          </p>
        </div>
      </div>

      <!-- H5 双奖励主视觉卡片 -->
      <div
        v-else-if="isHeroDouble"
        class="absolute left-[20px] top-[190px] flex w-[335px] justify-between"
      >
        <div
          v-if="primaryAmountHeroReward"
          class="relative h-[210.67px] w-[162.33px] rounded-[20px] bg-[linear-gradient(180deg,#2BBB76_0%,#41882C_100%)]"
        >
          <img
            :src="CHECK_IN_HERO_OPENED"
            alt=""
            class="absolute left-1/2 top-0 h-[120px] w-[120px] -translate-x-1/2 object-contain"
          />

          <div class="absolute inset-x-0 bottom-[20px] flex flex-col items-center gap-[5px]">
            <div class="flex h-[31px] items-center justify-center gap-[1px]">
              <img
                :src="primaryAmountHeroReward.icon"
                alt=""
                class="h-[22px] w-[22px] object-contain"
              />
              <span class="text-[26px] font-[700] leading-[31px] text-[#F7FF4B]">
                {{ primaryAmountHeroReward.amount }}
              </span>
            </div>
            <p class="text-center text-[12px] font-[400] leading-[14.67px] text-common-100">
              {{ t('checkIn.rewardReceivedThisTime') }}
            </p>
            <p class="text-center text-[12px] font-[400] leading-[14.67px] text-common-100">
              {{ t('checkIn.congratulations') }}
            </p>
          </div>
        </div>

        <div
          v-if="secondaryActionHeroReward"
          class="relative h-[210.67px] w-[162.33px] rounded-[20px] bg-[linear-gradient(180deg,#D14DF6_0%,#9B12DF_103.66%)]"
        >
          <img
            :src="secondaryActionHeroReward.icon"
            alt=""
            class="absolute left-1/2 top-[30px] h-[90px] w-[90px] -translate-x-1/2 object-contain"
          />

          <div class="absolute inset-x-0 bottom-[52px] flex flex-col items-center gap-[5px]">
            <p class="text-center text-[16px] font-[700] leading-[19px] text-[#F7FF4B]">
              {{
                secondaryActionHeroReward.title ||
                t(secondaryActionHeroReward.titleKey || 'checkIn.luckySpinReward')
              }}
            </p>
            <p class="text-center text-[12px] font-[400] leading-[14.67px] text-common-100">
              {{ t('checkIn.youGotAReward') }}
            </p>
          </div>

          <button
            type="button"
            class="absolute left-1/2 top-[169px] flex h-[28px] w-[90px] -translate-x-1/2 items-center justify-center rounded-[8px] border border-white/25 bg-white/25 text-[12px] font-[700] leading-[14.67px] text-common-100"
          >
            {{
              secondaryActionHeroReward.actionLabel ||
              t(secondaryActionHeroReward.actionKey || 'checkIn.useNow')
            }}
          </button>
        </div>
      </div>

      <!-- H5 主操作按钮 -->
      <button
        type="button"
        class="absolute left-[20px] top-[421px] z-20 flex h-[40px] w-[335px] items-center justify-center rounded-[8px] text-[14px] font-[700] leading-[17px] text-[#000000]"
        :class="isActionDisabled ? 'cursor-not-allowed bg-[#FFFFFF80]' : 'bg-theme-primary'"
        :disabled="isActionDisabled"
        @click="$emit('action')"
      >
        {{ t('checkIn.action') }}
      </button>
    </template>

    <!-- H5 奖励列表区 -->
    <section class="absolute left-[20px] top-[481px] z-20 w-[335px]">
      <!-- H5 奖励区标题 -->
      <div
        v-if="props.loading"
        class="h-[17px] w-[155px] rounded-[6px] bg-white/10 animate-pulse"
      ></div>
      <p v-else class="text-[14px] font-[700] leading-[17px] text-common-100">
        {{ t('checkIn.rewardSectionTitle') }}
      </p>

      <!-- H5 奖励骨架分行列表 -->
      <div v-if="props.loading" class="mt-[7px] flex flex-col gap-[7px]">
        <!-- H5 奖励骨架单行 -->
        <div
          v-for="(rewardRow, rowIndex) in mobileSkeletonRewardRows"
          :key="`mobile-skeleton-row-${rowIndex}`"
          class="flex gap-[10px]"
        >
          <!-- H5 单个奖励卡片骨架 -->
          <article
            v-for="item in rewardRow"
            :key="`mobile-skeleton-${item}`"
            class="flex h-[47px] w-[164px] items-center gap-[5px] rounded-[8px] border border-white/10 bg-white/10 px-[7px] py-[6px] animate-pulse"
          >
            <div class="h-[35px] w-[31px] shrink-0 rounded-[6px] bg-white/15"></div>
            <div class="flex min-w-0 flex-col gap-[5px]">
              <div class="h-[13px] w-[45px] rounded-[4px] bg-white/15"></div>
              <div class="h-[15px] w-[70px] rounded-[4px] bg-[#f7ff4b]/20"></div>
            </div>
          </article>
        </div>
      </div>

      <!-- H5 奖励分行列表 -->
      <div v-else class="mt-[7px] flex flex-col gap-[7px]">
        <!-- H5 奖励单行 -->
        <div
          v-for="(rewardRow, rowIndex) in mobileRewardRows"
          :key="`mobile-row-${rowIndex}`"
          class="flex gap-[10px]"
        >
          <!-- H5 单个奖励卡片 -->
          <article
            v-for="reward in rewardRow"
            :key="reward.day"
            class="relative isolate flex h-[47px] w-[164px] items-center gap-[5px] overflow-hidden rounded-[8px] border px-[7px] py-[6px]"
            :style="getMobileRewardCardStyle(reward)"
          >
            <!-- H5 奖励图标 -->
            <img :src="reward.icon" alt="" class="h-[35px] w-[31px] shrink-0 object-contain" />

            <!-- H5 奖励文字区 -->
            <div class="min-w-0">
              <!-- H5 奖励天数 -->
              <p class="text-[12px] font-[400] leading-[14.67px] text-common-100">
                {{ t('checkIn.dayLabel', { day: reward.day }) }}
              </p>
              <!-- H5 奖励金额 -->
              <div class="mt-[2px] flex items-center gap-[1px]">
                <span class="text-[15px] font-[700] leading-[18px]" :style="reward.amountStyle">
                  {{ reward.currencySymbol }}
                </span>
                <p class="text-[15px] font-[700] leading-[18px]" :style="reward.amountStyle">
                  {{ reward.amount }}
                </p>
              </div>
            </div>

            <!-- H5 已领取遮罩 -->
            <div
              v-if="reward.claimed"
              class="pointer-events-none absolute inset-0 z-10 rounded-[8px] bg-black/40"
            ></div>

            <!-- H5 已领取状态标签 -->
            <div
              v-if="reward.claimed"
              class="pointer-events-none absolute right-0 top-0 z-20 flex h-[16px] w-[49px] items-center justify-end rounded-bl-[10px] rounded-tr-[8px] bg-[rgba(42,238,136,0.2)] px-[5px] py-[2px]"
            >
              <span class="text-[10px] font-[400] leading-[12px] text-white/60">
                {{ t('checkIn.claimed') }}
              </span>
            </div>
          </article>
        </div>
      </div>
    </section>

    <!-- H5 底部样式占位图 -->
    <!-- <img
      :src="CHECK_IN_HERO_CLOSED"
      alt=""
      class="pointer-events-none absolute inset-x-0 bottom-0 h-[89px] w-full object-cover opacity-30"
    /> -->
  </section>
</template>

<script setup lang="ts">
import CloseIcon from '@/static/svg/close.svg?component'
import { computed, type CSSProperties } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  CHECK_IN_CLOSE_BUTTON,
  CHECK_IN_HERO_CLOSED,
  CHECK_IN_HERO_OPENED,
  CHECK_IN_RULES_BUTTON,
  type CheckInHeroActionReward,
  type CheckInHeroAmountReward,
  type CheckInHeroReward,
  type CheckInPageMode,
  type CheckInRewardItem,
  type CheckInViewData
} from '../shared'

interface Props {
  mode: CheckInPageMode
  viewData: CheckInViewData
  loading?: boolean
}

const props = defineProps<Props>()

defineEmits<{
  close: []
  rules: []
  action: []
}>()

const { t } = useI18n()

const pcSkeletonRewards = Array.from({ length: 8 }, (_, index) => index + 1)
const mobileSkeletonRewardRows = computed(() => {
  const skeletonItems = Array.from({ length: 8 }, (_, index) => index + 1)
  const rows: number[][] = []

  for (let index = 0; index < skeletonItems.length; index += 2) {
    rows.push(skeletonItems.slice(index, index + 2))
  }

  return rows
})

// 标记当前是否为 PC 布局。
const isPc = computed(() => props.mode === 'pc')

// 生成活动截止时间文案。
const promoEndsText = computed(() =>
  t(props.viewData.promoDateTextKey, { date: props.viewData.promoEndsAt })
)

// 签到按钮是否处于不可领取状态，后续由接口返回值驱动。
const isActionDisabled = computed(() => !props.viewData.canClaim)

// 主视觉区奖励结果占位数据，后续由签到接口返回值替换。
const heroRewards = computed(() => props.viewData.heroRewards)

// 主视觉区是否处于未签到状态。
const isHeroPending = computed(() => heroRewards.value.length === 0)

// 主视觉区是否展示单奖励结果。
const isHeroSingle = computed(() => heroRewards.value.length === 1)

// 主视觉区是否展示双奖励结果。
const isHeroDouble = computed(() => heroRewards.value.length > 1)

// 主视觉区第一个奖励。
const primaryHeroReward = computed(() => heroRewards.value[0])

// 主视觉区第二个奖励。
const secondaryHeroReward = computed(() => heroRewards.value[1])

// 判断是否为金额奖励。
const isAmountHeroReward = (reward?: CheckInHeroReward): reward is CheckInHeroAmountReward =>
  reward?.type === 'amount'

// 判断是否为功能奖励。
const isActionHeroReward = (reward?: CheckInHeroReward): reward is CheckInHeroActionReward =>
  reward?.type === 'action'

// 单奖励和双奖励左卡统一使用金额奖励。
const primaryAmountHeroReward = computed(() => {
  return isAmountHeroReward(primaryHeroReward.value) ? primaryHeroReward.value : null
})

// 双奖励右卡使用功能型奖励。
const secondaryActionHeroReward = computed(() => {
  return isActionHeroReward(secondaryHeroReward.value) ? secondaryHeroReward.value : null
})

// 当前签到奖励列表。
const rewards = computed(() => props.viewData.rewards)

// PC 已领取奖励卡片样式。
const claimedPcRewardCardStyle: CSSProperties = {
  background: 'rgba(42, 238, 136, 0.2)',
  borderColor: 'rgba(42, 238, 136, 0.6)'
}

// H5 已领取奖励卡片样式。
const claimedMobileRewardCardStyle: CSSProperties = {
  background: 'rgba(62, 210, 114, 0.5)',
  borderColor: 'rgba(62, 210, 114, 0.8)',
  borderWidth: '0.67px'
}

// 根据领取状态获取 PC 奖励卡片样式。
const getPcRewardCardStyle = (reward: CheckInRewardItem) => {
  return reward.claimed ? claimedPcRewardCardStyle : reward.cardStyle
}

// 根据领取状态获取 H5 奖励卡片样式。
const getMobileRewardCardStyle = (reward: CheckInRewardItem) => {
  return reward.claimed ? claimedMobileRewardCardStyle : reward.cardStyle
}

// 按照 H5 稿的两列结构拆分奖励卡片，每行最多两个。
const mobileRewardRows = computed<CheckInRewardItem[][]>(() => {
  const rows: CheckInRewardItem[][] = []

  for (let index = 0; index < rewards.value.length; index += 2) {
    rows.push(rewards.value.slice(index, index + 2))
  }

  return rows
})
</script>
