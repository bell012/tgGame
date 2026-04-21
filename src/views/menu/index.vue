<template>
  <div class="relative z-10 w-full mx-auto max-w-[1248px]" :style="menuContainerStyle">
    <Menu @open-language-modal="openLanguageModal" class="mt-2"/>
  </div>
  <!-- 选择弹窗 -->
  <SelectModal
    v-model="showModal"
    :type="modalType"
    @select-language="handleLanguageChange"
    @select-currency="handleCurrencyChange"
  />
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useLocaleStore } from '@/stores/locale'
import { useLayoutStore } from '@/stores/layout'
import { useIsMobile } from '@/composables/useMediaQuery'
import Menu from '@/components/Menu.vue'
import SelectModal from '@/components/SelectModal.vue'
import { type Locale } from '@/utils/locale'

const localeStore = useLocaleStore()
const layoutStore = useLayoutStore()
const isMobile = useIsMobile()
const showModal = ref(false)
const modalType = ref<'language' | 'currency'>('language')
const menuContainerStyle = computed(() => {
  return isMobile.value ? { paddingTop: `${layoutStore.TOPNAV_HEIGHT}px` } : {}
})

const openLanguageModal = () => {
  modalType.value = 'language'
  showModal.value = true
}

const handleLanguageChange = (code: string) => {
  localeStore.setLanguage(code as Locale)
}

const handleCurrencyChange = (code: string) => {
  localeStore.setCurrency(code)
}
</script>

<style scoped lang="scss"></style>
