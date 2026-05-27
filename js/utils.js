async function compressData(dataObj) {
    const str = JSON.stringify(dataObj);
    const stream = new Blob([str]).stream().pipeThrough(new CompressionStream('deflate-raw'));
    const buffer = await new Response(stream).arrayBuffer();
    const bytes = new Uint8Array(buffer);
    let binary = ''; for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
    return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

async function decompressData(b64) {
    b64 = b64.replace(/-/g, '+').replace(/_/g, '/');
    const pad = b64.length % 4; if (pad) b64 += '='.repeat(4 - pad);
    const binary = atob(b64); const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream('deflate-raw'));
    return JSON.parse(await new Response(stream).text());
}

function getRgbFromCss(css) {
    hiddenCtx.clearRect(0, 0, 1, 1); hiddenCtx.fillStyle = css; hiddenCtx.fillRect(0, 0, 1, 1);
    const d = hiddenCtx.getImageData(0, 0, 1, 1).data; return { r: d[0], g: d[1], b: d[2] };
}

function hexToRgb(hex) {
    return { r: parseInt(hex.slice(0, 2), 16), g: parseInt(hex.slice(2, 4), 16), b: parseInt(hex.slice(4, 6), 16) };
}

function isGamutSafe(rgbList) {
    if (st.spaceId !== 'oklab' && st.spaceId !== 'oklch') return true;
    return !rgbList.some(rgb => rgb.r === 0 || rgb.r === 255 || rgb.g === 0 || rgb.g === 255 || rgb.b === 0 || rgb.b === 255);
}

function getLuminance(r, g, b) {
    let a = [r, g, b].map(v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); });
    return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}

function getContrast(c1, c2) {
    let l1 = getLuminance(c1.r, c1.g, c1.b); let l2 = getLuminance(c2.r, c2.g, c2.b);
    return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}

function calcComp(v) {
    if (st.spaceId === 'rgb') return [255 - v[0], 255 - v[1], 255 - v[2]];
    if (st.spaceId === 'hsl' || st.spaceId === 'oklch') return [v[0], v[1], (v[2] + 180) % 360];
    if (st.spaceId === 'oklab') return [v[0], -v[1], -v[2]];
    if (st.spaceId === 'cmyk') return [100 - v[0], 100 - v[1], 100 - v[2], 100 - v[3]];
}

function calcPalette(baseVals, rule) {
    const hIdx = st.spaceId === 'hsl' ? 0 : 2;
    let c2 = [...baseVals], c3 = [...baseVals];
    if (rule === 'analogous') { c2[hIdx] = (baseVals[hIdx] + 30) % 360; c3[hIdx] = (baseVals[hIdx] + 330) % 360; }
    else if (rule === 'triadic') { c2[hIdx] = (baseVals[hIdx] + 120) % 360; c3[hIdx] = (baseVals[hIdx] + 240) % 360; }
    else if (rule === 'split') { c2[hIdx] = (baseVals[hIdx] + 150) % 360; c3[hIdx] = (baseVals[hIdx] + 210) % 360; }
    return [baseVals, c2, c3];
}

function mulberry32(a) {
    return function () { var t = a += 0x6D2B79F5; t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) / 4294967296; }
}

function getDailyRNG(offset = 0) {
    const start = new Date('2026-03-23T00:00:00Z'); st.dailyNum = Math.floor((new Date() - start) / 86400000) + 1; return mulberry32(st.dailyNum * 42 + offset);
}

// Explicit Global Exports
window.compressData = compressData;
window.decompressData = decompressData;
window.getRgbFromCss = getRgbFromCss;
window.hexToRgb = hexToRgb;
window.isGamutSafe = isGamutSafe;
window.getLuminance = getLuminance;
window.getContrast = getContrast;
window.calcComp = calcComp;
window.calcPalette = calcPalette;
window.mulberry32 = mulberry32;
window.getDailyRNG = getDailyRNG;
