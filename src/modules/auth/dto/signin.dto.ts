import {ApiProperty} from '@nestjs/swagger';
import {IsEmail, IsNotEmpty, IsString, Length, MinLength} from 'class-validator';
import {v} from 'src/shared/consts/dto.const';

export class SigninDto {
	@IsString({message: 'Поле должно быть строкой'})
	@IsNotEmpty({message: 'Поле не может быть пустым'})
	@IsEmail({}, {message: 'Некорректный формат почты'})
	@Length(v.auth.signin.email.min, v.auth.signin.email.max, {
		message: `Почта должна быть от ${v.auth.signin.email.min} до ${v.auth.signin.email.max} символов`,
	})
	@ApiProperty({
		type: 'string',
		description: 'Почта пользователя',
		example: 'username@example.com',
		maxLength: v.auth.signin.email.max,
		minLength: v.auth.signin.email.min,
	})
	email: string;

	@IsString({message: 'Поле должно быть строкой'})
	@IsNotEmpty({message: 'Поле не может быть пустым'})
	@MinLength(v.auth.signin.password.min, {
		message: `Пароль должен быть не менее ${v.auth.signin.password.min} символов`,
	})
	@ApiProperty({
		type: 'string',
		description: 'Пароль пользователя',
		example: 'password',
		minLength: v.auth.signin.password.min,
	})
	password: string;
}
