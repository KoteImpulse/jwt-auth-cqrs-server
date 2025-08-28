import { LogoutHandler } from './handlers/logout.handler';
import {RefreshHandler} from './handlers/refresh.handler';
import {SigninHandler} from './handlers/singin.handler';
import {SignupHandler} from './handlers/singup.handler';

export const AuthCommandHandlers = [SignupHandler, SigninHandler, RefreshHandler, LogoutHandler];
