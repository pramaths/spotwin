import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '../enums/roles.enum';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthorizedCreator } from '../../authorized_creators/entities/authorized-creator.entity';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    @InjectRepository(AuthorizedCreator)
    private authorizedCreatorRepository: Repository<AuthorizedCreator>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    // If no roles are required, allow access
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const userPublicKey = request.headers['x-public-key'];

    // If no public key provided, deny access
    if (!userPublicKey) {
      throw new UnauthorizedException('Missing x-public-key header');
    }

    // Check if the user is an authorized creator (admin)
    const isAuthorizedCreator = await this.authorizedCreatorRepository.findOne({
      where: { user: userPublicKey },
    });

    // If the user is an authorized creator, they have admin role
    const userRole = isAuthorizedCreator ? UserRole.ADMIN : UserRole.USER;

    // Check if the user's role is in the required roles
    return requiredRoles.some((role) => role === userRole);
  }
}
