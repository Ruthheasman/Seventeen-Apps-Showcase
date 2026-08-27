// Utility: refresh each showcased app's preview image by pulling its live Open
// Graph / Twitter card image into artifacts/seventeen-apps/public/apps/.
// Apps with no usable og:image are reported as MISS and were captured manually
// with a live screenshot instead — re-running this will not overwrite those.
// Run with: pnpm --filter @workspace/scripts run fetch-app-previews
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const apps = [
  { slug: '1satchel', url: 'https://1satchel.com' },
  { slug: 'permastack', url: 'https://permastackpress.com' },
  { slug: 'mintpage', url: 'https://mintpage.pro' },
  { slug: 'sonicstar', url: 'https://sonicstar.net' },
  { slug: 'bsv-patent-forge', url: 'https://bsvpatentforge.com' },
  { slug: 'wonkerly', url: 'https://wonkerly.com' },
  { slug: 'brandcaster', url: 'https://brandcaster.studio' },
  { slug: 'vibeglowup', url: 'https://vibeglowup.com' },
  { slug: 'rapid-reader', url: 'https://rapidreader.net' },
  { slug: 'startupscout', url: 'https://startupscout.co' },
  { slug: 'number-cruncher-3d', url: 'https://numbercrunchermath.com' },
  { slug: 'ai-bitcoin-revolution', url: 'https://aibitcoinrevolution.com' },
  { slug: 'bsv-halloween', url: 'https://bsv-halloween-snap-game.replit.app' },
  { slug: 'ai-chef', url: 'https://ai-chef-assistant--ruthheasman.replit.app' },
  { slug: 'terapong', url: 'https://terapong-game.replit.app' },
  { slug: 'verihalo', url: 'https://veri-halo.replit.app/web/' },
  { slug: 'quiz-battle-live', url: 'https://quiz-battle-live.replit.app' },
];

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const OUT_DIR = path.join(REPO_ROOT, 'artifacts/seventeen-apps/public/apps');
const UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36';

const META_PROPS = [
  'og:image:secure_url',
  'og:image',
  'twitter:image',
  'twitter:image:src',
];

function findMeta(html, prop) {
  const escaped = prop.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(
    '<meta[^>]+(?:property|name)\\s*=\\s*["\']' + escaped + '["\'][^>]*>',
    'i',
  );
  const tag = html.match(re);
  if (!tag) return null;
  const content = tag[0].match(/content\s*=\s*["']([^"']+)["']/i);
  return content ? content[1] : null;
}

function extFor(contentType) {
  if (contentType.includes('png')) return 'png';
  if (contentType.includes('webp')) return 'webp';
  if (contentType.includes('svg')) return 'svg';
  if (contentType.includes('gif')) return 'gif';
  return 'jpg';
}

async function handle(app) {
  const out = { slug: app.slug };
  let html;
  let finalUrl = app.url;

  try {
    const res = await fetch(app.url, {
      headers: { 'user-agent': UA, accept: 'text/html,*/*' },
      redirect: 'follow',
      signal: AbortSignal.timeout(25000),
    });
    out.status = res.status;
    finalUrl = res.url || app.url;
    if (!res.ok) return out;
    html = await res.text();
  } catch (err) {
    out.error = String(err).slice(0, 140);
    return out;
  }

  let raw = null;
  for (const prop of META_PROPS) {
    raw = findMeta(html, prop);
    if (raw) {
      out.prop = prop;
      break;
    }
  }
  if (!raw) return out;

  let abs;
  try {
    abs = new URL(raw, finalUrl).toString();
  } catch {
    out.error = 'unresolvable image url';
    return out;
  }
  out.image = abs;

  try {
    const res = await fetch(abs, {
      headers: { 'user-agent': UA },
      signal: AbortSignal.timeout(30000),
    });
    if (!res.ok) {
      out.error = 'image http ' + res.status;
      return out;
    }
    const contentType = (res.headers.get('content-type') || '').toLowerCase();
    if (!contentType.startsWith('image/')) {
      out.error = 'not an image: ' + contentType.slice(0, 40);
      return out;
    }
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length < 1200) {
      out.error = 'image too small: ' + buf.length + 'b';
      return out;
    }
    const name = app.slug + '.' + extFor(contentType);
    await fs.writeFile(path.join(OUT_DIR, name), buf);
    out.saved = name;
    out.bytes = buf.length;
  } catch (err) {
    out.error = String(err).slice(0, 140);
  }
  return out;
}

await fs.mkdir(OUT_DIR, { recursive: true });
const results = await Promise.all(apps.map(handle));

for (const r of results) {
  const detail = r.saved
    ? 'OK    ' + r.saved + '  ' + Math.round(r.bytes / 1024) + 'kb'
    : 'MISS  ' + (r.error || 'no og:image tag') + (r.status ? ' [http ' + r.status + ']' : '');
  console.log(r.slug.padEnd(24), detail);
}

const missing = results.filter((r) => !r.saved).map((r) => r.slug);
console.log('\nMISSING(' + missing.length + '): ' + JSON.stringify(missing));
