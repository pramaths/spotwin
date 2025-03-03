import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Patch,
  HttpStatus,
  HttpException,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { SportsService } from './sports.service';
import { CreateSportDto } from './dtos/create-sport.dto';
import { UpdateSportDto } from './dtos/update-sport.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiConsumes,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';

@ApiTags('sports')
@Controller('sports')
export class SportsController {
  constructor(private readonly sportsService: SportsService) {}

  @Post()
  @UseInterceptors(FileInterceptor('image'))
  @ApiOperation({ summary: 'Create a new sport' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'Cricket' },
        description: {
          type: 'string',
          example: 'A team sport played with a ball',
        },
        image: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Sport successfully created' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async create(
    @Body() createSportDto: CreateSportDto,
    @UploadedFile() imageFile: Express.Multer.File,
  ) {
    try {
      return await this.sportsService.create(createSportDto, imageFile);
    } catch (error) {
      if (error.code === '23505') {
        throw new HttpException(
          'Sport with this name already exists',
          HttpStatus.BAD_REQUEST,
        );
      }
      throw new HttpException(
        'Failed to create sport',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get()
  @ApiOperation({ summary: 'Get all sports' })
  @ApiResponse({ status: 200, description: 'Return all sports' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async findAll() {
    try {
      return await this.sportsService.findAll();
    } catch (error) {
      throw new HttpException(
        'Failed to fetch sports: ' + error,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a sport by id' })
  @ApiParam({
    name: 'id',
    description: 'Sport ID',
    example: '3dc44aff-9748-44fc-aa74-1379213a4363',
  })
  @ApiResponse({ status: 200, description: 'Return the sport' })
  @ApiResponse({ status: 404, description: 'Sport not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async findOne(@Param('id') id: string) {
    try {
      const sport = await this.sportsService.findOne(id);
      if (!sport) {
        throw new HttpException('Sport not found', HttpStatus.NOT_FOUND);
      }
      return sport;
    } catch (error) {
      if (error.status === HttpStatus.NOT_FOUND) {
        throw error;
      }
      throw new HttpException(
        'Failed to fetch sport',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Patch(':id')
  @UseInterceptors(FileInterceptor('image'))
  @ApiOperation({ summary: 'Update a sport' })
  @ApiConsumes('multipart/form-data')
  @ApiParam({
    name: 'id',
    description: 'Sport ID',
    example: '3dc44aff-9748-44fc-aa74-1379213a4363',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'Cricket' },
        description: {
          type: 'string',
          example: 'A team sport played with a ball',
        },
        image: {
          type: 'string',
          format: 'binary',
        },
      },
      required: [],
    },
  })
  @ApiResponse({ status: 200, description: 'Sport successfully updated' })
  @ApiResponse({ status: 404, description: 'Sport not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async update(
    @Param('id') id: string,
    @Body() updateSportDto: UpdateSportDto,
    @UploadedFile() imageFile?: Express.Multer.File,
  ) {
    try {
      const sport = await this.sportsService.update(
        id,
        updateSportDto,
        imageFile,
      );
      if (!sport) {
        throw new HttpException('Sport not found', HttpStatus.NOT_FOUND);
      }
      return sport;
    } catch (error) {
      if (error.status === HttpStatus.NOT_FOUND) {
        throw error;
      }
      throw new HttpException(
        'Failed to update sport: ' + error.message,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a sport' })
  @ApiParam({ name: 'id', description: 'Sport ID' })
  @ApiResponse({ status: 200, description: 'Sport successfully deleted' })
  @ApiResponse({ status: 404, description: 'Sport not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async remove(@Param('id') id: string) {
    try {
      const result = await this.sportsService.remove(id);
      if (!result) {
        throw new HttpException('Sport not found', HttpStatus.NOT_FOUND);
      }
      return result;
    } catch (error) {
      if (error.status === HttpStatus.NOT_FOUND) {
        throw error;
      }
      throw new HttpException(
        'Failed to delete sport',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
