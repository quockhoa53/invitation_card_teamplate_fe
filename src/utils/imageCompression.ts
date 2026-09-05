/**
 * Client-side Image Compression Utility
 * Nén ảnh trực tiếp trên trình duyệt bằng Canvas sang WebP Base64 (Data URI)
 * - 100% riêng tư: Ảnh không bao giờ gửi tới bất kỳ máy chủ bên thứ ba nào
 * - Siêu nhẹ: Giảm dung lượng 90-98% (từ 5-10MB xuống còn 40-90KB)
 * - Sắc nét Retina: Tối ưu độ phân giải hiển thị trên mọi thiết bị
 */

export interface CompressResult {
  dataUri: string;
  originalSize: number;
  compressedSize: number;
  reductionPercentage: number;
  width: number;
  height: number;
  mimeType: string;
}

export interface CompressOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0.1 to 1.0 (default 0.82)
}

export function formatBytes(bytes: number, decimals: number = 1): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export function compressImageToWebp(
  file: File,
  options: CompressOptions = {}
): Promise<CompressResult> {
  const { maxWidth = 1000, maxHeight = 1000, quality = 0.82 } = options;

  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      return reject(new Error('Tệp đã chọn không phải là hình ảnh hợp lệ'));
    }

    const reader = new FileReader();

    reader.onerror = () => {
      reject(new Error('Không thể đọc tệp ảnh'));
    };

    reader.onload = (e) => {
      const img = new window.Image();

      img.onerror = () => {
        reject(new Error('Không thể tải dữ liệu ảnh'));
      };

      img.onload = () => {
        try {
          let { width, height } = img;

          // Calculate aspect ratio scale
          if (width > maxWidth || height > maxHeight) {
            const widthRatio = maxWidth / width;
            const heightRatio = maxHeight / height;
            const bestRatio = Math.min(widthRatio, heightRatio);

            width = Math.round(width * bestRatio);
            height = Math.round(height * bestRatio);
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d', { alpha: true });
          if (!ctx) {
            return reject(new Error('Không thể khởi tạo Canvas 2D'));
          }

          // Enable smooth scaling
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';

          // Draw image to canvas
          ctx.drawImage(img, 0, 0, width, height);

          // Try exporting to WebP first
          let mimeType = 'image/webp';
          let dataUri = canvas.toDataURL('image/webp', quality);

          // If browser doesn't support WebP export (returns png), fallback to JPEG
          if (!dataUri.startsWith('data:image/webp')) {
            mimeType = 'image/jpeg';
            dataUri = canvas.toDataURL('image/jpeg', quality);
          }

          // Calculate approximate byte size of base64
          const base64Data = dataUri.split(',')[1] || '';
          const compressedSize = Math.round((base64Data.length * 3) / 4);
          const originalSize = file.size;

          const reductionPercentage = Math.max(
            0,
            Math.round(((originalSize - compressedSize) / originalSize) * 100)
          );

          resolve({
            dataUri,
            originalSize,
            compressedSize,
            reductionPercentage,
            width,
            height,
            mimeType,
          });
        } catch (err) {
          reject(err);
        }
      };

      img.src = e.target?.result as string;
    };

    reader.readAsDataURL(file);
  });
}
