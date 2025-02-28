import { Controller, Get, Post, Delete, Param } from '@nestjs/common';
import { FeaturedService } from './featured.service';

@Controller('featured')
export class FeaturedController {
  constructor(private readonly featuredService: FeaturedService) {}

  @Post(':submissionId')
  featureVideo(@Param('submissionId') submissionId: string) {
    return this.featuredService.featureVideo(submissionId);
  }

  @Delete(':id')
  unfeaturedVideo(@Param('id') id: string) {
    return this.featuredService.unfeaturedVideo(id);
  }

  @Get()
  getAllFeatured() {
    return this.featuredService.getAllFeatured();
  }
}
