import { execSync } from 'node:child_process';
import * as path from 'node:path';
import * as fs from 'node:fs';
import { PostgreSqlContainer } from '@testcontainers/postgresql';

const E2E_DB_FILE = path.join(process.cwd(), 'test', '.e2e-db.json');

export default async function globalSetup(): Promise<void> {
  // Disable Ryuk reaper so container lifecycle is managed by globalTeardown
  process.env.TESTCONTAINERS_RYUK_DISABLED = 'true';

  const container = await new PostgreSqlContainer('postgres:16-alpine').start();
  const connectionUri = container.getConnectionUri();
  const containerId = container.getId();

  process.env.DATABASE_URL = connectionUri;
  execSync('npx prisma db push', {
    env: { ...process.env, DATABASE_URL: connectionUri },
    stdio: 'inherit',
  });

  fs.mkdirSync(path.dirname(E2E_DB_FILE), { recursive: true });
  fs.writeFileSync(
    E2E_DB_FILE,
    JSON.stringify({ connectionUri, containerId }, null, 2),
  );
}
