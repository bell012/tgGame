import html2canvas from 'html2canvas'

export type SaveElementImageResult = 'downloaded' | 'shared' | 'previewed' | 'cancelled'

interface SaveElementImageOptions {
  fileName: string
  backgroundColor?: string
}

const MOBILE_UA_PATTERN = /Android|iPhone|iPad|iPod|Mobile/i
const IOS_UA_PATTERN = /iP(hone|ad|od)/i
const WECHAT_UA_PATTERN = /MicroMessenger/i

const isMobileBrowser = () => MOBILE_UA_PATTERN.test(navigator.userAgent)

const isIosBrowser = () =>
  IOS_UA_PATTERN.test(navigator.userAgent) ||
  (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)

const isWeChatBrowser = () => WECHAT_UA_PATTERN.test(navigator.userAgent)

const canvasToBlob = (canvas: HTMLCanvasElement) =>
  new Promise<Blob | null>(resolve => {
    canvas.toBlob(resolve, 'image/png')
  })

const triggerDownload = (url: string, fileName: string) => {
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  link.rel = 'noopener'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

const openImagePreview = (url: string) => {
  const link = document.createElement('a')
  link.href = url
  link.target = '_blank'
  link.rel = 'noopener noreferrer'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

const shareImageFile = async (blob: Blob, fileName: string) => {
  if (typeof navigator.share !== 'function') return false

  const file = new File([blob], fileName, {
    type: blob.type || 'image/png'
  })

  if (typeof navigator.canShare === 'function' && !navigator.canShare({ files: [file] })) {
    return false
  }

  await navigator.share({
    files: [file],
    title: fileName
  })

  return true
}

export const saveElementAsImage = async (
  element: HTMLElement,
  options: SaveElementImageOptions
): Promise<SaveElementImageResult> => {
  await document.fonts.ready.catch(() => undefined)

  const canvas = await html2canvas(element, {
    scale: window.devicePixelRatio || 2,
    useCORS: true,
    scrollX: 0,
    scrollY: 0,
    backgroundColor: options.backgroundColor ?? '#fff'
  })

  const blob = await canvasToBlob(canvas)
  if (!blob) {
    throw new Error('canvas to blob failed')
  }

  const isProblematicMobileBrowser = isMobileBrowser() && (isIosBrowser() || isWeChatBrowser())

  try {
    if (isProblematicMobileBrowser) {
      try {
        const shared = await shareImageFile(blob, options.fileName)
        if (shared) return 'shared'
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') {
          return 'cancelled'
        }
      }

      const previewUrl = URL.createObjectURL(blob)
      openImagePreview(previewUrl)
      window.setTimeout(() => URL.revokeObjectURL(previewUrl), 60_000)
      return 'previewed'
    }

    const downloadUrl = URL.createObjectURL(blob)
    triggerDownload(downloadUrl, options.fileName)
    window.setTimeout(() => URL.revokeObjectURL(downloadUrl), 60_000)
    return 'downloaded'
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      return 'cancelled'
    }

    throw error
  }
}
