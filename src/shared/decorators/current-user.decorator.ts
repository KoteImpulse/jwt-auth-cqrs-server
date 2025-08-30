import {createParamDecorator, ExecutionContext} from '@nestjs/common';
import {User} from '@prisma-client';

import type {ReqWithUser} from '../../modules/auth/types/auth.type';

export const CurrentUser = createParamDecorator((data: keyof User, ctx: ExecutionContext) => {
	const request = ctx.switchToHttp().getRequest<ReqWithUser>();
	const user = request.user;
	return data ? (user[data] as User[keyof User]) : user;
});
