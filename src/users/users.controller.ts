import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Query,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBody } from '@nestjs/swagger';
import { UserService } from './users.service';
import { User } from './entities/users.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ExpoPushTokenDto } from './dto/expo-push-token.dto';
import { ReferralCodeDto } from './dto/referral-code.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/enums/roles.enum';

@ApiTags('users')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({ 
    status: HttpStatus.CREATED, 
    description: 'User has been successfully created',
    type: User
  })
  @ApiResponse({ 
    status: HttpStatus.BAD_REQUEST, 
    description: 'Invalid input data or user with this email, username, or public address already exists' 
  })
  @ApiBody({ type: CreateUserDto })
  async create(@Body() createUserDto: CreateUserDto): Promise<User> {
    return await this.userService.create(createUserDto);
  }

  @Get()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Returns all users',
    type: [User]
  })
  async findAll(): Promise<User[]> {
    return await this.userService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a user by ID' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Returns the user with the specified ID',
    type: User
  })
  @ApiResponse({ 
    status: HttpStatus.NOT_FOUND, 
    description: 'User with the specified ID not found' 
  })
  async findOne(@Param('id') id: string): Promise<User> {
    return await this.userService.findOne(id);
  }


  @Patch(':id')
  @ApiOperation({ summary: 'Update a user' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiBody({ type: UpdateUserDto })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'User has been successfully updated',
    type: User
  })
  @ApiResponse({ 
    status: HttpStatus.NOT_FOUND, 
    description: 'User with the specified ID not found' 
  })
  @ApiResponse({ 
    status: HttpStatus.BAD_REQUEST, 
    description: 'Invalid input data or user with this email, username, or public address already exists' 
  })
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<User> {
    return await this.userService.update(id, updateUserDto);
  }

  @Patch(':id/deactivate')
  @ApiOperation({ summary: 'Deactivate a user account' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'User has been successfully deactivated',
    type: User
  })
  @ApiResponse({ 
    status: HttpStatus.NOT_FOUND, 
    description: 'User with the specified ID not found' 
  })
  async deactivateUser(@Param('id') id: string): Promise<User> {
    return await this.userService.deactivateUser(id);
  }

  @Patch(':id/activate')
  @ApiOperation({ summary: 'Activate a user account' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'User has been successfully activated',
    type: User
  })
  @ApiResponse({ 
    status: HttpStatus.NOT_FOUND, 
    description: 'User with the specified ID not found' 
  })
  async activateUser(@Param('id') id: string): Promise<User> {
    return await this.userService.activateUser(id);
  }

  @Post(':id/expo-push-token')
  @ApiOperation({ summary: 'Update a user\'s Expo push token' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiBody({ type: ExpoPushTokenDto })
  async updateExpoPushToken(@Param('id') id: string, @Body() expoPushTokenDto: ExpoPushTokenDto): Promise<User> {
    return await this.userService.updateExpoPushToken(id, expoPushTokenDto);
  }

  @Get(':id/balance')
  @ApiOperation({ summary: 'Get a user\'s balance' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Returns the user\'s balance',
    type: Number
  })
  async getUserBalance(@Param('id') id: string): Promise<{ balance: number }> {
    const balance = await this.userService.getUserBalance(id);
    return { balance: balance as number };
  }


  @Patch(':id/referral-code-used')
  @ApiOperation({ summary: 'Update a user\'s referral code used' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiBody({ type: ReferralCodeDto })
  async updateReferralCodeUsed(@Param('id') id: string, @Body() referralCodeDto: ReferralCodeDto): Promise<User> {
    return await this.userService.updateReferralCodeUsed(id, referralCodeDto.referralCode || null);
  }


  @Get("analytics")
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get analytics for all users' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Returns analytics for all users',
  })
  async getUserCounts(): Promise<{
    totalUsers: number;
    yesterdayNewUsers: number;
    newUsers: number;
  }> {
    const { totalUsers, yesterdayNewUsers, newUsers } = await this.userService.getUserAnalytics();
    return { totalUsers, yesterdayNewUsers, newUsers };
  }
  
}
