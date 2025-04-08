import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, IsUUID, IsDateString } from 'class-validator';

export class CreateTicketDto {
    @ApiProperty({
        example: 100,
        description: 'Number of points for the ticket',
    })
    @IsNotEmpty()
    @IsNumber()
    points: number;

    @ApiProperty({
        example: 'Santiago Bernabeu',
        description: 'Stadium where the match will be held',
    })
    @IsNotEmpty()
    @IsString()
    stadium: string;

    @ApiProperty({
        example: '550e8400-e29b-41d4-a716-446655440222',
        description: 'ID of the first team (Team A)',
    })
    @IsNotEmpty()
    @IsUUID()
    teamAId: string;

    @ApiProperty({
        example: '550e8400-e29b-41d4-a716-446655440333',
        description: 'ID of the second team (Team B)',
    })
    @IsNotEmpty()
    @IsUUID()
    teamBId: string;

    @ApiProperty({
        example: '2023-12-25T18:00:00',
        description: 'Date and time of the match',
    })
    @IsNotEmpty()
    @IsDateString()
    matchDateTime: string;
}
