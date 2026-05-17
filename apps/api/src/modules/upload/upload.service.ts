import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';

export interface UploadResult {
  url: string;
  publicId: string;
  width?: number;
  height?: number;
  format?: string;
  bytes?: number;
}

@Injectable()
export class UploadService {
  private readonly logger = new Logger(UploadService.name);
  private configured = false;

  constructor(private readonly config: ConfigService) {
    const cloudName = config.get<string>('cloudinary.cloudName');
    const apiKey = config.get<string>('cloudinary.apiKey');
    const apiSecret = config.get<string>('cloudinary.apiSecret');

    if (cloudName && apiKey && apiSecret && !cloudName.startsWith('your_')) {
      cloudinary.config({
        cloud_name: cloudName,
        api_key: apiKey,
        api_secret: apiSecret,
      });
      this.configured = true;
      this.logger.log('☁️  Cloudinary configured');
    } else {
      this.logger.warn(
        '☁️  Cloudinary credentials not set — uploads will return a placeholder URL',
      );
    }
  }

  async uploadFromUrl(
    remoteUrl: string,
    folder = 'pizza-height',
  ): Promise<UploadResult> {
    if (!this.configured) {
      return { url: remoteUrl, publicId: 'mock:' + Date.now() };
    }
    const result = await cloudinary.uploader.upload(remoteUrl, {
      folder,
      resource_type: 'image',
    });
    return {
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format,
      bytes: result.bytes,
    };
  }

  async uploadBuffer(
    buffer: Buffer,
    folder = 'pizza-height',
  ): Promise<UploadResult> {
    if (!this.configured) {
      const dataUri = `data:image/jpeg;base64,${buffer.toString('base64').slice(0, 60)}...`;
      return { url: dataUri, publicId: 'mock:' + Date.now() };
    }
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder, resource_type: 'image' },
        (err, result) => {
          if (err || !result) {
            return reject(
              err instanceof Error ? err : new Error('Upload failed'),
            );
          }
          resolve({
            url: result.secure_url,
            publicId: result.public_id,
            width: result.width,
            height: result.height,
            format: result.format,
            bytes: result.bytes,
          });
        },
      );
      stream.end(buffer);
    });
  }
}
