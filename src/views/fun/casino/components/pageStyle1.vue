<template>
  <div class="modules mb-4" v-for="(item, index) in modules" :key="index">
    <div class="mt-2 flex items-center sm:mt-6 h-8">
      <h2 class="flex items-center text-base font-extrabold text-primary">{{ item.name }}</h2>
      <button
        class="button ml-auto flex items-center gap-1 rounded-lg font-extrabold h-8 bg-[var(--color-opacity-10)] px-2 inactive"
        link=""
      >
        {{ t('locales.casino.all') }}
      </button>
    </div>
    <div class="w-full mt-[10px] overflow-x-auto">
      <div class="grid grid-flow-col auto-cols-[30.25%] gap-2">
        <div v-for="(item, index) in [1, 2, 3, 4, 5, 6]" :key="index">
          <a
            href="javascript:void(0);"
            class="game-item group relative flex size-full flex-col items-center overflow-hidden rounded-lg transition-all hover:-translate-y-2 inactive"
            link=""
            ><img class="w-full" alt="Crash" :src="getGameImg(item)" />
            <div
              class="absolute bottom-1 right-1 flex h-5 items-center rounded-md bg-[var(--color-mask-20)] px-1.5"
            >
              <div class="icon size-4 fill-text-1">
                <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M26.1137 20.6693C26.6674 23.8341 24.4618 26.132 21.3885 26.6484C18.4196 27.1469 13.5818 27.1469 10.6138 26.6484C7.5397 26.132 5.3341 23.8349 5.88853 20.6702C6.35798 17.9846 8.63481 16.3107 11.4143 16.4548C13.4451 16.56 14.6923 16.8239 16.1371 16.8239C17.5981 16.8239 18.5718 16.5592 20.588 16.4548C23.3674 16.3091 25.6443 17.9838 26.1137 20.6693ZM16.1007 4.66211C19.021 4.66211 21.3885 7.02959 21.3885 9.9499C21.3885 12.8702 19.021 15.2377 16.1007 15.2377C13.1804 15.2377 10.8121 12.8694 10.8121 9.9499C10.8121 7.0304 13.1796 4.66211 16.1007 4.66211Z"
                  ></path>
                </svg>
              </div>
              <span class="text-xs font-semibold text-text-1">2191</span>
            </div>
          </a>
        </div>
      </div>
    </div>
  </div>
  <div class="mt-2 flex items-center sm:mt-6 h-8">
    <h2 class="flex items-center text-base font-extrabold text-primary">
      {{ t('locales.casino.latest_bet') }}
    </h2>
    <span class="ml-auto"></span>
  </div>
  <div class="flex mt-2 w-full rounded bg-[var(--color-opacity-6)] text-text-2">
    <button
      :class="{ 'bg-[var(--color-opacity-10)] text-text-1': latestBetIndex === 0 }"
      class="flex-1 h-10 shrink-0 rounded-lg font-bold text-sm flex items-center justify-center"
      @click.stop="latestBetIndex = 0"
    >
      {{ t('locales.casino.latest_bet') }}
    </button>
    <button
      :class="{ 'bg-[var(--color-opacity-10)] text-text-1': latestBetIndex === 1 }"
      class="flex-1 h-10 shrink-0 rounded-lg font-bold text-sm flex items-center justify-center"
      @click.stop="latestBetIndex = 1"
    >
      {{ t('locales.casino.high_roller') }}
    </button>
  </div>
  <div class="my-3 min-h-96 rounded-xl">
    <div class="relative overflow-hidden text-text-2">
      <table>
        <thead>
          <tr>
            <td>游戏</td>
            <td>玩家</td>
            <td>倍数</td>
            <td>盈余</td>
          </tr>
        </thead>
        <tbody></tbody>
      </table>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import game1 from '@/static/img/test/game1.png'
import game2 from '@/static/img/test/game2.png'
import game3 from '@/static/img/test/game3.png'
import game4 from '@/static/img/test/game4.png'
import game5 from '@/static/img/test/game5.png'
import game6 from '@/static/img/test/game6.png'

interface OptionItem {
  id: number | string
  style: number | string
  name: string
  icon: string
}

const { t } = useI18n()
const modules = defineModel<OptionItem[]>('modules')
const latestBetIndex = ref(0)

const getGameImg = (item: number | string) => {
  switch (item) {
    case 1:
      return game1
    case 2:
      return game2
    case 3:
      return game3
    case 4:
      return game4
    case 5:
      return game5
    case 6:
      return game6
    default:
      return game6
  }
}
</script>
<style scoped lang="scss"></style>
