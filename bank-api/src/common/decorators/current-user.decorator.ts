import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Account } from '../../database/schemas/account.schema';

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): Account => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
