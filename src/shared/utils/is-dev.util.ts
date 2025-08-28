import {ConfigService} from '@nestjs/config';

export const isDev = (configService: ConfigService) => configService.getOrThrow<string>('NODE_ENV') === 'development';

export const IS_DEV_ENV = process.env.NODE_ENV === 'development';
export const CACHE_TTL = process.env.ACCESS_TOKEN_EXPIRY_DAYS;
