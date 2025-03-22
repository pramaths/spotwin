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

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const userPhoneNumber = request.headers['x-phone-number'];

    if (!userPhoneNumber) {
      throw new UnauthorizedException('Missing x-phone-number header');
    }

    const isAuthorizedCreator = await this.authorizedCreatorRepository.findOne({
      where: { phoneNumber: userPhoneNumber },
    });

    const userRole = isAuthorizedCreator ? UserRole.ADMIN : UserRole.USER;
    return requiredRoles.some((role) => role === userRole);
  }
}
