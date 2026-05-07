const data1k = [
    { model:'SenFC 0.8B', single:89.49, noasst:90.76, full:92.41, senlm:false },
    { model:'SenFC 4B',   single:81.23, noasst:9.73,  full:90.08, senlm:false },
    { model:'GPT 4.1',    single:65.08, noasst:72.00, full:null,   senlm:false }
];

const data6k = [
    { model:'SenFC 0.8B', overall:91.43, tool:85.98, nocall:96.86, arg:42.82, senlm:false },
    { model:'SenFC 4B',   overall:91.94, tool:87.32, nocall:96.55, arg:56.04, senlm:false },
    { model:'GPT-4.1',    overall:93.46, tool:89.64, nocall:97.28, arg:44.47, senlm:false }
];

const dataGlob = [
    { model:'SenFC 0.8B', overall:86.68, tool:95.02, nocall:32.09, arg:48.12, senlm:false },
    { model:'SenFC 4B',   overall:90.38, tool:90.19, nocall:91.63, arg:57.78, senlm:false },
    { model:'GPT-4.1',    overall:86.74, tool:89.41, nocall:69.30, arg:51.10, senlm:false }
];

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

function renderRows(data, state, keys, tbodyId) {
    const bests  = keys.map(k => getBestSecond(data, k));
    const sorted = [...data].sort((a, b) => {
        const av = a[state.key], bv = b[state.key];
        if (av == null) return  1;
        if (bv == null) return -1;
        return state.dir === 'desc' ? bv - av : av - bv;
    });

    document.getElementById(tbodyId).innerHTML = sorted.map((r, i) => {
        const mcls    = r.senlm ? 'td-model senlm' : 'td-model';
        const rankBadge = i === 0 ? `<span class="rank-badge">1</span>` : '';
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