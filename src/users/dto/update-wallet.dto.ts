import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateWalletDto {
  @ApiProperty({
    description: 'Public blockchain address of the user',
    example: '0x1234567890abcdef1234567890abcdef12345678',
    required: true
  })
  @IsString()
  @IsNotEmpty()
  publicAddress: string;
}
