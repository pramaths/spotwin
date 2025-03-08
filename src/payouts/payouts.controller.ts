import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { PayoutsService } from './payouts.service';
import { CreatePayoutDto } from './dto/create-payout.dto';
import { UpdatePayoutDto } from './dto/update-payout.dto';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiBody,
  ApiResponse,
} from '@nestjs/swagger';
import { Payout } from './entities/payout.entity';

@ApiTags('payouts')
@Controller('payouts')
export class PayoutsController {
  constructor(private readonly payoutsService: PayoutsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new payout' })
  @ApiBody({ type: CreatePayoutDto })
  @ApiResponse({
    status: 201,
    description: 'The payout has been successfully created.',
    type: Payout,
  })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  async create(@Body() createPayoutDto: CreatePayoutDto) {
    try {
      const payout = await this.payoutsService.create(createPayoutDto);
      return payout;
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to create payout',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get()
  @ApiOperation({ summary: 'Get all payouts' })
  @ApiResponse({
    status: 200,
    description: 'Return all payouts',
    type: [Payout],
  })
  async findAll() {
    try {
      return await this.payoutsService.findAll();
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to retrieve payouts',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a payout by ID' })
  @ApiParam({ name: 'id', description: 'Payout ID' })
  @ApiResponse({
    status: 200,
    description: 'Return the payout with the specified ID',
    type: Payout,
  })
  @ApiResponse({ status: 404, description: 'Payout not found.' })
  async findOne(@Param('id') id: string) {
    try {
      return await this.payoutsService.findOne(id);
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to retrieve payout',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get payouts for a specific user' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiResponse({
    status: 200,
    description: 'Return payouts for the specified user',
    type: [Payout],
  })
  @ApiResponse({ status: 404, description: 'No payouts found for user.' })
  async findByUser(@Param('userId') userId: string) {
    try {
      return await this.payoutsService.findByUser(userId);
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to retrieve payouts for user',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('contest/:contestId')
  @ApiOperation({ summary: 'Get payouts for a specific contest' })
  @ApiParam({ name: 'contestId', description: 'Contest ID' })
  @ApiResponse({
    status: 200,
    description: 'Return payouts for the specified contest',
    type: [Payout],
  })
  @ApiResponse({ status: 404, description: 'No payouts found for contest.' })
  async findByContest(@Param('contestId') contestId: string) {
    try {
      return await this.payoutsService.findByContest(contestId);
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to retrieve payouts for contest',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a payout' })
  @ApiParam({ name: 'id', description: 'Payout ID' })
  @ApiBody({ type: UpdatePayoutDto })
  @ApiResponse({
    status: 200,
    description: 'The payout has been successfully updated.',
    type: Payout,
  })
  @ApiResponse({ status: 404, description: 'Payout not found.' })
  async update(
    @Param('id') id: string,
    @Body() updatePayoutDto: UpdatePayoutDto,
  ) {
    try {
      return await this.payoutsService.update(id, updatePayoutDto);
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to update payout',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a payout' })
  @ApiParam({ name: 'id', description: 'Payout ID' })
  @ApiResponse({
    status: 200,
    description: 'The payout has been successfully deleted.',
  })
  @ApiResponse({ status: 404, description: 'Payout not found.' })
  async remove(@Param('id') id: string) {
    try {
      await this.payoutsService.remove(id);
      return { message: 'Payout successfully deleted' };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to delete payout',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
