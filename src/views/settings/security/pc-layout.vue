<template>
  <div class="flex flex-col items-start">
    安全性PC布局

    <button type="button" @click="handleOpenChangeLoginPassword">显示PC修改登录密码</button>
    <button type="button" @click="handleOpenChangeMobileNumber">显示PC修改手机号码</button>

    <!-- 修改登录密码弹窗 -->
    <ChangeLoginPasswordPcLayout v-model="showChangeLoginPasswordPopup" />
    <!-- 修改手机号码弹窗 -->
    <ChangeMobileNumberPcLayout v-model="showChangeMobileNumberPopup" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import ChangeLoginPasswordPcLayout from '../changeLoginPassword/pc-layout.vue'
import ChangeMobileNumberPcLayout from '../changeMobileNumber/pc-layout.vue'

// 修改登录密码弹窗
const showChangeLoginPasswordPopup = ref(false)
// 修改手机号码弹窗
const showChangeMobileNumberPopup = ref(false)
/**
 * 打开 PC 修改登录密码弹窗。
 */
const handleOpenChangeLoginPassword = () => {
  showChangeLoginPasswordPopup.value = true
}

/**
 * 打开 PC 修改手机号码弹窗。
 */
const handleOpenChangeMobileNumber = () => {
  showChangeMobileNumberPopup.value = true
}
</script>

<style scoped lang="scss"></style>
