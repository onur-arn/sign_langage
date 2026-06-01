/**
 * Force-upload a single sign to R2, overwriting any existing version.
 * Usage: npx tsx scripts/force-upload-one.ts notre_nous
 */

import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import * as fs from 'fs';
import * as path from 'path';

function loadEnvLocal() {
  const p = path.resolve(__dirname, '../.env.local');
  if (!fs.existsSync(p)) return;
  for (const line of fs.readFileSync(p, 'utf-8').split('\n')) {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)="?(.*?)"?\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/\\n/g, '\n');
  }
}
loadEnvLocal();

const ACCOUNT_ID = process.env.R2_ACCOUNT_ID!;
const ACCESS_KEY = process.env.R2_ACCESS_KEY_ID!;
const SECRET_KEY = process.env.R2_SECRET_ACCESS_KEY!;
const BUCKET     = process.env.R2_BUCKET_NAME ?? 'sign-langage';
const PUBLIC_URL = (process.env.R2_PUBLIC_URL ?? '').replace(/\/$/, '');

const COMPRESSED_DIR = path.resolve(__dirname, '../../Avatar/public/signs_compressed');

for (const [k, v] of [['R2_ACCOUNT_ID', ACCOUNT_ID], ['R2_ACCESS_KEY_ID', ACCESS_KEY], ['R2_SECRET_ACCESS_KEY', SECRET_KEY]] as [string, string][]) {
  if (!v) { console.error(`❌ ${k} manquant dans .env.local`); process.exit(1); }
}

const slug = process.argv[2];
if (!slug) { console.error('Usage: npx tsx scripts/force-upload-one.ts <slug>'); process.exit(1); }

const filename = slug.endsWith('.json') ? slug : `${slug}.json`;
const filePath = path.join(COMPRESSED_DIR, filename);

if (!fs.existsSync(filePath)) {
  console.error(`❌ Fichier introuvable : ${filePath}`);
  process.exit(1);
}

const s3 = new S3Client({
  region: 'auto',
  endpoint: `https://${ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: { accessKeyId: ACCESS_KEY, secretAccessKey: SECRET_KEY },
});

async function main() {
  const body = fs.readFileSync(filePath);
  console.log(`⬆  Upload force de ${filename} (${(body.length / 1000).toFixed(1)} KB)…`);

  await s3.send(new PutObjectCommand({
    Bucket:       BUCKET,
    Key:          `signs/${filename}`,
    Body:         body,
    ContentType:  'application/json',
    CacheControl: 'public, max-age=0, must-revalidate',
  }));

  const url = `${PUBLIC_URL}/signs/${filename}`;
  console.log(`✓ Uploadé → ${url}`);
}

main().catch(e => { console.error('❌', e.message); process.exit(1); });
