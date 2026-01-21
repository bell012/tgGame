<template>
  <footer class="w-full bg-bg-6 py-6">
    <div class="pb-1 pt-8 max-w-[1200px] mx-auto">
      <!-- 第一排 -->
      <div class="flex flex-wrap justify-center">
        <div
          class="max-w-[50%] flex-shrink-0 flex-grow-0 basis-1/2 px-1.5 mb-7 sm:max-w-[12.5%] sm:basis-[1/8]"
          v-for="i in 8"
          :key="`award-${i}`"
        >
          <img :src="footer1Image" alt="Award" class="h-auto max-w-full" />
        </div>
      </div>

      <!-- 第二排 -->
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
              alt="Certification"
              class="h-auto w-[94px]"
              @click="cert.handler"
            />
          </div>

          <!-- 右边5个图标 -->
          <div
            class="flex flex-shrink-0 flex-grow items-center justify-around gap-x-6 cursor-pointer pl-6"
          >
            <img
              v-for="cert in rightCertifications"
              :key="cert.id"
              :src="footer3Image"
              alt="Certification"
              class="h-auto w-[52px]"
              @click="cert.handler"
            />
          </div>
        </div>
      </div>

      <!-- 第三排 -->
      <div class="flex w-full flex-wrap justify-between gap-x-4 gap-y-4 px-4 py-6">
        <!-- 娱乐城 -->
        <div>
          <h3 class="mb-5 text-base font-extrabold text-text-1">娱乐城</h3>
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
          <h3 class="mb-5 text-base font-extrabold text-text-1">体育</h3>
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
          <h3 class="mb-5 text-base font-extrabold text-text-1">支援</h3>
          <ul class="space-y-3">
            <li
              v-for="item in supportLinks"
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
          <h3 class="mb-5 text-base font-extrabold text-text-1">支援/法律</h3>
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
          <h3 class="mb-5 text-base font-extrabold text-text-1">支援</h3>
          <ul class="space-y-3">
            <li
              v-for="item in supportLinks2"
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
          <h3 class="mb-5 text-base font-extrabold text-text-1">加入我们的会社群</h3>
          <div class="grid grid-cols-4 gap-2">
            <div
              v-for="social in socialMediaLinks"
              :key="social.id"
              class="w-[40px] h-[40px] flex items-center justify-center bg-bg-3 rounded-lg cursor-pointer hover:bg-bg-4"
            >
              <component :is="LoginIcon1" class="w-6 h-6 fill-none" @click="social.handler" />
            </div>
          </div>
          <h3 class="mb-5 mt-6 text-base font-extrabold text-text-1">加入我们的会本地群</h3>
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

      <!-- 第四排 -->
      <div class="border-t border-[#e4eaf019] pt-8">
        <div class="flex items-center justify-between gap-x-8 mb-3 px-4">
          <!-- 左边：Logo -->
          <div class="flex-1">
            <img :src="footer4_1Image" alt="BC.GAME Logo" class="h-8 w-auto" />
          </div>

          <!-- 右边：认证图标 -->
          <div class="flex-1 cursor-pointer">
            <img
              :src="footer4_2Image"
              alt="Certification"
              class="h-[60px] w-auto"
              @click="bottomCertification.handler"
            />
          </div>
        </div>

        <div class="flex items-start justify-between px-4">
          <!-- 左边：文字说明 -->
          <div class="flex-1 max-w-xl space-y-4">
            <p class="text-text-2 text-[12px]">
              本游戏平台人员都经过培训,确保负责任的游戏。我们将不断的努力,提升您的游戏体验,尖端的体验和我们的服务更加愉快。我们承诺对您的数据。立即开始。高兴。领到奖金是不可。
            </p>
            <p class="text-text-2 text-[12px]">
              您使用有限 BC.GAME 即 Twocent Technology Limited
              的管理公司。该公司根据库拉索岛法律注册并获得许可。并且获得库拉索岛政府颁发的许可证。并且获得库拉索岛政府颁发的许可证。
            </p>
            <p class="text-text-2 text-[12px]">
              赌博可能会上瘾。请谨慎游戏并了解手中的赌博游戏是否适合您。因此请务必谨慎行事并遵守当地法律法规。
            </p>
          </div>

          <!-- 右边：文字说明 -->
          <div class="flex-shrink-0 max-w-md space-y-2">
            <p class="text-text-2 text-[12px]">
              BC.GAME由 Twocent Technology Limited
              负责营运。该公司依据伯利兹法律注册成立为有限责任公司，注册编号为 41939，注册地址为 Sea
              Urchin Street #2, San Pedro, Ambergris Caye, Belize。
              BC.GAME已获科摩罗联盟属下安朱昂自治岛政府授权并受其监管，并持有牌照编号
              ALSI-202410011-FI1。
            </p>
            <p class="text-text-2 text-[12px]">
              BC.GAME已通过所有监管合规审查，依法获准经营任何形式的博彩及游戏相关业务。
            </p>
          </div>
        </div>

        <!-- 版权信息 -->
        <div
          class="text-center mt-8 pt-8 pb-2 px-4 border-t border-[#e4eaf019] text-text-2 text-[12px]"
        >
          版权 ©2024 Twocent Technology Limited 版权所有。IBTC-U15899,442,15
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import LoginIcon1 from '@/static/svg/login/login_icon_1.svg?component'
import ExternalIcon from '@/static/svg/external.svg?component'

const footer1Image = new URL('@/static/img/commonFooter/footer_1.webp', import.meta.url).href
const footer2Image = new URL('@/static/img/commonFooter/footer_2_1.webp', import.meta.url).href
const footer3Image = new URL('@/static/img/commonFooter/footer_3_1.png', import.meta.url).href
const footer4_1Image = new URL('@/static/img/commonFooter/footer_4_1.webp', import.meta.url).href
const footer4_2Image = new URL('@/static/img/commonFooter/footer_4_2.png', import.meta.url).href

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
const casinoLinks = computed(() => [
  {
    id: 'casino-home',
    name: '娱乐城首页',
    hasExternalIcon: false,
    handler: () => {
      console.log('娱乐城首页')
    }
  },
  {
    id: 'casino-slots',
    name: '老虎机',
    hasExternalIcon: false,
    handler: () => {
      console.log('老虎机')
    }
  },
  {
    id: 'casino-live',
    name: '真人娱乐城',
    hasExternalIcon: false,
    handler: () => {
      console.log('真人娱乐城')
    }
  },
  {
    id: 'casino-lottery',
    name: '彩票发售',
    hasExternalIcon: false,
    handler: () => {
      console.log('彩票发售')
    }
  },
  {
    id: 'casino-fishing',
    name: '捕鱼',
    hasExternalIcon: false,
    handler: () => {
      console.log('捕鱼')
    }
  },
  {
    id: 'casino-chess',
    name: '棋牌游戏',
    hasExternalIcon: false,
    handler: () => {
      console.log('棋牌游戏')
    }
  },
  {
    id: 'casino-21',
    name: '二十一点',
    hasExternalIcon: false,
    handler: () => {
      console.log('二十一点')
    }
  },
  {
    id: 'casino-wheel',
    name: '轮盘赌',
    hasExternalIcon: false,
    handler: () => {
      console.log('轮盘赌')
    }
  },
  {
    id: 'casino-music',
    name: '百家乐',
    hasExternalIcon: false,
    handler: () => {
      console.log('百家乐')
    }
  }
])

// 体育链接
const sportsLinks = computed(() => [
  {
    id: 'sports-home',
    name: '体育首页',
    hasExternalIcon: false,
    handler: () => {
      console.log('体育首页')
    }
  },
  {
    id: 'sports-search',
    name: '搜寻',
    hasExternalIcon: false,
    handler: () => {
      console.log('搜寻')
    }
  },
  {
    id: 'sports-rules',
    name: '规则',
    hasExternalIcon: false,
    handler: () => {
      console.log('规则')
    }
  },
  {
    id: 'sports-stats',
    name: '体育投注深入解剖',
    hasExternalIcon: true,
    handler: () => {
      console.log('体育投注深入解剖')
    }
  }
])

// 支援链接
const supportLinks = computed(() => [
  {
    id: 'support-vip',
    name: 'VIP俱乐部',
    hasExternalIcon: false,
    handler: () => {
      console.log('VIP俱乐部')
    }
  },
  {
    id: 'support-promo',
    name: '推荐',
    hasExternalIcon: false,
    handler: () => {
      console.log('推荐')
    }
  },
  {
    id: 'support-affiliate',
    name: '促销',
    hasExternalIcon: false,
    handler: () => {
      console.log('促销')
    }
  },
  {
    id: 'support-sponsorship',
    name: '彩票',
    hasExternalIcon: false,
    handler: () => {
      console.log('彩票')
    }
  },
  {
    id: 'support-friends',
    name: '推荐朋友',
    hasExternalIcon: false,
    handler: () => {
      console.log('推荐朋友')
    }
  },
  {
    id: 'support-bc',
    name: 'BC 商店',
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
    name: '许可证',
    hasExternalIcon: false,
    handler: () => {
      console.log('许可证')
    }
  },
  {
    id: 'legal-help',
    name: '帮助中心',
    hasExternalIcon: false,
    handler: () => {
      console.log('帮助中心')
    }
  },
  {
    id: 'legal-fairness',
    name: '推荐博彩',
    hasExternalIcon: false,
    handler: () => {
      console.log('推荐博彩')
    }
  },
  {
    id: 'legal-notice',
    name: '公告栏',
    hasExternalIcon: false,
    handler: () => {
      console.log('公告栏')
    }
  },
  {
    id: 'legal-forum',
    name: '常见问题',
    hasExternalIcon: false,
    handler: () => {
      console.log('常见问题')
    }
  },
  {
    id: 'legal-privacy',
    name: '隐私权政策',
    hasExternalIcon: false,
    handler: () => {
      console.log('隐私权政策')
    }
  },
  {
    id: 'legal-terms',
    name: '服务条款',
    hasExternalIcon: false,
    handler: () => {
      console.log('服务条款')
    }
  },
  {
    id: 'legal-kyc',
    name: '执法机关',
    hasExternalIcon: false,
    handler: () => {
      console.log('执法机关')
    }
  },
  {
    id: 'legal-responsibility',
    name: '负责任赌博',
    hasExternalIcon: false,
    handler: () => {
      console.log('负责任赌博')
    }
  },
  {
    id: 'legal-aml',
    name: 'AML',
    hasExternalIcon: false,
    handler: () => {
      console.log('AML')
    }
  },
  {
    id: 'legal-audit',
    name: '设计资源',
    hasExternalIcon: true,
    handler: () => {
      console.log('设计资源')
    }
  },
  {
    id: 'legal-online',
    name: '线上客服',
    hasExternalIcon: false,
    handler: () => {
      console.log('线上客服')
    }
  },
  {
    id: 'legal-ceo',
    name: 'CEO 信箱',
    hasExternalIcon: false,
    handler: () => {
      console.log('CEO 信箱')
    }
  }
])

// 支援链接2
const supportLinks2 = computed(() => [
  {
    id: 'support2-news',
    name: '新闻',
    hasExternalIcon: true,
    handler: () => {
      console.log('新闻')
    }
  },
  {
    id: 'support2-partner',
    name: '与我们合作',
    hasExternalIcon: true,
    handler: () => {
      console.log('与我们合作')
    }
  },
  {
    id: 'support2-intro',
    name: '商务简介',
    hasExternalIcon: false,
    handler: () => {
      console.log('商务简介')
    }
  },
  {
    id: 'support2-service',
    name: '服务台',
    hasExternalIcon: true,
    handler: () => {
      console.log('服务台')
    }
  },
  {
    id: 'support2-verify',
    name: '验证代理商',
    hasExternalIcon: false,
    handler: () => {
      console.log('验证代理商')
    }
  },
  {
    id: 'support2-verify-game',
    name: '验证本网站',
    hasExternalIcon: false,
    handler: () => {
      console.log('验证本网站')
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
</script>
