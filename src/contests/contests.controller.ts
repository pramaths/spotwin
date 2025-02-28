import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  HttpStatus,
  HttpException,
  Put,
} from '@nestjs/common';
import { ContestsService } from './contests.service';
import { CreateContestDto } from './dtos/create-contest.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { UpdateContestDto } from './dtos/update-contest.dto';

@ApiTags('contests')
@Controller('contests')
export class ContestsController {
  constructor(private readonly contestsService: ContestsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new contest' })
  @ApiBody({ type: CreateContestDto })
  @ApiResponse({ status: 201, description: 'Contest successfully created' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async create(@Body() createContestDto: CreateContestDto) {
    try {
      return await this.contestsService.createContest(
        createContestDto.eventId,
        createContestDto,
      );
    } catch (error) {
      throw new HttpException(
        'Failed to create contest: ' + error,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get()
  @ApiOperation({ summary: 'Get all contests' })
  @ApiResponse({ status: 200, description: 'All contests retrieved' })
  async findAll() {
    return await this.contestsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a contest by ID' })
  @ApiParam({ name: 'id', type: Number, description: 'Contest ID' })
  @ApiResponse({ status: 200, description: 'Contest retrieved' })
  @ApiResponse({ status: 404, description: 'Contest not found' })
  async findOne(@Param('id') id: string) {
    return await this.contestsService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a contest by ID' })
  @ApiParam({ name: 'id', type: Number, description: 'Contest ID' })
  @ApiBody({ type: UpdateContestDto })
  @ApiResponse({ status: 200, description: 'Contest updated' })
  @ApiResponse({ status: 404, description: 'Contest not found' })
  async update(
    @Param('id') id: string,
    @Body() updateContestDto: UpdateContestDto,
  ) {
    return await this.contestsService.update(id, updateContestDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a contest by ID' })
  @ApiParam({ name: 'id', type: Number, description: 'Contest ID' })
  @ApiResponse({ status: 200, description: 'Contest deleted' })
  @ApiResponse({ status: 404, description: 'Contest not found' })
  async remove(@Param('id') id: string) {
    return await this.contestsService.remove(id);
  }
}
