import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { exit } from 'node:process';
import sharp from 'sharp';

export const OUT_DIR = 'src/assets/images/products';
export const WIDTH = 1280;
export const HEIGHT = 800;
const QUALITY = 74;

/**
 * @typedef {object} Palette
 * @property {string} deep - darkest background stop
 * @property {string} mid - lighter background stop
 * @property {string} accent - the product's signature colour
 * @property {string} accent2 - a secondary colour for contrast
 */

/**
 * @typedef {object} ProductArt
 * @property {string} id - the product slug, matching PRODUCT_IDS
 * @property {string} folder - `product-01` … `product-19`
 * @property {Palette} palette
 * @property {string} motif - which industry drawing the main visual uses
 * @property {string} ui - which interface composition the experience visual uses
 * @property {number} variant - 0-5, selects the backdrop geometry
 * @property {'browser' | 'phone'} frame - the device the experience visual is drawn in
 */

/** @type {ProductArt[]} */
export const PRODUCT_ART = [
  {
    id: 'draculai',
    folder: 'product-01',
    palette: { deep: '#15121F', mid: '#2A2340', accent: '#7BE3C9', accent2: '#B79BFF' },
    motif: 'capsule',
    ui: 'tracker',
    variant: 0,
    frame: 'phone',
  },
  {
    id: 'jdm-west-coast',
    folder: 'product-02',
    palette: { deep: '#101113', mid: '#2A161B', accent: '#FF4438', accent2: '#FFB199' },
    motif: 'piston',
    ui: 'fitment',
    variant: 1,
    frame: 'browser',
  },
  {
    id: 'hydrant',
    folder: 'product-03',
    palette: { deep: '#061826', mid: '#0D3450', accent: '#2FD0FF', accent2: '#8BF0C4' },
    motif: 'sachet',
    ui: 'bundle',
    variant: 2,
    frame: 'browser',
  },
  {
    id: 'mertel',
    folder: 'product-04',
    palette: { deep: '#0D0F1A', mid: '#231634', accent: '#FF6B6B', accent2: '#FFD166' },
    motif: 'stage',
    ui: 'regions',
    variant: 3,
    frame: 'browser',
  },
  {
    id: 'skinome',
    folder: 'product-05',
    palette: { deep: '#141019', mid: '#2E2235', accent: '#E3B8FF', accent2: '#FFC9DD' },
    motif: 'microbiome',
    ui: 'quiz',
    variant: 4,
    frame: 'browser',
  },
  {
    id: 'mastercraft',
    folder: 'product-06',
    palette: { deep: '#141518', mid: '#2C3038', accent: '#C9DCEF', accent2: '#E8C27A' },
    motif: 'gem',
    ui: 'configurator',
    variant: 5,
    frame: 'browser',
  },
  {
    id: 'robert-irwin',
    folder: 'product-07',
    palette: { deep: '#171311', mid: '#33241A', accent: '#E8C27A', accent2: '#F6E6C8' },
    motif: 'ring',
    ui: 'configurator',
    variant: 0,
    frame: 'browser',
  },
  {
    id: 'casamance',
    folder: 'product-08',
    palette: { deep: '#1A1016', mid: '#3A2330', accent: '#D9A2B5', accent2: '#C7A87C' },
    motif: 'weave',
    ui: 'trade',
    variant: 1,
    frame: 'browser',
  },
  {
    id: 'sell-me-watch',
    folder: 'product-09',
    palette: { deep: '#14100C', mid: '#2F2318', accent: '#D9B36C', accent2: '#8FB0C9' },
    motif: 'dial',
    ui: 'valuation',
    variant: 2,
    frame: 'browser',
  },
  {
    id: 'klinik-europe',
    folder: 'product-10',
    palette: { deep: '#0A1C1E', mid: '#133C40', accent: '#4FD6C6', accent2: '#9BE8FF' },
    motif: 'clinic',
    ui: 'booking',
    variant: 3,
    frame: 'browser',
  },
  {
    id: 'libra-analytics',
    folder: 'product-11',
    palette: { deep: '#0E1726', mid: '#1D2F4C', accent: '#5B8CFF', accent2: '#8BE0FF' },
    motif: 'analytics',
    ui: 'consulting',
    variant: 4,
    frame: 'browser',
  },
  {
    id: 'remake-templates',
    folder: 'product-12',
    palette: { deep: '#120B1A', mid: '#2E1245', accent: '#C86BFF', accent2: '#62E7FF' },
    motif: 'waveform',
    ui: 'catalogue',
    variant: 5,
    frame: 'browser',
  },
  {
    id: 'got-matcha',
    folder: 'product-13',
    palette: { deep: '#0C1A12', mid: '#17361F', accent: '#6FD08C', accent2: '#D7F08C' },
    motif: 'leaf',
    ui: 'subscribe',
    variant: 0,
    frame: 'browser',
  },
  {
    id: 'lav',
    folder: 'product-14',
    palette: { deep: '#1A2015', mid: '#36431F', accent: '#C8E05A', accent2: '#F2C45A' },
    motif: 'bottle',
    ui: 'bundle',
    variant: 1,
    frame: 'browser',
  },
  {
    id: 'roar-organic',
    folder: 'product-15',
    palette: { deep: '#101424', mid: '#1F2A4A', accent: '#A8FF60', accent2: '#5BD6FF' },
    motif: 'burst',
    ui: 'subscribe',
    variant: 2,
    frame: 'browser',
  },
  {
    id: 'zadeh-md',
    folder: 'product-16',
    palette: { deep: '#10151C', mid: '#1F2B38', accent: '#7FC4FF', accent2: '#CDE6FF' },
    motif: 'droplet',
    ui: 'catalogue',
    variant: 3,
    frame: 'browser',
  },
  {
    id: 'tai-ping',
    folder: 'product-17',
    palette: { deep: '#1C0E0C', mid: '#401C15', accent: '#FF7A4D', accent2: '#FFC861' },
    motif: 'market',
    ui: 'departments',
    variant: 4,
    frame: 'browser',
  },
  {
    id: 'mezave',
    folder: 'product-18',
    palette: { deep: '#2A1A12', mid: '#5A3520', accent: '#FFB454', accent2: '#8FD9A8' },
    motif: 'share',
    ui: 'feed',
    variant: 5,
    frame: 'phone',
  },
  {
    id: 'connected-car',
    folder: 'product-19',
    palette: { deep: '#0B1220', mid: '#16324F', accent: '#39D0FF', accent2: '#9BFFD8' },
    motif: 'vehicle',
    ui: 'feed',
    variant: 2,
    frame: 'phone',
  },
];

/**
 * @param {number} value
 * @returns {string} the number with at most two decimals and no trailing zeros
 */
const n = (value) => String(Math.round(value * 100) / 100);

/**
 * @param {number} x
 * @param {number} y
 * @param {number} w
 * @param {number} h
 * @param {number} r
 * @param {string} fill
 * @param {number} [opacity]
 * @returns {string}
 */
const rrect = (x, y, w, h, r, fill, opacity = 1) =>
  `<rect x="${n(x)}" y="${n(y)}" width="${n(w)}" height="${n(h)}" rx="${n(r)}" fill="${fill}" opacity="${n(opacity)}"/>`;

/**
 * @param {number} cx
 * @param {number} cy
 * @param {number} r
 * @param {string} fill
 * @param {number} [opacity]
 * @returns {string}
 */
const dot = (cx, cy, r, fill, opacity = 1) =>
  `<circle cx="${n(cx)}" cy="${n(cy)}" r="${n(r)}" fill="${fill}" opacity="${n(opacity)}"/>`;

/**
 * @param {number} cx
 * @param {number} cy
 * @param {number} r
 * @param {string} stroke
 * @param {number} width
 * @param {number} [opacity]
 * @param {string} [dash]
 * @returns {string}
 */
const ring = (cx, cy, r, stroke, width, opacity = 1, dash = '') =>
  `<circle cx="${n(cx)}" cy="${n(cy)}" r="${n(r)}" fill="none" stroke="${stroke}" stroke-width="${n(width)}" opacity="${n(opacity)}"${dash ? ` stroke-dasharray="${dash}"` : ''}/>`;

/**
 * @param {string} d
 * @param {string} stroke_
 * @param {number} width
 * @param {number} [opacity]
 * @param {string} [fill]
 * @returns {string}
 */
const stroke = (d, stroke_, width, opacity = 1, fill = 'none') =>
  `<path d="${d}" fill="${fill}" stroke="${stroke_}" stroke-width="${n(width)}" stroke-linecap="round" stroke-linejoin="round" opacity="${n(opacity)}"/>`;

/**
 * @param {string} d
 * @param {string} fill
 * @param {number} [opacity]
 * @returns {string}
 */
const shape = (d, fill, opacity = 1) => `<path d="${d}" fill="${fill}" opacity="${n(opacity)}"/>`;

/**
 *
 * @param {number} x
 * @param {number} y
 * @param {readonly number[]} widths
 * @param {number} h
 * @param {string} fill
 * @param {number} [opacity]
 * @returns {string}
 */
const textBars = (x, y, widths, h, fill, opacity = 0.5) =>
  widths.map((w, i) => rrect(x, y + i * (h + 9), w, h, h / 2, fill, opacity - i * 0.08)).join('');

/**
 * @param {Palette} p
 * @param {number} variant
 * @returns {string}
 */
function backdrop(p, variant) {
  const layers = [`<rect width="${WIDTH}" height="${HEIGHT}" fill="url(#bg)"/>`];

  if (variant === 0) {
    layers.push(`<circle cx="980" cy="200" r="520" fill="url(#glow)"/>`);
    for (let i = 0; i < 5; i += 1) {
      layers.push(ring(980, 200, 170 + i * 92, p.accent, 1.2, 0.16 - i * 0.02));
    }
  } else if (variant === 1) {
    layers.push(`<circle cx="320" cy="640" r="560" fill="url(#glow)"/>`);
    for (let i = 0; i < 7; i += 1) {
      const x = 120 + i * 190;
      layers.push(
        stroke(`M${n(x)} -60 L${n(x - 240)} ${HEIGHT + 60}`, p.accent, 1.4, 0.13 - i * 0.012),
      );
    }
  } else if (variant === 2) {
    layers.push(`<circle cx="640" cy="820" r="620" fill="url(#glow)"/>`);
    for (let i = 0; i < 6; i += 1) {
      const y = 140 + i * 118;
      layers.push(
        stroke(
          `M-40 ${n(y)} Q${n(WIDTH / 2)} ${n(y - 90 + i * 14)} ${n(WIDTH + 40)} ${n(y)}`,
          p.accent,
          1.5,
          0.15 - i * 0.015,
        ),
      );
    }
  } else if (variant === 3) {
    layers.push(`<circle cx="1050" cy="660" r="520" fill="url(#glow)"/>`);
    layers.push(
      shape(`M0 ${HEIGHT} L0 ${n(HEIGHT - 320)} L${WIDTH} 0 L${WIDTH} ${HEIGHT} Z`, p.accent, 0.06),
    );
    layers.push(
      shape(
        `M0 ${HEIGHT} L0 ${n(HEIGHT - 170)} L${n(WIDTH * 0.72)} 0 L${n(WIDTH * 0.42)} 0 Z`,
        p.accent2,
        0.05,
      ),
    );
  } else if (variant === 4) {
    layers.push(`<circle cx="260" cy="200" r="520" fill="url(#glow)"/>`);
    for (let gy = 0; gy < 9; gy += 1) {
      for (let gx = 0; gx < 15; gx += 1) {
        layers.push(dot(70 + gx * 86, 70 + gy * 84, 2.4, p.accent, 0.2 - gy * 0.016));
      }
    }
  } else {
    layers.push(`<circle cx="700" cy="120" r="560" fill="url(#glow)"/>`);
    for (let i = 0; i < 5; i += 1) {
      const inset = i * 74;
      layers.push(
        `<rect x="${n(120 + inset)}" y="${n(60 + inset * 0.6)}" width="${n(1040 - inset * 2)}" height="${n(680 - inset * 1.2)}" rx="40" fill="none" stroke="${p.accent}" stroke-width="1.2" opacity="${n(0.15 - i * 0.02)}"/>`,
      );
    }
  }

  return layers.join('');
}

/**
 * @param {Palette} p
 * @returns {string}
 */
const defs = (p) => `<defs>
  <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="${p.deep}"/>
    <stop offset="1" stop-color="${p.mid}"/>
  </linearGradient>
  <radialGradient id="glow" cx="0.5" cy="0.5" r="0.5">
    <stop offset="0" stop-color="${p.accent}" stop-opacity="0.34"/>
    <stop offset="0.55" stop-color="${p.accent}" stop-opacity="0.09"/>
    <stop offset="1" stop-color="${p.accent}" stop-opacity="0"/>
  </radialGradient>
  <radialGradient id="stage" cx="0.5" cy="0.5" r="0.5">
    <stop offset="0" stop-color="${p.accent}" stop-opacity="0.26"/>
    <stop offset="0.6" stop-color="${p.accent2}" stop-opacity="0.08"/>
    <stop offset="1" stop-color="${p.accent}" stop-opacity="0"/>
  </radialGradient>
  <linearGradient id="sheen" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="${p.accent}" stop-opacity="0.95"/>
    <stop offset="1" stop-color="${p.accent2}" stop-opacity="0.75"/>
  </linearGradient>
  <linearGradient id="glass" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#FFFFFF" stop-opacity="0.12"/>
    <stop offset="1" stop-color="#FFFFFF" stop-opacity="0.03"/>
  </linearGradient>
  <linearGradient id="vignette" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="${p.deep}" stop-opacity="0"/>
    <stop offset="1" stop-color="${p.deep}" stop-opacity="0.5"/>
  </linearGradient>
</defs>`;

/**
 * @param {string} motif
 * @param {Palette} p
 * @returns {string}
 */
function drawMotif(motif, p) {
  const cx = 640;
  const cy = 400;
  const a = p.accent;
  const b = p.accent2;
  const w = '#FFFFFF';

  switch (motif) {
    case 'capsule': {
      const parts = [
        `<g transform="rotate(-38 ${cx} ${cy})">`,
        rrect(cx - 150, cy - 74, 300, 148, 74, 'url(#sheen)', 0.95),
        rrect(cx - 150, cy - 74, 150, 148, 74, w, 0.16),
        `<rect x="${n(cx - 6)}" y="${n(cy - 74)}" width="12" height="148" fill="${p.deep}" opacity="0.55"/>`,
        `</g>`,
        stroke(`M300 ${cy + 180} H520 l34 -74 42 148 38 -104 30 56 h236`, b, 6, 0.9),
      ];
      for (let i = 0; i < 9; i += 1) {
        parts.push(dot(380 + i * 62, cy - 230 + (i % 3) * 26, 5 - (i % 3), a, 0.5 - (i % 3) * 0.1));
      }
      return parts.join('');
    }

    case 'piston': {
      const parts = [
        rrect(cx - 96, cy - 210, 192, 150, 24, 'url(#sheen)', 0.95),
        rrect(cx - 96, cy - 176, 192, 12, 6, p.deep, 0.5),
        rrect(cx - 96, cy - 150, 192, 12, 6, p.deep, 0.5),
        rrect(cx - 26, cy - 60, 52, 170, 14, w, 0.5),
        ring(cx, cy + 150, 92, a, 14, 0.95),
        ring(cx, cy + 150, 36, b, 10, 0.8),
      ];
      for (let i = 0; i < 6; i += 1) {
        parts.push(
          stroke(
            `M${n(170 + i * 24)} ${n(250 + i * 62)} h${n(150 - i * 14)}`,
            a,
            5,
            0.45 - i * 0.05,
          ),
        );
        parts.push(
          stroke(
            `M${n(960 + i * 24)} ${n(250 + i * 62)} h${n(150 - i * 14)}`,
            b,
            5,
            0.4 - i * 0.05,
          ),
        );
      }
      return parts.join('');
    }

    case 'sachet': {
      const parts = [
        `<g transform="rotate(-14 ${cx} ${cy})">`,
        rrect(cx - 92, cy - 190, 184, 330, 16, 'url(#sheen)', 0.95),
        rrect(cx - 92, cy - 190, 184, 34, 10, w, 0.3),
        rrect(cx - 60, cy - 70, 120, 10, 5, p.deep, 0.4),
        rrect(cx - 60, cy - 40, 86, 10, 5, p.deep, 0.3),
        `</g>`,
        stroke(`M120 600 Q320 520 520 600 T920 600 T1320 600`, a, 7, 0.75),
        stroke(`M120 660 Q320 586 520 660 T920 660 T1320 660`, b, 5, 0.4),
      ];
      for (let i = 0; i < 16; i += 1) {
        const ang = (i / 16) * Math.PI * 2;
        parts.push(
          dot(
            cx + Math.cos(ang) * (250 + (i % 4) * 44),
            cy + Math.sin(ang) * (190 + (i % 3) * 40),
            4 + (i % 3) * 2,
            i % 2 ? a : b,
            0.55,
          ),
        );
      }
      return parts.join('');
    }

    case 'stage': {
      const parts = [
        rrect(cx - 420, cy - 260, 840, 26, 13, w, 0.25),
        shape(
          `M${cx - 300} ${cy - 234} L${cx - 150} ${cy + 250} L${cx - 420} ${cy + 250} Z`,
          a,
          0.32,
        ),
        shape(`M${cx} ${cy - 234} L${cx + 160} ${cy + 250} L${cx - 160} ${cy + 250} Z`, b, 0.26),
        shape(
          `M${cx + 300} ${cy - 234} L${cx + 420} ${cy + 250} L${cx + 150} ${cy + 250} Z`,
          a,
          0.22,
        ),
        rrect(cx - 440, cy + 250, 880, 18, 9, 'url(#sheen)', 0.9),
      ];
      for (let i = 0; i < 5; i += 1) {
        const x = cx - 300 + i * 150;
        parts.push(rrect(x - 16, cy - 272, 32, 22, 8, a, 0.9));
      }
      const pins = [
        [250, 190],
        [1020, 160],
        [1080, 540],
        [200, 520],
      ];
      for (const [px, py] of pins) {
        parts.push(
          shape(
            `M${px} ${py} c-30 0 -54 24 -54 54 0 38 54 86 54 86 s54 -48 54 -86 c0 -30 -24 -54 -54 -54 z`,
            b,
            0.75,
          ),
        );
        parts.push(dot(px, py + 52, 15, p.deep, 0.75));
      }
      return parts.join('');
    }

    case 'microbiome': {
      const parts = [];
      const blobs = [
        [cx - 150, cy - 60, 170],
        [cx + 140, cy - 110, 130],
        [cx + 60, cy + 150, 150],
        [cx - 260, cy + 140, 95],
        [cx + 300, cy + 110, 80],
      ];
      blobs.forEach(([bx, by, r], i) => {
        parts.push(dot(bx, by, r, i % 2 ? b : a, 0.2));
        parts.push(ring(bx, by, r, i % 2 ? b : a, 2, 0.6));
        for (let k = 0; k < 7; k += 1) {
          const ang = (k / 7) * Math.PI * 2 + i;
          parts.push(
            dot(bx + Math.cos(ang) * r * 0.54, by + Math.sin(ang) * r * 0.54, 7 - (k % 3), w, 0.5),
          );
        }
      });
      parts.push(
        shape(
          `M${cx + 330} ${cy - 250} c-46 62 -74 104 -74 136 0 42 34 74 74 74 42 0 76 -32 76 -74 0 -32 -30 -74 -76 -136 z`,
          'url(#sheen)',
          0.9,
        ),
      );
      return parts.join('');
    }

    case 'gem': {
      const top = cy - 170;
      const mid = cy - 40;
      const bot = cy + 230;
      return [
        shape(
          `M${cx - 230} ${mid} L${cx - 150} ${top} L${cx + 150} ${top} L${cx + 230} ${mid} L${cx} ${bot} Z`,
          'url(#sheen)',
          0.95,
        ),
        shape(`M${cx - 230} ${mid} L${cx} ${mid} L${cx} ${bot} Z`, w, 0.14),
        shape(`M${cx} ${mid} L${cx + 230} ${mid} L${cx} ${bot} Z`, p.deep, 0.22),
        shape(`M${cx - 150} ${top} L${cx - 72} ${mid} L${cx - 230} ${mid} Z`, w, 0.22),
        shape(`M${cx + 150} ${top} L${cx + 72} ${mid} L${cx + 230} ${mid} Z`, p.deep, 0.18),
        stroke(
          `M${cx - 150} ${top} L${cx - 72} ${mid} L${cx + 72} ${mid} L${cx + 150} ${top}`,
          w,
          2,
          0.4,
        ),
        stroke(`M${cx - 72} ${mid} L${cx} ${bot} L${cx + 72} ${mid}`, w, 2, 0.3),
        dot(cx - 300, cy - 230, 6, b, 0.8),
        dot(cx + 330, cy - 160, 9, b, 0.6),
        dot(cx + 250, cy + 260, 5, a, 0.7),
      ].join('');
    }

    // A band with a raised solitaire, seen face on.
    case 'ring': {
      const parts = [
        ring(cx, cy + 60, 180, 'url(#sheen)', 30, 0.95),
        ring(cx, cy + 60, 180, w, 6, 0.3),
        shape(
          `M${cx - 70} ${cy - 150} L${cx} ${cy - 250} L${cx + 70} ${cy - 150} L${cx} ${cy - 60} Z`,
          b,
          0.95,
        ),
        shape(`M${cx - 70} ${cy - 150} L${cx} ${cy - 150} L${cx} ${cy - 60} Z`, w, 0.25),
        stroke(`M${cx - 70} ${cy - 150} H${cx + 70}`, w, 2.5, 0.5),
      ];
      for (let i = 0; i < 12; i += 1) {
        const ang = (i / 12) * Math.PI * 2;
        parts.push(dot(cx + Math.cos(ang) * 300, cy + 60 + Math.sin(ang) * 300, 4, b, 0.35));
      }
      return parts.join('');
    }

    case 'weave': {
      const parts = [];
      const x0 = cx - 300;
      const y0 = cy - 220;
      for (let i = 0; i < 9; i += 1) {
        parts.push(rrect(x0 + i * 68, y0, 44, 440, 12, i % 2 ? a : b, 0.5 - (i % 3) * 0.08));
      }
      for (let j = 0; j < 7; j += 1) {
        parts.push(rrect(x0 - 30, y0 + j * 68, 660, 44, 12, j % 2 ? b : a, 0.34 - (j % 3) * 0.06));
      }
      parts.push(rrect(cx + 170, cy - 290, 230, 300, 18, 'url(#glass)', 1));
      parts.push(rrect(cx + 170, cy - 290, 230, 300, 18, b, 0.18));
      return parts.join('');
    }

    case 'dial': {
      const parts = [
        ring(cx, cy, 230, w, 3, 0.25),
        dot(cx, cy, 214, p.deep, 0.55),
        ring(cx, cy, 214, 'url(#sheen)', 10, 0.95),
        rrect(cx + 224, cy - 22, 40, 44, 12, b, 0.9),
      ];
      for (let i = 0; i < 12; i += 1) {
        const ang = (i / 12) * Math.PI * 2 - Math.PI / 2;
        const r1 = 182;
        const r2 = i % 3 === 0 ? 146 : 162;
        parts.push(
          stroke(
            `M${n(cx + Math.cos(ang) * r1)} ${n(cy + Math.sin(ang) * r1)} L${n(cx + Math.cos(ang) * r2)} ${n(cy + Math.sin(ang) * r2)}`,
            w,
            i % 3 === 0 ? 6 : 3,
            0.75,
          ),
        );
      }
      parts.push(stroke(`M${cx} ${cy} L${cx + 96} ${cy - 86}`, a, 8, 1));
      parts.push(stroke(`M${cx} ${cy} L${cx - 34} ${cy + 122}`, b, 6, 0.9));
      parts.push(dot(cx, cy, 14, w, 0.95));
      parts.push(stroke(`M${cx - 300} ${cy + 300} a300 300 0 0 1 180 -276`, a, 5, 0.5, 'none'));
      return parts.join('');
    }

    case 'clinic': {
      const parts = [
        rrect(cx - 64, cy - 220, 128, 440, 28, 'url(#sheen)', 0.95),
        rrect(cx - 220, cy - 64, 440, 128, 28, 'url(#sheen)', 0.95),
        rrect(cx - 54, cy - 210, 108, 420, 24, w, 0.12),
        stroke(`M180 620 Q640 220 1100 560`, b, 5, 0.65, 'none'),
        dot(180, 620, 12, b, 0.9),
        dot(1100, 560, 12, a, 0.9),
      ];
      for (let i = 0; i < 4; i += 1) {
        parts.push(rrect(200 + i * 36, 180 + i * 18, 28, 28, 9, a, 0.4 - i * 0.07));
        parts.push(rrect(1000 - i * 36, 200 + i * 18, 28, 28, 9, b, 0.4 - i * 0.07));
      }
      return parts.join('');
    }

    case 'analytics': {
      const parts = [];
      const heights = [120, 210, 160, 290, 230, 340];
      heights.forEach((h, i) => {
        parts.push(
          rrect(cx - 330 + i * 118, cy + 210 - h, 72, h, 18, i % 2 ? a : b, 0.55 + (i % 2) * 0.2),
        );
      });
      parts.push(
        stroke(
          `M${cx - 300} ${cy + 60} L${cx - 182} ${cy - 26} L${cx - 64} ${cy + 12} L${cx + 54} ${cy - 110} L${cx + 172} ${cy - 62} L${cx + 290} ${cy - 164}`,
          w,
          6,
          0.9,
        ),
      );
      [-300, -182, -64, 54, 172, 290].forEach((dx, i) => {
        const ys = [60, -26, 12, -110, -62, -164];
        parts.push(dot(cx + dx, cy + ys[i], 10, w, 1));
      });
      parts.push(stroke(`M${cx - 340} ${cy - 250} H${cx + 340}`, a, 5, 0.6));
      parts.push(stroke(`M${cx} ${cy - 250} v-60`, a, 5, 0.6));
      parts.push(ring(cx - 250, cy - 212, 42, b, 4, 0.7));
      parts.push(ring(cx + 250, cy - 212, 42, b, 4, 0.7));
      return parts.join('');
    }

    case 'waveform': {
      const parts = [];
      for (let i = 0; i < 38; i += 1) {
        const h = 40 + Math.abs(Math.sin(i * 0.7) * 230) + (i % 5) * 12;
        parts.push(
          rrect(cx - 440 + i * 24, cy - h / 2, 11, h, 6, i % 3 ? a : b, 0.4 + (i % 4) * 0.14),
        );
      }
      for (let i = 0; i < 4; i += 1) {
        const x = 170 + i * 68;
        parts.push(rrect(x, cy + 210, 8, 160, 4, w, 0.25));
        parts.push(rrect(x - 14, cy + 250 + i * 26, 36, 20, 8, b, 0.85));
      }
      parts.push(ring(1060, cy - 220, 54, a, 6, 0.7));
      parts.push(stroke(`M1060 ${cy - 220} v-36`, a, 6, 0.9));
      return parts.join('');
    }

    case 'leaf': {
      const parts = [
        shape(
          `M${cx} ${cy - 250} c-150 90 -220 180 -220 268 0 86 96 150 220 150 126 0 222 -64 222 -150 0 -88 -72 -178 -222 -268 z`,
          'url(#sheen)',
          0.95,
        ),
        stroke(`M${cx} ${cy - 230} V${cy + 150}`, p.deep, 4, 0.45),
      ];
      for (let i = 0; i < 6; i += 1) {
        const y = cy - 170 + i * 58;
        parts.push(stroke(`M${cx} ${n(y)} l${n(-96 + i * 8)} ${n(56 - i * 3)}`, p.deep, 3, 0.3));
        parts.push(stroke(`M${cx} ${n(y)} l${n(96 - i * 8)} ${n(56 - i * 3)}`, p.deep, 3, 0.3));
      }
      parts.push(stroke(`M${cx - 330} ${cy + 250} a330 150 0 0 0 660 0`, b, 8, 0.7));
      for (let i = 0; i < 10; i += 1) {
        parts.push(
          stroke(
            `M${n(cx - 230 + i * 52)} ${cy + 250} v${n(70 - Math.abs(i - 4.5) * 10)}`,
            b,
            4,
            0.35,
          ),
        );
      }
      return parts.join('');
    }

    case 'bottle': {
      const parts = [
        rrect(cx - 36, cy - 280, 72, 90, 14, b, 0.85),
        shape(
          `M${cx - 36} ${cy - 196} h72 l54 108 v240 a30 30 0 0 1 -30 30 h-120 a30 30 0 0 1 -30 -30 v-240 z`,
          'url(#sheen)',
          0.95,
        ),
        rrect(cx - 92, cy - 30, 184, 120, 12, w, 0.16),
        shape(
          `M${cx + 108} ${cy - 60} c90 40 140 120 120 210 -70 -40 -120 -110 -120 -210 z`,
          b,
          0.55,
        ),
      ];
      for (let i = 0; i < 5; i += 1) {
        parts.push(dot(cx + 200 + i * 34, cy + 190 + (i % 2) * 36, 8 - i, a, 0.6));
      }
      parts.push(stroke(`M${cx - 250} ${cy + 170} q60 -120 150 -150`, a, 5, 0.6));
      for (let i = 0; i < 4; i += 1) {
        parts.push(
          shape(
            `M${n(cx - 230 + i * 40)} ${n(cy + 140 - i * 36)} c-30 -20 -30 -56 0 -76 30 20 30 56 0 76 z`,
            a,
            0.55,
          ),
        );
      }
      return parts.join('');
    }

    case 'burst': {
      const parts = [];
      for (let i = 0; i < 24; i += 1) {
        const ang = (i / 24) * Math.PI * 2;
        const r1 = 250 + (i % 3) * 34;
        const r2 = r1 + 80 + (i % 4) * 26;
        parts.push(
          stroke(
            `M${n(cx + Math.cos(ang) * r1)} ${n(cy + Math.sin(ang) * r1)} L${n(cx + Math.cos(ang) * r2)} ${n(cy + Math.sin(ang) * r2)}`,
            i % 2 ? a : b,
            6,
            0.4,
          ),
        );
      }
      parts.push(dot(cx, cy, 230, p.deep, 0.5));
      parts.push(ring(cx, cy, 230, a, 3, 0.6));
      parts.push(rrect(cx - 40, cy - 200, 80, 70, 16, b, 0.9));
      parts.push(
        shape(`M${cx - 70} ${cy - 136} h140 v230 a70 70 0 0 1 -140 0 z`, 'url(#sheen)', 0.95),
      );
      parts.push(rrect(cx - 70, cy - 30, 140, 76, 10, w, 0.18));
      return parts.join('');
    }

    case 'droplet': {
      const parts = [
        shape(
          `M${cx} ${cy - 270} c-110 150 -168 244 -168 320 0 96 76 166 168 166 94 0 170 -70 170 -166 0 -76 -60 -170 -170 -320 z`,
          'url(#sheen)',
          0.95,
        ),
        shape(`M${cx} ${cy - 270} c-110 150 -168 244 -168 320 0 96 76 166 168 166 z`, w, 0.14),
        dot(cx - 56, cy + 170, 32, w, 0.3),
      ];
      /**
       * @param {number} hx
       * @param {number} hy
       * @param {number} r
       * @param {string} fill
       * @param {number} op
       * @returns {string}
       */
      const hex = (hx, hy, r, fill, op) => {
        const pts = [];
        for (let i = 0; i < 6; i += 1) {
          const ang = (i / 6) * Math.PI * 2 - Math.PI / 2;
          pts.push(`${n(hx + Math.cos(ang) * r)},${n(hy + Math.sin(ang) * r)}`);
        }
        return `<polygon points="${pts.join(' ')}" fill="none" stroke="${fill}" stroke-width="3" opacity="${n(op)}"/>`;
      };
      const coords = [
        [250, 250],
        [250, 380],
        [362, 315],
        [1030, 300],
        [1030, 430],
        [918, 365],
        [1142, 365],
      ];
      coords.forEach(([hx, hy], i) => parts.push(hex(hx, hy, 62, i % 2 ? b : a, 0.55)));
      return parts.join('');
    }

    case 'market': {
      const parts = [];
      for (let s = 0; s < 3; s += 1) {
        const y = cy - 220 + s * 150;
        parts.push(rrect(cx - 360, y + 92, 720, 14, 7, w, 0.3));
        for (let i = 0; i < 7; i += 1) {
          const h = 56 + ((i + s) % 4) * 22;
          parts.push(
            rrect(
              cx - 340 + i * 100,
              y + 92 - h,
              62,
              h,
              10,
              (i + s) % 2 ? a : b,
              0.5 + ((i + s) % 3) * 0.14,
            ),
          );
        }
      }
      parts.push(shape(`M${cx + 150} ${cy + 180} h300 l-40 190 h-220 z`, 'url(#sheen)', 0.9));
      parts.push(stroke(`M${cx + 196} ${cy + 180} a104 104 0 0 1 208 0`, b, 8, 0.8));
      return parts.join('');
    }

    case 'share': {
      const parts = [
        shape(
          `M${cx - 250} ${cy + 40} c0 130 110 210 250 210 s250 -80 250 -210 z`,
          'url(#sheen)',
          0.95,
        ),
        rrect(cx - 290, cy + 18, 580, 26, 13, w, 0.35),
        stroke(`M${cx - 140} ${cy - 60} c0 -70 40 -110 140 -110 s140 40 140 110`, b, 6, 0.6),
        shape(
          `M${cx - 420} ${cy + 120} c-60 -40 -70 -110 -20 -140 40 -24 90 -4 110 40 l40 90 z`,
          b,
          0.65,
        ),
        shape(
          `M${cx + 420} ${cy + 120} c60 -40 70 -110 20 -140 -40 -24 -90 -4 -110 40 l-40 90 z`,
          b,
          0.65,
        ),
      ];
      for (let i = 0; i < 14; i += 1) {
        const ang = (i / 14) * Math.PI * 2;
        parts.push(
          dot(cx + Math.cos(ang) * 350, cy - 30 + Math.sin(ang) * 300, 10 - (i % 3) * 2, a, 0.4),
        );
      }
      return parts.join('');
    }

    case 'vehicle': {
      const parts = [
        ring(cx, cy, 300, a, 1.6, 0.3, '10 14'),
        ring(cx, cy, 236, a, 1.6, 0.2, '6 12'),
        shape(
          `M${cx - 110} ${cy - 210} c40 -36 180 -36 220 0 l26 170 v180 c0 30 -24 54 -54 54 h-164 c-30 0 -54 -24 -54 -54 v-180 z`,
          'url(#sheen)',
          0.95,
        ),
        shape(`M${cx - 86} ${cy - 170} c34 -24 138 -24 172 0 l16 96 h-204 z`, p.deep, 0.5),
        rrect(cx - 96, cy - 30, 192, 120, 16, w, 0.16),
        rrect(cx - 140, cy - 110, 32, 70, 12, b, 0.75),
        rrect(cx + 108, cy - 110, 32, 70, 12, b, 0.75),
        stroke(`M200 660 q140 -130 300 -70 t300 -60 t280 -140`, b, 5, 0.6),
        dot(200, 660, 11, b, 0.9),
      ];
      for (let i = 0; i < 4; i += 1) {
        parts.push(ring(cx, cy, 320 + i * 44, a, 2, 0.16 - i * 0.03));
      }
      return parts.join('');
    }

    default:
      return '';
  }
}

/**
 * A browser chrome, drawn plainly so it reads as a diagram rather than a screenshot.
 *
 * @param {number} x
 * @param {number} y
 * @param {number} w
 * @param {number} h
 * @param {Palette} p
 * @returns {string}
 */
const browserFrame = (x, y, w, h, p) =>
  [
    rrect(x, y, w, h, 22, p.deep, 0.92),
    rrect(x, y, w, h, 22, 'url(#glass)', 1),
    rrect(x, y, w, 50, 22, '#FFFFFF', 0.07),
    dot(x + 28, y + 25, 7, p.accent, 0.8),
    dot(x + 50, y + 25, 7, '#FFFFFF', 0.22),
    dot(x + 72, y + 25, 7, '#FFFFFF', 0.22),
    rrect(x + 100, y + 15, w - 140, 20, 10, '#FFFFFF', 0.08),
  ].join('');

/**
 * @param {number} x
 * @param {number} y
 * @param {number} w
 * @param {number} h
 * @param {Palette} p
 * @returns {string}
 */
const phoneFrame = (x, y, w, h, p) =>
  [
    rrect(x - 8, y - 8, w + 16, h + 16, 56, p.accent, 0.18),
    rrect(x, y, w, h, 48, p.deep, 0.95),
    rrect(x, y, w, h, 48, 'url(#glass)', 1),
    rrect(x + w / 2 - 44, y + 18, 88, 12, 6, '#FFFFFF', 0.18),
  ].join('');

/**
 * @param {string} ui
 * @param {Palette} p
 * @param {'browser' | 'phone'} frame
 * @returns {string}
 */
function drawInterface(ui, p, frame) {
  const a = p.accent;
  const b = p.accent2;
  const w = '#FFFFFF';
  const parts = [];

  const fx = frame === 'phone' ? 430 : 150;
  const fy = frame === 'phone' ? 70 : 120;
  const fw = frame === 'phone' ? 420 : 980;
  const fh = frame === 'phone' ? 660 : 560;
  parts.push(frame === 'phone' ? phoneFrame(fx, fy, fw, fh, p) : browserFrame(fx, fy, fw, fh, p));

  const ix = fx + (frame === 'phone' ? 30 : 34);
  const iy = fy + (frame === 'phone' ? 58 : 86);
  const iw = fw - (frame === 'phone' ? 60 : 68);

  switch (ui) {
    case 'tracker': {
      parts.push(rrect(ix, iy, iw, 46, 23, w, 0.1));
      parts.push(dot(ix + 26, iy + 23, 9, a, 0.9));
      parts.push(rrect(ix + 48, iy + 16, iw * 0.5, 14, 7, w, 0.3));
      for (let i = 0; i < 5; i += 1) {
        const ry = iy + 72 + i * 86;
        parts.push(rrect(ix, ry, iw, 70, 18, w, 0.07));
        parts.push(rrect(ix + 16, ry + 16, 38, 38, 12, i % 2 ? a : b, 0.8));
        parts.push(rrect(ix + 68, ry + 18, iw * 0.44, 12, 6, w, 0.38));
        parts.push(rrect(ix + 68, ry + 40, iw * 0.3, 10, 5, w, 0.2));
        parts.push(rrect(ix + iw - 74, ry + 25, 58, 20, 10, a, 0.35));
      }
      break;
    }

    case 'fitment': {
      for (let i = 0; i < 4; i += 1) {
        parts.push(rrect(ix + i * (iw / 4), iy, iw / 4 - 14, 54, 14, w, 0.1));
        parts.push(
          rrect(
            ix + i * (iw / 4) + 16,
            iy + 20,
            iw / 4 - 70,
            14,
            7,
            i === 3 ? a : w,
            i === 3 ? 0.9 : 0.3,
          ),
        );
      }
      for (let i = 0; i < 4; i += 1) {
        const ry = iy + 80 + i * 100;
        parts.push(rrect(ix, ry, iw, 84, 18, w, 0.07));
        parts.push(rrect(ix + 18, ry + 16, 110, 52, 12, i % 2 ? a : b, 0.35));
        parts.push(textBars(ix + 148, ry + 18, [iw * 0.36, iw * 0.24], 12, w, 0.4));
        parts.push(
          rrect(ix + iw - 128, ry + 28, 108, 28, 14, i === 1 ? b : a, i === 1 ? 0.35 : 0.85),
        );
      }
      break;
    }

    case 'bundle': {
      for (let i = 0; i < 4; i += 1) {
        const bx = ix + i * (iw / 4);
        parts.push(rrect(bx, iy, iw / 4 - 18, 190, 20, w, 0.08));
        parts.push(
          rrect(bx + iw / 8 - 34, iy + 28, 68, 104, 14, i < 3 ? a : w, i < 3 ? 0.8 : 0.15),
        );
        parts.push(rrect(bx + 20, iy + 150, iw / 4 - 58, 12, 6, w, 0.3));
        if (i < 3) {
          parts.push(dot(bx + iw / 4 - 40, iy + 22, 14, b, 0.95));
        }
      }
      parts.push(rrect(ix, iy + 220, iw, 92, 20, w, 0.09));
      parts.push(rrect(ix + 20, iy + 248, 150, 36, 18, a, 0.9));
      parts.push(rrect(ix + 186, iy + 254, 170, 24, 12, w, 0.18));
      parts.push(rrect(ix + iw - 180, iy + 240, 160, 52, 26, b, 0.3));
      parts.push(dot(ix + iw - 150, iy + 266, 18, b, 0.95));
      parts.push(rrect(ix, iy + 332, iw, 70, 18, w, 0.06));
      parts.push(textBars(ix + 22, iy + 352, [iw * 0.5, iw * 0.3], 12, w, 0.3));
      break;
    }

    case 'regions': {
      for (let i = 0; i < 5; i += 1) {
        parts.push(rrect(ix + i * 128, iy, 112, 42, 21, i === 1 ? a : w, i === 1 ? 0.9 : 0.1));
      }
      for (let i = 0; i < 3; i += 1) {
        const cxx = ix + i * (iw / 3);
        parts.push(rrect(cxx, iy + 70, iw / 3 - 20, 250, 20, w, 0.08));
        parts.push(rrect(cxx, iy + 70, iw / 3 - 20, 150, 20, i % 2 ? a : b, 0.35));
        parts.push(textBars(cxx + 18, iy + 240, [iw / 3 - 70, iw / 4], 12, w, 0.4));
      }
      parts.push(rrect(ix, iy + 346, iw, 56, 16, w, 0.07));
      parts.push(rrect(ix + 18, iy + 362, 200, 24, 12, b, 0.6));
      break;
    }

    case 'quiz': {
      parts.push(rrect(ix, iy, iw, 12, 6, w, 0.12));
      parts.push(rrect(ix, iy, iw * 0.62, 12, 6, a, 0.95));
      for (let i = 0; i < 3; i += 1) {
        parts.push(rrect(ix, iy + 44 + i * 78, iw, 62, 18, w, i === 1 ? 0.13 : 0.07));
        parts.push(ring(ix + 36, iy + 75 + i * 78, 15, i === 1 ? a : w, 3, i === 1 ? 1 : 0.3));
        if (i === 1) parts.push(dot(ix + 36, iy + 75 + i * 78, 8, a, 1));
        parts.push(rrect(ix + 70, iy + 68 + i * 78, iw * (0.5 - i * 0.08), 14, 7, w, 0.34));
      }
      parts.push(rrect(ix, iy + 290, iw, 112, 20, w, 0.09));
      for (let i = 0; i < 3; i += 1) {
        parts.push(rrect(ix + 24 + i * 118, iy + 314, 92, 64, 14, i === 0 ? a : b, 0.7 - i * 0.16));
      }
      parts.push(rrect(ix + iw - 170, iy + 328, 150, 40, 20, a, 0.9));
      break;
    }

    case 'configurator': {
      parts.push(rrect(ix, iy, 190, 330, 18, w, 0.07));
      for (let i = 0; i < 6; i += 1) {
        parts.push(
          rrect(
            ix + 18,
            iy + 22 + i * 50,
            120 - (i % 3) * 20,
            14,
            7,
            i === 2 ? a : w,
            i === 2 ? 0.9 : 0.25,
          ),
        );
        parts.push(ring(ix + 158, iy + 29 + i * 50, 9, w, 2.5, 0.3));
      }
      for (let i = 0; i < 6; i += 1) {
        const gx = ix + 214 + (i % 3) * ((iw - 214) / 3);
        const gy = iy + Math.floor(i / 3) * 168;
        parts.push(rrect(gx, gy, (iw - 214) / 3 - 18, 150, 18, w, 0.08));
        parts.push(dot(gx + (iw - 214) / 6 - 9, gy + 62, 34, i % 2 ? a : b, 0.6));
        parts.push(rrect(gx + 18, gy + 112, (iw - 214) / 3 - 62, 12, 6, w, 0.3));
      }
      parts.push(rrect(ix, iy + 352, iw, 60, 18, a, 0.2));
      parts.push(rrect(ix + 20, iy + 370, 230, 22, 11, w, 0.4));
      parts.push(rrect(ix + iw - 160, iy + 366, 140, 32, 16, a, 0.95));
      break;
    }

    case 'trade': {
      parts.push(rrect(ix, iy, 300, 230, 20, w, 0.1));
      parts.push(rrect(ix + 22, iy + 28, 180, 16, 8, w, 0.35));
      parts.push(rrect(ix + 22, iy + 66, 256, 44, 12, w, 0.08));
      parts.push(rrect(ix + 22, iy + 122, 256, 44, 12, w, 0.08));
      parts.push(rrect(ix + 22, iy + 178, 140, 36, 18, a, 0.9));
      for (let i = 0; i < 12; i += 1) {
        const sx = ix + 336 + (i % 4) * 150;
        const sy = iy + Math.floor(i / 4) * 128;
        parts.push(rrect(sx, sy, 130, 110, 14, i % 3 === 0 ? a : b, 0.28 + (i % 5) * 0.1));
        parts.push(rrect(sx, sy + 92, 130, 18, 6, p.deep, 0.4));
      }
      parts.push(rrect(ix, iy + 260, 300, 150, 20, w, 0.06));
      parts.push(textBars(ix + 22, iy + 286, [240, 190, 150], 12, w, 0.3));
      break;
    }

    case 'valuation': {
      parts.push(rrect(ix, iy, iw * 0.52, 330, 20, w, 0.08));
      for (let i = 0; i < 4; i += 1) {
        parts.push(rrect(ix + 24, iy + 28 + i * 66, iw * 0.44, 46, 12, w, 0.08));
        parts.push(rrect(ix + 42, iy + 44 + i * 66, iw * (0.3 - i * 0.04), 14, 7, w, 0.28));
      }
      parts.push(rrect(ix + 24, iy + 292, 170, 40, 20, a, 0.92));
      parts.push(rrect(ix + iw * 0.56, iy, iw * 0.44, 180, 20, a, 0.16));
      parts.push(rrect(ix + iw * 0.56 + 24, iy + 28, 120, 14, 7, w, 0.4));
      parts.push(rrect(ix + iw * 0.56 + 24, iy + 60, 230, 40, 10, w, 0.6));
      parts.push(rrect(ix + iw * 0.56 + 24, iy + 120, 160, 14, 7, b, 0.8));
      parts.push(rrect(ix + iw * 0.56, iy + 200, iw * 0.44, 210, 20, w, 0.07));
      for (let i = 0; i < 14; i += 1) {
        parts.push(
          rrect(
            ix + iw * 0.56 + 24 + (i % 7) * 44,
            iy + 240 + Math.floor(i / 7) * 48,
            34,
            34,
            8,
            i === 9 ? a : w,
            i === 9 ? 0.95 : 0.14,
          ),
        );
      }
      break;
    }

    case 'booking': {
      for (let i = 0; i < 4; i += 1) {
        parts.push(
          ring(ix + 40 + i * ((iw - 80) / 3), iy + 24, 20, i <= 1 ? a : w, 3.5, i <= 1 ? 1 : 0.25),
        );
        if (i <= 1) parts.push(dot(ix + 40 + i * ((iw - 80) / 3), iy + 24, 10, a, 1));
        if (i < 3)
          parts.push(
            stroke(
              `M${ix + 66 + i * ((iw - 80) / 3)} ${iy + 24} H${ix + 14 + (i + 1) * ((iw - 80) / 3)}`,
              i === 0 ? a : w,
              3,
              i === 0 ? 0.8 : 0.2,
            ),
          );
      }
      parts.push(rrect(ix, iy + 70, iw * 0.46, 300, 20, w, 0.08));
      parts.push(rrect(ix + 22, iy + 96, iw * 0.3, 16, 8, w, 0.35));
      for (let i = 0; i < 4; i += 1) {
        parts.push(
          rrect(
            ix + 22,
            iy + 134 + i * 58,
            iw * 0.4,
            44,
            12,
            i === 1 ? a : w,
            i === 1 ? 0.25 : 0.07,
          ),
        );
      }
      parts.push(rrect(ix + iw * 0.5, iy + 70, iw * 0.5, 300, 20, w, 0.08));
      for (let i = 0; i < 28; i += 1) {
        parts.push(
          rrect(
            ix + iw * 0.5 + 24 + (i % 7) * ((iw * 0.5 - 60) / 7),
            iy + 110 + Math.floor(i / 7) * 58,
            40,
            40,
            10,
            i === 16 ? a : w,
            i === 16 ? 0.95 : 0.12,
          ),
        );
      }
      break;
    }

    case 'consulting': {
      for (let i = 0; i < 3; i += 1) {
        parts.push(rrect(ix + i * (iw / 3), iy, iw / 3 - 20, 180, 18, w, 0.08));
        parts.push(rrect(ix + i * (iw / 3) + 20, iy + 22, 44, 44, 12, i === 0 ? a : b, 0.8));
        parts.push(textBars(ix + i * (iw / 3) + 20, iy + 86, [iw / 3 - 70, iw / 4], 12, w, 0.36));
      }
      parts.push(rrect(ix, iy + 204, iw, 94, 18, a, 0.14));
      for (let i = 0; i < 4; i += 1) {
        parts.push(rrect(ix + 30 + i * (iw / 4), iy + 224, 86, 26, 8, a, 0.85));
        parts.push(rrect(ix + 30 + i * (iw / 4), iy + 262, 130, 12, 6, w, 0.3));
      }
      for (let i = 0; i < 5; i += 1) {
        parts.push(dot(ix + 46 + i * 70, iy + 358, 32, i % 2 ? a : b, 0.45));
        parts.push(ring(ix + 46 + i * 70, iy + 358, 32, w, 2, 0.25));
      }
      break;
    }

    case 'catalogue': {
      for (let i = 0; i < 5; i += 1) {
        parts.push(rrect(ix + i * 120, iy, 104, 38, 19, i === 0 ? a : w, i === 0 ? 0.9 : 0.1));
      }
      for (let i = 0; i < 8; i += 1) {
        const gx = ix + (i % 4) * (iw / 4);
        const gy = iy + 60 + Math.floor(i / 4) * 180;
        parts.push(rrect(gx, gy, iw / 4 - 20, 160, 18, w, 0.08));
        parts.push(rrect(gx, gy, iw / 4 - 20, 96, 18, i % 3 === 0 ? a : b, 0.4));
        parts.push(rrect(gx + 16, gy + 112, iw / 5, 12, 6, w, 0.35));
        parts.push(rrect(gx + 16, gy + 132, 54, 12, 6, a, 0.85));
      }
      parts.push(rrect(ix + iw - 250, iy + 424, 250, 0, 0, w, 0));
      break;
    }

    case 'subscribe': {
      parts.push(rrect(ix, iy, iw * 0.42, 330, 20, b, 0.3));
      parts.push(dot(ix + iw * 0.21, iy + 150, 86, a, 0.65));
      for (let i = 0; i < 3; i += 1) {
        parts.push(rrect(ix + 26 + i * 70, iy + 266, 56, 44, 10, w, 0.14));
      }
      parts.push(textBars(ix + iw * 0.48, iy + 10, [iw * 0.4, iw * 0.3, iw * 0.34], 16, w, 0.42));
      parts.push(rrect(ix + iw * 0.48, iy + 110, iw * 0.48, 72, 18, a, 0.2));
      parts.push(ring(ix + iw * 0.48 + 30, iy + 146, 14, a, 3.5, 1));
      parts.push(dot(ix + iw * 0.48 + 30, iy + 146, 7, a, 1));
      parts.push(rrect(ix + iw * 0.48 + 60, iy + 138, iw * 0.24, 14, 7, w, 0.4));
      parts.push(rrect(ix + iw * 0.48, iy + 194, iw * 0.48, 72, 18, w, 0.07));
      parts.push(ring(ix + iw * 0.48 + 30, iy + 230, 14, w, 3, 0.3));
      parts.push(rrect(ix + iw * 0.48 + 60, iy + 222, iw * 0.2, 14, 7, w, 0.26));
      parts.push(rrect(ix + iw * 0.48, iy + 286, iw * 0.3, 48, 24, a, 0.95));
      break;
    }

    case 'departments': {
      for (let i = 0; i < 4; i += 1) {
        const dx = ix + i * (iw / 4);
        parts.push(rrect(dx, iy, iw / 4 - 18, 170, 20, i % 2 ? a : b, 0.35));
        parts.push(dot(dx + iw / 8 - 9, iy + 70, 32, w, 0.5));
        parts.push(rrect(dx + 20, iy + 122, iw / 4 - 60, 14, 7, w, 0.5));
      }
      for (let i = 0; i < 3; i += 1) {
        const ry = iy + 198 + i * 72;
        parts.push(rrect(ix, ry, iw, 58, 16, w, 0.07));
        parts.push(dot(ix + 36, ry + 29, 13, i === 0 ? a : b, 0.85));
        parts.push(rrect(ix + 66, ry + 16, iw * 0.3, 12, 6, w, 0.34));
        parts.push(rrect(ix + 66, ry + 36, iw * 0.18, 10, 5, w, 0.18));
        parts.push(rrect(ix + iw - 120, ry + 20, 100, 22, 11, a, 0.3));
      }
      break;
    }

    case 'feed': {
      for (let i = 0; i < 4; i += 1) {
        const ry = iy + i * 134;
        parts.push(rrect(ix, ry, iw, 118, 20, w, 0.08));
        parts.push(rrect(ix + 16, ry + 16, 86, 86, 16, i % 2 ? a : b, 0.6));
        parts.push(textBars(ix + 118, ry + 20, [iw * 0.42, iw * 0.3], 12, w, 0.4));
        parts.push(rrect(ix + 118, ry + 74, 76, 24, 12, a, 0.35));
        parts.push(dot(ix + iw - 42, ry + 34, 11, b, 0.85));
      }
      break;
    }

    case 'telemetry': {
      parts.push(rrect(ix, iy, iw, 150, 20, w, 0.08));
      for (let i = 0; i < 3; i += 1) {
        const gx = ix + 40 + i * (iw / 3);
        parts.push(ring(gx + 36, iy + 75, 44, w, 7, 0.14));
        parts.push(
          stroke(
            `M${n(gx + 36 - 44)} ${iy + 75} a44 44 0 0 1 ${n(44 + 44 * Math.cos(Math.PI * (0.35 + i * 0.2)))} ${n(-44 * Math.sin(Math.PI * (0.35 + i * 0.2)))}`,
            i === 0 ? a : b,
            7,
            0.95,
          ),
        );
      }
      parts.push(rrect(ix, iy + 172, iw, 180, 20, w, 0.06));
      parts.push(stroke(`M${ix + 40} ${iy + 310} q120 -120 260 -70 t280 -50`, a, 5, 0.85));
      parts.push(dot(ix + 40, iy + 310, 10, a, 1));
      parts.push(dot(ix + iw - 60, iy + 196, 10, b, 1));
      for (let i = 0; i < 3; i += 1) {
        parts.push(
          rrect(
            ix + i * (iw / 3),
            iy + 372,
            iw / 3 - 16,
            56,
            28,
            i === 0 ? a : w,
            i === 0 ? 0.9 : 0.08,
          ),
        );
      }
      break;
    }

    default:
      break;
  }

  return parts.join('');
}

/**
 * @param {ProductArt} art
 * @returns {string}
 */
export function mainVisualSvg(art) {
  return [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}">`,
    defs(art.palette),
    backdrop(art.palette, art.variant),
    `<ellipse cx="640" cy="400" rx="470" ry="400" fill="url(#stage)"/>`,
    drawMotif(art.motif, art.palette),
    `<rect width="${WIDTH}" height="${HEIGHT}" fill="url(#vignette)"/>`,
    `</svg>`,
  ].join('');
}

/**
 * @param {ProductArt} art
 * @returns {string}
 */
export function experienceVisualSvg(art) {
  const p = art.palette;
  return [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}">`,
    defs(p),
    `<rect width="${WIDTH}" height="${HEIGHT}" fill="url(#bg)"/>`,
    `<circle cx="${art.variant % 2 === 0 ? 220 : 1060}" cy="${art.variant % 3 === 0 ? 180 : 620}" r="520" fill="url(#glow)"/>`,
    drawInterface(art.ui, p, art.frame),
    `<rect width="${WIDTH}" height="${HEIGHT}" fill="url(#vignette)"/>`,
    `</svg>`,
  ].join('');
}

/**
 * @param {string} svg
 * @param {string} target
 * @returns {Promise<number>} the encoded size in bytes
 */
async function encode(svg, target) {
  const buffer = await sharp(Buffer.from(svg)).webp({ quality: QUALITY, effort: 6 }).toBuffer();
  await writeFile(target, buffer);
  return buffer.length;
}

async function main() {
  const seen = new Set();
  let total = 0;
  let largest = 0;

  for (const art of PRODUCT_ART) {
    if (seen.has(art.id)) {
      console.error(`[product-images] duplicate product id ${art.id}`);
      exit(1);
    }
    seen.add(art.id);

    const dir = join(OUT_DIR, art.folder);
    await mkdir(dir, { recursive: true });

    const main = await encode(mainVisualSvg(art), join(dir, 'main-visual.webp'));
    const experience = await encode(experienceVisualSvg(art), join(dir, 'experience-visual.webp'));

    total += main + experience;
    largest = Math.max(largest, main, experience);
    console.log(
      `${art.folder}  ${art.id.padEnd(18)} main ${String(Math.round(main / 1024)).padStart(4)} kB   experience ${String(Math.round(experience / 1024)).padStart(4)} kB`,
    );
  }

  if (seen.size !== 19) {
    console.error(`[product-images] expected 19 products, drew ${seen.size}`);
    exit(1);
  }

  console.log(
    `\n[product-images] ${seen.size * 2} images, ${(total / 1024).toFixed(1)} kB in total, largest ${(largest / 1024).toFixed(1)} kB.`,
  );
}

if (import.meta.filename === process.argv[1]) {
  await main();
}
