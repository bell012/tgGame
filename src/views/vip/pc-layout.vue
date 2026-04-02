<template>
  <div class="mx-auto max-w-[1336px] px-4 pb-[40px] xl:px-0">
    <div class="">
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
                  <span class="text-2xl font-[700] text-text-1">{{ vipLevel }}</span>
                </div>
                <div class="text-lg font-[700] text-text-1 mt-2">
                  {{ userInfo?.nickName || '-' }}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section
          class="relative h-[256px] overflow-hidden rounded-[30px] bg-cover bg-center bg-no-repeat px-[64px] pb-[39px] pt-[56px]"
          :style="{ backgroundImage: `url(${cardH5BgImage})` }"
        >
          <div class="relative z-[1] flex h-full flex-col">
            <div class="flex items-center gap-[25px]">
              <div class="flex shrink-0 items-center">
                <img :src="cardVipImage" alt="VIP Card" class="h-[59px] w-[66px] shrink-0" />
                <p class="text-[80px] font-[700] leading-[60px] text-theme-primary">
                  {{ vipLevel }}
                </p>
              </div>

              <div class="min-w-0 flex-1 space-y-[12px]">
                <div v-for="item in progressItems" :key="item.key" class="flex items-center">
                  <span class="text-[20px] leading-none text-[#198E48]">{{ item.label }}：</span>
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

          <img
            :src="cardVipRightImage"
            alt="VIP Decoration"
            class="pointer-events-none absolute right-[32px] top-1/2 h-[252px] w-[282px] -translate-y-1/2"
          />
        </section>
      </div>

      <section class="mt-4 grid grid-cols-4 gap-3.5">
        <article
          v-for="card in displayBenefitCards"
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
            :disabled="!card.claimable"
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

    <CommonFooter class="mt-[40px]" />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import CommonFooter from '@/components/commonFooter.vue'
import VipBadgeIcon from '@/static/svg/vip_1.svg?component'
import VipWordmarkIcon from '@/static/svg/vip_2.svg?component'
import cardVipImage from '@/static/img/personalCenter/card_vip.png'
import { getCurrencySymbol } from '@/utils/locale'
import ClaimSuccessPopup from './ClaimSuccessPopup.vue'
import { type VipBenefitCard, useVipPageData } from './shared'
import cardH5BgImage from '@/static/img/personalCenter/card_H5_BG.png'
import cardVipRightImage from '@/static/img/personalCenter/card_vip_right2.png'

const { t } = useI18n()
const showClaimSuccessPopup = ref(false)
const pendingClaimCard = ref<VipBenefitCard | null>(null)
const claimedCardKeys = ref<string[]>([])
const {
  userInfo,
  avatarUrl,
  selectedAvatarFrameImage,
  vipLevel,
  progressItems,
  overallProgress,
  benefitCards,
  retentionCards,
  rules,
  initializeVipPage
} = useVipPageData(t)

const displayBenefitCards = computed(() => {
  return benefitCards.value.map(card => {
    if (!claimedCardKeys.value.includes(card.key)) {
      return card
    }

    return {
      ...card,
      status: 'claimed' as const,
      claimed: true,
      claimable: false,
      buttonText: t('vipPage.claimed')
    }
  })
})

const claimSuccessAmount = computed(() => {
  const amount = pendingClaimCard.value?.amount ?? '0.00'
  return `${getCurrencySymbol()}${amount}`
})

const handleClaim = (card: VipBenefitCard) => {
  if (!card.claimable) {
    return
  }

  pendingClaimCard.value = card
  showClaimSuccessPopup.value = true
}

const confirmClaimSuccess = () => {
  const claimedKey = pendingClaimCard.value?.key

  if (claimedKey && !claimedCardKeys.value.includes(claimedKey)) {
    claimedCardKeys.value = [...claimedCardKeys.value, claimedKey]
  }

  showClaimSuccessPopup.value = false
}

// 初始化 VIP 页面所需的用户与等级数据。
onMounted(() => {
  void initializeVipPage()
})
</script>
