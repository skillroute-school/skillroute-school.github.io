/* Skill Route: карточка для сторис, таблица лидеров и дуэли — общий модуль для всех игр */
(function(){
'use strict';
const SB='https://hhqrdyriaochkisegseh.supabase.co/rest/v1/rpc/';
const KEY='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhocXJkeXJpYW9jaGtpc2Vnc2VoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ3ODI1ODMsImV4cCI6MjA5MDM1ODU4M30.SrTyAkWRMWdjecs2JcjooUxfBuWLgc2QyA5bMWtT8Iw';
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
async function rpc(fn,args){try{const r=await fetch(SB+fn,{method:'POST',headers:{apikey:KEY,Authorization:'Bearer '+KEY,'Content-Type':'application/json'},body:JSON.stringify(args)});if(!r.ok)return null;return await r.json();}catch(e){return null;}}
const params=new URLSearchParams(location.search);
const duelId=(params.get('duel')||'').replace(/[^A-Za-z0-9-]/g,'').slice(0,64)||null;
const duelReady=duelId?rpc('get_duel',{p_session:duelId}).then(r=>r&&r[0]?Object.assign({id:duelId},r[0]):null):Promise.resolve(null);
const pageUrl=()=>location.origin+location.pathname;

const THEMES={
  mayor:{bg:['#0b1220','#1b2a4a'],acc:'#ffb547',ink:'#f2f5fa',sub:'#9fb0c8',font:'"Golos Text",system-ui,sans-serif',disp:'"Golos Text",system-ui,sans-serif',dark:1},
  roads:{bg:['#8fd3ff','#dff1ff'],acc:'#ffd21f',ink:'#1e1b33',sub:'#3f3c58',font:'"Golos Text",system-ui,sans-serif',disp:'Rubik,"Arial Black",sans-serif'},
  design:{bg:['#16161a','#2a2440'],acc:'#6d4aff',ink:'#ffffff',sub:'#b5b5c4',font:'Manrope,system-ui,sans-serif',disp:'Unbounded,system-ui,sans-serif',dark:1},
  hypo:{bg:['#f4efe6','#ffd6ea'],acc:'#ff48b0',ink:'#1c1a3a',sub:'#5d5875',font:'Onest,system-ui,sans-serif',disp:'"Dela Gothic One","Arial Black",sans-serif'},
  snow:{bg:['#070d1c','#2c3b5c'],acc:'#ffc46b',ink:'#f2f6ff',sub:'#b9c4dc',font:'Onest,system-ui,sans-serif',disp:'"Dela Gothic One","Arial Black",sans-serif',dark:1}};

/* ---------- карточка 1080×1920 ---------- */
function wrap(ctx,text,x,y,maxW,lh,maxLines){const words=String(text).split(' ');let line='',n=0;for(const w of words){const t=line?line+' '+w:w;if(ctx.measureText(t).width>maxW&&line){ctx.fillText(line,x,y);y+=lh;line=w;if(++n>=maxLines-1){break;}}else line=t;}ctx.fillText(line,x,y);return y+lh;}
async function makeCard(o){const T=THEMES[o.theme]||THEMES.hypo;try{await document.fonts.ready;}catch(e){}
  const c=document.createElement('canvas');c.width=1080;c.height=1920;const x=c.getContext('2d');
  let g=x.createLinearGradient(0,0,0,1920);g.addColorStop(0,T.bg[0]);g.addColorStop(1,T.bg[1]);x.fillStyle=g;x.fillRect(0,0,1080,1920);
  // декоративные круги
  x.globalAlpha=.18;x.fillStyle=T.acc;x.beginPath();x.arc(920,260,330,0,7);x.fill();x.beginPath();x.arc(120,1650,260,0,7);x.fill();x.globalAlpha=1;
  if(o.theme==='snow'){for(let i=0;i<260;i++){x.globalAlpha=.3+Math.random()*.6;x.fillStyle='#fff';x.beginPath();x.arc(Math.random()*1080,Math.random()*1920,1+Math.random()*4,0,7);x.fill();}x.globalAlpha=1;}
  x.fillStyle=T.ink;x.textBaseline='alphabetic';
  x.font=`700 40px ${T.font}`;x.fillStyle=T.sub;x.fillText('SKILL ROUTE · ИГРА',96,180);
  x.fillStyle=T.ink;x.font=`800 86px ${T.disp}`;let y=wrap(x,o.gameTitle,96,300,890,96,3);
  y+=60;x.font=`600 44px ${T.font}`;x.fillStyle=T.sub;x.fillText((o.name||'Игрок')+' получает звание',96,y);y+=40;
  // плашка звания
  x.font=`800 104px ${T.disp}`;const lines=[];{const words=String(o.rank).split(' ');let line='';for(const w of words){const t=line?line+' '+w:w;if(x.measureText(t).width>840&&line){lines.push(line);line=w;}else line=t;}lines.push(line);}
  const boxH=lines.length*118+70;x.fillStyle=T.acc;const r=36,bx=72,by=y+20,bw=936;x.beginPath();x.moveTo(bx+r,by);x.arcTo(bx+bw,by,bx+bw,by+boxH,r);x.arcTo(bx+bw,by+boxH,bx,by+boxH,r);x.arcTo(bx,by+boxH,bx,by,r);x.arcTo(bx,by,bx+bw,by,r);x.fill();
  x.fillStyle=(o.theme==='design')?'#ffffff':'#14121f';lines.forEach((l,i)=>x.fillText(l,bx+48,by+112+i*118));y=by+boxH+110;
  // цифры
  const stats=[[String(o.score),'очков'],[o.acc+'%','точность']];if(o.place)stats.push(['№'+o.place,'в рейтинге']);
  const sw=936/stats.length;stats.forEach((s,i)=>{const sx=72+i*sw;x.fillStyle=T.ink;x.font=`800 110px ${T.disp}`;x.fillText(s[0],sx+24,y+20);x.font=`600 40px ${T.font}`;x.fillStyle=T.sub;x.fillText(s[1],sx+28,y+80);});
  y+=230;if(o.scenarioTitle){x.font=`600 42px ${T.font}`;x.fillStyle=T.sub;y=wrap(x,'Кейс: '+o.scenarioTitle,96,y,890,54,2);}
  // призыв
  x.fillStyle=T.ink;x.font=`800 64px ${T.disp}`;wrap(x,'А ты сможешь лучше?',96,1600,890,74,2);
  x.font=`700 44px ${T.font}`;x.fillStyle=T.acc;x.fillText(o.url.replace(/^https?:\/\//,'').replace(/\/$/,''),96,1740);
  return new Promise(res=>c.toBlob(b=>res(b),'image/png'));}

/* ---------- UI ---------- */
function css(theme){const T=THEMES[theme]||THEMES.hypo;const d=T.dark;
  return `.srx{display:flex;flex-direction:column;gap:12px;font-family:${T.font}}
  .srx-card{border-radius:16px;padding:16px;background:${d?'rgba(255,255,255,.06)':'#fff'};border:1.5px solid ${d?'rgba(255,255,255,.14)':'rgba(20,18,40,.14)'};color:${d?'#eef2f8':'#1c1a2e'};display:flex;flex-direction:column;gap:10px}
  .srx-card h4{margin:0;font-size:18px;font-family:${T.disp};font-weight:800}
  .srx-card p{margin:0;font-size:14.5px;opacity:.85;line-height:1.45}
  .srx-row{display:flex;gap:8px;flex-wrap:wrap}
  .srx-btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;min-height:46px;padding:0 18px;border-radius:12px;border:0;cursor:pointer;font:700 15px ${T.font};background:${T.acc};color:${theme==='design'?'#fff':'#14121f'}}
  .srx-btn.ghost{background:transparent;color:inherit;box-shadow:inset 0 0 0 1.5px currentColor}
  .srx-btn:disabled{opacity:.5}
  .srx-lb{display:flex;flex-direction:column;gap:4px;font-size:14.5px}
  .srx-lb div{display:grid;grid-template-columns:34px 1fr auto auto;gap:10px;align-items:center;padding:7px 10px;border-radius:10px;background:${d?'rgba(255,255,255,.04)':'rgba(20,18,40,.04)'}}
  .srx-lb div.me{background:${T.acc};color:${theme==='design'?'#fff':'#14121f'};font-weight:800}
  .srx-lb b{font-variant-numeric:tabular-nums}.srx-lb small{opacity:.7;font-variant-numeric:tabular-nums}
  .srx-duel{display:grid;grid-template-columns:1fr auto 1fr;gap:10px;align-items:center;text-align:center}
  .srx-duel .v{font:800 34px ${T.disp}}.srx-duel .n{font-size:13.5px;opacity:.8}
  .srx-duel .vs{font:800 16px ${T.disp};opacity:.6}
  .srx-res{font:800 20px ${T.disp};text-align:center}
  .srx-toast{position:fixed;left:50%;bottom:28px;transform:translateX(-50%);background:#14121f;color:#fff;padding:10px 18px;border-radius:999px;font:700 14px ${T.font};z-index:99;box-shadow:0 10px 30px rgba(0,0,0,.3)}
  .srx-banner{border-radius:14px;padding:12px 16px;background:${T.acc};color:${theme==='design'?'#fff':'#14121f'};font:600 15px ${T.font};line-height:1.45}
  .srx-banner b{font-family:${T.disp}}`;}
function ensureCss(theme){if(document.getElementById('srx-css-'+theme))return;const s=document.createElement('style');s.id='srx-css-'+theme;s.textContent=css(theme);document.head.appendChild(s);}
function toast(t){const e=document.createElement('div');e.className='srx-toast';e.textContent=t;document.body.appendChild(e);setTimeout(()=>e.remove(),2600);}
async function copy(t){try{await navigator.clipboard.writeText(t);return true;}catch(e){const a=document.createElement('textarea');a.value=t;document.body.appendChild(a);a.select();let ok=false;try{ok=document.execCommand('copy');}catch(_){}a.remove();return ok;}}

/* o: {game, theme, gameTitle, name, rank, score, acc, session, scenario, scenarioTitle} */
function block(o){ensureCss(o.theme);const box=document.createElement('div');box.className='srx';const url=pageUrl();let place=null;
  // дуэль: результат
  const duelCard=document.createElement('div');duelCard.className='srx-card';duelCard.hidden=true;box.appendChild(duelCard);
  duelReady.then(d=>{if(!d||d.game!==o.game)return;duelCard.hidden=false;const win=o.score>d.score,draw=o.score===d.score;
    duelCard.innerHTML=`<h4>Дуэль</h4><div class="srx-duel"><div><div class="v">${o.score}</div><div class="n">${esc(o.name)} (вы)</div></div><div class="vs">VS</div><div><div class="v">${d.score}</div><div class="n">${esc(d.name)}</div></div></div><div class="srx-res">${draw?'Ничья! Сыграйте ещё раз':win?'Вы победили! 🏆':'Победа за '+esc(d.name)+'. Реванш?'}</div>`;});
  // поделиться
  const share=document.createElement('div');share.className='srx-card';
  share.innerHTML=`<h4>Поделитесь результатом</h4><p>Карточка для сторис с вашим званием. Отметьте @skill.route — мы репостнем лучшие.</p><div class="srx-row"><button class="srx-btn" data-a="card">Карточка для сторис</button><button class="srx-btn ghost" data-a="duel">Вызвать друга на дуэль</button></div>`;
  box.appendChild(share);
  share.querySelector('[data-a=card]').onclick=async e=>{const b=e.currentTarget;b.disabled=true;const blob=await makeCard(Object.assign({},o,{url,place}));b.disabled=false;if(!blob)return;
    const file=new File([blob],'skillroute-result.png',{type:'image/png'});
    if(navigator.canShare&&navigator.canShare({files:[file]})){try{await navigator.share({files:[file],title:o.gameTitle,text:`Моё звание в игре «${o.gameTitle}»: ${o.rank}. ${url}`});return;}catch(err){if(err&&err.name==='AbortError')return;}}
    const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='skillroute-result.png';document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove();},1500);toast('Картинка сохранена — добавьте её в сторис');};
  share.querySelector('[data-a=duel]').onclick=async()=>{const link=url+'?duel='+encodeURIComponent(o.session);const text=`Я набрал(а) ${o.score} очков в игре «${o.gameTitle}» и получил(а) звание «${o.rank}». Сможешь больше?`;
    if(navigator.share){try{await navigator.share({title:o.gameTitle,text,url:link});return;}catch(err){if(err&&err.name==='AbortError')return;}}
    const ok=await copy(text+' '+link);toast(ok?'Ссылка на дуэль скопирована — отправьте её другу':'Скопируйте ссылку: '+link);};
  // лидеры
  const lb=document.createElement('div');lb.className='srx-card';lb.innerHTML=`<h4>Таблица лидеров</h4><p>Загружаем…</p>`;box.appendChild(lb);
  setTimeout(async()=>{const [top,rk]=await Promise.all([rpc('get_leaderboard',{p_game:o.game,p_scenario:o.scenario||null,p_limit:10}),rpc('get_rank',{p_game:o.game,p_session:o.session,p_scenario:o.scenario||null})]);
    const me=rk&&rk[0];if(me&&me.score!=null)place=me.pos;
    if(!top||!top.length){lb.innerHTML=`<h4>Таблица лидеров</h4><p>Вы — первый игрок в этом рейтинге!</p>`;return;}
    const rows=top.map(r=>`<div class="${me&&me.score!=null&&r.pos===me.pos&&r.score===me.score?'me':''}"><b>${r.pos}</b><span>${esc(r.name)}</span><small>${r.accuracy}%</small><b>${r.score}</b></div>`).join('');
    const tail=me&&me.score!=null&&me.pos>10?`<div class="me"><b>${me.pos}</b><span>${esc(o.name)} (вы)</span><small>${o.acc}%</small><b>${me.score}</b></div>`:'';
    lb.innerHTML=`<h4>Таблица лидеров${o.scenarioTitle?' · '+esc(o.scenarioTitle):''}</h4>${me&&me.score!=null?`<p>Ваше место: <b>${me.pos}</b> из ${me.total}</p>`:''}<div class="srx-lb">${rows}${tail}</div>`;},1600);
  return box;}

function banner(theme,d,label){ensureCss(theme);const e=document.createElement('div');e.className='srx-banner';e.innerHTML=`⚔️ <b>${esc(d.name)}</b> вызывает вас на дуэль: ${d.score} очков${label?' в кейсе «'+esc(label)+'»':''}. Обыграйте!`;return e;}

window.SRX={duelId,duelReady,block,banner,rpc};
})();
