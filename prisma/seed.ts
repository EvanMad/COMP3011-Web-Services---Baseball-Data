import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client';
import { parse } from 'csv-parse/sync'; // Install with: npm install csv-parse
import fs from 'fs';
import 'dotenv/config';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// Helper to handle empty strings in numeric fields
const zapNum = (val: string) => (val && val !== '' ? parseInt(val) : null);
const zapFloat = (val: string) => (val && val !== '' ? parseFloat(val) : null);

async function seedPlayers() {
  console.log('⏳ Processing Players...');
  const fileContent = fs.readFileSync('data/People.csv', 'utf-8');
  
  const records = parse(fileContent, {
    columns: true,
    skip_empty_lines: true,
  });

  const players = records
    .filter((r: any) => r.debut && parseInt(r.debut.substring(0, 4)) >= 2000)
    .map((r: any) => ({
      playerID: r.playerID,
      nameFirst: r.nameFirst || null,
      nameLast: r.nameLast || null,
      dateOfBirth: formatDateToISO(r.birthYear, r.birthMonth, r.birthDay),
      dateOfDeath: formatDateToISO(r.deathYear, r.deathMonth, r.deathDay),
      birthCountry: r.birthCountry || null,
      weight: zapNum(r.weight),
      height: zapNum(r.height),
      bats: r.bats || null,
      throws: r.throws || null,
    }));

  await prisma.player.deleteMany();
  await prisma.player.createMany({ data: players });
  console.log(`✅ Inserted ${players.length} players.`);
  return players.map(p => p.playerID); // Return IDs to filter stats later
}

async function seedBattingStats(validPlayerIDs: Set<string>) {
  console.log('⏳ Processing Batting Stats...');
  const fileContent = fs.readFileSync('data/Batting.csv', 'utf-8');
  const records = parse(fileContent, { columns: true });

  const batch = records
    .filter((r: any) => validPlayerIDs.has(r.playerID))
    .map((r: any) => ({
      playerID: r.playerID,
      yearID: parseInt(r.yearID),
      stint: parseInt(r.stint),
      teamID: r.teamID,
      lgID: r.lgID,
      G: zapNum(r.G),
      AB: zapNum(r.AB),
      R: zapNum(r.R),
      H: zapNum(r.H),
      HR: zapNum(r.HR),
      RBI: zapNum(r.RBI),
      SB: zapNum(r.SB),
      BB: zapNum(r.BB),
      HBP: zapNum(r.HBP),
      SF: zapNum(r.SF),
      DOUBLE: zapNum(r['2B']),
      TRIPLE: zapNum(r['3B']),
    }));

  await prisma.batting.deleteMany();
  await prisma.batting.createMany({ data: batch });
  console.log(`✅ Inserted ${batch.length} batting records.`);
}

async function seedPitchingStats(validPlayerIDs: Set<string>) {
  console.log('⏳ Processing Pitching Stats...');
  const fileContent = fs.readFileSync('data/Pitching.csv', 'utf-8');
  const records = parse(fileContent, { columns: true });

  const batch = records
    .filter((r: any) => validPlayerIDs.has(r.playerID))
    .map((r: any) => ({
      playerID: r.playerID,
      yearID: parseInt(r.yearID),
      stint: parseInt(r.stint),
      teamID: r.teamID,
      W: zapNum(r.W),
      L: zapNum(r.L),
      ERA: zapFloat(r.ERA),
      SO: zapNum(r.SO),
    }));

  await prisma.pitching.deleteMany();
  await prisma.pitching.createMany({ data: batch });
  console.log(`✅ Inserted ${batch.length} pitching records.`);
}

function formatDateToISO(y: string, m: string, d: string): string | null {
  if (!y || !m || !d) return null;
  return new Date(`${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}T00:00:00Z`).toISOString();
}

async function main() {
  const playerIDs = await seedPlayers();
  const idSet = new Set(playerIDs);
  
  await seedBattingStats(idSet);
  await seedPitchingStats(idSet);
}

main().catch(console.error).finally(() => prisma.$disconnect());