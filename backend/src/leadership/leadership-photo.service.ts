import {
  BadRequestException,
  Injectable,
} from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';

@Injectable()
export class LeadershipPhotoService {
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

  async upload(
    assignmentId: string,
    file: Express.Multer.File,
  ) {
    if (!file?.buffer?.length) {
      throw new BadRequestException(
        'Leader photo is required',
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

    return new Promise<string>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          resource_type: 'image',
          folder: 'clgf/leadership',
          public_id: assignmentId,
          overwrite: true,
          invalidate: true,
        },
        (error, result) => {
          if (error || !result?.secure_url) {
            reject(
              new BadRequestException(
                'Unable to upload leader photo',
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

  async remove(assignmentId: string) {
    await cloudinary.uploader.destroy(
      `clgf/leadership/${assignmentId}`,
      {
        resource_type: 'image',
        invalidate: true,
      },
    );
  }
}
