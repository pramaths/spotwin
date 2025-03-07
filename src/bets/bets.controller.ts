import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { BetsService } from './bets.service';
import { CreateBetDto } from './dto/create-bet.dto';
import { UpdateBetDto } from './dto/update-bet.dto';
import { ApiTags, ApiOperation, ApiParam, ApiBody, ApiResponse } from '@nestjs/swagger';
import { Bet } from './entities/bets.entity';

@ApiTags('bets')
@Controller('bets')
export class BetsController {
  constructor(private readonly betsService: BetsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new contest entry' })
  @ApiBody({ type: CreateBetDto })
  @ApiResponse({
    status: 201,
    description: 'The contest entry has been successfully created.',
    type: Bet,
  })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  create(@Body() createBetDto: CreateBetDto) {
    return this.betsService.create(createBetDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all contest entries' })
  @ApiResponse({
    status: 200,
    description: 'Return all contest entries',
    type: [Bet],
  })
  findAll() {
    return this.betsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a contest entry by id' })
  @ApiParam({ name: 'id', description: 'Bet ID' })
  @ApiResponse({
    status: 200,
    description: 'Return the contest entry with the specified id',
    type: Bet,
  })
  @ApiResponse({ status: 404, description: 'Contest entry not found.' })
  findOne(@Param('id') id: string) {
    return this.betsService.findOne(id);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get all contest entries for a specific user' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiResponse({
    status: 200,
    description: 'Return the contest entries for the specified user',
    type: [Bet],
  })
  findByUser(@Param('userId') userId: string) {
    return this.betsService.findByUser(userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a contest entry' })
  @ApiParam({ name: 'id', description: 'Bet ID' })
  @ApiBody({ type: UpdateBetDto })
  @ApiResponse({
    status: 200,
    description: 'The contest entry has been successfully updated.',
    type: Bet,
  })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiResponse({ status: 404, description: 'Contest entry not found.' })
  update(@Param('id') id: string, @Body() updateBetDto: UpdateBetDto) {
    return this.betsService.update(id, updateBetDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a contest entry' })
  @ApiParam({ name: 'id', description: 'Bet ID' })
  @ApiResponse({
    status: 200,
    description: 'The contest entry has been successfully deleted.',
  })
  @ApiResponse({ status: 404, description: 'Contest entry not found.' })
  remove(@Param('id') id: string) {
    return this.betsService.remove(id);
  }
}
