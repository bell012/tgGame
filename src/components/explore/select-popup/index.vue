<template>
  <!-- 顶部搜索 -->
  <div class="relative">
    <div
      class="select-trigger border border-solid text-[14px] border-opacity-10 rounded-md h-[40px] flex items-center justify-between p-[8px] cursor-pointer"
      @click="visible = true"
    >
      <div class="flex gap-[10px]">
        <div class="text-[var(--color-text-level-3)]" v-if="label">{{ label }}</div>
        <!-- 国家图标 --->
        <div class="flex items-center gap-[10px]" v-if="countryImage && modelValue">
          <section class="relative min-w-[16px] min-h-[16px] w-[16px] h-[16px] overflow-hidden">
            <SmartImage
              class="w-[16px] min-w-[16px] absolute"
              alt="countries"
              :src="countriesImg"
              :style="`top: -${getImageTop()}px`"
            />
          </section>
          <div>{{ inputText }}</div>
        </div>
        <!-- 无国家图标 -->
        <div v-else>{{ inputText }}</div>
      </div>
      <div class="trigger-arrow-bg bg-[var(--color-background-level-2)] rounded-md">
        <div class="icon size-4 transition-all -rotate-90">
          <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M20.9717 9.59292L15.2482 15.3155L20.9717 21.0389L18.5143 23.4972L10.3325 15.3164L18.5143 7.1355L20.9717 9.59292Z"
            ></path>
          </svg>
        </div>
      </div>
    </div>
    <!-- 搜索类型弹窗 -->
    <Teleport to="body" v-if="isMobile">
      <popup
        v-model:visible="visible"
        :dataList="dataList"
        :selectedId="modelValue"
        @confirm="handleConfirm"
        :country-image="countryImage"
      />
    </Teleport>
    <popup
      v-else
      class="desktop-popup"
      v-model:visible="visible"
      :dataList="dataList"
      :selectedId="modelValue"
      @confirm="handleConfirm"
      desktop
      :country-image="countryImage"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import Popup from './popup.vue'
import SmartImage from '@/components/common/SmartImage.vue'
import countriesImg from '@/static/img/explore/countries.png'
import { useIsMobile } from '@/composables/useMediaQuery'
import { COUNTRIES } from '../consts'

interface OptionItem {
  value: string
  label: string
  [string: string]: string | number
}

const props = defineProps<{
  modelValue: string
  label?: string
  dataList: OptionItem[]
  countryImage?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [val: string]
  change: [val: string]
}>()

const isMobile = useIsMobile()
const { t } = useI18n()
const visible = ref(false)
const fallbackLabel = computed(() =>
  props.countryImage ? t('search.all') : t('customSelect.placeholder')
)

const inputText = computed(() => {
  const item = props.dataList.find(i => i.value === props.modelValue)
  return item?.label || fallbackLabel.value
})
const getImageTop = () => {
  const index = COUNTRIES.indexOf(props.modelValue)
  return index * 16
}

const handleConfirm = (data: OptionItem) => {
  visible.value = false
  emit('change', data.value)
  emit('update:modelValue', data.value)
}
</script>

<style scoped lang="scss">
.desktop-popup {
  top: calc(100% + 10px);
  position: absolute;
  left: 0;
  width: 100%;
}
.icon {
  width: 24px;
  height: 24px;
  padding: 4px;
  fill: currentColor;
}

@media (max-width: 767px) {
  .select-trigger {
    background: var(--color-background-level-3);
  }

  .trigger-arrow-bg {
    background: var(--color-opacity-10);
  }
}
</style>
