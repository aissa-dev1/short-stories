import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Request } from 'express';

import { UserService } from 'src/modules/user/user.service';
import { CurrentUserType } from 'src/modules/user/user.types';
import { UserPlan } from '../user.constants';

@Injectable()
export class UserProGuard implements CanActivate {
  constructor(private readonly userService: UserService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest();

    if (!request.user) {
      return false;
    }

    const currentUser = request.user as CurrentUserType;
    const user = await this.userService.findOneLean({
      _id: currentUser.id,
    });

    if (!user || (user.plan as UserPlan) !== UserPlan.Pro) {
      return false;
    }

    return true;
  }
}
