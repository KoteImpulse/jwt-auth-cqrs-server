// @ts-check
import eslint from '@eslint/js';
import typescriptParser from '@typescript-eslint/parser';
import {createTypeScriptImportResolver} from 'eslint-import-resolver-typescript';
import importPlugin from 'eslint-plugin-import';
import unusedImports from 'eslint-plugin-unused-imports';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
	{
		ignores: ['eslint.config.mjs', 'config', 'node_modules', 'prisma/*', 'dist/*', 'test/*'],
	},
	eslint.configs.recommended,
	...tseslint.configs.recommendedTypeChecked,
	{
		languageOptions: {
			globals: {...globals.node, ...globals.jest},
			parser: typescriptParser,
			parserOptions: {
				sourceType: 'module',
				projectService: true,
				tsconfigRootDir: import.meta.dirname,
			},
		},
	},
	{
		plugins: {
			'@typescript-eslint': tseslint.plugin,
			import: importPlugin,
			'unused-imports': unusedImports,
		},
	},
	{
		settings: {
			'import/parsers': {
				'@typescript-eslint/parser': ['.ts', '.tsx', '.d.ts'],
			},
			'import/resolver': {
				typescript: createTypeScriptImportResolver({
					alwaysTryTypes: true,
					project: './tsconfig.json',
				}),
			},
		},
	},

	{
		rules: {
			// TypeScript правила
			'@typescript-eslint/no-explicit-any': 'warn',
			'@typescript-eslint/no-floating-promises': 'warn',
			'@typescript-eslint/no-unsafe-argument': 'warn',
			'@typescript-eslint/no-unused-vars': 'warn',
			'@typescript-eslint/no-unsafe-return': 'warn',
			'@typescript-eslint/no-unsafe-assignment': 'warn',
			'@typescript-eslint/require-await': 'warn',
			// '@typescript-eslint/no-unsafe-call': 'warn',
			// Базовые ESLint правила
			'no-param-reassign': 'warn',
			'no-undef': 'off',
			'no-shadow': 'warn',
			'no-underscore-dangle': 'off',
			'no-plusplus': 'warn',
			// Import plugin правила
			'import/no-unresolved': 'error',
			'import/named': 'error',
			'import/namespace': 'warn',
			'import/default': 'error',
			'import/export': 'error',
			'import/prefer-default-export': 'off',
			'import/extensions': 'off',
			'import/no-extraneous-dependencies': 'warn',
			// Unused imports правила
			'unused-imports/no-unused-imports': 'error',
			'unused-imports/no-unused-vars': 'off',
		},
	},
);
