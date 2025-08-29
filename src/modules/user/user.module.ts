import {Module} from '@nestjs/common';

import {UserQueryHandlers} from './queries';
import {UserCreatedSaga} from './sagas/user-created.saga';
import {UserController} from './user.controller';
import {UserService} from './user.service';

@Module({
	controllers: [UserController],
	providers: [UserService, ...UserQueryHandlers, UserCreatedSaga],
	exports: [UserService],
})
export class UserModule {}
