import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Request } from 'express';

import { UserService } from 'src/modules/user/user.service';
import { CurrentUserType } from 'src/modules/user/user.types';
import { UserPlan } from '../constants/user-plan.constant';

@Injectable()
export class ProGuard implements CanActivate {
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

    if (!user || user.plan !== UserPlan.Pro) {
      return false;
    }

    return true;
  }
}
