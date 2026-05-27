function recordGhost() {
    const mapDisabled = document.getElementById('map-checkbox').disabled || !document.getElementById('map-checkbox').checked;
    const termDisabled = document.getElementById('terminal-checkbox').disabled || !document.getElementById('terminal-checkbox').checked;
    
    if (!mapDisabled || !termDisabled || st.type === 'studio' || st.type === 'haystack' || st.type === 'hexdle' || st.type === 'sort') return; 
    
    const now = Date.now(); const delta = now - st.lastGhostTime;
    if (delta < 500 && st.parsedGhostLog.length > 0) return; // 4fps max for extreme compression
    
    const t = st.uiTab; const d = st.gradDeg; 
    const v = [1,2,3,4].map(n => document.getElementById(`slider-${n}`) ? parseInt(document.getElementById(`slider-${n}`).value) || 0 : 0);
    
    const curStateStr = `${t},${d},${v.join(',')}`;
    if (st.lastGhostData !== curStateStr) {
        st.parsedGhostLog.push(delta, t, d, ...v);
        st.lastGhostData = curStateStr;
        st.lastGhostTime = now;
    }
}

function playbackGhost() {
    if (!st.isDuel || !st.duelData || !st.parsedGhostLog || st.parsedGhostLog.length === 0) return;
    const elapsed = Date.now() - st.ghostStart; 
    const gL = st.parsedGhostLog; 
    
    let f1 = gL[0], f2 = gL[gL.length - 1];
    for (let i = 0; i < gL.length - 1; i++) {
        if (elapsed >= gL[i].ms && elapsed <= gL[i+1].ms) { f1 = gL[i]; f2 = gL[i+1]; break; }
    }
    if (elapsed > f2.ms) { f1 = f2; }

    let prog = 0; if (f2.ms > f1.ms) prog = (elapsed - f1.ms) / (f2.ms - f1.ms);

    if (st.type === 'gradient' || st.type === 'palette') { document.querySelectorAll('.ui-tab').forEach((t, i) => { t.style.boxShadow = (i === f1.t) ? 'inset 0 0 10px rgba(255,255,255,0.2)' : 'none'; }); }
    if (st.type === 'gradient') { 
        const gDeg = document.getElementById('g-deg'); gDeg.style.display = 'block'; 
        const curDeg = f1.d + (f2.d - f1.d) * prog;
        gDeg.style.left = (curDeg / 360) * 100 + '%'; 
    }
    
    [1,2,3,4].forEach(n => {
        const sl = document.getElementById(`slider-${n}`); const ghost = document.getElementById(`g-${n}`);
        if (spaces[st.spaceId][`s${n}`] && f1.v[n-1] !== undefined) { 
            ghost.style.display = 'block'; 
            const curVal = f1.v[n-1] + (f2.v[n-1] - f1.v[n-1]) * prog;
            ghost.style.left = ((curVal - sl.min) / (sl.max - sl.min)) * 100 + '%'; 
        } else { ghost.style.display = 'none'; }
    });

    if (st.timer && elapsed <= gL[gL.length-1].ms) { st.ghostTimer = requestAnimationFrame(playbackGhost); }
}


function randomizeSliders() {
    const c = spaces[st.spaceId];
    [1,2,3,4].forEach(n => {
        const sl = document.getElementById(`slider-${n}`);
        if(c[`s${n}`]) sl.value = Math.floor(Math.random() * (parseInt(sl.max) - parseInt(sl.min) + 1)) + parseInt(sl.min);
    });
    updateColor();
}

function initRoundColors() {
    const rngWrapper = () => Math.random(); const rng = st.isDaily ? getDailyRNG(st.dailyChallengeId + st.rushStreak) : rngWrapper;
    const ft = document.getElementById('frame-target'); const fu = document.getElementById('frame-user'); const c = spaces[st.spaceId];
    
    if (st.isIllusion && st.type !== 'luminance') { ft.classList.add('active-illusion'); fu.classList.add('active-illusion'); ft.style.backgroundColor = `hsl(${Math.floor(rng()*360)},100%,50%)`; fu.style.backgroundColor = `hsl(${Math.floor(rng()*360)},100%,50%)`;
    } else { ft.classList.remove('active-illusion'); fu.classList.remove('active-illusion'); ft.style.backgroundColor = 'var(--border)'; fu.style.backgroundColor = 'var(--border)'; }

    const tBox = document.getElementById('target-color'); const uBox = document.getElementById('user-color'); const tLbl = document.getElementById('target-label');
    tBox.textContent = ''; uBox.textContent = ''; tBox.style.textShadow = 'none';

    if (st.type === 'palette') {
        buildFlexBoxes('target-color', 3); buildFlexBoxes('user-color', 3); tLbl.textContent = 'Reference Palette';
        if (st.isDuel) {
            st.targetColorData = st.duelData.tC; st.targetCssData = st.duelData.tCss; st.userNativeData = [st.duelData.uBase, [1,2,3,4].map(n=>c[`s${n}`]?c[`s${n}`].val:0), [1,2,3,4].map(n=>c[`s${n}`]?c[`s${n}`].val:0)];
        } else {
            let valid = false; let attempts = 0; let bVals, palVals;
            while (!valid && attempts < 50) { bVals = [1,2,3,4].map(n => c[`s${n}`] ? Math.floor(rng()*(c[`s${n}`].max-c[`s${n}`].min+1))+c[`s${n}`].min : 0); palVals = calcPalette(bVals, st.palRule); st.targetCssData = palVals.map(v => c.fmt(v)); st.targetColorData = st.targetCssData.map(css => getRgbFromCss(css)); valid = isGamutSafe(st.targetColorData); attempts++; }
            st.userNativeData = [bVals, [1,2,3,4].map(n=>c[`s${n}`]?c[`s${n}`].val:0), [1,2,3,4].map(n=>c[`s${n}`]?c[`s${n}`].val:0)];
        }
        st.userCssData = st.userNativeData.map(v => c.fmt(v)); st.userColorData = st.userCssData.map(css => getRgbFromCss(css)); st.renderedTargetCss = `linear-gradient(90deg, ${st.targetCssData.join(', ')})`;
        st.uiTab = 1; switchUITab(1); updateColor();
    } 
    else if (st.type === 'gradient') {
        tBox.style.display='flex'; uBox.style.display='flex'; tLbl.textContent = 'Reference Grad';
        if (st.isDuel) {
            st.targetNativeData = st.duelData.tN; st.gradDeg = st.duelData.tD; st.renderedTargetCss = `linear-gradient(${st.gradDeg}deg, ${c.fmt(st.targetNativeData[0])}, ${c.fmt(st.targetNativeData[1])})`; st.userNativeData = [[1,2,3,4].map(n=>c[`s${n}`]?c[`s${n}`].val:0), [1,2,3,4].map(n=>c[`s${n}`]?c[`s${n}`].val:0)];
        } else {
            let valid = false; let attempts = 0; let baseA, baseB;
            while(!valid && attempts < 50) { baseA = [1,2,3,4].map(n => c[`s${n}`] ? Math.floor(rng()*(c[`s${n}`].max-c[`s${n}`].min+1))+c[`s${n}`].min : 0); baseB = [1,2,3,4].map(n => c[`s${n}`] ? Math.floor(rng()*(c[`s${n}`].max-c[`s${n}`].min+1))+c[`s${n}`].min : 0); st.tGradA = st.isComp ? calcComp(baseA) : baseA; st.tGradB = st.isComp ? calcComp(baseB) : baseB; const rgbA = getRgbFromCss(c.fmt(st.tGradA)); const rgbB = getRgbFromCss(c.fmt(st.tGradB)); valid = isGamutSafe([rgbA, rgbB]); st.tDeg = Math.floor(rng() * 360); attempts++; }
            st.targetNativeData = [st.tGradA, st.tGradB]; st.renderedTargetCss = `linear-gradient(${st.tDeg}deg, ${c.fmt(st.targetNativeData[0])}, ${c.fmt(st.targetNativeData[1])})`; st.userNativeData = [[1,2,3,4].map(n=>c[`s${n}`]?c[`s${n}`].val:0), [1,2,3,4].map(n=>c[`s${n}`]?c[`s${n}`].val:0)];
        }
        st.uiTab = 0; document.getElementById('slider-deg').value = 180; document.getElementById('val-deg').textContent = 180; switchUITab(0); updateColor();
    } 
    else if (st.type === 'midpoint') {
        tBox.style.display='flex'; uBox.style.display='flex'; tLbl.textContent = 'Midpoint Match';
        if (st.isDuel) {
            st.targetNativeData = st.duelData.tN; st.targetVals = st.duelData.tV; st.renderedTargetCss = `linear-gradient(90deg, ${c.fmt(st.targetNativeData[0])} 50%, ${c.fmt(st.targetNativeData[1])} 50%)`; st.targetRgb = getRgbFromCss(c.fmt(st.targetVals));
            [1,2,3,4].forEach(n => { if(c[`s${n}`]) document.getElementById(`slider-${n}`).value = c[`s${n}`].val; }); updateColor();
        } else {
            let baseA = [1,2,3,4].map(n => c[`s${n}`] ? Math.floor(rng()*(c[`s${n}`].max-c[`s${n}`].min+1))+c[`s${n}`].min : 0);
            let baseB = [1,2,3,4].map(n => c[`s${n}`] ? Math.floor(rng()*(c[`s${n}`].max-c[`s${n}`].min+1))+c[`s${n}`].min : 0);
            st.targetNativeData = [baseA, baseB]; st.renderedTargetCss = `linear-gradient(90deg, ${c.fmt(baseA)} 50%, ${c.fmt(baseB)} 50%)`;
            st.targetVals = baseA.map((val, idx) => Math.round((val + baseB[idx]) / 2)); st.targetRgb = getRgbFromCss(c.fmt(st.targetVals));
            [1,2,3,4].forEach(n => { if(c[`s${n}`]) document.getElementById(`slider-${n}`).value = c[`s${n}`].val; }); updateColor();
        }
    }
    else if (st.type === 'sort') {
        if (st.isDuel) { st.sortTarget = st.duelData.sT; st.sortCurrent = [...st.duelData.sC]; } 
        else {
            const rgb1 = { r: Math.floor(rng()*256), g: Math.floor(rng()*256), b: Math.floor(rng()*256) }; const rgb2 = { r: Math.floor(rng()*256), g: Math.floor(rng()*256), b: Math.floor(rng()*256) };
            st.sortTarget = generateSortGradient(rgb1, rgb2, 8); let inner = st.sortTarget.slice(1, 7);
            for (let i = inner.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [inner[i], inner[j]] = [inner[j], inner[i]]; }
            st.sortCurrent = [st.sortTarget[0], ...inner, st.sortTarget[7]];
        }
        st.sortSelectedIdx = -1; renderSortGrid();
    }
    else if (st.type === 'chromakey') {
        if (st.isDuel) {
            st.targetVals = st.duelData.tV; st.renderedTargetCss = c.fmt(st.targetVals); st.targetRgb = getRgbFromCss(st.renderedTargetCss);
            [1,2,3,4].forEach(n => { if(c[`s${n}`]) document.getElementById(`slider-${n}`).value = c[`s${n}`].val; }); updateColor();
        } else {
            let valid = false; let attempts = 0; let bVals, tCss;
            while(!valid && attempts < 50) { bVals = [1,2,3,4].map(n => c[`s${n}`] ? Math.floor(rng()*(c[`s${n}`].max-c[`s${n}`].min+1))+c[`s${n}`].min : 0); tCss = c.fmt(bVals); st.targetRgb = getRgbFromCss(tCss); valid = isGamutSafe([st.targetRgb]); attempts++; }
            st.baseVals = bVals; st.targetVals = bVals; st.renderedTargetCss = tCss;
            [1,2,3,4].forEach(n => { if(c[`s${n}`]) document.getElementById(`slider-${n}`).value = c[`s${n}`].val; }); updateColor();
        }
        document.getElementById('chromakey-container').style.setProperty('--target', st.renderedTargetCss);
    }
    else if (st.type === 'studio') {
        tBox.style.display='none'; uBox.style.display='flex'; 
        if (st.spaceId === 'rgb') {
            st.userNativeData = [[18,18,18,0], [30,30,30,0], [187,134,252,0], [3,218,198,0], [255,255,255,0]];
        } else if (st.spaceId === 'hsl') {
            st.userNativeData = [[0,0,7,0], [0,0,12,0], [267,98,76,0], [174,97,43,0], [0,0,100,0]];
        } else {
            st.userNativeData = [
                [1,2,3,4].map(n=>c[`s${n}`]?c[`s${n}`].val:0),
                [1,2,3,4].map(n=>c[`s${n}`]?c[`s${n}`].val:0),
                [1,2,3,4].map(n=>c[`s${n}`]?c[`s${n}`].val:0),
                [1,2,3,4].map(n=>c[`s${n}`]?c[`s${n}`].val:0),
                [1,2,3,4].map(n=>c[`s${n}`]?c[`s${n}`].val:0)
            ];
        }
        st.userCssData = st.userNativeData.map(v => c.fmt(v)); st.userColorData = st.userCssData.map(css => getRgbFromCss(css));
        st.uiTab = 0; switchUITab(0); updateColor();
    }
    else { 
        tBox.style.display='flex'; uBox.style.display='flex'; tLbl.textContent = st.isComp ? 'Base Color' : st.isWcag ? 'Background' : 'Reference';
        if (st.isDuel && st.type !== 'telephone') {
            st.targetVals = st.duelData.tV; st.renderedTargetCss = c.fmt(st.targetVals); st.targetRgb = getRgbFromCss(st.renderedTargetCss);
            if (st.isTerminal) { document.getElementById('terminal-input').value = ''; st.renderedUserCss = 'var(--bg)'; } 
            else { [1,2,3,4].forEach(n => { if(c[`s${n}`]) document.getElementById(`slider-${n}`).value = c[`s${n}`].val; }); updateColor(); }
        } else {
            let valid = false; let attempts = 0; let bVals, tVals, tCss;
            while(!valid && attempts < 50) {
                bVals = [1,2,3,4].map(n => c[`s${n}`] ? Math.floor(rng()*(c[`s${n}`].max-c[`s${n}`].min+1))+c[`s${n}`].min : 0);
                if(st.isComp) {
                    if(st.spaceId==='rgb') tVals = [255-bVals[0], 255-bVals[1], 255-bVals[2]];
                    else if(st.spaceId==='hsl'||st.spaceId==='oklch') tVals = [bVals[0], bVals[1], (bVals[2]+180)%360];
                    else if(st.spaceId==='oklab') tVals = [bVals[0], -bVals[1], -bVals[2]];
                    else if(st.spaceId==='cmyk') tVals = [100-bVals[0], 100-bVals[1], 100-bVals[2], 100-bVals[3]];
                } else { tVals = bVals; }
                tCss = c.fmt(tVals); st.targetRgb = getRgbFromCss(tCss); valid = isGamutSafe([st.targetRgb]); attempts++;
            }
            
            if (st.type === 'telephone' && st.teleRound > 1) {
                st.targetRgb = {...st.currentRgb}; st.renderedTargetCss = `rgb(${st.targetRgb.r}, ${st.targetRgb.g}, ${st.targetRgb.b})`; randomizeSliders();
            } else if (st.type === 'telephone' && st.isDuel) {
                st.targetVals = st.duelData.tV; st.renderedTargetCss = c.fmt(st.targetVals); st.targetRgb = getRgbFromCss(st.renderedTargetCss);
                if(st.teleRound === 1) { st.teleHistory = [{...st.targetRgb}]; }
                [1,2,3,4].forEach(n => { if(c[`s${n}`]) document.getElementById(`slider-${n}`).value = c[`s${n}`].val; }); updateColor();
            } else {
                st.baseVals = bVals; st.targetVals = tVals; st.renderedTargetCss = tCss;
                if(st.type === 'telephone' && st.teleRound === 1) { st.teleHistory = [{...st.targetRgb}]; }
                if (st.isTerminal) { document.getElementById('terminal-input').value = ''; st.renderedUserCss = 'var(--bg)'; } 
                else { [1,2,3,4].forEach(n => { if(c[`s${n}`]) document.getElementById(`slider-${n}`).value = c[`s${n}`].val; }); updateColor(); }
            }
        }
    }
    renderBoxes();
}

function startFreeplay() {
    st.isDaily=false; st.isRush=false; const c = getUIConfig();
    st.spaceId=c.s; st.timeLimit=c.t; st.isComp=c.o==='complementary'; st.isWcag=c.o==='wcag'; st.type=c.p; st.palRule=c.pr; st.vision=c.v; st.isMap=c.m; st.isHardcore=c.h; st.isIllusion=c.i; st.isTerminal=c.tm; st.isMemory=c.mm; st.isDarkroom=c.dk; st.teleMax=c.tr;
    document.getElementById('shared-banner').style.display='none'; executeGameStart();
}

function startRush() {
    st.isDaily=false; st.isRush=true; st.rushStreak=0; const c = getUIConfig();
    st.spaceId=c.s; st.timeLimit=60; st.isComp=c.o==='complementary'; st.isWcag=c.o==='wcag'; st.type=c.p; st.palRule=c.pr; st.vision=c.v; st.isMap=c.m; st.isHardcore=c.h; st.isIllusion=c.i; st.isTerminal=c.tm; st.isMemory=c.mm; st.isDarkroom=c.dk; st.teleMax=c.tr;
    document.getElementById('shared-banner').style.display='none'; executeGameStart();
}

function acceptDuel() {
    st.isDaily=false; st.isRush=false; 
    setUIConfig(st.duelData.c); const c = getUIConfig();
    st.spaceId=c.s; st.timeLimit=c.t; st.isComp=c.o==='complementary'; st.isWcag=c.o==='wcag'; st.type=c.p; st.palRule=c.pr; st.vision=c.v; st.isMap=c.m; st.isHardcore=c.h; st.isIllusion=c.i; st.isTerminal=c.tm; st.isMemory=c.mm; st.isDarkroom=c.dk; st.teleMax=c.tr;
    document.getElementById('duel-banner').style.display='none'; executeGameStart();
}

function playAgain() { 
    if (st.type === 'studio') { resetGame(); } 
    else if (st.isRush) { startRush(); } 
    else if (st.isDuel) { acceptDuel(); } 
    else { executeGameStart(); } 
}

function executeGameStart() {
    st.memoryHidden = false; st.haystackCorrect = 0;
    if(st.timer) { clearInterval(st.timer); st.timer = null; }
    if(st.memoryTimeout) { clearTimeout(st.memoryTimeout); st.memoryTimeout = null; }
    if(st.ghostTimer) { cancelAnimationFrame(st.ghostTimer); st.ghostTimer = null; }
    
    document.querySelectorAll('.ghost-thumb').forEach(el => el.style.display = 'none');
    st.parsedGhostLog = []; st.ghostStart = Date.now(); st.lastGhostTime = st.ghostStart;
    
    if(st.type !== 'telephone' || st.teleRound === 1) { 
        st.teleRound = 1; st.teleHistory = []; 
        st.teleMax = parseInt(document.getElementById('telephone-rounds').value) || 10;
    }

    if(!st.isDaily && !st.isDuel && !st.isRush) st.gameSeed = Math.floor(Math.random() * 1000000);

    document.getElementById('setup-screen').classList.remove('active'); document.getElementById('daily-screen').classList.remove('active'); document.getElementById('results-screen').classList.remove('active');
    document.getElementById('game-area').classList.add('active');
    
    const mainBoxes = document.getElementById('main-color-boxes');
    mainBoxes.className = 'color-boxes' + (st.type === 'hexdle' ? ' is-hexdle' : '');
    
    if (st.isDarkroom) document.body.classList.add('darkroom-active'); else document.body.classList.remove('darkroom-active');

    st.isMap = document.getElementById('map-checkbox').checked && !document.getElementById('map-checkbox').disabled;
    st.isHardcore = document.getElementById('hardcore-checkbox').checked && !document.getElementById('hardcore-checkbox').disabled;
    st.isTerminal = document.getElementById('terminal-checkbox').checked && !document.getElementById('terminal-checkbox').disabled;
    st.isMemory = document.getElementById('memory-checkbox').checked && !document.getElementById('memory-checkbox').disabled;

    if (st.type === 'telephone') { document.querySelectorAll('.slider-value').forEach(el => el.style.visibility = 'hidden'); } 
    else { document.querySelectorAll('.slider-value').forEach(el => el.style.visibility = 'visible'); }

    const hsGrid = document.getElementById('haystack-grid'); const controls = document.getElementById('game-controls');
    const stdControls = document.getElementById('standard-controls'); const hexControls = document.getElementById('hexdle-controls'); const btnLock = document.getElementById('btn-lock');
    const sortGrid = document.getElementById('sort-grid'); const chromaContainer = document.getElementById('chromakey-container');

    document.querySelectorAll('.hexdle-key').forEach(k => { k.classList.remove('hx-green','hx-yellow','hx-gray'); });

    if (st.type === 'haystack') {
        mainBoxes.style.display = 'none'; sortGrid.style.display = 'none'; chromaContainer.style.display = 'none'; hsGrid.style.display = 'grid'; controls.style.display = 'none';
    } else if (st.type === 'hexdle') {
        mainBoxes.style.display = 'flex'; sortGrid.style.display = 'none'; chromaContainer.style.display = 'none'; hsGrid.style.display = 'none'; controls.style.display = 'block'; stdControls.style.display = 'none'; hexControls.style.display = 'block'; btnLock.style.display = 'none'; document.getElementById('cheater-controls').style.display = 'none'; document.getElementById('terminal-controls').style.display = 'none'; document.getElementById('frame-user').style.display = 'none'; 
    } else if (st.type === 'sort') {
        mainBoxes.style.display = 'none'; sortGrid.style.display = 'flex'; chromaContainer.style.display = 'none'; hsGrid.style.display = 'none'; controls.style.display = 'block'; stdControls.style.display = 'none'; hexControls.style.display = 'none'; btnLock.style.display = 'block'; document.getElementById('cheater-controls').style.display = 'none'; document.getElementById('terminal-controls').style.display = 'none'; 
    } else if (st.type === 'chromakey') {
        mainBoxes.style.display = 'none'; sortGrid.style.display = 'none'; chromaContainer.style.display = 'flex'; hsGrid.style.display = 'none'; controls.style.display = 'block'; stdControls.style.display = 'block'; hexControls.style.display = 'none'; btnLock.style.display = 'block'; document.getElementById('cheater-controls').style.display = 'none'; document.getElementById('terminal-controls').style.display = 'none'; 
    } else {
        mainBoxes.style.display = 'flex'; sortGrid.style.display = 'none'; chromaContainer.style.display = 'none'; hsGrid.style.display = 'none'; controls.style.display = 'block'; stdControls.style.display = (!st.isMap && !st.isTerminal) ? 'block' : 'none'; hexControls.style.display = 'none'; btnLock.style.display = 'block';
        document.getElementById('cheater-controls').style.display = st.isMap ? 'block' : 'none'; document.getElementById('selector-dot').style.display = st.isMap ? 'block' : 'none'; document.getElementById('terminal-controls').style.display = st.isTerminal ? 'block' : 'none'; document.getElementById('frame-user').style.display = 'block'; 
    }
    
    const tabs = document.getElementById('ui-tabs');
    if (st.type === 'gradient') {
        tabs.style.display = 'flex'; document.getElementById('group-deg').style.display = 'block';
        tabs.innerHTML = `<button class="ui-tab active" id="tab-0" onclick="switchUITab(0)">Color A</button><button class="ui-tab" id="tab-1" onclick="switchUITab(1)">Color B</button>`;
    } else if (st.type === 'palette') {
        tabs.style.display = 'flex'; document.getElementById('group-deg').style.display = 'none';
        tabs.innerHTML = `<button class="ui-tab" style="opacity:0.5; pointer-events:none;">Base</button><button class="ui-tab active" id="tab-1" onclick="switchUITab(1)">Color 2</button><button class="ui-tab" id="tab-2" onclick="switchUITab(2)">Color 3</button>`;
    } else if (st.type === 'studio') {
        tabs.style.display = 'flex'; document.getElementById('group-deg').style.display = 'none';
        tabs.innerHTML = `<button class="ui-tab active" id="tab-0" onclick="switchUITab(0)">Bg</button><button class="ui-tab" id="tab-1" onclick="switchUITab(1)">Surf</button><button class="ui-tab" id="tab-2" onclick="switchUITab(2)">Prim</button><button class="ui-tab" id="tab-3" onclick="switchUITab(3)">Sec</button><button class="ui-tab" id="tab-4" onclick="switchUITab(4)">Text</button>`;
    } else { tabs.style.display = 'none'; document.getElementById('group-deg').style.display = 'none'; }

    document.getElementById('frame-opponent').style.display='none'; document.getElementById('btn-challenge').style.display='none';
    document.getElementById('target-label').textContent='Reference';
    
    if (st.type === 'studio') {
        document.getElementById('frame-target').style.display = 'none'; document.getElementById('frame-user').style.flex = '2'; document.getElementById('timer').style.display = 'none';
        document.getElementById('game-objective').textContent = "Studio Mode (Utility)"; document.getElementById('game-objective').style.color = 'var(--text-muted)'; 
        btnLock.textContent = 'Generate Code'; document.getElementById('btn-exit-studio').style.display = 'block';
    } else {
        document.getElementById('frame-target').style.display = 'block'; document.getElementById('frame-user').style.flex = '1'; document.getElementById('timer').style.display = (st.type==='hexdle' || st.type==='sort') ? 'none' : 'block'; 
        btnLock.textContent = 'Lock In'; document.getElementById('btn-exit-studio').style.display = 'none';
    }

    const rb = document.getElementById('rush-badge');
    if (st.isRush) { rb.style.display='flex'; document.getElementById('rush-streak').textContent=st.rushStreak; } else { rb.style.display='none'; }

    if (st.type === 'haystack') { initHaystack(); } else if (st.type === 'hexdle') { initHexdle(); } else { initRoundColors(); changeColorSpace(); }
    
    if (st.type !== 'studio') {
        let oTxt = st.type === 'haystack' ? "Find the Odd Color" : st.type === 'hexdle' ? "Decode the Hex" : st.type === 'sort' ? "Unscramble Gradient" : st.type === 'gradient' ? "Match the Gradient" : st.type === 'palette' ? `Build ${st.palRule} Palette` : st.type === 'midpoint' ? "Find the Midpoint" : st.type === 'luminance' ? "Match the Brightness" : st.type === 'telephone' ? `Drift: Round ${st.teleRound}/${st.teleMax}` : st.isWcag ? "Pass WCAG Contrast" : "Match the Target";
        if(st.isTerminal && st.type !== 'telephone') oTxt = "Type the Code to Match"; else if(st.isComp&&st.isHardcore) oTxt="Blind-Match Complement"; else if(st.isComp) oTxt="Match Complement"; else if(st.isHardcore) oTxt="Blind-Match Target";

        if(st.isMemory && st.type !== 'haystack' && st.type !== 'hexdle' && st.type !== 'sort') {
            document.getElementById('game-objective').textContent = "Memorize the Target!"; document.getElementById('game-objective').style.color = '#facc15';
            st.memoryTimeout = setTimeout(() => {
                st.memoryHidden = true; document.getElementById('game-objective').textContent = st.isComp ? "Remake Complement from Memory!" : "Remake from Memory!";
                document.getElementById('game-objective').style.color = 'var(--accent)'; renderBoxes();
            }, 3000);
        } else { document.getElementById('game-objective').style.color = 'var(--accent)'; document.getElementById('game-objective').textContent = oTxt; }

        if(st.type !== 'hexdle' && st.type !== 'sort') { st.timeRemaining = st.timeLimit; startTimer(); }
        
        if (st.isDuel && st.duelData.gL && st.duelData.gL.length > 0) {
            let absTime = 0; st.parsedGhostLog = [];
            for (let i = 0; i < st.duelData.gL.length; i += 7) {
                absTime += st.duelData.gL[i];
                st.parsedGhostLog.push({ ms: absTime, t: st.duelData.gL[i+1], d: st.duelData.gL[i+2], v: [st.duelData.gL[i+3], st.duelData.gL[i+4], st.duelData.gL[i+5], st.duelData.gL[i+6]] });
            }
            st.ghostTimer = requestAnimationFrame(playbackGhost);
        }
    }
}

function updateColor() {
    if(st.isMap || st.isTerminal || st.type === 'haystack' || st.type === 'sort' || st.type === 'hexdle') return; 
    const c=spaces[st.spaceId]; 
    const vals = []; [1,2,3,4].forEach(n => { if(c[`s${n}`]){ let v=parseInt(document.getElementById(`slider-${n}`).value); vals.push(v); document.getElementById(`val-s${n}`).textContent=v.toString().padStart(3,'0'); } });
    
    if (st.type === 'palette' || st.type === 'gradient' || st.type === 'studio') {
        st.userNativeData[st.uiTab] = vals;
        if (st.type === 'gradient') {
            st.cDeg = parseInt(document.getElementById('slider-deg').value); document.getElementById('val-deg').textContent = st.cDeg.toString().padStart(3,'0');
            if (st.userNativeData[0].length && st.userNativeData[1].length) { st.renderedUserCss = `linear-gradient(${st.cDeg}deg, ${c.fmt(st.userNativeData[0])}, ${c.fmt(st.userNativeData[1])})`; }
        } else if (st.type === 'palette') {
            st.userCssData[st.uiTab] = c.fmt(vals); st.userColorData[st.uiTab] = getRgbFromCss(st.userCssData[st.uiTab]); st.renderedUserCss = `linear-gradient(90deg, ${st.userCssData.join(', ')})`;
        } else if (st.type === 'studio') {
            st.userCssData[st.uiTab] = c.fmt(vals); st.userColorData[st.uiTab] = getRgbFromCss(st.userCssData[st.uiTab]); st.renderedUserCss = st.userCssData[st.uiTab];
        }
    } else { st.currentVals=vals; st.renderedUserCss = c.fmt(st.currentVals); st.currentRgb=getRgbFromCss(st.renderedUserCss); }
    renderBoxes(); recordGhost();
}

function startTimer() {
    document.getElementById('timer').textContent = st.timeRemaining.toString().padStart(2, '0');
    st.timer = setInterval(() => {
        st.timeRemaining--; document.getElementById('timer').textContent = st.timeRemaining.toString().padStart(2, '0');
        if (st.timeRemaining <= 0) { lockIn(); }
    }, 1000);
}

function calcColorScore(c1, c2) {
    const rM = (c1.r+c2.r)/2; const dr=c1.r-c2.r, dg=c1.g-c2.g, db=c1.b-c2.b;
    const dist = Math.sqrt((2+rM/256)*dr*dr + 4*dg*dg + (2+(255-rM)/256)*db*db); return Math.max(0,1-(dist/764.83));
}

function calculateScore() {
    if (st.type === 'haystack') {
        return Math.min(100, Math.round((st.haystackCorrect / 15) * 100)); 
    } else if (st.type === 'hexdle') {
        if (st.hexCurrentGuess === st.hexTarget) return [100, 95, 85, 75, 60, 50][st.hexGuesses.length - 1];
        return Math.round(Math.pow(calcColorScore(st.targetRgb, st.currentRgb), 1.5) * 100);
    } else if (st.isWcag) {
        const ratio = getContrast(st.targetRgb, st.currentRgb);
        if (ratio >= 4.5) return 100; return Math.max(0, Math.round((ratio / 4.5) * 100));
    } else if (st.type === 'luminance') {
        const l1 = getLuminance(st.targetRgb.r, st.targetRgb.g, st.targetRgb.b);
        const l2 = getLuminance(st.currentRgb.r, st.currentRgb.g, st.currentRgb.b);
        return Math.max(0, 100 - Math.round(Math.abs(l1 - l2) * 200));
    } else if (st.type === 'palette') {
        const s1 = calcColorScore(st.targetColorData[1], st.userColorData[1]); const s2 = calcColorScore(st.targetColorData[2], st.userColorData[2]); return Math.round(Math.pow((s1+s2)/2, 1.5) * 100);
    } else if (st.type === 'gradient') {
        const c = spaces[st.spaceId];
        const tA = getRgbFromCss(c.fmt(st.targetNativeData[0])), tB = getRgbFromCss(c.fmt(st.targetNativeData[1])); const uA = getRgbFromCss(c.fmt(st.userNativeData[0])), uB = getRgbFromCss(c.fmt(st.userNativeData[1]));
        const score1 = (calcColorScore(tA, uA) + calcColorScore(tB, uB)) / 2; let aDiff1 = Math.abs(st.gradDeg - st.cDeg) % 360; if(aDiff1 > 180) aDiff1 = 360 - aDiff1; const final1 = score1 * (0.8 + 0.2 * (1 - aDiff1/180));
        const score2 = (calcColorScore(tA, uB) + calcColorScore(tB, uA)) / 2; let aDiff2 = Math.abs(st.gradDeg - ((st.cDeg+180)%360)) % 360; if(aDiff2 > 180) aDiff2 = 360 - aDiff2; const final2 = score2 * (0.8 + 0.2 * (1 - aDiff2/180));
        return Math.round(Math.pow(Math.max(final1, final2), 1.5) * 100);
    } else if (st.type === 'telephone') {
        return Math.round(Math.pow(calcColorScore(st.teleHistory[0], st.teleHistory[st.teleHistory.length-1]), 1.5) * 100);
    } else if (st.type === 'sort') {
        let sortDist = 0; for (let i = 1; i < 7; i++) { sortDist += calcColorScore(st.sortTarget[i], st.sortCurrent[i]); }
        return Math.round(Math.pow((sortDist / 6), 1.5) * 100);
    } else { return Math.round(Math.pow(calcColorScore(st.targetRgb, st.currentRgb), 1.5) * 100); }
}

function buildCodeExport() {
    let css = `:root {\n`;
    if (st.type === 'palette') { css += `  --color-base: ${st.userCssData[0]};\n  --color-2: ${st.userCssData[1]};\n  --color-3: ${st.userCssData[2]};\n`; } 
    else if (st.type === 'gradient') { css += `  --gradient-main: ${st.renderedUserCss};\n`; } 
    else if (st.type === 'studio') { css += `  --theme-bg: ${st.userCssData[0]};\n  --theme-surface: ${st.userCssData[1]};\n  --theme-primary: ${st.userCssData[2]};\n  --theme-secondary: ${st.userCssData[3]};\n  --theme-text: ${st.userCssData[4]};\n`; }
    else { css += `  --color-main: ${st.renderedUserCss};\n`; }
    css += `}`; return css;
}

function copyExport() {
    navigator.clipboard.writeText(document.getElementById('export-textarea').value);
    document.getElementById('export-modal').style.display='none';
}

function lockIn() {
    const btn = document.getElementById('btn-lock');
    btn.disabled = true; setTimeout(() => btn.disabled = false, 300);

    if (st.type === 'studio') {
        const ex = document.getElementById('export-modal'); document.getElementById('export-textarea').value = buildCodeExport();
        ex.style.display = 'block'; return;
    }
    if (st.type === 'telephone' && st.teleRound < st.teleMax && st.timeRemaining > 0) {
        if (st.timer) clearInterval(st.timer);
        const snappedRgb = {...st.currentRgb}; st.teleHistory.push(snappedRgb); st.teleRound++; document.getElementById('game-objective').textContent = `Drift: Round ${st.teleRound}/${st.teleMax}`;
        st.targetRgb = snappedRgb; st.targetVals = [...st.currentVals]; st.renderedTargetCss = st.renderedUserCss;
        randomizeSliders(); renderBoxes();
        st.timeRemaining = st.timeLimit; startTimer(); return;
    }

    if (st.timer) { clearInterval(st.timer); st.timer = null; }
    if (st.memoryTimeout) { clearTimeout(st.memoryTimeout); st.memoryTimeout = null; }
    if (st.ghostTimer) { cancelAnimationFrame(st.ghostTimer); st.ghostTimer = null; }

    st.memoryHidden = false; document.body.classList.remove('darkroom-active');
    if(st.type === 'telephone' && st.teleRound === st.teleMax) st.teleHistory.push({...st.currentRgb}); 

    const score = calculateScore();
    if (st.type === 'solid' && !st.isWcag) saveStats(score, st.currentRgb.r - st.targetRgb.r, st.currentRgb.g - st.targetRgb.g, st.currentRgb.b - st.targetRgb.b);
    if (score >= 98 && !st.isDuel && st.type !== 'haystack' && st.type !== 'hexdle' && st.type !== 'sort' && st.type !== 'telephone') saveToPantheon(st.renderedTargetCss, st.renderedUserCss);

    if (st.isRush && st.timeRemaining > 0) {
        if (score >= 90 || (st.type === 'haystack' && st.timeRemaining > 0)) { 
            if(st.type !== 'haystack') { st.rushStreak++; st.timeRemaining += (score >= 98 ? 10 : 5); } 
            document.getElementById('rush-streak').textContent = st.rushStreak;
            if (st.isDarkroom) document.body.classList.add('darkroom-active');
            if(st.type === 'haystack') initHaystack(); else initRoundColors(); startTimer(); 
        } else { st.finalScore = score; triggerEndScreen(); }
    } else { st.finalScore = score; triggerEndScreen(); }
}

function triggerEndScreen() {
    const tBox=document.getElementById('target-color'), ft=document.getElementById('frame-target'), uBox=document.getElementById('user-color'), fu=document.getElementById('frame-user');
    ft.classList.remove('active-illusion'); fu.classList.remove('active-illusion'); ft.style.backgroundColor='var(--border)'; fu.style.backgroundColor='var(--border)';
    
    document.getElementById('haystack-grid').style.display = 'none'; document.getElementById('hexdle-controls').style.display = 'none';
    document.getElementById('sort-grid').style.display = 'none'; 
    
    document.getElementById('main-color-boxes').style.display = 'flex'; document.getElementById('frame-target').style.display = 'block'; fu.style.flex = '1'; fu.style.display = 'block';

    if (st.type === 'palette') {
        tBox.innerHTML=''; for(let i=0; i<3; i++) { const d = document.createElement('div'); d.style.flex='1'; d.style.height='100%'; d.style.background=st.targetCssData[i]; tBox.appendChild(d); }
    } else if (st.type === 'telephone') {
        tBox.innerHTML=''; document.getElementById('target-label').textContent='Mutation History';
        st.teleHistory.forEach((rgb, idx) => { 
            const d = document.createElement('div'); d.style.flex='1'; d.style.height='100%'; d.style.background=`rgb(${rgb.r},${rgb.g},${rgb.b})`; 
            d.style.display='flex'; d.style.alignItems='flex-end'; d.style.justifyContent='center';
            d.innerHTML = `<span style="font-size:0.5rem; background:rgba(0,0,0,0.5); padding:2px; color:#fff; border-radius:1px; margin-bottom:2px;">R${idx+1}</span>`;
            tBox.appendChild(d); 
        });
        fu.style.display = 'none'; 
    } else if (st.type === 'sort') {
        tBox.innerHTML=''; document.getElementById('target-label').textContent='Correct Order';
        st.sortTarget.forEach(rgb => { const d = document.createElement('div'); d.style.flex='1'; d.style.height='100%'; d.style.background=`rgb(${rgb.r},${rgb.g},${rgb.b})`; tBox.appendChild(d); });
        uBox.innerHTML=''; document.getElementById('user-label').textContent='Your Order';
        st.sortCurrent.forEach(rgb => { const d = document.createElement('div'); d.style.flex='1'; d.style.height='100%'; d.style.background=`rgb(${rgb.r},${rgb.g},${rgb.b})`; uBox.appendChild(d); });
    } else if (st.type === 'midpoint') {
        tBox.innerHTML = '';
        const c1 = document.createElement('div'); c1.style.flex='1'; c1.style.height='100%'; c1.style.background = spaces[st.spaceId].fmt(st.targetNativeData[0]);
        const cm = document.createElement('div'); cm.style.flex='1.5'; cm.style.height='100%'; cm.style.background = spaces[st.spaceId].fmt(st.targetVals);
        const c2 = document.createElement('div'); c2.style.flex='1'; c2.style.height='100%'; c2.style.background = spaces[st.spaceId].fmt(st.targetNativeData[1]);
        tBox.appendChild(c1); tBox.appendChild(cm); tBox.appendChild(c2);
        document.getElementById('target-label').textContent = 'Color A | True Midpoint | Color B';
    } else {
        tBox.style.background = st.renderedTargetCss;
        if(st.isWcag) {
            tBox.innerHTML = `<span style="font-size:1.8rem; font-family:sans-serif; color:${st.renderedUserCss};">Aa</span><div style="position:absolute; bottom:4px; font-size:0.5rem; text-shadow:none; color:${st.renderedUserCss};">Actual Ratio: ${getContrast(st.targetRgb, st.currentRgb).toFixed(2)}:1</div>`;
        } else if(st.isHardcore || (st.isComp && st.type === 'solid') || st.isMemory || st.type === 'luminance'){ 
            tBox.style.textShadow='0 0 8px #000'; tBox.textContent = st.type==='gradient' ? '' : spaces[st.spaceId].fmt(st.targetVals); document.getElementById('target-label').textContent='True Target'; 
        } else if (st.type === 'haystack') {
            tBox.style.background = 'var(--bg)'; tBox.textContent = `Score: ${st.haystackCorrect}`; document.getElementById('target-label').textContent='Tiles Found'; fu.style.display = 'none';
        } else if (st.type === 'hexdle') {
            tBox.style.textShadow='0 0 8px #000'; tBox.textContent = st.renderedTargetCss; document.getElementById('target-label').textContent='True Target';
            uBox.style.background = st.renderedUserCss; uBox.textContent = st.renderedUserCss; uBox.style.textShadow='0 0 8px #000';
        } else { tBox.textContent = ''; }
    }

    document.getElementById('game-area').classList.remove('active'); document.getElementById('results-screen').classList.add('active');
    document.getElementById('match-percentage').textContent = st.finalScore + (st.type === 'haystack' ? '' : '%');

    let flags = [`<span class="flag-item">${st.spaceId.toUpperCase()}</span>`];
    if(st.isRush) flags.push(`<span class="flag-item">${svgs.rush} Streak: ${st.rushStreak}</span>`);
    if(st.isDaily) flags.push(`<span class="flag-item">Daily #${st.dailyNum}</span>`);
    if(st.isDuel) flags.push(`<span class="flag-item">${svgs.duel} Duel</span>`);
    if(st.type==='gradient') flags.push(`<span class="flag-item">${svgs.gradient} Gradient</span>`);
    if(st.type==='palette') flags.push(`<span class="flag-item">${svgs.palette} Palette</span>`);
    if(st.type==='haystack') flags.push(`<span class="flag-item">${svgs.haystack} Haystack</span>`);
    if(st.type==='hexdle') flags.push(`<span class="flag-item">${svgs.hexdle} Hexdle</span>`);
    if(st.type==='telephone') flags.push(`<span class="flag-item">${svgs.telephone} Telephone</span>`);
    if(st.type==='midpoint') flags.push(`<span class="flag-item">${svgs.midpoint} Midpoint</span>`);
    if(st.type==='sort') flags.push(`<span class="flag-item">${svgs.sort} Color Sort</span>`);
    if(st.type==='luminance') flags.push(`<span class="flag-item">${svgs.luminance} Luminance</span>`);
    if(st.isWcag) flags.push(`<span class="flag-item">${svgs.wcag} WCAG</span>`);
    if(st.isTerminal) flags.push(`<span class="flag-item">${svgs.terminal} Terminal</span>`);
    if(st.isComp) flags.push(`<span class="flag-item">${svgs.complementary} Comp</span>`);
    if(st.isMemory) flags.push(`<span class="flag-item">${svgs.memory} Memory</span>`);
    if(st.isDarkroom) flags.push(`<span class="flag-item">${svgs.darkroom} Darkroom</span>`);
    if(st.isHardcore) flags.push(`<span class="flag-item">${svgs.blind} Blind</span>`);
    if(st.isMap) flags.push(`<span class="flag-item">${svgs.map} Map</span>`);
    if(st.isIllusion) flags.push(`<span class="flag-item">${svgs.illusion} Illusion</span>`);
    if(st.vision!=='normal') flags.push(`<span class="flag-item" style="color:#ef4444;">👁 Colorblind</span>`);
    document.getElementById('status-text').innerHTML = flags.join('<span class="flag-sep">|</span>');

    const un_duelable = ['studio'];
    if (!st.isDaily && !st.isRush && !st.isDuel && !un_duelable.includes(st.type)) document.getElementById('btn-challenge').style.display='flex';

    if (st.isDuel) {
        const fo = document.getElementById('frame-opponent'); fo.style.display = 'block'; fo.classList.remove('active-illusion'); fo.style.backgroundColor='var(--border)';
        const oBox = document.getElementById('op-color'); 
        if (st.type === 'palette') { oBox.innerHTML=''; for(let i=0; i<3; i++) { const d = document.createElement('div'); d.style.flex='1'; d.style.height='100%'; d.style.background=st.duelData.uC[i]; oBox.appendChild(d); }
        } else if (st.type === 'telephone') {
            oBox.innerHTML=''; 
            if (st.duelData.gL && st.duelData.gL.length) {
                for(let i=0; i<st.duelData.gL.length; i+=3) { const d = document.createElement('div'); d.style.flex='1'; d.style.height='100%'; d.style.background=`rgb(${st.duelData.gL[i]},${st.duelData.gL[i+1]},${st.duelData.gL[i+2]})`; oBox.appendChild(d); }
            }
        } else if (st.type === 'sort') {
            oBox.innerHTML=''; st.duelData.sC.forEach(rgb => { const d = document.createElement('div'); d.style.flex='1'; d.style.height='100%'; d.style.background=`rgb(${rgb.r},${rgb.g},${rgb.b})`; oBox.appendChild(d); });
        } else { oBox.style.background = st.duelData.uC; }
        document.getElementById('op-label').textContent = `Opponent (${st.duelData.oS}%)`;
        const win = st.finalScore > st.duelData.oS; document.getElementById('match-percentage').innerHTML = `${st.finalScore}${st.type === 'haystack' ? '' : '%'} <div style="font-size:1.5rem; color:${win?'#22c55e':'#ef4444'}; margin-top:10px; font-weight:800;">${win?'VICTORY':'DEFEAT'}</div>`;
    }
    toggleInfo(false); 
}

async function shareDuel() {
    const btn = document.getElementById('btn-challenge');
    const orig = btn.innerHTML; btn.textContent = 'Compressing...';
    try {
        let packedData = [];
        if (st.type === 'telephone') {
            st.teleHistory.forEach(rgb => { packedData.push(rgb.r, rgb.g, rgb.b); });
        } else if (st.parsedGhostLog && st.parsedGhostLog.length) {
            packedData = st.parsedGhostLog;
        }

        const data = { c: getUIConfig(), tSeed: (st.type==='haystack' || st.type==='hexdle')?st.gameSeed:null, tV: (st.type==='solid'||st.type==='midpoint'||st.type==='telephone'||st.type==='luminance')?st.targetVals:null, tN: (st.type==='gradient'||st.type==='midpoint')?st.targetNativeData:null, tD: st.type==='gradient'?st.gradDeg:null, tC: st.type==='palette'?st.targetColorData:null, tCss: st.type==='palette'?st.targetCssData:null, tH: st.type==='hexdle'?st.hexTarget:null, sT: st.type==='sort'?st.sortTarget:null, sC: st.type==='sort'?st.sortCurrent:null, uBase: st.type==='palette'?st.userNativeData[0]:null, uC: st.type==='palette'?st.userCssData:st.renderedUserCss, oS: st.finalScore, gL: packedData };
        const b64 = await compressData(data); const qs = `?duel=1&d=${b64}`;
        if (st.type === 'haystack') btn.innerHTML = '<span>Share Match!</span>';
        navigator.clipboard.writeText(window.location.origin + window.location.pathname + qs);
        btn.innerHTML = '<span>Link Copied!</span>'; setTimeout(() => btn.innerHTML = orig, 2000);
    } catch (e) { btn.textContent = 'Error!'; setTimeout(() => btn.innerHTML = orig, 2000); }
}

function shareScore() {
    const getEmoji = (diff) => diff < 15 ? '🟩' : diff < 40 ? '🟨' : '🟥';
    let tName = st.type.charAt(0).toUpperCase() + st.type.slice(1); if(typeof typeNames !== "undefined" && typeNames[st.type]) tName = typeNames[st.type]; let str = `Chroma ${st.isDaily?`Daily #${st.dailyNum}`:st.isRush?`Rush (Streak ${st.rushStreak})`:st.isDuel?'Duel':'Freeplay'} | ${tName} | ${st.finalScore}${st.type === 'haystack' ? '' : '%'}\n`;
    if(st.type==='gradient') str+='🌈'; if(st.type==='palette') str+='🎨'; if(st.type==='haystack') str+='🔲'; if(st.type==='hexdle') str+='🧩'; if(st.type==='telephone') str+='☎️'; if(st.type==='midpoint') str+='⚖️'; if(st.type==='sort') str+='📊'; if(st.type==='luminance') str+='💡'; if(st.isTerminal) str+='⌨️'; if(st.isMemory) str+='🧠'; if(st.isComp) str+='☯'; if(st.isWcag) str+='Aa'; if(st.isHardcore) str+='👁'; if(st.isDarkroom) str+='📸'; if(st.vision!=='normal') str+='🕶'; if(st.isIllusion) str+='🌀'; if(st.isMap) str+='🗺';
    if((st.type==='solid' || st.type==='midpoint' || st.type==='luminance') && !st.isWcag) { const dr=Math.abs(st.targetRgb.r-st.currentRgb.r), dg=Math.abs(st.targetRgb.g-st.currentRgb.g), db=Math.abs(st.targetRgb.b-st.currentRgb.b); str += `\n[RGB] ${getEmoji(dr)}${getEmoji(dg)}${getEmoji(db)}`; }
    navigator.clipboard.writeText(str).then(() => { const b=document.getElementById('btn-share'); const o=b.innerHTML; b.innerHTML='<span>Copied!</span>'; setTimeout(()=>b.innerHTML=o,2000); });
}

function resetGame() {
    if (st.timer) { clearInterval(st.timer); st.timer = null; }
    if (st.ghostTimer) { cancelAnimationFrame(st.ghostTimer); st.ghostTimer = null; }
    document.body.classList.remove('darkroom-active');
    
    document.getElementById('setup-screen').classList.add('active'); 
    document.getElementById('results-screen').classList.remove('active'); 
    document.getElementById('game-area').classList.remove('active');
    document.getElementById('game-area').className = 'game-area'; 
    
    document.getElementById('main-color-boxes').style.display='none';
    document.getElementById('main-color-boxes').className = 'color-boxes';
    document.getElementById('haystack-grid').style.display='none';
    document.getElementById('sort-grid').style.display='none';
    
    if (st.isDuel) { clearUrl(); st.isDuel=false; st.duelData=null; document.getElementById('match-percentage').innerHTML='0%'; document.getElementById('duel-banner').style.display='none'; }
    if (st.isViewingShared) document.getElementById('shared-banner').style.display='block';
    changeColorSpace();
}

document.addEventListener('DOMContentLoaded', async () => {
    initTheme(); getDailyRNG(0)(); document.getElementById('daily-day-display').textContent = st.dailyNum;
    const p = new URLSearchParams(window.location.search);
    if (p.has('duel') && p.has('d')) {
        try { 
            st.duelData = await decompressData(p.get('d')); 
            st.isDuel = true; document.getElementById('duel-op-score').textContent = st.duelData.oS + '%'; 
            document.getElementById('duel-banner').style.display = 'block';
        } catch(e) { clearUrl(); setUIConfig(loadLocal()); }
    } else if (p.has('share')) {
        st.isViewingShared = true; document.getElementById('shared-banner').style.display='block';
        setUIConfig({ s:p.get('s'), t:parseInt(p.get('t')), o:p.get('o'), p:p.get('p')||'solid', pr:p.get('pr')||'analogous', v:p.get('v')||'normal', tr:parseInt(p.get('tr'))||10, m:p.get('m')==='1', h:p.get('h')==='1', i:p.get('i')==='1', tm:p.get('tm')==='1', mm:p.get('mm')==='1', dk:p.get('dk')==='1' });
    } else { setUIConfig(loadLocal()); }
});
