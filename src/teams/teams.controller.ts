import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Put,
  Param,
  Delete,
  Query,
  HttpStatus,
  HttpCode,
  UseInterceptors,
  UploadedFile,
  ParseUUIDPipe
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { TeamsService } from './teams.service';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
import { GetTeamsQueryDto } from './dto/get-teams-query.dto';
import { TeamResponseDto } from './dto/team-response.dto';

@ApiTags('teams')
@Controller('teams')
export class TeamsController {
  constructor(private readonly teamsService: TeamsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new team' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'Real Madrid' },
        country: { type: 'string', example: 'Spain' },
        image: {
          type: 'string',
          format: 'binary',
          },
      },
    },
  })
  @UseInterceptors(FileInterceptor('image'))
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Team has been created successfully',
    type: TeamResponseDto,
  })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid input' })
  create(
    @Body() createTeamDto: CreateTeamDto,
    @UploadedFile() file?: Express.Multer.File,
  ): Promise<TeamResponseDto> {
    return this.teamsService.create(createTeamDto, file);
  }

  @Get()
  @ApiOperation({ summary: 'Get all teams with optional filtering' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returns all teams',
    type: [TeamResponseDto],
  })
  findAll(@Query() query: GetTeamsQueryDto): Promise<TeamResponseDto[]> {
    return this.teamsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a team by ID' })
  @ApiParam({ name: 'id', description: 'Team ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returns the team',
    type: TeamResponseDto,
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Team not found' })
  findOne(@Param('id') id: string): Promise<TeamResponseDto> {
    return this.teamsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a team partially' })
  @ApiParam({ name: 'id', description: 'Team ID' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        country: { type: 'string' },
        image: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('image'))
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Team has been updated',
    type: TeamResponseDto,
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Team not found' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid input' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateTeamDto: UpdateTeamDto,
    @UploadedFile() file?: Express.Multer.File,
  ): Promise<TeamResponseDto> {
    return this.teamsService.update(id, updateTeamDto, file);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Replace a team completely' })
  @ApiParam({ name: 'id', description: 'Team ID' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        country: { type: 'string' },
        image: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('image'))
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Team has been replaced',
    type: TeamResponseDto,
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Team not found' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid input' })
  replace(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() createTeamDto: CreateTeamDto,
    @UploadedFile() file?: Express.Multer.File,
  ): Promise<TeamResponseDto> {
    return this.teamsService.replace(id, createTeamDto, file);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a team' })
  @ApiParam({ name: 'id', description: 'Team ID' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Team has been deleted',
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Team not found' })
  remove(@Param('id') id: string): Promise<void> {
    return this.teamsService.remove(id);
  }
}
