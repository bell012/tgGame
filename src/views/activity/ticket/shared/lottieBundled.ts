import lottie, { type AnimationItem } from 'lottie-web'

export type BundledLottieAsset = {
  p?: string
  u?: string
  [key: string]: unknown
}

export type BundledLottieJson = Record<string, unknown> & {
  assets?: BundledLottieAsset[]
}

interface LoadBundledLottieOptions {
  container: HTMLElement
  animationData: BundledLottieJson
  images: Record<string, string>
  loop: boolean
  autoplay: boolean
}

const cloneAnimationData = (data: BundledLottieJson) => {
  if (typeof structuredClone === 'function') {
    return structuredClone(data)
  }
  return JSON.parse(JSON.stringify(data)) as BundledLottieJson
}

const getImageUrlByFileName = (images: Record<string, string>) =>
  new Map(Object.entries(images).map(([path, url]) => [path.split('/').pop(), url]))

export const buildBundledLottieData = (data: BundledLottieJson, images: Record<string, string>) => {
  const cloned = cloneAnimationData(data)
  const imageUrlByFileName = getImageUrlByFileName(images)

  cloned.assets?.forEach(asset => {
    if (!asset.p) return
    const imageUrl = imageUrlByFileName.get(asset.p)
    if (!imageUrl) return
    asset.u = ''
    asset.p = imageUrl
  })

  return cloned
}

export const createBundledLottiePath = (data: BundledLottieJson, images: Record<string, string>) =>
  URL.createObjectURL(
    new Blob([JSON.stringify(buildBundledLottieData(data, images))], {
      type: 'application/json'
    })
  )

export const loadBundledLottie = ({
  container,
  animationData,
  images,
  loop,
  autoplay
}: LoadBundledLottieOptions): AnimationItem =>
  lottie.loadAnimation({
    container,
    renderer: 'svg',
    loop,
    autoplay,
    animationData: buildBundledLottieData(animationData, images),
    rendererSettings: {
      preserveAspectRatio: 'xMidYMid meet'
    }
  })
