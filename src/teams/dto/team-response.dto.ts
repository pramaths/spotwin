import { ApiProperty } from '@nestjs/swagger';

export class TeamResponseDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440111',
    description: 'Unique identifier for the team',
  })
  id: string;

  @ApiProperty({
    example: 'Real Madrid',
    description: 'Name of the team',
  })
  name: string;

  @ApiProperty({
    example: 'https://example.com/team_logo.png',
    description: 'URL of the team logo',
    required: false,
  })
  imageUrl?: string;

  @ApiProperty({
    example: 'Spain',
    description: 'Country or region the team represents',
    required: false,
  })
  country?: string;
}
