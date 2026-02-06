<template>
  <div class="fixed inset-0 z-[9999] flex flex-col items-center justify-center gap-4 bg-mask-60-1">
    <div
      class="activity-bg flex flex-col items-center justify-end gap-0.5 pb-3.5 w-[80%] max-w-full aspect-[750/1206] max-h-[101vw]"
    >
      <div class="title">NEW USER ONLY</div>
      <div class="text-text-1">1st Deposit Bonus</div>
      <div class="activityPop-num">+120%</div>
      <div class="text-text-1 text-center">
        <div class="text-base font-bold">Up to ₱58,584.36</div>
        <div class="text-sm">in Casino or Sports</div>
      </div>
      <button type="button" class="mt-5 w-[72%] h-10 flex items-center justify-center activity-but">
        <span class="text-text-4 text-base font-bold"> Deposit Now </span>
      </button>
    </div>
  </div>
</template>
<script setup lang="ts"></script>
<style scoped lang="scss">
.title {
  color: var(--color-text-level-1);
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 9px;
  background: linear-gradient(90deg, #ffcb22 0%, #fa8c2b 100%);
}
.activityPop-num {
  color: var(--color-text-level-1, #fff);
  text-align: center;
  text-shadow: 0 4px 0 #199600;
  -webkit-text-stroke-width: 1px;
  -webkit-text-stroke-color: #2aee88;
  font-family: Inter;
  font-size: 68px;
  font-style: italic;
  font-weight: 900;
  line-height: normal;
}
.activity-bg {
  background-image: url('@/static/img/home/activityImg.png');
  background-size: contain;
  background-position: top center;
  background-repeat: no-repeat;
  background-color: #252626;
}
.activity-but {
  border-radius: 8px;
  background: linear-gradient(90deg, #24ee89 0%, #9fe871 100%);
  box-shadow:
    0 0 12px 0 rgba(35, 238, 136, 0.3),
    0 -2px 0 0 #1dca6a inset;
}
</style>
