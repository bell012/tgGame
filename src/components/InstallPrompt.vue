<template>
  <div
    v-if="showInstallPrompt"
    class="fixed bottom-4 left-4 z-50 max-w-sm bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow-2xl p-4 text-white"
  >
    <div class="flex items-start gap-3">
      <div class="flex-shrink-0">
        <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
          />
        </svg>
      </div>
      <div class="flex-1">
        <h3 class="text-sm font-bold mb-1">{{ t('pwa.installTitle') }}</h3>
        <p class="text-sm opacity-90">{{ t('pwa.installMessage') }}</p>
      </div>
      <button class="flex-shrink-0 text-white hover:text-gray-200" @click="dismissPrompt">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </div>
    <div class="mt-4 flex gap-2">
      <button
        class="flex-1 px-4 py-2 bg-white text-blue-600 text-sm font-semibold rounded-md hover:bg-gray-100 transition-colors"
        @click="install"
      >
        {{ t('pwa.install') }}
      </button>
      <button
        class="flex-1 px-4 py-2 bg-blue-600 bg-opacity-50 text-white text-sm font-medium rounded-md hover:bg-opacity-70 transition-colors"
        @click="dismissPrompt"
      >
        {{ t('pwa.later') }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const showInstallPrompt = ref(false)
let deferredPrompt: any = null

onMounted(() => {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault()
    deferredPrompt = e
    showInstallPrompt.value = true
  })

  window.addEventListener('appinstalled', () => {
    showInstallPrompt.value = false
    deferredPrompt = null
  })
})

const install = async () => {
  if (!deferredPrompt) return

  deferredPrompt.prompt()
  const { outcome } = await deferredPrompt.userChoice

  if (outcome === 'accepted') {
    showInstallPrompt.value = false
  }

  deferredPrompt = null
}

const dismissPrompt = () => {
  showInstallPrompt.value = false
  deferredPrompt = null
}
</script>

