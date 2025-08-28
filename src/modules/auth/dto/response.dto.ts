import {ApiProperty} from '@nestjs/swagger';
import {UserWithoutPasswordDto} from 'src/modules/user/dto/user.dto';
import { UserWithoutPassword } from 'src/modules/user/types/user.type';

export class ResponseDto {
	@ApiProperty({
		type: 'string',
		description: 'Access токен пользователя',
		example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
	})
	accessToken: string;

	@ApiProperty({
		type: UserWithoutPasswordDto,
		description: 'Данные пользователя',
	})
	user: UserWithoutPassword;
}
