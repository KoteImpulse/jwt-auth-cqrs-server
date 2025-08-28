import {Module} from '@nestjs/common';

import {UserQueryHandlers} from './queries';
import {UserController} from './user.controller';
import {UserService} from './user.service';

@Module({
	controllers: [UserController],
	providers: [UserService, ...UserQueryHandlers],
	exports: [UserService],
})
export class UserModule {}
