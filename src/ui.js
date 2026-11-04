(() => {
  'use strict';
  const G = window.StatGuide;
  const tabNames = ['select','table','assumptions','about'];
  const assumptionTopics = ['groups','paired','model','ranks','association','other'];
  const $ = id => document.getElementById(id);
  const h = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const svg = (paths, cls='') => `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths}</svg>`;
  const icons = {
    compare: svg('<path d="M5 19V9m7 10V5m7 14V11M3 21h18"/><path d="M3 6h4m3-4h4m3 6h4"/>'),
    association: svg('<path d="M3 3v18h18M6 16 19 5"/><circle cx="7" cy="12" r="1.4"/><circle cx="13" cy="12" r="1.4"/><circle cx="17" cy="9" r="1.4"/>'),
    adjust: svg('<path d="M4 6h16M4 12h16M4 18h16"/><circle cx="9" cy="6" r="2" fill="currentColor" stroke="none"/><circle cx="16" cy="12" r="2" fill="currentColor" stroke="none"/><circle cx="7" cy="18" r="2" fill="currentColor" stroke="none"/>'),
    survival: svg('<path d="M3 3v18h18M4 6h5v4h5v4h6v4"/>'),
    diagnostic: svg('<path d="M3 3v18h18M4 20C4 9 9 4 20 4"/><path d="m5 19 2-2m2-2 2-2m2-2 2-2m2-2 2-2" stroke-opacity=".4"/>'),
    check: svg('<rect x="4" y="3" width="16" height="18" rx="3"/><path d="m8 11 2 2 6-6M8 17h8"/>'),
    copy: svg('<rect x="8" y="8" width="12" height="13" rx="2"/><path d="M16 8V4a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h3"/>'),
    print: svg('<path d="M7 8V3h10v5M7 17H4V9h16v8h-3M7 13h10v8H7zM17 11h.01"/>'),
    arrow: svg('<path d="M5 12h14m-5-5 5 5-5 5"/>')
  };
  let state = {}, editingKey = null, currentTab = 'select', currentResult = null, filter = 'all', query = '', toastTimer;
  const sourceMap = new Map(G.sources.map(s => [s.id,s]));
  const goals = new Map(G.goals.map(g => [g.id,g]));
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

  function toast(text) {
    clearTimeout(toastTimer);
    $('status').textContent = text;
    $('status').classList.add('show');
    toastTimer = setTimeout(() => $('status').classList.remove('show'), 3300);
  }

  function renderGoals() {
    $('goals').innerHTML = G.goals.map(g => `<button type="button" class="goal-card${state.goal===g.id?' selected':''}" data-goal="${h(g.id)}" aria-pressed="${state.goal===g.id}"><span class="goal-icon">${icons[g.id]||icons.compare}</span><span class="selection-dot" aria-hidden="true"></span><span class="goal-title">${h(g.label)}</span><span class="goal-detail">${h(g.detail)}</span></button>`).join('');
    $('reset').hidden = !state.goal;
  }

  function selectedOption(q) { return q.options.find(o => o.value===state[q.key]); }

  function renderQuestions() {
    if (!state.goal) {
      $('questions').innerHTML = '<section class="welcome"><h2>統計手法の一覧から、<br>自分のデータに合う候補へ。</h2><p>上の5つの目的から選んでください。<br>具体例から試すこともできます。</p><div class="welcome-flow" aria-hidden="true"><span><b>1</b>目的</span><i></i><span><b>2</b>データの形</span><i></i><span><b>3</b>候補を確認</span></div></section>';
      return;
    }
    const qs = G.questionsFor(state);
    let canShow = true;
    $('questions').innerHTML = qs.map((q,i) => {
      if(!canShow) return '';
      const selected = selectedOption(q);
      if(selected && editingKey!==q.key) return `<button type="button" class="answered" data-edit="${h(q.key)}" aria-label="${h(q.title)}：${h(selected.label)}。変更する"><span class="step-number">${String(i+2).padStart(2,'0')}</span><span class="answer-copy"><small>${h(q.title)}</small><strong>${h(selected.label)}</strong></span><span class="change-label">変更</span></button>`;
      if(!selected) canShow = false;
      return `<fieldset class="question" id="question-${h(q.key)}"><legend><span class="step-number">${String(i+2).padStart(2,'0')}</span><span>${h(q.title)}</span></legend><p class="question-help">${h(q.help)}</p><div class="options">${q.options.map(o => `<label class="option${state[q.key]===o.value?' selected':''}"><input type="radio" name="${h(q.key)}" data-key="${h(q.key)}" value="${h(o.value)}" ${state[q.key]===o.value?'checked':''}><span class="radio-mark" aria-hidden="true"></span><span class="option-text"><span class="option-title">${h(o.label)}</span>${o.detail?`<span class="option-detail">${h(o.detail)}</span>`:''}</span></label>`).join('')}</div></fieldset>`;
    }).join('');
  }

  const emptyArt = '<svg class="empty-art" viewBox="0 0 210 90" fill="none" aria-hidden="true"><path d="M31 45h45m0 0V19h31m-31 26v26h31m31-52h28m-28 52h28" stroke="currentColor" stroke-width="1.2"/><rect x="8" y="31" width="31" height="28" rx="7" fill="#e0e9db" stroke="#b5c8af"/><path d="M17 40h13m-13 5h8m-8 5h10" stroke="#7d9a79" stroke-width="1.2"/><rect x="107" y="6" width="32" height="26" rx="7" fill="#f7f9f4" stroke="#b5c8af"/><rect x="107" y="58" width="32" height="26" rx="7" fill="#f7f9f4" stroke="#b5c8af"/><circle cx="180" cy="19" r="13" fill="#dbe8cf" stroke="#b5c8af"/><path d="m174 19 4 4 8-8" stroke="#6c9168" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><circle cx="180" cy="71" r="13" fill="#eff3e9" stroke="#c0ceba"/><path d="M115 19h16m-16 52h16" stroke="#adc0a4" stroke-width="1.2"/></svg>';

  function detail(label, content, open=false) { return `<details class="detail-block"${open?' open':''}><summary>${h(label)}</summary><div class="detail-content">${content}</div></details>`; }

  function renderResult() {
    currentResult = G.resolve(state);
    $('mobile-result').hidden = !currentResult;
    if(!currentResult) {
      const qs = state.goal ? G.questionsFor(state) : [];
      const next = qs.find(q => !selectedOption(q));
      $('result').innerHTML = `<div class="empty-result"><div class="empty-content">${emptyArt}<h2>${state.goal?'あと少し、条件を教えてください。':'ここに手法の候補が表示されます。'}</h2><p>${next?`${h(next.title)}<br>選択に合わせて、次の質問が表示されます。`:'候補だけでなく、選ぶ理由と<br>確認することも一緒に。'}</p></div></div>`;
      return;
    }
    const r = currentResult;
    const sources = (r.sources||[]).map(id=>sourceMap.get(id)).filter(Boolean);
    const candidateHtml = r.candidates?.length ? `<div class="candidate-list">${r.candidates.map(c=>`<div class="candidate"><strong>${h(c.title)}</strong><p>${h(c.text)}</p></div>`).join('')}</div>` : '';
    const advanced = (r.details||[]).map(d=>`<strong>${h(d.label)}</strong><p>${h(d.text)}</p>`).join('');
    $('result').innerHTML = `<article class="result-card" id="result-card"><div class="result-top"><p class="result-kicker"><span aria-hidden="true"></span>この条件での候補</p><h2 class="result-title">${h(r.title)}</h2>${r.english?`<p class="result-english">${h(r.english)}</p>`:''}<p class="result-reason">${h(r.reason)}</p>${candidateHtml}</div><div class="result-body"><h3 class="result-label">${icons.check}確認すること</h3><ol class="check-list">${r.checks.map((c,i)=>`<li><span class="check-number" aria-hidden="true">${String(i+1).padStart(2,'0')}</span><div class="check-text"><strong>${h(c.label)}</strong><p>${h(c.text)}</p></div></li>`).join('')}</ol><div class="report-block"><strong>結果に添える指標</strong><p>${h(r.report)}</p></div>${detail('症例数の考え方',`<p>${h(r.sample)}</p>`)}${r.alternative?detail('条件によっては',`<strong>${h(r.alternative.title)}</strong><p>${h(r.alternative.text)}</p>`):''}${advanced?detail('もう少し詳しく',advanced):''}${sources.length?detail('根拠を読む',`<ul class="result-sources">${sources.map(s=>`<li><a href="${h(s.url)}" target="_blank" rel="noopener noreferrer">${h(s.title)} ↗</a></li>`).join('')}</ul>`):''}<div class="result-actions"><button type="button" class="button" id="copy-result">${icons.copy}結果をコピー</button><button type="button" class="button button-quiet" id="print-result">${icons.print}印刷する</button></div></div></article>`;
    $('result').querySelector('.check-list').insertAdjacentHTML('afterend', `<button type="button" class="result-help" data-help="${assumptionTopic(state)}">${icons.check}<span>分布や前提の確認方法を見る</span>${icons.arrow}</button>`);
  }

  function renderGuide() { renderGoals(); renderQuestions(); renderResult(); }

  function assumptionTopic(s) {
    if(s.goal==='association') return 'association';
    if(s.goal==='adjust') return s.outcome==='continuous' ? 'model' : 'other';
    if(s.goal!=='compare') return 'other';
    if(s.data==='binary'||s.data==='nominal') return 'other';
    if(s.design==='mixed') return s.data==='continuous' ? 'model' : 'other';
    if(s.data==='ordinal'||s.aim==='rank') return 'ranks';
    if(s.design==='pair2') return 'paired';
    if(s.design==='pairmany') return 'model';
    return 'groups';
  }

  function openAssumptions(topic='',update=true) {
    changeTab('assumptions',false);
    const validTopic=assumptionTopics.includes(topic) ? topic : '';
    if(update) {try{history.replaceState(null,'','#assumptions'+(validTopic?'/'+validTopic:''));}catch{}}
    const target=validTopic ? $('assumption-'+validTopic) : null;
    if(target) {
      const disclosure=target.closest('details');if(disclosure)disclosure.open=true;
      target.classList.add('help-highlight');
      target.scrollIntoView({behavior:reduceMotion?'auto':'smooth',block:'start'});
      target.focus({preventScroll:true});
    } else window.scrollTo({top:0,behavior:reduceMotion?'auto':'smooth'});
  }

  function returnToGuide() {
    changeTab('select',false);
    try{history.replaceState(null,'','#select');}catch{}
    const target=currentResult ? $('result-card') : $('goal-heading');
    if(target){target.tabIndex=-1;target.scrollIntoView({behavior:reduceMotion?'auto':'smooth',block:'start'});target.focus({preventScroll:true});}
  }

  function routeFromHash() {
    const [name,topic]=location.hash.slice(1).split('/');
    if(!tabNames.includes(name))return;
    if(name==='assumptions')openAssumptions(topic,false);else changeTab(name,false);
  }

  function applyAnswer(key,value) {
    const qs = G.questionsFor(state), idx = qs.findIndex(q=>q.key===key);
    if(idx<0 || !qs[idx].options.some(o=>o.value===value)) return;
    const next = {goal:state.goal};
    for(let i=0;i<idx;i++) if(state[qs[i].key]!==undefined) next[qs[i].key]=state[qs[i].key];
    next[key]=value;
    state=next; editingKey=null;
    renderGuide();
    const following = $('questions').querySelector('.question');
    if(following) {
      const first = following.querySelector('input');
      if(first) first.focus({preventScroll:true});
      if(innerWidth<=800) following.scrollIntoView({behavior:reduceMotion?'auto':'smooth',block:'start'});
    } else {
      const answer = $('questions').querySelector(`[data-edit="${key}"]`);
      if(answer) answer.focus({preventScroll:true});
      if(currentResult && innerWidth<=800) $('result-card').scrollIntoView({behavior:reduceMotion?'auto':'smooth',block:'start'});
    }
  }

  function normalizePreset(raw) {
    if(!raw || !goals.has(raw.goal)) return {};
    const clean = {goal:raw.goal};
    for(let i=0;i<5;i++) {
      let changed=false;
      for(const q of G.questionsFor(clean)) {
        if(q.options.some(o=>o.value===raw[q.key])) {if(clean[q.key]!==raw[q.key])changed=true; clean[q.key]=raw[q.key];}
        else break;
      }
      if(!changed) break;
    }
    return clean;
  }

  function usePreset(raw) {
    state=normalizePreset(raw); editingKey=null;
    changeTab('select',false); renderGuide();
    try{history.replaceState(null,'','#select');}catch{}
    if(innerWidth<=800 && currentResult) $('result-card').scrollIntoView({behavior:reduceMotion?'auto':'smooth',block:'start'});
    else $('goal-heading').scrollIntoView({behavior:reduceMotion?'auto':'smooth',block:'start'});
  }

  function changeTab(tab,update=true) {
    if(!tabNames.includes(tab)) return;
    currentTab=tab;
    for(const name of tabNames) {
      $('panel-'+name).hidden=name!==tab;
      $('tab-'+name).classList.toggle('active',name===tab);
      $('tab-'+name).setAttribute('aria-selected',String(name===tab));
      $('tab-'+name).tabIndex=name===tab?0:-1;
    }
    if(tab==='table') renderTable();
    if(tab==='assumptions') {
      $('assumption-context').hidden=!currentResult;
      $('assumption-context').textContent=currentResult ? '選択中の候補：'+currentResult.title : '';
      $('panel-assumptions').querySelectorAll('.help-highlight').forEach(el=>el.classList.remove('help-highlight'));
    }
    if(update) {try{history.replaceState(null,'','#'+tab);}catch{} window.scrollTo({top:0,behavior:reduceMotion?'auto':'smooth'});}
  }

  function renderTable() {
    const filters=[{id:'all',label:'すべて'},{id:'compare',label:'群・前後の差'},{id:'association',label:'関連'},{id:'adjust',label:'調整'},{id:'survival',label:'生存時間'},{id:'diagnostic',label:'判別能'}];
    $('table-filters').innerHTML=filters.map(f=>`<button type="button" class="filter${filter===f.id?' active':''}" aria-pressed="${filter===f.id}" data-filter="${f.id}">${f.label}</button>`).join('');
    const term=query.trim().toLocaleLowerCase();
    const items=G.quickRows.map((r,i)=>({r,i})).filter(({r})=>(filter==='all'||r.state.goal===filter)&&(!term||[r.method,r.purpose,r.setting,r.check].join(' ').toLocaleLowerCase().includes(term)));
    $('table-caption').textContent=`${items.length}件の手法・選択肢`;
    $('quick-rows').innerHTML=items.length?items.map(({r,i})=>`<tr><td>${h(r.purpose)}</td><td>${h(r.setting)}</td><td>${h(r.method)}</td><td>${h(r.check)}</td><td><button type="button" class="table-detail" data-preset="${i}" aria-label="${h(r.method)}を詳しく見る">詳しく →</button></td></tr>`).join(''):'<tr><td class="no-results" colspan="5">該当する項目がありません。別の言葉で検索してください。</td></tr>';
  }

  function renderStatic() {
    $('examples').innerHTML=G.examples.map((e,i)=>`<button type="button" class="example-chip" data-example="${i}">${h(e.label)}${icons.arrow}</button>`).join('');
    $('all-sources').innerHTML=G.sources.map((s,i)=>`<div class="source-item"><span class="source-index">${String(i+1).padStart(2,'0')}</span><a href="${h(s.url)}" target="_blank" rel="noopener noreferrer">${h(s.title)} ↗</a>${s.note?`<p>${h(s.note)}</p>`:''}</div>`).join('');
  }

  function resultText() {
    if(!currentResult) return '';
    const r=currentResult;
    const conditions=[goals.get(state.goal)?.label,...G.questionsFor(state).map(q=>selectedOption(q)?.label)].filter(Boolean);
    const lines=['統計手法ナビ',conditions.join(' / '),'',`候補：${r.title}`,r.reason,''];
    if(r.candidates?.length){for(const c of r.candidates)lines.push(`${c.title}：${c.text}`);lines.push('');}
    lines.push('確認すること');
    r.checks.forEach((c,i)=>lines.push(`${i+1}. ${c.label}：${c.text}`));
    lines.push('',`結果に添える指標：${r.report}`,'',`症例数の考え方：${r.sample}`);
    if(r.alternative)lines.push('',`条件によっては：${r.alternative.title}`,r.alternative.text);
    for(const d of r.details||[])lines.push('',`${d.label}：${d.text}`);
    lines.push('','参考資料');
    for(const id of r.sources||[]){const s=sourceMap.get(id);if(s)lines.push(`${s.title}\n${s.url}`);}
    return lines.join('\n');
  }

  async function copyResult() {
    const text=resultText(); if(!text)return;
    try{await navigator.clipboard.writeText(text);toast('候補・確認事項・出典をコピーしました。');}
    catch{
      const area=document.createElement('textarea');area.value=text;area.style.cssText='position:fixed;left:-9999px;top:0';document.body.append(area);area.select();
      const ok=document.execCommand('copy');area.remove();toast(ok?'候補・確認事項・出典をコピーしました。':'コピーできませんでした。印刷する機能もご利用いただけます。');
    }
  }

  async function downloadApp() {
    let html;
    try{
      if(location.protocol==='file:')throw new Error('local');
      const response=await fetch(location.href.split('#')[0],{credentials:'same-origin'});
      if(!response.ok)throw new Error('fetch');
      html=await response.text();
      if(!html.includes('window.StatGuide'))throw new Error('unexpected content');
    }catch{
      const copy=document.documentElement.cloneNode(true);
      for(const panel of copy.querySelectorAll('[role="tabpanel"]'))panel.hidden=panel.id!=='panel-select';
      for(const button of copy.querySelectorAll('[data-tab]')){
        const selected=button.dataset.tab==='select';
        button.classList.toggle('active',selected);button.setAttribute('aria-selected',String(selected));button.tabIndex=selected?0:-1;
      }
      html='<!doctype html>\n'+copy.outerHTML;
    }
    const blob=new Blob([html],{type:'text/html;charset=utf-8'}),url=URL.createObjectURL(blob),a=document.createElement('a');
    a.href=url;a.download='statistics-method-guide.html';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
    toast('HTMLファイルの保存を開始しました。');
  }

  document.addEventListener('click',event=>{
    const t=event.target instanceof Element?event.target:null;if(!t)return;
    const goal=t.closest('[data-goal]');if(goal){state={goal:goal.dataset.goal};editingKey=null;renderGuide();if(innerWidth<=800)$('questions').scrollIntoView({behavior:reduceMotion?'auto':'smooth',block:'start'});return;}
    const help=t.closest('[data-help]');if(help){openAssumptions(help.dataset.help);return;}
    if(t.closest('[data-return-to-guide]')){returnToGuide();return;}
    const tab=t.closest('[data-tab]');if(tab){changeTab(tab.dataset.tab);return;}
    const edit=t.closest('[data-edit]');if(edit){editingKey=edit.dataset.edit;renderQuestions();const input=$('questions').querySelector(`input[name="${editingKey}"]:checked`)||$('questions').querySelector(`input[name="${editingKey}"]`);input?.focus({preventScroll:true});return;}
    const ex=t.closest('[data-example]');if(ex){usePreset(G.examples[Number(ex.dataset.example)].state);return;}
    const preset=t.closest('[data-preset]');if(preset){usePreset(G.quickRows[Number(preset.dataset.preset)].state);return;}
    const f=t.closest('[data-filter]');if(f){filter=f.dataset.filter;renderTable();$('table-filters').querySelector(`[data-filter="${filter}"]`)?.focus({preventScroll:true});return;}
    if(t.closest('#copy-result')){copyResult();return;}
    if(t.closest('#print-result')){window.print();return;}
    if(t.closest('#download-app')){downloadApp();return;}
    if(t.closest('#reset')){state={};editingKey=null;renderGuide();$('goal-heading').scrollIntoView({behavior:reduceMotion?'auto':'smooth',block:'start'});return;}
    if(t.closest('#mobile-result')){$('result-card')?.scrollIntoView({behavior:reduceMotion?'auto':'smooth',block:'start'});return;}
    if(t.closest('.brand')){event.preventDefault();changeTab('select');return;}
  });
  document.addEventListener('change',event=>{const t=event.target;if(t instanceof HTMLInputElement&&t.matches('input[data-key]'))applyAnswer(t.dataset.key,t.value);});
  $('table-search').addEventListener('input',event=>{query=event.target.value;renderTable();});
  document.querySelector('.tabs').addEventListener('keydown',event=>{
    let index=tabNames.indexOf(currentTab);
    if(event.key==='ArrowRight')index=(index+1)%tabNames.length;else if(event.key==='ArrowLeft')index=(index+tabNames.length-1)%tabNames.length;else if(event.key==='Home')index=0;else if(event.key==='End')index=tabNames.length-1;else return;
    event.preventDefault();changeTab(tabNames[index]);$('tab-'+tabNames[index]).focus();
  });
  window.addEventListener('hashchange',routeFromHash);
  let printDetails=[];
  window.addEventListener('beforeprint',()=>{
    printDetails=Array.from($('panel-'+currentTab).querySelectorAll('details')).map(el=>({el,open:el.open}));
    for(const item of printDetails)item.el.open=true;
  });
  window.addEventListener('afterprint',()=>{for(const item of printDetails)item.el.open=item.open;printDetails=[];});
  renderStatic();renderGuide();
  routeFromHash();
  window.StatApp={getState:()=>({...state}),getResult:()=>currentResult,resultText,normalizePreset};
})();
