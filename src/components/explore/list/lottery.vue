<template>
  <div class="lottery-container">
    <div class="flex flex-col py-4 font-bold" v-if="!keyword">
      <div v-for="item in groupLotteryList" :key="item.name">
        <h3 class="text-[14px]">{{ item.name }}</h3>
        <div class="px-[8px]">
          <div class="flex justify-between py-[8px]" v-for="child in item.items" :key="child.id">
            <div class="flex items-center gap-[10px]">
              <section class="relative min-w-[24px] min-h-[24px] w-[24px] h-[24px] overflow-hidden">
                <img
                  class="w-[24px] min-w-[24px] absolute"
                  alt="countries"
                  src="@/static/img/explore/countries.png"
                  :style="`top: -${getImageTop(child.country)}px`"
                />
              </section>
              <div class="flex flex-col gap-[4px]">
                <div class="text-[14px]">{{ child.name }}</div>
                <div class="text-[12px] text-[var(--color-text-level-2)]">
                  <span class="mr-[4px]">开始于</span>
                  <span
                    class="text-[var(--color-text-level-2)]"
                    v-format-time="child.drawTime"
                  ></span>
                </div>
              </div>
            </div>
            <div><FavoritesFull class="w-4 h-4" /></div>
          </div>
        </div>
      </div>
    </div>
    <div v-else class="grid lg:grid-cols-4 grid-cols-2 gap-[8px] mt-[12px] text-[14px]">
      <div
        class="flex flex-col font-bold bg-[var(--color-background-level-2)] rounded-md p-[12px] gap-[8px]"
        v-for="child in lotteriesList"
        :key="child.id"
      >
        <div class="flex justify-between">
          <div><FavoritesFull class="w-4 h-4" /></div>
          <section class="relative min-w-[24px] min-h-[24px] w-[24px] h-[24px] overflow-hidden">
            <img
              class="w-[24px] min-w-[24px] absolute"
              alt="countries"
              src="@/static/img/explore/countries.png"
              :style="`top: -${getImageTop(child.country)}px`"
            />
          </section>
        </div>
        <div class="text-[12px] text-[var(--color-text-level-2)]">
          <span class="mr-[4px]">下次抽奖于</span>
          <span v-format-time="child.drawTime"></span>
        </div>
        <div class="text-[14px]">{{ child.name }}</div>
        <div class="flex justify-between">
          <div class="text-[12px] text-[var(--color-text-level-2)]">最高奖</div>
          <div>{{ child.topPrize }}</div>
        </div>
        <div class="flex justify-between gap-[8px]">
          <div
            class="bg-[var(--color-background-level-7)] px-[16px] py-[4px] rounded-md cursor-pointer"
          >
            投注2个号码球
          </div>
          <div
            class="bg-[var(--color-background-level-7)] px-[16px] py-[4px] rounded-md cursor-pointer"
          >
            投注3个号码球
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import FavoritesFull from '@/static/svg/casino/favorites_full.svg?component'
import { computed, inject, Ref } from 'vue'
import { COUNTRIES, getTimeDifference, groupByName } from '../consts'
// mock数据
import { lotteriesList } from '../mock'

const keyword = inject('explore-keywords') as Ref<string>

const groupLotteryList = computed(() => {
  return groupByName(lotteriesList)
})

const getImageTop = (value: string) => {
  const index = COUNTRIES.indexOf(value)
  return index * 24
}

const vFormatTime = {
  mounted(el: HTMLElement, binding: Ref<number>) {
    function update() {
      const timeText = getTimeDifference(binding.value)
      el.innerHTML = timeText
      requestAnimationFrame(update)
    }
    update()
  }
}
</script>

<style scoped lang="scss"></style>
