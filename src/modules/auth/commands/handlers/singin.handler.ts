import {CommandHandler, ICommandHandler} from '@nestjs/cqrs';
import {excludePassword} from 'src/shared/utils/exclude-password.util';

import {AuthService} from '../../auth.service';
import type {CommandExecuteResult} from '../../types/auth.type';
import {SigninCommand} from '../implementation/singin.command';

@CommandHandler(SigninCommand)
export class SigninHandler implements ICommandHandler<SigninCommand, CommandExecuteResult> {
	constructor(private readonly authService: AuthService) {}

	async execute(command: SigninCommand): Promise<CommandExecuteResult> {
		const signinDto = command.signinDto;
		const {user, tokens} = await this.authService.signin(signinDto);
		const userWithoutPassword = excludePassword(user);
		return {user: userWithoutPassword, tokens};
	}
}
