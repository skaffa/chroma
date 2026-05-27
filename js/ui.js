function toggleInfo(show) {
    const modal = document.getElementById('info-modal');
    modal.style.display = show ? 'block' : 'none';

    if (show) {
        document.querySelectorAll('#info-modal p').forEach(p => p.classList.remove('highlight'));
        const gameActive = document.getElementById('game-area').classList.contains('active');
        const isRes = document.getElementById('results-screen').classList.contains('active');

        if (gameActive || isRes) {
            let rules = [`type-${st.type}`];
            if (st.spaceId === 'cmyk') rules.push('space-cmyk');
            if (st.isDarkroom) rules.push('mod-darkroom');
            if (st.isWcag) rules.push('mod-wcag');
            if (st.isComp) rules.push('mod-comp');
            if (st.isMap) rules.push('mod-map');
            if (st.isHardcore) rules.push('mod-hardcore');
            if (st.isTerminal) rules.push('mod-terminal');
            if (st.isMemory) rules.push('mod-memory');
            if (st.isIllusion) rules.push('mod-illusion');
            if (st.vision !== 'normal') rules.push('mod-vision');
            if (st.isRush) rules.push('feat-rush');
            if (st.isDuel) rules.push('feat-duel');

            let firstEl = null;
            rules.forEach(r => {
                const el = document.querySelector(`#info-modal p[data-rule="${r}"]`);
                if (el) { el.classList.add('highlight'); if (!firstEl) firstEl = el; }
            });
            if (firstEl) { setTimeout(() => firstEl.scrollIntoView({ behavior: 'smooth', block: 'center' }), 50); }
        } else {
            modal.scrollTop = 0;
        }
    }
}

function toggleSettings(show) { document.getElementById('settings-modal').style.display = show ? 'block' : 'none'; }

function goHome() {
    if (document.getElementById('game-area').classList.contains('active') && st.type !== 'studio') {
        saveStats(0, 255, 255, 255);
    }
    resetGame();
}

function initTheme() { const t = localStorage.getItem('chroma_theme'); if (t) document.documentElement.style.setProperty('--accent', t); }
function setTheme(color) { document.documentElement.style.setProperty('--accent', color); localStorage.setItem('chroma_theme', color); togglePantheon(false); }
function resetTheme() { document.documentElement.style.setProperty('--accent', '#ffffff'); localStorage.removeItem('chroma_theme'); toggleSettings(false); }
function handleVision() { st.vision = document.getElementById('vision-select').value; document.body.className = st.vision; saveLocal(); }

let currentConfirmCallback = null;
function triggerConfirm(msg, callback) {
    currentConfirmCallback = callback; document.getElementById('confirm-msg').textContent = msg; document.getElementById('confirm-modal').style.display = 'flex';
}
function closeConfirm() { document.getElementById('confirm-modal').style.display = 'none'; currentConfirmCallback = null; }
function executeConfirm() { if (currentConfirmCallback) currentConfirmCallback(); closeConfirm(); }

function resetConfig() { localStorage.removeItem('chroma_cfg'); setUIConfig(defaultCfg); toggleSettings(false); }
function resetPantheon() { localStorage.removeItem('chroma_pantheon_v2'); toggleSettings(false); }
function resetAnalytics() { localStorage.removeItem('chroma_stats_v2'); toggleSettings(false); }
function resetAll() { localStorage.clear(); window.location.href = window.location.pathname; }

function loadPantheon() { return JSON.parse(localStorage.getItem('chroma_pantheon_v2')) || []; }
function saveToPantheon(tCss, uCss) {
    if (st.type === 'studio' || st.type === 'haystack' || st.type === 'hexdle' || st.type === 'sort') return;
    let p = loadPantheon();
    const entry = {
        tCss, uCss, date: new Date().toLocaleDateString(),
        cfg: { space: st.spaceId.toUpperCase(), type: st.type.charAt(0).toUpperCase() + st.type.slice(1), obj: st.type === 'palette' ? st.palRule : (st.isComp ? 'Complementary' : st.isWcag ? 'WCAG' : 'Match'), mods: [st.isMap ? 'Map' : '', st.isHardcore ? 'Blind' : '', st.isTerminal ? 'Terminal' : '', st.isIllusion ? 'Illusion' : '', st.isMemory ? 'Memory' : '', st.isDarkroom ? 'Darkroom' : '', st.vision !== 'normal' ? st.vision : ''].filter(Boolean).join(', ') || 'None' }
    };
    p.unshift(entry); localStorage.setItem('chroma_pantheon_v2', JSON.stringify(p));
}

function togglePantheon(show) {
    const m = document.getElementById('pantheon-modal');
    if (show) {
        document.getElementById('pantheon-details').style.display = 'none';
        const grid = document.getElementById('pantheon-grid'); const p = loadPantheon();
        grid.innerHTML = p.length === 0 ? '<div class="empty-pantheon">Achieve 98% or higher precision to immortalize colors here.</div>' : '';
        p.forEach(entry => {
            const el = document.createElement('div'); el.className = 'pantheon-swatch';
            if (entry.cfg.type === 'Gradient' || entry.cfg.type === 'Palette') { el.style.background = entry.tCss; }
            else { el.style.background = `linear-gradient(135deg, ${entry.tCss} 50%, ${entry.uCss} 50%)`; }
            el.onclick = () => showPantheonDetails(entry); grid.appendChild(el);
        });
    }
    m.style.display = show ? 'block' : 'none';
}

function showPantheonDetails(e) {
    document.getElementById('pantheon-details').style.display = 'block';
    document.getElementById('pd-target').textContent = e.tCss; document.getElementById('pd-user').textContent = e.uCss;
    document.getElementById('pd-space').textContent = `${e.cfg.space} (${e.cfg.type})`; document.getElementById('pd-mods').textContent = e.cfg.mods; document.getElementById('pd-date').textContent = e.date;
    const btn = document.getElementById('btn-set-theme');
    if (e.cfg.type === 'Solid') { btn.style.display = 'block'; btn.onclick = () => setTheme(e.tCss); } else { btn.style.display = 'none'; }
}

function loadStats() { return JSON.parse(localStorage.getItem('chroma_stats_v2')) || { games: 0, scoreSum: 0, errR: 0, errG: 0, errB: 0, streak: 0 }; }
function saveStats(score, dr, dg, db) {
    if (st.type === 'studio') return;
    let s = loadStats(); s.games++; s.scoreSum += score; s.errR += dr; s.errG += dg; s.errB += db;
    if (st.isRush && st.rushStreak > s.streak) s.streak = st.rushStreak;
    localStorage.setItem('chroma_stats_v2', JSON.stringify(s));
}

function toggleStats(show) {
    const m = document.getElementById('stats-modal');
    if (show) {
        let s = loadStats();
        document.getElementById('st-games').textContent = s.games; document.getElementById('st-acc').textContent = s.games > 0 ? Math.round(s.scoreSum / s.games) + '%' : '0%'; document.getElementById('st-streak').textContent = s.streak;
        if (s.games > 0) {
            let avgR = s.errR / s.games, avgG = s.errG / s.games, avgB = s.errB / s.games;
            let maxBias = Math.max(Math.abs(avgR), Math.abs(avgG), Math.abs(avgB));
            let p = Math.round((maxBias / 255) * 100);
            let text = "Balanced"; let dir = "-";
            if (p > 1) {
                if (maxBias === Math.abs(avgR)) { text = avgR > 0 ? "Too Much Red" : "Too Little Red"; dir = "RED"; }
                else if (maxBias === Math.abs(avgG)) { text = avgG > 0 ? "Too Much Green" : "Too Little Green"; dir = "GREEN"; }
                else { text = avgB > 0 ? "Too Much Blue" : "Too Little Blue"; dir = "BLUE"; }
            }
            document.getElementById('st-bias-dir').textContent = dir; document.getElementById('st-bias').textContent = p > 1 ? `${text} (~${p}%)` : "Flawless Biological Balance";
        }
    }
    m.style.display = show ? 'block' : 'none';
}

function handleTypeChange() {
    const t = document.getElementById('type-select').value;
    const isGrad = t === 'gradient'; const isPal = t === 'palette'; const isStud = t === 'studio'; const isHay = t === 'haystack'; const isHex = t === 'hexdle'; const isTele = t === 'telephone'; const isMid = t === 'midpoint'; const isSort = t === 'sort'; const isLum = t === 'luminance';

    document.getElementById('objective-select').style.display = (isPal || isStud || isHay || isHex || isTele || isMid || isSort || isLum) ? 'none' : 'block';
    document.getElementById('palette-rule').style.display = isPal ? 'block' : 'none';
    document.getElementById('telephone-rounds').style.display = isTele ? 'block' : 'none';
    document.getElementById('timer-select').disabled = isStud || isHex;

    if (isPal) {
        const cur = document.querySelector('input[name="colorSpace"]:checked').value;
        if (cur !== 'hsl' && cur !== 'oklch') { document.querySelector('input[name="colorSpace"][value="hsl"]').checked = true; changeColorSpace(); }
        document.querySelector('input[name="colorSpace"][value="rgb"]').disabled = true; document.querySelector('input[name="colorSpace"][value="oklab"]').disabled = true; document.querySelector('input[name="colorSpace"][value="cmyk"]').disabled = true;
    } else if (isHex || isSort) {
        document.querySelector('input[name="colorSpace"][value="rgb"]').checked = true; changeColorSpace();
        document.querySelector('input[name="colorSpace"][value="hsl"]').disabled = true; document.querySelector('input[name="colorSpace"][value="oklab"]').disabled = true; document.querySelector('input[name="colorSpace"][value="oklch"]').disabled = true; document.querySelector('input[name="colorSpace"][value="cmyk"]').disabled = true;
    } else {
        document.querySelector('input[name="colorSpace"][value="rgb"]').disabled = false; document.querySelector('input[name="colorSpace"][value="hsl"]').disabled = false; document.querySelector('input[name="colorSpace"][value="oklab"]').disabled = false; document.querySelector('input[name="colorSpace"][value="oklch"]').disabled = false; document.querySelector('input[name="colorSpace"][value="cmyk"]').disabled = false;
    }

    if (isStud || isHay || isHex || isMid || isTele || isSort) {
        document.getElementById('terminal-checkbox').checked = false; document.getElementById('map-checkbox').checked = false;
    }
    if (isLum) { document.getElementById('terminal-checkbox').checked = false; document.getElementById('map-checkbox').checked = false; }
    if (isStud) {
        document.getElementById('hardcore-checkbox').checked = false; document.getElementById('memory-checkbox').checked = false;
        document.getElementById('illusion-checkbox').checked = false; document.getElementById('darkroom-checkbox').checked = false;
    }

    handleToggles();
}

function handleToggles() {
    if (st.suppressSave) return;
    const t = document.getElementById('type-select').value;
    const isMulti = t === 'gradient' || t === 'palette'; const isStud = t === 'studio'; const isHay = t === 'haystack'; const isHex = t === 'hexdle'; const isTele = t === 'telephone'; const isMid = t === 'midpoint'; const isSort = t === 'sort'; const isLum = t === 'luminance';

    const mapChk = document.getElementById('map-checkbox');
    const hcChk = document.getElementById('hardcore-checkbox');
    const termChk = document.getElementById('terminal-checkbox');
    const memChk = document.getElementById('memory-checkbox');
    const illChk = document.getElementById('illusion-checkbox');
    const darkChk = document.getElementById('darkroom-checkbox');
    const objSel = document.getElementById('objective-select');

    const noSliders = isHay || isHex || isSort || isStud;
    const noTarget = isStud;
    const complex = isMulti || isMid || isTele || isLum;

    mapChk.disabled = noSliders || complex || objSel.value === 'wcag' || hcChk.checked || termChk.checked;
    hcChk.disabled = noTarget || noSliders || isLum || isTele || mapChk.checked || termChk.checked || memChk.checked;
    termChk.disabled = noSliders || complex || mapChk.checked || hcChk.checked;
    memChk.disabled = noTarget || noSliders || hcChk.checked || isLum;
    illChk.disabled = isStud || isHay || isHex || isSort;
    darkChk.disabled = isStud;

    objSel.options[2].disabled = mapChk.checked || termChk.checked || hcChk.checked;

    document.getElementById('lbl-map').style.opacity = mapChk.disabled ? '0.3' : '1';
    document.getElementById('lbl-hardcore').style.opacity = hcChk.disabled ? '0.3' : '1';
    document.getElementById('lbl-terminal').style.opacity = termChk.disabled ? '0.3' : '1';
    document.getElementById('lbl-memory').style.opacity = memChk.disabled ? '0.3' : '1';
    document.getElementById('lbl-illusion').style.opacity = illChk.disabled ? '0.3' : '1';
    document.getElementById('lbl-darkroom').style.opacity = darkChk.disabled ? '0.3' : '1';

    const sel = document.getElementById('space-selector');
    sel.style.opacity = (mapChk.checked || isHay || isHex || isSort) ? '0.3' : '1'; sel.style.pointerEvents = (mapChk.checked || isHay || isHex || isSort) ? 'none' : 'auto';
    saveLocal();
}

function getUIConfig() {
    const mChk = document.getElementById('map-checkbox');
    const hChk = document.getElementById('hardcore-checkbox');
    const tmChk = document.getElementById('terminal-checkbox');
    const mmChk = document.getElementById('memory-checkbox');
    const iChk = document.getElementById('illusion-checkbox');
    const dkChk = document.getElementById('darkroom-checkbox');

    return {
        s: document.querySelector('input[name="colorSpace"]:checked').value, t: parseInt(document.getElementById('timer-select').value),
        o: document.getElementById('objective-select').value, p: document.getElementById('type-select').value, pr: document.getElementById('palette-rule').value, v: document.getElementById('vision-select').value, tr: parseInt(document.getElementById('telephone-rounds').value),
        m: !mChk.disabled && mChk.checked, h: !hChk.disabled && hChk.checked, i: !iChk.disabled && iChk.checked, tm: !tmChk.disabled && tmChk.checked, mm: !mmChk.disabled && mmChk.checked, dk: !dkChk.disabled && dkChk.checked
    };
}

function setUIConfig(c) {
    st.suppressSave = true;
    if (document.querySelector(`input[name="colorSpace"][value="${c.s}"]`)) document.querySelector(`input[name="colorSpace"][value="${c.s}"]`).checked = true;
    document.getElementById('timer-select').value = c.t || 30; document.getElementById('objective-select').value = c.o || 'match'; document.getElementById('type-select').value = c.p || 'solid'; document.getElementById('palette-rule').value = c.pr || 'analogous'; document.getElementById('vision-select').value = c.v || 'normal'; document.getElementById('telephone-rounds').value = c.tr || 10;
    document.getElementById('map-checkbox').checked = c.m || false; document.getElementById('hardcore-checkbox').checked = c.h || false; document.getElementById('illusion-checkbox').checked = c.i || false; document.getElementById('terminal-checkbox').checked = c.tm || false; document.getElementById('memory-checkbox').checked = c.mm || false; document.getElementById('darkroom-checkbox').checked = c.dk || false;
    st.suppressSave = false; handleVision(); handleTypeChange(); changeColorSpace();
}

function saveLocal() { if (!st.suppressSave && !st.isViewingShared) localStorage.setItem('chroma_cfg', JSON.stringify(getUIConfig())); }
function loadLocal() { try { let s = JSON.parse(localStorage.getItem('chroma_cfg')); if (s && s.s) return s; } catch (e) { } return defaultCfg; }
function clearUrl() { window.history.replaceState({}, document.title, window.location.pathname); }

function copyConfigUrl() {
    const c = getUIConfig(); const qs = `?share=1&s=${c.s}&t=${c.t}&o=${c.o}&p=${c.p}&pr=${c.pr}&v=${c.v}&tr=${c.tr}&m=${c.m ? 1 : 0}&h=${c.h ? 1 : 0}&i=${c.i ? 1 : 0}&tm=${c.tm ? 1 : 0}&mm=${c.mm ? 1 : 0}&dk=${c.dk ? 1 : 0}`;
    navigator.clipboard.writeText(window.location.origin + window.location.pathname + qs);
    document.getElementById('btn-copy-config').innerHTML = '<span>Copied!</span>'; setTimeout(() => document.getElementById('btn-copy-config').innerHTML = 'Copy Config', 2000);
}

function acceptSharedConfig() { st.isViewingShared = false; document.getElementById('shared-banner').style.display = 'none'; saveLocal(); clearUrl(); }
function discardSharedConfig() { st.isViewingShared = false; document.getElementById('shared-banner').style.display = 'none'; document.getElementById('duel-banner').style.display = 'none'; st.isDuel = false; setUIConfig(loadLocal()); clearUrl(); }

function changeColorSpace() {
    if (st.suppressSave) return;
    st.spaceId = document.querySelector('input[name="colorSpace"]:checked').value; const cfg = spaces[st.spaceId];
    [1, 2, 3, 4].forEach(n => {
        const g = document.getElementById(`group-s${n}`);
        if (cfg[`s${n}`]) {
            g.style.display = 'block'; document.getElementById(`lbl-s${n}`).textContent = cfg[`s${n}`].lbl; const sl = document.getElementById(`slider-${n}`); sl.min = cfg[`s${n}`].min; sl.max = cfg[`s${n}`].max;
        } else { g.style.display = 'none'; }
    });
    if (!document.getElementById('map-checkbox').checked && !document.getElementById('terminal-checkbox').checked && document.getElementById('type-select').value !== 'haystack' && document.getElementById('type-select').value !== 'hexdle') updateColor();
}

function toggleDailyMenu(show) {
    if (show) {
        document.getElementById('shared-banner').style.display = 'none'; document.getElementById('duel-banner').style.display = 'none';
        generateDailyConfigs(); document.getElementById('setup-screen').classList.remove('active'); document.getElementById('daily-screen').classList.add('active');
    } else { document.getElementById('daily-screen').classList.remove('active'); document.getElementById('setup-screen').classList.add('active'); }
}

function generateDailyConfigs() {
    const rng = getDailyRNG(0); const spaceList = ['rgb', 'hsl', 'oklab', 'oklch', 'cmyk'];
    document.getElementById('daily-challenges-list').innerHTML = '';

    for (let i = 1; i <= 4; i++) {
        let cfg = { id: i, objective: 'match', type: 'solid', vision: 'normal', isMap: false, isHardcore: false, isIllusion: false, isTerminal: false, isMemory: false, isDarkroom: false, isRush: false };

        if (i === 1) { cfg.space = rng() > 0.5 ? 'rgb' : 'hsl'; cfg.timer = rng() > 0.5 ? 60 : 30; cfg.isMap = rng() > 0.5; }
        else if (i === 2) { cfg.space = ['oklab', 'oklch', 'cmyk'][Math.floor(rng() * 3)]; cfg.timer = 30; cfg.isIllusion = rng() > 0.5; cfg.isMemory = rng() > 0.7; }
        else if (i === 3) {
            cfg.space = spaceList[Math.floor(rng() * 5)]; cfg.timer = rng() > 0.5 ? 15 : 30;
            const r = Math.floor(rng() * 10);
            if (r === 0) cfg.isHardcore = true; else if (r === 1) cfg.isTerminal = true; else if (r === 2) cfg.type = 'gradient'; else if (r === 3) { cfg.type = 'palette'; cfg.space = 'hsl'; } else if (r === 4) cfg.isMemory = true; else if (r === 5) cfg.objective = 'wcag'; else if (r === 6) { cfg.type = 'haystack'; cfg.space = 'rgb'; } else if (r === 7) { cfg.type = 'hexdle'; cfg.space = 'rgb'; } else if (r === 8) { cfg.type = 'sort'; cfg.space = 'rgb'; } else if (r === 9) { cfg.type = 'luminance'; }
            if (rng() > 0.8) cfg.isDarkroom = true;
        } else if (i === 4) { cfg.space = 'rgb'; cfg.timer = 60; cfg.isRush = true; }

        let dScore = (cfg.space === 'rgb' ? 3 : cfg.space === 'cmyk' ? 4 : cfg.space === 'oklab' ? 4 : 2) + (cfg.timer === 15 ? 2 : cfg.timer === 30 ? 1 : 0) - (cfg.isMap ? 3 : 0) + (cfg.isHardcore ? 5 : 0) + (cfg.isIllusion ? 2 : 0) + (cfg.type === 'gradient' ? 6 : cfg.type === 'palette' ? 4 : cfg.type === 'haystack' ? 3 : cfg.type === 'hexdle' ? 5 : cfg.type === 'sort' ? 4 : cfg.type === 'luminance' ? 4 : 0) + (cfg.isTerminal ? 8 : 0) + (cfg.isMemory ? 4 : 0) + (cfg.isDarkroom ? 5 : 0) + (cfg.objective === 'wcag' ? 4 : 0) + (cfg.vision !== 'normal' ? 7 : 0);
        let dLbl = cfg.isRush ? 'SURVIVAL' : dScore <= 3 ? 'CASUAL' : dScore <= 6 ? 'NORMAL' : dScore <= 10 ? 'HARD' : 'EXTREME';
        let dCol = cfg.isRush ? '#f97316' : dScore <= 3 ? '#22c55e' : dScore <= 6 ? '#facc15' : dScore <= 10 ? '#f97316' : '#ef4444';

        let mods = [];
        if (cfg.isRush) mods.push(`<span class="flag-item">${svgs.rush} Seeded Sequence</span>`);
        if (cfg.type === 'gradient') mods.push(`<span class="flag-item">${svgs.gradient} Gradient</span>`);
        if (cfg.type === 'palette') mods.push(`<span class="flag-item">${svgs.palette} Palette</span>`);
        if (cfg.type === 'haystack') mods.push(`<span class="flag-item">${svgs.haystack} Haystack</span>`);
        if (cfg.type === 'hexdle') mods.push(`<span class="flag-item">${svgs.hexdle} Hexdle</span>`);
        if (cfg.type === 'sort') mods.push(`<span class="flag-item">${svgs.sort} Color Sort</span>`);
        if (cfg.type === 'luminance') mods.push(`<span class="flag-item">${svgs.luminance} Luminance Match</span>`);
        if (cfg.objective === 'wcag') mods.push(`<span class="flag-item">${svgs.wcag} WCAG Contrast</span>`);
        if (cfg.vision !== 'normal') mods.push(`<span class="flag-item" style="color:#ef4444;">👁 Colorblind</span>`);
        if (cfg.isTerminal) mods.push(`<span class="flag-item">${svgs.terminal} Terminal</span>`);
        if (cfg.isMap) mods.push(`<span class="flag-item">${svgs.map} Map</span>`);
        if (cfg.isMemory) mods.push(`<span class="flag-item">${svgs.memory} Memory</span>`);
        if (cfg.isDarkroom) mods.push(`<span class="flag-item">${svgs.darkroom} Darkroom</span>`);
        if (cfg.isHardcore) mods.push(`<span class="flag-item">${svgs.blind} Blind</span>`);
        if (cfg.isIllusion) mods.push(`<span class="flag-item">${svgs.illusion} Illusion</span>`);

        const card = document.createElement('div'); card.className = 'daily-card';
        card.innerHTML = `<div class="daily-card-title"><span>${cfg.isRush ? 'Daily Rush' : 'Ch 0' + cfg.id}</span><div style="display:flex; gap:8px;"><span class="diff-badge" style="color:${dCol}; border-color:${dCol};">${dLbl}</span><span>${cfg.timer}s</span></div></div>
                          <div class="daily-card-desc"><span style="font-weight:700; color:var(--text-main); font-size:0.7rem;">${cfg.space.toUpperCase()}</span></div>
                          ${mods.length ? `<div style="display:flex;gap:10px;margin-top:6px;color:var(--text-main);">${mods.join('')}</div>` : ''}`;
        card.onclick = () => {
            st.isDaily = true; st.dailyChallengeId = cfg.id; st.spaceId = cfg.space; st.timeLimit = cfg.timer; st.isMap = cfg.isMap; st.isHardcore = cfg.isHardcore; st.isIllusion = cfg.isIllusion; st.isComp = false; st.isWcag = cfg.objective === 'wcag'; st.type = cfg.type; st.palRule = 'analogous'; st.vision = cfg.vision; st.isTerminal = cfg.isTerminal; st.isMemory = cfg.isMemory; st.isDarkroom = cfg.isDarkroom; st.isRush = cfg.isRush; st.rushStreak = 0;
            setUIConfig({ s: cfg.space, t: cfg.timer, o: cfg.objective, p: cfg.type, pr: 'analogous', v: cfg.vision, m: cfg.isMap, h: cfg.isHardcore, i: cfg.isIllusion, tm: cfg.isTerminal, mm: cfg.isMemory, dk: cfg.isDarkroom }); executeGameStart();
        };
        document.getElementById('daily-challenges-list').appendChild(card);
    }
}

function buildFlexBoxes(containerId, count) {
    const container = document.getElementById(containerId); container.innerHTML = '';
    for (let i = 0; i < count; i++) { const box = document.createElement('div'); box.style.flex = '1'; box.style.height = '100%'; container.appendChild(box); }
}

function renderBoxes() {
    const tBox = document.getElementById('target-color'); const uBox = document.getElementById('user-color');

    if (st.type === 'studio') {
        const preview = document.getElementById('studio-preview');
        preview.style.display = 'flex'; document.getElementById('user-color').style.display = 'none';
        if (st.userCssData && st.userCssData.length === 5) {
            preview.style.setProperty('--sp-bg', st.userCssData[0]);
            preview.style.setProperty('--sp-surface', st.userCssData[1]);
            preview.style.setProperty('--sp-primary', st.userCssData[2]);
            preview.style.setProperty('--sp-secondary', st.userCssData[3]);
            preview.style.setProperty('--sp-text', st.userCssData[4]);
        }
    }

    if (st.type !== 'studio' && st.type !== 'hexdle' && st.type !== 'sort') {
        if (!(st.isMemory && st.memoryHidden)) {
            if (st.type === 'palette') {
                for (let i = 0; i < 3; i++) { tBox.children[i].style.background = st.targetCssData[i]; }
            } else if (st.type === 'gradient' || st.type === 'midpoint') {
                tBox.style.background = st.renderedTargetCss;
            } else {
                tBox.style.background = st.renderedTargetCss;
                document.getElementById('target-label').textContent = st.isWcag ? 'Background' : 'Reference';
                if (st.isWcag) {
                    tBox.innerHTML = `<span style="font-size:1.8rem; font-family:sans-serif; color:${st.renderedUserCss};">Aa</span><div style="position:absolute; bottom:4px; font-size:0.5rem; text-shadow:none; color:${st.renderedUserCss};">WCAG 4.5:1</div>`;
                } else if (st.isHardcore && !st.isMemory) { tBox.style.background = 'var(--bg)'; tBox.textContent = st.renderedTargetCss; }
            }
        } else if (st.isMemory && st.memoryHidden) {
            if (st.type === 'palette') {
                tBox.innerHTML = '<div style="width:100%; height:100%; display:flex; align-items:center; justify-content:center; background:var(--bg); border-radius:2px;"><span style="font-size:1.5rem;">???</span></div>';
            } else { tBox.style.background = 'var(--bg)'; tBox.style.textShadow = 'none'; tBox.innerHTML = '<span style="font-size:1.5rem;">???</span>'; }
        }
    }

    if (st.type !== 'hexdle' && st.type !== 'sort') {
        if (st.type === 'palette') {
            for (let i = 0; i < 3; i++) { uBox.children[i].style.background = st.userCssData[i]; }
        } else if (st.type === 'gradient') {
            uBox.style.background = st.renderedUserCss;
        } else { uBox.style.background = st.renderedUserCss; }

        if (st.type === 'studio' || st.type === 'telephone') {
            const innerTxt = st.type === 'telephone' ? '' : st.renderedUserCss;
            document.getElementById('user-label').innerHTML = `<span style="user-select:all; cursor:text; color:var(--text-muted);">${innerTxt}</span>`;
        } else { document.getElementById('user-label').textContent = 'Output'; }
    }
}

// Ensure the UI script properly listens to changes
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('#setup-screen input, #setup-screen select').forEach(el => {
        el.addEventListener('change', () => {
            if (st.isViewingShared) { st.isViewingShared = false; document.getElementById('shared-banner').style.display = 'none'; clearUrl(); }
            saveLocal();
        });
    });
});

function switchUITab(idx) {
    st.uiTab = idx; document.querySelectorAll('.ui-tab').forEach((el, i) => { if(!el.hasAttribute('style')) el.classList.toggle('active', i === idx); });
    const vals = st.userNativeData[idx]; [1,2,3,4].forEach(n => { if(spaces[st.spaceId][`s${n}`]) { document.getElementById(`slider-${n}`).value = vals[n-1] || 0; document.getElementById(`val-s${n}`).textContent = (vals[n-1]||0).toString().padStart(3,'0'); } });
    recordGhost();
}

function updateTerminal() { 
    const str = document.getElementById('terminal-input').value; 
    st.renderedUserCss = str; document.getElementById('user-color').style.background = str; st.currentRgb = getRgbFromCss(str); 
    renderBoxes(); 
}

// Explicit Global Exports
window.toggleInfo = toggleInfo;
window.toggleSettings = toggleSettings;
window.goHome = goHome;
window.initTheme = initTheme;
window.setTheme = setTheme;
window.resetTheme = resetTheme;
window.handleVision = handleVision;
window.triggerConfirm = triggerConfirm;
window.closeConfirm = closeConfirm;
window.executeConfirm = executeConfirm;
window.resetConfig = resetConfig;
window.resetPantheon = resetPantheon;
window.resetAnalytics = resetAnalytics;
window.resetAll = resetAll;
window.loadPantheon = loadPantheon;
window.saveToPantheon = saveToPantheon;
window.togglePantheon = togglePantheon;
window.showPantheonDetails = showPantheonDetails;
window.loadStats = loadStats;
window.saveStats = saveStats;
window.toggleStats = toggleStats;
window.handleTypeChange = handleTypeChange;
window.handleToggles = handleToggles;
window.getUIConfig = getUIConfig;
window.setUIConfig = setUIConfig;
window.saveLocal = saveLocal;
window.loadLocal = loadLocal;
window.clearUrl = clearUrl;
window.copyConfigUrl = copyConfigUrl;
window.acceptSharedConfig = acceptSharedConfig;
window.discardSharedConfig = discardSharedConfig;
window.changeColorSpace = changeColorSpace;
window.toggleDailyMenu = toggleDailyMenu;
window.generateDailyConfigs = generateDailyConfigs;
window.buildFlexBoxes = buildFlexBoxes;
window.renderBoxes = renderBoxes;
window.switchUITab = switchUITab;
window.updateTerminal = updateTerminal;
