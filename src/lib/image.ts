/**
 * 图片压缩工具（头像上传前压缩，省空间省带宽）
 * 策略：目标宽度 512px、JPEG 质量 0.82；输出 ≤ 300KB 为止逐级降质。
 */

export interface CompressedImage {
  blob: Blob;
  url: string; // 用于即时预览（上传完成后由调用方 revoke）
}

/** 目标尺寸：头像 512px 足够清晰，体积可控 */
const TARGET_WIDTH = 512;
const TARGET_MAX_BYTES = 300 * 1024; // 300KB
const QUALITY_STEPS = [0.82, 0.7, 0.55, 0.4, 0.28];

/**
 * 压缩图片文件。返回压缩后的 Blob 与预览 URL。
 * 非图片/无法解码时原样返回。
 */
export async function compressImage(file: File): Promise<CompressedImage> {
  // 小于 300KB 且已达标尺寸：直接原样使用，省一次解码
  if (file.size <= TARGET_MAX_BYTES) {
    return { blob: file, url: URL.createObjectURL(file) };
  }

  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, TARGET_WIDTH / bitmap.width);
  const w = Math.max(1, Math.round(bitmap.width * scale));
  const h = Math.max(1, Math.round(bitmap.height * scale));

  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    bitmap.close();
    return { blob: file, url: URL.createObjectURL(file) };
  }
  ctx.drawImage(bitmap, 0, 0, w, h);
  bitmap.close();

  // 逐级降质直到达标
  let blob = await canvasToBlob(canvas, QUALITY_STEPS[0]);
  for (const q of QUALITY_STEPS.slice(1)) {
    if (blob.size <= TARGET_MAX_BYTES) break;
    blob = await canvasToBlob(canvas, q);
  }
  return { blob, url: URL.createObjectURL(blob) };
}

function canvasToBlob(canvas: HTMLCanvasElement, quality: number): Promise<Blob> {
  return new Promise((resolve) => {
    canvas.toBlob(
      (b) => resolve(b ?? new Blob()),
      'image/jpeg',
      quality
    );
  });
}
