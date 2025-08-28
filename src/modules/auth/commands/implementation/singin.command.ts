import {ICommand} from '@nestjs/cqrs';
import { SigninDto } from '../../dto/signin.dto';

export class SigninCommand implements ICommand {
	constructor(public readonly signinDto: SigninDto) {}
}
