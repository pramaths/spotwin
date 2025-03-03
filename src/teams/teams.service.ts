import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Team } from './entities/team.entity';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
import { GetTeamsQueryDto } from './dto/get-teams-query.dto';
import { TeamResponseDto } from './dto/team-response.dto';
import { S3Service } from '../aws/s3.service';

@Injectable()
export class TeamsService {
  constructor(
    @InjectRepository(Team)
    private teamsRepository: Repository<Team>,
    private s3Service: S3Service,
  ) {}

  async create(
    createTeamDto: CreateTeamDto,
    file?: Express.Multer.File,
  ): Promise<TeamResponseDto> {
    const team = this.teamsRepository.create(createTeamDto);

    if (file) {
      team.imageUrl = await this.s3Service.uploadFile(file);
    }

    const savedTeam = await this.teamsRepository.save(team);
    return this.mapToResponseDto(savedTeam);
  }

  async findAll(query: GetTeamsQueryDto): Promise<TeamResponseDto[]> {
    const queryBuilder = this.teamsRepository.createQueryBuilder('team');

    if (query.name) {
      queryBuilder.andWhere('team.name LIKE :name', {
        name: `%${query.name}%`,
      });
    }

    if (query.country) {
      queryBuilder.andWhere('team.country = :country', {
        country: query.country,
      });
    }

    const teams = await queryBuilder.getMany();
    return teams.map((team) => this.mapToResponseDto(team));
  }

  async findOne(id: string): Promise<TeamResponseDto> {
    const team = await this.teamsRepository.findOne({ where: { id } });
    if (!team) {
      throw new NotFoundException(`Team with ID "${id}" not found`);
    }
    return this.mapToResponseDto(team);
  }

  async update(
    id: string,
    updateTeamDto: UpdateTeamDto,
    file?: Express.Multer.File,
  ): Promise<TeamResponseDto> {
    const team = await this.findEntityById(id);

    Object.assign(team, updateTeamDto);

    // Upload image if provided
    if (file) {
      // Extract the key from old imageUrl if it exists
      if (team.imageUrl) {
        const urlParts = team.imageUrl.split('/');
        const oldKey = urlParts[urlParts.length - 1];
        try {
          // Try to delete the old image, but continue even if it fails
          await this.s3Service.deleteFile(oldKey);
        } catch (error) {
          console.error('Failed to delete old image:', error);
        }
      }

      team.imageUrl = await this.s3Service.uploadFile(file);
    }

    const updatedTeam = await this.teamsRepository.save(team);
    return this.mapToResponseDto(updatedTeam);
  }

  async replace(
    id: string,
    createTeamDto: CreateTeamDto,
    file?: Express.Multer.File,
  ): Promise<TeamResponseDto> {
    const team = await this.findEntityById(id);

    // Save old imageUrl to potentially delete
    const oldImageUrl = team.imageUrl;

    // Reset the team and apply new values
    Object.keys(team).forEach((key) => {
      if (key !== 'id' && key !== 'eventsAsTeamA' && key !== 'eventsAsTeamB') {
        team[key] = undefined;
      }
    });

    Object.assign(team, createTeamDto);

    // Upload new image if provided
    if (file) {
      team.imageUrl = await this.s3Service.uploadFile(file);

      // Delete old image if it exists
      if (oldImageUrl) {
        const urlParts = oldImageUrl.split('/');
        const oldKey = urlParts[urlParts.length - 1];
        try {
          await this.s3Service.deleteFile(oldKey);
        } catch (error) {
          console.error('Failed to delete old image:', error);
        }
      }
    }

    const replacedTeam = await this.teamsRepository.save(team);
    return this.mapToResponseDto(replacedTeam);
  }

  async remove(id: string): Promise<void> {
    const result = await this.teamsRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Team with ID "${id}" not found`);
    }
  }

  // Helper to find team entity and throw exception if not found
  private async findEntityById(id: string): Promise<Team> {
    const team = await this.teamsRepository.findOne({ where: { id } });
    if (!team) {
      throw new NotFoundException(`Team with ID "${id}" not found`);
    }
    return team;
  }

  private mapToResponseDto(team: Team): TeamResponseDto {
    const responseDto = new TeamResponseDto();
    responseDto.id = team.id;
    responseDto.name = team.name;
    responseDto.imageUrl = team.imageUrl;
    responseDto.country = team.country;
    return responseDto;
  }
}
