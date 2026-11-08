import pg from 'pg';
import { env } from './utils/env.js';

// One pool for the whole app
const pool = new pg.Pool({ connectionString: env.DATABASE_URL });

pool.on('error', (err) => {
  console.error('Postgres pool error:', err.message);
});

export default pool;
