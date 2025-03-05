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
  @ApiOperation({ summary: 'Create a new bet' })
  @ApiBody({ type: CreateBetDto })
  @ApiResponse({ 
    status: 201, 
    description: 'The bet has been successfully created.',
    type: Bet 
  })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  create(@Body() createBetDto: CreateBetDto) {
    return this.betsService.create(createBetDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all bets' })
  @ApiResponse({ 
    status: 200, 
    description: 'Return all bets',
    type: [Bet] 
  })
  findAll() {
    return this.betsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a bet by id' })
  @ApiParam({ name: 'id', description: 'Bet ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'Return the bet with the specified id',
    type: Bet 
  })
  @ApiResponse({ status: 404, description: 'Bet not found.' })
  findOne(@Param('id') id: string) {
    return this.betsService.findOne(id);
  }

  @Get('user-contest/:userContestId')
  @ApiOperation({ summary: 'Get bets by user contest id' })
  @ApiParam({ name: 'userContestId', description: 'User Contest ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'Return the bets for the specified user contest',
    type: [Bet] 
  })
  findByUserContest(@Param('userContestId') userContestId: string) {
    return this.betsService.findByUserContest(userContestId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a bet' })
  @ApiParam({ name: 'id', description: 'Bet ID' })
  @ApiBody({ type: UpdateBetDto })
  @ApiResponse({ 
    status: 200, 
    description: 'The bet has been successfully updated.',
    type: Bet 
  })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiResponse({ status: 404, description: 'Bet not found.' })
  update(@Param('id') id: string, @Body() updateBetDto: UpdateBetDto) {
    return this.betsService.update(id, updateBetDto);
  }

  @Patch(':id/result')
  @ApiOperation({ summary: 'Update bet result' })
  @ApiParam({ name: 'id', description: 'Bet ID' })
  @ApiBody({ 
    schema: {
      type: 'object',
      properties: {
        isCorrect: {
          type: 'boolean',
          description: 'Whether the bet prediction was correct or not'
        }
      }
    }
  })
  @ApiResponse({ 
    status: 200, 
    description: 'The bet result has been successfully updated.',
    type: Bet 
  })
  @ApiResponse({ status: 404, description: 'Bet not found.' })
  updateResult(@Param('id') id: string, @Body('isCorrect') isCorrect: boolean) {
    return this.betsService.updateBetResult(id, isCorrect);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a bet' })
  @ApiParam({ name: 'id', description: 'Bet ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'The bet has been successfully deleted.' 
  })
  @ApiResponse({ status: 404, description: 'Bet not found.' })
  remove(@Param('id') id: string) {
    return this.betsService.remove(id);
  }
}
