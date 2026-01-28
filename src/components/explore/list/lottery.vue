<template>
  <div class="flex flex-col py-4 font-bold">
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
</template>

<script setup lang="ts">
import FavoritesFull from '@/static/svg/casino/favorites_full.svg?component'
import { computed, Ref } from 'vue'
import { COUNTRIES, getTimeDifference, groupByName } from '../consts'
// mock数据
import { lotteriesList } from '../mock'

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
