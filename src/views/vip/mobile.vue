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
                <span class="text-lg font-[700] text-text-1">{{ currentVipLevel }}</span>
              </div>
              <div class="truncate text-base font-[700] text-text-1">
                {{ userInfo?.nickName || '-' }}
              </div>
            </div>
          </div>
        </div>

        <div
          ref="vipCarouselRef"
          class="vip-mobile-carousel mb-[14px] flex snap-x snap-mandatory overflow-x-auto overflow-y-hidden scroll-smooth touch-pan-x"
          @scroll.passive="onVipCarouselScroll"
        >
          <div
            v-for="vip in displayVipLevels"
            :key="vip.rowId ?? vip.vipId"
            class="min-w-full shrink-0 snap-center snap-always rounded-[15px] mx-[10px]"
          >
            <section
              class="relative h-[158px] rounded-[15px] bg-cover bg-center bg-no-repeat px-[20px] py-[15px]"
              :style="{ backgroundImage: resolveBackgroundImage(cardH5BgImage) }"
            >
              <div class="relative z-[1] flex flex-col items-start gap-3">
                <div class="flex items-center">
                  <SmartImage
                    :src="cardVipImage"
                    alt="VIP Card"
                    class="mr-[3px] h-[30px] w-[33px] shrink-0"
                  />
                  <p class="text-[38px] font-[700] leading-[30px] text-theme-primary">
                    {{ vip.vipId }}
                  </p>
                </div>

                <div class="flex w-full flex-1 flex-col justify-center pr-[10px]">
                  <div class="space-y-1.5">
                    <div v-for="item in getProgressItemsByVipId(vip.vipId)" :key="item.key">
                      <div class="flex items-center">
                        <span class="text-xs text-[#198E48]">{{ item.label }}：</span>
                        <span class="text-xs text-[#198E48]"
                          >{{ item.current }}/{{ item.target }}</span
                        >
                      </div>
                    </div>
                  </div>

                  <div class="mt-[15px] h-[8px] w-full overflow-hidden rounded-full bg-theme-3">
                    <div
                      class="h-full rounded-full bg-theme-primary transition-all"
                      :style="{ width: `${getOverallProgressByVipId(vip.vipId)}%` }"
                    />
                  </div>

                  <p class="mt-[15px] text-center text-xs text-[#198E48]">
                    {{ $t('vipPage.goalHint') }}
                  </p>
                </div>

                <SmartImage
                  :src="cardVipRightImage"
                  alt="VIP Decoration"
                  class="pointer-events-none absolute right-[-20px] top-[50px] h-[188px] w-[160px] -translate-y-1/2"
                />
              </div>
            </section>
          </div>
        </div>

        <section class="space-y-[7px]">
          <article
            v-for="card in benefitCards"
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
              :disabled="!card.claimable || claimingCardKey === card.key"
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
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import H5Header from '@/components/common/H5Header.vue'
import { useVipStore } from '@/stores/vip'
import RuleIcon from '@/static/svg/rule.svg?component'
import VipBadgeIcon from '@/static/svg/vip_1.svg?component'
import VipWordmarkIcon from '@/static/svg/vip_2.svg?component'
import cardH5BgImage from '@/static/img/personalCenter/card_H5_BG.png'
import cardVipImage from '@/static/img/personalCenter/card_vip.png'
import cardVipRightImage from '@/static/img/personalCenter/card_vip_right.png'
import { resolveBackgroundImage } from '@/utils/image'
import { getCurrencySymbol } from '@/utils/locale'
import ClaimSuccessPopup from './ClaimSuccessPopup.vue'
import { claimVipBenefit, type VipBenefitCard, useVipPageData } from './shared'

const { t } = useI18n()
const router = useRouter()
const vipStore = useVipStore()
const showClaimSuccessPopup = ref(false)
const claimSuccessAmount = ref(`${getCurrencySymbol()}0.00`)
const claimingCardKey = ref<VipBenefitCard['key'] | null>(null)
const vipCarouselRef = ref<HTMLElement | null>(null)
const selectedVipIndex = ref(0)
const viewedVipId = ref<number | null>(null)
const hasInitializedViewedVip = ref(false)

const {
  userInfo,
  avatarUrl,
  selectedAvatarFrameImage,
  vipLevels,
  currentVipLevel,
  getProgressItemsByVipId,
  getOverallProgressByVipId,
  benefitCards,
  initializeVipPage
} = useVipPageData(t, { viewedVipId })

const displayVipLevels = computed(() => {
  if (vipLevels.value.length) {
    return vipLevels.value
  }

  return [{ rowId: currentVipLevel.value, vipId: currentVipLevel.value }]
})

const syncViewedVipId = () => {
  viewedVipId.value = displayVipLevels.value[selectedVipIndex.value]?.vipId ?? currentVipLevel.value
}

const scrollToVipCard = (index: number, behavior: 'auto' | 'smooth' = 'smooth') => {
  const carouselElement = vipCarouselRef.value
  if (!carouselElement) {
    return
  }

  const width = carouselElement.offsetWidth
  carouselElement.scrollTo({ left: index * width, behavior })
}

const onVipCarouselScroll = () => {
  const carouselElement = vipCarouselRef.value
  if (!carouselElement) {
    return
  }

  const width = carouselElement.offsetWidth
  if (!width) {
    return
  }

  const nextIndex = Math.min(
    Math.max(Math.round(carouselElement.scrollLeft / width), 0),
    displayVipLevels.value.length - 1
  )

  if (selectedVipIndex.value !== nextIndex) {
    selectedVipIndex.value = nextIndex
  }
}

watch(
  [vipLevels, currentVipLevel],
  async ([levels, activeVipLevel]) => {
    if (!levels.length) {
      selectedVipIndex.value = 0
      viewedVipId.value = activeVipLevel
      hasInitializedViewedVip.value = false
      return
    }

    const matchedIndex = levels.findIndex(item => item.vipId === activeVipLevel)
    const fallbackIndex = matchedIndex >= 0 ? matchedIndex : 0

    if (!hasInitializedViewedVip.value || !levels[selectedVipIndex.value]) {
      selectedVipIndex.value = fallbackIndex
      hasInitializedViewedVip.value = true
      syncViewedVipId()
      await nextTick()
      scrollToVipCard(fallbackIndex, 'auto')
      return
    }

    syncViewedVipId()
  },
  { immediate: true }
)

watch(selectedVipIndex, () => {
  syncViewedVipId()
})

// 规则页面
const openRulesPopup = () => {
  void router.push({ name: 'rule' })
}

// 领取可用奖励并展示成功弹窗。
const handleClaim = async (card: VipBenefitCard) => {
  if (!card.claimable || claimingCardKey.value === card.key) {
    return
  }

  claimingCardKey.value = card.key

  try {
    const response = await claimVipBenefit(card.key)

    if (!response?.success) {
      showToast({
        message: response?.message || t('common.unknownError'),
        type: 'fail'
      })
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
.vip-mobile-carousel {
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.vip-mobile-carousel::-webkit-scrollbar {
  display: none;
}
</style>
