<template>
  <div class="mx-auto max-w-[1336px] px-4 pb-[40px] xl:px-0">
    <div class="mt-[16px]">
      <h1 class="text-xl font-[700] text-text-1">{{ $t('userMenu.vipClub') }}</h1>

      <div class="mt-4 flex flex-col gap-4">
        <div class="relative h-[256px]">
          <button
            type="button"
            :disabled="!canGoPrev"
            @click="goToPrevVip"
            :class="canGoPrev ? 'cursor-pointer' : 'cursor-not-allowed'"
            class="absolute left-[-40px] top-1/2 flex h-[40px] w-[28px] -translate-y-1/2 items-center justify-center rounded-lg bg-opacity-5 transition-opacity"
          >
            <Arrow_left :class="canGoPrev ? 'h-6 w-6 text-text-1' : 'h-6 w-6 text-text-3'" />
          </button>

          <div class="vip-card-stage">
            <Transition :name="vipCardTransitionName">
              <section
                :key="viewedVipLevel"
                class="vip-card-panel overflow-hidden rounded-[30px] px-[64px] pb-[39px] pt-[56px]"
                :style="{ background: viewedVipCardTheme.background }"
              >
                <div class="relative z-[1] flex h-full flex-col">
                  <div class="flex items-center gap-[25px]">
                    <div class="flex shrink-0 items-center">
                      <span
                        aria-hidden="true"
                        class="h-[59px] w-[66px]"
                        :style="
                          getVipMaskIconStyle(
                            viewedVipCardTheme.wordmarkIcon,
                            viewedVipCardTheme.vipColor
                          )
                        "
                      ></span>
                      <span
                        aria-hidden="true"
                        class="ml-[1px] h-[59px]"
                        :style="[
                          getVipMaskIconStyle(
                            viewedVipCardTheme.levelNumberIcon,
                            viewedVipCardTheme.vipColor
                          ),
                          { aspectRatio: getVipLevelNumberAspectRatio(viewedVipLevel) }
                        ]"
                      ></span>
                    </div>

                    <div class="min-w-0 flex-1 space-y-[12px]">
                      <div v-for="item in progressItems" :key="item.key" class="flex items-center">
                        <span
                          class="text-[20px] leading-none"
                          :style="{ color: viewedVipCardTheme.progressTextColor }"
                          >{{ item.label }}：</span
                        >
                        <span
                          class="text-[20px] font-[700] leading-none"
                          :style="{ color: viewedVipCardTheme.progressTextColor }"
                          >{{ item.current }}/{{ item.target }}</span
                        >
                      </div>
                    </div>
                  </div>

                  <div class="mt-[48px]">
                    <div
                      class="h-[18px] w-[847px] overflow-hidden rounded-full"
                      :style="{ background: viewedVipCardTheme.progressTrackColor }"
                    >
                      <div
                        class="h-full rounded-full transition-all"
                        :style="{
                          width: `${overallProgress}%`,
                          background: viewedVipCardTheme.progressFillColor
                        }"
                      />
                    </div>

                    <p
                      class="mt-[16px] text-base"
                      :style="{ color: viewedVipCardTheme.progressTextColor }"
                    >
                      {{ $t(viewedVipCardTheme.goalHintKey) }}
                    </p>
                  </div>
                </div>

                <img
                  :src="viewedVipCardTheme.rightDecorationIcon"
                  alt=""
                  aria-hidden="true"
                  class="pointer-events-none absolute right-[32px] top-1/2 z-[2] h-[256px] w-[282px] -translate-y-1/2"
                />
                <component
                  :is="viewedVipCardTheme.cornerBadgeIcon"
                  class="pointer-events-none absolute bottom-[-2px] right-[-3px] z-[2] h-[54px] w-[64px] text-common-100"
                />
              </section>
            </Transition>
          </div>

          <button
            type="button"
            :disabled="!canGoNext"
            @click="goToNextVip"
            :class="canGoNext ? 'cursor-pointer' : 'cursor-not-allowed'"
            class="absolute right-[-40px] top-1/2 flex h-[40px] w-[28px] -translate-y-1/2 items-center justify-center rounded-lg bg-opacity-5 transition-opacity"
          >
            <Arrow_right :class="canGoNext ? 'h-6 w-6 text-text-1' : 'h-6 w-6 text-text-3'" />
          </button>
        </div>
      </div>

      <div class="my-4 flex items-center">
        <span class="text-sm font-[700] text-text-1">
          {{ $t('vipPage.exclusiveBenefitsTitle', { vipId: currentVipLevel }) }}
        </span>
        <button
          type="button"
          class="flex items-center justify-center px-[12px] py-[4px]"
          @click="openBenefitExplainPopup"
        >
          <ExplainIcon class="h-4 w-4 text-text-2" />
        </button>
      </div>

      <section class="grid grid-cols-3 gap-3.5">
        <article
          v-for="card in benefitCards"
          :key="card.key"
          :style="{ background: card.background }"
          class="flex h-[365px] flex-col items-center overflow-hidden rounded-[32px] px-[52px] py-[36px]"
        >
          <img
            :src="card.image"
            alt="VIP Benefit"
            class="h-[148px] w-[148px] shrink-0 object-contain"
          />

          <p class="mt-[8px] text-center text-lg font-[700] text-text-1">
            {{ card.title }}
          </p>
          <p class="mt-[20px] text-center text-3xl font-[700] text-text-1">
            {{ card.amount }}
          </p>

          <div
            type="button"
            :disabled="card.status === 'claim' && claimingCardKey === card.key"
            @click="handleBenefitAction(card)"
            :class="
              card.status === 'claim'
                ? 'bg-theme-primary text-text-4'
                : 'text-secondary-7 border border-secondary-7'
            "
            class="relative mt-[20px] flex h-[40px] w-[300px] items-center justify-center overflow-hidden rounded-lg text-sm font-[700] cursor-pointer"
          >
            <span class="relative z-[1]">{{ card.buttonText }}</span>
          </div>
        </article>
      </section>

      <!-- tab栏 -->
      <section class="mt-[24px]">
        <div class="flex w-full rounded-[8px] bg-bg-8">
          <button
            type="button"
            class="h-[48px] w-full rounded-[8px] p-[14px] font-[700]"
            :class="
              activeContentTab === 'comparison'
                ? 'bg-bg-7 text-base text-text-1'
                : 'text-base text-text-2'
            "
            @click="activeContentTab = 'comparison'"
          >
            {{ $t('vipPage.tabs.benefitsComparison') }}
          </button>
          <button
            type="button"
            class="h-[48px] w-full rounded-[8px] p-[14px] font-[700]"
            :class="
              activeContentTab === 'rules'
                ? 'bg-bg-7 text-base text-text-1'
                : 'text-base text-text-2'
            "
            @click="activeContentTab = 'rules'"
          >
            {{ $t('vipPage.tabs.vipRules') }}
          </button>
        </div>

        <div class="mt-[24px]">
          <BenefitComparisonPanel
            v-if="activeContentTab === 'comparison'"
            :columns="benefitComparisonColumns"
          />
          <VipRulesContent v-else :retention-cards="retentionCards" :rules="rules" />
        </div>
      </section>

      <!-- 领取弹窗 -->
      <ClaimSuccessPopup
        v-model:visible="showClaimSuccessPopup"
        :amount="claimSuccessAmount"
        :close-on-overlay-click="false"
        @confirm="confirmClaimSuccess"
      />
      <BenefitExplainPopup v-if="showBenefitExplainPopup" @close="closeBenefitExplainPopup" />
    </div>
  </div>
  <CommonFooter class="mt-[40px]" />
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import CommonFooter from '@/components/commonFooter.vue'
import { useVipStore } from '@/stores/vip'
import ExplainIcon from '@/static/svg/vip/explain.svg?component'
import { navigateTo } from '@/utils/router'
import ClaimSuccessPopup from '@/components/common/ClaimSuccessPopup.vue'
import BenefitComparisonPanel from './BenefitComparisonPanel.vue'
import BenefitExplainPopup from './BenefitExplainPopup.vue'
import VipRulesContent from './VipRulesContent.vue'
import {
  claimVipBenefit,
  getVipLevelNumberAspectRatio,
  getVipMaskIconStyle,
  type VipBenefitCard,
  useVipPageData
} from './shared'
import Arrow_left from '@/static/svg/arrow_left.svg?component'
import Arrow_right from '@/static/svg/arrow_right2.svg?component'

const { t } = useI18n()
const vipStore = useVipStore()
const showBenefitExplainPopup = ref(false)
const showClaimSuccessPopup = ref(false)
const claimSuccessAmount = ref('0.00')
const claimingCardKey = ref<VipBenefitCard['key'] | null>(null)
const activeContentTab = ref<'comparison' | 'rules'>('comparison')
const selectedVipIndex = ref(0)
const hasInitializedViewedVip = ref(false)
const vipCardTransitionName = ref<'vip-card-slide-next' | 'vip-card-slide-prev'>(
  'vip-card-slide-next'
)

const selectedVipId = computed(() => {
  return vipLevels.value[selectedVipIndex.value]?.vipId ?? currentVipLevel.value
})

const {
  vipLevels,
  currentVipLevel,
  viewedVipLevel,
  viewedVipCardTheme,
  progressItems,
  overallProgress,
  benefitCards,
  benefitComparisonColumns,
  retentionCards,
  rules,
  initializeVipPage
} = useVipPageData(t, { viewedVipId: selectedVipId })

const canGoPrev = computed(() => selectedVipIndex.value > 0)
const canGoNext = computed(() => selectedVipIndex.value < vipLevels.value.length - 1)

const updateSelectedVipIndex = (nextIndex: number, direction: 'prev' | 'next') => {
  if (
    nextIndex === selectedVipIndex.value ||
    nextIndex < 0 ||
    nextIndex >= vipLevels.value.length
  ) {
    return
  }

  vipCardTransitionName.value = direction === 'next' ? 'vip-card-slide-next' : 'vip-card-slide-prev'
  selectedVipIndex.value = nextIndex
}

const goToPrevVip = () => {
  if (!canGoPrev.value) {
    return
  }

  updateSelectedVipIndex(selectedVipIndex.value - 1, 'prev')
}

const goToNextVip = () => {
  if (!canGoNext.value) {
    return
  }

  updateSelectedVipIndex(selectedVipIndex.value + 1, 'next')
}

const openBenefitExplainPopup = () => {
  showBenefitExplainPopup.value = true
}

const closeBenefitExplainPopup = () => {
  showBenefitExplainPopup.value = false
}

watch(
  [vipLevels, currentVipLevel],
  ([levels, activeVipLevel]) => {
    if (!levels.length) {
      selectedVipIndex.value = 0
      hasInitializedViewedVip.value = false
      return
    }

    const matchedIndex = levels.findIndex(item => item.vipId === activeVipLevel)
    const fallbackIndex = matchedIndex >= 0 ? matchedIndex : 0

    if (!hasInitializedViewedVip.value || !levels[selectedVipIndex.value]) {
      selectedVipIndex.value = fallbackIndex
      hasInitializedViewedVip.value = true
    }
  },
  { immediate: true }
)

const handleBenefitAction = async (card: VipBenefitCard) => {
  if (card.status === 'upgrade') {
    void navigateTo('/casino')
    return
  }

  if (claimingCardKey.value === card.key) {
    return
  }

  claimingCardKey.value = card.key

  try {
    const response = await claimVipBenefit(card.key)

    if (!response?.success) {
      return
    }

    await vipStore.refreshVipInfo()
    claimSuccessAmount.value = card.amount
    showClaimSuccessPopup.value = true
  } catch (error) {
    console.error(error)
  } finally {
    claimingCardKey.value = null
  }
}

const confirmClaimSuccess = () => {
  showClaimSuccessPopup.value = false
}

// 初始化 VIP 页面所需的用户与等级数据。
onMounted(() => {
  void initializeVipPage()
})
</script>

<style scoped>
.vip-card-stage {
  position: relative;
  height: 100%;
  overflow: hidden;
}

.vip-card-panel {
  position: absolute;
  inset: 0;
}

.vip-card-slide-next-enter-active,
.vip-card-slide-next-leave-active,
.vip-card-slide-prev-enter-active,
.vip-card-slide-prev-leave-active {
  transition: all 0.6s ease-in-out;
}

.vip-card-slide-next-enter-from,
.vip-card-slide-prev-leave-to {
  transform: translateX(14%);
  opacity: 0;
}

.vip-card-slide-next-leave-to,
.vip-card-slide-prev-enter-from {
  transform: translateX(-14%);
  opacity: 0;
}
</style>
