<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-opacity duration-200"
      enter-from-class="opacity-0"
      leave-active-class="transition-opacity duration-200"
      leave-to-class="opacity-0"
    >
      <!-- 分享弹窗遮罩 -->
      <div
        v-if="visible"
        class="fixed inset-0 z-[1200] bg-mask-60-1"
        @click.self="handleClose"
      ></div>
    </Transition>

    <Transition
      enter-active-class="transition-all duration-200 ease-out"
      enter-from-class="translate-y-full sm:translate-y-4 sm:opacity-0"
      leave-active-class="transition-all duration-200 ease-in"
      leave-to-class="translate-y-full sm:translate-y-4 sm:opacity-0"
    >
      <!-- 分享弹窗底部抽屉 -->
      <div
        v-if="visible"
        class="fixed bottom-0 left-0 right-0 z-[1201] mx-auto w-full max-w-[420px] sm:inset-0 sm:flex sm:max-w-none sm:items-center sm:justify-center sm:px-4"
      >
        <!-- 分享弹窗容器 -->
        <div
          class="max-h-[82vh] overflow-y-auto rounded-t-[12px] bg-bg-1 px-[14px] pb-[calc(env(safe-area-inset-bottom)+18px)] pt-[14px] sm:w-full sm:max-w-[720px] sm:rounded-[16px] sm:px-[24px] sm:pb-[24px] sm:pt-[24px]"
        >
          <!-- 分享弹窗头部 -->
          <div class="relative flex min-h-[48px] items-center justify-center">
            <!-- 分享弹窗标题 -->
            <h2 class="text-center text-[16px] font-[700] leading-[19px] text-text-1">
              {{ $t('referral.shareToEarn') }}
            </h2>

            <!-- 关闭按钮 -->
            <button
              type="button"
              class="absolute right-0 top-1/2 flex h-[28px] w-[28px] -translate-y-1/2 items-center justify-center rounded-[6px] bg-opacity-10"
              @click="handleClose"
              :aria-label="$t('referral.closeDialog')"
            >
              <CloseIcon class="h-[12px] w-[12px] text-text-1" />
            </button>
          </div>

          <!-- 弹窗内容区域 -->
          <div class="mt-[14px] flex flex-col gap-[10px]">
            <!-- 分享方式卡片 -->
            <section class="rounded-[10px] bg-bg-2 py-[14px]">
              <!-- 分享说明 -->
              <div class="px-[14px]">
                <p class="text-[14px] font-[400] leading-[17px] text-text-1">
                  {{ $t('referral.shareOptionsHint') }}
                </p>
              </div>

              <!-- 渠道列表 -->
              <div class="mt-[14px] grid grid-cols-5 gap-y-[14px] px-[10px]">
                <!-- 渠道项 -->
                <button
                  v-for="channel in shareChannels"
                  :key="channel.key"
                  type="button"
                  class="flex flex-col items-center gap-[6px] px-[4px]"
                  @click="handleOpenChannel(channel.key)"
                >
                  <!-- 渠道图标 -->
                  <component :is="channel.icon" class="h-[40px] w-[40px]" />

                  <!-- 渠道名称 -->
                  <span class="text-center text-[11px] font-[400] leading-[13px] text-text-1">
                    {{ channel.label }}
                  </span>
                </button>
              </div>

              <!-- 邀请链接区域 -->
              <div class="mt-[14px] px-[14px]">
                <!-- 邀请链接容器 -->
                <div
                  class="flex items-center gap-[8px] rounded-[8px] border border-opacity-10 bg-mask-20 px-[14px] py-[5px]"
                >
                  <!-- 邀请链接文本 -->
                  <p
                    class="min-w-0 flex-1 truncate text-[12px] font-[400] leading-[15px] text-text-1"
                  >
                    {{ referralLink }}
                  </p>

                  <!-- 复制按钮 -->
                  <button
                    type="button"
                    class="inline-flex h-[30px] shrink-0 items-center justify-center gap-[4px] rounded-[5px] bg-secondary-3 px-[10px]"
                    @click="copyReferralLink"
                  >
                    <CopyIcon class="h-[14px] w-[14px]" />
                    <span class="text-[12px] font-[700] leading-[15px] text-theme-primary">
                      {{ $t('referral.copy') }}
                    </span>
                  </button>
                </div>
              </div>
            </section>

            <!-- 随机号码卡片 -->
            <section class="rounded-[10px] bg-bg-2 px-[14px] py-[14px]">
              <!-- 随机号码说明 -->
              <p class="text-[14px] font-[400] leading-[17px] text-text-1">
                {{ $t('referral.randomSendHint') }}
              </p>

              <!-- 号码列表容器 -->
              <div class="mt-[14px] rounded-[13px] bg-bg-4 p-[10px]">
                <!-- 号码网格 -->
                <div class="grid grid-cols-3 gap-x-[12px] gap-y-[10px]">
                  <!-- 号码项 -->
                  <p
                    v-for="phone in phoneNumbers"
                    :key="phone"
                    class="truncate text-center text-[12px] font-[400] leading-[15px] text-text-2"
                  >
                    {{ phone }}
                  </p>
                </div>
              </div>

              <!-- 底部发送按钮 -->
              <div class="mt-[14px] grid grid-cols-2 gap-[10px]">
                <!-- WhatsApp 按钮 -->
                <button
                  type="button"
                  class="flex h-[43px] items-center justify-center rounded-[8px] bg-secondary-3 px-[10px]"
                  @click="handleSendViaWhatsApp"
                >
                  <span class="text-[12px] font-[700] leading-[15px] text-text-1">
                    {{ $t('referral.sendViaWhatsApp') }}
                  </span>
                </button>

                <!-- 短信按钮 -->
                <button
                  type="button"
                  class="flex h-[43px] items-center justify-center rounded-[8px] bg-secondary-3 px-[10px]"
                  @click="handleSendViaSms"
                >
                  <span class="text-[12px] font-[700] leading-[15px] text-text-1">
                    {{ $t('referral.sendViaSms') }}
                  </span>
                </button>
              </div>
            </section>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { showToast } from 'vant'
import { computed, shallowRef } from 'vue'
import { useI18n } from 'vue-i18n'
import { useLockBodyScroll } from '@/composables/useLockBodyScroll'
import CloseIcon from '@/static/svg/close.svg?component'
import CopyIcon from '@/static/svg/copy.svg?component'
import maisIcon from '@/static/svg/game/detail/share/mais.svg?component'
import facebookIcon from '@/static/svg/game/detail/share/facebook.svg?component'
import whatsappIcon from '@/static/svg/game/detail/share/whatsapp.svg?component'
import telegramIcon from '@/static/svg/game/detail/share/telegram.svg?component'
import tiktokIcon from '@/static/svg/game/detail/share/tiktok.svg?component'

type ShareChannelKey = 'mais' | 'facebook' | 'whatsapp' | 'telegram' | 'tiktok'

interface ShareChannel {
  key: ShareChannelKey
  label: string
  icon: object
}

const props = defineProps<{
  visible: boolean
  referralLink: string
  phoneNumbers: string[]
}>()

const emit = defineEmits<{
  'update:visible': [value: boolean]
}>()

const { t } = useI18n()

const visibleRef = computed(() => props.visible)

useLockBodyScroll(visibleRef)

const shareChannels = shallowRef<ShareChannel[]>([
  {
    key: 'mais',
    label: 'Mais',
    icon: maisIcon
  },
  {
    key: 'facebook',
    label: 'Facebook',
    icon: facebookIcon
  },
  {
    key: 'whatsapp',
    label: 'WhatsApp',
    icon: whatsappIcon
  },
  {
    key: 'telegram',
    label: 'Telegram',
    icon: telegramIcon
  },
  {
    key: 'tiktok',
    label: 'Tiktok',
    icon: tiktokIcon
  }
])

// 关闭分享弹窗。
const handleClose = () => {
  emit('update:visible', false)
}

// 复制代理邀请链接。
const copyReferralLink = async () => {
  try {
    await navigator.clipboard.writeText(props.referralLink)
    showToast({
      message: t('referral.copySuccess'),
      type: 'success'
    })
  } catch (error) {
    console.error(error)
    showToast({
      message: t('referral.copyFailed'),
      type: 'fail'
    })
  }
}

// 根据渠道打开分享链接。
const handleOpenChannel = (channel: ShareChannelKey) => {
  const encodedUrl = encodeURIComponent(props.referralLink)
  const encodedText = encodeURIComponent(`${t('referral.shareDefaultText')} ${props.referralLink}`)

  const shareUrlMap: Record<ShareChannelKey, string> = {
    mais: `https://social-plugins.line.me/lineit/share?url=${encodedUrl}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    whatsapp: `https://wa.me/?text=${encodedText}`,
    telegram: `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`,
    tiktok: `mailto:?subject=${encodeURIComponent(t('referral.title'))}&body=${encodedText}`
  }

  window.open(shareUrlMap[channel], '_blank', 'noopener,noreferrer')
}

// 通过 WhatsApp 发送随机号码。
const handleSendViaWhatsApp = () => {
  const encodedText = encodeURIComponent(
    `${t('referral.randomSharePrefix')}\n${props.phoneNumbers.join('\n')}`
  )
  window.open(`https://wa.me/?text=${encodedText}`, '_blank', 'noopener,noreferrer')
}

// 通过短信发送随机号码。
const handleSendViaSms = () => {
  const body = encodeURIComponent(
    `${t('referral.randomSharePrefix')}\n${props.phoneNumbers.join(', ')}`
  )
  window.location.href = `sms:?body=${body}`
}
</script>
