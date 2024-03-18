import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { v4 } from 'uuid';
import { Upload } from '@aws-sdk/lib-storage';

@Injectable()
export class AwsService {
  s3Client: S3Client;

  constructor(private configService: ConfigService) {
    // AWS S3 클라이언트 초기화. 환경 설정 정보를 사용하여 AWS 리전, Access Key, Secret Key를 설정.
    this.s3Client = new S3Client({
      region: process.env.REGION, // AWS Region
      credentials: {
        accessKeyId: process.env.ACCESS_KEY, // Access Key
        secretAccessKey: process.env.SECRET_ACCESS_KEY, // Secret Key
      },
    });
  }

  async imageUploadToS3(
    fileName: string, // 업로드될 파일의 이름
    file: Express.Multer.File, // 업로드할 파일
    ext: string, // 파일 확장자
  ) {
    // AWS S3에 이미지 업로드 명령을 생성합니다. 파일 이름, 파일 버퍼, 파일 접근 권한, 파일 타입 등을 설정합니다.

    const command = new PutObjectCommand({
      Bucket: process.env.BUCKET_NAME,
      Key: fileName,
      Body: file.buffer,
      ContentType: `image/${ext}`,
    });

    await this.s3Client.send(command);
    // 업로드된 이미지의 URL을 반환합니다.
    return `https://s3.${process.env.REGION}.amazonaws.com/${process.env.BUCKET_NAME}/${fileName}`;
  }
  getUUID() {
    return v4();
  }
}
