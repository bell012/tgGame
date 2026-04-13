<template>
  <div>
    <!-- 遮罩淡入淡出 -->
    <transition name="popup-fade">
      <div
        v-show="visible"
        class="tp-mask fixed z-[9999] inset-0 bg-[var(--color-mask-60-1)]"
        @click.self="close"
      />
    </transition>
    <!-- 面板 -->
    <transition :name="desktop ? 'desktop-up-down' : 'up-down'">
      <div v-show="visible" class="fixed z-[9999] left-0 bottom-0 w-full lg:relative">
        <div class="tp-panel bg-[var(--color-background-level-2)] rounded-t-xl pt-2.5 px-3.5">
          <div class="tp-header flex items-center justify-between mb-2.5" v-if="!desktop">
            <div></div>
            <div class="text-base font-bold text-[var(--color-text-level-1)]">
              {{ t('search.select') }}
            </div>
            <div
              @click="close"
              class="w-7 h-7 rounded bg-[var(--color-opacity-10)] flex items-center justify-center"
            >
              <CloseIcon class="stroke-text-1 w-4 h-4" />
            </div>
          </div>
          <!-- 选择的内容 -->
          <div class="max-h-[368px] overflow-y-auto">
            <div class="flex flex-col">
              <div
                v-for="(item, inx) in dataList"
                :key="inx"
                class="tp-item mb-2.5 px-2.5 flex items-center justify-between h-[42px] rounded-lg cursor-pointer"
                :class="isSelected(item) ? 'bg-[var(--color-opacity-10)]' : ''"
                @click="confirm(item)"
              >
                <div class="flex items-center gap-[10px]">
                  <section
                    v-if="item.value && countryImage"
                    class="relative min-w-[16px] min-h-[16px] w-[16px] h-[16px] overflow-hidden"
                  >
                    <SmartImage
                      class="w-[16px] min-w-[16px] absolute"
                      alt="countries"
                      :src="countriesImg"
                      :style="`top: -${getImageTop(item)}px`"
                    />
                  </section>
                  <div>{{ item.label }}</div>
                </div>
                <ChecedIcon v-if="isSelected(item)" class="w-5 h-5 cursor-pointer" />
                <UnchecedIcon v-else class="w-5 h-5 cursor-pointer" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import CloseIcon from '@/static/svg/close.svg?component'
import ChecedIcon from '@/static/svg/explore/radio-checked2.svg?component'
import UnchecedIcon from '@/static/svg/radio-unchecked.svg?component'
import SmartImage from '@/components/common/SmartImage.vue'
import countriesImg from '@/static/img/explore/countries.png'
import { useI18n } from 'vue-i18n'
import { COUNTRIES } from '../consts'

type OptionItem = { value: string; label: string }

const props = defineProps<{
  visible: boolean
  dataList: OptionItem[]
  selectedId?: string
  desktop?: boolean
  countryImage?: boolean
}>()

const emit = defineEmits<{
  'update:visible': [val: boolean]
  confirm: [val: OptionItem]
}>()
const { t } = useI18n()

const close = () => emit('update:visible', false)

const isSelected = (item: OptionItem) => item.value === props.selectedId

const confirm = (item: OptionItem) => {
  emit('confirm', item)
  close()
}

const getImageTop = (item: OptionItem) => {
  const index = COUNTRIES.indexOf(item.value)
  return index * 16
}
</script>
<style scoped lang="scss">
@use '../../../styles/mixins' as *;
/* 面板 */
.tp-panel {
  padding-bottom: env(safe-area-inset-bottom);
  overflow: hidden;
  border-radius: 10px;
}
@include popup-transition;
// 设置的弹窗打开关闭的过渡动画
.desktop-up-down-enter-active,
.desktop-up-down-leave-active {
  transition: all 0.2s ease;
}
.desktop-up-down-enter-from,
.desktop-up-down-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}
</style>
