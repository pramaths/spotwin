import {
  Injectable,
  InternalServerErrorException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  CreateMultipartUploadCommand,
  UploadPartCommand,
  CompleteMultipartUploadCommand,
  AbortMultipartUploadCommand,
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
  private readonly logger = new Logger(S3Service.name);
  private readonly CHUNK_SIZE = 5 * 1024 * 1024; // 5MB chunk size (AWS minimum)
  private readonly LARGE_FILE_THRESHOLD = 10 * 1024 * 1024; // 10MB threshold

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
    this.logger.log(`Uploading file: ${fileName}, size: ${file.size} bytes`);

    try {
      // Use multipart upload for large files
      if (file.size > this.LARGE_FILE_THRESHOLD) {
        this.logger.log(`Using multipart upload for large file: ${fileName}`);
        return await this.uploadLargeFile(file, fileName);
      }

      // Regular upload for smaller files
      const putCommand = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: fileName,
        Body: file.buffer,
        ContentType: file.mimetype,
        // ACL: 'public-read',
      });

      await this.s3.send(putCommand);
      return `${process.env.AWS_S3_ENDPOINT}/${this.bucketName}/${fileName}`;
    } catch (err) {
      this.logger.error(`Error uploading file: ${err.message}`, err.stack);
      throw new InternalServerErrorException(`Failed to upload file: ${err.message}`);
    }
  }

  /**
   * Uploads large files using multipart upload
   * @param file - The file to upload
   * @param fileName - The name to use for the file in S3
   * @returns The public S3 URL of the uploaded file
   */
  private async uploadLargeFile(
    file: Express.Multer.File,
    fileName: string,
  ): Promise<string> {
    try {
      // Step 1: Initiate multipart upload
      const createCommand = new CreateMultipartUploadCommand({
        Bucket: this.bucketName,
        Key: fileName,
        ContentType: file.mimetype,
      });

      const { UploadId } = await this.s3.send(createCommand);
      
      if (!UploadId) {
        throw new Error('Failed to initiate multipart upload');
      }

      // Step 2: Upload parts
      const parts = [];
      const buffer = file.buffer;
      const numParts = Math.ceil(buffer.length / this.CHUNK_SIZE);
      
      this.logger.log(`Uploading ${numParts} parts for file: ${fileName}`);

      for (let i = 0; i < numParts; i++) {
        const start = i * this.CHUNK_SIZE;
        const end = Math.min(start + this.CHUNK_SIZE, buffer.length);
        const partBuffer = buffer.slice(start, end);
        
        const uploadPartCommand = new UploadPartCommand({
          Bucket: this.bucketName,
          Key: fileName,
          UploadId,
          PartNumber: i + 1,
          Body: partBuffer,
        });

        const { ETag } = await this.s3.send(uploadPartCommand);
        parts.push({ ETag, PartNumber: i + 1 });
        this.logger.log(`Uploaded part ${i + 1}/${numParts} for ${fileName}`);
      }

      // Step 3: Complete multipart upload
      const completeCommand = new CompleteMultipartUploadCommand({
        Bucket: this.bucketName,
        Key: fileName,
        UploadId,
        MultipartUpload: { Parts: parts },
      });

      await this.s3.send(completeCommand);
      this.logger.log(`Completed multipart upload for ${fileName}`);
      
      return `${process.env.AWS_S3_ENDPOINT}/${this.bucketName}/${fileName}`;
    } catch (err) {
      this.logger.error(`Error in multipart upload: ${err.message}`, err.stack);
      throw new InternalServerErrorException(`Failed to upload large file: ${err.message}`);
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
