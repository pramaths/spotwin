import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @ApiProperty({
    description: 'Optional field to update total contests participated in',
    example: 10,
    required: false
  })
  totalContests?: number;

  @ApiProperty({
    description: 'Optional field to update total contests won',
    example: 3,
    required: false
  })
  totalContestsWon?: number;

  @ApiProperty({
    description: 'Optional field to update username',
    example: 'batman',
    required: false
  })
  username?: string;

  @ApiProperty({
    description: 'Optional field to update Expo push token',
    example: 'Expo push token',
    required: false
  })
  expoPushToken?: string;
}
