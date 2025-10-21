// moved to archive (not used)

interface ImageProcessingOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'jpeg' | 'webp' | 'png';
  watermark?: boolean;
  watermarkText?: string;
  backgroundColor?: string;
}

interface ProcessedImage {
  buffer: Buffer;
  format: string;
  width: number;
  height: number;
  size: number;
}

export class ImageProcessor {}