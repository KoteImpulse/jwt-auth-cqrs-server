import {CommandHandler, EventBus, ICommandHandler} from '@nestjs/cqrs';
import {UserCreatedEvent} from 'src/modules/user/events/user-created.event';
import {excludePassword} from 'src/shared/utils/exclude-password.util';

import {AuthService} from '../../auth.service';
import type {CommandExecuteResult} from '../../types/auth.type';
import {SignupCommand} from '../implementation/singup.command';

@CommandHandler(SignupCommand)
export class SignupHandler implements ICommandHandler<SignupCommand, CommandExecuteResult> {
	constructor(
		private readonly authService: AuthService,
		private readonly eventBus: EventBus,
	) {}

	async execute(command: SignupCommand): Promise<CommandExecuteResult> {
		const signupDto = command.signupDto;
		const {user, tokens} = await this.authService.signup(signupDto);
		const userWithoutPassword = excludePassword(user);
		this.eventBus.publish(new UserCreatedEvent(user.id, user.email));
		return {user: userWithoutPassword, tokens};
	}
}
