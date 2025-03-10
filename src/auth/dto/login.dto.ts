import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    description: 'The Twitter username of the user',
    example: 'batman',
  })
  @IsString()
  @IsNotEmpty()
  twitterUsername: string;

  @ApiProperty({
    description: 'The wallet address of the user',
    example: '0x1234567890abcdef',
  })
  @IsString()
  @IsNotEmpty()
  address: string;
}
