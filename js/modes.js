// --- HEXDLE ENGINE ---
function initHexdle() {
    const rng = (st.isDaily || st.isDuel) ? getDailyRNG(st.dailyChallengeId + st.rushStreak + (st.isDuel ? st.duelData.tSeed : st.gameSeed)) : () => Math.random();
    if(st.isDuel && st.duelData.tH) { st.hexTarget = st.duelData.tH; } 
    else { st.hexTarget = [1,2,3].map(()=>Math.floor(rng()*256).toString(16).padStart(2,'0').toUpperCase()).join(''); }
    st.targetRgb = hexToRgb(st.hexTarget); st.renderedTargetCss = `#${st.hexTarget}`;
    st.hexGuesses = []; st.hexCurrentGuess = "";
    document.getElementById('target-color').style.background = st.renderedTargetCss;
    renderHexdle();
}

function renderHexdle() {
    const board = document.getElementById('hexdle-board'); board.innerHTML = '';
    for(let i=0; i<6; i++) {
        const row = document.createElement('div'); row.className = 'hexdle-row';
        const guess = i < st.hexGuesses.length ? st.hexGuesses[i] : i === st.hexGuesses.length ? st.hexCurrentGuess : "";
        const isSubmitted = i < st.hexGuesses.length;
        let feedback = ['','','','','',''];
        if (isSubmitted) {
            let tArr = st.hexTarget.split(''); let gArr = guess.split('');
            for(let j=0; j<6; j++) { if(gArr[j] === tArr[j]) { feedback[j] = 'hx-green'; tArr[j] = null; gArr[j] = null; } }
            for(let j=0; j<6; j++) {
                if(gArr[j] !== null && tArr.includes(gArr[j])) { feedback[j] = 'hx-yellow'; tArr[tArr.indexOf(gArr[j])] = null; } 
                else if (gArr[j] !== null) { feedback[j] = 'hx-gray'; }
            }
            for(let j=0; j<6; j++) {
                const keyEl = document.getElementById('hk-' + guess[j]);
                if(feedback[j] === 'hx-green') { keyEl.classList.remove('hx-yellow'); keyEl.classList.add('hx-green'); }
                else if(feedback[j] === 'hx-yellow' && !keyEl.classList.contains('hx-green')) { keyEl.classList.add('hx-yellow'); }
                else if(feedback[j] === 'hx-gray' && !keyEl.classList.contains('hx-green') && !keyEl.classList.contains('hx-yellow')) { keyEl.classList.add('hx-gray'); }
            }
        }
        for(let j=0; j<6; j++) {
            const cell = document.createElement('div'); cell.className = `hexdle-cell ${feedback[j]}`; cell.textContent = guess[j] || "";
            if(isSubmitted) cell.style.color = '#fff'; row.appendChild(cell);
        }
        board.appendChild(row);
    }
}

function handleHexKey(key) {
    if (st.type !== 'hexdle' || !document.getElementById('game-area').classList.contains('active')) return;
    key = key.toUpperCase();
    if (key === 'BACKSPACE' || key === 'DEL' || key === 'DELETE') { st.hexCurrentGuess = st.hexCurrentGuess.slice(0, -1); } 
    else if (key === 'ENTER' || key === 'ENT') {
        if (st.hexCurrentGuess.length === 6) {
            st.hexGuesses.push(st.hexCurrentGuess);
            if (st.hexCurrentGuess === st.hexTarget || st.hexGuesses.length === 6) { 
                const lastGuess = st.hexGuesses[st.hexGuesses.length - 1];
                st.currentRgb = hexToRgb(lastGuess);
                st.renderedUserCss = `#${lastGuess}`;
                lockIn(); 
            } else { st.hexCurrentGuess = ""; renderHexdle(); }
        }
    } else if (/^[0-9A-F]$/.test(key) && st.hexCurrentGuess.length < 6) { st.hexCurrentGuess += key; }
    renderHexdle();
};

window.addEventListener('keydown', (e) => { if(e.ctrlKey || e.metaKey || e.altKey) return; handleHexKey(e.key); });

// --- HAYSTACK ENGINE ---
function initHaystack() {
    const rng = (st.isDaily || st.isDuel) ? getDailyRNG(st.dailyChallengeId + st.rushStreak + st.haystackCorrect + (st.isDuel ? st.duelData.tSeed : st.gameSeed)) : () => Math.random();
    st.haystackLevel = st.haystackCorrect;
    const gridEl = document.getElementById('haystack-grid');
    
    let size = Math.min(10, 2 + Math.floor(st.haystackLevel / 3));
    let diff = Math.max(25, 70 - (st.haystackLevel * 4)); 
    
    gridEl.style.gridTemplateColumns = `repeat(${size}, 1fr)`; gridEl.style.gridTemplateRows = `repeat(${size}, 1fr)`;
    gridEl.innerHTML = '';
    
    const r = Math.floor(rng() * 200) + 20; const g = Math.floor(rng() * 200) + 20; const b = Math.floor(rng() * 200) + 20;
    const tIdx = Math.floor(rng() * (size * size));
    const cChan = Math.floor(rng() * 3);
    const dr = cChan===0 ? (rng()>0.5?diff:-diff) : 0; const dg = cChan===1 ? (rng()>0.5?diff:-diff) : 0; const db = cChan===2 ? (rng()>0.5?diff:-diff) : 0;
    
    for(let i=0; i<size*size; i++) {
        const cell = document.createElement('div'); cell.className = 'haystack-cell';
        if(i === tIdx) {
            cell.style.background = `rgb(${r+dr}, ${g+dg}, ${b+db})`;
            cell.onclick = () => {
                st.haystackCorrect++; st.timeRemaining += 2;
                if(st.isRush) { st.rushStreak++; document.getElementById('rush-streak').textContent = st.rushStreak; }
                initHaystack();
            };
        } else {
            cell.style.background = `rgb(${r}, ${g}, ${b})`;
            cell.onclick = () => { st.timeRemaining -= 5; document.getElementById('timer').textContent = st.timeRemaining.toString().padStart(2, '0'); if (st.timeRemaining <= 0) lockIn(); };
        }
        gridEl.appendChild(cell);
    }
}

// --- COLOR SORT ENGINE ---
function generateSortGradient(c1, c2, steps) {
    let arr = [];
    for(let i=0; i<steps; i++) {
        let r = Math.round(c1.r + (c2.r - c1.r) * (i / (steps-1)));
        let g = Math.round(c1.g + (c2.g - c1.g) * (i / (steps-1)));
        let b = Math.round(c1.b + (c2.b - c1.b) * (i / (steps-1)));
        arr.push({r, g, b});
    } return arr;
}

function handleSortClick(idx) {
    if (st.type !== 'sort' || !document.getElementById('game-area').classList.contains('active')) return;
    if (st.sortSelectedIdx === -1) { st.sortSelectedIdx = idx; } 
    else { const temp = st.sortCurrent[idx]; st.sortCurrent[idx] = st.sortCurrent[st.sortSelectedIdx]; st.sortCurrent[st.sortSelectedIdx] = temp; st.sortSelectedIdx = -1; }
    renderSortGrid();
}

function renderSortGrid() {
    const grid = document.getElementById('sort-grid'); grid.innerHTML = '';
    st.sortCurrent.forEach((rgb, i) => {
        const block = document.createElement('div'); block.className = 'sort-block' + (st.sortSelectedIdx === i ? ' selected' : '');
        block.style.background = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
        if (i !== 0 && i !== 7) { block.onclick = () => handleSortClick(i); } 
        else { block.innerHTML = '<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;opacity:0.3;font-size:0.6rem;">🔒</div>'; block.style.cursor = 'not-allowed'; }
        grid.appendChild(block);
    });
}

// --- SPECTRUM MAP ENGINE ---
function drawSpectrum() {
    const ctx = document.getElementById('spectrum-map').getContext('2d'); const w=ctx.canvas.width=ctx.canvas.clientWidth; const h=ctx.canvas.height=ctx.canvas.clientHeight;
    const gs=Math.floor(w*0.1); let grd=ctx.createLinearGradient(0,0,0,h); grd.addColorStop(0,'#fff'); grd.addColorStop(1,'#000'); ctx.fillStyle=grd; ctx.fillRect(0,0,gs,h);
    for(let x=gs;x<w;x++){ let g=ctx.createLinearGradient(0,0,0,h); g.addColorStop(0,'#fff'); g.addColorStop(0.5,`hsl(${((x-gs)/(w-gs))*360},100%,50%)`); g.addColorStop(1,'#000'); ctx.fillStyle=g; ctx.fillRect(x,0,1,h); }
}

function handleMap(e) {
    const sMap = document.getElementById('spectrum-map');
    const r=sMap.getBoundingClientRect(); const x=Math.max(0,Math.min(e.clientX-r.left,r.width)); const y=Math.max(0,Math.min(e.clientY-r.top,r.height));
    document.getElementById('selector-dot').style.cssText=`display:block; left:${x}px; top:${y}px;`;
    const d=sMap.getContext('2d').getImageData(x*(sMap.width/r.width),y*(sMap.height/r.height),1,1).data;
    st.currentRgb={r:d[0],g:d[1],b:d[2]}; st.renderedUserCss = `rgb(${d[0]},${d[1]},${d[2]})`; renderBoxes();
}
document.getElementById('spectrum-map').addEventListener('mousedown', handleMap); 
document.getElementById('spectrum-map').addEventListener('mousemove', e => { if(e.buttons===1) handleMap(e); });
