/**
 * Upload all compressed sign JSON files to Cloudflare R2.
 *
 * Setup :
 *   1. Ajoute ces variables dans .env.local :
 *        R2_ACCOUNT_ID=32c6d6504f3e66896259884dc2449672
 *        R2_ACCESS_KEY_ID=<ton Access Key ID>
 *        R2_SECRET_ACCESS_KEY=<ton Secret Access Key>
 *        R2_BUCKET_NAME=sign-langage
 *        R2_PUBLIC_URL=https://pub-xxxx.r2.dev   (URL publique r2.dev du bucket)
 *
 *   2. Lancer :
 *        npx tsx scripts/upload-signs-to-r2.ts
 */

import { S3Client, PutObjectCommand, HeadObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';
import * as fs from 'fs';
import * as path from 'path';

// ── Charge .env.local ──────────────────────────────────────────────────────────
function loadEnvLocal() {
  const p = path.resolve(__dirname, '../.env.local');
  if (!fs.existsSync(p)) return;
  for (const line of fs.readFileSync(p, 'utf-8').split('\n')) {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)="?(.*?)"?\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/\\n/g, '\n');
  }
}
loadEnvLocal();

// ── Config ─────────────────────────────────────────────────────────────────────
const ACCOUNT_ID  = process.env.R2_ACCOUNT_ID!;
const ACCESS_KEY  = process.env.R2_ACCESS_KEY_ID!;
const SECRET_KEY  = process.env.R2_SECRET_ACCESS_KEY!;
const BUCKET      = process.env.R2_BUCKET_NAME ?? 'sign-langage';
const PUBLIC_URL  = (process.env.R2_PUBLIC_URL ?? '').replace(/\/$/, '');

const COMPRESSED_DIR = path.resolve(__dirname, '../../Avatar/public/signs_compressed');
const MANIFEST_PATH  = path.resolve(__dirname, '../public/signs-manifest.json');
const BATCH_SIZE     = 30;

for (const [k, v] of [['R2_ACCOUNT_ID', ACCOUNT_ID], ['R2_ACCESS_KEY_ID', ACCESS_KEY], ['R2_SECRET_ACCESS_KEY', SECRET_KEY]] as [string, string][]) {
  if (!v) { console.error(`❌ ${k} manquant dans .env.local`); process.exit(1); }
}
if (!fs.existsSync(COMPRESSED_DIR)) {
  console.error(`❌ Dossier introuvable : ${COMPRESSED_DIR}`);
  process.exit(1);
}

// ── Client S3 (compatible R2) ──────────────────────────────────────────────────
const s3 = new S3Client({
  region: 'auto',
  endpoint: `https://${ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: { accessKeyId: ACCESS_KEY, secretAccessKey: SECRET_KEY },
});

// ── Récupère les fichiers déjà uploadés ───────────────────────────────────────
async function getExisting(): Promise<Set<string>> {
  const existing = new Set<string>();
  let token: string | undefined;
  do {
    const res = await s3.send(new ListObjectsV2Command({
      Bucket: BUCKET,
      Prefix: 'signs/',
      ContinuationToken: token,
    }));
    for (const obj of res.Contents ?? []) {
      if (obj.Key) existing.add(path.basename(obj.Key));
    }
    token = res.IsTruncated ? res.NextContinuationToken : undefined;
  } while (token);
  return existing;
}

// ── Upload un fichier ──────────────────────────────────────────────────────────
async function uploadFile(file: string): Promise<string> {
  const filePath = path.join(COMPRESSED_DIR, file);
  const body     = fs.readFileSync(filePath);
  await s3.send(new PutObjectCommand({
    Bucket:      BUCKET,
    Key:         `signs/${file}`,
    Body:        body,
    ContentType: 'application/json',
    CacheControl: 'public, max-age=31536000, immutable',
  }));
  return PUBLIC_URL ? `${PUBLIC_URL}/signs/${file}` : `https://${ACCOUNT_ID}.r2.cloudflarestorage.com/${BUCKET}/signs/${file}`;
}

// ── Main ───────────────────────────────────────────────────────────────────────
async function main() {
  console.log('='.repeat(62));
  console.log('  Upload des signes → Cloudflare R2');
  console.log('='.repeat(62));

  const allFiles = fs.readdirSync(COMPRESSED_DIR).filter(f => f.endsWith('.json'));
  console.log(`\n  ${allFiles.length} fichiers compressés | bucket: ${BUCKET}\n`);

  console.log('  Vérification des fichiers existants…');
  const existing = await getExisting();
  console.log(`  ${existing.size} déjà uploadés\n`);

  const todo = allFiles.filter(f => !existing.has(f));
  if (todo.length === 0) { console.log('  ✓ Tout est déjà uploadé !'); return buildManifest(allFiles); }

  console.log(`  ${todo.length} fichiers à uploader…\n`);

  const manifest: Record<string, string> = {};
  let done = 0, errors = 0;
  const t0 = Date.now();

  for (let i = 0; i < todo.length; i += BATCH_SIZE) {
    const batch   = todo.slice(i, i + BATCH_SIZE);
    const results = await Promise.allSettled(batch.map(uploadFile));

    for (let j = 0; j < batch.length; j++) {
      const r = results[j];
      if (r.status === 'fulfilled') {
        const signId = batch[j].replace('.json', '');
        manifest[signId] = r.value;
        done++;
      } else {
        console.warn(`\n  ⚠ ${batch[j]}: ${(r.reason as Error).message}`);
        errors++;
      }
    }

    const elapsed = (Date.now() - t0) / 1000;
    const rate    = done / elapsed;
    const eta     = rate > 0 ? Math.round((todo.length - done) / rate) : 0;
    const pct     = Math.round((done / todo.length) * 100);
    process.stdout.write(`\r  [${pct}%] ${done}/${todo.length} uploadés — ETA ${eta}s   `);
  }

  console.log(`\n\n  ✓ ${done} uploadés  |  ✗ ${errors} erreurs\n`);
  await buildManifest(allFiles, manifest);
}

async function buildManifest(allFiles: string[], newUrls: Record<string, string> = {}) {
  // Charger manifest existant
  let manifest: Record<string, string> = {};
  if (fs.existsSync(MANIFEST_PATH)) {
    manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf-8'));
  }
  Object.assign(manifest, newUrls);
  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2));
  console.log(`  Manifest → public/signs-manifest.json (${Object.keys(manifest).length} signes)`);

  if (PUBLIC_URL) {
    console.log('\n  Ajoute dans .env.local (et dans Vercel Settings → Env Vars) :');
    console.log(`  NEXT_PUBLIC_SIGNS_CDN=${PUBLIC_URL}`);
  }
  console.log('='.repeat(62));
}

main().catch(e => { console.error('\n❌', e.message); process.exit(1); });
