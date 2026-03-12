import * as path from 'node:path';
import * as fs from 'node:fs';

const E2E_DB_FILE = path.join(process.cwd(), 'test', '.e2e-db.json');

if (fs.existsSync(E2E_DB_FILE)) {
  const { connectionUri } = JSON.parse(
    fs.readFileSync(E2E_DB_FILE, 'utf-8'),
  ) as { connectionUri: string; containerId: string };
  process.env.DATABASE_URL = connectionUri;
}
