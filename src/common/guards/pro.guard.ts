import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Request } from 'express';

import { UserService } from 'src/modules/user/user.service';
import { CurrentUserType } from 'src/modules/user/user.types';

@Injectable()
export class ProGuard implements CanActivate {
  constructor(private readonly userService: UserService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest();

    if (!request.user) {
      return false;
    }

    const currentUser = request.user as CurrentUserType;
    const user = await this.userService.findOneLeanById(currentUser.id);

    if (!user || user.plan !== 'pro') {
      return false;
    }

    return true;
  }
}
