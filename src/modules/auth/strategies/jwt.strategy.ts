import {Injectable} from '@nestjs/common';
import {ConfigService} from '@nestjs/config';
import {PassportStrategy} from '@nestjs/passport';
import {ExtractJwt, Strategy} from 'passport-jwt';
import {UserWithoutPassword} from 'src/modules/user/types/user.type';

import {AuthService} from '../auth.service';
import {IPayload} from '../types/auth.type';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
	constructor(
		private readonly authService: AuthService,
		private readonly configService: ConfigService,
	) {
		super({
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			ignoreExpiration: false,
			secretOrKey: configService.getOrThrow<string>('JWT_SECRET'),
			algorithms: ['HS256'],
		});
	}

	async validate(payload: IPayload): Promise<UserWithoutPassword> {
		return await this.authService.validateUser(payload.id);
	}
}
