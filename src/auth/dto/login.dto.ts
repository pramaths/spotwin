import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    description: 'The phone number of the user',
    example: '+2348123456789',
  })
  @IsString()
  @IsNotEmpty()
  phoneNumber: string;

}
