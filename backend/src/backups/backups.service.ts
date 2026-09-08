import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { spawnSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class BackupsService {
  private backupDir() {
    return path.resolve(
      process.cwd(),
      'backups',
      'database',
    );
  }

  private toolAvailable(tool: string) {
    const result = spawnSync(
      tool,
      ['--version'],
      { stdio: 'ignore' },
    );

    return result.status === 0;
  }

  status() {
    return {
      pgDumpAvailable:
        this.toolAvailable('pg_dump'),
      pgRestoreAvailable:
        this.toolAvailable('pg_restore'),
      restoreTargetConfigured:
        Boolean(process.env.RESTORE_DATABASE_URL),
      liveRestoreProtected: true,
    };
  }

  list() {
    const dir = this.backupDir();

    fs.mkdirSync(dir, {
      recursive: true,
      mode: 0o700,
    });

    return fs
      .readdirSync(dir)
      .filter((name) =>
        /^clgf-.*\.dump$/.test(name),
      )
      .map((name) => {
        const fullPath = path.join(dir, name);
        const stat = fs.statSync(fullPath);

        return {
          name,
          size: stat.size,
          createdAt: stat.mtime.toISOString(),
        };
      })
      .sort((a, b) =>
        b.createdAt.localeCompare(a.createdAt),
      );
  }

  create() {
    if (!this.toolAvailable('pg_dump')) {
      throw new BadRequestException(
        'pg_dump is not available on this server.',
      );
    }

    const script = path.resolve(
      process.cwd(),
      'scripts',
      'db-backup.js',
    );

    const result = spawnSync(
      process.execPath,
      [script],
      {
        cwd: process.cwd(),
        encoding: 'utf8',
      },
    );

    if (result.status !== 0) {
      throw new BadRequestException(
        result.stderr?.trim() ||
          'Database backup failed.',
      );
    }

    const backups = this.list();

    if (backups.length === 0) {
      throw new BadRequestException(
        'Backup completed but no dump file was found.',
      );
    }

    return {
      message: 'Backup created and verified.',
      backup: backups[0],
    };
  }

  getDownloadPath(name: string) {
    if (
      path.basename(name) !== name ||
      !/^clgf-.*\.dump$/.test(name)
    ) {
      throw new BadRequestException(
        'Invalid backup filename.',
      );
    }

    const fullPath = path.join(
      this.backupDir(),
      name,
    );

    if (!fs.existsSync(fullPath)) {
      throw new NotFoundException(
        'Backup file not found.',
      );
    }

    return fullPath;
  }
}
