<template>
  <!-- 关于我们 -->
  <div>
    <h1 class="font-[700] text-text-1" :class="mobile ? 'text-[16px]' : 'text-[20px]'">
      {{ t('aboutPage.cardTitle') }}
    </h1>

    <div :class="mobile ? 'mt-[10px]' : 'mt-[16px]'">
      <section
        v-for="section in aboutSections"
        :key="section.title"
        :class="mobile ? 'mt-[10px] first:mt-0' : 'mt-[16px] first:mt-0'"
      >
        <h2 class="font-[700] text-text-2" :class="mobile ? 'text-[14px]' : 'text-[14px]'">
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
        {{ t('aboutPage.closing') }}
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

// 生成关于我们页面的分段文案，方便每段单独调整间距和样式
const aboutSections = computed(() => [
  {
    title: t('aboutPage.introTitle'),
    paragraphs: [t('aboutPage.introParagraph1'), t('aboutPage.introParagraph2')]
  },
  {
    title: t('aboutPage.experienceTitle'),
    paragraphs: [t('aboutPage.experienceParagraph1'), t('aboutPage.experienceParagraph2')]
  },
  {
    title: t('aboutPage.stabilityTitle'),
    paragraphs: [t('aboutPage.stabilityParagraph1')]
  },
  {
    title: t('aboutPage.improvementTitle'),
    paragraphs: [t('aboutPage.improvementParagraph1'), t('aboutPage.improvementParagraph2')]
  }
])
</script>
