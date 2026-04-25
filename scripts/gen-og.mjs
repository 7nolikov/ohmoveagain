/**
 * gen-og.mjs — generate OG PNG images at build time.
 *
 * Outputs:
 *   static/og.png               — site-level default (already in place)
 *   static/og/calculator.png    — calculator card
 *   static/og/stage-1.png … 5  — per-stage cards
 *
 * Requires: @resvg/resvg-js (devDependency)
 * Run: node scripts/gen-og.mjs
 * Called by: .github/workflows/deploy.yml before hugo build
 */

import { Resvg } from '@resvg/resvg-js';
import { writeFileSync, mkdirSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dir = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dir, '..');
const STATIC_OG = path.join(ROOT, 'static', 'og');
mkdirSync(STATIC_OG, { recursive: true });

const W = 1200, H = 630;
const BG = '#0b0e0f', BG2 = '#0f1519', BORDER = '#1f2a31';
const GREEN = '#7ee787', DIM = '#8a969e', MUTED = '#5c6770', ACCENT_DIM = '#4a8953';
const FONT = `ui-monospace, 'Courier New', Courier, monospace`;

function card({ tag, title, subtitle, url, items }) {
  const itemLines = (items || []).map((item, i) =>
    `<text x="80" y="${300 + i * 44}" font-size="20" font-family="${FONT}">` +
    `<tspan fill="${MUTED}">  → </tspan>` +
    `<tspan fill="${DIM}">${item}</tspan>` +
    `</text>`
  ).join('\n  ');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <rect width="${W}" height="${H}" fill="${BG}"/>
  <rect x="0" y="0" width="6" height="${H}" fill="${GREEN}"/>
  <rect x="60" y="50" width="${W - 120}" height="${H - 160}" rx="8" fill="${BG2}" stroke="${BORDER}" stroke-width="1.5"/>

  ${tag ? `<text x="80" y="108" font-size="18" font-family="${FONT}" fill="${MUTED}">${tag}</text>` : ''}

  <text x="80" y="${tag ? 185 : 155}" font-size="52" font-family="${FONT}" font-weight="700" fill="${GREEN}" textLength="${Math.min(title.length * 30, W - 160)}" lengthAdjust="spacingAndGlyphs">
    ${title}
  </text>

  <text x="80" y="${tag ? 235 : 205}" font-size="22" font-family="${FONT}" fill="${DIM}">
    ${subtitle}
  </text>

  ${itemLines}

  <rect x="0" y="${H - 80}" width="${W}" height="80" fill="${BG}"/>
  <line x1="0" y1="${H - 80}" x2="${W}" y2="${H - 80}" stroke="${BORDER}" stroke-width="1"/>
  <text x="60" y="${H - 30}" font-size="22" font-family="${FONT}" font-weight="700" fill="${GREEN}">ohmoveagain</text>
  <text x="${W - 60}" y="${H - 30}" font-size="18" font-family="${FONT}" fill="${MUTED}" text-anchor="end">${url}</text>
</svg>`;
}

function writePng(filename, svg) {
  const resvg = new Resvg(svg, {
    fitTo: { mode: 'width', value: W },
    font: { loadSystemFonts: true },
  });
  const png = resvg.render().asPng();
  writeFileSync(filename, png);
  console.log(`  ✓ ${path.basename(filename)} (${(png.length / 1024).toFixed(0)} KB)`);
}

console.log('Generating OG images…');

// Site-level (overwrites static/og.png)
writePng(path.join(ROOT, 'static', 'og.png'), card({
  tag: null,
  title: 'Relocate to Croatia without guessing.',
  subtitle: 'Five stages · sourced checklists · official links · runway calculator · open-source',
  url: '7nolikov.dev/ohmoveagain/',
  items: [],
}));

// Calculator
writePng(path.join(STATIC_OG, 'calculator.png'), card({
  tag: 'Runway calculator',
  title: 'How many months does the move buy you?',
  subtitle: 'Same gross income — compare tax + cost of living across 12 countries.',
  url: '7nolikov.dev/ohmoveagain/calculator/',
  items: [],
}));

// Per-stage
const STAGES = [
  { n: 1, slug: 'assessment',     title: 'Assessment',     subtitle: 'Tax math, visa pathway, and reality check before you commit.' },
  { n: 2, slug: 'pre-flight',     title: 'Pre-Flight',     subtitle: 'Apostilles, background checks, pet and family paperwork.' },
  { n: 3, slug: 'migration',      title: 'Migration',      subtitle: 'Border crossing and your first 72 hours.' },
  { n: 4, slug: 'initialization', title: 'Initialization', subtitle: 'OIB, address registration, bank account, HZZO health insurance.' },
  { n: 5, slug: 'scaling',        title: 'Scaling',        subtitle: 'Business structure (paušalni obrt, d.o.o.), tax optimisation.' },
];

for (const s of STAGES) {
  writePng(path.join(STATIC_OG, `stage-${s.n}.png`), card({
    tag: `Stage ${s.n} of 5 · the Pipeline`,
    title: s.title,
    subtitle: s.subtitle,
    url: `7nolikov.dev/ohmoveagain/stage/${s.slug}/`,
    items: [],
  }));
}

console.log(`Done — ${STAGES.length + 2} images.`);
