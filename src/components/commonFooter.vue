<template>
  <footer class="w-full bg-bg-6 py-6">
    <div class="max-w-[1200px] mx-auto font-['Inter']">
      <!-- 第一排 -->
      <div class="border-b border-opacity-10 pb-6">
        <div class="flex items-start justify-between gap-x-8 mb-3 px-4">
          <!-- 左边：标题 -->
          <div class="flex-1 text-left">
            <h3 class="text-text-1 text-base font-bold">{{ t('common_footer.top.left_title') }}</h3>
            <!-- 文字说明 -->
            <div class="mt-3 flex-1 max-w-xl space-y-3">
              <p class="text-text-2 text-xs">{{ t('common_footer.top.left_desc_1') }}</p>
              <p class="text-text-2 text-xs">{{ t('common_footer.top.left_desc_2') }}</p>
            </div>
          </div>

          <!-- 右边：标题 -->
          <div class="flex-1 text-left">
            <h3 class="text-text-1 text-base font-bold">
              {{ t('common_footer.top.right_title') }}
            </h3>
            <!-- 文字说明 -->
            <div class="mt-3 flex-1 max-w-xl space-y-3">
              <p class="text-text-2 text-xs">{{ t('common_footer.top.feedback_reward') }}</p>
              <p class="text-text-2 text-xs">
                {{ t('common_footer.top.feedback_email_label')
                }}<span class="ml-2 text-theme-primary">feedback@tggame.com</span>
              </p>
              <p class="text-text-2 text-xs">{{ t('common_footer.top.security_notice') }}</p>
              <p class="text-text-2 text-xs">
                {{ t('common_footer.top.security_email_label')
                }}<span class="ml-2 text-theme-primary">security@tggame.com</span>
              </p>
            </div>
          </div>
        </div>
      </div>
      <!-- 第二排 -->
      <div class="mt-6 flex flex-wrap justify-center">
        <div
          class="max-w-[50%] flex-shrink-0 flex-grow-0 basis-1/2 px-1.5 mb-7 sm:max-w-[12.5%] sm:basis-[1/8]"
          v-for="i in 8"
          :key="`award-${i}`"
        >
          <img :src="footer1Image" :alt="t('common_footer.alt.award')" class="h-auto max-w-full" />
        </div>
      </div>

      <!-- 第三排 -->
      <div class="w-full px-4 py-4 border-y border-[#e4eaf019]">
        <div class="flex w-full flex-wrap gap-x-10 divide-x divide-[#e4eaf019]">
          <!-- 左边5个图标 -->
          <div
            class="flex flex-shrink-0 flex-grow items-center justify-around gap-x-6 cursor-pointer"
          >
            <img
              v-for="cert in leftCertifications"
              :key="cert.id"
              :src="footer2Image"
              :alt="t('common_footer.alt.certification')"
              class="h-auto w-[94px]"
              @click="cert.handler"
            />
          </div>

          <!-- 右边5个图标 -->
          <div
            class="flex flex-shrink-0 flex-grow items-center justify-around gap-x-6 cursor-pointer pl-6"
          >
            <SmartImage
              v-for="cert in rightCertifications"
              :key="cert.id"
              :src="footer3Image"
              :alt="t('common_footer.alt.certification')"
              class="h-auto w-[52px]"
              @click="cert.handler"
            />
          </div>
        </div>
      </div>

      <!-- 第四排 -->
      <div class="flex w-full flex-wrap justify-between gap-x-4 gap-y-4 px-4 py-6">
        <!-- 娱乐城 -->
        <div>
          <h3 class="mb-5 text-base font-extrabold text-text-1">
            {{ t('common_footer.sections.casino') }}
          </h3>
          <ul class="space-y-3">
            <li
              v-for="item in casinoLinks"
              :key="item.id"
              class="flex items-center gap-1 text-[14px] text-text-2 font-[600] cursor-pointer w-fit group"
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
          <h3 class="mb-5 text-base font-extrabold text-text-1">
            {{ t('common_footer.sections.sports') }}
          </h3>
          <ul class="space-y-3">
            <li
              v-for="item in sportsLinks"
              :key="item.id"
              class="flex items-center gap-1 text-[14px] text-text-2 font-[600] cursor-pointer w-fit group"
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
          <h3 class="mb-5 text-base font-extrabold text-text-1">
            {{ t('common_footer.sections.promo') }}
          </h3>
          <ul class="space-y-3">
            <li
              v-for="item in promoLinks"
              :key="item.id"
              class="flex items-center gap-1 text-[14px] text-text-2 font-[600] cursor-pointer w-fit group"
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
          <h3 class="mb-5 text-base font-extrabold text-text-1">
            {{ t('common_footer.sections.support_legal') }}
          </h3>
          <ul class="space-y-3">
            <li
              v-for="item in legalLinks"
              :key="item.id"
              class="flex items-center gap-1 text-[14px] text-text-2 font-[600] cursor-pointer w-fit group"
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
          <h3 class="mb-5 text-base font-extrabold text-text-1">
            {{ t('common_footer.sections.about_us') }}
          </h3>
          <ul class="space-y-3">
            <li
              v-for="item in aboutLinks"
              :key="item.id"
              class="flex items-center gap-1 text-[14px] text-text-2 font-[600] cursor-pointer w-fit group"
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

        <!-- 加入我们的会社群 -->
        <div>
          <h3 class="mb-5 text-base font-extrabold text-text-1">
            {{ t('common_footer.sections.global_community') }}
          </h3>
          <div class="grid grid-cols-4 gap-2">
            <div
              v-for="social in socialMediaLinks"
              :key="social.id"
              class="w-[40px] h-[40px] flex items-center justify-center bg-bg-3 rounded-lg cursor-pointer hover:bg-bg-4"
            >
              <component :is="LoginIcon1" class="w-6 h-6 fill-none" @click="social.handler" />
            </div>
          </div>
          <h3 class="mb-5 mt-6 text-base font-extrabold text-text-1">
            {{ t('common_footer.sections.local_community') }}
          </h3>
          <div class="grid grid-cols-4 gap-2">
            <div
              v-for="local in localGroupLinks"
              :key="local.id"
              class="w-[40px] h-[40px] flex items-center justify-center bg-bg-3 rounded-lg cursor-pointer hover:bg-bg-4"
            >
              <component :is="LoginIcon1" class="w-6 h-6 fill-none" @click="local.handler" />
            </div>
          </div>
        </div>
      </div>

      <!-- 第五排 -->
      <div class="border-t border-opacity-10 pt-8">
        <div class="flex items-start justify-between gap-x-8 mb-3 px-4">
          <!-- 左边：Logo -->
          <div class="flex-1 text-left">
            <div class="h-12 flex items-center">
              <MainLogoIcon class="h-8 w-auto text-text-1" :alt="t('common_footer.alt.logo')" />
            </div>
            <!-- 文字说明 -->
            <div class="mt-6 flex-1 max-w-xl space-y-4">
              <p class="text-text-2 text-xs">{{ t('common_footer.bottom.left_desc_1') }}</p>
              <p class="text-text-2 text-xs">{{ t('common_footer.bottom.left_desc_2') }}</p>
              <p class="text-text-2 text-xs">{{ t('common_footer.bottom.left_desc_3') }}</p>
            </div>
          </div>

          <!-- 右边：认证图标 -->
          <div class="flex-1 text-left">
            <SmartImage
              :src="footer4_2Image"
              :alt="t('common_footer.alt.certification')"
              class="h-12 w-auto"
              @click="bottomCertification.handler"
            />
            <!-- 文字说明 -->
            <div class="mt-6 flex-1 max-w-xl space-y-4">
              <p class="text-text-2 text-xs">{{ t('common_footer.bottom.right_desc_1') }}</p>
              <p class="text-text-2 text-xs">{{ t('common_footer.bottom.right_desc_2') }}</p>
            </div>
          </div>
        </div>

        <!-- 版权信息 -->
        <div
          class="text-center mt-8 pt-8 pb-2 px-4 border-t border-[#e4eaf019] text-text-2 text-xs"
        >
          {{ t('common_footer.copyright') }}
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { navigateTo } from '@/utils/router'
import { useCasinoTabButtons } from '@/composables/useCasinoTabButtons'
import LoginIcon1 from '@/static/svg/login/login_icon_1.svg?component'
import ExternalIcon from '@/static/svg/external.svg?component'

const footer1Image = new URL('@/static/img/commonFooter/footer_1.webp', import.meta.url).href
const footer2Image = new URL('@/static/img/commonFooter/footer_2_1.webp', import.meta.url).href
const footer3Image = new URL('@/static/img/commonFooter/footer_3_1.png', import.meta.url).href
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

// 第二排左边认证图标
const leftCertifications = computed(() => [
  {
    id: 'cert-left-1',
    handler: () => {
      console.log('cert-left-1')
    }
  },
  {
    id: 'cert-left-2',
    handler: () => {
      console.log('cert-left-2')
    }
  },
  {
    id: 'cert-left-3',
    handler: () => {
      console.log('cert-left-3')
    }
  },
  {
    id: 'cert-left-4',
    handler: () => {
      console.log('cert-left-4')
    }
  },
  {
    id: 'cert-left-5',
    handler: () => {
      console.log('cert-left-5')
    }
  }
])

// 第二排右边认证图标
const rightCertifications = computed(() => [
  {
    id: 'cert-right-1',
    handler: () => {
      console.log('cert-right-1')
    }
  },
  {
    id: 'cert-right-2',
    handler: () => {
      console.log('cert-right-2')
    }
  },
  {
    id: 'cert-right-3',
    handler: () => {
      console.log('cert-right-3')
    }
  },
  {
    id: 'cert-right-4',
    handler: () => {
      console.log('cert-right-4')
    }
  },
  {
    id: 'cert-right-5',
    handler: () => {
      console.log('cert-right-5')
    }
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

// 社交媒体链接
const socialMediaLinks = computed(() => [
  {
    id: 'social-1',
    handler: () => {
      console.log('social-1')
    }
  },
  {
    id: 'social-2',
    handler: () => {
      console.log('social-2')
    }
  },
  {
    id: 'social-3',
    handler: () => {
      console.log('social-3')
    }
  },
  {
    id: 'social-4',
    handler: () => {
      console.log('social-4')
    }
  },
  {
    id: 'social-5',
    handler: () => {
      console.log('social-5')
    }
  },
  {
    id: 'social-6',
    handler: () => {
      console.log('social-6')
    }
  },
  {
    id: 'social-7',
    handler: () => {
      console.log('social-7')
    }
  },
  {
    id: 'social-8',
    handler: () => {
      console.log('social-8')
    }
  }
])

// 本地群组链接
const localGroupLinks = computed(() => [
  {
    id: 'local-1',
    handler: () => {
      console.log('local-1')
    }
  },
  {
    id: 'local-2',
    handler: () => {
      console.log('local-2')
    }
  }
])

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
