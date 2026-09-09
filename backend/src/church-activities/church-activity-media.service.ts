import {
  BadRequestException,
  Injectable,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { v2 as cloudinary } from 'cloudinary';

@Injectable()
export class ChurchActivityMediaService {
  constructor() {
    const cloudName =
      process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey =
      process.env.CLOUDINARY_API_KEY;
    const apiSecret =
      process.env.CLOUDINARY_API_SECRET;

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
      resourceType: 'image' | 'video';
      folder: string;
      publicId: string;
    },
  ) {
    return new Promise<{
      url: string;
      publicId: string;
    }>((resolve, reject) => {
      const stream =
        cloudinary.uploader.upload_stream(
          {
            resource_type:
              options.resourceType,
            folder: options.folder,
            public_id: options.publicId,
            overwrite: false,
          },
          (error, result) => {
            if (
              error ||
              !result?.secure_url ||
              !result?.public_id
            ) {
              reject(
                new BadRequestException(
                  'Unable to upload activity media',
                ),
              );
              return;
            }

            resolve({
              url: result.secure_url,
              publicId: result.public_id,
            });
          },
        );

      stream.end(file.buffer);
    });
  }

  async uploadPhoto(
    activityId: string,
    file: Express.Multer.File,
  ) {
    if (!file?.buffer?.length) {
      throw new BadRequestException(
        'Activity photo is required',
      );
    }

    const allowedTypes = new Set([
      'image/jpeg',
      'image/png',
      'image/webp',
    ]);

    if (!allowedTypes.has(file.mimetype)) {
      throw new BadRequestException(
        'Photo must be JPG, PNG or WebP',
      );
    }

    return this.uploadBuffer(file, {
      resourceType: 'image',
      folder:
        `clgf/activities/${activityId}/photos`,
      publicId: randomUUID(),
    });
  }

  async uploadVideo(
    activityId: string,
    file: Express.Multer.File,
  ) {
    if (!file?.buffer?.length) {
      throw new BadRequestException(
        'Activity video is required',
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
      folder:
        `clgf/activities/${activityId}/videos`,
      publicId: randomUUID(),
    });
  }

  async remove(
    publicId: string,
    mediaType: 'PHOTO' | 'VIDEO',
  ) {
    await cloudinary.uploader.destroy(
      publicId,
      {
        resource_type:
          mediaType === 'PHOTO'
            ? 'image'
            : 'video',
        invalidate: true,
      },
    );
  }
}
