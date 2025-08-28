/* eslint-disable @typescript-eslint/no-unused-vars */
export function excludePassword<T extends {password: string}>(user: T): Omit<T, 'password'> {
	if (!user) {
		return null;
	}
	if ('password' in user) {
		const {password: _, ...result} = user;
		return result;
	} else {
		return user;
	}
}
