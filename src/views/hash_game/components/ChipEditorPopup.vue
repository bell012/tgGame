<!-- 编辑筹码和设置筹码金额弹窗 -->
<template>
  <Teleport to="body">
    <Transition name="bottom-sheet">
      <div
        v-if="chipEditorOpen"
        :class="
          variant === 'pc'
            ? 'fixed inset-0 z-[1000] grid place-items-center bg-mask-60-1 p-[12px]'
            : 'fixed inset-0 z-[1000] flex items-end justify-center bg-mask-60-1'
        "
        @click.self="chipEditorOpen = false"
        @keydown.esc.stop.prevent="chipEditorOpen = false"
      >
        <form
          class="bottom-sheet-panel w-full overflow-y-auto overscroll-contain bg-bg-1 text-text-1"
          :class="
            variant === 'pc'
              ? 'max-w-[480px] rounded-[24px] px-[32px] py-[32px]'
              : 'rounded-t-[12px] px-[12px] pb-[30px] pt-[16px]'
          "
          role="dialog"
          aria-modal="true"
          aria-labelledby="hash-chip-settings-title"
          @submit.prevent="saveChipEditor"
        >
          <header
            v-if="variant === 'pc'"
            class="-mx-[0px] -mt-[0px] mb-[24px] flex items-center justify-between"
          >
            <h2 id="hash-chip-settings-title" class="text-[20px] font-[700] text-text-1">
              {{ t('hashGame.chipSettings') }}
            </h2>
            <button
              type="button"
              class="grid size-[24px] place-items-center rounded-[4px] bg-opacity-10"
              :aria-label="t('common.close')"
              @click="chipEditorOpen = false"
            >
              <CloseIcon class="size-[12px] text-icon-1" />
            </button>
          </header>
          <h2 v-else id="hash-chip-settings-title" class="text-[18px] font-[600] text-text-1">
            {{ t('hashGame.chipSettings') }}
          </h2>
          <div
            :class="
              variant === 'pc'
                ? 'grid grid-cols-5 gap-x-[8px] gap-y-[24px]'
                : 'mt-[20px] grid grid-cols-5 gap-x-[8px] gap-y-[7px]'
            "
            role="group"
            :aria-label="t('hashGame.editChips')"
          >
            <button
              v-for="chip in chipEditorItems"
              :key="chip.id"
              type="button"
              class="relative mx-auto min-w-0 p-[8px] transition-opacity"
              :aria-label="formatChipAmount(Number(chip.value))"
              :aria-pressed="chip.enabled"
              @click="togglePresetChip(chip.id)"
            >
              <img
                :src="chipImage"
                alt=""
                :class="
                  variant === 'pc'
                    ? 'h-[50px] w-[50px] object-contain'
                    : 'h-[45px] w-[45px] object-contain'
                "
                :style="{ filter: 'hue-rotate(' + chip.hue + 'deg)' }"
              />
              <span
                :class="
                  variant === 'pc'
                    ? 'absolute inset-0 grid place-items-center pb-[0px] text-[18px] font-bold text-[#eee]'
                    : 'absolute inset-0 grid place-items-center pb-[0px] text-[14px] font-bold text-[#eee]'
                "
                >{{ formatChipAmount(Number(chip.value)) }}</span
              >
              <span
                v-if="chip.enabled"
                :class="
                  variant === 'pc'
                    ? 'absolute -bottom-[0px] left-1/2 grid -translate-x-1/2 place-items-center rounded-[4px] bg-theme-primary px-[4px]'
                    : 'absolute -bottom-[0px] left-1/2 grid -translate-x-1/2 place-items-center rounded-[3px] bg-theme-primary px-[5px]'
                "
              >
                <GouIcon class="size-[14px] text-icon-4" />
              </span>
            </button>
            <button
              v-for="chip in customChipItems"
              :key="`custom-${chip.id}`"
              type="button"
              class="relative mx-auto min-w-0 p-[8px] transition-opacity"
              :aria-label="
                chip.value ? formatChipAmount(Number(chip.value)) : t('hashGame.editChip')
              "
              @click="editCustomChip(chip)"
            >
              <img
                :src="chipEditorImage"
                alt=""
                :class="
                  variant === 'pc'
                    ? 'h-[50px] w-[50px] object-contain'
                    : 'h-[45px] w-[45px] object-contain'
                "
              />
              <span
                :class="
                  variant === 'pc'
                    ? 'absolute inset-0 grid place-items-center pb-[2px] text-[14px] font-bold text-[#eee]'
                    : 'absolute inset-0 grid place-items-center pb-[2px] text-[11px] font-bold text-[#eee]'
                "
              >
                {{ chip.value ? formatChipAmount(Number(chip.value)) : t('hashGame.edit') }}
              </span>
              <span
                :class="
                  variant === 'pc'
                    ? 'absolute -bottom-[2px] left-1/2 -translate-x-1/2 rounded-[4px] border border-opacity-10 bg-bg-4 px-[4px] py-[1px]'
                    : 'absolute -bottom-[0px] left-1/2 -translate-x-1/2 rounded-[3px] border border-opacity-10 bg-bg-4 px-[4px] py-[1px]'
                "
              >
                <EditChipIcon class="size-[14px] text-icon-2" />
              </span>
            </button>
          </div>
          <button
            type="submit"
            :class="
              variant === 'pc'
                ? 'mt-[24px] h-[48px] w-full rounded-[8px] bg-theme-primary text-[14px] font-[700] text-text-4'
                : 'mt-[30px] h-[46px] w-full rounded-[30px] bg-theme-primary text-[14px] font-[700] text-text-4'
            "
          >
            {{ t('hashGame.confirm') }}
          </button>
        </form>

        <div
          v-if="keypadOpen"
          :class="
            variant === 'pc'
              ? 'fixed inset-0 z-[1001] grid place-items-center bg-mask-60-1 p-[12px]'
              : 'fixed inset-0 z-[1001] grid place-items-center bg-mask-60-1 px-[25px]'
          "
          @click.self="keypadOpen = false"
        >
          <section
            class="w-full"
            :class="variant === 'pc' ? 'max-w-[440px]' : ''"
            role="dialog"
            aria-modal="true"
            aria-labelledby="hash-chip-keypad-title"
          >
            <header
              :class="
                variant === 'pc'
                  ? 'flex items-center justify-between rounded-t-[24px] bg-bg-1 px-[32px] py-[32px]'
                  : 'flex items-center justify-between rounded-t-[15px] bg-bg-2 px-[14px] py-[12px]'
              "
            >
              <h3
                id="hash-chip-keypad-title"
                :class="
                  variant === 'pc'
                    ? 'w-full text-center text-[20px] font-bold text-text-1'
                    : 'w-full text-center text-[16px] font-bold text-text-1'
                "
              >
                {{ t('hashGame.editChipAmount') }}
              </h3>
              <button
                type="button"
                :class="
                  variant === 'pc'
                    ? 'grid size-[24px] place-items-center rounded-[4px] bg-opacity-10'
                    : 'grid size-[28px] place-items-center rounded-[6px] bg-opacity-10'
                "
                :aria-label="t('common.close')"
                @click="keypadOpen = false"
              >
                <CloseIcon class="size-[12px] text-icon-1" />
              </button>
            </header>
            <div
              :class="
                variant === 'pc'
                  ? 'rounded-b-[24px] bg-bg-1 px-[32px] py-[32px] pt-[0px]'
                  : 'rounded-b-[15px] bg-bg-1 px-[14px] py-[12px]'
              "
            >
              <div
                class="mb-[10px] grid h-[42px] place-items-center rounded-[8px] border border-theme-primary bg-input-1 text-[15px] text-text-3"
              >
                {{
                  keypadValue
                    ? formatChipAmount(Number(keypadValue))
                    : t('hashGame.amountPlaceholder')
                }}
              </div>
              <div class="grid grid-cols-3 gap-[6px]">
                <button
                  v-for="key in ['1', '2', '3', '4', '5', '6', '7', '8', '9']"
                  :key="key"
                  type="button"
                  class="h-[36px] rounded-[8px] bg-bg-3 text-[18px] text-text-2"
                  @click="appendKeypadValue(key)"
                >
                  {{ key }}
                </button>
                <button
                  type="button"
                  class="h-[36px] rounded-[8px] bg-bg-3 text-[16px] text-text-2"
                  @click="appendKeypadValue('delete')"
                >
                  {{ t('hashGame.delete') }}
                </button>
                <button
                  type="button"
                  class="h-[36px] rounded-[8px] bg-bg-3 text-[18px] text-text-2"
                  @click="appendKeypadValue('0')"
                >
                  0
                </button>
                <button
                  type="button"
                  class="h-[36px] rounded-[8px] bg-theme-primary text-[16px] text-text-4"
                  @click="confirmKeypadValue"
                >
                  {{ t('hashGame.confirm') }}
                </button>
              </div>
              <p v-if="chipEditorError" class="mt-[5px] text-[10px] text-assistRed" role="alert">
                {{ chipEditorError }}
              </p>
            </div>
          </section>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import type { HashGamePageState } from '../index'
import CloseIcon from '@/static/svg/close.svg?component'
import GouIcon from '@/static/svg/hash_game/gou.svg?component'
import EditChipIcon from '@/static/svg/hash_game/bianji2.svg?component'
import chipEditorImage from '@/static/svg/hash_game/chouma_bianji.svg?url'
import chipImage from '@/static/svg/hash_game/chouma.svg?url'

const props = withDefaults(defineProps<{ page: HashGamePageState; variant?: 'h5' | 'pc' }>(), {
  variant: 'h5'
})
// 编辑弹窗直接消费页面共享状态，H5 与 PC 共用相同的编辑和保存逻辑。
const {
  t,
  chipEditorOpen,
  chipEditorItems,
  customChipItems,
  keypadOpen,
  keypadValue,
  chipEditorError,
  togglePresetChip,
  editCustomChip,
  saveChipEditor,
  appendKeypadValue,
  confirmKeypadValue
} = props.page
const variant = props.variant

// 金额展示格式与底部筹码栏保持一致。
const formatChipAmount = (amount: number) => {
  if (amount >= 1000000) return `${Number((amount / 1000000).toFixed(1))}M`
  if (amount >= 10000) return `${Number((amount / 1000).toFixed(1))}K`
  return String(amount)
}
</script>
