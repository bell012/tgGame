<template>
  <footer class="w-full bg-bg-6 py-6">
    <div class="max-w-[1200px] mx-auto font-['Inter']">
      <!-- 第一排 -->
      <div class="border-b border-opacity-10 pb-6">
        <div class="flex items-start justify-between gap-x-8">
          <!-- 左边：标题 -->
          <div class="flex-1 text-left">
            <h3 class="text-text-1 text-base font-bold">{{ t('common_footer.top.left_title') }}</h3>
            <!-- 文字说明 -->
            <div class="mt-3 max-w-xl space-y-3">
              <p class="text-text-2 text-[13px]">{{ t('common_footer.top.left_desc_1') }}</p>
              <p class="text-text-2 text-[13px]">{{ t('common_footer.top.left_desc_2') }}</p>
            </div>
          </div>

          <!-- 右边：标题 -->
          <div class="flex-1 text-left">
            <h3 class="text-text-1 text-base font-bold">
              {{ t('common_footer.top.right_title') }}
            </h3>
            <!-- 文字说明 -->
            <div class="mt-3 max-w-xl space-y-3">
              <p class="text-text-2 text-[13px]">{{ t('common_footer.top.feedback_reward') }}</p>
              <p class="text-text-2 text-[13px]">
                {{ t('common_footer.top.feedback_email_label')
                }}<span class="ml-2 text-theme-primary">feedback@tggame.com</span>
              </p>
              <p class="text-text-2 text-[13px]">{{ t('common_footer.top.security_notice') }}</p>
              <p class="text-text-2 text-[13px]">
                {{ t('common_footer.top.security_email_label')
                }}<span class="ml-2 text-theme-primary">security@tggame.com</span>
              </p>
            </div>
          </div>
        </div>
      </div>
      <!-- 第二排：固定一栏 8 个，间距 8px，圆角 14px -->
      <div class="grid w-full grid-cols-8 gap-[8px] border-b border-opacity-10 py-6">
        <div
          class="aspect-[5/3] w-full min-w-0 overflow-hidden rounded-[14px] bg-bg-5"
          v-for="(src, i) in row2AwardSrcs"
          :key="`award-${i}`"
        >
          <SmartImage
            :src="src"
            :alt="t('common_footer.alt.award')"
            class="h-full w-full object-contain"
          />
        </div>
      </div>

      <!-- 第三排：行间竖线不用 divide-*（无 token / 易受 reset 影响），用 border-l 显式分隔 -->
      <div class="w-full border-b border-opacity-10 py-6">
        <div class="flex w-full flex-wrap gap-x-10">
          <!-- 左 -->
          <div class="flex flex-shrink-0 flex-grow items-center justify-around gap-x-6">
            <a
              v-for="cert in leftCertifications"
              :key="cert.id"
              class="inactive inline-flex max-w-none shrink-0 items-center justify-center"
              :href="cert.href"
              :target="cert.targetBlank ? '_blank' : undefined"
              :rel="cert.targetBlank ? 'noopener noreferrer' : undefined"
              @click="onPartnerBadgeClick(cert, $event)"
            >
              <SmartImage
                :src="cert.src"
                :alt="cert.alt || t('common_footer.alt.certification')"
                class="block h-auto w-full max-w-none object-contain"
                :style="{ width: `${cert.imgWidthPx}px`, maxWidth: `${cert.imgWidthPx}px` }"
              />
            </a>
          </div>

          <!-- 右 -->
          <div
            class="flex flex-shrink-0 flex-grow items-center justify-around gap-x-6 border-l border-solid border-opacity-10 pl-6"
          >
            <a
              v-for="cert in rightCertifications"
              :key="cert.id"
              class="inactive inline-flex max-w-none shrink-0 items-center justify-center"
              :href="cert.href"
              :target="cert.targetBlank ? '_blank' : undefined"
              :rel="cert.targetBlank ? 'noopener noreferrer' : undefined"
              @click="onPartnerBadgeClick(cert, $event)"
            >
              <SmartImage
                :src="cert.src"
                :alt="cert.alt || t('common_footer.alt.certification')"
                class="block h-auto w-full max-w-none object-contain"
                :style="{ width: `${cert.imgWidthPx}px`, maxWidth: `${cert.imgWidthPx}px` }"
              />
            </a>
          </div>
        </div>
      </div>

      <!-- 第四排 -->
      <div
        class="flex w-full flex-wrap justify-between gap-x-4 gap-y-4 py-6 border-b border-opacity-10"
      >
        <!-- 娱乐城 -->
        <div>
          <h3 class="mb-5 text-sm font-bold leading-normal text-text-1">
            {{ t('common_footer.sections.casino') }}
          </h3>
          <ul class="space-y-3">
            <li
              v-for="item in casinoLinks"
              :key="item.id"
              class="flex items-center gap-1 text-[13px] font-normal leading-normal text-text-2 cursor-pointer w-fit group"
              @click="item.handler"
            >
              <span
                class="relative inline-block transition-colors group-hover:text-theme-primary group-hover:underline"
                >{{ item.name }}</span
              >
              <component
                v-if="item.hasExternalIcon"
                :is="ExternalIcon"
                class="w-4 h-4 flex-shrink-0"
              />
            </li>
          </ul>
        </div>

        <!-- 体育 -->
        <div>
          <h3 class="mb-5 text-sm font-bold leading-normal text-text-1">
            {{ t('common_footer.sections.sports') }}
          </h3>
          <ul class="space-y-3">
            <li
              v-for="item in sportsLinks"
              :key="item.id"
              class="flex items-center gap-1 text-[13px] font-normal leading-normal text-text-2 cursor-pointer w-fit group"
              @click="item.handler"
            >
              <span
                class="relative inline-block transition-colors group-hover:text-theme-primary group-hover:underline"
                >{{ item.name }}</span
              >
              <component
                v-if="item.hasExternalIcon"
                :is="ExternalIcon"
                class="w-4 h-4 flex-shrink-0"
              />
            </li>
          </ul>
        </div>

        <!-- 支援 -->
        <div>
          <h3 class="mb-5 text-sm font-bold leading-normal text-text-1">
            {{ t('common_footer.sections.promo') }}
          </h3>
          <ul class="space-y-3">
            <li
              v-for="item in promoLinks"
              :key="item.id"
              class="flex items-center gap-1 text-[13px] font-normal leading-normal text-text-2 cursor-pointer w-fit group"
              @click="item.handler"
            >
              <span
                class="relative inline-block transition-colors group-hover:text-theme-primary group-hover:underline"
                >{{ item.name }}</span
              >
              <component
                v-if="item.hasExternalIcon"
                :is="ExternalIcon"
                class="w-4 h-4 flex-shrink-0"
              />
            </li>
          </ul>
        </div>

        <!-- 支援/法律 -->
        <div>
          <h3 class="mb-5 text-sm font-bold leading-normal text-text-1">
            {{ t('common_footer.sections.support_legal') }}
          </h3>
          <ul class="space-y-3">
            <li
              v-for="item in legalLinks"
              :key="item.id"
              class="flex items-center gap-1 text-[13px] font-normal leading-normal text-text-2 cursor-pointer w-fit group"
              @click="item.handler"
            >
              <span
                class="relative inline-block transition-colors group-hover:text-theme-primary group-hover:underline"
                >{{ item.name }}</span
              >
              <component
                v-if="item.hasExternalIcon"
                :is="ExternalIcon"
                class="w-4 h-4 flex-shrink-0"
              />
            </li>
          </ul>
        </div>

        <!-- 支援 -->
        <div>
          <h3 class="mb-5 text-sm font-bold leading-normal text-text-1">
            {{ t('common_footer.sections.about_us') }}
          </h3>
          <ul class="space-y-3">
            <li
              v-for="item in aboutLinks"
              :key="item.id"
              class="flex items-center gap-1 text-[13px] font-normal leading-normal text-text-2 cursor-pointer w-fit group"
              @click="item.handler"
            >
              <span
                class="relative inline-block transition-colors group-hover:text-theme-primary group-hover:underline"
                >{{ item.name }}</span
              >
              <component
                v-if="item.hasExternalIcon"
                :is="ExternalIcon"
                class="w-4 h-4 flex-shrink-0"
              />
            </li>
          </ul>
        </div>

        <div>
          <!-- 加入我们全球社区 -->
          <h3 class="mb-5 text-sm font-bold leading-normal text-text-1">
            {{ t('common_footer.sections.global_community') }}
          </h3>
          <div class="grid grid-cols-4 gap-2">
            <div
              v-for="social in socialMediaLinks"
              :key="social.id"
              class="w-[40px] h-[40px] flex items-center justify-center bg-bg-3 rounded-lg cursor-pointer hover:bg-bg-4 text-icon-2"
              @click="social.handler"
            >
              <component :is="social.icon" class="block h-6 w-6" />
            </div>
          </div>
          <!-- 加入我们本地社区 -->
          <h3 class="mb-5 mt-6 text-sm font-bold leading-normal text-text-1">
            {{ t('common_footer.sections.local_community') }}
          </h3>
          <div class="grid grid-cols-4 gap-2">
            <div
              v-for="local in localGroupLinks"
              :key="local.id"
              class="w-[40px] h-[40px] flex items-center justify-center bg-bg-3 rounded-lg cursor-pointer hover:bg-bg-4 text-icon-2"
              @click="local.handler"
            >
              <component :is="local.icon" class="block h-6 w-6" />
            </div>
          </div>
        </div>
      </div>

      <!-- 第五排 -->
      <div class="py-6 border-b border-opacity-10 flex items-start justify-between gap-x-8">
        <!-- 左边：Logo -->
        <div class="flex-1 text-left">
          <div class="h-12 flex items-start">
            <MainLogoIcon class="h-8 w-auto text-text-1" :alt="t('common_footer.alt.logo')" />
          </div>
          <!-- 文字说明 -->
          <div class="mt-6 max-w-xl space-y-4">
            <p class="text-text-2 text-xs">{{ t('common_footer.bottom.left_desc_1') }}</p>
            <p class="text-text-2 text-xs">{{ t('common_footer.bottom.left_desc_2') }}</p>
            <p class="text-text-2 text-xs">{{ t('common_footer.bottom.left_desc_3') }}</p>
          </div>
        </div>

        <!-- 右边：认证图标 -->
        <div class="flex-1 text-left">
          <div class="h-12 flex items-start">
            <SmartImage
              :src="footer4_2Image"
              :alt="t('common_footer.alt.certification')"
              class="block h-12 w-auto"
              @click="bottomCertification.handler"
            />
          </div>
          <!-- 文字说明 -->
          <div class="mt-6 max-w-xl space-y-4">
            <p class="text-text-2 text-xs">{{ t('common_footer.bottom.right_desc_1') }}</p>
            <p class="text-text-2 text-xs">{{ t('common_footer.bottom.right_desc_2') }}</p>
          </div>
        </div>
      </div>
      <!-- 第六排 版权信息 -->
      <div class="pt-6 text-center text-xs text-text-2">
        {{ t('common_footer.copyright') }}
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { computed, onMounted, type Component } from 'vue'
import { useI18n } from 'vue-i18n'
import { navigateTo } from '@/utils/router'
import { useCasinoTabButtons } from '@/composables/useCasinoTabButtons'
import ExternalIcon from '@/static/svg/external.svg?component'
import SmartImage from '@/components/common/SmartImage.vue'
import FooterGlobalCommunity01 from '@/static/svg/commonFooter/social/footer_global_community_01.svg?component'
import FooterGlobalCommunity02 from '@/static/svg/commonFooter/social/footer_global_community_02.svg?component'
import FooterGlobalCommunity03 from '@/static/svg/commonFooter/social/footer_global_community_03.svg?component'
import FooterGlobalCommunity04 from '@/static/svg/commonFooter/social/footer_global_community_04.svg?component'
import FooterGlobalCommunity05 from '@/static/svg/commonFooter/social/footer_global_community_05.svg?component'
import FooterGlobalCommunity06 from '@/static/svg/commonFooter/social/footer_global_community_06.svg?component'
import FooterGlobalCommunity07 from '@/static/svg/commonFooter/social/footer_global_community_07.svg?component'
import FooterGlobalCommunity08 from '@/static/svg/commonFooter/social/footer_global_community_08.svg?component'
import FooterLocalCommunity01 from '@/static/svg/commonFooter/social/footer_local_community_01.svg?component'

const GLOBAL_COMMUNITY_ICONS: Component[] = [
  FooterGlobalCommunity01,
  FooterGlobalCommunity02,
  FooterGlobalCommunity03,
  FooterGlobalCommunity04,
  FooterGlobalCommunity05,
  FooterGlobalCommunity06,
  FooterGlobalCommunity07,
  FooterGlobalCommunity08
]

/** 本地社群：与设计稿 SVG 导出顺序一致；当前画布仅一枚图标节点 */
const LOCAL_COMMUNITY_ICONS: Component[] = [FooterLocalCommunity01]

/** 第二排奖项图 */
const row2AwardSrcs = [
  new URL('@/static/img/commonFooter/row2/d-92-DCx7K2V3.png', import.meta.url).href,
  new URL('@/static/img/commonFooter/row2/d-93-0pkDEp9Z.png', import.meta.url).href,
  new URL('@/static/img/commonFooter/row2/d-94-BjjhhHHh.png', import.meta.url).href,
  new URL('@/static/img/commonFooter/row2/d-95-CMQSGT4N.png', import.meta.url).href,
  new URL('@/static/img/commonFooter/row2/d-96-pZM7QuMr.png', import.meta.url).href,
  new URL('@/static/img/commonFooter/row2/d-97-qal8av7f.png', import.meta.url).href,
  new URL('@/static/img/commonFooter/row2/d-98-DA42CT6W.png', import.meta.url).href,
  new URL('@/static/img/commonFooter/row2/d-99-NFJF9gM_.png', import.meta.url).href
]

const footer4_2Image = new URL('@/static/img/commonFooter/footer_4_2.png', import.meta.url).href
import MainLogoIcon from '@/static/svg/main-logo.svg?component'

const { t } = useI18n()
const isLoggedIn = computed(() => Boolean(localStorage.getItem('userInfo')))
const { tabButtons: casinoTabButtons, loadCasinoTabButtons } = useCasinoTabButtons({ isLoggedIn })

type FooterLink = {
  id: string
  name: string
  hasExternalIcon: boolean
  handler: () => void
}

/** 第三排徽标：`imgWidthPx` / `href` 与设计稿对齐；站内链用 SPA 跳转 */
type FooterBadge = {
  id: string
  src: string
  alt?: string
  imgWidthPx: number
  href: string
  external: boolean
  targetBlank: boolean
}

const onPartnerBadgeClick = (cert: FooterBadge, e: MouseEvent) => {
  if (cert.external) return
  e.preventDefault()
  navigateTo(cert.href)
}

const footerRow3Left_sigma = new URL(
  '@/static/img/commonFooter/row3/footer_row3_left_sigma.webp',
  import.meta.url
).href
const footerRow3Left_responsible = new URL(
  '@/static/img/commonFooter/row3/footer_row3_left_responsible_gambling.webp',
  import.meta.url
).href
const footerRow3Left_gamcare = new URL(
  '@/static/img/commonFooter/row3/footer_row3_left_gamcare.webp',
  import.meta.url
).href
const footerRow3Left_betblocker = new URL(
  '@/static/img/commonFooter/row3/footer_row3_left_betblocker.webp',
  import.meta.url
).href
const footerRow3Left_18_plus = new URL(
  '@/static/img/commonFooter/row3/footer_row3_left_18_plus.webp',
  import.meta.url
).href

const footerRow3Right_leicester = new URL(
  '@/static/img/commonFooter/row3/footer_row3_right_leicester.webp',
  import.meta.url
).href
const footerRow3Right_miami = new URL(
  '@/static/img/commonFooter/row3/footer_row3_right_miami.webp',
  import.meta.url
).href
const footerRow3Right_o_higgins = new URL(
  '@/static/img/commonFooter/row3/footer_row3_right_o_higgins.webp',
  import.meta.url
).href
const footerRow3Right_jason_derulo = new URL(
  '@/static/img/commonFooter/row3/footer_row3_right_jason_derulo.webp',
  import.meta.url
).href
const footerRow3Right_kwara_united = new URL(
  '@/static/img/commonFooter/row3/footer_row3_right_kwara_united.webp',
  import.meta.url
).href

// 第三排：合规与合作——徽章物料与其他端/产品同源；跳转地址按本产品配置（若有差异可改下列 href）
const leftCertifications = computed<FooterBadge[]>(() => [
  {
    id: 'cert-row3-sigma',
    src: footerRow3Left_sigma,
    alt: 'sigma',
    imgWidthPx: 94,
    href: 'https://sigma.world/',
    external: true,
    targetBlank: true
  },
  {
    id: 'cert-row3-responsible-gambling',
    src: footerRow3Left_responsible,
    alt: 'responsible gambling',
    imgWidthPx: 104,
    href: 'https://www.responsiblegambling.org/',
    external: true,
    targetBlank: true
  },
  {
    id: 'cert-row3-gamcare',
    src: footerRow3Left_gamcare,
    alt: 'GamCare',
    imgWidthPx: 125,
    href: 'https://www.gamcare.org.uk/',
    external: true,
    targetBlank: true
  },
  {
    id: 'cert-row3-betblocker',
    src: footerRow3Left_betblocker,
    alt: 'BetBlocker',
    imgWidthPx: 180,
    href: 'https://betblocker.org',
    external: true,
    targetBlank: true
  },
  {
    id: 'cert-row3-18-plus',
    src: footerRow3Left_18_plus,
    alt: '18+',
    imgWidthPx: 50,
    href: '/help/protect-minors',
    external: false,
    targetBlank: false
  }
])

const rightCertifications = computed<FooterBadge[]>(() => [
  {
    id: 'cert-row3-leicester',
    src: footerRow3Right_leicester,
    alt: 'Leicester City',
    imgWidthPx: 52,
    href: 'https://www.lcfc.com/',
    external: true,
    targetBlank: true
  },
  {
    id: 'cert-row3-miami',
    src: footerRow3Right_miami,
    alt: 'Inter Miami',
    imgWidthPx: 52,
    href: 'https://themiamipc.com/home',
    external: true,
    targetBlank: true
  },
  {
    id: 'cert-row3-o-higgins',
    src: footerRow3Right_o_higgins,
    alt: 'O Higgins',
    imgWidthPx: 52,
    href: 'https://www.ohigginsfc.cl/',
    external: true,
    targetBlank: true
  },
  {
    id: 'cert-row3-jason-derulo',
    src: footerRow3Right_jason_derulo,
    alt: 'Jason Derulo',
    imgWidthPx: 100,
    href: 'https://www.jasonderulo.com/',
    external: true,
    targetBlank: true
  },
  {
    id: 'cert-row3-kwara-united',
    src: footerRow3Right_kwara_united,
    alt: 'Kwara United',
    imgWidthPx: 52,
    href: 'https://x.com/KwaraUnitedFC',
    external: true,
    targetBlank: true
  }
])

// 娱乐城链接
const casinoLinks = computed<FooterLink[]>(() =>
  casinoTabButtons.value.map(item => ({
    id: `casino_${item.sysGameTypeCode || 'home'}`,
    name: item.sysGameTypeName,
    hasExternalIcon: false,
    handler: () => {
      if (!item.sysGameTypeCode) {
        navigateTo('/casino')
        return
      }

      navigateTo(`/casino/${item.sysGameTypeCode}`)
    }
  }))
)

// 体育链接
const sportsLinks = computed(() => [
  {
    id: 'sports_fifa',
    name: t('sidebar_menu.sports.children.fifa'),
    hasExternalIcon: false,
    handler: () => {
      console.log('点击 FIFA')
    }
  },
  {
    id: 'sports_soccer',
    name: t('sidebar_menu.sports.children.soccer'),
    hasExternalIcon: false,
    handler: () => {
      console.log('点击 足球')
    }
  },
  {
    id: 'sports_basketball',
    name: t('sidebar_menu.sports.children.basketball'),
    hasExternalIcon: false,
    handler: () => {
      console.log('点击 篮球')
    }
  },
  {
    id: 'sports_tennis',
    name: t('sidebar_menu.sports.children.tennis'),
    hasExternalIcon: false,
    handler: () => {
      console.log('点击 网球')
    }
  },
  {
    id: 'sports_badminton',
    name: t('sidebar_menu.sports.children.badminton'),
    hasExternalIcon: false,
    handler: () => {
      console.log('点击 羽毛球')
    }
  },
  {
    id: 'sports_boxing',
    name: t('sidebar_menu.sports.children.boxing'),
    hasExternalIcon: false,
    handler: () => {
      console.log('点击 拳击')
    }
  },
  {
    id: 'sports_darts',
    name: t('sidebar_menu.sports.children.darts'),
    hasExternalIcon: false,
    handler: () => {
      console.log('点击 飞镖')
    }
  },
  {
    id: 'sports_american_football',
    name: t('sidebar_menu.sports.children.american_football'),
    hasExternalIcon: false,
    handler: () => {
      console.log('点击 美式足球')
    }
  },
  {
    id: 'sports_table_tennis',
    name: t('sidebar_menu.sports.children.table_tennis'),
    hasExternalIcon: false,
    handler: () => {
      console.log('点击 乒乓球')
    }
  },
  {
    id: 'sports_volleyball',
    name: t('sidebar_menu.sports.children.volleyball'),
    hasExternalIcon: false,
    handler: () => {
      console.log('点击 排球')
    }
  }
])

// 优惠链接
const promoLinks = computed(() => [
  {
    id: 'support-vip',
    name: t('sidebar_menu.links.vip.name'),
    hasExternalIcon: false,
    handler: () => {
      navigateTo('/vip')
    }
  },
  {
    id: 'support-promo',
    name: t('sidebar_menu.links.recommend'),
    hasExternalIcon: false,
    handler: () => {
      navigateTo('/referral')
    }
  },
  {
    id: 'support-affiliate',
    name: t('sidebar_menu.promotions.label'),
    hasExternalIcon: false,
    handler: () => {
      console.log('促销')
    }
  },
  {
    id: 'support-sponsorship',
    name: t('sidebar_menu.lottery.label'),
    hasExternalIcon: false,
    handler: () => {
      console.log('彩票')
    }
  },
  {
    id: 'support-friends',
    name: t('sidebar_menu.promotions.children.invite_rewards'),
    hasExternalIcon: false,
    handler: () => {
      navigateTo('/referral')
    }
  },
  {
    id: 'support-bc',
    name: t('common_footer.links.bc_store'),
    hasExternalIcon: true,
    handler: () => {
      console.log('BC 商店')
    }
  }
])

// 支援/法律链接
const legalLinks = computed(() => [
  {
    id: 'legal-license',
    name: t('sidebar_menu.about_us.items.license'),
    hasExternalIcon: false,
    handler: () => {
      console.log('许可证')
    }
  },
  {
    id: 'legal-help',
    name: t('sidebar_menu.support.items.help_center'),
    hasExternalIcon: false,
    handler: () => {
      console.log('点击 帮助中心')
    }
  },
  {
    id: 'legal-fairness',
    name: t('sidebar_menu.legal.items.fairness'),
    hasExternalIcon: false,
    handler: () => {
      console.log('推荐博彩')
    }
  },
  {
    id: 'legal-notice',
    name: t('common_footer.links.notice_board'),
    hasExternalIcon: false,
    handler: () => {
      console.log('公告栏')
    }
  },
  {
    id: 'legal-forum',
    name: t('sidebar_menu.support.items.faq'),
    hasExternalIcon: false,
    handler: () => {
      console.log('点击 常见问题')
    }
  },
  {
    id: 'legal-privacy',
    name: t('sidebar_menu.legal.items.privacy_policy'),
    hasExternalIcon: false,
    handler: () => {
      console.log('隐私权政策')
    }
  },
  {
    id: 'legal-terms',
    name: t('sidebar_menu.legal.items.terms_of_service'),
    hasExternalIcon: false,
    handler: () => {
      console.log('服务条款')
    }
  },
  {
    id: 'legal-kyc',
    name: t('common_footer.links.law_enforcement'),
    hasExternalIcon: false,
    handler: () => {
      console.log('执法机关')
    }
  },
  {
    id: 'legal-responsibility',
    name: t('sidebar_menu.legal.items.gamble_aware'),
    hasExternalIcon: false,
    handler: () => {
      console.log('点击 理性博彩')
    }
  },
  {
    id: 'legal-aml',
    name: t('sidebar_menu.legal.items.aml'),
    hasExternalIcon: false,
    handler: () => {
      console.log('AML')
    }
  },
  {
    id: 'legal-audit',
    name: t('sidebar_menu.about_us.items.design_resources'),
    hasExternalIcon: true,
    handler: () => {
      console.log('设计资源')
    }
  },
  {
    id: 'legal-online',
    name: t('common_footer.links.live_support'),
    hasExternalIcon: false,
    handler: () => {
      console.log('线上客服')
    }
  },
  {
    id: 'legal-ceo',
    name: t('sidebar_menu.support.items.ceo_inbox'),
    hasExternalIcon: false,
    handler: () => {
      console.log('点击 CEO 信箱')
    }
  }
])

// 关于我们链接
const aboutLinks = computed(() => [
  {
    id: 'support2-news',
    name: t('sidebar_menu.about_us.items.news'),
    hasExternalIcon: true,
    handler: () => {
      console.log('点击 新闻')
    }
  },
  {
    id: 'support2-partner',
    name: t('sidebar_menu.about_us.items.work_with_us'),
    hasExternalIcon: true,
    handler: () => {
      console.log('点击 与我们合作')
    }
  },
  {
    id: 'support2-intro',
    name: t('sidebar_menu.about_us.items.business_contacts'),
    hasExternalIcon: false,
    handler: () => {
      console.log('商务简介')
    }
  },
  {
    id: 'support2-service',
    name: t('sidebar_menu.about_us.items.help_desk'),
    hasExternalIcon: true,
    handler: () => {
      console.log('点击 服务台')
    }
  },
  {
    id: 'support2-verify',
    name: t('sidebar_menu.about_us.items.verify_representative'),
    hasExternalIcon: false,
    handler: () => {
      console.log('点击 验证代表')
    }
  },
  {
    id: 'support2-verify-game',
    name: t('sidebar_menu.about_us.items.design_resources'),
    hasExternalIcon: false,
    handler: () => {
      console.log('点击 设计资源')
    }
  }
])

// 社交媒体链接（图标与 Figma SVG 节点顺序一致：左→右、上→下）
const socialMediaLinks = computed(() =>
  GLOBAL_COMMUNITY_ICONS.map((icon, i) => ({
    id: `social-${i + 1}`,
    icon,
    handler: () => {
      console.log(`social-${i + 1}`)
    }
  }))
)

const localGroupLinks = computed(() =>
  LOCAL_COMMUNITY_ICONS.map((icon, i) => ({
    id: `local-${i + 1}`,
    icon,
    handler: () => {
      console.log(`local-${i + 1}`)
    }
  }))
)

// 底部认证图标
const bottomCertification = {
  id: 'bottom-cert',
  handler: () => {
    console.log('bottom-cert')
  }
}

onMounted(() => {
  void loadCasinoTabButtons()
})
</script>
