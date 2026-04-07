<template>
  <div class="security-h5 rounded-xl bg-bg-2 overflow-hidden">
    <!-- 顶部状态提示 -->
    <div
      v-if="isShowHint"
      class="flex items-center justify-between gap-3 px-3.5 py-3.5 bg-bg-6 rounded-lg border border-opacity-10"
      role="status"
      aria-live="polite"
    >
      <span class="text-sm font-medium text-text-1">
        {{ t('securitySettings.hintNotAvailable') }}
      </span>
      <span
        class="security-h5-hint-spinner inline-block h-5 w-5 shrink-0 rounded-full border-2 border-[#24ee89] border-r-transparent border-b-transparent"
        aria-hidden="true"
      />
    </div>

    <button
      v-for="item in menuItems"
      :key="item.id"
      type="button"
      class="flex w-full items-center gap-3 px-4 py-4 text-left transition-colors hover:bg-[var(--color-opacity-5)] active:opacity-90"
      @click="handleNavigate(item)"
    >
      <component
        :is="item.icon"
        class="h-5 w-5 shrink-0 text-icon-2 [&_svg]:max-w-full [&_svg]:max-h-full"
      />
      <span class="min-w-0 flex-1 truncate text-left text-[14px] font-normal text-text-1">
        {{ t(`securitySettings.menu.${item.id}`) }}
      </span>
      <span
        v-if="item.showBadge"
        class="h-2 w-2 shrink-0 rounded-full bg-[#FF4D4F]"
        aria-hidden="true"
      />
      <div
        class="flex h-5 w-5 shrink-0 items-center justify-center rounded-[10px]"
        aria-hidden="true"
      >
        <img :src="rightIconUrl" alt="" class="h-5 w-5 object-contain pointer-events-none" />
      </div>
    </button>
  </div>
</template>

<script setup lang="ts">
import type { Component } from 'vue'
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { navigateTo } from '@/utils/router'
import PasswordIcon from '@/static/svg/security/password.svg?component'
import PreferencesIcon from '@/static/svg/security/preferences.svg?component'
import VerificationIcon from '@/static/svg/security/verification.svg?component'
import MethodsIcon from '@/static/svg/security/methods.svg?component'
import WhitelistIcon from '@/static/svg/security/whitelist.svg?component'
import rightIconUrl from '@/static/svg/security/rightIcon.svg?url'

const { t } = useI18n()

type MenuId =
  | 'security'
  | 'preferences'
  | 'personalVerification'
  | 'paymentMethods'
  | 'whitelistManagement'

const menuItems: { id: MenuId; icon: Component; showBadge?: boolean; path: string }[] = [
  { id: 'security', icon: PasswordIcon, showBadge: true, path: '/security-details' },
  { id: 'preferences', icon: PreferencesIcon, path: '' },
  { id: 'personalVerification', icon: VerificationIcon, path: '' },
  { id: 'paymentMethods', icon: MethodsIcon, path: '' },
  { id: 'whitelistManagement', icon: WhitelistIcon, path: '' }
]
const isShowHint = ref(false)
const handleNavigate = (item: (typeof menuItems)[number]) => {
  void navigateTo(item.path)
}
</script>

<style scoped lang="scss">
.security-h5-hint-spinner {
  animation: security-h5-spin 0.85s linear infinite;
}

@keyframes security-h5-spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
