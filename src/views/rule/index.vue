<template>
  <section class="fixed inset-0 overflow-y-auto bg-bg-1">
    <div class="min-h-screen bg-bg-1">
      <H5Header :title="$t('vipPage.rule')" />

      <main class="p-3.5">
        <section>
          <div class="flex flex-col rounded-[10px] bg-bg-2 p-3.5">
            <h3 class="text-sm font-[400] text-text-1">
              {{ $t('vipPage.retention.title') }}
            </h3>
            <article
              v-for="card in retentionCards"
              :key="card.key"
              class="flex items-center justify-between py-3.5 last:pb-0"
            >
              <div class="flex items-center gap-2.5">
                <component :is="card.icon" class="h-[25px] w-[25px]" />
                <p class="text-sm font-[400] text-text-1">{{ card.label }}</p>
              </div>

              <p class="text-base font-[700] text-text-1">{{ card.amount }}</p>
            </article>
          </div>

          <div class="mt-[10px] space-y-3.5 rounded-[10px] bg-bg-2 p-3.5">
            <article v-for="rule in rules" :key="rule.key">
              <h3 class="text-sm font-[400] text-text-1">{{ rule.title }}</h3>
              <p class="mt-[7px] text-xs text-text-2">{{ rule.description }}</p>
            </article>
          </div>
        </section>
      </main>
    </div>
  </section>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import H5Header from '@/components/common/H5Header.vue'
import { useVipPageData } from '@/views/vip/shared'

const { t } = useI18n()
const { retentionCards, rules } = useVipPageData(t)
</script>
