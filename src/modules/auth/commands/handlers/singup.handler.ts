import {CommandHandler, ICommandHandler} from '@nestjs/cqrs';
import {excludePassword} from 'src/shared/utils/exclude-password.util';

import {AuthService} from '../../auth.service';
import type {CommandExecuteResult} from '../../types/auth.type';
import {SignupCommand} from '../implementation/singup.command';

@CommandHandler(SignupCommand)
export class SignupHandler implements ICommandHandler<SignupCommand, CommandExecuteResult> {
	constructor(private readonly authService: AuthService) {}

	async execute(command: SignupCommand): Promise<CommandExecuteResult> {
		const signupDto = command.signupDto;
		const {user, tokens} = await this.authService.signup(signupDto);
		const userWithoutPassword = excludePassword(user);
		return {user: userWithoutPassword, tokens};
	}
}
