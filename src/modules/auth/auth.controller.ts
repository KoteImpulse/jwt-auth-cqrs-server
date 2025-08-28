import {Body, Controller, HttpCode, HttpStatus, Post, Req, Res, UnauthorizedException} from '@nestjs/common';
import {CommandBus} from '@nestjs/cqrs';
import {ApiBearerAuth, ApiCookieAuth, ApiOperation, ApiResponse, ApiTags} from '@nestjs/swagger';
import type {Request, Response} from 'express';

import {AuthService} from './auth.service';
import {LogoutCommand} from './commands/implementation/logout.command';
import {RefreshCommand} from './commands/implementation/refresh.command';
import {SigninCommand} from './commands/implementation/singin.command';
import {SignupCommand} from './commands/implementation/singup.command';
import {AuthDecorator} from './decorators/auth.decorator';
import {Authorized} from './decorators/authorized.decorator';
import {ResponseDto} from './dto/response.dto';
import {SigninDto} from './dto/signin.dto';
import {SignupDto} from './dto/signup.dto';
import {ClientResponse, CommandExecuteResult} from './types/auth.type';

@ApiTags('Auth')
@Controller({path: 'auth', version: '1'})
export class AuthController {
	constructor(
		private readonly authService: AuthService,
		private readonly commandBus: CommandBus,
	) {}

	@ApiOperation({description: 'Создание нового аккаунта пользователя', summary: 'Создание аккаунта'})
	@ApiResponse({status: HttpStatus.CREATED, description: 'Аккаунт успешно создан', type: ResponseDto})
	@ApiResponse({status: HttpStatus.CONFLICT, description: 'Пользователь с таким email уже существует'})
	@ApiResponse({status: HttpStatus.INTERNAL_SERVER_ERROR, description: 'Версия токена не определена'})
	@HttpCode(HttpStatus.CREATED)
	@Post('signup')
	async signup(@Body() signupDto: SignupDto, @Res({passthrough: true}) response: Response): Promise<ClientResponse> {
		const {user, tokens} = await this.commandBus.execute<SignupCommand, CommandExecuteResult>(
			new SignupCommand(signupDto),
		);

		this.authService.setRefreshCookie(response, tokens.refreshToken);
		return {user, accessToken: tokens.accessToken};
	}

	@ApiOperation({description: 'Авторизует пользователя и выдает токен доступа', summary: 'Вход в систему'})
	@ApiResponse({status: HttpStatus.OK, description: 'Успешный вход в систему', type: ResponseDto})
	@ApiResponse({status: HttpStatus.BAD_REQUEST, description: 'Некорректные входные данные'})
	@ApiResponse({status: HttpStatus.NOT_FOUND, description: 'Пользователь не найден'})
	@ApiResponse({status: HttpStatus.INTERNAL_SERVER_ERROR, description: 'Версия токена не определена'})
	@HttpCode(HttpStatus.OK)
	@Post('signin')
	async signin(@Body() signinDto: SigninDto, @Res({passthrough: true}) response: Response): Promise<ClientResponse> {
		const {user, tokens} = await this.commandBus.execute<SigninCommand, CommandExecuteResult>(
			new SigninCommand(signinDto),
		);

		this.authService.setRefreshCookie(response, tokens.refreshToken);
		return {user, accessToken: tokens.accessToken};
	}

	@ApiOperation({description: 'Генерирует новый токен доступа', summary: 'Обновление токена'})
	@ApiResponse({status: HttpStatus.OK, description: 'Успешный вход в систему', type: ResponseDto})
	@ApiResponse({status: HttpStatus.UNAUTHORIZED, description: 'Refresh токен утерян, необходима повторная авторизация'})
	@ApiResponse({status: HttpStatus.INTERNAL_SERVER_ERROR, description: 'Версия токена не определена'})
	@ApiCookieAuth()
	@HttpCode(HttpStatus.OK)
	@Post('refresh')
	async refresh(@Req() request: Request, @Res({passthrough: true}) response: Response) {
		const refreshToken = this.authService.extractRefreshToken(request);
		if (!refreshToken) {
			throw new UnauthorizedException('Refresh токен утерян, необходима повторная авторизация');
		}

		const {user, tokens} = await this.commandBus.execute<RefreshCommand, CommandExecuteResult>(
			new RefreshCommand(refreshToken),
		);
		this.authService.setRefreshCookie(response, tokens.refreshToken);
		return {user, accessToken: tokens.accessToken};
	}

	@ApiOperation({summary: 'Выход из системы'})
	@ApiResponse({status: HttpStatus.NO_CONTENT, description: 'Успешный выход из системы'})
	@ApiResponse({status: HttpStatus.UNAUTHORIZED, description: 'Access токен недействителен'})
	@ApiBearerAuth()
	@HttpCode(HttpStatus.NO_CONTENT)
	@AuthDecorator()
	@Post('logout')
	async logout(@Authorized('id') userId: string, @Res({passthrough: true}) response: Response): Promise<void> {
		await this.commandBus.execute<LogoutCommand, void>(new LogoutCommand(userId));
		this.authService.clearRefreshCookie(response);
	}
}
