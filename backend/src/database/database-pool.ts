import { Pool } from 'pg';

let pool: Pool | null = null;

export function getDatabasePool(): Pool {
  if (pool) {
    return pool;
  }

  const connectionString =
    process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error(
      'DATABASE_URL environment variable is required',
    );
  }

  pool = new Pool({
    connectionString,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
  });

  pool.on('error', (error) => {
    console.error(
      'Unexpected PostgreSQL pool error:',
      error.message,
    );
  });

  return pool;
}

export async function closeDatabasePool(): Promise<void> {
  if (!pool) {
    return;
  }

  const activePool = pool;
  pool = null;

  await activePool.end();

  console.log('PostgreSQL connection pool closed');
}
