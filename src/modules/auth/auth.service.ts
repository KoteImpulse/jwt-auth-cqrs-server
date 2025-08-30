import {
	BadRequestException,
	ConflictException,
	Injectable,
	InternalServerErrorException,
	NotFoundException,
	UnauthorizedException,
} from '@nestjs/common';
import {ConfigService} from '@nestjs/config';
import {JwtService} from '@nestjs/jwt';
import * as argon2 from 'argon2';
import {Request, Response} from 'express';
import {getCookieOptions} from 'src/config/cookie.config';
import {authErrors as e} from 'src/shared/consts/auth/errors';
import {excludePassword} from 'src/shared/utils/exclude-password.util';
import {isDev} from 'src/shared/utils/is-dev.util';
import {ttlToMs} from 'src/shared/utils/ttl.utils';

import {UserWithoutPassword} from '../user/types/user.type';
import {UserService} from '../user/user.service';

import {SigninDto} from './dto/signin.dto';
import {SignupDto} from './dto/signup.dto';
import type {IPayload, ServiceResult, Tokens} from './types/auth.type';

@Injectable()
export class AuthService {
	private readonly JWT_PEPPER: string;
	private readonly JWT_ACCESS_TOKEN_TTL: string;
	private readonly JWT_REFRESH_TOKEN_TTL: string;
	private readonly COOKIE_DOMAIN: string;
	constructor(
		private readonly userService: UserService,
		private readonly configService: ConfigService,
		private readonly jwtService: JwtService,
	) {
		this.JWT_PEPPER = configService.getOrThrow<string>('JWT_PEPPER');
		this.JWT_ACCESS_TOKEN_TTL = this.configService.getOrThrow<string>('JWT_ACCESS_TOKEN_TTL');
		this.JWT_REFRESH_TOKEN_TTL = this.configService.getOrThrow<string>('JWT_REFRESH_TOKEN_TTL');
		this.COOKIE_DOMAIN = this.configService.getOrThrow<string>('COOKIE_DOMAIN');
	}

	async signup(dto: SignupDto): Promise<ServiceResult> {
		const {email, password, username} = dto;
		const exists = await this.userService.checkUserExists(email);

		if (exists) {
			throw new ConflictException(e.service.signup.emailAlreadyExists);
		}
		const passwordHash = await this.hashPassword(password);
		const user = await this.userService.createUser({username, password: passwordHash, email});

		if (!user) {
			throw new InternalServerErrorException(e.service.signup.userNotCreated);
		}

		if (user.refreshTokenVersion === null || user.refreshTokenVersion === undefined) {
			throw new InternalServerErrorException(e.service.signup.tokenVersionUndefined);
		}

		const version = Number(user.refreshTokenVersion);
		const tokens = this.generateTokens(user.id, version);

		return {user, tokens};
	}

	async signin(dto: SigninDto): Promise<ServiceResult> {
		const {email, password} = dto;
		const user = await this.userService.findUserByEmail(email);

		if (!user) {
			throw new NotFoundException(e.service.signin.userNotFound);
		}

		const isPasswordCorrect = await this.verifyPassword(user.password, password);

		if (!isPasswordCorrect) {
			throw new NotFoundException(e.service.signin.userNotFound);
		}

		if (user.refreshTokenVersion === null || user.refreshTokenVersion === undefined) {
			throw new InternalServerErrorException(e.service.signin.tokenVersionUndefined);
		}

		const version = Number(user.refreshTokenVersion);
		const tokens = this.generateTokens(user.id, version);

		return {user, tokens};
	}

	async refresh(refreshToken: string): Promise<ServiceResult> {
		const payload: IPayload = await this.jwtService.verifyAsync(refreshToken);

		if (!payload.id) {
			throw new UnauthorizedException(e.service.refresh.tokenMissing);
		}

		const user = await this.userService.findUserById(payload.id);

		if (!user) {
			throw new NotFoundException(e.service.refresh.userNotFound);
		}

		if (user.refreshTokenVersion === null || user.refreshTokenVersion === undefined) {
			throw new InternalServerErrorException(e.service.refresh.tokenVersionUndefined);
		}

		if (payload.version !== user.refreshTokenVersion) {
			throw new UnauthorizedException(e.service.refresh.tokenVersionMismatch);
		}

		const version = Number(user.refreshTokenVersion);
		const tokens = this.generateTokens(user.id, version);

		return {user, tokens};
	}

	async logout(userId: string): Promise<void> {
		await this.userService.incrementRefreshTokenVersion(userId);
	}

	async hashPassword(password: string): Promise<string> {
		return argon2.hash(password + this.JWT_PEPPER, {
			type: argon2.argon2id,
			timeCost: 3,
			memoryCost: 2 ** 16,
			parallelism: 4,
		});
	}

	async verifyPassword(hash: string, password: string): Promise<boolean> {
		return argon2.verify(hash, password + this.JWT_PEPPER);
	}

	async validateUser(userId: string): Promise<UserWithoutPassword> {
		const userInDb = await this.userService.findUserById(userId);
		if (!userInDb) {
			throw new NotFoundException(e.service.validateUser.userNotFound);
		}
		return excludePassword(userInDb);
	}

	public extractRefreshToken(req: Request): string | null {
		if (req.cookies['refreshToken']) return req.cookies['refreshToken'] as string;
		const header = req.headers['refreshtoken'] || req.headers['refreshToken'];
		if (Array.isArray(header)) return header[0];
		if (typeof header === 'string') return header;
		return null;
	}

	private generateTokens(userId: string, version: number): Tokens {
		if (!userId) {
			throw new BadRequestException(e.service.generateTokens.userIdMissing);
		}
		const payload: IPayload = {id: userId, version};
		const accessToken = this.jwtService.sign(payload, {expiresIn: this.JWT_ACCESS_TOKEN_TTL});
		const refreshToken = this.jwtService.sign(payload, {expiresIn: this.JWT_REFRESH_TOKEN_TTL});

		return {accessToken, refreshToken};
	}

	public setRefreshCookie(response: Response, value: string): void {
		const expiresIn = new Date(Date.now() + ttlToMs(this.JWT_REFRESH_TOKEN_TTL));
		const cookieOptions = getCookieOptions(this.COOKIE_DOMAIN, isDev(this.configService));
		response.cookie('refreshToken', value, {
			expires: expiresIn,
			...cookieOptions,
		});
	}

	public clearRefreshCookie(response: Response): void {
		const cookieOptions = getCookieOptions(this.COOKIE_DOMAIN, isDev(this.configService));
		response.clearCookie('refreshToken', cookieOptions);
	}
}
