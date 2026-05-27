export const UPLOAD_IMAGE_MAX_DIMENSION = 1920
export const UPLOAD_IMAGE_JPEG_QUALITY = 0.8
export const UPLOAD_IMAGE_MAX_BYTES = 2 * 1024 * 1024

type CompressUploadImageOptions = {
  maxDimension?: number
  jpegQuality?: number
  maxBytes?: number
}

const loadImageFromBlob = (blob: Blob) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const objectUrl = URL.createObjectURL(blob)
    const image = new Image()

    image.onload = () => {
      URL.revokeObjectURL(objectUrl)
      resolve(image)
    }

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      reject(new Error('image load failed'))
    }

    image.src = objectUrl
  })

const calcScaledSize = (width: number, height: number, maxDimension: number) => {
  if (width <= maxDimension && height <= maxDimension) {
    return { width, height }
  }

  const ratio = Math.min(maxDimension / width, maxDimension / height)

  return {
    width: Math.max(1, Math.round(width * ratio)),
    height: Math.max(1, Math.round(height * ratio))
  }
}

const canvasToJpegBlob = (canvas: HTMLCanvasElement, quality: number) =>
  new Promise<Blob | null>(resolve => {
    canvas.toBlob(blob => resolve(blob), 'image/jpeg', quality)
  })

export async function compressUploadImage(
  file: Blob | File,
  options: CompressUploadImageOptions = {}
): Promise<Blob> {
  const maxDimension = options.maxDimension ?? UPLOAD_IMAGE_MAX_DIMENSION
  const initialQuality = options.jpegQuality ?? UPLOAD_IMAGE_JPEG_QUALITY
  const maxBytes = options.maxBytes ?? UPLOAD_IMAGE_MAX_BYTES

  const image = await loadImageFromBlob(file)
  const { width, height } = calcScaledSize(image.naturalWidth, image.naturalHeight, maxDimension)

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height

  const context = canvas.getContext('2d')
  if (!context) {
    throw new Error('canvas context unavailable')
  }

  context.imageSmoothingEnabled = true
  context.imageSmoothingQuality = 'high'
  context.drawImage(image, 0, 0, width, height)

  let quality = initialQuality
  let blob = await canvasToJpegBlob(canvas, quality)

  while (blob && blob.size > maxBytes && quality > 0.4) {
    quality = Number((quality - 0.1).toFixed(1))
    blob = await canvasToJpegBlob(canvas, quality)
  }

  if (!blob) {
    throw new Error('compress failed')
  }

  if (blob.size > maxBytes) {
    throw new Error('413 Request Entity Too Large')
  }

  return blob
}

export async function prepareUploadImage(file: Blob | File): Promise<Blob> {
  if (!(file instanceof Blob)) {
    throw new Error('invalid file')
  }

  try {
    return await compressUploadImage(file)
  } catch {
    if (file.size <= UPLOAD_IMAGE_MAX_BYTES) {
      return file
    }

    throw new Error('413 Request Entity Too Large')
  }
}
