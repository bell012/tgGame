<template>
  <section class="vip-mobile-page fixed inset-0 overflow-y-auto bg-bg-1">
    <div class="min-h-full bg-bg-1">
      <H5Header
        :title="$t('sidebar_menu.links.vip.prefix')"
        :show-sort="true"
        :right-icon="KefuIcon"
        @sort="openKefuPopup"
      />

      <main class="px-[14px] py-[20px]">
        <div
          ref="vipCarouselRef"
          class="vip-mobile-carousel pt-[20px] mb-[14px] flex snap-x snap-mandatory overflow-x-auto overflow-y-hidden scroll-smooth touch-pan-x"
          @scroll.passive="onVipCarouselScroll"
        >
          <div
            v-for="(vip, index) in displayVipLevels"
            :key="vip.rowId ?? vip.vipId"
            :ref="el => setVipCardRef(el, index)"
            class="min-w-full shrink-0 snap-center snap-always rounded-[15px] mx-[10px]"
          >
            <section
              class="relative h-[158px] rounded-[15px] px-[20px] py-[15px]"
              :style="{ background: getVipCardTheme(vip.vipId).background }"
            >
              <div class="relative z-[1] flex flex-col items-start gap-3">
                <div class="flex items-center">
                  <span
                    aria-hidden="true"
                    class="h-[30px] w-[33px]"
                    :style="
                      getVipMaskIconStyle(
                        getVipCardTheme(vip.vipId).wordmarkIcon,
                        getVipCardTheme(vip.vipId).vipColor
                      )
                    "
                  ></span>
                  <span
                    aria-hidden="true"
                    class="ml-[3px] h-[30px]"
                    :style="[
                      getVipMaskIconStyle(
                        getVipCardTheme(vip.vipId).levelNumberIcon,
                        getVipCardTheme(vip.vipId).vipColor
                      ),
                      { aspectRatio: getVipLevelNumberAspectRatio(vip.vipId) }
                    ]"
                  ></span>
                </div>

                <div class="flex w-full flex-1 flex-col justify-center pr-[10px]">
                  <div class="space-y-1.5">
                    <div v-for="item in getProgressItemsByVipId(vip.vipId)" :key="item.key">
                      <div class="flex items-center">
                        <span
                          class="text-xs"
                          :style="{ color: getVipCardTheme(vip.vipId).progressTextColor }"
                          >{{ item.label }}：</span
                        >
                        <span
                          class="text-xs"
                          :style="{ color: getVipCardTheme(vip.vipId).progressTextColor }"
                          >{{ item.current }}/{{ item.target }}</span
                        >
                      </div>
                    </div>
                  </div>

                  <div
                    class="mt-[15px] h-[8px] w-full rounded-full"
                    :style="{ background: getVipCardTheme(vip.vipId).progressTrackColor }"
                  >
                    <div
                      class="h-full rounded-full transition-all"
                      :style="{
                        width: `${getOverallProgressByVipId(vip.vipId)}%`,
                        background: getVipCardTheme(vip.vipId).progressFillColor
                      }"
                    />
                  </div>

                  <p
                    class="mt-[15px] text-center text-xs"
                    :style="{ color: getVipCardTheme(vip.vipId).progressTextColor }"
                  >
                    {{ $t(getVipCardTheme(vip.vipId).goalHintKey) }}
                  </p>
                </div>

                <img
                  :src="getVipCardTheme(vip.vipId).rightDecorationIcon"
                  alt=""
                  aria-hidden="true"
                  class="pointer-events-none absolute right-[-18px] top-[30px] z-[2] h-[160px] w-[160px] -translate-y-1/2"
                />
                <component
                  :is="getVipCardTheme(vip.vipId).cornerBadgeIcon"
                  class="pointer-events-none absolute bottom-[-11px] right-[-20px] z-[2] h-[21px] w-[25px] text-common-100"
                />
              </div>
            </section>
          </div>
        </div>

        <div class="mb-[7px] flex items-center">
          <span class="text-sm font-[700] text-text-1">
            {{ $t('vipPage.exclusiveBenefitsTitle', { vipId: currentVipLevel }) }}
          </span>
          <button
            type="button"
            class="flex items-center justify-center px-[7px] py-[4px]"
            @click="openBenefitExplainPopup"
          >
            <ExplainIcon class="h-3.5 w-3.5 text-text-2" />
          </button>
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

            <div
              type="button"
              :disabled="card.status === 'claim' && claimingCardKey === card.key"
              @click="handleBenefitAction(card)"
              :class="
                card.status === 'claim'
                  ? 'bg-theme-primary text-text-4'
                  : 'text-secondary-7 border border-secondary-7'
              "
              class="relative flex h-[34px] w-[100px] px-3.5 shrink-0 items-center justify-center overflow-hidden rounded-lg text-sm font-[500]"
            >
              <span class="relative z-[1]">{{ card.buttonText }}</span>
            </div>
          </article>
        </section>

        <!-- tab栏 -->
        <section class="mt-[14px]">
          <div class="flex rounded-[8px] bg-bg-8">
            <button
              type="button"
              class="flex-1 rounded-[8px] px-[14px] py-[11px] font-[700] h-[39px]"
              :class="
                activeContentTab === 'comparison'
                  ? 'bg-bg-7 text-text-1 text-sm'
                  : 'text-text-2 text-xs'
              "
              @click="activeContentTab = 'comparison'"
            >
              {{ $t('vipPage.tabs.benefitsComparison') }}
            </button>
            <button
              type="button"
              class="flex-1 rounded-[8px] px-[14px] py-[11px] font-[700] h-[39px]"
              :class="
                activeContentTab === 'rules' ? 'bg-bg-7 text-text-1 text-sm' : 'text-text-2 text-xs'
              "
              @click="activeContentTab = 'rules'"
            >
              {{ $t('vipPage.tabs.vipRules') }}
            </button>
          </div>

          <div class="mt-[10px]">
            <BenefitComparisonPanel
              v-if="activeContentTab === 'comparison'"
              :columns="benefitComparisonColumns"
            />
            <VipRulesContent v-else :retention-cards="retentionCards" :rules="rules" />
          </div>
        </section>
      </main>

      <BenefitExplainPopup v-if="showBenefitExplainPopup" @close="closeBenefitExplainPopup" />

      <!-- 领取弹窗 -->
      <ClaimSuccessPopup
        v-model:visible="showClaimSuccessPopup"
        :amount="claimSuccessAmount"
        :close-on-overlay-click="false"
        @confirm="confirmClaimSuccess"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch, type ComponentPublicInstance } from 'vue'
import { useI18n } from 'vue-i18n'
import H5Header from '@/components/common/H5Header.vue'
import { useVipStore } from '@/stores/vip'
import KefuIcon from '@/static/svg/vip/kefu.svg?component'
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

const { t } = useI18n()
const vipStore = useVipStore()
const showBenefitExplainPopup = ref(false)
const showClaimSuccessPopup = ref(false)
const claimSuccessAmount = ref('0.00')
const claimingCardKey = ref<VipBenefitCard['key'] | null>(null)
const activeContentTab = ref<'comparison' | 'rules'>('comparison')
const vipCarouselRef = ref<HTMLElement | null>(null)
const vipCardRefs = ref<HTMLElement[]>([])
const selectedVipIndex = ref(0)
const viewedVipId = ref<number | null>(null)
const hasInitializedViewedVip = ref(false)

const {
  vipLevels,
  currentVipLevel,
  getProgressItemsByVipId,
  getOverallProgressByVipId,
  getVipCardThemeByVipId,
  benefitCards,
  benefitComparisonColumns,
  retentionCards,
  rules,
  initializeVipPage
} = useVipPageData(t, { viewedVipId })

const getVipCardTheme = (vipId?: number | null) => getVipCardThemeByVipId(vipId)

const displayVipLevels = computed(() => {
  if (vipLevels.value.length) {
    return vipLevels.value
  }

  return [{ rowId: currentVipLevel.value, vipId: currentVipLevel.value }]
})

const syncViewedVipId = () => {
  viewedVipId.value = displayVipLevels.value[selectedVipIndex.value]?.vipId ?? currentVipLevel.value
}

const setVipCardRef = (el: Element | ComponentPublicInstance | null, index: number) => {
  if (!(el instanceof HTMLElement)) {
    return
  }

  vipCardRefs.value[index] = el
}

const getNearestVipCardIndex = () => {
  const carouselElement = vipCarouselRef.value
  if (!carouselElement) {
    return 0
  }

  const cardElements = vipCardRefs.value.filter(Boolean)
  if (!cardElements.length) {
    return 0
  }

  const carouselRect = carouselElement.getBoundingClientRect()
  const carouselCenterX = carouselRect.left + carouselRect.width / 2

  let nearestIndex = 0
  let nearestDistance = Number.POSITIVE_INFINITY

  cardElements.forEach((cardElement, index) => {
    const cardRect = cardElement.getBoundingClientRect()
    const cardCenterX = cardRect.left + cardRect.width / 2
    const distance = Math.abs(cardCenterX - carouselCenterX)

    if (distance < nearestDistance) {
      nearestDistance = distance
      nearestIndex = index
    }
  })

  return nearestIndex
}

const scrollToVipCard = (index: number, behavior: 'auto' | 'smooth' = 'smooth') => {
  const targetCardElement = vipCardRefs.value[index]
  if (targetCardElement) {
    targetCardElement.scrollIntoView({ behavior, block: 'nearest', inline: 'center' })
    return
  }

  const carouselElement = vipCarouselRef.value
  if (!carouselElement) {
    return
  }

  carouselElement.scrollTo({ left: index * carouselElement.offsetWidth, behavior })
}

const onVipCarouselScroll = () => {
  const nextIndex = Math.min(
    Math.max(getNearestVipCardIndex(), 0),
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

// 点击客服
const openKefuPopup = () => {
  console.log('点击客服')
}

const openBenefitExplainPopup = () => {
  showBenefitExplainPopup.value = true
}

const closeBenefitExplainPopup = () => {
  showBenefitExplainPopup.value = false
}

// 根据按钮状态处理领取或跳转升级。
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
.vip-mobile-page {
  overscroll-behavior-y: contain;
  -webkit-overflow-scrolling: touch;
}

.vip-mobile-carousel {
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.vip-mobile-carousel::-webkit-scrollbar {
  display: none;
}
</style>
