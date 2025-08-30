import {NotFoundException} from '@nestjs/common';
import {IQueryHandler, QueryHandler} from '@nestjs/cqrs';
import {userErrors as e} from 'src/shared/consts/user/errors';
import {excludePassword} from 'src/shared/utils/exclude-password.util';

import {UserWithoutPassword} from '../../types/user.type';
import {UserService} from '../../user.service';
import {GetProfileQuery} from '../implementation/get-profile.query';

@QueryHandler(GetProfileQuery)
export class GetProfileHandler implements IQueryHandler<GetProfileQuery> {
	constructor(private userService: UserService) {}

	async execute(query: GetProfileQuery): Promise<UserWithoutPassword> {
		const user = await this.userService.findUserById(query.userId);
		if (!user) {
			throw new NotFoundException(e.service.getProfile.userNotFound);
		}

		const userWithoutPassword = excludePassword(user);
		return userWithoutPassword;
	}
}
