import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, IsUUID, IsDateString, IsOptional } from 'class-validator';

export class UpdateTicketDto {
    @ApiProperty({
        example: 100,
        description: 'Number of points for the ticket',
        required: false,
    })
    @IsOptional()
    @IsNumber()
    costPoints?: number;

    @ApiProperty({
        example: 'Santiago Bernabeu',
        description: 'Stadium where the match will be held',
        required: false,
    })
    @IsOptional()
    @IsString()
    stadium?: string;

    @ApiProperty({
        example: '550e8400-e29b-41d4-a716-446655440222',
        description: 'ID of the first team (Team A)',
        required: false,
    })
    @IsOptional()
    @IsUUID()
    teamAId?: string;

    @ApiProperty({
        example: '550e8400-e29b-41d4-a716-446655440333',
        description: 'ID of the second team (Team B)',
        required: false,
    })
    @IsOptional()
    @IsUUID()
    teamBId?: string;

    @ApiProperty({
        example: '2023-12-25T18:00:00',
        description: 'Date and time of the match',
        required: false,
    })
    @IsOptional()
    @IsDateString()
    matchDateTime?: string;
}
