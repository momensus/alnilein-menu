/* Top-down plate illustrations + swimming fish, matching the reference art system.
   Every entry is an SVG inner-string wrapped by `art()` in a 200x200 viewBox. */

const PLATE = `<circle cx="100" cy="100" r="92" fill="#f1e7d8"/><circle cx="100" cy="100" r="78" fill="#e3d4bf"/><circle cx="100" cy="100" r="72" fill="#f7efe3"/>`;
const SHADOW = `<ellipse cx="100" cy="178" rx="70" ry="10" fill="#000" opacity=".3"/>`;
const DARK = `<circle cx="100" cy="100" r="92" fill="#2a1c18"/><circle cx="100" cy="100" r="84" fill="none" stroke="#e0af55" stroke-width="2"/><circle cx="100" cy="100" r="78" fill="#352420"/>`;
const STEAM = `<g class="steam" stroke="#fff" stroke-width="4" stroke-linecap="round" fill="none"><path d="M80 52 q6 -12 0 -24 q-6 -12 0 -24"/><path d="M100 56 q6 -12 0 -24 q-6 -12 0 -24"/><path d="M120 52 q6 -12 0 -24 q-6 -12 0 -24"/></g>`;
const PARSLEY = `<circle cx="70" cy="130" r="4" fill="#4f9a3a"/><circle cx="130" cy="126" r="4" fill="#4f9a3a"/><circle cx="100" cy="142" r="3.4" fill="#6fb352"/>`;

function grains(n: number, cx: number, cy: number, rx: number, ry: number): string {
  let s = '';
  for (let i = 0; i < n; i += 1) {
    const a = (i / n) * Math.PI * 2 + 0.4;
    const x = (cx + Math.cos(a) * rx).toFixed(1);
    const y = (cy + Math.sin(a) * ry * 0.55).toFixed(1);
    s += `<ellipse cx="${x}" cy="${y}" rx="5" ry="2.6" fill="#f0cf7e" transform="rotate(${(a * 57).toFixed(0)} ${x} ${y})"/>`;
  }
  return s;
}

function rice(cx = 100, cy = 108, rx = 62): string {
  return `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="34" fill="#e5bd62"/><ellipse cx="${cx}" cy="${cy - 8}" rx="${rx - 12}" ry="26" fill="#f0cf7e"/>${grains(30, cx, cy - 4, rx - 16, 30)}`;
}

function chunk(x: number, y: number, c1: string, c2: string, r = 13): string {
  return `<g><ellipse cx="${x}" cy="${y}" rx="${r}" ry="${r - 3}" fill="${c1}"/><ellipse cx="${x - 3}" cy="${y - 3}" rx="${r - 6}" ry="${r - 7}" fill="${c2}"/><path d="M${x - 7} ${y - 4} l14 8 M${x - 7} ${y + 3} l14 -6" stroke="#3d1c0c" stroke-width="2" opacity=".6"/></g>`;
}

function lemon(x: number, y: number, r = 14): string {
  return `<g><circle cx="${x}" cy="${y}" r="${r}" fill="#f4d34e"/><circle cx="${x}" cy="${y}" r="${r - 5}" fill="#fff3b0"/><path d="M${x - r + 5} ${y} H${x + r - 5} M${x} ${y - r + 5} V${y + r - 5}" stroke="#e0c02e" stroke-width="2"/></g>`;
}

function glass(juice: string, hi: string, garnish = ''): string {
  return `<g><path d="M74 60 h52 l-7 84 a8 8 0 0 1 -8 7 h-22 a8 8 0 0 1 -8 -7 Z" fill="${juice}"/><path d="M74 60 h52 l-2 22 h-48 Z" fill="${hi}" opacity=".85"/><path d="M74 60 h52 l-7 84 a8 8 0 0 1 -8 7 h-22 a8 8 0 0 1 -8 -7 Z" fill="none" stroke="#fff" stroke-width="3" opacity=".5"/><circle cx="92" cy="110" r="4" fill="#fff" opacity=".5"/><circle cx="108" cy="126" r="3" fill="#fff" opacity=".5"/>${garnish}</g>`;
}

function bucket(body: string, dark: string, contents: string): string {
  return `<g><path d="M64 84 h72 l-8 66 a10 10 0 0 1 -10 9 h-36 a10 10 0 0 1 -10 -9 Z" fill="${body}"/><path d="M64 84 h72 l-2 16 h-68 Z" fill="${dark}"/><ellipse cx="100" cy="86" rx="34" ry="9" fill="${contents}"/><path d="M66 78 q34 -22 68 0" fill="none" stroke="#b7bec4" stroke-width="4"/></g>`;
}

function chicken(kind: 'whole' | 'half' | 'quarter', withRice: boolean): string {
  const ricePart = withRice ? rice(100, 118, kind === 'whole' ? 66 : 58) : '';
  const birds: Record<string, string> = {
    whole: `<g><ellipse cx="100" cy="96" rx="34" ry="26" fill="#c4701f"/><ellipse cx="92" cy="88" rx="20" ry="15" fill="#eca24a"/><path d="M74 90 q26 -14 52 0 M78 104 q22 -10 44 0" stroke="#8a4a14" stroke-width="3" fill="none"/><circle cx="128" cy="78" r="7" fill="#f6e6b0"/><circle cx="72" cy="78" r="7" fill="#f6e6b0"/></g>`,
    half: `<g><ellipse cx="100" cy="98" rx="26" ry="22" fill="#c4701f"/><ellipse cx="94" cy="92" rx="15" ry="12" fill="#eca24a"/><path d="M80 94 q20 -10 40 0" stroke="#8a4a14" stroke-width="3" fill="none"/><rect x="120" y="80" width="7" height="22" rx="3" fill="#f6e6b0" transform="rotate(24 123 91)"/></g>`,
    quarter: `<g><ellipse cx="100" cy="100" rx="18" ry="17" fill="#c4701f"/><ellipse cx="96" cy="95" rx="10" ry="8" fill="#eca24a"/><rect x="112" y="86" width="6" height="18" rx="3" fill="#f6e6b0" transform="rotate(28 115 95)"/></g>`,
  };
  return `${ricePart}${birds[kind]}<circle cx="70" cy="130" r="9" fill="#d6402f"/><circle cx="132" cy="128" r="5" fill="#4a2a5a"/>${STEAM}`;
}

function fishBody(x = 100, y = 108, s = 1): string {
  return `<g transform="translate(${x} ${y}) scale(${s})"><ellipse cx="0" cy="0" rx="42" ry="20" fill="#c98a45"/><ellipse cx="-6" cy="-5" rx="28" ry="12" fill="#e0a35c"/><path d="M-28 -12 l8 24 M-12 -16 l6 30 M4 -16 l-4 30 M20 -12 l-8 22" stroke="#7a4a22" stroke-width="3"/><circle cx="26" cy="-4" r="4" fill="#1a1210"/><circle cx="27.5" cy="-5.5" r="1.3" fill="#fff"/></g>`;
}

const BOARD = `<rect x="42" y="66" width="116" height="72" rx="10" fill="#6e4524"/><rect x="42" y="66" width="116" height="72" rx="10" fill="none" stroke="#9a6a3b" stroke-width="3"/><path d="M52 84 h96 M52 100 h96 M52 116 h96" stroke="#9a6a3b" stroke-width="2" opacity=".6"/>`;
const GARNISH = `<circle cx="62" cy="140" r="6" fill="none" stroke="#e8e0d0" stroke-width="3"/><path d="M138 132 l10 -8 4 12 -12 2 Z" fill="#d6402f"/><circle cx="122" cy="142" r="3" fill="#4f9a3a"/>`;

function boardMeat(c1: string, c2: string, count: number): string {
  let s = BOARD;
  const pos: [number, number][] = [[72, 92], [100, 86], [128, 92], [78, 112], [106, 112], [132, 112], [86, 128], [114, 128], [100, 100]];
  for (let i = 0; i < count; i += 1) {
    const [x, y] = pos[i % pos.length];
    s += chunk(x, y, c1, c2, 12);
  }
  return `${s}${GARNISH}${STEAM}`;
}

export function fishSVG(c1: string, c2: string, c3: string): string {
  return `<svg viewBox="0 0 120 60" aria-hidden="true"><g class="bob"><ellipse cx="58" cy="32" rx="34" ry="15" fill="${c1}"/><ellipse cx="52" cy="27" rx="22" ry="9" fill="${c2}"/><path d="M40 20 q6 -12 14 -14 l-2 16 Z M52 18 q4 -10 12 -12 l-2 14 Z" fill="${c3}"/><path d="M44 44 q8 8 18 6 l-6 -8 Z" fill="${c3}"/><g class="tail"><path d="M90 32 L112 18 L106 32 L112 46 Z" fill="${c3}"/></g><path d="M70 26 q4 6 0 12 M76 26 q4 6 0 12" stroke="${c3}" stroke-width="2" fill="none"/><circle cx="36" cy="29" r="3.4" fill="#101415"/><circle cx="37" cy="28" r="1.1" fill="#fff"/></g></svg>`;
}

export const FISH_COLORS: Record<string, [string, string, string]> = {
  gold: ['#e0af55', '#f6d58b', '#c2872a'],
  ember: ['#d8452f', '#f08a5a', '#8f1f17'],
  pearl: ['#b9c9ce', '#eef3f2', '#7f97a0'],
};

export const MELON_ICON = `<svg viewBox="14 76 172 94" aria-hidden="true"><path d="M30 150 A80 80 0 0 1 170 150 Z" fill="#2f7d3a"/><path d="M40 150 A70 70 0 0 1 160 150 Z" fill="#dbe8b8"/><path d="M52 150 A58 58 0 0 1 148 150 Z" fill="#e8453c"/><circle cx="85" cy="132" r="3" fill="#1a1210"/><circle cx="115" cy="132" r="3" fill="#1a1210"/><circle cx="100" cy="142" r="3" fill="#1a1210"/></svg>`;

function skewers(meat1: string, meat2: string, veg1: string, veg2: string): string {
  let s = '';
  [62, 100, 138].forEach((y, r) => {
    s += `<line x1="46" y1="${y}" x2="154" y2="${y}" stroke="#b88a55" stroke-width="4"/>`;
    for (let i = 0; i < 5; i += 1) {
      const x = 60 + i * 20;
      const meat = i % 2 === 0;
      s += meat
        ? `<rect x="${x - 8}" y="${y - 9}" width="16" height="18" rx="4" fill="${i === 2 ? meat2 : meat1}"/>`
        : `<circle cx="${x}" cy="${y}" r="8" fill="${r === 1 && i === 2 ? veg2 : veg1}"/>`;
    }
  });
  return s;
}

const ART: Record<string, string> = {
  skewer: `${SHADOW}${PLATE}${skewers('#7d3a1f', '#a9552b', '#c9402f', '#6fa04a')}${STEAM}`,
  mandi: `${SHADOW}${PLATE}${rice()}<g transform="rotate(-18 84 92)">${chunk(84, 92, '#7a3b20', '#a65a33')}</g><g transform="rotate(14 116 90)">${chunk(116, 90, '#7a3b20', '#a65a33')}</g>${chunk(100, 104, '#8a4526', '#b06a3a')}<circle cx="70" cy="120" r="4" fill="#4a2a52"/><circle cx="132" cy="118" r="4" fill="#4a2a52"/><circle cx="62" cy="104" r="9" fill="#d6402f"/>${PARSLEY}${STEAM}`,
  salad: `${SHADOW}${PLATE}<g fill="#5fa34a"><ellipse cx="80" cy="96" rx="12" ry="20" transform="rotate(-24 80 96)"/><ellipse cx="104" cy="92" rx="12" ry="22" transform="rotate(12 104 92)"/><ellipse cx="122" cy="110" rx="11" ry="18" transform="rotate(30 122 110)"/><ellipse cx="70" cy="118" rx="11" ry="17" transform="rotate(-40 70 118)"/></g><g fill="#7bc05a"><ellipse cx="92" cy="112" rx="12" ry="19"/><ellipse cx="112" cy="124" rx="10" ry="15" transform="rotate(20 112 124)"/></g><circle cx="84" cy="104" r="8" fill="#d63b2d"/><circle cx="108" cy="100" r="8" fill="#d63b2d"/><circle cx="96" cy="122" r="8" fill="#d63b2d"/><circle cx="120" cy="114" r="7" fill="#d63b2d"/><ellipse cx="72" cy="126" rx="9" ry="5" fill="#cfe6a8"/><ellipse cx="114" cy="132" rx="9" ry="5" fill="#cfe6a8"/><path d="M64 92 q14 8 26 4" stroke="#a43d7a" stroke-width="4" fill="none"/>`,
  juice: `${SHADOW}${DARK}${glass('#f08a1c', '#ffc15a', `<line x1="118" y1="46" x2="108" y2="86" stroke="#e0af55" stroke-width="6"/><circle cx="96" cy="52" r="13" fill="none" stroke="#f6a21e" stroke-width="6"/><circle cx="126" cy="60" r="4" fill="#ffc15a"/>`)}`,
  fish: `${SHADOW}${PLATE}${fishBody()}${lemon(64, 128)}${PARSLEY}${STEAM}`,
  broast: `${SHADOW}${PLATE}<g transform="rotate(-18 82 100)"><ellipse cx="82" cy="100" rx="14" ry="20" fill="#bf6f22"/><ellipse cx="78" cy="94" rx="8" ry="12" fill="#e39b45"/><rect x="90" y="112" width="9" height="20" rx="4" fill="#f3eadf"/></g><g transform="rotate(16 122 102)"><ellipse cx="122" cy="102" rx="14" ry="20" fill="#bf6f22"/><ellipse cx="118" cy="96" rx="8" ry="12" fill="#e39b45"/><rect x="112" y="114" width="9" height="20" rx="4" fill="#f3eadf"/></g><g fill="#f0c24b"><rect x="70" y="128" width="8" height="22" rx="4" transform="rotate(-14 74 139)"/><rect x="86" y="130" width="8" height="22" rx="4" transform="rotate(6 90 141)"/><rect x="104" y="130" width="8" height="22" rx="4" transform="rotate(-6 108 141)"/><rect x="120" y="128" width="8" height="22" rx="4" transform="rotate(12 124 139)"/></g>${STEAM}`,
  soup: `${SHADOW}<ellipse cx="100" cy="104" rx="62" ry="46" fill="#d9c9b2"/><ellipse cx="100" cy="98" rx="56" ry="40" fill="#efe4d2"/><ellipse cx="100" cy="102" rx="46" ry="30" fill="#cf7226"/><ellipse cx="86" cy="102" rx="13" ry="9" fill="#7a3b20"/><ellipse cx="114" cy="106" rx="13" ry="9" fill="#7a3b20"/><circle cx="100" cy="112" r="3" fill="#4f9a3a"/><rect x="128" y="70" width="8" height="44" rx="4" fill="#cfd3d6" transform="rotate(24 132 92)"/>${STEAM}`,
  dessert: `${SHADOW}${PLATE}<circle cx="100" cy="104" r="44" fill="#c9741c"/><circle cx="100" cy="104" r="44" fill="none" stroke="#e29a3a" stroke-width="6"/><circle cx="100" cy="104" r="32" fill="none" stroke="#b5651a" stroke-width="3"/><circle cx="100" cy="104" r="20" fill="none" stroke="#b5651a" stroke-width="3"/><g stroke="#b5651a" stroke-width="2"><path d="M100 60 v88 M56 104 h88 M70 74 l60 60 M130 74 l-60 60"/></g><g fill="#7fae3f"><circle cx="100" cy="72" r="3.4"/><circle cx="122" cy="82" r="3.4"/><circle cx="132" cy="104" r="3.4"/><circle cx="122" cy="126" r="3.4"/><circle cx="100" cy="136" r="3.4"/><circle cx="78" cy="126" r="3.4"/><circle cx="68" cy="104" r="3.4"/><circle cx="78" cy="82" r="3.4"/></g><path d="M66 118 q34 18 68 0" stroke="#fffaf0" stroke-width="4" fill="none"/>`,
  fruit: `${SHADOW}<ellipse cx="100" cy="106" rx="60" ry="44" fill="#fbefe0"/><ellipse cx="100" cy="100" rx="52" ry="36" fill="#fffaf4"/><circle cx="80" cy="96" r="11" fill="#d4263a"/><circle cx="104" cy="90" r="11" fill="#d4263a"/><ellipse cx="122" cy="104" rx="10" ry="8" fill="#8bbd3a"/><circle cx="92" cy="110" r="10" fill="#f39a1f"/><rect x="110" y="112" width="13" height="13" rx="2" fill="#e8453c" transform="rotate(14 116 118)"/><circle cx="76" cy="112" r="5" fill="#2b3a8f"/><circle cx="86" cy="82" r="5" fill="#2b3a8f"/>`,
  tea: `${SHADOW}${DARK}<ellipse cx="100" cy="112" rx="34" ry="26" fill="#fff7e8"/><ellipse cx="100" cy="108" rx="26" ry="19" fill="#b5541a"/><ellipse cx="100" cy="106" rx="20" ry="14" fill="#d98a3c"/><path d="M132 104 q16 4 8 20 q-6 12 -20 8" fill="none" stroke="#fff7e8" stroke-width="6"/><rect x="118" y="120" width="7" height="30" rx="3.5" fill="#e0af55" transform="rotate(20 121 135)"/>${STEAM}`,
  thermos: `${SHADOW}${DARK}<rect x="82" y="66" width="36" height="72" rx="10" fill="#8f1f17"/><rect x="82" y="96" width="36" height="12" fill="#e0af55"/><rect x="88" y="56" width="24" height="14" rx="4" fill="#d7dde0"/><path d="M118 80 q16 6 10 26" fill="none" stroke="#8f1f17" stroke-width="7"/>${STEAM}`,
  coffee: `${SHADOW}${DARK}<ellipse cx="100" cy="112" rx="32" ry="24" fill="#f1e7d8"/><ellipse cx="100" cy="108" rx="24" ry="17" fill="#2a140c"/><ellipse cx="88" cy="140" rx="7" ry="5" fill="#c9a24a" transform="rotate(-20 88 140)"/><ellipse cx="104" cy="144" rx="7" ry="5" fill="#c9a24a" transform="rotate(14 104 144)"/><ellipse cx="118" cy="138" rx="7" ry="5" fill="#c9a24a" transform="rotate(-8 118 138)"/>${STEAM}`,
  coffeexl: `${SHADOW}${DARK}<rect x="76" y="62" width="48" height="80" rx="8" fill="#f1e7d8"/><rect x="76" y="96" width="48" height="20" fill="#2a140c"/><text x="100" y="90" text-anchor="middle" font-family="Georgia,serif" font-size="26" font-weight="bold" fill="#b9822a">XL</text/>${STEAM}`,
  yogurt: `${SHADOW}<ellipse cx="100" cy="104" rx="58" ry="42" fill="#efe4d2"/><ellipse cx="100" cy="100" rx="50" ry="34" fill="#fbf7ef"/><path d="M62 100 q19 -12 38 0 t38 0" stroke="#f0e2c8" stroke-width="4" fill="none"/><circle cx="92" cy="94" r="4" fill="#6fb352"/><circle cx="110" cy="100" r="4" fill="#6fb352"/>`,
  yogbucket: `${SHADOW}${bucket('#3f7ec9', '#1d4f8f', '#fbf7ef')}`,
  rawcamel: `${SHADOW}${PLATE}<ellipse cx="100" cy="104" rx="40" ry="30" fill="#a5262b"/><path d="M72 96 q18 -8 34 -2 M78 112 q22 -6 44 2" stroke="#e9a0a0" stroke-width="4" fill="none"/><path d="M132 118 q10 8 2 18" stroke="#f6e9c8" stroke-width="6" fill="none"/><circle cx="66" cy="128" r="9" fill="#d6402f"/>${PARSLEY}`,
  rawlamb: `${SHADOW}${PLATE}<ellipse cx="100" cy="104" rx="38" ry="28" fill="#c4474f"/><path d="M74 98 q16 -8 32 -2 M80 114 q20 -6 40 2" stroke="#f2b8b8" stroke-width="4" fill="none"/><g fill="#f4ead8"><rect x="60" y="76" width="8" height="20" rx="4" transform="rotate(-18 64 86)"/><rect x="132" y="76" width="8" height="20" rx="4" transform="rotate(18 136 86)"/></g><circle cx="66" cy="126" r="9" fill="#d6402f"/>${PARSLEY}`,
  stewpot: `${SHADOW}<rect x="58" y="78" width="84" height="64" rx="12" fill="#6a6f74"/><rect x="58" y="78" width="84" height="64" rx="12" fill="none" stroke="#8b9096" stroke-width="3"/><rect x="46" y="88" width="14" height="8" rx="4" fill="#4a4f54"/><rect x="140" y="88" width="14" height="8" rx="4" fill="#4a4f54"/><ellipse cx="100" cy="82" rx="40" ry="12" fill="#a4582a"/>${chunk(82, 104, '#5b2a14', '#8f4a26', 11)}${chunk(118, 104, '#5b2a14', '#8f4a26', 11)}${chunk(100, 118, '#5b2a14', '#8f4a26', 11)}<circle cx="88" cy="122" r="7" fill="#f0c24b"/><circle cx="114" cy="122" r="7" fill="#f0c24b"/><circle cx="70" cy="96" r="7" fill="#d6402f"/>${PARSLEY}${STEAM}`,
  sajj: `${SHADOW}<ellipse cx="100" cy="106" rx="64" ry="44" fill="#3d4146"/><ellipse cx="100" cy="106" rx="64" ry="44" fill="none" stroke="#e0af55" stroke-width="3"/><ellipse cx="100" cy="106" rx="54" ry="35" fill="#2a2d31"/><rect x="28" y="100" width="16" height="9" rx="4" fill="#2f3236"/><rect x="156" y="100" width="16" height="9" rx="4" fill="#2f3236"/>${chunk(80, 100, '#8f4a26', '#c27a45', 11)}${chunk(104, 96, '#8f4a26', '#c27a45', 11)}${chunk(124, 104, '#8f4a26', '#c27a45', 11)}${chunk(92, 116, '#8f4a26', '#c27a45', 11)}${chunk(114, 118, '#8f4a26', '#c27a45', 11)}<circle cx="72" cy="118" r="7" fill="none" stroke="#6fb352" stroke-width="3"/><circle cx="130" cy="92" r="7" fill="none" stroke="#d6402f" stroke-width="3"/><circle cx="62" cy="108" r="6" fill="none" stroke="#e8c030" stroke-width="3"/>${STEAM}`,
  liver1: `${SHADOW}${PLATE}<ellipse cx="80" cy="100" rx="20" ry="12" fill="#5a1f1a" transform="rotate(-16 80 100)"/><ellipse cx="108" cy="96" rx="20" ry="12" fill="#5a1f1a" transform="rotate(10 108 96)"/><ellipse cx="96" cy="114" rx="20" ry="12" fill="#5a1f1a"/><path d="M70 98 q14 -6 28 0 M98 112 q14 -6 28 0" stroke="#9c4a3c" stroke-width="4" fill="none"/><circle cx="130" cy="122" r="8" fill="none" stroke="#e8e0d0" stroke-width="3"/>${PARSLEY}${STEAM}`,
  liver2: `${SHADOW}${PLATE}${chunk(78, 96, '#7a2a22', '#a34a3c', 10)}${chunk(104, 92, '#7a2a22', '#a34a3c', 10)}${chunk(124, 104, '#7a2a22', '#a34a3c', 10)}${chunk(88, 114, '#7a2a22', '#a34a3c', 10)}${chunk(112, 120, '#7a2a22', '#a34a3c', 10)}${lemon(64, 126, 12)}${PARSLEY}${STEAM}`,
  lambwhole: `${SHADOW}${PLATE}${rice(100, 118, 66)}<ellipse cx="100" cy="92" rx="40" ry="24" fill="#9a4f22"/><ellipse cx="92" cy="86" rx="26" ry="15" fill="#cc7e3e"/><path d="M66 86 l-14 -10 M134 86 l14 -10 M70 100 l-16 -4 M130 100 l16 -4" stroke="#7d3a1a" stroke-width="5"/><path d="M72 88 q28 -12 56 0 M76 100 q24 -8 48 0" stroke="#7d3a1a" stroke-width="3" fill="none"/><ellipse cx="140" cy="80" rx="12" ry="10" fill="#8a431b"/><circle cx="70" cy="126" r="4" fill="#4a2a52"/><circle cx="66" cy="110" r="9" fill="#d6402f"/>${STEAM}`,
  lambhalf: `${SHADOW}${PLATE}${rice(100, 120, 62)}<ellipse cx="98" cy="94" rx="30" ry="22" fill="#9a4f22"/><ellipse cx="92" cy="88" rx="19" ry="13" fill="#cc7e3e"/><path d="M76 88 q22 -10 44 0 M80 100 q18 -8 36 0" stroke="#7d3a1a" stroke-width="3" fill="none"/><rect x="120" y="78" width="8" height="26" rx="4" fill="#f6e6b0" transform="rotate(22 124 91)"/><circle cx="68" cy="124" r="9" fill="#d6402f"/>${STEAM}`,
  chickskewer: `${SHADOW}${PLATE}${skewers('#d79a40', '#e8b660', '#6fb352', '#e8c030')}${STEAM}`,
  saladdakwa: `${SHADOW}${PLATE}<g fill="#5fa34a"><ellipse cx="84" cy="98" rx="11" ry="18" transform="rotate(-20 84 98)"/><ellipse cx="108" cy="96" rx="11" ry="18" transform="rotate(14 108 96)"/><ellipse cx="96" cy="116" rx="12" ry="16"/></g><path d="M64 104 q36 -14 72 -4" stroke="#a8672c" stroke-width="13" fill="none" opacity=".9"/><path d="M68 112 q32 -10 64 -2" stroke="#c4843a" stroke-width="9" fill="none"/><g fill="#e2b06a"><circle cx="82" cy="98" r="3.4"/><circle cx="100" cy="94" r="3.4"/><circle cx="116" cy="100" r="3.4"/><circle cx="90" cy="108" r="3.4"/><circle cx="108" cy="110" r="3.4"/></g><circle cx="76" cy="120" r="7" fill="#d63b2d"/><circle cx="122" cy="118" r="7" fill="#d63b2d"/>`,
  saladtahini: `${SHADOW}${PLATE}<g fill="#8fb85a"><ellipse cx="74" cy="98" rx="9" ry="6"/><ellipse cx="92" cy="92" rx="9" ry="6"/><ellipse cx="110" cy="96" rx="9" ry="6"/><ellipse cx="126" cy="106" rx="9" ry="6"/><ellipse cx="84" cy="116" rx="9" ry="6"/><ellipse cx="104" cy="120" rx="9" ry="6"/></g><path d="M70 108 l14 -4 -10 12 Z M118 88 l10 8 -14 2 Z" fill="#d63b2d"/><path d="M62 118 L82 104 L102 118 L122 104 L138 116" stroke="#f6ecd2" stroke-width="7" fill="none"/><g fill="#e8d49a"><circle cx="84" cy="100" r="1.8"/><circle cx="96" cy="106" r="1.8"/><circle cx="108" cy="100" r="1.8"/><circle cx="118" cy="110" r="1.8"/><circle cx="78" cy="112" r="1.8"/></g>${PARSLEY}`,
  onions: `${SHADOW}${PLATE}<circle cx="100" cy="104" r="40" fill="none" stroke="#ead3f0" stroke-width="10"/><circle cx="100" cy="104" r="28" fill="none" stroke="#c79ad6" stroke-width="8"/><path d="M64 110 q36 -12 72 -4" stroke="#a8672c" stroke-width="9" fill="none"/><g fill="#e2b06a"><circle cx="88" cy="100" r="3"/><circle cx="110" cy="106" r="3"/><circle cx="98" cy="116" r="3"/></g>${PARSLEY}`,
  pickles: `${SHADOW}${PLATE}<g fill="#f08a1c"><rect x="92" y="66" width="14" height="52" rx="7" transform="rotate(-24 99 92)"/><rect x="92" y="66" width="14" height="52" rx="7" transform="rotate(-12 99 92)"/><rect x="93" y="66" width="14" height="52" rx="7"/><rect x="93" y="66" width="14" height="52" rx="7" transform="rotate(12 100 92)"/><rect x="93" y="66" width="14" height="52" rx="7" transform="rotate(24 100 92)"/></g><g fill="#ffc15a"><rect x="96" y="70" width="5" height="40" rx="2.5" transform="rotate(-18 98 90)"/><rect x="100" y="70" width="5" height="40" rx="2.5" transform="rotate(10 102 90)"/></g><ellipse cx="72" cy="126" rx="10" ry="6" fill="#8fb85a"/><ellipse cx="128" cy="126" rx="10" ry="6" fill="#8fb85a"/><path d="M84 130 l8 -6 3 10 -10 2 Z M112 130 l8 -6 3 10 -10 2 Z" fill="#d6402f"/>`,
  pine: `${SHADOW}${DARK}${glass('#f6d24a', '#fff3a8', `<ellipse cx="112" cy="56" rx="14" ry="9" fill="#f6d14a" transform="rotate(-18 112 56)"/><path d="M104 48 l-4 -12 M112 46 l0 -13 M120 48 l4 -12" stroke="#4f9a3a" stroke-width="4"/><rect x="118" y="42" width="42" height="42" fill="none"/>`)}`,
  mango: `${SHADOW}${DARK}${glass('#f7a823', '#ffd37a', `<path d="M64 128 q10 -26 24 -34 q4 22 -8 34 Z" fill="#f7a823"/>`)}`,
  tabaldi: `${SHADOW}${DARK}${glass('#e9dcc2', '#fffaf0', `<rect x="90" y="96" width="12" height="12" rx="2" fill="#fff" opacity=".7" transform="rotate(18 96 102)"/><rect x="106" y="112" width="12" height="12" rx="2" fill="#fff" opacity=".7" transform="rotate(-12 112 118)"/><ellipse cx="122" cy="60" rx="12" ry="9" fill="#8a6a3c"/><ellipse cx="122" cy="60" rx="7" ry="5" fill="#b69660"/>`)}`,
  lemonmint: `${SHADOW}${DARK}${glass('#c9e86a', '#f1ffc2', `<line x1="116" y1="44" x2="108" y2="84" stroke="#6fb352" stroke-width="6"/>${lemon(76, 122, 11)}<ellipse cx="128" cy="70" rx="6" ry="4" fill="#4f9a3a" transform="rotate(-24 128 70)"/>`)}`,
  sharbot: `${SHADOW}${DARK}${glass('#b3123c', '#e8708a', `<rect x="90" y="94" width="13" height="13" rx="2" fill="#fff" opacity=".6" transform="rotate(16 96 100)"/><line x1="114" y1="46" x2="108" y2="84" stroke="#f3eadf" stroke-width="6"/>`)}`,
  strawb: `${SHADOW}${DARK}${glass('#f2788e', '#ffc0cb', `<path d="M112 52 q14 2 12 16 q-12 4 -18 -4 Z" fill="#e0364c"/><path d="M112 52 l-6 -8 M118 53 l0 -10 M124 55 l6 -7" stroke="#4f9a3a" stroke-width="4"/>`)}`,
  orangej: `${SHADOW}${DARK}${glass('#f08a1c', '#ffc15a', `<rect x="90" y="98" width="12" height="12" rx="2" fill="#fff" opacity=".6" transform="rotate(20 96 104)"/><circle cx="120" cy="58" r="13" fill="none" stroke="#f6a21e" stroke-width="6"/>`)}`,
  mixedj: `${SHADOW}${DARK}<g><path d="M74 60 h52 l-3 34 h-46 Z" fill="#e8453c"/><path d="M77 94 h46 l-2 26 h-42 Z" fill="#f6a21e"/><path d="M79 120 h42 l-2 24 a8 8 0 0 1 -8 7 h-22 a8 8 0 0 1 -8 -7 Z" fill="#f6d24a"/><path d="M74 60 h52 l-7 84 a8 8 0 0 1 -8 7 h-22 a8 8 0 0 1 -8 -7 Z" fill="none" stroke="#fff" stroke-width="3" opacity=".5"/></g>`,
  guavaj: `${SHADOW}${DARK}${glass('#f1858e', '#ffc1c6', `<ellipse cx="118" cy="58" rx="13" ry="11" fill="#9bc65a"/><ellipse cx="118" cy="58" rx="7" ry="6" fill="#f59aa0"/>`)}`,
  soda: `${SHADOW}${DARK}<rect x="84" y="78" width="32" height="66" rx="10" fill="#8a4b1e"/><rect x="90" y="96" width="20" height="30" rx="3" fill="#e0af55"/><path d="M94 102 h12 M94 110 h12 M94 118 h8" stroke="#8a4b1e" stroke-width="2.5"/><rect x="90" y="66" width="20" height="12" rx="4" fill="#c22f23"/><rect x="88" y="86" width="5" height="50" rx="2.5" fill="#fff" opacity=".35"/><circle cx="120" cy="70" r="3" fill="#fff" opacity=".6"/><circle cx="128" cy="90" r="2.4" fill="#fff" opacity=".6"/><circle cx="74" cy="84" r="2.4" fill="#fff" opacity=".6"/>`,
  ghubasha: `${SHADOW}${DARK}<g><path d="M74 60 h52 l-3 40 h-46 Z" fill="#e9c58a"/><path d="M77 100 h46 l-2 20 h-42 Z" fill="#f1d7a6"/><path d="M79 120 h42 l-2 24 a8 8 0 0 1 -8 7 h-22 a8 8 0 0 1 -8 -7 Z" fill="#f1d7a6"/><path d="M74 60 h52 l-7 84 a8 8 0 0 1 -8 7 h-22 a8 8 0 0 1 -8 -7 Z" fill="none" stroke="#fff" stroke-width="3" opacity=".5"/><line x1="114" y1="44" x2="109" y2="86" stroke="#c22f23" stroke-width="6"/></g>`,
  friedfish1: `${SHADOW}${PLATE}<g transform="rotate(-10 78 100)">${fishBody(78, 100, 1)}</g>${fishBody(122, 112, 0.92)}<g fill="#fff1c8"><circle cx="70" cy="80" r="2.4"/><circle cx="90" cy="70" r="2.4"/><circle cx="112" cy="72" r="2.4"/><circle cx="132" cy="82" r="2.4"/><circle cx="60" cy="120" r="2.4"/><circle cx="140" cy="122" r="2.4"/></g>${lemon(66, 132, 12)}${PARSLEY}${STEAM}`,
  friedfish2: `${SHADOW}${PLATE}${fishBody()}<g fill="#fff1c8"><circle cx="70" cy="78" r="2.4"/><circle cx="92" cy="68" r="2.4"/><circle cx="114" cy="70" r="2.4"/><circle cx="134" cy="84" r="2.4"/><circle cx="62" cy="118" r="2.4"/><circle cx="140" cy="120" r="2.4"/></g>${lemon(66, 132, 12)}${PARSLEY}${STEAM}`,
  tilapia: `${SHADOW}${PLATE}<path d="M52 132 q48 10 96 0" stroke="#5fa34a" stroke-width="5" fill="none"/><g><ellipse cx="100" cy="106" rx="40" ry="18" fill="#b98a80"/><ellipse cx="94" cy="101" rx="27" ry="11" fill="#e4c0b6"/><path d="M-28 -12 l8 24 M-12 -16 l6 30 M4 -16 l-4 30" stroke="#7a5148" stroke-width="3" transform="translate(100 106)"/><circle cx="126" cy="102" r="3.6" fill="#1a1210"/></g><circle cx="68" cy="122" r="8" fill="#d63b2d"/><circle cx="132" cy="122" r="8" fill="#d63b2d"/>${lemon(100, 132, 11)}<path d="M140 128 l8 -6 3 9 -9 2 Z" fill="#d6402f"/>`,
  fishfatta: `${SHADOW}<ellipse cx="100" cy="106" rx="60" ry="44" fill="#d9c9b2"/><ellipse cx="100" cy="100" rx="52" ry="36" fill="#efd9a8"/><g fill="#e1b36a"><rect x="70" y="88" width="16" height="12" rx="3" transform="rotate(-12 78 94)"/><rect x="90" y="84" width="16" height="12" rx="3" transform="rotate(8 98 90)"/><rect x="110" y="88" width="16" height="12" rx="3" transform="rotate(-6 118 94)"/><rect x="78" y="104" width="16" height="12" rx="3" transform="rotate(10 86 110)"/><rect x="100" y="106" width="16" height="12" rx="3"/></g><path d="M66 100 q34 -12 68 0" stroke="#c43d2a" stroke-width="5" fill="none"/><g transform="translate(100 92) scale(.34)">${fishBody(0, 0, 1).replace(/translate\([^)]*\) scale\([^)]*\)/, '')}</g><circle cx="84" cy="118" r="3" fill="#4f9a3a"/><circle cx="114" cy="118" r="3" fill="#4f9a3a"/>${STEAM}`,
  fishsoup: `${SHADOW}<ellipse cx="100" cy="104" rx="60" ry="44" fill="#c5601c"/><ellipse cx="100" cy="98" rx="52" ry="36" fill="#e07a2c"/><ellipse cx="100" cy="102" rx="36" ry="22" fill="#f0b358" opacity=".7"/><ellipse cx="88" cy="100" rx="14" ry="9" fill="#e8c8a0" transform="rotate(-14 88 100)"/><circle cx="112" cy="106" r="3.4" fill="#4f9a3a"/><circle cx="94" cy="112" r="3.4" fill="#4f9a3a"/><path d="M64 92 q36 -10 72 0" stroke="#fff" stroke-width="3" fill="none" opacity=".6"/>${STEAM}`,
  fishbucket: `${SHADOW}${bucket('#e07a2c', '#8a3f0c', '#c5601c')}${STEAM}`,
  lambbucket: `${SHADOW}${bucket('#8a4b1e', '#4a230a', '#a65a2a')}${STEAM}`,
  lambsoup: `${SHADOW}<ellipse cx="100" cy="104" rx="60" ry="44" fill="#8a4b1e"/><ellipse cx="100" cy="98" rx="52" ry="36" fill="#a65a2a"/><ellipse cx="88" cy="100" rx="12" ry="18" fill="#5b2a14" transform="rotate(-16 88 100)"/><rect x="96" y="78" width="8" height="20" rx="4" fill="#f6e6b0" transform="rotate(-16 100 88)"/><circle cx="112" cy="110" r="8" fill="#f0c24b"/><circle cx="90" cy="116" r="8" fill="#f0c24b"/><circle cx="118" cy="94" r="3" fill="#4f9a3a"/>${STEAM}`,
  lambfatta: `${SHADOW}<ellipse cx="100" cy="106" rx="60" ry="44" fill="#d9c9b2"/><ellipse cx="100" cy="100" rx="52" ry="36" fill="#efd9a8"/><g fill="#e1b36a"><rect x="72" y="90" width="16" height="12" rx="3" transform="rotate(-10 80 96)"/><rect x="94" y="86" width="16" height="12" rx="3" transform="rotate(8 102 92)"/><rect x="114" y="92" width="16" height="12" rx="3"/></g>${chunk(88, 108, '#6b2f1c', '#a35a3a', 10)}${chunk(114, 110, '#6b2f1c', '#a35a3a', 10)}<path d="M70 104 q30 -10 60 0" stroke="#fffaf0" stroke-width="4" fill="none"/><circle cx="96" cy="120" r="3" fill="#4f9a3a"/>${STEAM}`,
  broasthalf: `${SHADOW}${PLATE}<g transform="rotate(-14 88 100)"><ellipse cx="88" cy="100" rx="14" ry="20" fill="#bf6f22"/><ellipse cx="84" cy="94" rx="8" ry="12" fill="#e39b45"/><rect x="96" y="112" width="9" height="20" rx="4" fill="#f3eadf"/></g><g fill="#f0c24b"><rect x="108" y="126" width="8" height="20" rx="4" transform="rotate(8 112 136)"/><rect x="122" y="124" width="8" height="20" rx="4" transform="rotate(-8 126 134)"/></g><path d="M66 122 l12 -4 -8 12 Z" fill="#c43d2a"/>${STEAM}`,
  fruitsalad: `${SHADOW}<ellipse cx="100" cy="106" rx="60" ry="44" fill="#fbefe0"/><ellipse cx="100" cy="100" rx="52" ry="34" fill="#fffaf4"/><g><rect x="72" y="88" width="12" height="12" rx="2" fill="#e8453c"/><rect x="88" y="84" width="12" height="12" rx="2" fill="#f6a21e" transform="rotate(12 94 90)"/><rect x="104" y="88" width="12" height="12" rx="2" fill="#7bc05a" transform="rotate(-8 110 94)"/><rect x="118" y="96" width="12" height="12" rx="2" fill="#f6d24a"/><rect x="78" y="104" width="12" height="12" rx="2" fill="#c43d8a" transform="rotate(8 84 110)"/><rect x="96" y="106" width="12" height="12" rx="2" fill="#f2788e"/><rect x="112" y="112" width="12" height="12" rx="2" fill="#e8453c" transform="rotate(-10 118 118)"/></g><path d="M68 100 q32 -10 64 0" stroke="#fffaf0" stroke-width="4" fill="none"/><circle cx="100" cy="86" r="7" fill="#c4122f"/><ellipse cx="106" cy="80" rx="5" ry="3" fill="#4f9a3a" transform="rotate(-24 106 80)"/>`,
  melonplate: `${SHADOW}${PLATE}<g><path d="M56 116 A44 44 0 0 1 144 116 Z" fill="#2f7d3a"/><path d="M62 116 A38 38 0 0 1 138 116 Z" fill="#dbe8b8"/><path d="M70 116 A30 30 0 0 1 130 116 Z" fill="#e8453c"/><circle cx="88" cy="106" r="2.6" fill="#1a1210"/><circle cx="112" cy="106" r="2.6" fill="#1a1210"/></g>`,
  melon: `${SHADOW}${DARK}<g><path d="M40 140 A66 66 0 0 1 160 140 Z" fill="#2f7d3a"/><path d="M50 140 A56 56 0 0 1 150 140 Z" fill="#dbe8b8"/><path d="M62 140 A44 44 0 0 1 138 140 Z" fill="#e8453c"/><path d="M74 140 A32 32 0 0 1 126 140 Z" fill="#f2685b"/><circle cx="86" cy="124" r="3" fill="#1a1210"/><circle cx="114" cy="124" r="3" fill="#1a1210"/><circle cx="100" cy="132" r="3" fill="#1a1210"/></g>`,
  lamb1: `${SHADOW}${BOARD}${boardMeat('#8f4a26', '#c27a45', 9)}`,
  lamb2: `${SHADOW}${BOARD}${boardMeat('#8f4a26', '#c27a45', 4)}`,
  camel1: `${SHADOW}${BOARD}${boardMeat('#6b2f1c', '#a35a3a', 9)}`,
  camel2: `${SHADOW}${BOARD}${boardMeat('#6b2f1c', '#a35a3a', 4)}`,
  chickmandi1: `${SHADOW}${PLATE}${chicken('whole', true)}`,
  chickmandi2: `${SHADOW}${PLATE}${chicken('half', true)}`,
  chickmandi3: `${SHADOW}${PLATE}${chicken('quarter', true)}`,
  chickgrill1: `${SHADOW}${PLATE}${chicken('whole', false)}`,
  chickgrill2: `${SHADOW}${PLATE}${chicken('half', false)}`,
};

export function art(key: string | undefined): string {
  return `<svg viewBox="0 0 200 200" aria-hidden="true">${ART[key ?? ''] ?? ART.mandi}</svg>`;
}

export const CHECK_SVG = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
export const SEARCH_SVG = `<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>`;
export const PHONE_SVG = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.6 21 3 13.4 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.2.2 2.4.6 3.6.1.3 0 .7-.2 1l-2.3 2.2z"/></svg>`;

export const PAYMENT_LOGOS: Record<string, string> = {
  bankak: `<svg viewBox="0 0 56 56" aria-hidden="true"><rect x="8" y="22" width="40" height="24" rx="4" fill="currentColor" opacity=".25"/><path d="M28 8 L48 20 H8 Z" fill="currentColor"/><rect x="14" y="26" width="5" height="14" fill="currentColor"/><rect x="25" y="26" width="5" height="14" fill="currentColor"/><rect x="36" y="26" width="5" height="14" fill="currentColor"/></svg>`,
  ocash: `<svg viewBox="0 0 56 56" aria-hidden="true"><rect x="8" y="14" width="40" height="28" rx="6" fill="currentColor" opacity=".25"/><rect x="8" y="14" width="40" height="28" rx="6" fill="none" stroke="currentColor" stroke-width="3"/><circle cx="40" cy="28" r="5" fill="currentColor"/><rect x="14" y="22" width="12" height="4" rx="2" fill="currentColor"/></svg>`,
  fawry: `<svg viewBox="0 0 56 56" aria-hidden="true"><circle cx="28" cy="28" r="20" fill="none" stroke="currentColor" stroke-width="4"/><path d="M30 14 L20 30 h7 l-2 12 12 -18 h-7 Z" fill="currentColor"/></svg>`,
  cashi: `<svg viewBox="0 0 56 56" aria-hidden="true"><rect x="10" y="12" width="36" height="26" rx="5" fill="none" stroke="currentColor" stroke-width="3"/><path d="M10 22 h36" stroke="currentColor" stroke-width="3"/><rect x="14" y="30" width="10" height="4" rx="2" fill="currentColor"/><path d="M22 44 l5 5 9 -11" fill="none" stroke="currentColor" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
};

export const CATEGORY_ART: Record<string, string> = {
  fish: 'fish',
  grill: 'skewer',
  mandi: 'mandi',
  juices: 'juice',
  salads: 'salad',
};

export const ITEM_ART: Record<string, string> = {
  'fish-soup': 'fishsoup',
  'fish-fatta': 'fishfatta',
  'fried-fish-kg': 'friedfish1',
  'fried-fish-half': 'friedfish2',
  tilapia: 'tilapia',
  'takeaway-soup': 'fishbucket',
  'lamb-kebab-kg': 'lamb1',
  'lamb-kebab-half': 'lamb2',
  'grilled-liver': 'liver1',
  'lamb-saj': 'sajj',
  'camel-kebab-kg': 'camel1',
  'camel-kebab-half': 'camel2',
  'camel-liver-quarter': 'liver2',
  'mandi-meat': 'mandi',
  'mandi-chicken-whole': 'chickmandi1',
  'mandi-chicken-half': 'chickmandi2',
  'mandi-chicken-quarter': 'chickmandi3',
  rice: 'mandi',
  yogurt: 'yogurt',
  grapefruit: 'orangej',
  'takeaway-sharbot': 'sharbot',
  'moses-milk': 'mango',
  sharbot: 'sharbot',
  'lemon-mint-jug': 'lemonmint',
  'strawberry-milk': 'strawb',
  'pineapple-milk': 'pine',
  pineapple: 'pine',
  orange: 'orangej',
  'mango-milk': 'mango',
  'fruit-salad-drink': 'mixedj',
  watermelon: 'melon',
  'mixed-juice': 'mixedj',
  'green-salad': 'salad',
  'dakوة-salad': 'saladdakwa',
  'tahini-salad': 'saladtahini',
};

export function itemArt(itemId: string, categoryId: string): string {
  return art(ITEM_ART[itemId] ?? CATEGORY_ART[categoryId]);
}
