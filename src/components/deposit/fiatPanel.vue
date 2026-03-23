<template>
  <div class="w-full h-full">
    <!-- Coins -->
    <div class="flex gap-2 px-6 mt-4">
      <button
        v-for="coin in coins"
        :key="coin"
        class="px-3 py-1 rounded-full bg-gray-700 hover:bg-gray-600 text-sm"
      >
        {{ coin }}
      </button>
    </div>

    <!-- Channel -->
    <div class="px-6 mt-5">
      <p class="text-sm mb-2">Deposit Channel</p>
      <div class="flex gap-3">
        <button
          v-for="ch in channels"
          :key="ch"
          @click="selectedChannel = ch"
          :class="[
            'flex-1 py-2 rounded-lg border',
            selectedChannel === ch
              ? 'border-green-400 bg-green-400/10 text-green-400'
              : 'border-gray-600 text-gray-300'
          ]"
        >
          {{ ch }}
        </button>
      </div>
    </div>

    <!-- Amount -->
    <div class="px-6 mt-5">
      <p class="text-sm mb-2">Deposit Amount</p>
      <input
        type="number"
        v-model="amount"
        placeholder="Please select a deposit amount"
        class="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:border-green-400"
      />
    </div>

    <!-- Wager Tabs -->
    <div class="px-6 mt-4 flex gap-4 text-sm">
      <button class="text-green-400 border-b-2 border-green-400 pb-1">No Wagering</button>
      <button class="text-gray-400">1x Wagering</button>
      <button class="text-gray-400">5x Wagering</button>
      <button class="text-gray-400">10x Wagering</button>
    </div>

    <p class="px-6 text-xs text-yellow-400 mt-2">No wagering required for withdrawal</p>

    <!-- Presets -->
    <div class="grid grid-cols-3 gap-3 px-6 mt-4">
      <button
        v-for="preset in presets"
        :key="preset"
        @click="amount = preset"
        class="py-3 rounded-lg bg-gray-700 hover:bg-gray-600"
      >
        {{ preset }}
      </button>
    </div>

    <!-- Action -->
    <div class="px-6 py-5">
      <button class="w-full bg-green-500 hover:bg-green-600 py-3 rounded-xl font-semibold">
        Deposit Now
      </button>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue'

const coins = ['USDT', 'ETH', 'BTC', 'USDC']
const channels = ['Channel 1', 'Channel 2', 'Channel 3']
const presets = [200, 500, 1000, 1500, 2000, 3000]

const selectedChannel = ref('Channel 1')
const amount = ref<number | ''>('')
</script>
<style scoped lang="scss"></style>
