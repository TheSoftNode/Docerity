/**
 * Rebuilds every file derived from the Docerity mark.
 *
 *   node scripts/build-brand-assets.mjs
 *
 * The artwork arrives as a JPEG: flat blue-violet shapes on an opaque white
 * background, floating in a lot of padding. Every place it is used needs
 * something else. The header wants it bare on a transparent canvas so it can
 * sit on either theme, the favicon wants it small and square, and iOS refuses
 * transparency outright and composites whatever is left onto black.
 *
 * Doing that by hand once is fine until the artwork changes, at which point
 * nobody remembers which of the five files were cropped how. This is the
 * answer to that: change `SOURCE`, run this, commit what it writes.
 */

import { existsSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import sharp from "sharp";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

const SOURCE = resolve(root, "public/docerity-logo-v2.jpeg");

/*
  The two flat colours in the artwork, sampled from it rather than guessed.

  Keying out white is not enough on a JPEG: compression leaves a faint wash
  across the whole canvas and coloured ringing along every edge. Instead each
  pixel is projected onto the line from white to whichever of these it is
  closest to, which gives back both the colour and how opaque it should be.
  Antialiased edges come out clean and the wash comes out as nothing.
*/
const INKS = [
  [84, 90, 226],
  [62, 67, 185],
];

/* Below this the "pixel" is compression noise, not artwork. Measured: at 16
   the trimmed bounds land exactly on the drawn shape, and at 8 they include
   the whole canvas. */
const ALPHA_FLOOR = 16;

/* How far a pixel may sit off the line from white to an ink before it is
   treated as ringing rather than as an edge. Squared RGB distance. */
const MAX_FIT_ERROR = 900;

/** White, which is what the artwork is drawn on. */
const W = [255, 255, 255];

async function extractMark() {
  const image = sharp(SOURCE).ensureAlpha();
  const { data, info } = await image
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height, channels } = info;
  const out = Buffer.alloc(width * height * 4, 0);

  for (let i = 0, p = 0; i < data.length; i += channels, p += 4) {
    const px = [data[i], data[i + 1], data[i + 2]];

    if (px[0] > 250 && px[1] > 250 && px[2] > 250) continue;

    let best = null;
    for (const ink of INKS) {
      const d = [ink[0] - W[0], ink[1] - W[1], ink[2] - W[2]];
      const dd = d[0] * d[0] + d[1] * d[1] + d[2] * d[2];
      const dot =
        (px[0] - W[0]) * d[0] + (px[1] - W[1]) * d[1] + (px[2] - W[2]) * d[2];
      const t = Math.max(0, Math.min(1, dot / dd));

      let error = 0;
      for (let c = 0; c < 3; c += 1) {
        const projected = W[c] + t * d[c];
        error += (px[c] - projected) ** 2;
      }

      if (!best || error < best.error) best = { error, t, ink };
    }

    const alpha = Math.round(best.t * 255);
    if (alpha < ALPHA_FLOOR || best.error > MAX_FIT_ERROR) continue;

    out[p] = best.ink[0];
    out[p + 1] = best.ink[1];
    out[p + 2] = best.ink[2];
    out[p + 3] = alpha;
  }

  /*
    Trimmed to the drawn shape, then squared on a transparent canvas.

    Squaring here rather than in each consumer is what lets the header, the
    favicon and the touch icon all size the mark by one number without it
    drifting off centre in any of them.
  */
  const trimmed = sharp(out, { raw: { width, height, channels: 4 } })
    .png()
    .trim();

  const { data: art, info: artInfo } = await trimmed.toBuffer({
    resolveWithObject: true,
  });

  const side = Math.max(artInfo.width, artInfo.height);

  return sharp(art)
    .extend({
      top: Math.floor((side - artInfo.height) / 2),
      bottom: Math.ceil((side - artInfo.height) / 2),
      left: Math.floor((side - artInfo.width) / 2),
      right: Math.ceil((side - artInfo.width) / 2),
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toBuffer();
}

/**
 * An .ico containing PNG-encoded frames.
 *
 * The format allows either a BMP or a whole PNG per entry, and every browser
 * from IE11 on reads the PNG form. Writing it by hand is a 6-byte header, a
 * 16-byte directory entry per size, then the PNG bytes: less work than adding
 * a dependency that does the same thing.
 *
 * Several sizes because a browser picks the closest one rather than resampling
 * whichever it finds, and this mark's internal gaps close up when a 256 is
 * squeezed into 16 pixels by someone else's scaler.
 */
function buildIco(frames) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); /* reserved */
  header.writeUInt16LE(1, 2); /* 1 = icon */
  header.writeUInt16LE(frames.length, 4);

  const directory = Buffer.alloc(16 * frames.length);
  let offset = header.length + directory.length;

  frames.forEach(({ size, png }, index) => {
    const at = index * 16;
    /* 0 means 256 in this field, which is why it is a single byte. */
    directory.writeUInt8(size >= 256 ? 0 : size, at);
    directory.writeUInt8(size >= 256 ? 0 : size, at + 1);
    directory.writeUInt8(0, at + 2); /* palette size, 0 for truecolour */
    directory.writeUInt8(0, at + 3); /* reserved */
    directory.writeUInt16LE(1, at + 4); /* colour planes */
    directory.writeUInt16LE(32, at + 6); /* bits per pixel */
    directory.writeUInt32LE(png.length, at + 8);
    directory.writeUInt32LE(offset, at + 12);
    offset += png.length;
  });

  return Buffer.concat([header, directory, ...frames.map((f) => f.png)]);
}

async function write(path, buffer) {
  const full = resolve(root, path);
  await mkdir(dirname(full), { recursive: true });
  await writeFile(full, buffer);
  console.log(`  ${path}  ${(buffer.length / 1024).toFixed(1)}KB`);
}

async function main() {
  if (!existsSync(SOURCE)) {
    console.error(`Artwork not found: ${SOURCE}`);
    process.exit(1);
  }

  console.log("Extracting the mark...");
  const mark = await extractMark();
  const meta = await sharp(mark).metadata();
  console.log(`  squared to ${meta.width}x${meta.height}, transparent`);

  const square = (size) =>
    sharp(mark).resize(size, size, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } });

  console.log("Writing:");

  /* The source of truth, full resolution, for anything made later. */
  await write("public/docerity-logo.png", await sharp(mark).png().toBuffer());

  /* What the header renders. WebP because it is a flat-colour mark with an
     alpha channel, which is the case WebP wins by the largest margin. */
  await write(
    "public/docerity-logo.webp",
    await square(256).webp({ lossless: true, effort: 6 }).toBuffer()
  );

  /* Next serves app/icon.png as the favicon and generates the <link> for it. */
  await write("app/icon.png", await square(256).png().toBuffer());

  /*
    iOS ignores the alpha channel and composites onto black, so the touch icon
    is flattened onto white here instead. The 14% inset is because iOS applies
    its own rounded mask and a mark that runs to the edge loses its corners.
  */
  const INSET = 0.14;
  const inner = Math.round(180 * (1 - INSET * 2));
  await write(
    "app/apple-icon.png",
    await sharp({
      create: {
        width: 180,
        height: 180,
        channels: 4,
        background: { r: 255, g: 255, b: 255, alpha: 1 },
      },
    })
      .composite([{ input: await square(inner).png().toBuffer(), gravity: "centre" }])
      .png()
      .toBuffer()
  );

  /* For anything that asks for /favicon.ico by name rather than reading the
     <link> Next emits for app/icon.png. */
  const icoSizes = [16, 32, 48];
  const frames = [];
  for (const size of icoSizes) {
    frames.push({ size, png: await square(size).png().toBuffer() });
  }
  await write("app/favicon.ico", buildIco(frames));

  console.log("\nDone.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
