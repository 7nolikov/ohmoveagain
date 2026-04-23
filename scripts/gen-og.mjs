import { Resvg } from '@resvg/resvg-js';
import { writeFileSync } from 'fs';

const W = 1200, H = 630;
const BG = '#0b0e0f', BG2 = '#0f1519', BORDER = '#1f2a31';
const GREEN = '#7ee787', DIM = '#8a969e', MUTED = '#5c6770';
const FONT = "ui-monospace, 'Courier New', Courier, monospace";

const stages = [
  { n: 1, name: 'assessment',     status: 'ok (exit 0)' },
  { n: 2, name: 'pre-flight',     status: 'ok (exit 0)' },
  { n: 3, name: 'migration',      status: 'ok (exit 0)' },
  { n: 4, name: 'initialization', status: 'ok (exit 0)' },
  { n: 5, name: 'scaling',        status: 'ok (exit 0)' },
];

const stageLines = stages.map((s, i) =>
  `<text x="80" y="${170 + i * 46}" font-size="26" font-family="${FONT}">` +
  `<tspan fill="${MUTED}">stage ${s.n}/5 · </tspan>` +
  `<tspan fill="${GREEN}" font-weight="600">${s.name}</tspan>` +
  `<tspan fill="${MUTED}">  ${'  '.repeat(Math.max(0, 14 - s.name.length))}${s.status}</tspan>` +
  `</text>`
).join('\n  ');

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <style>text { font-family: ${FONT}; }</style>
  </defs>

  <!-- background -->
  <rect width="${W}" height="${H}" fill="${BG}"/>

  <!-- terminal card -->
  <rect x="60" y="50" width="${W - 120}" height="${H - 170}" rx="8"
        fill="${BG2}" stroke="${BORDER}" stroke-width="1.5"/>

  <!-- prompt line -->
  <text x="80" y="130" font-size="26" font-family="${FONT}">
    <tspan fill="${MUTED}">$ </tspan><tspan fill="${GREEN}">./move.sh</tspan><tspan fill="${DIM}"> --to=zagreb --dry-run</tspan>
  </text>

  <!-- stage output lines -->
  ${stageLines}

  <!-- summary line -->
  <text x="80" y="${H - 145}" font-size="22" font-family="${FONT}">
    <tspan fill="${MUTED}">64 checks · 5 stages · every source linked to </tspan><tspan fill="${GREEN}">an official source</tspan>
  </text>

  <!-- bottom bar -->
  <rect x="0" y="${H - 90}" width="${W}" height="90" fill="${BG}"/>
  <line x1="0" y1="${H - 90}" x2="${W}" y2="${H - 90}" stroke="${BORDER}" stroke-width="1"/>

  <text x="60" y="${H - 42}" font-size="28" font-family="${FONT}" font-weight="700" fill="${GREEN}">ohmoveagain</text>
  <text x="${W - 60}" y="${H - 42}" font-size="22" font-family="${FONT}" fill="${MUTED}" text-anchor="end">
    7nolikov.dev/ohmoveagain · open-source Croatia relocation playbook
  </text>
</svg>`;

const resvg = new Resvg(svg, {
  fitTo: { mode: 'width', value: W },
  font: { loadSystemFonts: true },
});

const png = resvg.render().asPng();
writeFileSync('static/og.png', png);
console.log(`Written static/og.png (${png.length} bytes)`);
