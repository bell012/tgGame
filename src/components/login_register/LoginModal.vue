<template>
  <teleport to="body">
    <transition name="modal-fade">
      <div
        v-if="modelValue"
        class="fixed inset-0 bg-[#000a] flex items-center justify-center z-[10000] overflow-hidden"
      >
        <div
          class="relative w-full max-w-[800px] h-full max-h-[640px] overflow-hidden rounded-2xl modal-container"
        >
          <div
            class="absolute inset-0 flex rounded-2xl overflow-hidden transition-all duration-500 ease-in-out"
            :class="getLoginClass()"
            style="box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5)"
          >
            <!-- 关闭按钮 -->
            <button
              class="absolute top-5 right-5 w-8 h-8 bg-bg-4 rounded-lg flex items-center justify-center z-10"
              @click="handleClose"
            >
              <CloseIcon class="w-[18px] h-[18px] fill-text-1 fill-none" />
            </button>

            <!-- 左侧图片区域 -->
            <div
              class="w-1/2 pl-6 pt-4 flex flex-col items-center justify-between relative bg-cover bg-center bg-no-repeat"
              style="background-image: url('/src/static/img/home/login.png')"
            >
              <div class="relative z-10 w-full flex justify-start">
                <img src="/src/static/img/home/logo.png" alt="Logo" class="w-auto h-8" />
              </div>

              <div class="absolute top-[400px] left-0 w-full">
                <div class="mb-3 mt-6 flex items-stretch justify-between">
                  <div class="flex-1 flex flex-col items-center justify-center px-2">
                    <div class="flex items-center justify-center">
                      <GiftIcon class="w-5 h-5 fill-none stroke-theme-1" />
                      <span class="text-[14px] font-[800] text-text-1 ml-1.5">470%</span>
                    </div>
                    <div class="text-[10px] text-text-2 mt-2 text-center">首存奖金</div>
                  </div>

                  <div class="w-px bg-[#e4eaf019]"></div>

                  <div class="flex-1 flex flex-col items-center justify-center px-2">
                    <div class="flex items-center justify-center">
                      <TurntableIcon class="w-5 h-5 fill-none stroke-theme-1" />
                      <span class="text-[14px] font-[800] text-text-1 ml-1.5">5 BTC</span>
                    </div>
                    <div class="text-[10px] text-text-2 mt-2 text-center">每日免费幸运旋转</div>
                  </div>

                  <div class="w-px bg-[#e4eaf019]"></div>

                  <div class="flex-1 flex flex-col items-center justify-center px-2">
                    <div class="flex items-center justify-center">
                      <FreePerksIcon class="w-5 h-5 fill-none stroke-theme-1" />
                      <span class="text-[14px] font-[800] text-text-1 ml-1.5">免费福利</span>
                    </div>
                    <div class="text-[10px] text-text-2 mt-2 text-center">每日免费参与奖金</div>
                  </div>
                </div>

                <div class="flex items-center justify-center flex-col">
                  <h2 class="w-full text-center text-[36px] font-[800] text-text-1 mb-1">
                    保持桀骜不训
                  </h2>
                  <p class="w-full text-center text-[16px] font-[600] text-text-1">
                    注册并获得欢迎奖金
                  </p>
                </div>
              </div>
            </div>

            <!-- 右侧表单区域 -->
            <div class="w-1/2 bg-bg-1 py-5 px-6">
              <LoginForm @switch-to-register="switchToRegister" />
            </div>
          </div>

          <!-- 注册弹窗 -->
          <div
            class="absolute inset-0 flex rounded-2xl overflow-hidden transition-all duration-500 ease-in-out"
            :class="getRegisterClass()"
            style="box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5)"
          >
             <!-- 关闭按钮 -->
             <button
              class="absolute top-5 right-5 w-8 h-8 bg-bg-4 rounded-lg flex items-center justify-center z-10"
              @click="handleClose"
            >
              <CloseIcon class="w-[18px] h-[18px] fill-text-1 fill-none" />
            </button>

            <!-- 左侧图片区域 -->
            <div
              class="w-1/2 pl-6 pt-4 flex flex-col items-center justify-between relative bg-cover bg-center bg-no-repeat"
              style="background-image: url('/src/static/img/home/login.png')"
            >
              <div class="relative z-10 w-full flex justify-start">
                <img src="/src/static/img/home/logo.png" alt="Logo" class="w-auto h-8" />
              </div>

              <div class="absolute top-[400px] left-0 w-full">
                <div class="mb-3 mt-6 flex items-stretch justify-between">
                  <div class="flex-1 flex flex-col items-center justify-center px-2">
                    <div class="flex items-center justify-center">
                      <GiftIcon class="w-5 h-5 fill-none stroke-theme-1" />
                      <span class="text-[14px] font-[800] text-text-1 ml-1.5">470%</span>
                    </div>
                    <div class="text-[10px] text-text-2 mt-2 text-center">首存奖金</div>
                  </div>

                  <div class="w-px bg-[#e4eaf019]"></div>

                  <div class="flex-1 flex flex-col items-center justify-center px-2">
                    <div class="flex items-center justify-center">
                      <TurntableIcon class="w-5 h-5 fill-none stroke-theme-1" />
                      <span class="text-[14px] font-[800] text-text-1 ml-1.5">5 BTC</span>
                    </div>
                    <div class="text-[10px] text-text-2 mt-2 text-center">每日免费幸运旋转</div>
                  </div>

                  <div class="w-px bg-[#e4eaf019]"></div>

                  <div class="flex-1 flex flex-col items-center justify-center px-2">
                    <div class="flex items-center justify-center">
                      <FreePerksIcon class="w-5 h-5 fill-none stroke-theme-1" />
                      <span class="text-[14px] font-[800] text-text-1 ml-1.5">免费福利</span>
                    </div>
                    <div class="text-[10px] text-text-2 mt-2 text-center">每日免费参与奖金</div>
                  </div>
                </div>

                <div class="flex items-center justify-center flex-col">
                  <h2 class="w-full text-center text-[36px] font-[800] text-text-1 mb-1">
                    保持桀骜不训
                  </h2>
                  <p class="w-full text-center text-[16px] font-[600] text-text-1">
                    注册并获得欢迎奖金
                  </p>
                </div>
              </div>
            </div>

            <!-- 右侧表单区域 -->
            <div class="w-1/2 bg-bg-1 py-5 px-6">
              <RegisterForm @switch-to-login="switchToLogin" />
            </div>
          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import CloseIcon from '@/static/svg/close.svg?component'
import GiftIcon from '@/static/svg/login/gift.svg?component'
import TurntableIcon from '@/static/svg/login/turntable.svg?component'
import FreePerksIcon from '@/static/svg/login/free_perks.svg?component'
import LoginForm from './LoginForm.vue'
import RegisterForm from './RegisterForm.vue'

interface Props {
  modelValue: boolean
  defaultTab?: 'login' | 'register'
}

const props = withDefaults(defineProps<Props>(), {
  defaultTab: 'login'
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const activeTab = ref<'login' | 'register'>(props.defaultTab)

watch(
  () => props.modelValue,
  newVal => {
    if (newVal) {
      activeTab.value = props.defaultTab
    }
  }
)

watch(
  () => props.defaultTab,
  newVal => {
    if (props.modelValue) {
      activeTab.value = newVal
    }
  }
)

const handleClose = () => {
  emit('update:modelValue', false)
}

const isAnimating = ref(false)
const isSliding = ref(false)

// 登入弹窗
const getLoginClass = () => {
  if (activeTab.value === 'login') {
    return 'translate-x-0 z-20 opacity-100'
  } else if (isSliding.value) {
    return '-translate-x-full z-10 opacity-0'
  } else {
    return 'translate-x-full z-10 opacity-0'
  }
}

// 注册弹窗
const getRegisterClass = () => {
  if (activeTab.value === 'register') {
    return 'translate-x-0 z-20 opacity-100'
  } else if (isSliding.value) {
    return '-translate-x-full z-10 opacity-0'
  } else {
    return 'translate-x-full z-10 opacity-0'
  }
}

const switchToRegister = () => {
  if (isAnimating.value) return
  isAnimating.value = true
  isSliding.value = true

  activeTab.value = 'register'

  setTimeout(() => {
    isAnimating.value = false
    isSliding.value = false
  }, 500)
}

const switchToLogin = () => {
  if (isAnimating.value) return
  isAnimating.value = true
  isSliding.value = true

  activeTab.value = 'login'

  setTimeout(() => {
    isAnimating.value = false
    isSliding.value = false
  }, 500)
}
</script>

<style scoped lang="scss">
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-fade-enter-to,
.modal-fade-leave-from {
  opacity: 1;
}

.modal-fade-enter-active .modal-container {
  animation: modalZoomIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.modal-fade-leave-active .modal-container {
  animation: modalZoomOut 0.3s cubic-bezier(0.7, 0, 0.84, 0);
}

@keyframes modalZoomIn {
  from {
    transform: scale(0.8);
  }
  to {
    transform: scale(1);
  }
}

@keyframes modalZoomOut {
  from {
    transform: scale(1);
  }
  to {
    transform: scale(0.8);
  }
}
</style>
