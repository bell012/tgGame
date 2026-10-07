<template>
  <!-- 法律条款 -->
  <div>
    <h1 class="font-[700] text-text-1" :class="mobile ? 'text-[16px]' : 'text-[20px]'">
      {{ t('legalPage.cardTitle') }}
    </h1>

    <div :class="mobile ? 'mt-[10px] space-y-[10px]' : 'mt-[16px] space-y-[16px]'">
      <p
        v-for="paragraph in introParagraphs"
        :key="paragraph"
        class="font-[400] text-text-2"
        :class="mobile ? 'text-[14px]' : 'text-[14px]'"
      >
        {{ paragraph }}
      </p>
    </div>

    <div :class="mobile ? 'mt-[20px]' : 'mt-[24px]'">
      <section
        v-for="section in legalSections"
        :key="section.title"
        :class="mobile ? 'mt-[20px] first:mt-0' : 'mt-[24px] first:mt-0'"
      >
        <h2 class="font-[700] text-text-1" :class="mobile ? 'text-[14px]' : 'text-[20px]'">
          {{ section.title }}
        </h2>

        <div :class="mobile ? 'mt-[10px] space-y-[10px]' : 'mt-[16px] space-y-[16px]'">
          <p
            v-for="paragraph in section.paragraphs"
            :key="paragraph"
            class="font-[400] text-text-2"
            :class="mobile ? 'text-[14px]' : 'text-[14px]'"
          >
            {{ paragraph }}
          </p>
        </div>
      </section>

      <p
        class="font-[400] text-text-2"
        :class="mobile ? 'mt-[10px] text-[14px]' : 'mt-[16px] text-[14px]'"
      >
        {{ t('legalPage.notice') }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

interface Props {
  mobile?: boolean
}

withDefaults(defineProps<Props>(), {
  mobile: false
})

const { t } = useI18n()

// 生成法律条款顶部说明文案，方便单独控制段落间距
const introParagraphs = computed(() => [t('legalPage.welcome'), t('legalPage.description')])

// 生成法律条款分段文案，方便每个小标题和段落单独调整样式
const legalSections = computed(() => [
  {
    title: t('legalPage.eligibilityTitle'),
    paragraphs: [t('legalPage.eligibilityParagraph1'), t('legalPage.eligibilityParagraph2')]
  },
  {
    title: t('legalPage.accountUsageTitle'),
    paragraphs: [
      t('legalPage.accountUsageParagraph1'),
      t('legalPage.accountUsageParagraph2'),
      t('legalPage.accountUsageParagraph3')
    ]
  },
  {
    title: t('legalPage.gamesBettingTitle'),
    paragraphs: [
      t('legalPage.gamesBettingParagraph1'),
      t('legalPage.gamesBettingParagraph2'),
      t('legalPage.gamesBettingParagraph3')
    ]
  },
  {
    title: t('legalPage.depositsWithdrawalsTitle'),
    paragraphs: [
      t('legalPage.depositsWithdrawalsParagraph1'),
      t('legalPage.depositsWithdrawalsParagraph2'),
      t('legalPage.depositsWithdrawalsParagraph3')
    ]
  },
  {
    title: t('legalPage.promotionsRewardsTitle'),
    paragraphs: [
      t('legalPage.promotionsRewardsParagraph1'),
      t('legalPage.promotionsRewardsParagraph2')
    ]
  },
  {
    title: t('legalPage.fairUseTitle'),
    paragraphs: [t('legalPage.fairUseParagraph1'), t('legalPage.fairUseParagraph2')]
  },
  {
    title: t('legalPage.responsibleGamingTitle'),
    paragraphs: [
      t('legalPage.responsibleGamingParagraph1'),
      t('legalPage.responsibleGamingParagraph2'),
      t('legalPage.responsibleGamingParagraph3')
    ]
  },
  {
    title: t('legalPage.privacyDataTitle'),
    paragraphs: [t('legalPage.privacyDataParagraph1'), t('legalPage.privacyDataParagraph2')]
  },
  {
    title: t('legalPage.serviceChangesTitle'),
    paragraphs: [t('legalPage.serviceChangesParagraph1'), t('legalPage.serviceChangesParagraph2')]
  },
  {
    title: t('legalPage.updatesTitle'),
    paragraphs: [t('legalPage.updatesParagraph1'), t('legalPage.updatesParagraph2')]
  }
])
</script>
