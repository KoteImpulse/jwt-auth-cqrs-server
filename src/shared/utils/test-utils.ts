import {PrismaClient} from '@prisma-client';
import {execSync} from 'child_process';

export const prisma = new PrismaClient();

export const setupTestDatabase = async () => {
	execSync('npx prisma db push', {stdio: 'inherit'});
};

export const teardownTestDatabase = async () => {
	const tables = await prisma.$queryRaw<
		Array<{tablename: string}>
	>`SELECT tablename FROM pg_tables WHERE schemaname='public'`;

	for (const {tablename} of tables) {
		await prisma.$executeRawUnsafe(`TRUNCATE TABLE "${tablename}" RESTART IDENTITY CASCADE`);
	}
};
