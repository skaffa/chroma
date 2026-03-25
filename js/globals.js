const svgs = {
    complementary: `<svg class="icon icon-sm" viewBox="0 0 24 24"><circle cx="8" cy="12" r="5"/><circle cx="16" cy="12" r="5"/></svg>`,
    blind: `<svg class="icon icon-sm" viewBox="0 0 24 24"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>`,
    map: `<svg class="icon icon-sm" viewBox="0 0 24 24"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg>`,
    illusion: `<svg class="icon icon-sm" viewBox="0 0 24 24"><path d="M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z"/><path d="M12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12Z"/><path d="M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"/></svg>`,
    rush: `<svg class="icon icon-sm" viewBox="0 0 24 24"><path d="M12 2c0 0-4 4-4 9a4 4 0 0 0 8 0c0-5-4-9-4-9z"/><path d="M12 12s-1 1-1 2 1 2 1 2 1-1 1-2-1-2-1-2z"/></svg>`,
    duel: `<svg class="icon icon-sm" viewBox="0 0 24 24"><path d="M14.5 17.5L3 6V3h3l11.5 11.5M13 19l6-6M16 16l4 4M19 21l2-2"></path></svg>`,
    gradient: `<svg class="icon icon-sm" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="12" x2="21" y2="12"></line></svg>`,
    terminal: `<svg class="icon icon-sm" viewBox="0 0 24 24"><polyline points="4 17 10 11 4 5"></polyline><line x1="12" y1="19" x2="20" y2="19"></line></svg>`,
    memory: `<svg class="icon icon-sm" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`,
    palette: `<svg class="icon icon-sm" viewBox="0 0 24 24"><path d="M12 2.69l5.66 4.2c3.81 2.83 2.5 8.11-1.66 8.11H8c-4.16 0-5.47-5.28-1.66-8.11z"></path></svg>`,
    wcag: `<svg class="icon icon-sm" viewBox="0 0 24 24"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>`,
    haystack: `<svg class="icon icon-sm" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>`,
    telephone: `<svg class="icon icon-sm" viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>`,
    midpoint: `<svg class="icon icon-sm" viewBox="0 0 24 24"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>`,
    hexdle: `<svg class="icon icon-sm" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>`,
    sort: `<svg class="icon icon-sm" viewBox="0 0 24 24"><path d="M4 15l4 4 4-4M16 9l-4-4-4 4"/></svg>`,
    luminance: `<svg class="icon icon-sm" viewBox="0 0 24 24"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>`,
    darkroom: `<svg class="icon icon-sm" viewBox="0 0 24 24"><path d="M12 2v20M2 12h20M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z"></path></svg>`
};

const typeNames = {
    solid: "Solid Color", luminance: "Luminance Match", hexdle: "Hex-dle", haystack: "Haystack",
    sort: "Color Sort", telephone: "Telephone", midpoint: "Midpoint", gradient: "Gradient Matcher",
    palette: "Palette", studio: "Studio Mode"
};

const spaces = {
    rgb: { s1:{lbl:'R',min:0,max:255,val:128}, s2:{lbl:'G',min:0,max:255,val:128}, s3:{lbl:'B',min:0,max:255,val:128}, fmt:(v)=>`#${v[0].toString(16).padStart(2,'0')}${v[1].toString(16).padStart(2,'0')}${v[2].toString(16).padStart(2,'0')}`.toUpperCase() },
    hsl: { s1:{lbl:'H',min:0,max:360,val:180}, s2:{lbl:'S',min:0,max:100,val:50}, s3:{lbl:'L',min:0,max:100,val:50}, fmt:(v)=>`hsl(${v[0]}, ${v[1]}%, ${v[2]}%)` },
    oklab: { s1:{lbl:'L',min:0,max:100,val:50}, s2:{lbl:'A',min:-100,max:100,val:0}, s3:{lbl:'B',min:-100,max:100,val:0}, fmt:(v)=>`oklab(${v[0]}% ${+(v[1]/100*0.2).toFixed(4)} ${+(v[2]/100*0.2).toFixed(4)})` },
    oklch: { s1:{lbl:'L',min:0,max:100,val:50}, s2:{lbl:'C',min:0,max:100,val:50}, s3:{lbl:'H',min:0,max:360,val:180}, fmt:(v)=>`oklch(${v[0]}% ${+(v[1]/100*0.2).toFixed(4)} ${+(v[2]).toFixed(4)})` },
    cmyk: { s1:{lbl:'C',min:0,max:100,val:0}, s2:{lbl:'M',min:0,max:100,val:0}, s3:{lbl:'Y',min:0,max:100,val:0}, s4:{lbl:'K',min:0,max:100,val:0}, 
        fmt:(v)=>{ let c=v[0]/100, m=v[1]/100, y=v[2]/100, k=v[3]/100; return `rgb(${Math.round(255*(1-c)*(1-k))}, ${Math.round(255*(1-m)*(1-k))}, ${Math.round(255*(1-y)*(1-k))})`; }
    }
};

const defaultCfg = { s: 'rgb', t: 30, o: 'match', p: 'solid', pr: 'analogous', v: 'normal', m: false, h: false, i: false, tm: false, mm: false, dk: false, tr: 10 };

let st = {
    isDaily:false, dailyId:null, isViewingShared:false, suppressSave:false,
    isRush:false, rushStreak:0, isDuel:false, duelData:null, gameSeed: 0,
    spaceId:'rgb', timeLimit:30, timeRemaining:0, timer:null, memoryTimeout:null, memoryHidden:false,
    isComp:false, isWcag:false, isMap:false, isHardcore:false, isIllusion:false, isTerminal:false, isMemory:false, isDarkroom:false,
    type:'solid', palRule:'analogous', vision:'normal', uiTab:0, finalScore:0,
    
    targetColorData: [], userColorData: [], targetCssData: [], userCssData: [],
    userNativeData: [], gradDeg: 180, renderedTargetCss: '', renderedUserCss: '',
    
    parsedGhostLog: [], ghostStart: 0, ghostTimer: null, lastGhostData: null, lastGhostTime: 0,
    haystackLevel: 0, haystackCorrect: 0,
    
    teleRound: 1, teleMax: 10, teleHistory: [],
    hexTarget: "", hexGuesses: [], hexCurrentGuess: "",
    
    sortTarget: [], sortCurrent: [], sortSelectedIdx: -1
};

const hiddenCtx = document.createElement('canvas').getContext('2d', { willReadFrequently: true });
hiddenCtx.canvas.width = 1; hiddenCtx.canvas.height = 1;
