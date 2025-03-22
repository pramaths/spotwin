import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { AuthorizedCreatorsService } from './authorized-creators.service';
import { CreateAuthorizedCreatorDto } from './dtos/create-authorized-creator.dto';
import { ApiTags } from '@nestjs/swagger';


@ApiTags('Authorized Creators')
@Controller('authorized-creators')
export class AuthorizedCreatorsController {
  constructor(
    private readonly authorizedCreatorsService: AuthorizedCreatorsService,
  ) {}

  @Get()
  async getAllAuthorizedCreators() {
    return await this.authorizedCreatorsService.getAuthorizedCreators();
  }

  @Post()
  async addAuthorizedCreator(@Body() createDto: CreateAuthorizedCreatorDto) {
    try {
      return await this.authorizedCreatorsService.addAuthorizedCreator(
        createDto,
      );
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Delete(':user')
  async removeAuthorizedCreator(@Param('user') user: string) {
    try {
      return await this.authorizedCreatorsService.removeAuthorizedCreator(user);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.NOT_FOUND);
    }
  }
}
