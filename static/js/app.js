const data1k = [
    { model: 'Sen-FC 0.8B', single: 93.58, noasst: 93.0, full: 94.75, senlm: false },
    { model:'Sen-FC 4B',   single:81.23, noasst:9.73,  full:90.08, senlm:false },
    { model:'GPT 4.1',    single:65.08, noasst:72.00, full:null,   senlm:false }
];

const data6k = [
    { model: 'Sen-FC 0.8B', overall: 92.5, tool: 89.96, nocall: 95.03, arg: 48.86, senlm: false },
    { model:'Sen-FC 4B',   overall:91.94, tool:87.32, nocall:96.55, arg:56.04, senlm:false },
    { model:'GPT-4.1',    overall:93.46, tool:89.64, nocall:97.28, arg:44.47, senlm:false }
];

const dataGlob = [
    { model: 'Sen-FC 0.8B', overall: 94.08, tool: 96.73, nocall: 76.74, arg: 46.91, senlm: false },
    { model:'Sen-FC 4B',   overall:90.38, tool:90.19, nocall:91.63, arg:57.78, senlm:false },
    { model:'GPT-4.1',    overall:86.74, tool:89.41, nocall:69.30, arg:51.10, senlm:false }
];



 const data_12k_vi = [
      { model: 'Sen-FC 0.8B', overall: 97.3, tool: 97.72, nocall: 78.6, arg: 50.52, senlm: false }
  ];  // 12428 samples from _12k_vi_global_labeled_2502

  const data_13k5_en = [
      { model: 'Sen-FC 0.8B', overall: 97.92, tool: 98.25, nocall: 77.21, arg: 42.4, senlm: false }
  ];  // 13490 samples from _13k5_en_global_labeled

function fmt(v, bestVals, secondVals) {
    if (v === null || v === undefined) return '<span class="val-dash">—</span>';
    const pct = v.toFixed(2) + '%';
    let cls = 'val';
    const vr = Math.round(v * 100);
    if (bestVals.has(vr))   cls += ' best';
    else if (secondVals.has(vr)) cls += ' second';
    return `<span class="${cls}">${pct}</span>`;
}

function getBestSecond(rows, key) {
    const vals   = rows.map(r => r[key]).filter(v => v != null);
    const sorted = [...new Set(vals)].sort((a, b) => b - a);
    return {
        best:   new Set([Math.round((sorted[0] || 0) * 100)]),
        second: new Set(sorted.length > 1 ? [Math.round((sorted[1] || 0) * 100)] : [])
    };
}

let sort1kState   = { key: 'single',  dir: 'desc' };
let sort6kState   = { key: 'overall', dir: 'desc' };
let sortGlobState = { key: 'overall', dir: 'desc' };

function sort1k(k) {
    sort1kState.key === k
        ? sort1kState.dir = sort1kState.dir === 'desc' ? 'asc' : 'desc'
        : (sort1kState.key = k, sort1kState.dir = 'desc');
    render1k();
}
function sort6k(k) {
    sort6kState.key === k
        ? sort6kState.dir = sort6kState.dir === 'desc' ? 'asc' : 'desc'
        : (sort6kState.key = k, sort6kState.dir = 'desc');
    render6k();
}
function sortGlob(k) {
    sortGlobState.key === k
        ? sortGlobState.dir = sortGlobState.dir === 'desc' ? 'asc' : 'desc'
        : (sortGlobState.key = k, sortGlobState.dir = 'desc');
    renderGlob();
}

function getRankBadge(rank) {
    if (rank === 1) {
        return `<span class="rank-badge rank-1">1</span>`;
    } else if (rank === 2) {
        return `<span class="rank-badge rank-2">2</span>`;
    } else if (rank === 3) {
        return `<span class="rank-badge rank-3">3</span>`;
    } else {
        // For 4th place and below, use a subtle gray badge
        return `<span class="rank-badge rank-other">${rank}</span>`;
    }
}

function renderRows(data, state, keys, tbodyId) {
    const bests  = keys.map(k => getBestSecond(data, k));
    
    // Sort data based on current state
    const sorted = [...data].sort((a, b) => {
        const av = a[state.key], bv = b[state.key];
        if (av == null) return  1;
        if (bv == null) return -1;
        return state.dir === 'desc' ? bv - av : av - bv;
    });

    document.getElementById(tbodyId).innerHTML = sorted.map((r, i) => {
        const rank = i + 1; // Rank is 1-based index
        const mcls    = r.senlm ? 'td-model senlm' : 'td-model';
        
        // Get the appropriate badge for this rank
        const rankBadge = getRankBadge(rank);
        
        return `<tr>
            <td><div class="${mcls}">${rankBadge}${r.model}</div></td>
            ${keys.map((k, ki) => `<td>${fmt(r[k], bests[ki].best, bests[ki].second)}</td>`).join('')}
        </tr>`;
    }).join('');
}

function render1k()   { renderRows(data1k,   sort1kState,   ['single','noasst','full'],           'table1k-body'); }
function render6k()   { renderRows(data6k,   sort6kState,   ['overall','tool','nocall','arg'],     'table6k-body'); }
function renderGlob() { renderRows(dataGlob, sortGlobState, ['overall','tool','nocall','arg'],     'tableglob-body'); }

function switchTab(id) {
    document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.getElementById('tab-' + id).classList.add('active');
    event.target.classList.add('active');
}

render1k(); render6k(); renderGlob();

// ══════════════════════════════════════════
// THEME TOGGLE LOGIC
// ══════════════════════════════════════════
const toggleBtn = document.getElementById('theme-toggle');
const sunIcon = document.querySelector('.sun-icon');
const moonIcon = document.querySelector('.moon-icon');
const htmlEl = document.documentElement;

// Check local storage or system preference
const savedTheme = localStorage.getItem('theme');
const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

if (savedTheme === 'light') {
    setTheme('light');
} else if (savedTheme === 'dark') {
    setTheme('dark');
} else if (systemPrefersDark) {
    setTheme('dark');
} else {
    setTheme('light'); // Default to light if no preference
}

function setTheme(theme) {
    htmlEl.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    
    if (theme === 'light') {
        sunIcon.style.display = 'none';
        moonIcon.style.display = 'block';
    } else {
        sunIcon.style.display = 'block';
        moonIcon.style.display = 'none';
    }
}

toggleBtn.addEventListener('click', () => {
    const currentTheme = htmlEl.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
});