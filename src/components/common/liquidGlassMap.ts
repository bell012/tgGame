/* Rounded-bezel displacement adapted from Liquid Glass Components v2.1.0 (MIT).
 * https://github.com/jcm-developer/liquid-glass-components
 */
const maps = new Map<string, string>()

export function createLiquidGlassMap(width: number, height: number, radius: number, bezel: number) {
  const key = [width, height, radius, bezel].join(':')
  const cached = maps.get(key)
  if (cached) return cached

  const ratio = Math.min(1, 512 / Math.max(width, height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.max(1, Math.round(width * ratio))
  canvas.height = Math.max(1, Math.round(height * ratio))
  const context = canvas.getContext('2d')
  if (!context) return ''
  const image = context.createImageData(canvas.width, canvas.height)
  const r = Math.min(radius, width / 2, height / 2)
  const edge = Math.max(1, Math.min(bezel, width / 2, height / 2))
  for (let y = 0; y < canvas.height; y++) {
    for (let x = 0; x < canvas.width; x++) {
      const px = ((x + 0.5) / canvas.width - 0.5) * width
      const py = ((y + 0.5) / canvas.height - 0.5) * height
      const qx = Math.abs(px) - (width / 2 - r)
      const qy = Math.abs(py) - (height / 2 - r)
      let distance: number
      let nx = 0
      let ny = 0
      if (qx > 0 && qy > 0) {
        const length = Math.hypot(qx, qy)
        distance = r - length
        nx = (qx / length) * Math.sign(px)
        ny = (qy / length) * Math.sign(py)
      } else {
        distance = r - Math.max(qx, qy)
        if (qx > qy) nx = Math.sign(px)
        else ny = Math.sign(py)
      }
      const strength = distance > 0 && distance < edge ? (1 - distance / edge) ** 2 : 0
      const offset = (y * canvas.width + x) * 4
      image.data[offset] = 128 - nx * strength * 127
      image.data[offset + 1] = 128 - ny * strength * 127
      image.data[offset + 2] = 128
      image.data[offset + 3] = 255
    }
  }
  context.putImageData(image, 0, 0)
  const url = canvas.toDataURL()
  maps.set(key, url)
  if (maps.size > 12) {
    const oldest = maps.keys().next().value
    if (oldest) maps.delete(oldest)
  }
  return url
}
