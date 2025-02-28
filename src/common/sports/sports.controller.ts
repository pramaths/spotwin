import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  HttpStatus,
  HttpException,
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
} from '@nestjs/swagger';

@ApiTags('sports')
@Controller('sports')
export class SportsController {
  constructor(private readonly sportsService: SportsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new sport' })
  @ApiBody({ type: CreateSportDto })
  @ApiResponse({ status: 201, description: 'Sport successfully created' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async create(@Body() createSportDto: CreateSportDto) {
    try {
      return await this.sportsService.create(createSportDto);
    } catch (error) {
      if (error.code === '23505') {
        // PostgreSQL unique violation code
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
  @ApiParam({ name: 'id', description: 'Sport ID' })
  @ApiResponse({ status: 200, description: 'Return the sport' })
  @ApiResponse({ status: 404, description: 'Sport not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async findOne(@Param('id') id: string) {
    try {
      const sport = await this.sportsService.findOne(+id);
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

  @Put(':id')
  @ApiOperation({ summary: 'Update a sport' })
  @ApiParam({ name: 'id', description: 'Sport ID' })
  @ApiBody({ type: UpdateSportDto })
  @ApiResponse({ status: 200, description: 'Sport successfully updated' })
  @ApiResponse({ status: 404, description: 'Sport not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async update(
    @Param('id') id: string,
    @Body() updateSportDto: UpdateSportDto,
  ) {
    try {
      const sport = await this.sportsService.update(+id, updateSportDto);
      if (!sport) {
        throw new HttpException('Sport not found', HttpStatus.NOT_FOUND);
      }
      return sport;
    } catch (error) {
      if (error.status === HttpStatus.NOT_FOUND) {
        throw error;
      }
      throw new HttpException(
        'Failed to update sport',
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
      const result = await this.sportsService.remove(+id);
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
