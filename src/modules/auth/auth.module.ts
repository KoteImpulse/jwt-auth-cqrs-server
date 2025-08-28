import {Module} from '@nestjs/common';
import {ConfigModule, ConfigService} from '@nestjs/config';
import {JwtModule} from '@nestjs/jwt';
import {PassportModule} from '@nestjs/passport';
import {getJwtConfig} from 'src/config/jwt.config';

import {UserModule} from '../user/user.module';

import {AuthController} from './auth.controller';
import {AuthService} from './auth.service';
import {AuthCommandHandlers} from './commands';
import {JwtStrategy} from './strategies/jwt.strategy';

@Module({
	imports: [
		PassportModule,
		JwtModule.registerAsync({
			imports: [ConfigModule],
			inject: [ConfigService],
			useFactory: getJwtConfig,
		}),
		UserModule,
	],
	controllers: [AuthController],
	providers: [AuthService, JwtStrategy, ...AuthCommandHandlers],
})
export class AuthModule {}
