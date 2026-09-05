import {
  BadRequestException,
  Injectable,
} from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';

@Injectable()
export class SermonMediaService {
  constructor() {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
      throw new Error(
        'Cloudinary environment variables are not configured',
      );
    }

    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
      secure: true,
    });
  }

  private uploadBuffer(
    file: Express.Multer.File,
    options: {
      resourceType: 'video' | 'raw';
      folder: string;
      publicId: string;
    },
  ) {
    return new Promise<string>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          resource_type: options.resourceType,
          folder: options.folder,
          public_id: options.publicId,
          overwrite: true,
          invalidate: true,
        },
        (error, result) => {
          if (error || !result?.secure_url) {
            reject(
              new BadRequestException(
                'Unable to upload sermon resource',
              ),
            );
            return;
          }

          resolve(result.secure_url);
        },
      );

      stream.end(file.buffer);
    });
  }

  async uploadVideo(
    sermonId: string,
    file: Express.Multer.File,
  ) {
    if (!file?.buffer?.length) {
      throw new BadRequestException(
        'Video file is required',
      );
    }

    const allowedTypes = new Set([
      'video/mp4',
      'video/webm',
      'video/quicktime',
    ]);

    if (!allowedTypes.has(file.mimetype)) {
      throw new BadRequestException(
        'Video must be MP4, WebM or MOV',
      );
    }

    return this.uploadBuffer(file, {
      resourceType: 'video',
      folder: 'clgf/sermons/video',
      publicId: sermonId,
    });
  }

  async uploadAudio(
    sermonId: string,
    file: Express.Multer.File,
  ) {
    if (!file?.buffer?.length) {
      throw new BadRequestException(
        'Audio file is required',
      );
    }

    const allowedTypes = new Set([
      'audio/mpeg',
      'audio/mp4',
      'audio/x-m4a',
      'audio/wav',
      'audio/x-wav',
      'audio/ogg',
    ]);

    if (!allowedTypes.has(file.mimetype)) {
      throw new BadRequestException(
        'Audio must be MP3, M4A, WAV or OGG',
      );
    }

    return this.uploadBuffer(file, {
      resourceType: 'video',
      folder: 'clgf/sermons/audio',
      publicId: sermonId,
    });
  }

  async uploadNotes(
    sermonId: string,
    file: Express.Multer.File,
  ) {
    if (!file?.buffer?.length) {
      throw new BadRequestException(
        'PDF notes file is required',
      );
    }

    if (file.mimetype !== 'application/pdf') {
      throw new BadRequestException(
        'Sermon notes must be a PDF file',
      );
    }

    return this.uploadBuffer(file, {
      resourceType: 'raw',
      folder: 'clgf/sermons/notes',
      publicId: `${sermonId}.pdf`,
    });
  }

  async removeVideo(sermonId: string) {
    await cloudinary.uploader.destroy(
      `clgf/sermons/video/${sermonId}`,
      {
        resource_type: 'video',
        invalidate: true,
      },
    );
  }

  async removeAudio(sermonId: string) {
    await cloudinary.uploader.destroy(
      `clgf/sermons/audio/${sermonId}`,
      {
        resource_type: 'video',
        invalidate: true,
      },
    );
  }

  async removeNotes(sermonId: string) {
    await cloudinary.uploader.destroy(
      `clgf/sermons/notes/${sermonId}.pdf`,
      {
        resource_type: 'raw',
        invalidate: true,
      },
    );
  }
}
