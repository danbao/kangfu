// 单色线性 SVG 图标集：柔和浅灰描边，跨平台一致。
// 运行时编码为 base64 data URI，供 WXML 内联 background-image 使用。
const ICONS = {
  ankle: '<circle cx="12" cy="7" r="3"/><path d="M12 10v9M8 16l4 3 4-3"/>',
  leg: '<path d="M12 4v10"/><path d="M9 14h6"/><path d="M9 14l-2 6M15 14l2 6"/>',
  quad: '<path d="M8 4c-1 4-1 12 0 16M16 4c1 4 1 12 0 16M8 4h8M8 20h8"/>',
  knee: '<path d="M8 4v6l-2 3"/><path d="M16 4v6l2 3"/><circle cx="12" cy="16" r="3"/><path d="M9 20h6"/>',
  dumbbell: '<path d="M4 12h16"/><path d="M4 9v6M8 8v8M16 8v8M20 9v6"/>',
  stretch: '<circle cx="12" cy="5" r="2"/><path d="M12 7v6M9 19l3-3 3 3"/><path d="M12 9c-3 0-5 2-5 5M12 9c3 0 5 2 5 5"/>',
  run: '<circle cx="14" cy="5" r="2"/><path d="M13 8l-3 4 3 2-1 4M11 12l-4 1M15 9l2 3"/>',
  heart: '<path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2 4 4 0 0 1 7 2c0 5.5-7 10-7 10z"/>',
  core: '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4"/><circle cx="12" cy="12" r="1"/>',
  balance: '<circle cx="12" cy="5" r="2"/><path d="M12 7v8M12 11h5M12 15l-3 4M12 15l3 4"/>',
  wave: '<path d="M3 12c2-4 4-4 6 0s4 4 6 0 4-4 6 0"/>',
  star: '<path d="M12 3l2.5 5.5L20 9l-4 4 1 6-5-3-5 3 1-6-4-4 5.5-.5z"/>',
};

const DEFAULT_COLOR = '#B0BEC5'; // 柔和浅灰
const cache = {};

// 字符串 -> UTF-8 ArrayBuffer
function utf8ToBuffer(str) {
  const bytes = [];
  for (let i = 0; i < str.length; i++) {
    let c = str.charCodeAt(i);
    if (c < 0x80) bytes.push(c);
    else if (c < 0x800) bytes.push(0xc0 | (c >> 6), 0x80 | (c & 0x3f));
    else bytes.push(0xe0 | (c >> 12), 0x80 | ((c >> 6) & 0x3f), 0x80 | (c & 0x3f));
  }
  return new Uint8Array(bytes).buffer;
}

function buildSvg(key, color) {
  const inner = ICONS[key] || ICONS.star;
  return (
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" ' +
    'stroke="' + color + '" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' +
    inner + '</svg>'
  );
}

// 返回 base64 data URI（带 key+color 缓存）
function iconUri(key, color) {
  const c = color || DEFAULT_COLOR;
  const cacheKey = key + '|' + c;
  if (cache[cacheKey]) return cache[cacheKey];
  const svg = buildSvg(key, c);
  let uri;
  try {
    uri = 'data:image/svg+xml;base64,' + wx.arrayBufferToBase64(utf8ToBuffer(svg));
  } catch (e) {
    // 兜底：url-encoded（极少数环境 arrayBufferToBase64 不可用）
    uri = 'data:image/svg+xml,' + encodeURIComponent(svg);
  }
  cache[cacheKey] = uri;
  return uri;
}

function iconKeys() {
  return Object.keys(ICONS);
}

module.exports = { iconUri, iconKeys };
