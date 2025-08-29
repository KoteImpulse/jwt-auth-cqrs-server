export const authErrors = {
	service: {
		signup: {
			emailAlreadyExists: 'Пользователь с таким email уже существует',
			tokenVersionUndefined: 'Версия токена не определена',
		},
		signin: {
			userNotFound: 'Пользователь с таким email не найден',
			tokenVersionUndefined: 'Версия токена не определена',
		},
		refresh: {
			tokenMissing: 'Refresh токен утерян, необходима повторная авторизация',
			tokenVersionMismatch: 'Refresh токен утерян, необходима повторная авторизация',
			userNotFound: 'Пользователь с таким email не найден',
			tokenVersionUndefined: 'Версия токена не определена',
		},
		generateTokens: {
			userIdMissing: 'Для генерации токена нужен Id пользователя',
		},
		validateUser: {
			userNotFound: 'Пользователь с таким email не найден',
		},
		logout: {
			invalidToken: 'Access токен недействителен',
		},
	},

	dto: {
		signup: {
			emailNotString: 'Поле почты должно быть строкой',
			emailEmpty: 'Поле почты не может быть пустым',
			invalidEmailFormat: 'Некорректный формат почты',
			emailLength: (min: number, max: number) => `Почта должна быть от ${min} до ${max} символов`,

			usernameNotString: 'Поле имени пользователя должно быть строкой',
			usernameEmpty: 'Поле имени пользователя не может быть пустым',
			usernameLength: (min: number, max: number) => `Имя пользователя должно быть от ${min} до ${max} символов`,
			usernamePattern: 'Имя пользователя может содержать латинские буквы, цифры и специальные символы',

			passwordNotString: 'Поле пароля должно быть строкой',
			passwordEmpty: 'Поле пароля не может быть пустым',
			passwordMinLength: (min: number) => `Пароль должен быть не менее ${min} символов`,
		},

		signin: {
			emailNotString: 'Поле почты должно быть строкой',
			emailEmpty: 'Поле почты не может быть пустым',
			invalidEmailFormat: 'Некорректный формат почты',
			emailLength: (min: number, max: number) => `Почта должна быть от ${min} до ${max} символов`,

			passwordNotString: 'Поле пароля должно быть строкой',
			passwordEmpty: 'Поле пароля не может быть пустым',
			passwordMinLength: (min: number) => `Пароль должен быть не менее ${min} символов`,
		},
	},
};
