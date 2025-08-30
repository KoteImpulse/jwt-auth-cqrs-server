/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {INestApplication, ValidationPipe, VersioningType} from '@nestjs/common';
import {Test} from '@nestjs/testing';
import * as request from 'supertest';

import {AppModule} from '../../../app.module';
import {prisma, setupTestDatabase, teardownTestDatabase} from '../../../shared/utils/test-utils';

describe('AuthController (e2e)', () => {
	let app: INestApplication;

	beforeAll(async () => {
		await setupTestDatabase();

		const module = await Test.createTestingModule({
			imports: [AppModule],
		}).compile();

		app = module.createNestApplication();
		app.setGlobalPrefix('api');
		app.enableVersioning({type: VersioningType.URI});
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

			const response = await request(app.getHttpServer()).post('/api/v1/auth/signup').send(signupData).expect(201);

			expect(response.body.user).toBeDefined();
			expect(response.body.user.email).toBe(signupData.email);
			expect(response.body.accessToken).toBeDefined();

			const cookies = response.headers['set-cookie'];
			expect(cookies).toBeDefined();
		});
	});
});
