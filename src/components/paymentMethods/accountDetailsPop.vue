<template>
  <PopShell
    v-model="visible"
    transition-type="drawer-slide"
    @close="handleClose"
    :fullHeight="true"
  >
    <section class="fixed inset-0 overflow-y-auto bg-bg-1">
      <div class="min-h-screen bg-bg-1">
        <H5Header
          :title="t('payment_methods.account_detail_title')"
          :disableDefaultBack="true"
          @back="handleClose"
        />
        <div class="p-3.5 mt-3.5">
          <section v-if="option" class="rounded-[20px] bg-bg-2 px-0 py-3.5">
            <div class="mx-auto flex w-full max-w-[220px] flex-col items-center -mt-6">
              <div class="relative flex h-[64px] w-[64px] items-center justify-center">
                <div
                  class="relative z-10 flex h-[64px] w-[64px] items-center justify-center overflow-hidden rounded-full border-4 border-bg-2"
                >
                  <gameRemoteImg
                    :img="{ src: option.customRoundIcon, maintain: false, fit: 'contain' }"
                    class="h-full w-full"
                  />
                </div>
              </div>
              <p class="mt-2.5 text-center text-sm font-bold leading-normal text-text-1">
                {{ option.label }}
              </p>
            </div>

            <div class="mt-6 px-3.5 pb-0">
              <div class="space-y-5 rounded-[20px] px-0">
                <div>
                  <p class="text-xs leading-normal text-text-1">
                    {{
                      option.kind === 'crypto' ? t('withdraw.select_network') : t('withdraw.name')
                    }}
                  </p>
                  <div class="mt-2.5 rounded-lg border border-input-2 bg-input-3 p-3.5">
                    <p class="text-sm font-bold leading-normal text-text-1">
                      {{ detailPrimaryValue }}
                    </p>
                  </div>
                </div>

                <div class="mt-5">
                  <p class="text-xs leading-normal text-text-1">
                    {{
                      option.kind === 'crypto'
                        ? t('withdraw.receiving_address_label', { currency: option.label })
                        : t('withdraw.account')
                    }}
                  </p>
                  <div
                    class="mt-2.5 flex items-center gap-3 rounded-lg border border-input-2 bg-input-3 p-3.5"
                  >
                    <p
                      class="min-w-0 flex-1 break-all text-sm font-bold leading-normal text-text-1"
                    >
                      {{ detailSecondaryValue }}
                    </p>
                    <button
                      type="button"
                      class="flex p-1 shrink-0 items-center justify-center rounded-xl"
                      @click="handleCopy(detailSecondaryValue)"
                    >
                      <CopyIcon class="h-4 w-4 text-text-2" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </section>
  </PopShell>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { showToast } from 'vant'
import H5Header from '@/components/common/H5Header.vue'
import gameRemoteImg from '@/components/common/gameRemoteImg.vue'
import CopyIcon from '@/static/svg/copy.svg?component'
import PopShell from './popShell.vue'
import { AccountCardOption } from './shared/usePaymentMethodsService'

interface Props {
  modelValue: boolean
  option?: AccountCardOption
}
const props = defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  close: []
}>()

const { t } = useI18n()

const visible = computed({
  get: () => props.modelValue,
  set: value => emit('update:modelValue', value)
})

const detailPrimaryValue = computed(
  () => String(props.option?.accountName || props.option?.label || '--').trim() || '--'
)

const detailSecondaryValue = computed(() => String(props.option?.accountNo || '--').trim() || '--')

const handleClose = () => {
  emit('update:modelValue', false)
  emit('close')
}

const handleCopy = async (value: string) => {
  if (!value || value === '--') return

  try {
    await navigator.clipboard.writeText(value)
    showToast({
      message: t('betDetails.copy'),
      type: 'success'
    })
  } catch {
    showToast({
      message: t('common.error'),
      type: 'fail'
    })
  }
}
</script>
<style scoped lang="scss"></style>
