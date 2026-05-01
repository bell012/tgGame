<template>
  <!-- 挂载到 body 的弹窗容器 -->
  <Teleport to="body">
    <!-- 弹窗根节点 -->
    <div>
      <!-- 遮罩层过渡动画 -->
      <transition name="popup-fade">
        <!-- 遮罩层 -->
        <div
          v-show="visible"
          class="fixed inset-0 z-[10020] bg-mask-60-1"
          @click.self="handleOverlayClose"
        />
      </transition>

      <!-- 弹窗过渡动画 -->
      <transition name="claim-popup-transition">
        <!-- 弹窗定位层 -->
        <div
          v-show="visible"
          class="fixed inset-0 z-[10021] flex items-center justify-center px-4 py-6 sm:px-8"
          @click.self="handleOverlayClose"
        >
          <!-- 弹窗主体 -->
          <section
            role="dialog"
            aria-modal="true"
            :aria-label="resolvedTitle"
            class="modal-container relative flex aspect-[900/728] w-full max-w-[300px] flex-col overflow-visible rounded-[24px] bg-[linear-gradient(180deg,#18884E_0%,#062917_100%)] px-5 pb-[30px] pt-[43px] shadow-[0_18px_54px_rgba(0,0,0,0.32)] sm:h-[342px] sm:max-w-[480px] sm:rounded-[40px] sm:px-[32px] sm:pb-[40px] sm:pt-[64px] sm:aspect-auto"
          >
            <!-- 顶部装饰区域 -->
            <div
              class="absolute left-1/2 top-[-35px] w-[232px] -translate-x-1/2 sm:top-[-44px] sm:h-[68px] sm:w-[368px]"
            >
              <!-- 顶部图片容器 -->
              <div class="h-full w-full">
                <!-- 顶部图片 -->
                <img :src="resolvedHeroImage" alt="" class="h-full w-full object-contain" />
              </div>
            </div>

            <!-- 内容区域 -->
            <div class="flex flex-1 flex-col items-center gap-5 sm:flex-none sm:gap-[48px]">
              <!-- 金额区域 -->
              <div class="flex w-full items-center justify-center gap-1 sm:gap-[2px]">
                <!-- 币种角标 -->
                <div
                  class="text-center text-[30px] font-[700] leading-[36px] text-common-100 sm:text-[40px] sm:leading-[48px]"
                >
                  {{ currencyBadge }}
                </div>

                <!-- 金额文本 -->
                <div
                  class="text-center text-[30px] font-[700] leading-[36px] text-common-100 sm:text-[40px] sm:leading-[48px]"
                >
                  {{ amount }}
                </div>
              </div>

              <!-- 文案区域 -->
              <div class="flex w-full flex-col items-center gap-[7px] sm:gap-[11px]">
                <!-- 标题文本 -->
                <h3
                  class="w-full text-center text-[16px] font-[700] leading-5 text-common-100 sm:text-[20px] sm:leading-[24px]"
                >
                  {{ resolvedTitle }}
                </h3>

                <!-- 描述文本 -->
                <p
                  class="w-full text-center text-[14px] font-[400] leading-[17px] text-common-60 sm:text-[16px] sm:leading-[19px]"
                >
                  {{ resolvedDesc }}
                </p>
              </div>
            </div>

            <!-- 底部按钮区域 -->
            <div class="mt-5 flex justify-center sm:mt-[40px]">
              <!-- 主操作按钮 -->
              <button
                type="button"
                class="flex h-10 w-full max-w-[240px] items-center justify-center rounded-[8px] bg-theme-primary text-[14px] font-[700] leading-[17px] text-text-4 sm:h-[49px] sm:max-w-[416px] sm:rounded-[8px] sm:text-[14px] sm:leading-[17px]"
                @click="handleConfirm"
              >
                {{ resolvedButtonText }}
              </button>
            </div>
          </section>
        </div>
      </transition>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import claimPopupHero from '@/static/img/referral/claim_popup_hero.png'
import { getCurrencySymbol, getCurrentCurrency } from '@/utils/locale'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

interface Props {
  visible: boolean
  amount: string | number
  currencySymbol?: string
  title?: string
  desc?: string
  buttonText?: string
  heroImage?: string
  closeOnOverlayClick?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  currencySymbol: undefined,
  title: undefined,
  desc: undefined,
  buttonText: undefined,
  heroImage: '',
  closeOnOverlayClick: true
})

const emit = defineEmits<{
  'update:visible': [value: boolean]
  confirm: []
}>()

const { t } = useI18n()

// 解析顶部图片资源。
const resolvedHeroImage = computed(() => props.heroImage || claimPopupHero)

// 解析默认币种符号。
const resolvedCurrencySymbol = computed(() => props.currencySymbol ?? getCurrentCurrency())

// 解析默认标题文案。
const resolvedTitle = computed(() => props.title ?? t('vipPage.claimPopup.title'))

// 解析默认描述文案。
const resolvedDesc = computed(() => props.desc ?? t('vipPage.claimPopup.description'))

// 解析默认按钮文案。
const resolvedButtonText = computed(() => props.buttonText ?? t('vipPage.claimPopup.ok'))

// 生成币种角标内容。
const currencyBadge = computed(() => getCurrencySymbol(resolvedCurrencySymbol.value).trim())

// 关闭弹窗。
const handleClose = () => {
  emit('update:visible', false)
}

// 处理遮罩层点击关闭。
const handleOverlayClose = () => {
  if (!props.closeOnOverlayClick) return
  handleClose()
}

// 处理主按钮确认。
const handleConfirm = () => {
  emit('confirm')
  handleClose()
}
</script>

<style scoped lang="scss">
.popup-fade-enter-active,
.popup-fade-leave-active,
.claim-popup-transition-enter-active,
.claim-popup-transition-leave-active {
  transition: opacity 0.24s ease;
}

.popup-fade-enter-from,
.popup-fade-leave-to,
.claim-popup-transition-enter-from,
.claim-popup-transition-leave-to {
  opacity: 0;
}

.claim-popup-transition-enter-active :deep(.modal-container),
.claim-popup-transition-leave-active :deep(.modal-container) {
  transition:
    transform 0.24s ease,
    opacity 0.24s ease;
}

.claim-popup-transition-enter-from :deep(.modal-container),
.claim-popup-transition-leave-to :deep(.modal-container) {
  transform: translateY(18px) scale(0.96);
}
</style>
