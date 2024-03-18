import { S3Client } from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import multerS3 from 'multer-s3';
import { basename, extname } from 'path';

export const multerOptionsFactory = (configService: ConfigService): MulterOptions => {
  return {
    storage: multerS3({
      s3: new S3Client({
        region: configService.get('REGION'),
        credentials: {
          accessKeyId: configService.get('ACCESS_KEY'),
          secretAccessKey: configService.get('SECRET_ACCESS_KEY'),
        },
      }),
      bucket: configService.get('BUCKET_NAME'),
      //acl: 'public-read',
      contentType: multerS3.AUTO_CONTENT_TYPE,
      metadata(req, file, callback) {
        callback(null, { owner: 'it' });
      },
      key(req, file, callback) {
        const ext = extname(file.originalname); // 확장자
        const baseName = basename(file.originalname, ext); // 확장자 제외
        // 파일이름-날짜.확장자
        const fileName = `${baseName}-${Date.now()}${ext}`;
        callback(null, fileName);
      },
    }),
    // 파일 크기 제한
    limits: {
      fileSize: 10 * 1024 * 1024,
    },
  };
};
