import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class StakeDto {
 
 @ApiProperty({
    description: "amount of sol to be staked",
    example: 0.1,
 })
    @IsNotEmpty()
    @IsNumber()
    stakeAmount: number;
 
  @ApiProperty({
    description: 'The entry fee',
    example: 10,
  })
  @IsNotEmpty()
  instructions: string;
}
