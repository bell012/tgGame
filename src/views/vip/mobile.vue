<template>
  <section class="fixed inset-0 overflow-y-auto bg-bg-1">
    <div class="min-h-screen bg-bg-1">
      <H5Header
        :title="$t('sidebar_menu.links.vip.prefix')"
        :show-sort="true"
        :right-icon="RuleIcon"
        @sort="openRulesPopup"
      />

      <main class="px-[14px] py-[20px]">
        <div class="flex items-center justify-between mb-[30px]">
          <div class="flex min-w-0 items-center gap-3">
            <div class="relative h-[66px] w-[66px] overflow-visible">
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
                <VipBadgeIcon class="h-4 w-4 text-text-1" />
                <VipWordmarkIcon class="h-[14px] w-[32px] text-text-1" />
                <span class="text-lg font-[700] text-text-1">{{ vipLevel }}</span>
              </div>
              <div class="truncate text-base font-[700] text-text-1">
                {{ userInfo?.nickName || '-' }}
              </div>
            </div>
          </div>
        </div>

        <section
          class="relative h-[158px] rounded-[15px] bg-cover bg-center bg-no-repeat px-[20px] py-[15px] mb-[14px]"
          :style="{ backgroundImage: `url(${cardH5BgImage})` }"
        >
          <div class="relative z-[1] flex flex-col items-start gap-3">
            <div class="flex items-center">
              <img :src="cardVipImage" alt="VIP Card" class="h-[30px] w-[33px] shrink-0 mr-[3px]" />
              <p class="text-[38px] leading-[30px] font-[700] text-theme-primary">{{ vipLevel }}</p>
            </div>

            <div class="w-full flex-1 flex flex-col justify-center pr-[10px]">
              <div class="space-y-1.5">
                <div v-for="item in progressItems" :key="item.key">
                  <div class="flex items-center">
                    <span class="text-xs text-[#198E48]">{{ item.label }}：</span>
                    <span class="text-xs text-[#198E48]">{{ item.current }}/{{ item.target }}</span>
                  </div>
                </div>
              </div>

              <div class="mt-[15px] h-[8px] w-full overflow-hidden rounded-full bg-theme-3">
                <div
                  class="h-full rounded-full bg-theme-primary transition-all"
                  :style="{ width: `${overallProgress}%` }"
                />
              </div>

              <p class="mt-[15px] text-center text-xs text-[#198E48]">
                {{ $t('vipPage.goalHint') }}
              </p>
            </div>

            <img
              :src="cardVipRightImage"
              alt="VIP Decoration"
              class="pointer-events-none absolute right-[-20px] top-[50px] h-[188px] w-[160px] -translate-y-1/2"
            />
          </div>
        </section>

        <section class="space-y-[7px]">
          <article
            v-for="card in displayBenefitCards"
            :key="card.key"
            :style="{ background: card.background }"
            class="flex h-[74px] w-full items-center gap-2.5 overflow-hidden rounded-[10px] px-[14px]"
          >
            <img
              :src="card.image"
              alt="VIP Benefit"
              class="h-[50px] w-[50px] shrink-0 object-contain"
            />
            <div class="min-w-0 flex-1">
              <p class="truncate text-xs font-[400] text-text-1">
                {{ card.title }}
              </p>
              <p class="text-base font-[700] text-text-1 mt-1">
                {{ card.amount }}
              </p>
            </div>

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
              class="relative flex h-[34px] w-[80px] px-3.5 shrink-0 items-center justify-center overflow-hidden rounded-lg text-sm font-[500]"
            >
              <span v-if="card.status === 'claimed'" class="absolute inset-0 bg-mask-20" />
              <span class="relative z-[1]">{{ card.buttonText }}</span>
            </button>
          </article>
        </section>
      </main>

      <ClaimSuccessPopup
        v-if="showClaimSuccessPopup"
        :amount="claimSuccessAmount"
        @confirm="confirmClaimSuccess"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import H5Header from '@/components/common/H5Header.vue'
import RuleIcon from '@/static/svg/rule.svg?component'
import VipBadgeIcon from '@/static/svg/vip_1.svg?component'
import VipWordmarkIcon from '@/static/svg/vip_2.svg?component'
import cardH5BgImage from '@/static/img/personalCenter/card_H5_BG.png'
import cardVipImage from '@/static/img/personalCenter/card_vip.png'
import cardVipRightImage from '@/static/img/personalCenter/card_vip_right.png'
import { getCurrencySymbol } from '@/utils/locale'
import ClaimSuccessPopup from './ClaimSuccessPopup.vue'
import { type VipBenefitCard, useVipPageData } from './shared'

const { t } = useI18n()
const router = useRouter()
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

// 规则页面
const openRulesPopup = () => {
  void router.push({ name: 'rule' })
}

// 领取可用奖励并展示成功弹窗。
const handleClaim = (card: VipBenefitCard) => {
  if (!card.claimable) {
    return
  }

  pendingClaimCard.value = card
  showClaimSuccessPopup.value = true
}

// 确认领取成功后更新本地按钮状态。
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
