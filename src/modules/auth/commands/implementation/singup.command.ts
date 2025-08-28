import {ICommand} from '@nestjs/cqrs';

import {SignupDto} from '../../dto/signup.dto';

export class SignupCommand implements ICommand {
	constructor(public readonly signupDto: SignupDto) {}
}
