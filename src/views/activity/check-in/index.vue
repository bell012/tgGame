<template>
  <!-- 开发阶段直接打开签到弹窗 -->
  <CheckInPopup
    :model-value="true"
    @update:model-value="handlePopupVisibleChange"
    @rules="handleRules"
    @action="handleAction"
  />
</template>

<script setup lang="ts">
import { navigateToName } from '@/utils/router'
import { useRouter } from 'vue-router'
import CheckInPopup from './components/CheckInPopup.vue'

const router = useRouter()

// 关闭开发调试页，优先返回上一页，没有历史记录时回到首页。
const handleClose = () => {
  if (window.history.length > 1) {
    router.back()
    return
  }

  void navigateToName('Home', { replace: true })
}

// 调试页中弹窗关闭时，同步离开当前页面。
const handlePopupVisibleChange = (visible: boolean) => {
  if (!visible) {
    handleClose()
  }
}

// 开发阶段规则按钮仅保留占位交互，后续接入真实规则弹窗。
const handleRules = () => {}

// 开发阶段签到按钮仅保留占位交互，后续接入真实签到逻辑。
const handleAction = () => {}
</script>
