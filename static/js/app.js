// Filtered data - only 3 models, no variants
const data1k = [
    { model:'SenFC 0.8B', single:89.49, noasst:90.76, full:92.41, senlm:false },
    { model:'SenFC 4B', single:81.23, noasst:9.73, full:90.08, senlm:false },
    { model:'GPT 4.1', single:65.08, noasst:72.00, full:null, senlm:false }
];

const data6k = [ 
    { model:'SenFC 0.8B', overall:91.43, tool:85.98, nocall:96.86, arg:42.82, senlm:false },
    { model:'SenFC 4B', overall:91.94, tool:87.32, nocall:96.55, arg:56.04, senlm:false },
    { model:'GPT-4.1', overall:93.46, tool:89.64, nocall:97.28, arg:44.47, senlm:false }
];

const dataGlob = [ 
    { model:'SenFC 0.8B', overall:86.68, tool:95.02, nocall:32.09, arg:48.12, senlm:false },
    { model:'SenFC 4B', overall:90.38, tool:90.19, nocall:91.63, arg:57.78, senlm:false },
    { model:'GPT-4.1', overall:86.74, tool:89.41, nocall:69.30, arg:51.10, senlm:false }
];

function fmt(v, bestVals, secondVals){ 
    if(v===null||v===undefined) return '<span class="val-dash">—</span>'; 
    const pct=v.toFixed(2)+'%'; 
    let cls='val'; 
    const vr=Math.round(v*100); 
    if(bestVals.has(vr)) cls+=' best'; 
    else if(secondVals.has(vr)) cls+=' second'; 
    return `<span class="${cls}">${pct}</span>`; 
}

function getBestSecond(rows,key){ 
    const vals=rows.map(r=>r[key]).filter(v=>v!=null); 
    const sorted=[...new Set(vals)].sort((a,b)=>b-a); 
    return {
        best:new Set([Math.round((sorted[0]||0)*100)]), 
        second:new Set(sorted.length > 1 ? [Math.round((sorted[1]||0)*100)] : [])
    }; 
}

// Sorting state (descending by default)
let sort1kState={key:'single',dir:'desc'}, 
    sort6kState={key:'overall',dir:'desc'}, 
    sortGlobState={key:'overall',dir:'desc'};

function sort1k(k){ 
    sort1kState.key===k ? sort1kState.dir=sort1kState.dir==='desc'?'asc':'desc' : (sort1kState.key=k,sort1kState.dir='desc'); 
    render1k(); 
}
function sort6k(k){ 
    sort6kState.key===k ? sort6kState.dir=sort6kState.dir==='desc'?'asc':'desc' : (sort6kState.key=k,sort6kState.dir='desc'); 
    render6k(); 
}
function sortGlob(k){ 
    sortGlobState.key===k ? sortGlobState.dir=sortGlobState.dir==='desc'?'asc':'desc' : (sortGlobState.key=k,sortGlobState.dir='desc'); 
    renderGlob(); 
}

// Render functions - Variant column removed
function render1k(){ 
    const keys=['single','noasst','full']; 
    const bests=keys.map(k=>getBestSecond(data1k,k)); 
    const sorted=[...data1k].sort((a,b)=>{
        const av=a[sort1kState.key], bv=b[sort1kState.key]; 
        if(av==null) return 1; 
        if(bv==null) return -1; 
        return sort1kState.dir==='desc' ? bv-av : av-bv;
    }); 
    document.getElementById('table1k-body').innerHTML=sorted.map(r=>{
        const mcls=r.senlm?'td-model senlm':'td-model'; 
        return `<tr>
            <td class="${mcls}">${r.model}</td>
            ${keys.map((k,i)=>`<td>${fmt(r[k], bests[i].best, bests[i].second)}</td>`).join('')}
        </tr>`;
    }).join('');
}

function render6k(){ 
    const keys=['overall','tool','nocall','arg']; 
    const bests=keys.map(k=>getBestSecond(data6k,k)); 
    const sorted=[...data6k].sort((a,b)=>{
        const av=a[sort6kState.key], bv=b[sort6kState.key]; 
        if(av==null) return 1; 
        if(bv==null) return -1; 
        return sort6kState.dir==='desc' ? bv-av : av-bv;
    }); 
    document.getElementById('table6k-body').innerHTML=sorted.map(r=>{
        const mcls=r.senlm?'td-model senlm':'td-model'; 
        return `<tr>
            <td class="${mcls}">${r.model}</td>
            ${keys.map((k,i)=>`<td>${fmt(r[k], bests[i].best, bests[i].second)}</td>`).join('')}
        </tr>`;
    }).join('');
}

function renderGlob(){ 
    const keys=['overall','tool','nocall','arg']; 
    const bests=keys.map(k=>getBestSecond(dataGlob,k)); 
    const sorted=[...dataGlob].sort((a,b)=>{
        const av=a[sortGlobState.key], bv=b[sortGlobState.key]; 
        if(av==null) return 1; 
        if(bv==null) return -1; 
        return sortGlobState.dir==='desc' ? bv-av : av-bv;
    }); 
    document.getElementById('tableglob-body').innerHTML=sorted.map(r=>{
        const mcls=r.senlm?'td-model senlm':'td-model'; 
        return `<tr>
            <td class="${mcls}">${r.model}</td>
            ${keys.map((k,i)=>`<td>${fmt(r[k], bests[i].best, bests[i].second)}</td>`).join('')}
        </tr>`;
    }).join('');
}

// Chart functions - variant removed from labels
let chartDataset='1k', chartMetric='single';
function getChartData(){ 
    if(chartDataset==='1k') return data1k.filter(r=>r[chartMetric]!=null).map(r=>({
        label:r.model, val:r[chartMetric], senlm:r.senlm
    })); 
    if(chartDataset==='6k') return data6k.filter(r=>r[chartMetric]!=null).map(r=>({
        label:r.model, val:r[chartMetric], senlm:r.senlm
    })); 
    return dataGlob.filter(r=>r[chartMetric]!=null).map(r=>({
        label:r.model, val:r[chartMetric], senlm:r.senlm
    })); 
}

function renderChart(){ 
    const rows=getChartData(); 
    const sorted=[...rows].sort((a,b)=>b.val-a.val); 
    const bestVal=sorted[0]?.val; 
    const container=document.getElementById('bar-chart'); 
    container.innerHTML=sorted.map((r,i)=>{
        const isBest=r.val===bestVal; 
        const fillCls=r.senlm?'bar-fill senlm':isBest?'bar-fill best-bar':'bar-fill'; 
        const labelCls=r.senlm?'bar-label is-senlm':'bar-label'; 
        return `<div class="bar-row" style="animation-delay:${i*30}ms">
            <span class="${labelCls}" title="${r.label}">${r.label}</span>
            <div class="bar-track">
                <div class="${fillCls}" data-pct="${r.val/100}" style="width:0"></div>
            </div>
            <span class="bar-pct">${r.val.toFixed(1)}%</span>
        </div>`;
    }).join(''); 
    requestAnimationFrame(()=>{
        document.querySelectorAll('.bar-fill').forEach(el=>{
            setTimeout(()=>{el.style.width=(parseFloat(el.dataset.pct)*100)+'%';},80);
        });
    });
}

function setChartDataset(ds,metric){
    chartDataset=ds; chartMetric=metric; 
    document.querySelectorAll('#chart-dataset-sel .metric-btn').forEach(b=>b.classList.remove('active')); 
    event.target.classList.add('active'); 
    const labels={
        '1k:single':'Vivi Smart 1k — Single-turn',
        '1k:full':'Vivi Smart 1k — Multi-turn (full history)',
        '6k:overall':'Vivi Smart 6k4 — Overall Tool Selection',
        '6k:arg':'Vivi Smart 6k4 — Argument Accuracy',
        'glob:overall':'Vivi Global 1k6 — Overall Tool Selection',
        'glob:arg':'Vivi Global 1k6 — Argument Accuracy',
    }; 
    document.getElementById('chart-label').textContent=labels[`${ds}:${metric}`]||''; 
    renderChart(); 
}

function switchTab(id){
    document.querySelectorAll('.tab-panel').forEach(p=>p.classList.remove('active')); 
    document.querySelectorAll('.tab-btn').forEach(b=>b.classList.remove('active')); 
    document.getElementById('tab-'+id).classList.add('active'); 
    event.target.classList.add('active'); 
    if(id==='chart') renderChart();
}

// Initial render
render1k(); render6k(); renderGlob();

