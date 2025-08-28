import {ApiProperty} from '@nestjs/swagger';
import {IsEmail, IsNotEmpty, IsString, Length, Matches, MinLength} from 'class-validator';
import {v} from 'src/shared/consts/dto.const';

export class SignupDto {
	@IsString({message: 'Поле должно быть строкой'})
	@IsNotEmpty({message: 'Поле не может быть пустым'})
	@IsEmail({}, {message: 'Некорректный формат почты'})
	@Length(v.auth.signup.email.min, v.auth.signup.email.max, {
		message: `Почта должна быть от ${v.auth.signup.email.min} до ${v.auth.signup.email.max} символов`,
	})
	@ApiProperty({
		type: 'string',
		description: 'Почта пользователя',
		example: 'username@example.com',
		maxLength: v.auth.signup.email.max,
		minLength: v.auth.signup.email.min,
	})
	email: string;

	@IsString({message: 'Поле должно быть строкой'})
	@IsNotEmpty({message: 'Поле не может быть пустым'})
	@Length(v.auth.signup.username.min, v.auth.signup.username.max, {
		message: `Имя пользователя должно быть от ${v.auth.signup.username.min} до ${v.auth.signup.username.max} символов`,
	})
	@Matches(v.auth.signup.username.pattern, {
		message: 'Имя пользователя может содержать латинские буквы, цифры и специальные символы',
	})
	@ApiProperty({
		type: 'string',
		description: 'Имя пользователя',
		example: 'Username',
		maxLength: v.auth.signup.username.max,
		minLength: v.auth.signup.username.min,
		pattern: v.auth.signup.username.pattern.source,
	})
	username: string;

	@IsString({message: 'Поле должно быть строкой'})
	@IsNotEmpty({message: 'Поле не может быть пустым'})
	@MinLength(v.auth.signup.password.min, {
		message: `Пароль должен быть не менее ${v.auth.signup.password.min} символов`,
	})
	@ApiProperty({
		type: 'string',
		description: 'Пароль пользователя',
		example: 'password',
		minLength: v.auth.signup.password.min,
	})
	password: string;
}
