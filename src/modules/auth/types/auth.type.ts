import {User} from '@prisma-client';
import type {Request} from 'express';
import {UserWithoutPassword} from 'src/modules/user/types/user.type';

export interface IPayload {
	id: string;
	version: number;
}

export type Tokens = {accessToken: string; refreshToken: string};

export type ClientResponse = {user: UserWithoutPassword; accessToken: string};

export type ServiceResult = {user: User; tokens: Tokens};
export type CommandExecuteResult = {user: UserWithoutPassword; tokens: Tokens};

export type ReqWithUser = Request & {user: UserWithoutPassword};
