<template>
  <!-- 注册协议 -->
  <Teleport to="body">
    <Transition name="bottom-sheet">
      <div
        v-if="visible"
        class="fixed inset-0 z-[10020] flex items-end justify-center bg-mask-60-1 sm:items-center"
        @click="handleClose"
      >
        <section
          class="bottom-sheet-panel flex h-[75vh] w-full flex-col overflow-hidden rounded-t-[12px] bg-bg-1 px-[14px] pb-[calc(env(safe-area-inset-bottom)+20px)] pt-[10px] sm:h-[600px] sm:w-[800px] sm:max-w-[calc(100vw-32px)] sm:rounded-[24px] sm:p-[32px]"
          @click.stop
        >
          <header class="mb-[25px] flex shrink-0 items-center justify-between gap-4">
            <h2
              class="w-full text-[16px] font-[700] text-text-1 text-center sm:text-left sm:text-[20px]"
            >
              {{ t('loginRegister.policy.title') }}
            </h2>
            <button
              type="button"
              class="flex h-7 w-7 shrink-0 items-center justify-center rounded-[6px] bg-opacity-10"
              @click="handleClose"
            >
              <CloseIcon class="h-2.5 w-2.5 text-icon-1" />
            </button>
          </header>

          <div class="min-h-0 flex-1 overflow-y-auto pr-1 text-[14px] font-[400] text-text-2">
            <section
              v-for="section in policySections"
              :key="resolvePolicyText(section.title)"
              class="mb-[20px] last:mb-0"
            >
              <h3 class="mb-[10px] text-[16px] font-[700] text-text-1">
                {{ resolvePolicyText(section.title) }}
              </h3>

              <p
                v-for="paragraph in section.paragraphs"
                :key="resolvePolicyText(paragraph)"
                class="mb-[10px] last:mb-0"
              >
                {{ resolvePolicyText(paragraph) }}
              </p>

              <ol v-if="section.orderedList?.length" class="mt-[10px] list-decimal space-y-1 pl-5">
                <li v-for="item in section.orderedList" :key="resolvePolicyText(item)">
                  {{ resolvePolicyText(item) }}
                </li>
              </ol>

              <ul v-if="section.bulletList?.length" class="mt-[10px] list-disc space-y-1 pl-5">
                <li v-for="item in section.bulletList" :key="resolvePolicyText(item)">
                  {{ resolvePolicyText(item) }}
                </li>
              </ul>

              <div
                v-for="subsection in section.subsections"
                :key="resolvePolicyText(subsection.title)"
                class="mt-[10px]"
              >
                <h4 class="mb-[10px]">
                  {{ resolvePolicyText(subsection.title) }}
                </h4>
                <p
                  v-for="paragraph in subsection.paragraphs"
                  :key="resolvePolicyText(paragraph)"
                  class="mb-[10px] last:mb-0"
                >
                  {{ resolvePolicyText(paragraph) }}
                </p>
                <ul v-if="subsection.bulletList?.length" class="mb-[10px] list-disc space-y-1 pl-5">
                  <li v-for="item in subsection.bulletList" :key="resolvePolicyText(item)">
                    {{ resolvePolicyText(item) }}
                  </li>
                </ul>
              </div>
            </section>
          </div>
        </section>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import CloseIcon from '@/static/svg/close.svg?component'

type PolicyText = string | number | boolean | null | undefined

type PolicySubsection = {
  title: PolicyText
  paragraphs?: PolicyText[]
  bulletList?: PolicyText[]
}

type PolicySection = {
  title: PolicyText
  paragraphs?: PolicyText[]
  orderedList?: PolicyText[]
  bulletList?: PolicyText[]
  subsections?: PolicySubsection[]
}

defineProps<{
  visible: boolean
}>()

const emit = defineEmits<{
  'update:visible': [value: boolean]
}>()

const { t, tm } = useI18n()

/** 读取结构化隐私政策内容，并补齐可选字段避免模板分支报错。 */
const policySections = computed(() => {
  const sections = tm('loginRegister.policy.sections') as Array<{
    title: string
  }>

  if (!Array.isArray(sections)) {
    return []
  }

  return (sections as PolicySection[]).map(section => ({
    ...section,
    paragraphs: section.paragraphs ?? [],
    orderedList: section.orderedList ?? [],
    bulletList: section.bulletList ?? [],
    subsections: section.subsections ?? []
  }))
})

/** 将 i18n 结构化消息安全转换为可渲染文本。 */
const resolvePolicyText = (value: PolicyText) => {
  if (typeof value === 'string') {
    return value
  }

  if (value === null || value === undefined) {
    return ''
  }

  return String(value)
}

/** 关闭注册协议和隐私政策弹窗。 */
const handleClose = () => {
  emit('update:visible', false)
}
</script>
