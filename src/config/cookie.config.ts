import {CookieOptions} from 'express';

export function getCookieOptions(domain: string, isDev: boolean): CookieOptions {
	return {
		httpOnly: true,
		domain: domain,
		secure: !isDev,
		sameSite: 'lax',
	};
}
