import {HttpStatus, INestApplication, ValidationPipe, VersioningType} from '@nestjs/common';
import {Test} from '@nestjs/testing';
import * as cookieParser from 'cookie-parser';
import * as jwt from 'jsonwebtoken';
import {PrismaService} from 'src/core/prisma/prisma.service';
import {UserWithoutPassword} from 'src/modules/user/types/user.type';
import {authFixtures} from 'src/shared/tests/fixtures';
import * as request from 'supertest';

import {AppModule} from '../../../app.module';
import {setupTestDatabase, teardownTestDatabase} from '../../../shared/utils/test-utils';

interface SignupResponse {
	user: UserWithoutPassword;
	accessToken: string;
}

describe('AuthController (e2e)', () => {
	let app: INestApplication;
	let prisma: PrismaService;

	let accessToken: string;
	let refreshToken: string;
	let cookie: string;

	const {mockSignupDto, mockSigninDto} = authFixtures;

	function expectUserAndAccessToken(body: SignupResponse) {
		expect(body).toHaveProperty('user');
		expect(body).toHaveProperty('accessToken');
	}

	beforeAll(async () => {
		await setupTestDatabase();

		const module = await Test.createTestingModule({
			imports: [AppModule],
		}).compile();

		app = module.createNestApplication();
		app.setGlobalPrefix('api');
		prisma = app.get(PrismaService);

		app.use(cookieParser());
		app.enableVersioning({type: VersioningType.URI});
		app.useGlobalPipes(new ValidationPipe({whitelist: true}));
		await app.init();
	});

	afterAll(async () => {
		await teardownTestDatabase(prisma);
		await prisma.$disconnect();
		await app.close();
	});

	describe('/api/v1/auth/signup (POST)', () => {
		it('Успешная регистрация', async () => {
			const res = await request(app.getHttpServer())
				.post('/api/v1/auth/signup')
				.send(mockSignupDto)
				.expect(HttpStatus.CREATED);

			const body = res.body as unknown as SignupResponse;

			expectUserAndAccessToken(body);
			expect(body.user.email).toBe(mockSignupDto.email);
			expect(res.headers['set-cookie']).toBeDefined();

			cookie = res.headers['set-cookie'][0];
			accessToken = body.accessToken;
			refreshToken = cookie.split(';')[0].split('=')[1];
		});

		it('Ошибка при повторной регистрации', async () => {
			await request(app.getHttpServer()).post('/api/v1/auth/signup').send(mockSignupDto).expect(HttpStatus.CONFLICT);
		});
		it('Ошибка при попытке регистрации с данными, неподходящими для валидации', async () => {
			await request(app.getHttpServer())
				.post('/api/v1/auth/signup')
				.send({password: null, email: 'fall', username: 'oky'})
				.expect(HttpStatus.BAD_REQUEST);
		});
	});
	describe('/api/v1/auth/signin (POST)', () => {
		it('Успешный вход', async () => {
			const res = await request(app.getHttpServer())
				.post('/api/v1/auth/signin')
				.send(mockSigninDto)
				.expect(HttpStatus.OK);

			const body = res.body as unknown as SignupResponse;

			expectUserAndAccessToken(body);
			expect(body.user.email).toBe(mockSignupDto.email);
			expect(res.headers['set-cookie']).toBeDefined();

			cookie = res.headers['set-cookie'][0];
			accessToken = body.accessToken;
			refreshToken = cookie.split(';')[0].split('=')[1];
		});

		it('Ошибка при входе с неверными данными', async () => {
			await request(app.getHttpServer())
				.post('/api/v1/auth/signin')
				.send({email: 'email@email.email', password: 'fall123'})
				.expect(HttpStatus.NOT_FOUND);
		});
		it('Ошибка при входе с данными, неподходящими для валидации', async () => {
			await request(app.getHttpServer())
				.post('/api/v1/auth/signin')
				.send({username: 'fall', password: 'fall'})
				.expect(HttpStatus.BAD_REQUEST);
		});
	});
	describe('/api/v1/auth/refresh (POST)', () => {
		it('Успешное обновление токена', async () => {
			const res = await request(app.getHttpServer())
				.post('/api/v1/auth/refresh')
				.set('Cookie', [`refreshToken=${refreshToken}`])
				.expect(HttpStatus.OK);

			const body = res.body as SignupResponse;

			expectUserAndAccessToken(body);
			expect(body.user.email).toBe(mockSignupDto.email);
			expect(res.headers['set-cookie']).toBeDefined();

			cookie = res.headers['set-cookie'][0];
			accessToken = body.accessToken;
			refreshToken = cookie.split(';')[0].split('=')[1];
		});

		it('Ошибка при обновлении токена, если токен неверный (без id пользователя)', async () => {
			const fakeToken = jwt.sign({id: '', version: 0}, process.env.JWT_SECRET, {
				expiresIn: '1h',
			});
			await request(app.getHttpServer())
				.post('/api/v1/auth/refresh')
				.set('Cookie', [`refreshToken=${fakeToken}`])
				.expect(HttpStatus.UNAUTHORIZED);
		});

		it('Ошибка при обновлении токена, если токен неверный (пользователя нет в базе)', async () => {
			const fakeToken = jwt.sign({id: 'user-123', version: 0}, process.env.JWT_SECRET, {
				expiresIn: '1h',
			});
			await request(app.getHttpServer())
				.post('/api/v1/auth/refresh')
				.set('Cookie', [`refreshToken=${fakeToken}`])
				.expect(HttpStatus.NOT_FOUND);
		});

		it('Ошибка при обновлении токена, если версия токена не совпадает с той, что в бд записана', async () => {
			const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET) as {
				id: string;
				version: number;
				iat: number;
				exp: number;
			};

			const newFakeToken = jwt.sign({...decoded, version: null}, process.env.JWT_SECRET);

			await request(app.getHttpServer())
				.post('/api/v1/auth/refresh')
				.set('Cookie', [`refreshToken=${newFakeToken}`])
				.expect(HttpStatus.UNAUTHORIZED);
		});
	});

	describe('/api/v1/auth/logout (POST)', () => {
		it('Успешный выход из системы', async () => {
			const res = await request(app.getHttpServer())
				.post('/api/v1/auth/logout')
				.set('Authorization', `Bearer ${accessToken}`)
				.set('Cookie', cookie)
				.expect(HttpStatus.NO_CONTENT);

			const cookies = res.headers['set-cookie'][0];
			expect(cookies).toContain('refreshToken=');
			expect(cookies).toMatch(/Expires=.*Thu, 01 Jan 1970/);
		});

		it('Ошибка при выходе без авторизации', async () => {
			await request(app.getHttpServer()).post('/api/v1/auth/logout').expect(HttpStatus.UNAUTHORIZED);
		});
	});

	describe('Register -> register2 (err) -> login (err) -> login -> refresh -> refresh -> logout -> refresh -> logout', () => {
		it('Полный тест', async () => {
			const newSignupDto = {email: 'email@email1.email', password: '12345', username: 'username1'};
			const newSigninDto = {email: 'email@email1.email', password: '12345'};

			const resSignup = await request(app.getHttpServer())
				.post('/api/v1/auth/signup')
				.send(newSignupDto)
				.expect(HttpStatus.CREATED);

			const bodySignup = resSignup.body as unknown as SignupResponse;

			expectUserAndAccessToken(bodySignup);

			let cookie2: string = resSignup.headers['set-cookie'][0];
			let accessToken2: string = bodySignup.accessToken;

			await request(app.getHttpServer()).post('/api/v1/auth/signup').send(newSignupDto).expect(HttpStatus.CONFLICT);

			await request(app.getHttpServer())
				.post('/api/v1/auth/signin')
				.send({email: 'email@email1234.email', password: 'fall123'})
				.expect(HttpStatus.NOT_FOUND);

			await request(app.getHttpServer())
				.post('/api/v1/auth/signin')
				.send({email: 'email@email1.email', password: '1234567'})
				.expect(HttpStatus.NOT_FOUND);

			const resSignin = await request(app.getHttpServer())
				.post('/api/v1/auth/signin')
				.send(newSigninDto)
				.expect(HttpStatus.OK);

			const bodySignin = resSignin.body as unknown as SignupResponse;

			expectUserAndAccessToken(bodySignin);

			cookie2 = resSignin.headers['set-cookie'][0];
			accessToken2 = bodySignin.accessToken;

			const resRefresh1 = await request(app.getHttpServer())
				.post('/api/v1/auth/refresh')
				.set('Cookie', cookie2)
				.expect(HttpStatus.OK);

			const bodyRefresh1 = resRefresh1.body as unknown as SignupResponse;

			expectUserAndAccessToken(bodyRefresh1);

			cookie2 = resRefresh1.headers['set-cookie'][0];
			accessToken2 = bodyRefresh1.accessToken;

			const resRefresh2 = await request(app.getHttpServer())
				.post('/api/v1/auth/refresh')
				.set('Cookie', cookie2)
				.expect(HttpStatus.OK);

			const bodyRefresh2 = resRefresh2.body as unknown as SignupResponse;

			expectUserAndAccessToken(bodyRefresh2);

			cookie2 = resRefresh2.headers['set-cookie'][0];
			accessToken2 = bodyRefresh2.accessToken;

			const resLogout = await request(app.getHttpServer())
				.post('/api/v1/auth/logout')
				.set('Authorization', `Bearer ${accessToken2}`)
				.expect(HttpStatus.NO_CONTENT);

			const cookies = resLogout.headers['set-cookie'][0];
			expect(cookies).toContain('refreshToken=');
			expect(cookies).toMatch(/Expires=.*Thu, 01 Jan 1970/);

			await request(app.getHttpServer()).post('/api/v1/auth/refresh').expect(HttpStatus.UNAUTHORIZED);

			await request(app.getHttpServer()).post('/api/v1/auth/logout').expect(HttpStatus.UNAUTHORIZED);
		});
	});
});
