import {ExecutionContext, Injectable, UnauthorizedException} from '@nestjs/common';
import {AuthGuard} from '@nestjs/passport';
import {UserWithoutPassword} from 'src/modules/user/types/user.type';
import {authErrors as e} from 'src/shared/consts/auth/errors';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
	handleRequest<TUser = UserWithoutPassword>(
		err: any,
		user: TUser,
		info: any,
		context: ExecutionContext,
		status?: any,
	): TUser {
		if (err || !user) {
			throw new UnauthorizedException(e.service.invalidBearerToken);
		}
		return user;
	}
}
