import { execSync } from 'node:child_process';
import * as path from 'node:path';
import * as fs from 'node:fs';

const E2E_DB_FILE = path.join(process.cwd(), 'test', '.e2e-db.json');

export default async function globalTeardown(): Promise<void> {
  if (!fs.existsSync(E2E_DB_FILE)) return;

  const { containerId } = JSON.parse(
    fs.readFileSync(E2E_DB_FILE, 'utf-8'),
  ) as { connectionUri: string; containerId: string };

  try {
    execSync(`docker stop ${containerId}`, { stdio: 'inherit' });
  } catch {
    // Container may already be stopped
  }

  fs.unlinkSync(E2E_DB_FILE);
}
