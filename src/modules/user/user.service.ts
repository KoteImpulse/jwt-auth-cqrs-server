import {Injectable} from '@nestjs/common';
import {User} from '@prisma-client';
import {PrismaService} from 'src/core/prisma/prisma.service';

import {ICreateUser} from './types/user.type';

@Injectable()
export class UserService {
	constructor(private prismaService: PrismaService) {}

	async checkUserExists(email: string): Promise<boolean> {
		const user = await this.prismaService.user.findUnique({where: {email}});
		return !!user;
	}

	async createUser({username, password, email}: ICreateUser): Promise<User> {
		const user = await this.prismaService.user.create({data: {username, password, email}});
		return user;
	}

	async findUserById(userId: string): Promise<User | null> {
		const user = await this.prismaService.user.findUnique({where: {id: userId}});
		return user;
	}

	async findUserByEmail(email: string): Promise<User | null> {
		const user = await this.prismaService.user.findUnique({where: {email}});
		return user;
	}

	async incrementRefreshTokenVersion(userId: string) {
		await this.prismaService.user.update({where: {id: userId}, data: {refreshTokenVersion: {increment: 1}}});
	}
}
