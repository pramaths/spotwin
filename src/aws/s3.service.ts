import {
  Injectable,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';
import configuration from '../config/configuration';
import { s3Config } from '../config/aws.config';

@Injectable()
export class S3Service {
  private readonly s3: S3Client;
  private readonly bucketName: string;
  private readonly region: string;

  constructor() {
    const config = configuration();
    this.s3 = new S3Client(s3Config());
    this.bucketName = config.aws.bucketName;
    this.region = config.aws.region;
  }

  /**
   * Uploads file to S3 with a unique filename, validates MIME.
   * @param file - A Multer file from @UploadedFile() or similar
   * @returns The public S3 URL of the uploaded file
   */
  async uploadFile(file: Express.Multer.File): Promise<string> {
    if (
      !file.mimetype.startsWith('image/') &&
      !file.mimetype.startsWith('video/')
    ) {
      throw new BadRequestException(
        'Invalid file type, Only Images and videos are allowed',
      );
    }

    const fileName = `${uuidv4()}-${file.originalname}`;
    console.log('Uploading file:', fileName);
    const putCommand = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: fileName,
      Body: file.buffer,
      ContentType: file.mimetype,
      // ACL: 'public-read',
    });

    try {
      await this.s3.send(putCommand);
      return `${process.env.AWS_S3_ENDPOINT}/${this.bucketName}/${fileName}`;
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }

  /**
   * Deletes an object from S3 by its key (file path).
   * @param fileKey - e.g., "markets/xxxxx-image.jpg"
   */
  async deleteFile(fileKey: string): Promise<void> {
    const deleteCommand = new DeleteObjectCommand({
      Bucket: this.bucketName,
      Key: fileKey,
    });
    try {
      await this.s3.send(deleteCommand);
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  /**
   * Creates a presigned URL for GET (viewing/downloading) a private file.
   * @param key - e.g. "markets/uuid-file.jpg"
   * @param expiresInSeconds - optional, e.g. 3600 (1 hour)
   */
  async getPresignedUrl(key: string, expiresInSeconds = 3600): Promise<string> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      // Create a presigned URL valid for 'expiresInSeconds'
      const url = await getSignedUrl(this.s3, command, {
        expiresIn: expiresInSeconds,
      });

      return url;
    } catch (err) {
      throw new InternalServerErrorException(
        `Failed to create presigned URL: ${err.message}`,
      );
    }
  }
}
