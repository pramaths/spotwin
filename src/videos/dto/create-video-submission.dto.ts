export class CreateVideoSubmissionDto {
  title: string;
  description: string;
  videoFile: Express.Multer.File;
  thumbnailFile: Express.Multer.File;
  userId: string;
}
