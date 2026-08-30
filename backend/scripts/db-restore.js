const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

function cleanUrl(value) {
  let result = value.trim();

  if (
    (result.startsWith('"') && result.endsWith('"')) ||
    (result.startsWith("'") && result.endsWith("'"))
  ) {
    result = result.slice(1, -1);
  }

  return new URL(result);
}

function envValue(text, name) {
  const match = text.match(
    new RegExp(`^${name}=(.*)$`, 'm'),
  );

  return match ? match[1].trim() : null;
}

function identity(url) {
  return [
    url.hostname,
    url.port || '5432',
    decodeURIComponent(
      url.pathname.replace(/^\//, ''),
    ),
    decodeURIComponent(url.username),
  ].join('|');
}

function postgresEnv(url) {
  return {
    ...process.env,
    PGHOST: url.hostname,
    PGPORT: url.port || '5432',
    PGDATABASE: decodeURIComponent(
      url.pathname.replace(/^\//, ''),
    ),
    PGUSER: decodeURIComponent(url.username),
    PGPASSWORD: decodeURIComponent(url.password),
    PGSSLMODE:
      url.searchParams.get('sslmode') || 'verify-full',
    PGSSLROOTCERT: 'system',
    PGCHANNELBINDING:
      url.searchParams.get('channel_binding') || 'require',
  };
}

try {
  const dumpArg = process.argv[2];

  if (!dumpArg) {
    throw new Error(
      'Usage: npm run db:restore -- <dump-file>',
    );
  }

  const dumpFile = path.resolve(dumpArg);

  if (!fs.existsSync(dumpFile)) {
    throw new Error(
      'Dump file does not exist',
    );
  }

  if (
    process.env.RESTORE_CONFIRM !== 'RESTORE'
  ) {
    throw new Error(
      'RESTORE_CONFIRM=RESTORE is required',
    );
  }

  const text = fs.readFileSync('.env', 'utf8');

  const liveValue = envValue(
    text,
    'DATABASE_URL',
  );

  if (!liveValue) {
    throw new Error(
      'DATABASE_URL not found',
    );
  }

  if (!process.env.RESTORE_DATABASE_URL) {
    throw new Error(
      'RESTORE_DATABASE_URL is required',
    );
  }

  const liveUrl = cleanUrl(liveValue);
  const restoreUrl = cleanUrl(
    process.env.RESTORE_DATABASE_URL,
  );

  if (
    identity(liveUrl) === identity(restoreUrl)
  ) {
    throw new Error(
      'Restore target matches the live database. Refusing to continue.',
    );
  }

  const pgEnv = postgresEnv(restoreUrl);

  console.log(
    '=== CLGF DATABASE RESTORE ===',
  );
  console.log('Dump:', dumpFile);
  console.log('Target credentials: hidden');
  console.log(
    'Live database protection: passed',
  );

  const result = spawnSync(
    'pg_restore',
    [
      '--exit-on-error',
      '--no-owner',
      '--no-privileges',
      '--dbname',
      pgEnv.PGDATABASE,
      dumpFile,
    ],
    {
      env: pgEnv,
      stdio: [
        'ignore',
        'inherit',
        'inherit',
      ],
    },
  );

  if (result.status !== 0) {
    throw new Error('Restore failed');
  }

  console.log('✅ Restore completed');
} catch (error) {
  console.error(
    '❌',
    error instanceof Error
      ? error.message
      : 'Unknown restore error',
  );

  process.exit(1);
}
