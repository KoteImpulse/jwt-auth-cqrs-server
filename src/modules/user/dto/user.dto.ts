import {ApiProperty} from '@nestjs/swagger';

export class UserDto {}

export class UserWithoutPasswordDto {
	@ApiProperty({example: '550e8400-e29b-41d4-a716-446655440000'})
	id: string;

	@ApiProperty({example: 'username'})
	username: string;

	@ApiProperty({example: 'username@example.com'})
	email: string;

	@ApiProperty({example: '2024-01-01T12:00:00.000Z'})
	createdAt: Date;

	@ApiProperty({example: '2024-01-01T12:00:00.000Z'})
	updatedAt: Date;
}
