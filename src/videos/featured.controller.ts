import { Controller, Get, Post, Delete, Param, HttpException, HttpStatus, Body } from '@nestjs/common';
import { FeaturedService } from './featured.service';
import { ApiTags, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { FeaturedVideo } from './entities/featured-video.entity';
import { CreateFeaturedVideoDto } from './dto/create-featured-video.dto';

@ApiTags('featured-videos')
@Controller('featured')
export class FeaturedController {
  constructor(private readonly featuredService: FeaturedService) {}

  @Post()
  @ApiOperation({ summary: 'Feature a video for a contest' })
  @ApiResponse({ 
    status: 201, 
    description: 'The video has been successfully featured.',
    type: FeaturedVideo
  })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiResponse({ status: 404, description: 'Video submission not found.' })
  async featureVideo(@Body() createFeaturedVideoDto: CreateFeaturedVideoDto) {
    try {
      const featuredVideo = await this.featuredService.featureVideo(createFeaturedVideoDto);
      if (!featuredVideo) {
        throw new HttpException('Failed to feature video', HttpStatus.BAD_REQUEST);
      }
      return featuredVideo;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        error.message || 'Failed to feature video',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Unfeature a video' })
  @ApiParam({ name: 'id', description: 'Featured Video ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'The video has been successfully unfeatured.' 
  })
  @ApiResponse({ status: 404, description: 'Featured video not found.' })
  async unfeaturedVideo(@Param('id') id: string) {
    try {
      await this.featuredService.unfeaturedVideo(id);
      return { message: 'Video successfully unfeatured' };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        error.message || 'Failed to unfeature video',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get()
  @ApiOperation({ summary: 'Get all featured videos' })
  @ApiResponse({ 
    status: 200, 
    description: 'Return all featured videos',
    type: [FeaturedVideo]
  })
  async getAllFeatured() {
    try {
      return await this.featuredService.getAllFeatured();
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to retrieve featured videos',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('contest/:contestId')
  @ApiOperation({ summary: 'Get all featured videos for a specific contest' })
  @ApiParam({ name: 'contestId', description: 'Contest ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'Return all featured videos for the contest',
    type: [FeaturedVideo]
  })
  async getFeaturedByContest(@Param('contestId') contestId: string) {
    try {
      return await this.featuredService.getFeaturedByContest(contestId);
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to retrieve featured videos for the contest',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
