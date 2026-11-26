<template>
  <DepositMobileCryptoSkeleton v-if="isInitialLoading" />

  <!-- 最外层充值面板容器 -->
  <div v-else-if="payMethods.length > 0" class="w-full min-h-full font-['Inter']">
    <!-- 充值主卡片区域 -->
    <div class="w-full shrink-0 bg-bg-2 p-[14px] rounded-[10px] relative flex flex-col gap-[15px]">
      <!-- 币种选择区域 -->
      <div class="flex flex-col gap-[10px]">
        <p class="text-sm font-medium text-text-1">{{ t('deposit.crypto_currency') }}</p>

        <!-- 币种横向滚动列表 -->
        <div
          ref="coinListRef"
          class="flex gap-[5px] overflow-x-auto scrollbar-hide touch-pan-x scroll-smooth"
          @wheel.prevent="event => handleHorizontalWheel(event, coinListRef)"
        >
          <!-- 单个币种切换按钮 -->
          <button
            v-for="coin in coinOptions"
            :key="coin.columnCode"
            type="button"
            class="shrink-0 min-w-[calc((100%-10px)/3)] p-2 rounded-lg flex items-center justify-center gap-[5px] text-xs"
            :class="
              coin.columnCode === selectedMethod?.columnCode
                ? 'bg-theme-primary text-text-4 font-bold'
                : 'bg-opacity-6 text-text-3 font-medium'
            "
            @click.stop="selectMethod(coin.columnCode)"
          >
            <img v-if="coin.icon" class="w-5 h-5 shrink-0" :src="coin.icon" :alt="coin.label" />
            <span class="whitespace-nowrap">{{ coin.label }}</span>
          </button>
        </div>
      </div>

      <!-- 充值渠道区域 -->
      <div v-if="showChannelSection" class="flex flex-col gap-[10px]">
        <!-- 充值渠道标题 -->
        <p class="text-sm font-medium text-text-1">{{ t('deposit.deposit_channel') }}</p>

        <!-- 充值渠道横向滚动列表 -->
        <div
          ref="channelListRef"
          class="flex flex-nowrap gap-[5px] pt-[5px] -mt-[5px] overflow-x-auto scrollbar-hide touch-pan-x scroll-smooth"
          @wheel.prevent="event => handleHorizontalWheel(event, channelListRef)"
        >
          <!-- 单个充值渠道按钮 -->
          <button
            v-for="channel in channelOptions"
            :key="channel.rowId"
            :ref="el => setChannelItemRef(el, channel.rowId)"
            @click="selectChannel(channel.rowId)"
            type="button"
            class="relative shrink-0 min-w-[calc((100%-10px)/3)] h-9 px-[14px] flex justify-center items-center rounded-lg text-xs whitespace-nowrap"
            :class="
              selectedSubColumn?.rowId === channel.rowId
                ? 'bg-theme-primary text-text-4 font-bold'
                : 'bg-opacity-6 text-text-3 font-medium'
            "
          >
            <DepositBonusBadge
              v-if="channel.bonusRatio > 0"
              :ratio="channel.bonusRatio"
              class="-top-[5px] right-[6px]"
            />
            {{ channel.label }}
          </button>
        </div>
      </div>

      <!-- 充值金额区域 -->
      <div>
        <!-- 充值金额标题 -->
        <p class="text-sm font-medium text-text-1">{{ t('deposit.deposit_amount') }}</p>

        <!-- 充值金额输入框容器 -->
        <div
          class="flex items-center w-full mt-[10px] h-[45px] px-[14px] rounded-lg bg-input-3 border border-opacity-10 focus-within:border-theme-primary focus-within:ring-0"
        >
          <img
            v-if="selectedCoinIcon"
            class="w-5 h-5 mr-[7px] shrink-0 rounded-full"
            :src="selectedCoinIcon"
            alt=""
          />
          <DepositTokenIcon v-else class="w-5 h-5 mr-[7px] shrink-0" />
          <!-- 充值金额输入框 -->
          <input
            type="number"
            v-model.number="amount"
            :readonly="!isManualAmountAllowed"
            :inputmode="isManualAmountAllowed ? 'decimal' : 'none'"
            :placeholder="amountPlaceholder"
            class="flex-1 bg-transparent outline-none focus:outline-none focus:ring-0 placeholder:text-xs sm:placeholder:text-sm"
            :class="{ 'cursor-not-allowed': !isManualAmountAllowed }"
          />
        </div>
      </div>

      <!-- 流水选项横向滚动区域 -->
      <div
        v-if="showWageringSection"
        ref="wageringListRef"
        class="text-sm border-b border-opacity-10 pb-2.5 relative overflow-x-auto scrollbar-hide touch-pan-x scroll-smooth"
        @wheel.prevent="event => handleHorizontalWheel(event, wageringListRef)"
      >
        <!-- 流水选项列表容器 -->
        <div class="flex items-center w-max relative pt-[10px]">
          <!-- 流水选项循环模板 -->
          <template v-for="(item, index) in wageringOptions" :key="item.rowId">
            <!-- 单个流水选项按钮 -->
            <button
              :ref="el => setWageringItemRef(el, item.rowId)"
              @click="selectWagering(item.rowId)"
              class="relative text-xs sm:text-sm transition-colors whitespace-nowrap"
              :class="
                selectedDiscountItem?.rowId === item.rowId
                  ? 'text-text-1'
                  : 'text-text-2 lg:hover:text-text-1'
              "
            >
              {{ item.label }}
              <DepositBonusBadge
                v-if="item.ratio > 0"
                :ratio="item.ratio"
                class="-right-4 -top-[9px]"
              />
              <!-- 当前流水选项底部高亮线 -->
              <span
                v-if="selectedDiscountItem?.rowId === item.rowId"
                class="absolute left-0 -bottom-2.5 h-[2px] w-full bg-theme-primary"
              ></span>
            </button>

            <!-- 流水选项分隔线 -->
            <div
              v-if="index !== wageringOptions.length - 1"
              class="h-4 w-px bg-opacity-10 mx-5"
            ></div>
          </template>
        </div>
      </div>

      <!-- 快捷金额区域 -->
      <div class="w-full relative">
        <!-- 提款流水提示文案 -->
        <p class="-mt-[5px] pb-[10px] text-xs text-secondary-7">
          {{ t('deposit.withdrawal_no_wagering_tip') }}
        </p>
        <!-- 快捷金额列表 -->
        <div
          ref="presetsRef"
          class="grid grid-cols-3 gap-2 sm:gap-3 p-2.5 sm:p-5 bg-bg-4 transition-all duration-300"
          :class="[
            canExpand ? 'rounded-tl-lg rounded-tr-lg' : 'rounded-lg',
            expanded ? 'max-h-64 overflow-y-auto' : 'max-h-[106px] sm:max-h-[148px] overflow-hidden'
          ]"
        >
          <!-- 单个快捷金额按钮 -->
          <button
            v-for="preset in presetAmounts"
            :key="preset"
            @click="selectPresetAmount(preset)"
            class="relative text-base sm:text-lg py-[7px] sm:py-3 rounded-lg lg:hover:bg-theme-primary"
            :class="[preset === amount ? 'bg-theme-primary text-text-4' : 'bg-bg-2 text-text-1']"
          >
            {{ preset }}
          </button>
        </div>
        <!-- 快捷金额展开收起区域 -->
        <div
          v-if="canExpand"
          class="w-full bg-bg-4 rounded-bl-lg rounded-br-lg p-1.5 sm:p-3 relative -mt-3 z-10"
        >
          <!-- 展开收起按钮 -->
          <button
            class="mx-auto flex items-center gap-1 text-xs text-text-3 lg:hover:text-text-1 transition"
            @click="expanded = !expanded"
          >
            {{ expanded ? t('gameDetail.collapse') : t('gameDetail.expand') }}
            <ExpandUpDoubleIcon v-if="expanded" class="w-[9px] h-2" />
            <ExpandDownDoubleIcon v-else class="w-[9px] h-2" />
          </button>
        </div>
      </div>
    </div>

    <!-- 立即充值按钮 -->
    <button
      class="mt-5 w-full h-[47px] flex items-center justify-center lg:hover:btn-primary rounded-lg text-base font-bold text-text-4"
      :class="[!isDepositDisabled ? 'btn-primary' : 'bg-theme-2 cursor-not-allowed']"
      :disabled="isDepositDisabled"
      @click="doDeposit"
    >
      {{ t('deposit.deposit_now') }}
    </button>
  </div>

  <ThemedEmptyState
    v-else
    :dark-image="defaultImgDark"
    :light-image="defaultImgLight"
    :image-alt="$t('notifications.title')"
    :message="$t('notifications.transactionsEmptyMessage')"
    text-class="mt-[28px] w-[193px] text-center text-[12px] font-[500] leading-[18px] text-text-1"
  />

  <!-- 数字币充值订单弹窗 -->
  <depositCryptoOrderPop
    ref="orderPopup"
    :embedded="embedded"
    :teleport-target="teleportTarget"
    v-model:model-value="orderPopShow"
    v-model:orderInfo="orderInfo"
    @close="handleClose"
    @hidden="handleHidden"
  />
</template>
<script setup lang="ts">
import ThemedEmptyState from '@/components/common/ThemedEmptyState.vue'
import { useIsMobile } from '@/composables/useMediaQuery'
import defaultImgDark from '@/static/img/explore/default.png'
import defaultImgLight from '@/static/img/explore/default_white.png'
import DepositTokenIcon from '@/static/svg/deposit/deposit-token.svg?component'
import ExpandDownDoubleIcon from '@/static/svg/deposit/expand-down-double.svg?component'
import ExpandUpDoubleIcon from '@/static/svg/deposit/expand-up-double.svg?component'
import { nextTick, ref, type ComponentPublicInstance, type Ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useDepositCryptoFlow } from '../shared'
import DepositMobileCryptoSkeleton from './DepositMobileCryptoSkeleton.vue'
import depositCryptoOrderPop from './order/crypto/depositCryptoOrderPop.vue'
import DepositBonusBadge from './shared/DepositBonusBadge.vue'
import { usePresetGrid } from './shared/usePresetGrid'

const { t } = useI18n()
const isMobile = useIsMobile()

const props = defineProps<{
  initialMethodCode?: string
  embedded?: boolean
  teleportTarget?: HTMLElement | null
}>()
const emit = defineEmits<{
  hidden: [value: boolean]
}>()

const {
  isInitialLoading,
  payMethods,
  selectedMethod,
  selectedSubColumn,
  selectedDiscountItem,
  amount,
  orderPopShow,
  orderInfo,
  presetAmounts,
  coinOptions,
  selectedCoinIcon,
  channelOptions,
  wageringOptions,
  showChannelSection,
  showWageringSection,
  isManualAmountAllowed,
  amountPlaceholder,
  isDepositDisabled,
  selectMethod,
  selectChannel: selectDepositChannel,
  selectWagering: selectDepositWagering,
  selectPresetAmount,
  doDeposit,
  handleClose,
  handleHidden
} = useDepositCryptoFlow({
  isMobile,
  initialMethodCode: props.initialMethodCode,
  emitHidden: value => emit('hidden', value)
})

const coinListRef = ref<HTMLDivElement | null>(null)
const channelListRef = ref<HTMLDivElement | null>(null)
const channelItemRefs = ref<Record<string, HTMLElement | null>>({})
const wageringListRef = ref<HTMLDivElement | null>(null)
const wageringItemRefs = ref<Record<string, HTMLElement | null>>({})
const presetsRef = ref<HTMLDivElement | null>(null)
const { expanded, canExpand } = usePresetGrid(presetsRef, presetAmounts, 3)

// 解析并返回 HTMLElement 节点
const resolveHTMLElement = (el: Element | ComponentPublicInstance | null) => {
  if (el instanceof HTMLElement) return el
  if (el && '$el' in el && el.$el instanceof HTMLElement) return el.$el
  return null
}

// 记录渠道项的 DOM 引用
const setChannelItemRef = (el: Element | ComponentPublicInstance | null, rowId: number) => {
  channelItemRefs.value[String(rowId)] = resolveHTMLElement(el)
}

// 记录流水选项项的 DOM 引用
const setWageringItemRef = (el: Element | ComponentPublicInstance | null, rowId: number) => {
  wageringItemRefs.value[String(rowId)] = resolveHTMLElement(el)
}

// 将目标项滚动到可视区域
const scrollItemIntoView = async (
  containerRef: Ref<HTMLDivElement | null>,
  target: HTMLElement | null
) => {
  await nextTick()

  if (!containerRef.value || !target) return

  target.scrollIntoView({
    behavior: 'smooth',
    block: 'nearest',
    inline: 'center'
  })
}

// 处理横向滚轮事件
const handleHorizontalWheel = (event: WheelEvent, container: HTMLDivElement | null) => {
  if (!container) return

  container.scrollBy({
    left: event.deltaY !== 0 ? event.deltaY : event.deltaX,
    behavior: 'auto'
  })
}

// 选择当前渠道并刷新预设金额状态
const selectChannel = (rowId: number) => {
  selectDepositChannel(rowId)
  void scrollItemIntoView(channelListRef, channelItemRefs.value[String(rowId)])
}

// 选择当前流水倍数选项
const selectWagering = (rowId: number) => {
  selectDepositWagering(rowId)
  void scrollItemIntoView(wageringListRef, wageringItemRefs.value[String(rowId)])
}

const orderPopup = ref<InstanceType<typeof depositCryptoOrderPop>>()
defineExpose({ back: () => orderPopup.value?.back() ?? false })
</script>
<style scoped lang="scss">
input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
input[type='number'] {
  appearance: textfield; /* 禁用默认浏览器样式 */
  -webkit-appearance: textfield; /* 针对 Safari 和 Webkit 浏览器 */
  -moz-appearance: textfield; /* 针对 Firefox */
}
</style>
