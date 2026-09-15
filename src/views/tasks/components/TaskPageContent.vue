<template>
  <!-- 任务主体：仅使用 Figma 固定示例数据，不发起接口请求。 -->
  <section
    class="w-full"
    :class="props.mode === 'pc' ? 'flex flex-col gap-5' : 'px-3.5 pb-8 pt-3.5'"
  >
    <!-- H5 横向栏目栏：设计稿为固定宽度的胶囊按钮。 -->
    <section v-if="props.mode === 'mobile'" class="-mx-3.5 overflow-x-auto px-3.5">
      <div class="flex items-center gap-2">
        <div
          v-for="tab in props.tabs"
          :key="tab.key"
          class="flex h-9 shrink-0 items-center gap-[5px] rounded-[18px] px-4"
          :class="
            tab.key === props.activeTabKey ? 'bg-theme-primary text-text-4' : 'bg-bg-2 text-text-2'
          "
          :style="{ width: `${tab.mobileWidth}px` }"
        >
          <!-- Figma 栏目图标。 -->
          <component
            :is="newSideIcons[tab.iconKey]"
            class="h-5 w-5 shrink-0"
            :class="tab.key === props.activeTabKey ? 'brightness-0' : ''"
          />
          <span
            class="whitespace-nowrap"
            :class="
              tab.key === props.activeTabKey
                ? 'text-xs font-[700] leading-[15px]'
                : 'text-xs font-[500] leading-[15px]'
            "
          >
            {{ tab.label }}
          </span>
        </div>
      </div>
    </section>

    <!-- H5 标签到统计卡的 14px 间距。 -->
    <div v-if="props.mode === 'mobile'" class="h-3.5"></div>

    <!-- 今日充值和有效投注统计卡。 -->
    <section
      class="flex rounded-[10px] bg-bg-2"
      :class="props.mode === 'pc' ? 'h-[95px] py-5' : 'h-[84px] py-5'"
    >
      <div
        class="flex flex-1 flex-col items-center justify-center border-r border-common-100/10"
        :class="props.mode === 'pc' ? 'gap-3' : 'gap-2'"
      >
        <strong
          :class="props.mode === 'pc' ? 'text-xl leading-6' : 'text-base leading-5'"
          class="font-[700] text-text-1"
        >
          {{ props.overview.deposit }}
        </strong>
        <span
          :class="props.mode === 'pc' ? 'text-base leading-[19px]' : 'text-xs leading-[15px]'"
          class="font-[400] text-text-2"
        >
          Today's Deposit
        </span>
      </div>
      <div
        class="flex flex-1 flex-col items-center justify-center"
        :class="props.mode === 'pc' ? 'gap-3' : 'gap-2'"
      >
        <strong
          :class="props.mode === 'pc' ? 'text-xl leading-6' : 'text-base leading-5'"
          class="font-[700] text-text-1"
        >
          {{ props.overview.validBets }}
        </strong>
        <span
          :class="props.mode === 'pc' ? 'text-base leading-[19px]' : 'text-xs leading-[15px]'"
          class="font-[400] text-text-2"
        >
          Today's Valid Bets
        </span>
      </div>
    </section>

    <!-- H5 统计卡与活动度卡的 10px 间距。 -->
    <div v-if="props.mode === 'mobile'" class="h-2.5"></div>

    <!-- 活动度奖励节点卡。 -->
    <section
      class="overflow-hidden rounded-[10px] bg-bg-2"
      :class="props.mode === 'pc' ? 'h-[252px] rounded-[16px]' : 'h-[196px]'"
    >
      <!-- 活动度标题栏。 -->
      <header
        class="flex items-center border-b border-common-100/[0.06]"
        :class="props.mode === 'pc' ? 'h-[54px] gap-3 px-7' : 'h-[35px] gap-2 px-3.5'"
      >
        <span
          :class="props.mode === 'pc' ? 'text-[18px] leading-[22px]' : 'text-xs leading-[15px]'"
          class="font-[400] text-text-1"
        >
          Current Activity:
        </span>
        <!-- 活动度图标槽位。 -->
        <i
          class="inline-block rounded-full bg-theme-primary"
          :class="props.mode === 'pc' ? 'h-5 w-[17px]' : 'h-3.5 w-3'"
        ></i>
        <span
          :class="props.mode === 'pc' ? 'text-[18px] leading-[22px]' : 'text-xs leading-[15px]'"
          class="font-[400] text-theme-primary"
        >
          {{ props.activity.currentActivity }}
        </span>
      </header>

      <!-- 七个固定活动度奖励节点。 -->
      <div :class="props.mode === 'pc' ? 'h-[146px]' : 'relative h-[126px]'">
        <div
          class="flex items-center justify-between"
          :class="
            props.mode === 'pc' ? 'h-full px-7' : 'absolute left-3.5 right-3.5 top-[14px] h-[73px]'
          "
        >
          <div
            v-for="node in props.activity.nodes"
            :key="node.activity"
            class="flex flex-col items-center"
            :class="props.mode === 'pc' ? 'w-[76px] gap-3' : 'w-9 gap-2'"
          >
            <!-- 宝箱图标：可领取/已领取使用开启图，待开启使用关闭图。 -->
            <img
              :src="node.state === 'locked' ? taskChestCloseImage : taskChestOpenImage"
              alt=""
              class="object-contain"
              :class="props.mode === 'pc' ? 'h-10 w-10' : 'h-[26px] w-[26px]'"
            />
            <span
              class="flex items-center justify-center rounded-full font-[400]"
              :class="[
                props.mode === 'pc'
                  ? 'h-7 w-[76px] text-base leading-[19px]'
                  : 'h-[18px] w-9 text-[10px] leading-3',
                node.state === 'claimed'
                  ? 'border border-common-100/[0.15] text-text-3'
                  : node.state === 'claimable'
                    ? 'bg-theme-primary text-text-4'
                    : 'bg-common-100/[0.06] text-text-2'
              ]"
            >
              {{ node.action }}
            </span>
            <span
              class="flex items-center gap-1 font-[400]"
              :class="[
                props.mode === 'pc' ? 'text-[18px] leading-[22px]' : 'text-[10px] leading-3',
                node.state === 'locked' ? 'text-text-2' : 'text-theme-primary'
              ]"
            >
              <!-- 活跃度图标：待开启节点使用灰色图标。 -->
              <img
                :src="node.state === 'locked' ? taskActivityLockedImage : taskActivityActiveImage"
                alt=""
                class="object-contain"
                :class="props.mode === 'pc' ? 'h-5 w-5' : 'h-3.5 w-3.5'"
              />
              {{ node.activity }}
            </span>
          </div>
        </div>
        <span>
          <!-- H5 说明固定在节点列下方，避免覆盖活动度数值。 -->
          <p
            v-if="props.mode === 'mobile'"
            class="absolute left-3.5 top-[96px] w-[350px] text-[10px] font-[400] leading-3 text-text-3"
          >
            Claim the activity chest by 1 AM the next day, or it will expire.
          </p>
        </span>
      </div>

      <!-- 重置倒计时和 PC 领取说明。 -->
      <footer
        class="flex items-center justify-between border-t border-common-100/[0.06]"
        :class="props.mode === 'pc' ? 'h-[52px] gap-2 px-7' : 'h-[35px] gap-2 px-3.5'"
      >
        <p class="flex min-w-0 items-center gap-1.5 whitespace-nowrap">
          <span
            :class="props.mode === 'pc' ? 'text-sm leading-5' : 'text-[10px] leading-3'"
            class="font-[400] text-text-2"
            >Reset:</span
          >
          <span
            :class="props.mode === 'pc' ? 'text-base leading-[19px]' : 'text-[11px] leading-[14px]'"
            class="font-[400] text-text-1"
          >
            {{
              `${props.activity.reset.days} Days ${props.activity.reset.hours} Hours ${props.activity.reset.minutes}
            Minutes ${props.activity.reset.seconds} Seconds`
            }}
          </span>
        </p>
        <p
          v-if="props.mode === 'pc'"
          class="line-clamp-1 text-right text-sm font-[400] leading-5 text-text-3"
        >
          Claim the activity chest by 1 AM the next day, or it will expire.
        </p>
      </footer>
    </section>

    <!-- H5 活动卡和任务区的 10px 间距。 -->
    <div v-if="props.mode === 'mobile'" class="h-2.5"></div>

    <!-- 固定任务卡片列表：PC 两列，H5 单列。 -->
    <section
      class="grid"
      :class="props.mode === 'pc' ? 'grid-cols-2 gap-4' : 'grid-cols-1 gap-3.5'"
    >
      <article
        v-for="task in props.tasks"
        :key="task.id"
        class="flex items-center justify-between rounded-[10px] bg-bg-2"
        :class="
          props.mode === 'pc'
            ? 'h-[116px] gap-[76px] rounded-[16px] px-7 py-4'
            : 'h-[83px] gap-3 px-3.5 py-3'
        "
      >
        <!-- 任务名称、奖励和进度。 -->
        <div
          class="flex min-w-0 flex-1 flex-col"
          :class="props.mode === 'pc' ? 'gap-3' : 'gap-1.5'"
        >
          <div class="flex items-center gap-2">
            <span
              :class="props.mode === 'pc' ? 'text-base leading-[19px]' : 'text-xs leading-[15px]'"
              class="line-clamp-1 font-[400] text-text-1"
            >
              {{ task.title }}
            </span>
            <span
              class="flex shrink-0 items-center justify-center rounded-full border border-text-2 font-[500] text-text-2"
              :class="props.mode === 'pc' ? 'h-5 w-5 text-xs' : 'h-3.5 w-3.5 text-[8px]'"
              >?</span
            >
          </div>
          <div
            :class="props.mode === 'pc' ? 'text-base leading-[19px]' : 'text-[10px] leading-3'"
            class="flex items-center gap-4 font-[400] text-text-1"
          >
            <span class="flex items-center gap-1"
              ><i
                class="inline-block rounded-full bg-text-2"
                :class="props.mode === 'pc' ? 'h-5 w-[17px]' : 'h-3.5 w-3'"
              ></i
              >{{ task.activity }}</span
            >
            <span class="flex items-center gap-1"
              ><i
                class="inline-block rounded-[3px] bg-text-2"
                :class="props.mode === 'pc' ? 'h-5 w-5' : 'h-3.5 w-3.5'"
              ></i
              >{{ task.reward }}</span
            >
          </div>
          <div class="flex items-center" :class="props.mode === 'pc' ? 'gap-4' : 'gap-2'">
            <span
              class="relative flex-1 overflow-hidden rounded-full bg-[rgba(42,238,136,0.15)]"
              :class="props.mode === 'pc' ? 'h-2' : 'h-[5px]'"
            >
              <i
                class="absolute inset-y-0 left-0 rounded-full bg-theme-primary"
                :style="{ width: `${task.progress}%` }"
              ></i>
            </span>
            <span
              :class="props.mode === 'pc' ? 'text-sm leading-5' : 'text-[10px] leading-3'"
              class="font-[400] text-text-2"
              >{{ `${task.progress}%` }}</span
            >
          </div>
        </div>

        <!-- Figma 任务动作按钮，仅做静态展示。 -->
        <span
          class="flex shrink-0 items-center justify-center font-[400]"
          :class="[
            props.mode === 'pc'
              ? 'h-[43px] w-28 rounded-[12px] text-base leading-[19px]'
              : 'h-[30px] w-20 rounded-[8px] text-[11px] leading-[14px]',
            task.action === 'Claim'
              ? 'bg-theme-primary text-text-4'
              : task.action === 'Completed'
                ? 'bg-common-100/[0.06] text-text-3'
                : 'border border-theme-primary text-theme-primary'
          ]"
        >
          {{ task.action }}
        </span>
      </article>
    </section>
  </section>
</template>

<script setup lang="ts">
import taskChestCloseImage from '@/static/img/task/activity-chest-locked.png'
import taskChestOpenImage from '@/static/img/task/activity-chest-open.png'
import taskActivityLockedImage from '@/static/img/task/activity-icon-locked.png'
import taskActivityActiveImage from '@/static/img/task/activity-icon-active.png'
import newSideIcons from '@/static/svg/side/newIcon'
import type {
  TaskActivityData,
  TaskOverviewData,
  TaskTabItem,
  TaskTabKey,
  TaskViewItem
} from '../shared'

interface Props {
  mode: 'mobile' | 'pc'
  tabs: TaskTabItem[]
  activeTabKey: TaskTabKey
  overview: TaskOverviewData
  activity: TaskActivityData
  tasks: TaskViewItem[]
}

const props = defineProps<Props>()
</script>
