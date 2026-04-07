<template>
  <div>
    安全性PC布局

    <button type="button" @click="handleOpenChangeLoginPassword">显示PC修改登录密码</button>

    <ChangeLoginPasswordPcLayout v-model="showChangeLoginPasswordPopup" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import ChangeLoginPasswordPcLayout from '../changeLoginPassword/pc-layout.vue'

const showChangeLoginPasswordPopup = ref(false)

/**
 * 打开 PC 修改登录密码弹窗。
 */
const handleOpenChangeLoginPassword = () => {
  showChangeLoginPasswordPopup.value = true
}
</script>

<style scoped lang="scss"></style>
