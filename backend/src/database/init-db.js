require('dotenv').config();

const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

async function initializeDatabase() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  const schemaPath = path.join(
    __dirname,
    'schema.sql'
  );

  try {
    console.log('Connecting to database...');

    await client.connect();

    console.log('Reading database schema...');

    const schemaSql = fs.readFileSync(
      schemaPath,
      'utf8'
    );

    console.log('Applying CLGF CMS schema...');

    await client.query('BEGIN');

    await client.query(schemaSql);

    await client.query('COMMIT');

    console.log('✅ Database schema initialized successfully.');
  } catch (error) {
    try {
      await client.query('ROLLBACK');
    } catch {}

    console.error(
      '❌ Database initialization failed:',
      error.message
    );

    process.exitCode = 1;
  } finally {
    await client.end();
  }
}

initializeDatabase();
