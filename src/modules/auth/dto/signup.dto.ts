import {ApiProperty} from '@nestjs/swagger';
import {IsEmail, IsNotEmpty, IsString, Length, Matches, MinLength} from 'class-validator';
import {authErrors as e} from 'src/shared/consts/auth/errors';
import {authValidation as v} from 'src/shared/consts/auth/validation';

export class SignupDto {
	@IsString({message: e.dto.signup.emailNotString})
	@IsNotEmpty({message: e.dto.signup.emailEmpty})
	@IsEmail({}, {message: e.dto.signup.invalidEmailFormat})
	@Length(v.signup.email.min, v.signup.email.max, {
		message: e.dto.signup.emailLength(v.signup.email.min, v.signup.email.max),
	})
	@ApiProperty({
		type: 'string',
		description: 'Почта пользователя',
		example: 'username@example.com',
		maxLength: v.signup.email.max,
		minLength: v.signup.email.min,
	})
	email: string;

	@IsString({message: e.dto.signup.usernameNotString})
	@IsNotEmpty({message: e.dto.signup.usernameEmpty})
	@Length(v.signup.username.min, v.signup.username.max, {
		message: e.dto.signup.usernameLength(v.signup.username.min, v.signup.username.max),
	})
	@Matches(v.signup.username.pattern, {message: e.dto.signup.usernamePattern})
	@ApiProperty({
		type: 'string',
		description: 'Имя пользователя',
		example: 'Username',
		maxLength: v.signup.username.max,
		minLength: v.signup.username.min,
		pattern: v.signup.username.pattern.source,
	})
	username: string;

	@IsString({message: e.dto.signup.passwordNotString})
	@IsNotEmpty({message: e.dto.signup.passwordEmpty})
	@MinLength(v.signup.password.min, {message: e.dto.signup.passwordMinLength(v.signup.password.min)})
	@ApiProperty({
		type: 'string',
		description: 'Пароль пользователя',
		example: 'password',
		minLength: v.signup.password.min,
	})
	password: string;
}
