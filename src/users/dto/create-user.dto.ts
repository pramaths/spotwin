import { IsString, IsEmail, IsNotEmpty, IsOptional, IsBoolean, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({
    description: 'User DID token for authentication',
    example: 'did:ethr:0x1234567890abcdef',
    required: true
  })
  @IsString()
  @IsNotEmpty()
  didToken: string;

  @ApiProperty({
    description: 'Unique username for the user',
    example: 'john_doe',
    required: true
  })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({
    description: 'Full name of the user',
    example: 'John Doe',
    required: true
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Email address of the user',
    example: 'john.doe@example.com',
    required: true
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'Public blockchain address of the user',
    example: '0x1234567890abcdef1234567890abcdef12345678',
    required: true
  })
  @IsString()
  @IsNotEmpty()
  publicAddress: string;

  @ApiProperty({
    description: 'Profile image URL',
    example: 'https://example.com/images/profile.jpg',
    required: true
  })
  @IsString()
  @IsNotEmpty()
  imageUrl: string;

  @ApiProperty({
    description: 'User biography',
    example: 'Blockchain enthusiast and sports fan',
    required: false
  })
  @IsString()
  @IsOptional()
  bio?: string;

  @ApiProperty({
    description: 'Whether the user account is active',
    example: true,
    default: true,
    required: false
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
