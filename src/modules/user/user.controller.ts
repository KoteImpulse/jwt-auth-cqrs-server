import {Controller, Get, HttpStatus} from '@nestjs/common';
import {QueryBus} from '@nestjs/cqrs';
import {ApiBearerAuth, ApiOperation, ApiResponse, ApiTags} from '@nestjs/swagger';
import {authErrors} from 'src/shared/consts/auth/errors';
import {userErrors as e} from 'src/shared/consts/user/errors';

import {AuthDecorator} from '../auth/decorators/auth.decorator';
import {Authorized} from '../auth/decorators/authorized.decorator';

import {UserWithoutPasswordDto} from './dto/user.dto';
import {GetProfileQuery} from './queries/implementation/get-profile.query';

@ApiTags('User')
@Controller({path: 'user', version: '1'})
export class UserController {
	constructor(private readonly queryBus: QueryBus) {}

	@ApiOperation({
		description: 'Получение профиля текущего пользователя',
		summary: 'Получение профиля',
	})
	@ApiResponse({
		status: HttpStatus.OK,
		description: 'Профиль текущего пользователя получен',
		type: UserWithoutPasswordDto,
	})
	@ApiResponse({status: HttpStatus.UNAUTHORIZED, description: authErrors.service.invalidBearerToken})
	@ApiResponse({status: HttpStatus.NOT_FOUND, description: e.service.getProfile.userNotFound})
	@ApiBearerAuth('bearer')
	@AuthDecorator()
	@Get('profile')
	async getProfile(@Authorized('id') userId: string) {
		return this.queryBus.execute(new GetProfileQuery(userId));
	}
}
