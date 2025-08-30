/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import {INestApplication, ValidationPipe, VersioningType} from '@nestjs/common';
import {Test} from '@nestjs/testing';
import * as request from 'supertest';

import {prisma, setupTestDatabase, teardownTestDatabase} from '../../../shared/utils/test-utils';
import {AppModule} from '../../../app.module';

describe('AuthController (e2e)', () => {
	let app: INestApplication;

	beforeAll(async () => {
		await setupTestDatabase();

		const moduleRef = await Test.createTestingModule({
			imports: [AppModule],
		}).compile();

		app = moduleRef.createNestApplication();
		app.setGlobalPrefix('api'); // глобальный префикс
		app.enableVersioning({type: VersioningType.URI}); // versioning включен
		app.useGlobalPipes(new ValidationPipe({whitelist: true}));
		await app.init();
	});

	afterAll(async () => {
		await teardownTestDatabase();
		await prisma.$disconnect();
		await app.close();
	});

	describe('/api/v1/auth/signup (POST)', () => {
		it('should create a new user and return tokens', async () => {
			const signupData = {
				email: 'testuser@example2.com',
				username: 'testuser2',
				password: '123456',
			};

			const response = await request(app.getHttpServer())
				.post('/api/v1/auth/signup') // учитываем prefix + version
				.send(signupData)
				.expect(201);

			// проверяем тело ответа
			expect(response.body.user).toBeDefined();
			expect(response.body.user.email).toBe(signupData.email);
			expect(response.body.accessToken).toBeDefined();

			// проверяем refreshToken в куки
			const cookies = response.headers['set-cookie'];
			expect(cookies).toBeDefined();
			// expect(cookies.some((c: string) => c.includes('refreshToken'))).toBeTruthy();
		});
	});
});
