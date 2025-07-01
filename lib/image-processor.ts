/**
 * 画像処理ユーティリティ
 * Canvas APIを使用した画像のリサイズ・最適化
 */

// Note: In a real implementation, you would use sharp for server-side processing
// import sharp from 'sharp';
// import { promises as fs } from 'fs';
// import path from 'path';

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

export class ImageProcessor {
  private static readonly WATERMARK_FONT_SIZE = 16;
  private static readonly WATERMARK_OPACITY = 0.5;
  private static readonly MAX_IMAGE_SIZE = 2048;
  private static readonly THUMBNAIL_SIZE = 300;

  /**
   * Process an image with various transformations
   */
  static async processImage(
    input: Buffer | string,
    options: ImageProcessingOptions = {}
  ): Promise<ProcessedImage> {
    const {
      width = this.MAX_IMAGE_SIZE,
      height = this.MAX_IMAGE_SIZE,
      quality = 85,
      format = 'jpeg',
      watermark = false,
      watermarkText = 'THE WORLD DOOR',
      backgroundColor = '#ffffff'
    } = options;

    try {
      let pipeline = sharp(input);

      // Get metadata
      const metadata = await pipeline.metadata();

      // Resize image while maintaining aspect ratio
      pipeline = pipeline.resize(width, height, {
        fit: 'inside',
        withoutEnlargement: true,
        background: backgroundColor
      });

      // Add watermark if requested
      if (watermark && watermarkText) {
        const watermarkBuffer = await this.createWatermark(
          watermarkText,
          metadata.width || width,
          metadata.height || height
        );
        
        pipeline = pipeline.composite([
          {
            input: watermarkBuffer,
            gravity: 'southeast',
            blend: 'over'
          }
        ]);
      }

      // Convert to specified format with quality
      switch (format) {
        case 'jpeg':
          pipeline = pipeline.jpeg({ quality, progressive: true });
          break;
        case 'webp':
          pipeline = pipeline.webp({ quality });
          break;
        case 'png':
          pipeline = pipeline.png({ quality, compressionLevel: 9 });
          break;
      }

      // Process the image
      const processedBuffer = await pipeline.toBuffer();
      const processedMetadata = await sharp(processedBuffer).metadata();

      return {
        buffer: processedBuffer,
        format: format,
        width: processedMetadata.width || 0,
        height: processedMetadata.height || 0,
        size: processedBuffer.length
      };
    } catch (error) {
      console.error('Image processing error:', error);
      throw new Error('Failed to process image');
    }
  }

  /**
   * Generate multiple sizes for responsive images
   */
  static async generateResponsiveImages(
    input: Buffer | string,
    sizes: number[] = [300, 600, 1200, 2048]
  ): Promise<Map<number, ProcessedImage>> {
    const results = new Map<number, ProcessedImage>();

    for (const size of sizes) {
      try {
        const processed = await this.processImage(input, {
          width: size,
          height: size,
          format: 'webp',
          quality: 85
        });
        results.set(size, processed);
      } catch (error) {
        console.error(`Failed to generate ${size}px image:`, error);
      }
    }

    return results;
  }

  /**
   * Create thumbnail with specific dimensions
   */
  static async createThumbnail(
    input: Buffer | string,
    width: number = this.THUMBNAIL_SIZE,
    height: number = this.THUMBNAIL_SIZE
  ): Promise<ProcessedImage> {
    return this.processImage(input, {
      width,
      height,
      format: 'jpeg',
      quality: 70
    });
  }

  /**
   * Extract dominant colors from image
   */
  static async extractColors(
    input: Buffer | string,
    count: number = 5
  ): Promise<string[]> {
    try {
      const { dominant } = await sharp(input)
        .resize(100, 100) // Resize for faster processing
        .raw()
        .toBuffer({ resolveWithObject: true });

      // Simple color extraction (in production, use a proper algorithm)
      const colors: Set<string> = new Set();
      const pixelCount = dominant.length / 3;
      const step = Math.floor(pixelCount / count);

      for (let i = 0; i < pixelCount; i += step) {
        const r = dominant[i * 3];
        const g = dominant[i * 3 + 1];
        const b = dominant[i * 3 + 2];
        const hex = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
        colors.add(hex);
      }

      return Array.from(colors).slice(0, count);
    } catch (error) {
      console.error('Color extraction error:', error);
      return [];
    }
  }

  /**
   * Remove image background (simplified version)
   */
  static async removeBackground(
    input: Buffer | string,
    threshold: number = 10
  ): Promise<ProcessedImage> {
    try {
      // This is a simplified version. In production, use AI-based background removal
      const processed = await sharp(input)
        .resize(this.MAX_IMAGE_SIZE, this.MAX_IMAGE_SIZE, {
          fit: 'inside',
          withoutEnlargement: true
        })
        .flatten({ background: '#ffffff' })
        .trim({ threshold })
        .png()
        .toBuffer();

      const metadata = await sharp(processed).metadata();

      return {
        buffer: processed,
        format: 'png',
        width: metadata.width || 0,
        height: metadata.height || 0,
        size: processed.length
      };
    } catch (error) {
      console.error('Background removal error:', error);
      throw new Error('Failed to remove background');
    }
  }

  /**
   * Create watermark SVG
   */
  private static async createWatermark(
    text: string,
    width: number,
    height: number
  ): Promise<Buffer> {
    const svg = `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <text
          x="${width - 10}"
          y="${height - 10}"
          font-family="Arial, sans-serif"
          font-size="${this.WATERMARK_FONT_SIZE}"
          fill="white"
          fill-opacity="${this.WATERMARK_OPACITY}"
          stroke="black"
          stroke-width="1"
          stroke-opacity="${this.WATERMARK_OPACITY * 0.5}"
          text-anchor="end"
        >${text}</text>
      </svg>
    `;

    return Buffer.from(svg);
  }

  /**
   * Validate image file
   */
  static async validateImage(
    input: Buffer | string,
    maxSizeMB: number = 10,
    allowedFormats: string[] = ['jpeg', 'jpg', 'png', 'webp']
  ): Promise<boolean> {
    try {
      const metadata = await sharp(input).metadata();
      
      // Check format
      if (!metadata.format || !allowedFormats.includes(metadata.format)) {
        throw new Error(`Invalid format: ${metadata.format}`);
      }

      // Check size
      const buffer = typeof input === 'string' 
        ? await fs.readFile(input)
        : input;
      
      const sizeMB = buffer.length / (1024 * 1024);
      if (sizeMB > maxSizeMB) {
        throw new Error(`File too large: ${sizeMB.toFixed(2)}MB (max: ${maxSizeMB}MB)`);
      }

      // Check dimensions
      if (!metadata.width || !metadata.height) {
        throw new Error('Invalid image dimensions');
      }

      return true;
    } catch (error) {
      console.error('Image validation error:', error);
      return false;
    }
  }

  /**
   * Batch process multiple images
   */
  static async batchProcess(
    inputs: Array<Buffer | string>,
    options: ImageProcessingOptions = {}
  ): Promise<ProcessedImage[]> {
    const results: ProcessedImage[] = [];

    for (const input of inputs) {
      try {
        const processed = await this.processImage(input, options);
        results.push(processed);
      } catch (error) {
        console.error('Batch processing error:', error);
      }
    }

    return results;
  }
} 