import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpException,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { PredictionsService } from './predictions.service';
import { CreatePredictionDto } from './dto/create-prediction.dto';
import { UpdatePredictionDto } from './dto/update-prediction.dto';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiBody,
  ApiResponse,
} from '@nestjs/swagger';
import { Prediction } from './entities/prediction.entity';

@ApiTags('predictions')
@Controller('predictions')
export class PredictionsController {
  constructor(private readonly predictionsService: PredictionsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new prediction' })
  @ApiBody({ type: CreatePredictionDto })
  @ApiResponse({
    status: 201,
    description: 'The prediction has been successfully created.',
    type: Prediction,
  })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  async create(@Body() createPredictionDto: CreatePredictionDto) {
    try {
      return await this.predictionsService.create(createPredictionDto);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Get()
  @ApiOperation({ summary: 'Get all predictions' })
  @ApiResponse({
    status: 200,
    description: 'Return all predictions',
    type: [Prediction],
  })
  async findAll() {
    return await this.predictionsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a prediction by id' })
  @ApiParam({ name: 'id', description: 'Prediction ID' })
  @ApiResponse({
    status: 200,
    description: 'Return the prediction with the specified id',
    type: Prediction,
  })
  @ApiResponse({ status: 404, description: 'Prediction not found.' })
  async findOne(@Param('id') id: string) {
    return await this.predictionsService.findOne(id);
  }

  @Get('contest/:contestId')
  @ApiOperation({ summary: 'Get predictions by user contest id' })
  @ApiParam({ name: 'contestId', description: 'User Contest ID' })
  @ApiResponse({
    status: 200,
    description: 'Return the predictions for the specified user contest',
    type: [Prediction],
  })
  async findByUserContest(@Param('contestId') contestId: string) {
    return await this.predictionsService.findByContest(contestId);
  }

  @Get(':contestId/user/:userId')
  @ApiOperation({ summary: 'Get predictions by user contest id and user id' })
  @ApiParam({ name: 'contestId', description: 'User Contest ID' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  async findByUserContestAndUser(@Param('contestId') contestId: string, @Param('userId') userId: string) {
    return await this.predictionsService.findByContestAndUser(contestId, userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a prediction' })
  @ApiParam({ name: 'id', description: 'Prediction ID' })
  @ApiBody({ type: UpdatePredictionDto })
  @ApiResponse({
    status: 200,
    description: 'The prediction has been successfully updated.',
    type: Prediction,
  })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiResponse({ status: 404, description: 'Prediction not found.' })
  async update(
    @Param('id') id: string,
    @Body() updatePredictionDto: UpdatePredictionDto,
  ) {
    try {
      return await this.predictionsService.update(id, updatePredictionDto);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Patch(':id/result')
  @ApiOperation({ summary: 'Update prediction result' })
  @ApiParam({ name: 'id', description: 'Prediction ID' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        isCorrect: {
          type: 'boolean',
          description: 'Whether the prediction was correct or not',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'The prediction result has been successfully updated.',
    type: Prediction,
  })
  @ApiResponse({ status: 404, description: 'Prediction not found.' })
  async updateResult(
    @Param('id') id: string,
    @Body('isCorrect') isCorrect: boolean,
  ) {
    return await this.predictionsService.updatePredictionResult(id, isCorrect);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a prediction' })
  @ApiParam({ name: 'id', description: 'Prediction ID' })
  @ApiResponse({
    status: 204,
    description: 'The prediction has been successfully deleted.',
  })
  @ApiResponse({ status: 404, description: 'Prediction not found.' })
  async remove(@Param('id') id: string) {
    await this.predictionsService.remove(id);
    return; 
  }

  @Delete('question/:questionId/user/:userId')
  @ApiOperation({ summary: 'Delete a prediction by question id and user id' })
  @ApiParam({ name: 'questionId', description: 'Question ID' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiResponse({
    status: 204,
    description: 'The prediction has been successfully deleted.',
  })
  @ApiResponse({ status: 404, description: 'Prediction not found.' })
  async removeByQuestionAndUser(
    @Param('questionId') questionId: string,
    @Param('userId') userId: string,
  ) {
    await this.predictionsService.removeByQuestionAndUser(questionId, userId);
    return; // No content response
  }

}
