import {Query} from '@nestjs/cqrs';

import {UserWithoutPassword} from '../../types/user.type';

export class GetProfileQuery extends Query<UserWithoutPassword> {
	constructor(public readonly userId: string) {
		super();
	}
}
