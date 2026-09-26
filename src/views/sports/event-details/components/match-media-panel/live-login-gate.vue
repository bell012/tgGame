<template>
  <div class="mx-auto flex w-[272px] flex-col items-center gap-3" data-testid="live-login-gate">
    <div class="flex w-full flex-col items-center gap-4">
      <img
        class="h-10 w-10 shrink-0"
        :src="loginGateUserIcon"
        alt=""
        draggable="false"
        aria-hidden="true"
      />
      <p class="w-full text-center text-sm font-bold text-text-1">
        {{ t('sports.loginToWatch') }}
      </p>
      <button
        type="button"
        class="flex h-12 w-[272px] items-center justify-center rounded-[60px] bg-theme-primary text-sm font-bold text-text-4"
        data-testid="live-login-button"
        @click="authModalStore.openLoginModal()"
      >
        {{ t('sports.logIn') }}
      </button>
    </div>
    <p class="flex items-center gap-1 text-xs font-normal text-text-1">
      <span>{{ t('sports.noAccountYet') }}</span>
      <button
        type="button"
        class="text-theme-primary underline"
        data-testid="live-join-now"
        @click="authModalStore.openRegisterModal()"
      >
        {{ t('sports.joinNow') }}
      </button>
    </p>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useAuthModalStore } from '@/stores/authModal'
import loginGateUserIcon from './icon/login-gate-user.svg?url'

const { t } = useI18n()
const authModalStore = useAuthModalStore()
</script>
