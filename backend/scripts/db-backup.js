const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

function getDatabaseUrl() {
  const text = fs.readFileSync('.env', 'utf8');
  const match = text.match(/^DATABASE_URL=(.*)$/m);

  if (!match) {
    throw new Error('DATABASE_URL not found');
  }

  let value = match[1].trim();

  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    value = value.slice(1, -1);
  }

  return new URL(value);
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
  const url = getDatabaseUrl();

  const backupDir = path.resolve(
    'backups',
    'database',
  );

  fs.mkdirSync(backupDir, {
    recursive: true,
    mode: 0o700,
  });

  const stamp = new Date()
    .toISOString()
    .replace(/[:.]/g, '-');

  const output = path.join(
    backupDir,
    `clgf-${stamp}.dump`,
  );

  console.log('=== CLGF DATABASE BACKUP ===');
  console.log('Credentials: hidden');
  console.log('SSL root cert: system');
  console.log('Destination:', output);

  const result = spawnSync(
    'pg_dump',
    [
      '--format=custom',
      '--no-owner',
      '--no-privileges',
      '--file',
      output,
    ],
    {
      env: postgresEnv(url),
      stdio: [
        'ignore',
        'inherit',
        'inherit',
      ],
    },
  );

  if (result.status !== 0) {
    if (fs.existsSync(output)) {
      fs.rmSync(output);
    }

    throw new Error('Database backup failed');
  }

  const verify = spawnSync(
    'pg_restore',
    [
      '--list',
      output,
    ],
    {
      stdio: [
        'ignore',
        'ignore',
        'inherit',
      ],
    },
  );

  if (verify.status !== 0) {
    throw new Error(
      'Backup verification failed',
    );
  }

  const stats = fs.statSync(output);

  console.log(
    '✅ Backup created and verified',
  );
  console.log(
    'Size:',
    stats.size,
    'bytes',
  );
  console.log(
    'File:',
    output,
  );
} catch (error) {
  console.error(
    '❌',
    error instanceof Error
      ? error.message
      : 'Unknown backup error',
  );

  process.exit(1);
}
