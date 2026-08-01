export const DESIGN_CARD_WIDTH = 330

export const GAME_COVER_NAME_FONT_FAMILY = 'Impact, "Infoma Ultra", sans-serif'

export const GAME_COVER_NAME_HORIZONTAL_PADDING = 16

export type GameCoverNameTypographyTier = 'max' | 'min'

export interface GameCoverNameTypographyToken {
  fontSize: number
  lineHeight: number
  fontWeight: number
}

export interface GameCoverNameTypographyTokens {
  max: GameCoverNameTypographyToken
  min: GameCoverNameTypographyToken
}

export interface ResolvedGameCoverNameTypography extends GameCoverNameTypographyToken {
  tier: GameCoverNameTypographyTier
}

export const CHINESE_TOKENS: GameCoverNameTypographyTokens = {
  max: { fontSize: 60, lineHeight: 54, fontWeight: 900 },
  min: { fontSize: 48, lineHeight: 66, fontWeight: 900 }
}

export const ENGLISH_TOKENS: GameCoverNameTypographyTokens = {
  max: { fontSize: 72, lineHeight: 70, fontWeight: 400 },
  min: { fontSize: 51, lineHeight: 54, fontWeight: 400 }
}

const CHINESE_NAME_PATTERN = /[\u4e00-\u9fff]/

let measureCanvas: HTMLCanvasElement | null = null

export const isChineseGameName = (name: string) => CHINESE_NAME_PATTERN.test(name)

export const getGameCoverNameTokens = (name: string) =>
  isChineseGameName(name) ? CHINESE_TOKENS : ENGLISH_TOKENS

export const scaleTypography = (
  token: GameCoverNameTypographyToken,
  containerWidth: number
): GameCoverNameTypographyToken => {
  const scale = containerWidth / DESIGN_CARD_WIDTH

  return {
    fontSize: token.fontSize * scale,
    lineHeight: token.lineHeight * scale,
    fontWeight: token.fontWeight
  }
}

const getMeasureContext = () => {
  if (typeof document === 'undefined') {
    return null
  }

  if (!measureCanvas) {
    measureCanvas = document.createElement('canvas')
  }

  return measureCanvas.getContext('2d')
}

export const measureGameCoverNameWidth = (
  name: string,
  fontSize: number,
  fontFamily = GAME_COVER_NAME_FONT_FAMILY
) => {
  const context = getMeasureContext()
  if (!context) {
    return name.length * fontSize * 0.55
  }

  context.font = `${fontSize}px ${fontFamily}`
  return context.measureText(name.trim()).width
}

export const resolveGameCoverNameTypography = (
  name: string,
  containerWidth: number,
  fontFamily = GAME_COVER_NAME_FONT_FAMILY,
  horizontalPadding = GAME_COVER_NAME_HORIZONTAL_PADDING
): ResolvedGameCoverNameTypography => {
  const normalizedName = String(name ?? '').trim()
  const tokens = getGameCoverNameTokens(normalizedName)
  const safeContainerWidth = Math.max(containerWidth, 1)
  const availableWidth = Math.max(safeContainerWidth - horizontalPadding, 1)
  const scaledMax = scaleTypography(tokens.max, safeContainerWidth)
  const measuredWidth = measureGameCoverNameWidth(normalizedName, scaledMax.fontSize, fontFamily)
  const tier: GameCoverNameTypographyTier = measuredWidth > availableWidth ? 'min' : 'max'
  const resolved = scaleTypography(tokens[tier], safeContainerWidth)

  return {
    tier,
    ...resolved
  }
}
