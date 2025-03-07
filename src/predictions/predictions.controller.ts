import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
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
  create(@Body() createPredictionDto: CreatePredictionDto) {
    return this.predictionsService.create(createPredictionDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all predictions' })
  @ApiResponse({
    status: 200,
    description: 'Return all predictions',
    type: [Prediction],
  })
  findAll() {
    return this.predictionsService.findAll();
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
  findOne(@Param('id') id: string) {
    return this.predictionsService.findOne(id);
  }

  @Get('user-contest/:userContestId')
  @ApiOperation({ summary: 'Get predictions by user contest id' })
  @ApiParam({ name: 'userContestId', description: 'User Contest ID' })
  @ApiResponse({
    status: 200,
    description: 'Return the predictions for the specified user contest',
    type: [Prediction],
  })
  findByUserContest(@Param('userContestId') userContestId: string) {
    return this.predictionsService.findByUserContest(userContestId);
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
  update(
    @Param('id') id: string,
    @Body() updatePredictionDto: UpdatePredictionDto,
  ) {
    return this.predictionsService.update(id, updatePredictionDto);
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
  updateResult(@Param('id') id: string, @Body('isCorrect') isCorrect: boolean) {
    return this.predictionsService.updatePredictionResult(id, isCorrect);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a prediction' })
  @ApiParam({ name: 'id', description: 'Prediction ID' })
  @ApiResponse({
    status: 200,
    description: 'The prediction has been successfully deleted.',
  })
  @ApiResponse({ status: 404, description: 'Prediction not found.' })
  remove(@Param('id') id: string) {
    return this.predictionsService.remove(id);
  }
}
