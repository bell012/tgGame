<template>
  <div class="mx-auto max-w-[1336px] px-4 pb-[40px] xl:px-0">
    <div class="mt-[16px]">
      <h1 class="text-xl font-[700] text-text-1">{{ $t('userMenu.vipClub') }}</h1>

      <div class="mt-6 flex flex-col gap-4">
        <section class="rounded-2xl h-[108px] bg-bg-2 p-6">
          <div class="flex items-center justify-between gap-4">
            <div class="flex min-w-0 items-center gap-4">
              <div class="relative h-[60px] w-[60px] overflow-visible">
                <div
                  :class="[
                    'absolute overflow-hidden rounded-full',
                    selectedAvatarFrameImage ? 'inset-[4px]' : 'inset-[4px] border-2 border-icon-2'
                  ]"
                >
                  <img :src="avatarUrl" alt="Avatar" class="h-full w-full object-cover" />
                </div>
                <img
                  v-if="selectedAvatarFrameImage"
                  :src="selectedAvatarFrameImage"
                  alt="Avatar Frame"
                  class="pointer-events-none absolute inset-0 h-full w-full object-contain"
                />
              </div>

              <div class="flex flex-col">
                <div class="flex shrink-0 items-center gap-0.5">
                  <VipBadgeIcon class="h-6 w-6 text-text-1" />
                  <VipWordmarkIcon class="h-5 w-[47.5px] text-text-1" />
                  <span class="text-2xl font-[700] text-text-1">{{ currentVipLevel }}</span>
                </div>
                <div class="text-lg font-[700] text-text-1 mt-2">
                  {{ userInfo?.nickName || '-' }}
                </div>
              </div>
            </div>
          </div>
        </section>

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
                class="vip-card-panel rounded-[30px] bg-cover bg-center bg-no-repeat px-[64px] pb-[39px] pt-[56px]"
                :style="{ backgroundImage: resolveBackgroundImage(cardH5BgImage) }"
              >
                <div class="relative z-[1] flex h-full flex-col">
                  <div class="flex items-center gap-[25px]">
                    <div class="flex shrink-0 items-center">
                      <SmartImage
                        :src="cardVipImage"
                        alt="VIP Card"
                        class="h-[59px] w-[66px] shrink-0"
                      />
                      <p class="text-[80px] font-[700] leading-[60px] text-theme-primary">
                        {{ viewedVipLevel }}
                      </p>
                    </div>

                    <div class="min-w-0 flex-1 space-y-[12px]">
                      <div v-for="item in progressItems" :key="item.key" class="flex items-center">
                        <span class="text-[20px] leading-none text-[#198E48]"
                          >{{ item.label }}：</span
                        >
                        <span class="text-[20px] font-[700] leading-none text-[#198E48]"
                          >{{ item.current }}/{{ item.target }}</span
                        >
                      </div>
                    </div>
                  </div>

                  <div class="mt-[48px]">
                    <div class="h-[18px] w-[847px] overflow-hidden rounded-full bg-theme-3">
                      <div
                        class="h-full rounded-full bg-theme-primary transition-all"
                        :style="{ width: `${overallProgress}%` }"
                      />
                    </div>

                    <p class="mt-[16px] text-base text-[#198E48]">
                      {{ $t('vipPage.goalHint') }}
                    </p>
                  </div>
                </div>

                <SmartImage
                  :src="cardVipRightImage"
                  alt="VIP Decoration"
                  class="pointer-events-none absolute right-[32px] top-1/2 h-[252px] w-[282px] -translate-y-1/2"
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

      <section class="mt-4 grid grid-cols-4 gap-3.5">
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

          <button
            type="button"
            :disabled="!card.claimable || claimingCardKey === card.key"
            @click="handleClaim(card)"
            :class="
              card.status === 'claimed'
                ? 'bg-theme-2 text-text-4'
                : card.status === 'claim'
                  ? 'bg-theme-primary text-text-4'
                  : 'bg-opacity-5 text-text-2'
            "
            class="relative mt-[20px] flex h-[40px] w-[220px] items-center justify-center overflow-hidden rounded-lg text-sm font-[700]"
          >
            <span v-if="card.status === 'claimed'" class="absolute inset-0 bg-mask-20" />
            <span class="relative z-[1]">{{ card.buttonText }}</span>
          </button>
        </article>
      </section>

      <!-- 规则 -->
      <h2 class="text-base font-[700] text-text-1 mt-[24px] mb-[16px]">
        {{ $t('vipPage.rulesTitle') }}
      </h2>
      <section class="rounded-[16px] bg-bg-2 p-6">
        <h3 class="text-base font-[700] text-text-1">
          {{ $t('vipPage.retention.title') }}
        </h3>

        <div class="mt-2 grid grid-cols-2 gap-4">
          <article
            v-for="card in retentionCards"
            :key="card.key"
            class="flex items-center justify-between h-[80px] rounded-[16px] bg-opacity-5 p-6"
          >
            <div class="flex items-center gap-4">
              <component :is="card.icon" class="h-8 w-8" />
              <p class="text-base font-[700] text-text-1">{{ card.label }}</p>
            </div>

            <p class="text-2xl font-[700] text-text-1">{{ card.amount }}</p>
          </article>
        </div>

        <div class="mt-4 space-y-4">
          <article v-for="rule in rules" :key="rule.key">
            <h3 class="text-base font-[700] text-text-1">{{ rule.title }}</h3>
            <p class="mt-2 text-sm text-text-2">{{ rule.description }}</p>
          </article>
        </div>
      </section>

      <ClaimSuccessPopup
        v-if="showClaimSuccessPopup"
        mode="pc"
        :amount="claimSuccessAmount"
        @confirm="confirmClaimSuccess"
      />
    </div>
  </div>
  <CommonFooter class="mt-[40px]" />
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import CommonFooter from '@/components/commonFooter.vue'
import { useVipStore } from '@/stores/vip'
import { resolveBackgroundImage } from '@/utils/image'
import VipBadgeIcon from '@/static/svg/vip_1.svg?component'
import VipWordmarkIcon from '@/static/svg/vip_2.svg?component'
import cardVipImage from '@/static/img/personalCenter/card_vip.png'
import { getCurrencySymbol } from '@/utils/locale'
import ClaimSuccessPopup from './ClaimSuccessPopup.vue'
import { claimVipBenefit, type VipBenefitCard, useVipPageData } from './shared'
import cardH5BgImage from '@/static/img/personalCenter/card_H5_BG.webp'
import cardVipRightImage from '@/static/img/personalCenter/card_vip_right2.png'
import Arrow_left from '@/static/svg/arrow_left.svg?component'
import Arrow_right from '@/static/svg/arrow_right2.svg?component'

const { t } = useI18n()
const vipStore = useVipStore()
const showClaimSuccessPopup = ref(false)
const claimSuccessAmount = ref(`${getCurrencySymbol()}0.00`)
const claimingCardKey = ref<VipBenefitCard['key'] | null>(null)
const selectedVipIndex = ref(0)
const hasInitializedViewedVip = ref(false)
const vipCardTransitionName = ref<'vip-card-slide-next' | 'vip-card-slide-prev'>(
  'vip-card-slide-next'
)

const selectedVipId = computed(() => {
  return vipLevels.value[selectedVipIndex.value]?.vipId ?? currentVipLevel.value
})

const {
  userInfo,
  avatarUrl,
  selectedAvatarFrameImage,
  vipLevels,
  currentVipLevel,
  viewedVipLevel,
  progressItems,
  overallProgress,
  benefitCards,
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

const handleClaim = async (card: VipBenefitCard) => {
  if (!card.claimable || claimingCardKey.value === card.key) {
    return
  }

  claimingCardKey.value = card.key

  try {
    const response = await claimVipBenefit(card.key)

    if (!response?.success) {
      return
    }

    await vipStore.refreshVipInfo()
    claimSuccessAmount.value = `${getCurrencySymbol()}${card.amount}`
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
