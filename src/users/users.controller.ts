import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Query,
} from '@nestjs/common';
import { UserService } from './users.service';
import { User } from './entities/users.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto): Promise<User> {
    return this.userService.create(createUserDto);
  }

  @Get()
  findAll(): Promise<User[]> {
    return this.userService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<User> {
    return this.userService.findOne(+id);
  }

  @Get('email/find')
  findByEmail(@Query('email') email: string): Promise<User> {
    return this.userService.findByEmail(email);
  }

  @Get('address/find')
  findByPublicAddress(@Query('address') address: string): Promise<User> {
    return this.userService.findByPublicAddress(address);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<User> {
    return this.userService.update(+id, updateUserDto);
  }

  @Patch(':id/wallet')
  updateWallet(
    @Param('id') id: string,
    @Body('publicAddress') publicAddress: string,
  ): Promise<User> {
    return this.userService.updateWallet(+id, publicAddress);
  }

  @Patch(':id/deactivate')
  deactivateUser(@Param('id') id: string): Promise<User> {
    return this.userService.deactivateUser(+id);
  }

  @Patch(':id/activate')
  activateUser(@Param('id') id: string): Promise<User> {
    return this.userService.activateUser(+id);
  }
}
