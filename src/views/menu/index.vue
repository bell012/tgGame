<template>
  <div class="relative z-10 w-full mx-auto max-w-[1248px]">
    <Menu @open-language-modal="openLanguageModal" />
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
import { ref } from 'vue'
import { useLocaleStore } from '@/stores/locale'
import Menu from '@/components/Menu.vue'
import SelectModal from '@/components/SelectModal.vue'
import { type Locale } from '@/utils/locale'

const localeStore = useLocaleStore()
const showModal = ref(false)
const modalType = ref<'language' | 'currency'>('language')

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
