<template>
    <!-- 登录/注册弹窗 -->
    <LoginModal
      v-model="showLoginModal"
      :default-tab="loginModalTab"
    />
</template>
<script setup lang="ts">
    import { ref } from 'vue'
    import LoginModal from '@/components/login_register/LoginModal.vue'

    const showLoginModal = ref(true)
    const loginModalTab = ref<'login' | 'register'>('login')
</script>
<style scoped lang="scss"></style>