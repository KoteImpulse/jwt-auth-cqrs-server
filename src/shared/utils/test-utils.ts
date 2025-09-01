import {PrismaClient} from '@prisma-client';
import {execSync} from 'child_process';

export const setupTestDatabase = async () => {
	execSync('npx prisma db push', {stdio: 'inherit'});
};

export const teardownTestDatabase = async (prisma: PrismaClient) => {
	const tables = await prisma.$queryRaw<Array<{tablename: string}>>`
    SELECT tablename FROM pg_tables 
    WHERE schemaname='public' AND tablename != '_prisma_migrations';
  `;

	for (const {tablename} of tables) {
		await prisma.$executeRawUnsafe(`TRUNCATE TABLE "${tablename}" RESTART IDENTITY CASCADE;`);
	}
};
