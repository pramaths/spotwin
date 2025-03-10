import { Injectable, Logger } from '@nestjs/common';
import * as ffmpeg from 'fluent-ffmpeg';
import * as ffmpegStatic from 'ffmpeg-static';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { S3Service } from './s3.service';

@Injectable()
export class VideoService {
  private readonly logger = new Logger(VideoService.name);

  constructor(private readonly s3Service: S3Service) {
    ffmpeg.setFfmpegPath(ffmpegStatic);
  }

  /**
   * Extracts a thumbnail from a video file and uploads it to S3
   * 
   * @param videoFile The video file to extract the thumbnail from
   * @param timestamp The timestamp (in seconds) to extract the thumbnail from (defaults to 1 second)
   * @returns The URL of the uploaded thumbnail
   */
  async extractThumbnail(
    videoFile: Express.Multer.File,
    timestamp: number = 1
  ): Promise<string> {
    this.logger.log(`Extracting thumbnail from video at timestamp: ${timestamp}s`);
    
    // Create a temporary file for the video
    const tempDir = os.tmpdir();
    const videoId = uuidv4();
    const videoPath = path.join(tempDir, `${videoId}-video.mp4`);
    const thumbnailPath = path.join(tempDir, `${videoId}-thumbnail.jpg`);
    
    // Write the video buffer to a temporary file
    await fs.promises.writeFile(videoPath, videoFile.buffer);
    
    // Extract a frame as thumbnail using ffmpeg
    return new Promise((resolve, reject) => {
      ffmpeg(videoPath)
        .screenshots({
          timestamps: [timestamp],
          filename: `${videoId}-thumbnail.jpg`,
          folder: tempDir,
          size: '640x360' // Reasonable size for thumbnails
        })
        .on('end', async () => {
          try {
            // Read the thumbnail file
            const thumbnailBuffer = await fs.promises.readFile(thumbnailPath);
            
            // Create a File object for S3 upload
            const thumbnailFile: Express.Multer.File = {
              buffer: thumbnailBuffer,
              originalname: `${videoId}-thumbnail.jpg`,
              mimetype: 'image/jpeg',
              fieldname: 'thumbnail',
              encoding: '7bit',
              size: thumbnailBuffer.length
            } as Express.Multer.File;
            
            // Upload to S3
            const thumbnailUrl = await this.s3Service.uploadFile(thumbnailFile);
            
            // Clean up temporary files
            await fs.promises.unlink(videoPath);
            await fs.promises.unlink(thumbnailPath);
            
            resolve(thumbnailUrl);
          } catch (error) {
            reject(error);
          }
        })
        .on('error', (err) => {
          this.logger.error('Error extracting thumbnail:', err);
          // Cleanup on error
          fs.promises.unlink(videoPath).catch(() => {});
          fs.promises.unlink(thumbnailPath).catch(() => {});
          reject(err);
        });
    });
  }
} 