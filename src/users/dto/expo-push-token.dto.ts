import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ExpoPushTokenDto {
  @ApiProperty({
    description: 'Expo push token',
    example: 'ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]',
    required: true
  })
  @IsNotEmpty()
  @IsString()
  expoPushToken: string;
} 