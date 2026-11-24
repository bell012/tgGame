<template>
  <div class="flex items-center gap-[10px] rounded-b-[10px] bg-bg-2 p-3">
    <CurrencySelect
      v-if="isLogin"
      class="min-w-0 flex-[190]"
      :change-currency="changeCurrency"
      :disabled="loading"
    />
    <button
      type="button"
      class="flex min-h-[35px] min-w-0 items-center justify-center gap-1 rounded-lg bg-[image:var(--color-play-gradient)] px-2 py-1 text-[13px] font-semibold leading-4 text-text-4 shadow-[var(--color-play-shadow)] disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none disabled:grayscale"
      :class="isLogin ? 'flex-[123]' : 'w-full'"
      :disabled="isLogin && loading"
      @click="handlePlayAction"
    >
      <img :src="playIcon" alt="" class="size-4 shrink-0 object-contain" />
      {{ isLogin ? t('gameDetail.playNow') : t('gameDetail.guestCtaH5') }}
    </button>
  </div>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import playIcon from '@/static/img/game/detail/play.png'
import { useUserStore } from '@/stores/user'
import { useAuthModalStore } from '@/stores/authModal'
import CurrencySelect from '../currency-select/index.vue'

const { t } = useI18n()
defineProps<{
  loading: boolean
  changeCurrency: (value: string) => Promise<boolean>
}>()
const emit = defineEmits<{ play: [] }>()
const userStore = useUserStore()
const authModalStore = useAuthModalStore()
const isLogin = computed(() => Boolean(userStore.userInfo?.tradeToken))
const handlePlayAction = () => {
  if (!isLogin.value) {
    authModalStore.openLoginModal()
    return
  }
  emit('play')
}
</script>
