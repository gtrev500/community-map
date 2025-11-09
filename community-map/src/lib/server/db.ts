/**
 * Database connection pool for PostgreSQL/PostGIS
 * Uses postgres.js for modern async/await interface
 */

import postgres from 'postgres';
import { DATABASE_URL } from '$env/static/private';

// Create a singleton connection pool
const sql = postgres(DATABASE_URL, {
	max: 10, // Maximum number of connections
	idle_timeout: 20, // Close idle connections after 20 seconds
	connect_timeout: 10 // Connection timeout in seconds
});

export default sql;
