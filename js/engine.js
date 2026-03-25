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
