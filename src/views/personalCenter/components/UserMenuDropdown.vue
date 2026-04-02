<template>
  <div>
    <!-- PC端 点击头像下拉菜单 -->
    <transition name="dropdown-fade">
      <div
        v-if="modelValue"
        class="absolute top-[52px] right-0 w-[240px] bg-bg-5 rounded-lg overflow-hidden z-50"
      >
        <div class="p-2">
          <div
            v-for="item in mainMenus"
            :key="item.id"
            class="flex items-center gap-2 p-2 cursor-pointer hover:bg-bg-3 hover:rounded-lg transition-colors"
            @click="item.handler"
          >
            <component :is="item.icon" class="w-6 h-6" />
            <span class="text-text-2 text-sm font-[700]">{{ item.name }}</span>
          </div>
        </div>
      </div>
    </transition>

    <SignOutPopup v-model:visible="showSignOutPopup" @confirm="confirmSignOut" />
  </div>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import SignOutPopup from '@/components/common/SignOutPopup.vue'
import { navigateTo } from '@/utils/router'
import { useUserStore } from '@/stores/user'

const { t } = useI18n()
const userStore = useUserStore()

// 动态导入图标
const getIcon = (iconNumber: number) => {
  return defineAsyncComponent(
    () => import(`@/static/svg/personalCenter/icon${iconNumber}.svg?component`)
  )
}

interface Props {
  modelValue: boolean
}

defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const showSignOutPopup = ref(false)

const confirmSignOut = () => {
  userStore.logout()
}

const mainMenus = computed(() => [
  {
    id: 'wallet',
    name: t('userMenu.wallet'),
    icon: getIcon(60),
    handler: () => {
      console.log('wallet')
      emit('update:modelValue', false)
    }
  },
  {
    id: 'withdraw',
    name: t('userMenu.withdraw'),
    icon: getIcon(61),
    handler: () => {
      navigateTo('/withdraw')
      emit('update:modelValue', false)
    }
  },
  {
    id: 'buy-crypto',
    name: t('userMenu.buyCrypto'),
    icon: getIcon(62),
    handler: () => {
      navigateTo('/deposit')
      emit('update:modelValue', false)
    }
  },
  {
    id: 'transactions',
    name: t('userMenu.transactions'),
    icon: getIcon(63),
    handler: () => {
      navigateTo('/transaction')
      emit('update:modelValue', false)
    }
  },
  {
    id: 'bet-history',
    name: t('userMenu.betHistory'),
    icon: getIcon(64),
    handler: () => {
      navigateTo('/bet-history')
      emit('update:modelValue', false)
    }
  },
  {
    id: 'rollover-overview',
    name: t('userMenu.rolloverOverview'),
    icon: getIcon(65),
    handler: () => {
      navigateTo('/rollover')
      emit('update:modelValue', false)
    }
  },
  {
    id: 'vip-club',
    name: t('userMenu.vipClub'),
    icon: getIcon(66),
    handler: () => {
      navigateTo('/vip')
      emit('update:modelValue', false)
    }
  },
  {
    id: 'vault-pro',
    name: t('userMenu.vaultPro'),
    icon: getIcon(67),
    handler: () => {
      console.log('Vault Pro clicked')
      emit('update:modelValue', false)
    }
  },
  {
    id: 'referral',
    name: t('userMenu.referral'),
    icon: getIcon(68),
    handler: () => {
      console.log('Referral clicked')
      emit('update:modelValue', false)
    }
  },
  {
    id: 'my-profile',
    name: t('userMenu.myProfile'),
    icon: getIcon(69),
    handler: () => {
      console.log('My Profile clicked')
      emit('update:modelValue', false)
    }
  },
  {
    id: 'global-settings',
    name: t('userMenu.globalSettings'),
    icon: getIcon(70),
    handler: () => {
      console.log('Global Settings clicked')
      emit('update:modelValue', false)
    }
  },
  {
    id: 'log-out',
    name: t('userMenu.logOut'),
    icon: getIcon(71),
    handler: () => {
      emit('update:modelValue', false)
      showSignOutPopup.value = true
    }
  }
])
</script>

<style scoped lang="scss">
// 下拉菜单淡入淡出动画
.dropdown-fade-enter-active,
.dropdown-fade-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}

.dropdown-fade-enter-from,
.dropdown-fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.dropdown-fade-enter-to,
.dropdown-fade-leave-from {
  opacity: 1;
  transform: translateY(0);
}
</style>
