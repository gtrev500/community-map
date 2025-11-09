#!/usr/bin/env node
/**
 * Simple migration runner for PostgreSQL
 * Runs all SQL files in the migrations/ directory in order
 */

import { readdir, readFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import postgres from 'postgres';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/gis';

async function runMigrations() {
	const sql = postgres(DATABASE_URL, {
		max: 1 // Single connection for migrations
	});

	try {
		console.log('🚀 Starting database migrations...\n');

		// Get all .sql files from migrations directory
		const migrationsDir = join(__dirname, '..', 'migrations');
		const files = await readdir(migrationsDir);
		const sqlFiles = files
			.filter(f => f.endsWith('.sql'))
			.sort(); // Sort to ensure correct order (001, 002, etc.)

		if (sqlFiles.length === 0) {
			console.log('⚠️  No migration files found');
			return;
		}

		// Run each migration
		for (const file of sqlFiles) {
			const filePath = join(migrationsDir, file);
			console.log(`📄 Running migration: ${file}`);

			const sqlContent = await readFile(filePath, 'utf-8');

			try {
				await sql.unsafe(sqlContent);
				console.log(`✅ ${file} completed successfully\n`);
			} catch (error) {
				console.error(`❌ Error in ${file}:`, error);
				throw error;
			}
		}

		console.log('✨ All migrations completed successfully!');
	} catch (error) {
		console.error('❌ Migration failed:', error);
		process.exit(1);
	} finally {
		await sql.end();
	}
}

runMigrations();
