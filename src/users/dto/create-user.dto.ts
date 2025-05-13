import { IsString, IsEmail, IsNotEmpty, IsOptional, IsBoolean, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({
    description: 'Unique username for the user',
    example: 'john_doe',
    required: true
  })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({
    description: 'Unique privyId for the user',
    example: 'cm7xb8o7h002bai0oaxp2opie',
    required: true
  })
  @IsString()
  @IsNotEmpty()
  privyId: string;

  @ApiProperty({
    description: 'email of the user',
    example: 'john_doe@example.com',
    required: true
  })
  @IsString()
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: " Wallet address of the user",
    example: "0x1234567890123456789012345678901234567890",
    required: true
  })
  @IsString()
  @IsNotEmpty()
  walletAddress: string;

  @ApiProperty({
    description: 'Profile image URL',
    example: 'https://example.com/images/profile.jpg',
    required: true
  })
  @IsString()
  @IsNotEmpty()
  imageUrl: string;

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
