<!-- 现金票卷 -->
<template>
  <div class="ticket-game-stub h-full w-full" data-game-id="cash_voucher">
    <!-- PC -->
    <div class="hidden h-full w-full sm:flex flex-col items-center justify-center">
      <div ref="pcContainerRef" class="[&_svg]:!h-full [&_svg]:!w-full w-full aspect-[493/366]" />
      <button
        type="button"
        class="mt-[40px] h-[48px] w-[300px] rounded-[8px] bg-theme-primary text-sm font-[700] text-text-4"
        :disabled="isPending"
        @click="handleClaim"
      >
        {{ $t('vouchers.claimNow') }}
      </button>
    </div>

    <!-- H5 -->
    <div class="flex flex-col items-center sm:hidden">
      <div ref="h5ContainerRef" class="[&_svg]:!h-full [&_svg]:!w-full w-[328px] h-[244px]" />
      <button
        type="button"
        class="mt-[30px] h-[40px] w-[220px] rounded-[8px] bg-theme-primary text-sm font-[700] text-text-4"
        :disabled="isPending"
        @click="handleClaim"
      >
        {{ $t('vouchers.claimNow') }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import lottie, { type AnimationItem } from 'lottie-web'
import zhusucaiImg from '@/lottie/xianjin/zhusucai.png'
import xianjianImg from '@/lottie/xianjin/xianjian.jpg'
import daijiSource from '@/lottie/xianjin/daiji.json'
import { buildResultDialogFromAmount } from '../../shared/mappers/mapWheelConfig'
import { useTicketUseAction } from '../../shared'
import { openTicketResultDialog } from '../../shell/ticketDialog'

/** 避免 lottie-web 解析失败 */
const daijiAnimationData = {
  ...(daijiSource as Record<string, unknown>),
  assets: (
    daijiSource as { assets: Array<{ p?: string; u?: string; [k: string]: unknown }> }
  ).assets.map(asset => {
    if (asset.p === 'zhusucai.png') return { ...asset, u: '', p: zhusucaiImg }
    if (asset.p === 'xianjian.jpg') return { ...asset, u: '', p: xianjianImg }
    return asset
  })
}

const { t } = useI18n()
const { runUseTicket, isPending } = useTicketUseAction()

const pcContainerRef = ref<HTMLElement | null>(null)
const h5ContainerRef = ref<HTMLElement | null>(null)
const animations: AnimationItem[] = []

/** 在指定容器加载现金票券待机动画 */
const mountLottie = (container: HTMLElement | null) => {
  if (!container) return
  const instance = lottie.loadAnimation({
    container,
    renderer: 'svg',
    loop: true,
    autoplay: true,
    animationData: JSON.parse(JSON.stringify(daijiAnimationData)),
    rendererSettings: {
      preserveAspectRatio: 'xMidYMid meet'
    }
  })
  animations.push(instance)
}

onMounted(() => {
  mountLottie(pcContainerRef.value)
  mountLottie(h5ContainerRef.value)
})

onBeforeUnmount(() => {
  animations.forEach(a => a.destroy())
  animations.length = 0
})

/** 立即领取 */
const handleClaim = () => {
  void runUseTicket({
    voucherName: t('ticketPage.cashVoucher.title'),
    fallbackErrorMessage: t('luckySpinPage.loadFailed'),
    onSuccess: result => {
      openTicketResultDialog(buildResultDialogFromAmount(result))
    }
  })
}
</script>
