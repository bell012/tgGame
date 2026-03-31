<template>
  <div>
    <router-view />
    <ReloadPrompt />
    <InstallPrompt />
    <LoginModal v-model="showLoginModal" :default-tab="loginModalTab" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import LoginModal from '@/components/login_register/LoginModal.vue'
import { useAuthModalStore } from '@/stores/authModal'
import ReloadPrompt from '@/components/ReloadPrompt.vue'
import InstallPrompt from '@/components/InstallPrompt.vue'

const authModalStore = useAuthModalStore()
const { defaultTab: loginModalTab, visible } = storeToRefs(authModalStore)

const showLoginModal = computed({
  get: () => visible.value,
  set: value => authModalStore.setVisible(value)
})
</script>
