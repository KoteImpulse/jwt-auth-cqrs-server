import {ApiProperty} from '@nestjs/swagger';
import {IsEmail, IsNotEmpty, IsString, Length, MinLength} from 'class-validator';
import {authErrors as e} from 'src/shared/consts/auth/errors';
import {authValidation as v} from 'src/shared/consts/auth/validation';

export class SigninDto {
	@IsString({message: e.dto.signin.emailNotString})
	@IsNotEmpty({message: e.dto.signin.emailEmpty})
	@IsEmail({}, {message: e.dto.signin.invalidEmailFormat})
	@Length(v.signin.email.min, v.signin.email.max, {
		message: e.dto.signin.emailLength(v.signin.email.min, v.signin.email.max),
	})
	@ApiProperty({
		type: 'string',
		description: 'Почта пользователя',
		example: 'username@example.com',
		maxLength: v.signin.email.max,
		minLength: v.signin.email.min,
	})
	email: string;

	@IsString({message: e.dto.signin.passwordNotString})
	@IsNotEmpty({message: e.dto.signin.passwordEmpty})
	@MinLength(v.signin.password.min, {message: e.dto.signin.passwordMinLength(v.signin.password.min)})
	@ApiProperty({
		type: 'string',
		description: 'Пароль пользователя',
		example: 'password',
		minLength: v.signin.password.min,
	})
	password: string;
}
