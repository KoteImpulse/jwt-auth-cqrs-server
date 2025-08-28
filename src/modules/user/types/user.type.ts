import {User} from '@prisma-client';

export type UserWithoutPassword = Omit<User, 'password'>;

export interface ICreateUser {
	username: string;
	password: string;
	email: string;
}
