import { useIsMobile } from '@/composables/useMediaQuery'
import {
  computed,
  onBeforeUnmount,
  onMounted,
  ref,
  toValue,
  watch,
  type CSSProperties,
  type MaybeRefOrGetter,
  type Ref
} from 'vue'

export type AdaptiveTypographyLanguage = 'zh' | 'eng'
export type AdaptiveTypographyMode = 'mobile' | 'pc'
export type AdaptiveTypographyDisplayMode = AdaptiveTypographyMode | 'auto'
export type AdaptiveTypographyTier = 'max' | 'adaptive' | 'min'

export interface AdaptiveTypographyPreset {
  fontFamily: string
  maxFontSize: number
  minFontSize: number
  maxLineHeight: number
  minLineHeight: number
  fontWeight: number
  letterSpacing?: number | string
  step?: number
  scaleReferenceWidth?: number
  horizontalPadding?: number
}

export type AdaptiveTypographyPresets = Record<
  AdaptiveTypographyMode,
  Record<AdaptiveTypographyLanguage, AdaptiveTypographyPreset>
>

export interface ResolvedAdaptiveTypography {
  tier: AdaptiveTypographyTier
  fontFamily: string
  fontSize: number
  lineHeight: number
  fontWeight: number
  letterSpacing: string
  isTruncated: boolean
}

export interface UseAdaptiveTextTypographyOptions {
  text: MaybeRefOrGetter<unknown>
  targetRef: Ref<HTMLElement | null>
  presets: MaybeRefOrGetter<AdaptiveTypographyPresets>
  mode?: MaybeRefOrGetter<AdaptiveTypographyDisplayMode>
  maxLines?: MaybeRefOrGetter<number>
  overrides?: MaybeRefOrGetter<Partial<AdaptiveTypographyPreset> | undefined>
}

let sharedMeasurementElement: HTMLSpanElement | null = null
const fontLoadPromises = new Map<string, Promise<FontFace[]>>()
const CHINESE_TEXT_PATTERN = /[\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff]/

/** 根据后台返回的名称内容判断应使用中文还是英文字体配置。 */
const resolveTypographyLanguage = (text: unknown): AdaptiveTypographyLanguage =>
  CHINESE_TEXT_PATTERN.test(String(text ?? '')) ? 'zh' : 'eng'

/** 生成浏览器字体加载和检测所需的字体描述。 */
const createFontDescription = (preset: AdaptiveTypographyPreset) =>
  `${preset.fontWeight} ${preset.maxFontSize}px ${preset.fontFamily}`

/** 复用同一字体的加载任务，避免每个游戏卡片重复发起字体加载。 */
const loadFont = (fontDescription: string) => {
  const cachedPromise = fontLoadPromises.get(fontDescription)
  if (cachedPromise) {
    return cachedPromise
  }

  const loadPromise = document.fonts.load(fontDescription)
  fontLoadPromises.set(fontDescription, loadPromise)
  void loadPromise.catch(() => fontLoadPromises.delete(fontDescription))

  return loadPromise
}

/** 将数字或字符串字间距统一转换为可直接使用的 CSS 值。 */
const resolveLetterSpacing = (value?: number | string) => {
  if (typeof value === 'number') {
    return `${value}px`
  }

  return value || 'normal'
}

/** 根据当前字号在最大、最小端点之间计算对应行高。 */
const resolveLineHeight = (preset: AdaptiveTypographyPreset, fontSize: number) => {
  if (preset.maxFontSize === preset.minFontSize) {
    return preset.maxLineHeight
  }

  const ratio = (fontSize - preset.minFontSize) / (preset.maxFontSize - preset.minFontSize)

  return preset.minLineHeight + (preset.maxLineHeight - preset.minLineHeight) * ratio
}

/** 按参考宽度缩放需要保持旧版 PC 比例的字体配置。 */
const scalePreset = (
  preset: AdaptiveTypographyPreset,
  containerWidth: number
): AdaptiveTypographyPreset => {
  if (!preset.scaleReferenceWidth || preset.scaleReferenceWidth <= 0) {
    return preset
  }

  const scale = containerWidth / preset.scaleReferenceWidth

  return {
    ...preset,
    maxFontSize: preset.maxFontSize * scale,
    minFontSize: preset.minFontSize * scale,
    maxLineHeight: preset.maxLineHeight * scale,
    minLineHeight: preset.minLineHeight * scale
  }
}

/** 创建供所有实例复用的离屏文字测量节点。 */
const getMeasurementElement = () => {
  if (typeof document === 'undefined') {
    return null
  }

  if (sharedMeasurementElement) {
    return sharedMeasurementElement
  }

  const element = document.createElement('span')
  element.setAttribute('aria-hidden', 'true')
  element.style.cssText =
    'position:fixed;left:-99999px;top:0;display:block;box-sizing:border-box;visibility:hidden;pointer-events:none;padding:0;border:0;white-space:normal;'
  document.body.appendChild(element)
  sharedMeasurementElement = element

  return element
}

/** 构造指定字号对应的最终字体结果。 */
const createResolvedTypography = (
  preset: AdaptiveTypographyPreset,
  fontSize: number,
  tier: AdaptiveTypographyTier,
  isTruncated: boolean
): ResolvedAdaptiveTypography => ({
  tier,
  fontFamily: preset.fontFamily,
  fontSize,
  lineHeight: resolveLineHeight(preset, fontSize),
  fontWeight: preset.fontWeight,
  letterSpacing: resolveLetterSpacing(preset.letterSpacing),
  isTruncated
})

/** 判断当前字号下的文字能否在指定宽度和最大行数内完整显示。 */
const isTypographyFitted = (
  text: string,
  target: HTMLElement,
  availableWidth: number,
  maxLines: number,
  typography: ResolvedAdaptiveTypography
) => {
  const measurementElement = getMeasurementElement()
  if (!measurementElement) {
    return true
  }

  const targetStyle = window.getComputedStyle(target)
  measurementElement.textContent = text
  measurementElement.style.width = `${availableWidth}px`
  measurementElement.style.fontFamily = typography.fontFamily
  measurementElement.style.fontSize = `${typography.fontSize}px`
  measurementElement.style.lineHeight = `${typography.lineHeight}px`
  measurementElement.style.fontWeight = String(typography.fontWeight)
  measurementElement.style.letterSpacing = typography.letterSpacing
  measurementElement.style.textTransform = targetStyle.textTransform
  measurementElement.style.textAlign = targetStyle.textAlign
  measurementElement.style.wordBreak = targetStyle.wordBreak
  measurementElement.style.overflowWrap = targetStyle.overflowWrap || 'break-word'

  const maximumHeight = typography.lineHeight * maxLines
  const fitsHeight = measurementElement.scrollHeight <= Math.ceil(maximumHeight) + 1
  const fitsWidth = measurementElement.scrollWidth <= Math.ceil(availableWidth) + 1

  return fitsHeight && fitsWidth
}

/** 生成从最大字号逐级递减到最小字号的候选列表。 */
const createFontSizeCandidates = (preset: AdaptiveTypographyPreset) => {
  const maximum = Math.max(preset.maxFontSize, preset.minFontSize)
  const minimum = Math.min(preset.maxFontSize, preset.minFontSize)
  const step = Math.max(preset.step || 1, 0.1)
  const candidates: number[] = []

  for (let fontSize = maximum; fontSize > minimum; fontSize -= step) {
    candidates.push(fontSize)
  }

  candidates.push(minimum)
  return candidates
}

/** 提供按名称语言、设备模式和真实容器尺寸自适应文字的公共能力。 */
export const useAdaptiveTextTypography = (options: UseAdaptiveTextTypographyOptions) => {
  const isMobile = useIsMobile()

  /** 根据后台名称中是否包含中文字符选择对应排版配置。 */
  const resolvedLanguage = computed<AdaptiveTypographyLanguage>(() =>
    resolveTypographyLanguage(toValue(options.text))
  )

  /** 优先使用外部指定模式，否则按项目统一断点自动识别 H5 或 PC。 */
  const resolvedMode = computed<AdaptiveTypographyMode>(() => {
    const mode = toValue(options.mode) || 'auto'
    if (mode !== 'auto') {
      return mode
    }

    return isMobile.value ? 'mobile' : 'pc'
  })

  /** 合并当前语言、设备模式对应的默认配置和调用方覆盖参数。 */
  const selectedPreset = computed<AdaptiveTypographyPreset>(() => ({
    ...toValue(options.presets)[resolvedMode.value][resolvedLanguage.value],
    ...(toValue(options.overrides) ?? {})
  }))

  const typography = ref<ResolvedAdaptiveTypography>(
    createResolvedTypography(selectedPreset.value, selectedPreset.value.maxFontSize, 'max', false)
  )
  const isFontReady = ref(
    typeof document === 'undefined' || !document.fonts
      ? true
      : document.fonts.check(createFontDescription(selectedPreset.value))
  )

  let resizeObserver: ResizeObserver | null = null
  let calculationFrame = 0
  let fontLoadRequestId = 0

  /** 获取有效的最大展示行数。 */
  const resolveMaxLines = () => Math.max(1, Math.floor(Number(toValue(options.maxLines) || 2)))

  /** 根据当前文字和容器尺寸计算能够完整显示的最大字号。 */
  const calculateTypography = () => {
    const target = options.targetRef.value
    const text = String(toValue(options.text) ?? '').trim()
    const rawPreset = selectedPreset.value

    if (!target || target.clientWidth <= 0) {
      typography.value = createResolvedTypography(rawPreset, rawPreset.maxFontSize, 'max', false)
      return
    }

    const preset = scalePreset(rawPreset, target.clientWidth)
    const availableWidth = Math.max(
      target.clientWidth - Math.max(preset.horizontalPadding || 0, 0),
      1
    )
    const maxLines = resolveMaxLines()
    const candidates = createFontSizeCandidates(preset)

    for (const fontSize of candidates) {
      const tier: AdaptiveTypographyTier =
        fontSize === preset.maxFontSize
          ? 'max'
          : fontSize === preset.minFontSize
            ? 'min'
            : 'adaptive'
      const candidate = createResolvedTypography(preset, fontSize, tier, false)

      if (!text || isTypographyFitted(text, target, availableWidth, maxLines, candidate)) {
        typography.value = candidate
        return
      }
    }

    typography.value = createResolvedTypography(preset, preset.minFontSize, 'min', true)
  }

  /** 将多次连续触发的字体计算合并到下一帧执行。 */
  const scheduleCalculation = () => {
    if (typeof window === 'undefined') {
      calculateTypography()
      return
    }

    if (calculationFrame) {
      window.cancelAnimationFrame(calculationFrame)
    }

    calculationFrame = window.requestAnimationFrame(() => {
      calculationFrame = 0
      calculateTypography()
    })
  }

  /** 监听文字容器宽度变化并触发重新计算。 */
  const observeTarget = () => {
    resizeObserver?.disconnect()
    resizeObserver = null

    if (typeof ResizeObserver === 'undefined' || !options.targetRef.value) {
      return
    }

    resizeObserver = new ResizeObserver(() => scheduleCalculation())
    resizeObserver.observe(options.targetRef.value)
  }

  /** 等待当前语言对应的自定义字体加载完成后重新测量。 */
  const waitForSelectedFont = async () => {
    if (typeof document === 'undefined' || !document.fonts) {
      isFontReady.value = true
      return
    }

    const preset = selectedPreset.value
    const fontDescription = createFontDescription(preset)
    const requestId = ++fontLoadRequestId

    if (document.fonts.check(fontDescription)) {
      isFontReady.value = true
      scheduleCalculation()
      return
    }

    isFontReady.value = false

    try {
      await loadFont(fontDescription)
    } catch {
      // 字体加载失败时使用配置中的兜底字体，避免标题永久不可见。
    } finally {
      if (requestId === fontLoadRequestId) {
        isFontReady.value = true
        scheduleCalculation()
      }
    }
  }

  /** 监听文字、字体配置和最大行数变化。 */
  watch(
    [() => String(toValue(options.text) ?? ''), selectedPreset, () => resolveMaxLines()],
    () => {
      scheduleCalculation()
      void waitForSelectedFont()
    },
    { deep: true, flush: 'post' }
  )

  /** 监听目标节点挂载或替换并重新绑定尺寸监听。 */
  watch(
    () => options.targetRef.value,
    () => {
      observeTarget()
      scheduleCalculation()
    },
    { flush: 'post' }
  )

  /** 组件挂载后开始监听尺寸并等待字体资源。 */
  onMounted(() => {
    observeTarget()
    scheduleCalculation()
    void waitForSelectedFont()
  })

  /** 组件卸载前释放尺寸监听和待执行动画帧。 */
  onBeforeUnmount(() => {
    resizeObserver?.disconnect()
    resizeObserver = null

    if (calculationFrame && typeof window !== 'undefined') {
      window.cancelAnimationFrame(calculationFrame)
      calculationFrame = 0
    }
  })

  /** 将最终排版结果转换为文字元素可直接绑定的样式。 */
  const textStyle = computed<CSSProperties>(() => ({
    display: '-webkit-box',
    overflow: 'hidden',
    WebkitBoxOrient: 'vertical',
    WebkitLineClamp: String(resolveMaxLines()),
    fontFamily: typography.value.fontFamily,
    fontSize: `${typography.value.fontSize}px`,
    lineHeight: `${typography.value.lineHeight}px`,
    fontWeight: typography.value.fontWeight,
    letterSpacing: typography.value.letterSpacing
  }))

  /** 暴露当前文字是否已触发最小字号省略。 */
  const isTruncated = computed(() => typography.value.isTruncated)

  return {
    textStyle,
    typography,
    isTruncated,
    isFontReady,
    language: resolvedLanguage,
    mode: resolvedMode,
    recalculate: scheduleCalculation
  }
}
