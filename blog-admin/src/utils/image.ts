/**
 * 图片压缩工具（头像上传前压缩，省空间省带宽）
 * 与 blog-front 前台 src/lib/image.ts 保持同一策略：
 * 目标宽度 512px、JPEG 质量逐级降质，输出 ≤ 300KB。
 */

export interface CompressedImage {
  blob: Blob
  url: string
}

const TARGET_WIDTH = 512
const TARGET_MAX_BYTES = 300 * 1024
const QUALITY_STEPS = [0.82, 0.7, 0.55, 0.4, 0.28]

export async function compressImage(file: File): Promise<CompressedImage> {
  if (file.size <= TARGET_MAX_BYTES) {
    return { blob: file, url: URL.createObjectURL(file) }
  }

  const bitmap = await createImageBitmap(file)
  const scale = Math.min(1, TARGET_WIDTH / bitmap.width)
  const w = Math.max(1, Math.round(bitmap.width * scale))
  const h = Math.max(1, Math.round(bitmap.height * scale))

  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')
  if (!ctx) {
    bitmap.close()
    return { blob: file, url: URL.createObjectURL(file) }
  }
  ctx.drawImage(bitmap, 0, 0, w, h)
  bitmap.close()

  let blob = await canvasToBlob(canvas, QUALITY_STEPS[0])
  for (const q of QUALITY_STEPS.slice(1)) {
    if (blob.size <= TARGET_MAX_BYTES) break
    blob = await canvasToBlob(canvas, q)
  }
  return { blob, url: URL.createObjectURL(blob) }
}

function canvasToBlob(canvas: HTMLCanvasElement, quality: number): Promise<Blob> {
  return new Promise((resolve) => {
    canvas.toBlob((b) => resolve(b ?? new Blob()), 'image/jpeg', quality)
  })
}
