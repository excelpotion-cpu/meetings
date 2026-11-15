
const VER=(window.AndroidBridge&&AndroidBridge.appVersion)?AndroidBridge.appVersion():'1.0.0';
//JAL-START
const div=(a,b)=>~~(a/b),mod=(a,b)=>a-~~(a/b)*b;
const BRK=[-61,9,38,199,426,686,756,818,1111,1181,1210,1635,2060,2097,2192,2262,2324,2394,2456,3178];
function jalCal(jy){let bl=BRK.length,gy=jy+621,leapJ=-14,jp=BRK[0],jm,jump,leap,leapG,march,n,i;
 for(i=1;i<bl;i++){jm=BRK[i];jump=jm-jp;if(jy<jm)break;leapJ+=div(jump,33)*8+div(mod(jump,33),4);jp=jm}
 n=jy-jp;leapJ+=div(n,33)*8+div(mod(n,33)+3,4);if(mod(jump,33)===4&&jump-n===4)leapJ++;
 leapG=div(gy,4)-div((div(gy,100)+1)*3,4)-150;march=20+leapJ-leapG;
 if(jump-n<6)n=n-jump+div(jump+4,33)*33;
 leap=mod(mod(n+1,33)-1,4);if(leap===-1)leap=4;return{leap,gy,march}}
function g2d(gy,gm,gd){let d=div((gy+div(gm-8,6)+100100)*1461,4)+div(153*mod(gm+9,12)+2,5)+gd-34840408;return d-div(div(gy+100100+div(gm-8,6),100)*3,4)+752}
function d2g(jdn){let j=4*jdn+139361631;j+=div(div(4*jdn+183187720,146097)*3,4)*4-3908;const i=div(mod(j,1461),4)*5+308;const gd=div(mod(i,153),5)+1,gm=mod(div(i,153),12)+1,gy=div(j,1461)-100100+div(8-gm,6);return{gy,gm,gd}}
function j2d(jy,jm,jd){const r=jalCal(jy);return g2d(r.gy,3,r.march)+(jm-1)*31-div(jm,7)*(jm-7)+jd-1}
function d2j(jdn){const gy=d2g(jdn).gy;let jy=gy-621;const r=jalCal(jy),f=g2d(gy,3,r.march);let k=jdn-f,jm,jd;
 if(k>=0){if(k<=185){return{jy,jm:1+div(k,31),jd:mod(k,31)+1}}k-=186}else{jy--;k+=179;if(r.leap===1)k++}
 return{jy,jm:7+div(k,30),jd:mod(k,30)+1}}
const mlen=(y,m)=>m<=6?31:m<=11?30:(jalCal(y).leap===0?30:29);
//JAL-END
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const fa=s=>String(s).replace(/\d/g,d=>'۰۱۲۳۴۵۶۷۸۹'[d]),p2=n=>String(n).padStart(2,'0');
const MN=['فروردین','اردیبهشت','خرداد','تیر','مرداد','شهریور','مهر','آبان','آذر','دی','بهمن','اسفند'];
const WD=['شنبه','یکشنبه','دوشنبه','سه‌شنبه','چهارشنبه','پنجشنبه','جمعه'],WS=['ش','ی','د','س','چ','پ','ج'];
const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const dk=(y,m,d)=>`${y}-${p2(m)}-${p2(d)}`,pk=k=>{const a=k.split('-').map(Number);return{y:a[0],m:a[1],d:a[2]}};
const kj=k=>{const o=pk(k);return j2d(o.y,o.m,o.d)},jk=n=>{const j=d2j(n);return dk(j.jy,j.jm,j.jd)};
const addD=(k,n)=>jk(kj(k)+n);
const addM=(k,n)=>{const o=pk(k);let m=o.m-1+n,y=o.y+Math.floor(m/12);m=((m%12)+12)%12+1;return dk(y,m,Math.min(o.d,mlen(y,m)))};
const wdx=k=>{const g=d2g(kj(k));return(new Date(Date.UTC(g.gy,g.gm-1,g.gd)).getUTCDay()+1)%7};
const fd=k=>{const o=pk(k);return fa(`${o.y}/${p2(o.m)}/${p2(o.d)}`)};
const fdl=k=>{const o=pk(k);return `${WD[wdx(k)]} ${fa(o.d)} ${MN[o.m-1]} ${fa(o.y)}`};
const todayK=()=>{const g=new Date();return jk(g2d(g.getFullYear(),g.getMonth()+1,g.getDate()))};
const tmin=t=>{const a=t.split(':');return +a[0]*60+ +a[1]},hm=m=>`${p2(Math.floor(m/60))}:${p2(m%60)}`;
const msOf=(k,t)=>{const g=d2g(kj(k)),a=t.split(':');return new Date(g.gy,g.gm-1,g.gd,+a[0],+a[1]).getTime()};

const DEFC=[{id:'c1',n:'داخلی',c:'#1b6ca8'},{id:'c2',n:'مشتری',c:'#1e8e4e'},{id:'c3',n:'پیمانکار',c:'#e08a1e'},{id:'c4',n:'مدیریت',c:'#8e44ad'},{id:'c5',n:'آنلاین',c:'#16a0b5'},{id:'c6',n:'سایر',c:'#c0392b'}];
const DEF=()=>({meets:[],contacts:[],cats:DEFC.map(c=>({...c})),name:'',company:'',rem:15,auto:false,seen:[],lastBackup:0,firstUse:Date.now(),g:{cid:'',secret:'',sync:true,lastSync:0},theme:'auto'});
const LS='meetings_v1';let S={};try{S=JSON.parse(localStorage.getItem(LS))||{}}catch(e){}S=Object.assign(DEF(),S);
const save=()=>{try{localStorage.setItem(LS,JSON.stringify(S))}catch(e){toast('ذخیره‌سازی در این دستگاه ممکن نیست')}syncRem()};
const catOf=id=>S.cats.find(c=>c.id==id)||{id:'',n:'بدون نوع',c:'#9aa8b6'},cOf=id=>S.contacts.find(c=>c.id==id);
const TK=todayK();let view='cal',mode='m',sel=TK;

function syncRem(){if(!window.AndroidBridge)return;const now=Date.now();
  const a=S.meets.filter(m=>!m.x&&m.r>=0).map(m=>({id:m.id,t:msOf(m.d,m.s)-m.r*60000,title:'⏰ '+m.t,body:`${fdl(m.d)} · ساعت ${fa(m.s)}${m.loc?' · '+m.loc:''}`})).filter(o=>o.t>now).sort((x,y)=>x.t-y.t).slice(0,60);
  try{AndroidBridge.setReminders(JSON.stringify(a))}catch(e){}}
function applyTheme(){document.documentElement.dataset.theme=S.theme}
let tt;function toast(msg,lbl,fn){const t=$('#toast');t.innerHTML=`<span>${msg}</span>${lbl?`<button>${lbl}</button>`:''}`;t.classList.add('on');if(lbl)$('button',t).onclick=()=>{t.classList.remove('on');fn()};clearTimeout(tt);tt=setTimeout(()=>t.classList.remove('on'),lbl?6000:2600)}
const on=k=>S.meets.filter(m=>m.d==k).sort((a,b)=>a.s.localeCompare(b.s));
const mcard=m=>{const c=catOf(m.c),n=(m.ppl||[]).length;return `<div class="mc ${m.x?'cx':''}" style="--c:${c.c}" data-act="edit" data-id="${m.id}"><div class="mt"><b>${fa(m.s)}</b><span>${fa(m.e)}</span></div><div><div class="tt">${esc(m.t)}</div><div class="ms">${m.loc?'📍 '+esc(m.loc)+' · ':''}${n?'👥 '+fa(n)+' نفر · ':''}${m.from?'📥 از '+esc(m.from)+' · ':''}${m.rsvp?'✔'+fa(m.rsvp.y)+' ✖'+fa(m.rsvp.n)+' · ':''}<span style="color:${c.c};font-weight:700">${esc(c.n)}</span>${m.x?' · لغو شده':''}</div></div><button class="ib" data-act="send" data-id="${m.id}">📨</button></div>`};

function render(){
  $$('.bn button').forEach(b=>b.classList.toggle('on',b.dataset.v==view));$('#fab').style.display=view=='cal'||view=='list'?'block':'none';
  ({cal:vCal,list:vList,set:vSet})[view]();
}
function head(){
  const o=pk(sel);let lbl;
  if(mode=='m')lbl=`${MN[o.m-1]} ${fa(o.y)}`;
  else if(mode=='w'){const a=addD(sel,-wdx(sel)),b=addD(a,6),x=pk(a),y=pk(b);lbl=`${fa(x.d)} ${x.m==y.m?'':MN[x.m-1]+' '}تا ${fa(y.d)} ${MN[y.m-1]}`}
  else lbl=fdl(sel);
  $('#top').innerHTML=`<h1>🗓 جلسات من</h1><div class="sub">${esc([S.name,S.company].filter(Boolean).join(' · ')||'برنامه‌ریزی و دعوت به جلسات')}</div>
  <div class="mn"><button data-act="nav" data-n="-1">›</button><b data-act="now">${lbl}</b><button data-act="nav" data-n="1">‹</button></div>
  <div class="seg">${[['m','ماه'],['w','هفته'],['d','روز']].map(a=>`<button data-act="mode" data-m="${a[0]}" class="${mode==a[0]?'on':''}">${a[1]}</button>`).join('')}</div>`;
}
function vCal(){head();({m:vMonth,w:vWeek,d:vDay})[mode]()}
function vMonth(){
  const o=pk(sel),len=mlen(o.y,o.m),first=wdx(dk(o.y,o.m,1)),pre=dk(o.y,o.m,0).slice(0,8);
  const ms=S.meets.filter(m=>m.d.startsWith(pre)),per={};ms.forEach(m=>(per[m.d]=per[m.d]||[]).push(m));
  const now=Date.now(),nx=S.meets.filter(m=>!m.x&&msOf(m.d,m.s)>now).sort((a,b)=>msOf(a.d,a.s)-msOf(b.d,b.s))[0];
  let g=WS.map((w,i)=>`<div class="wh ${i==6?'f':''}">${w}</div>`).join('')+'<button class="e"></button>'.repeat(first);
  for(let d=1;d<=len;d++){const k=dk(o.y,o.m,d),a=per[k]||[],cs=[...new Set(a.map(m=>catOf(m.c).c))].slice(0,4);
    g+=`<button data-act="day" data-d="${k}" class="${(first+d-1)%7==6?'f':''} ${k==TK?'td':''} ${k==sel?'sl':''}"><span class="n">${fa(d)}</span>${a.length?`<span class="h">${fa(a.length)}</span>`:'<span></span>'}<span class="dots">${cs.map(c=>`<i style="background:${c}"></i>`).join('')}</span></button>`}
  $('#main').innerHTML=`<div class="stats"><div class="st"><b>${fa(ms.length)}</b><span>جلسات این ماه</span></div><div class="st"><b>${fa(on(TK).length)}</b><span>جلسات امروز</span></div><div class="st"><b>${nx?(nx.d==TK?'امروز ':nx.d==addD(TK,1)?'فردا ':fd(nx.d).slice(5)+' ')+fa(nx.s):'—'}</b><span>جلسه بعدی</span></div></div>
  <div class="card"><div class="cal">${g}</div></div><div class="dh"><b>${fdl(sel)}</b><a data-act="mode" data-m="d">نمای روز ›</a></div>${on(sel).map(mcard).join('')||'<div class="empty">جلسه‌ای ثبت نشده.<br>با دکمه ＋ جلسه بسازید.</div>'}`;
}
function vWeek(){
  const a=addD(sel,-wdx(sel));
  $('#main').innerHTML=Array.from({length:7},(_,i)=>{const k=addD(a,i),o=pk(k),l=on(k);
    return `<div class="wd ${k==TK?'td':''}"><div class="wh"><b>${WD[i]} ${fa(o.d)} ${MN[o.m-1]}</b><span>${l.length?fa(l.length)+' جلسه':''}</span><button data-act="add" data-d="${k}">＋</button></div>${l.map(mcard).join('')||'<div style="color:var(--mut);font-size:12px;padding:0 10px 4px">—</div>'}</div>`}).join('');
}
function vDay(){
  const l=on(sel),HH=60;let h0=6,h1=21;l.forEach(m=>{h0=Math.min(h0,Math.floor(tmin(m.s)/60));h1=Math.max(h1,Math.ceil(tmin(m.e)/60))});
  /* ستون‌بندی هم‌پوشانی */
  const cols=[];l.forEach(m=>{let c=0;while(cols[c]&&cols[c]>tmin(m.s))c++;m._c=c;cols[c]=tmin(m.e)});
  l.forEach(m=>{let mx=0;l.forEach(n=>{if(tmin(n.s)<tmin(m.e)&&tmin(n.e)>tmin(m.s))mx=Math.max(mx,n._c)});m._n=mx+1});
  let h='';for(let i=h0;i<=h1;i++)h+=`<div class="hl" style="top:${(i-h0)*HH}px;height:${HH}px" data-act="slot" data-h="${i}"><span>${fa(p2(i))}:۰۰</span></div>`;
  l.forEach(m=>{const c=catOf(m.c),top=(tmin(m.s)/60-h0)*HH,ht=Math.max(26,(tmin(m.e)-tmin(m.s))/60*HH-2),w=`(100% - 54px)/${m._n}`;
    h+=`<div class="bk ${m.x?'cx':''}" style="--c:${c.c};top:${top}px;height:${ht}px;width:calc(${w} - 4px);right:calc(52px + ${w}*${m._c})" data-act="edit" data-id="${m.id}"><b>${esc(m.t)}</b>${fa(m.s)} تا ${fa(m.e)}${m.loc&&ht>50?'<br>📍 '+esc(m.loc):''}</div>`});
  if(sel==TK){const n=new Date(),nm=n.getHours()*60+n.getMinutes();if(nm/60>=h0&&nm/60<=h1+1)h+=`<div class="now" style="top:${(nm/60-h0)*HH}px"></div>`}
  $('#main').innerHTML=`<div class="dh"><b>${fdl(sel)}</b><span class="lk">${l.length?fa(l.length)+' جلسه':'بدون جلسه'}</span></div><div class="tl" style="height:${(h1-h0+1)*HH+10}px">${h}</div>`;
  const f=l[0]?tmin(l[0].s)/60:(sel==TK?new Date().getHours():8);$('#main').scrollTop=Math.max(0,(f-h0-.6)*HH);
}
let lf='up',lq='';
function vList(){
  $('#top').innerHTML=`<h1>📋 فهرست جلسات</h1><div class="sub">جلسات پیش‌رو، گذشته و جست‌وجو</div>`;
  $('#main').innerHTML=`<input id="lq" placeholder="🔍 جست‌وجو در عنوان، مکان، شرکت‌کنندگان" value="${esc(lq)}" style="margin-bottom:8px"><div class="chips" id="lfc" style="--c:var(--act);margin-bottom:10px">${[['up','پیش‌رو'],['past','گذشته'],['all','همه']].map(a=>`<button data-act="lf" data-f="${a[0]}" class="${lf==a[0]?'on':''}">${a[1]}</button>`).join('')}</div><div id="lst"></div>`;
  $('#lq').oninput=e=>{lq=e.target.value;lst()};lst();
}
function lst(){
  const q=lq.trim();let a=S.meets.filter(m=>(lf=='all'||(lf=='up'?m.d>=TK:m.d<TK))&&(!q||(m.t+' '+(m.loc||'')+' '+(m.n||'')+' '+(m.ppl||[]).map(i=>(cOf(i)||{}).n).join(' ')).includes(q)));
  a.sort((x,y)=>(x.d+x.s).localeCompare(y.d+y.s)*(lf=='past'?-1:1));
  let last='',h='';a.forEach(m=>{if(m.d!=last){last=m.d;h+=`<div class="dh" style="margin-top:10px"><b>${m.d==TK?'امروز — ':m.d==addD(TK,1)?'فردا — ':''}${fdl(m.d)}</b></div>`}h+=mcard(m)});
  $('#lst').innerHTML=h||'<div class="empty">جلسه‌ای پیدا نشد.</div>';
}

/* ---------- ثبت و ویرایش جلسه ---------- */
function dsel(id,k){const o=pk(k),ty=pk(TK).y;let ys='';for(let y=1400;y<=ty+3;y++)ys+=`<option value="${y}" ${y==o.y?'selected':''}>${fa(y)}</option>`;
  return `<div class="dsel" id="${id}"><select data-k="d">${Array.from({length:31},(_,i)=>`<option value="${i+1}" ${i+1==o.d?'selected':''}>${fa(i+1)}</option>`).join('')}</select><select data-k="m">${MN.map((n,i)=>`<option value="${i+1}" ${i+1==o.m?'selected':''}>${n}</option>`).join('')}</select><select data-k="y">${ys}</select></div>`}
const rdsel=id=>{const e=$('#'+id),y=+$('[data-k=y]',e).value,m=+$('[data-k=m]',e).value,d=Math.min(+$('[data-k=d]',e).value,mlen(y,m));return dk(y,m,d)};
const REMS=[[-1,'بدون یادآوری'],[0,'همان لحظه'],[5,'۵ دقیقه قبل'],[10,'۱۰ دقیقه قبل'],[15,'۱۵ دقیقه قبل'],[30,'۳۰ دقیقه قبل'],[60,'۱ ساعت قبل'],[120,'۲ ساعت قبل'],[1440,'۱ روز قبل']];
const closeM=()=>{$('#modal').classList.remove('open');setTimeout(()=>{if(typeof pumpIn=='function')pumpIn()},60)};
function openMeet(id,d,hour){
  const ex=id&&S.meets.find(m=>m.id==id),k=ex?ex.d:(d||sel),now=new Date();
  const st=ex?ex.s:(hour!=null?p2(hour)+':00':(k==TK?p2(Math.min(now.getHours()+1,22))+':00':'09:00')),en=ex?ex.e:hm(Math.min(tmin(st)+60,1439));
  let cat=ex?ex.c:((S.cats[0]||{}).id||''),ppl=ex?[...(ex.ppl||[])]:[];
  $('#modal').innerHTML=`<div class="sheet"><h2>${ex?'ویرایش جلسه':'جلسه جدید'}</h2>
  <label class="f"><span>عنوان جلسه</span><input id="mt" value="${esc(ex?ex.t:'')}" placeholder="مثلاً: جلسه هماهنگی پروژه"></label>
  <label class="f"><span>تاریخ</span>${dsel('md',k)}</label>
  <div class="row"><label class="f"><span>از ساعت</span><input type="time" id="ms" value="${st}"></label><label class="f"><span>تا ساعت</span><input type="time" id="me" value="${en}"></label></div>
  <div class="sg" style="margin-top:0">نوع جلسه</div><div class="chips" id="mc" style="margin-bottom:6px"></div>
  <div class="row" id="ncr" style="display:none;margin-bottom:10px;flex-wrap:nowrap"><input type="color" id="ncc" value="#1b6ca8" style="flex:none"><input id="ncn" placeholder="نام نوع جلسه"><button type="button" class="btn ok" id="nca" style="flex:none">افزودن</button></div>
  <label class="f"><span>مکان یا لینک جلسه آنلاین</span><input id="ml" value="${esc(ex?ex.loc:'')}" placeholder="اتاق جلسات / https://..."></label>
  <div class="sg">شرکت‌کنندگان</div><div class="chips" id="mp" style="margin-bottom:6px"></div>
  <div class="row" id="npr" style="display:none;margin-bottom:10px;flex-wrap:nowrap"><input id="npn" placeholder="نام"><input id="npp" class="ltr" inputmode="tel" placeholder="موبایل"><button type="button" class="btn ok" id="npa" style="flex:none">افزودن</button></div>
  <label class="f"><span>دستور جلسه / توضیحات</span><textarea id="mn" placeholder="موضوعات و نکات جلسه">${esc(ex?ex.n:'')}</textarea></label>
  <div class="row"><label class="f"><span>یادآوری</span><select id="mr">${REMS.map(r=>`<option value="${r[0]}" ${r[0]==(ex?ex.r:S.rem)?'selected':''}>${r[1]}</option>`).join('')}</select></label>
  ${ex?`<label class="f"><span>وضعیت</span><select id="mx"><option value="0">برگزار می‌شود</option><option value="1" ${ex.x?'selected':''}>لغو شده</option></select></label>`:`<label class="f"><span>تکرار</span><select id="mrp"><option value="0">ندارد</option><option value="1">روزانه</option><option value="7">هفتگی</option><option value="30">ماهانه</option></select></label>`}</div>
  ${ex?'':'<label class="f" id="mcw" style="display:none"><span>تعداد دفعات (با همین جلسه)</span><select id="mcn">'+[2,3,4,5,6,8,10,12].map(n=>`<option value="${n}">${fa(n)} بار</option>`).join('')+'</select></label>'}
  <div class="row"><button class="btn ok" id="msv">ذخیره</button>${ex?'<button class="btn pri" id="msd">📨 ارسال دعوت</button>':''}<button class="btn" id="mcx">انصراف</button></div>
  ${ex?'<button class="btn bad" id="mdl" style="width:100%;margin-top:10px">🗑 حذف جلسه</button>':''}</div>`;
  $('#modal').classList.add('open');
  const chips=()=>{$('#mc').innerHTML=S.cats.map(c=>`<button type="button" data-cid="${c.id}" style="--c:${c.c}" class="${c.id==cat?'on':''}">${esc(c.n)}</button>`).join('')+'<button type="button" data-cid="__n" style="--c:#6b7a8a">＋ نوع جدید</button>'};chips();
  const pchips=()=>{$('#mp').innerHTML=S.contacts.map(c=>`<button type="button" data-pid="${c.id}" style="--c:#1b6ca8" class="${ppl.includes(c.id)?'on':''}">${esc(c.n)}</button>`).join('')+'<button type="button" data-pid="__n" style="--c:#6b7a8a">＋ مخاطب جدید</button>'};pchips();
  $('#mc').onclick=e=>{const b=e.target.closest('button');if(!b)return;if(b.dataset.cid=='__n'){const r=$('#ncr');r.style.display=r.style.display=='none'?'flex':'none';return}cat=b.dataset.cid;chips()};
  $('#nca').onclick=()=>{const n=$('#ncn').value.trim();if(!n){toast('نام را بنویسید');return}const c={id:'c'+Date.now(),n,c:$('#ncc').value};S.cats.push(c);save();cat=c.id;$('#ncn').value='';$('#ncr').style.display='none';chips()};
  $('#mp').onclick=e=>{const b=e.target.closest('button');if(!b)return;const p=b.dataset.pid;if(p=='__n'){const r=$('#npr');r.style.display=r.style.display=='none'?'flex':'none';return}ppl=ppl.includes(p)?ppl.filter(x=>x!=p):[...ppl,p];pchips()};
  $('#npa').onclick=()=>{const n=$('#npn').value.trim();if(!n){toast('نام مخاطب را بنویسید');return}const c={id:'p'+Date.now(),n,ph:$('#npp').value.trim(),em:'',tg:'',et:''};S.contacts.push(c);save();ppl.push(c.id);$('#npn').value=$('#npp').value='';$('#npr').style.display='none';pchips()};
  if($('#mrp'))$('#mrp').onchange=e=>{$('#mcw').style.display=e.target.value=='0'?'none':'flex'};
  $('#mcx').onclick=closeM;
  if($('#mdl'))$('#mdl').onclick=()=>{const i=S.meets.findIndex(m=>m.id==ex.id),it=S.meets[i];S.meets.splice(i,1);gDel(it);save();closeM();render();toast('جلسه حذف شد','برگردان',()=>{S.meets.push(it);save();render()})};
  if($('#msd'))$('#msd').onclick=()=>{closeM();openSend(ex.id)};
  $('#msv').onclick=()=>{const t=$('#mt').value.trim(),s=$('#ms').value,e=$('#me').value;
    if(!t){toast('عنوان جلسه را بنویسید');return}if(!s||!e||tmin(e)<=tmin(s)){toast('ساعت شروع و پایان را درست وارد کنید');return}
    const base={d:rdsel('md'),s,e,t,loc:$('#ml').value.trim(),ppl:[...ppl],n:$('#mn').value.trim(),c:cat,r:+$('#mr').value};let first;const made=[];
    if(ex){Object.assign(ex,base,{x:$('#mx').value=='1'});first=ex;made.push(ex)}
    else{const step=+$('#mrp').value,cnt=step?+$('#mcn').value:1;for(let i=0;i<cnt;i++){const d=step==30?addM(base.d,i):addD(base.d,i*step);const m={...base,d,id:'m'+Date.now()+i+Math.random().toString(36).slice(2,4),x:false};S.meets.push(m);made.push(m);if(!i)first=m}}
    const ov=on(first.d).some(o=>o.id!=first.id&&!o.x&&tmin(o.s)<tmin(first.e)&&tmin(o.e)>tmin(first.s));
    save();made.forEach(x=>gPush(x));sel=first.d;closeM();render();toast(ov?'ذخیره شد؛ با جلسه دیگری هم‌پوشانی دارد':'ذخیره شد ✓','ارسال دعوت',()=>openSend(first.id))};
}

/* ---------- ارسال دعوت‌نامه ---------- */
function msgOf(m){const L=['📅 دعوت به جلسه','موضوع: '+m.t,'تاریخ: '+fdl(m.d),`ساعت: ${fa(m.s)} تا ${fa(m.e)}`];if(m.loc)L.push('مکان/لینک: '+m.loc);
  const nm=(m.ppl||[]).map(cOf).filter(Boolean).map(c=>c.n);if(nm.length)L.push('دعوت‌شدگان: '+nm.join('، '));if(m.n)L.push('دستور جلسه: '+m.n);
  if(S.name)L.push('','— '+S.name+(S.company?' | '+S.company:''));return L.join('\n')}
function copyText(t){if(window.AndroidBridge){AndroidBridge.copyText(t);return}try{const a=document.createElement('textarea');a.value=t;document.body.appendChild(a);a.select();document.execCommand('copy');a.remove()}catch(e){}}
/* کد ورود: کل جلسه در یک متن کوتاه، تا اپ گیرنده خودکار آن را به تقویم اضافه کند */
const b64e=s=>btoa(unescape(encodeURIComponent(s))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
const b64d=s=>{s=s.replace(/-/g,'+').replace(/_/g,'/');while(s.length%4)s+='=';return decodeURIComponent(escape(atob(s)))};
const encM=m=>{const c=catOf(m.c);return 'JM1:'+b64e(JSON.stringify({i:m.uid||m.id,d:m.d,s:m.s,e:m.e,t:m.t,l:m.loc||'',n:m.n||'',c:c.n,k:c.c,x:m.x?1:0,f:S.name||m.from||''}))};
const decM=c=>{try{const o=JSON.parse(b64d(c));if(o&&o.i&&o.t&&o.s&&o.e&&/^\d{4}-\d\d-\d\d$/.test(o.d))return o}catch(e){}return null};
const hs=s=>{let h=5381;for(let i=0;i<s.length;i++)h=((h<<5)+h+s.charCodeAt(i))|0;return h};
const sameM=(m,o)=>!!m&&m.d==o.d&&m.s==o.s&&m.e==o.e&&m.t==o.t&&(m.loc||'')==(o.l||'')&&(m.n||'')==(o.n||'')&&!!m.x==!!o.x;
function applyM(o){let c=S.cats.find(x=>x.n==(o.c||'دریافتی'));if(!c){c={id:'c'+Date.now(),n:o.c||'دریافتی',c:o.k||'#1b6ca8'};S.cats.push(c)}
  const ex=S.meets.find(m=>m.uid==o.i||m.id==o.i),rec={uid:o.i,d:o.d,s:o.s,e:o.e,t:o.t,loc:o.l||'',n:o.n||'',c:c.id,x:!!o.x,from:o.f||''};
  if(ex)Object.assign(ex,rec);else S.meets.push(Object.assign({id:'r'+Date.now()+Math.random().toString(36).slice(2,5),ppl:[],r:S.rem},rec));
  save();sel=o.d;view='cal';render()}
const seenAdd=c=>{S.seen=(S.seen||[]).concat(hs(c)).slice(-200);save()};
let inq=[];
window.__incoming=(txt,force)=>{const cs=[...String(txt).matchAll(/JM1:([A-Za-z0-9_-]+)/g)].map(x=>x[1]);let n=0;
  cs.forEach(c=>{if(inq.some(q=>q.c==c))return;if(!force&&(S.seen||[]).includes(hs(c)))return;inq.push({c,force});n++});
  if(force&&!cs.length)toast('کد جلسه‌ای در این متن پیدا نشد');pumpIn()};
function pumpIn(){if(!inq.length||$('#modal').classList.contains('open'))return;const it=inq.shift(),o=it.o||decM(it.c);if(!o){pumpIn();return}
  const ex=S.meets.find(m=>m.uid==o.i||m.id==o.i);
  if(sameM(ex,o)){seenAdd(it.c);if(it.force)toast('این جلسه از قبل در تقویم شما هست');pumpIn();return}
  if(S.auto){applyM(o);seenAdd(it.c);toast((ex?'جلسه به‌روزرسانی شد: ':'جلسه جدید اضافه شد: ')+o.t);pumpIn();return}
  const cc=(S.cats.find(x=>x.n==o.c)||{}).c||o.k||'#1b6ca8';
  $('#modal').innerHTML=`<div class="sheet"><h2>📥 ${o.x?'لغو جلسه':ex?'به‌روزرسانی جلسه':'جلسه‌ی دریافتی'}</h2>${o.f?`<div style="color:var(--mut);margin:-6px 0 8px">از طرف ${esc(o.f)}</div>`:''}
  <div class="mc ${o.x?'cx':''}" style="--c:${cc};cursor:default"><div class="mt"><b>${fa(o.s)}</b><span>${fa(o.e)}</span></div><div><div class="tt">${esc(o.t)}</div><div class="ms">${fdl(o.d)}${o.l?'<br>📍 '+esc(o.l):''}${o.c?'<br>'+esc(o.c):''}</div></div><span></span></div>
  ${o.n?`<div class="card" style="white-space:pre-wrap">${esc(o.n)}</div>`:''}
  <div class="row"><button class="btn ok" id="ia">${ex?'✅ اعمال تغییرات':'✅ افزودن به تقویم من'}</button><button class="btn" id="ir">رد کردن</button></div></div>`;
  $('#modal').classList.add('open');
  $('#ia').onclick=()=>{applyM(o);seenAdd(it.c);closeM();toast('در تقویم شما ثبت شد ✓')};
  $('#ir').onclick=()=>{seenAdd(it.c);closeM()};
}

/* ---------- فایل تقویم (.ics): Gmail و Google Calendar آن را می‌شناسند ---------- */
const icsEsc=s=>String(s||'').replace(/\\/g,'\\\\').replace(/\n/g,'\\n').replace(/,/g,'\\,').replace(/;/g,'\\;');
const icsT=ms=>new Date(ms).toISOString().replace(/[-:]/g,'').replace(/\.\d{3}/,'');
const icsFold=l=>{let o='';while(l.length>72){o+=l.slice(0,72)+'\r\n ';l=l.slice(72)}return o+l};
function icsOf(m){
  const L=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Fileland//Meetings 1.0//FA','CALSCALE:GREGORIAN','METHOD:PUBLISH','BEGIN:VEVENT','UID:'+(m.uid||m.id),'DTSTAMP:'+icsT(Date.now()),'SEQUENCE:'+Math.floor(Date.now()/1000),
    'DTSTART:'+icsT(msOf(m.d,m.s)),'DTEND:'+icsT(msOf(m.d,m.e)),'SUMMARY:'+icsEsc(m.t)];
  if(m.loc)L.push('LOCATION:'+icsEsc(m.loc));if(m.n)L.push('DESCRIPTION:'+icsEsc(m.n));if(m.x)L.push('STATUS:CANCELLED');
  if(m.r>=0)L.push('BEGIN:VALARM','TRIGGER:'+(m.r>0?'-PT'+m.r+'M':'PT0S'),'ACTION:DISPLAY','DESCRIPTION:'+icsEsc(m.t),'END:VALARM');
  L.push('X-JM1:'+encM(m).slice(4),'END:VEVENT','END:VCALENDAR');
  return L.map(icsFold).join('\r\n')+'\r\n'}
window.__incomingIcs=txt=>{
  const unesc=s=>String(s||'').replace(/\\[nN]/g,'\n').replace(/\\([,;\\])/g,'$1');
  const dt=v=>{const m=/(\d{4})(\d\d)(\d\d)(?:T(\d\d)(\d\d)(\d\d)?)?(Z)?/.exec(v||'');if(!m)return null;let y=+m[1],mo=+m[2],d=+m[3],h=m[4]==null?null:+m[4],mi=m[5]==null?0:+m[5];
    if(m[7]){const D=new Date(Date.UTC(y,mo-1,d,h||0,mi));y=D.getFullYear();mo=D.getMonth()+1;d=D.getDate();h=D.getHours();mi=D.getMinutes()}
    return{k:jk(g2d(y,mo,d)),t:h==null?null:p2(h)+':'+p2(mi)}};
  let n=0;
  const emit=ev=>{if(ev['X-JM1']){window.__incoming('JM1:'+ev['X-JM1'].trim(),true);n++;return}
    const a=dt(ev.DTSTART),b=dt(ev.DTEND);if(!a||!ev.SUMMARY)return;
    const s=a.t||'00:00';let e=b&&b.t?b.t:(a.t?hm(Math.min(tmin(s)+60,1439)):'23:59');if(b&&b.k!=a.k)e='23:59';if(tmin(e)<=tmin(s))e=hm(Math.min(tmin(s)+60,1439));
    const o={i:ev.UID||('ics'+hs(ev.SUMMARY+a.k+s)),d:a.k,s,e,t:unesc(ev.SUMMARY),l:unesc(ev.LOCATION),n:unesc(ev.DESCRIPTION),c:'',k:'',x:/CANCEL/i.test(ev.STATUS||'')?1:0,f:''};
    inq.push({c:'ics:'+o.i+o.d+o.s+o.e+o.t+o.x,o,force:true});n++};
  let ev=null;
  String(txt).replace(/\r\n?/g,'\n').replace(/\n[ \t]/g,'').split('\n').forEach(L=>{
    if(/^BEGIN:VEVENT/i.test(L)){ev={};return}
    if(/^END:VEVENT/i.test(L)){if(ev)emit(ev);ev=null;return}
    if(!ev)return;const i=L.indexOf(':');if(i<0)return;ev[L.slice(0,i).split(';')[0].toUpperCase()]=L.slice(i+1)});
  if(!n)toast('رویدادی در این فایل پیدا نشد');pumpIn()};
window.__resume=()=>{if(!window.AndroidBridge)return;onG();
  try{const t=AndroidBridge.readClipboard();if(t&&t.indexOf('JM1:')>=0)window.__incoming(t)}catch(e){}};

function openSend(id){
  const m=S.meets.find(x=>x.id==id);if(!m)return;const ps=(m.ppl||[]).map(cOf).filter(Boolean);
  const direct=ps.flatMap(c=>[c.tg&&{k:'tg',n:c.n,u:c.tg},c.et&&{k:'et',n:c.n,u:c.et}].filter(Boolean));
  $('#modal').innerHTML=`<div class="sheet"><h2>📨 ارسال دعوت‌نامه</h2><div style="color:var(--mut);margin:-6px 0 8px">${esc(m.t)} · ${fdl(m.d)}</div>
  <label class="f"><span>متن پیام (قابل ویرایش)</span><textarea id="sm" style="min-height:150px">${esc(msgOf(m))}</textarea></label>
  <label class="f" style="flex-direction:row;align-items:flex-start;gap:8px"><input type="checkbox" id="scode" checked style="width:20px;min-height:0;flex:none;margin-top:4px"><span style="font-size:13px;color:var(--tx)">افزودن «کد ورود» تا جلسه خودکار روی اپ «جلسات من» گیرنده اضافه شود</span></label>
  <div style="font-size:12px;color:var(--mut)">${ps.length?'به: '+ps.map(c=>esc(c.n)).join('، '):'شرکت‌کننده‌ای انتخاب نشده؛ گیرنده را در برنامه‌ی مقصد انتخاب می‌کنید.'}</div>
  <div class="chan"><button style="background:#c0392b" data-ch="ics"><i>📧</i>Gmail + فایل تقویم<br><small>پیشنهادی</small></button><button style="background:#e0614f" data-ch="email"><i>✉️</i>ایمیل<br><small>متن + کد</small></button><button style="background:#2f9e6a" data-ch="sms"><i>💬</i>پیامک<br><small>با برنامه پیام</small></button>
  <button style="background:#2a8fd0" data-ch="telegram"><i>✈️</i>تلگرام</button><button style="background:#e08a1e" data-ch="eitaa"><i>🟠</i>ایتا</button><button style="background:#8e44ad" data-ch="cal"><i>📅</i>تقویم گوشی</button><button style="background:#6b7a8a" data-ch="other"><i>↗</i>سایر / کپی</button></div>
  ${direct.length?`<div class="sg">گفتگوی مستقیم (متن کپی می‌شود، در گفتگو «چسباندن» را بزنید)</div><div class="chips" id="dc" style="--c:var(--act)">${direct.map(d=>`<button data-k="${d.k}" data-u="${esc(d.u)}">${d.k=='tg'?'✈️ تلگرام':'🟠 ایتا'}: ${esc(d.n)}</button>`).join('')}</div>`:''}
  <button class="btn" id="sx" style="width:100%;margin-top:12px">بستن</button></div>`;
  $('#modal').classList.add('open');$('#sx').onclick=closeM;
  const full=()=>$('#sm').value+($('#scode').checked?'\n\n🔗 کد ورود به اپ «جلسات من»:\n'+encM(m):''),
    ph=ps.map(c=>(c.ph||'').replace(/[^0-9+]/g,'')).filter(Boolean),em=ps.map(c=>(c.em||'').trim()).filter(Boolean),subj='دعوت به جلسه: '+m.t,B=window.AndroidBridge;
  $$('[data-ch]').forEach(b=>b.onclick=()=>{const ch=b.dataset.ch;
    if(ch=='cal'){if(B)B.addToCalendar(m.t,m.loc||'',m.n||'',msOf(m.d,m.s),msOf(m.d,m.e));else toast('این امکان فقط در اپ اندروید است');return}
    if(ch=='ics'){if(B)B.shareIcs(em.join(','),subj,full(),icsOf(m),'meeting.ics');else{dl(new Blob([icsOf(m)],{type:'text/calendar'}),'meeting.ics');toast('فایل تقویم ذخیره شد؛ آن را به ایمیل پیوست کنید')}return}
    if(B){if(ch=='other')copyText(full());B.shareText(ch,ch=='sms'?ph.join(';'):ch=='email'?em.join(','):'',subj,full());return}
    const t=encodeURIComponent(full());
    if(ch=='sms')location.href='sms:'+ph.join(',')+'?body='+t;else if(ch=='email')location.href='mailto:'+em.join(',')+'?subject='+encodeURIComponent(subj)+'&body='+t;
    else if(ch=='telegram')window.open('https://t.me/share/url?url=%20&text='+t);else{copyText(full());toast('متن کپی شد؛ در برنامه‌ی دلخواه بچسبانید')}});
  if($('#dc'))$('#dc').onclick=e=>{const b=e.target.closest('button');if(!b)return;copyText(full());toast('متن کپی شد؛ در گفتگو بچسبانید');const u=b.dataset.u.replace(/^@/,'').replace(/^https?:\/\/(t\.me|eitaa\.com)\//,'');setTimeout(()=>{location.href=(b.dataset.k=='tg'?'https://t.me/':'https://eitaa.com/')+u},700)};
}

/* ---------- تنظیمات ---------- */
function dl(blob,name){if(window.AndroidBridge){const r=new FileReader();r.onload=()=>{try{AndroidBridge.saveFile(String(r.result).split(',')[1],name,blob.type||'application/octet-stream')}catch(e){toast('ذخیره فایل انجام نشد')}};r.readAsDataURL(blob);return}
  const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},4000)}
function vSet(){
  $('#top').innerHTML=`<h1>⚙️ تنظیمات</h1><div class="sub">مشخصات، مخاطبین، انواع جلسه، پشتیبان‌گیری</div>`;
  const inp=(id,l,v,c)=>`<label class="f"><span>${l}</span><input id="${id}" class="${c||''}" value="${esc(v||'')}"></label>`;
  $('#main').innerHTML=`<div class="card"><h2>مشخصات من (امضای پیام دعوت)</h2>${inp('sn','نام و نام خانوادگی',S.name)}${inp('sc','شرکت / سازمان',S.company)}
  <label class="f"><span>یادآوری پیش‌فرض جلسات</span><select id="sr">${REMS.map(r=>`<option value="${r[0]}" ${r[0]==S.rem?'selected':''}>${r[1]}</option>`).join('')}</select></label>
  <label class="f"><span>ظاهر</span><select id="sth"><option value="auto" ${S.theme=='auto'?'selected':''}>خودکار</option><option value="light" ${S.theme=='light'?'selected':''}>روشن</option><option value="dark" ${S.theme=='dark'?'selected':''}>تیره</option></select></label></div>
  ${gCard()}
  <div class="card"><h2>دریافت دعوت‌نامه</h2><p style="margin:0 0 8px;color:var(--mut);font-size:12px">دعوتی که با ایمیل (فایل تقویم)، تلگرام، ایتا یا پیامک برایتان می‌آید: پیوست ایمیل را باز کنید و «جلسات من» را انتخاب کنید، یا متن پیام را Share کنید، یا فقط کد/پیام را کپی کنید و اپ را باز کنید.</p>
  <label class="f" style="flex-direction:row;align-items:center;gap:8px;margin:0"><input type="checkbox" id="sauto" ${S.auto?'checked':''} style="width:20px;min-height:0;flex:none"><span style="font-size:14px;color:var(--tx)">جلسات دریافتی بدون پرسیدن به تقویم اضافه شود</span></label></div>
  <div class="card"><h2>مخاطبین (برای دعوت‌نامه)</h2><p style="margin:0 0 8px;color:var(--mut);font-size:12px">موبایل برای پیامک، ایمیل برای ایمیل، و آیدی تلگرام/ایتا (بدون @) برای باز کردن مستقیم گفتگو.</p>
  ${S.contacts.map(c=>`<div class="ct"><div class="row" style="flex-wrap:nowrap"><input data-cf="n" data-id="${c.id}" value="${esc(c.n)}" placeholder="نام"><button class="ib" data-act="dcont" data-id="${c.id}" style="flex:none">🗑</button></div>
  <div class="g"><input class="ltr" data-cf="ph" data-id="${c.id}" value="${esc(c.ph)}" inputmode="tel" placeholder="موبایل"><input class="ltr" data-cf="em" data-id="${c.id}" value="${esc(c.em)}" placeholder="ایمیل"><input class="ltr" data-cf="tg" data-id="${c.id}" value="${esc(c.tg)}" placeholder="آیدی تلگرام"><input class="ltr" data-cf="et" data-id="${c.id}" value="${esc(c.et)}" placeholder="آیدی ایتا"></div></div>`).join('')||'<div class="empty">مخاطبی ثبت نشده.</div>'}
  <button class="btn pri" data-act="acont" style="width:100%">＋ مخاطب جدید</button></div>
  <div class="card"><h2>انواع جلسه و رنگ‌ها</h2>${S.cats.map(c=>`<div class="row" style="margin-bottom:8px;flex-wrap:nowrap"><input type="color" data-cc="${c.id}" value="${c.c}" style="flex:none"><input data-cn="${c.id}" value="${esc(c.n)}"><button class="ib" data-act="dcat" data-id="${c.id}" style="flex:none">🗑</button></div>`).join('')}<button class="btn pri" data-act="acat" style="width:100%">＋ نوع جدید</button></div>
  <div class="card"><h2>پشتیبان‌گیری</h2><div class="row"><button class="btn pri" data-act="exp">⬇ پشتیبان‌گیری</button><button class="btn" data-act="imp">⬆ بازیابی</button></div><input type="file" id="fi" accept=".json,application/json" style="display:none">${bkLine()}<p style="color:var(--mut);font-size:12px">اطلاعات روی همین گوشی ذخیره می‌شود. قبل از حذف اپ یا تعویض گوشی پشتیبان بگیرید.</p></div><div class="ver">جلسات من · نسخه ${VER}</div>`;
  $('#sauto').onchange=e=>{S.auto=e.target.checked;save()};gBind();$('#sn').oninput=e=>{S.name=e.target.value;save()};$('#sc').oninput=e=>{S.company=e.target.value;save()};$('#sr').onchange=e=>{S.rem=+e.target.value;save()};$('#sth').onchange=e=>{S.theme=e.target.value;save();applyTheme()};
  $$('[data-cf]').forEach(i=>i.oninput=()=>{cOf(i.dataset.id)[i.dataset.cf]=i.value;save()});
  $$('[data-cc]').forEach(i=>i.oninput=()=>{catOf(i.dataset.cc).c=i.value;save()});$$('[data-cn]').forEach(i=>i.oninput=()=>{catOf(i.dataset.cn).n=i.value;save()});
  $('#fi').onchange=e=>{const f=e.target.files[0];if(!f)return;const rd=new FileReader();rd.onload=()=>{try{const o=JSON.parse(rd.result);if(!Array.isArray(o.meets))throw 0;S=Object.assign(DEF(),o);save();applyTheme();render();toast('بازیابی شد ✓')}catch(x){toast('فایل پشتیبان معتبر نیست')}};rd.readAsText(f)};
}

/* ---------- رویدادها ---------- */
document.addEventListener('click',e=>{const b=e.target.closest('[data-act]');if(!b)return;const a=b.dataset.act,id=b.dataset.id;
  if(a=='view'){view=b.dataset.v;render()}
  else if(a=='mode'){mode=b.dataset.m;if(view!='cal')view='cal';render()}
  else if(a=='nav'){const n=+b.dataset.n;sel=mode=='m'?addM(sel,n):addD(sel,mode=='w'?7*n:n);render()}
  else if(a=='now'){sel=TK;render()}
  else if(a=='day'){sel=b.dataset.d;render()}
  else if(a=='add')openMeet(null,b.dataset.d);
  else if(a=='slot')openMeet(null,sel,+b.dataset.h);
  else if(a=='edit')openMeet(id);else if(a=='send')openSend(id);
  else if(a=='lf'){lf=b.dataset.f;vList()}
  else if(a=='acont'){S.contacts.push({id:'p'+Date.now(),n:'',ph:'',em:'',tg:'',et:''});save();vSet();setTimeout(()=>{const l=$$('[data-cf=n]').pop();if(l)l.focus()},50)}
  else if(a=='dcont'){const i=S.contacts.findIndex(c=>c.id==id),c=S.contacts[i];S.contacts.splice(i,1);S.meets.forEach(m=>m.ppl=(m.ppl||[]).filter(x=>x!=id));save();vSet();toast('مخاطب حذف شد','برگردان',()=>{S.contacts.splice(i,0,c);save();if(view=='set')vSet()})}
  else if(a=='acat'){S.cats.push({id:'c'+Date.now(),n:'نوع جدید',c:'#1b6ca8'});save();vSet();setTimeout(()=>{const l=$$('[data-cn]').pop();if(l){l.focus();l.select()}},50)}
  else if(a=='dcat'){const i=S.cats.findIndex(c=>c.id==id),c=S.cats[i];S.cats.splice(i,1);save();vSet();toast('حذف شد','برگردان',()=>{S.cats.splice(i,0,c);save();if(view=='set')vSet()})}
  else if(a=='exp')backupNow();
  else if(a=='imp')$('#fi').click();
});
$('#modal').addEventListener('click',e=>{if(e.target.id=='modal')closeM()});
window.__back=()=>{if($('#modal').classList.contains('open')){closeM();return true}if(view!='cal'){view='cal';render();return true}if(mode!='m'){mode='m';render();return true}return false};


/* ---------- حساب Google: ورود با جی‌میل و همگام‌سازی با Google Calendar ---------- */
const GB=()=>window.AndroidBridge&&AndroidBridge.googleInfo?AndroidBridge:null;
let G={on:false,email:'',name:''};
function gRefresh(){const b=GB();if(!b)return;try{G=JSON.parse(b.googleInfo())}catch(e){}}
let gseq=0;const gwait={};
window.__http=(id,res)=>{const f=gwait[id];if(!f)return;delete gwait[id];try{f(JSON.parse(res))}catch(e){f({status:0,body:''})}};
const gcall=(method,url,body)=>new Promise(res=>{const b=GB();if(!b||!G.on){res({status:0,body:''});return}const id='h'+(++gseq);gwait[id]=res;b.http(id,method,url,body?JSON.stringify(body):'')});
window.__googleState=s=>{try{G=JSON.parse(s)}catch(e){}if(G.error)toast('ورود انجام نشد: '+G.error);else onG()};
function onG(){const was=window.__gwas;gRefresh();window.__gwas=G.on;
  if(G.on&&!was){if(!S.name&&G.name){S.name=G.name;save()}toast('وارد حساب Google شدید: '+G.email);if(view=='set')vSet();gPull()}
  else if(G.on&&Date.now()-(S.g.lastSync||0)>120000)gPull()}
const GCAL='https://www.googleapis.com/calendar/v3/calendars/primary/events';
const TZ=(()=>{try{return Intl.DateTimeFormat().resolvedOptions().timeZone||'Asia/Tehran'}catch(e){return 'Asia/Tehran'}})();
const gIso=(k,t)=>{const g=d2g(kj(k));return `${g.gy}-${p2(g.gm)}-${p2(g.gd)}T${t}:00`};
function gBody(m){const att=(m.ppl||[]).map(cOf).filter(c=>c&&/@/.test(c.em||'')).map(c=>({email:c.em.trim(),displayName:c.n}));
  const b={summary:m.t,location:m.loc||'',description:m.n||'',start:{dateTime:gIso(m.d,m.s),timeZone:TZ},end:{dateTime:gIso(m.d,m.e),timeZone:TZ},
    reminders:m.r>=0?{useDefault:false,overrides:[{method:'popup',minutes:m.r}]}:{useDefault:true},extendedProperties:{private:{jmid:m.id}}};
  if(att.length)b.attendees=att;return b}
const rsvpOf=ev=>{const a=ev.attendees;if(!a||!a.length)return null;const o={y:0,n:0,m:0,w:0};a.forEach(x=>{if(x.self||x.organizer)return;const s=x.responseStatus;if(s=='accepted')o.y++;else if(s=='declined')o.n++;else if(s=='tentative')o.m++;else o.w++});return o};
async function gPush(m,retry){
  if(!G.on||S.g.sync===false||m.gimp)return;
  const q='?sendUpdates=all';let r;
  if(m.x){if(!m.gid)return;r=await gcall('DELETE',GCAL+'/'+encodeURIComponent(m.gid)+q);if([200,204,404,410].includes(r.status)){m.gid='';m.dirty=0}else m.dirty=1;save();return}
  r=m.gid?await gcall('PATCH',GCAL+'/'+encodeURIComponent(m.gid)+q,gBody(m)):await gcall('POST',GCAL+q,gBody(m));
  if(m.gid&&(r.status==404||r.status==410)&&!retry){m.gid='';return gPush(m,true)}
  if(r.status>=200&&r.status<300){try{const ev=JSON.parse(r.body);m.gid=ev.id;m.gupd=ev.updated;m.rsvp=rsvpOf(ev);m.dirty=0}catch(e){}}else m.dirty=1;
  save();if(view=='cal')render()}
function gDel(m){if(!G.on||!m.gid||m.gimp)return;gcall('DELETE',GCAL+'/'+encodeURIComponent(m.gid)+'?sendUpdates=all')}
async function gPull(){
  if(!G.on||S.g.sync===false)return;
  S.meets.filter(m=>m.dirty&&!m.gimp).forEach(m=>gPush(m));
  const now=Date.now(),min=new Date(now-30*864e5).toISOString(),max=new Date(now+180*864e5).toISOString();
  const r=await gcall('GET',GCAL+'?singleEvents=true&showDeleted=true&maxResults=250&orderBy=startTime&timeMin='+encodeURIComponent(min)+'&timeMax='+encodeURIComponent(max));
  if(r.status!=200){if(r.status==401||r.status==403)toast('دسترسی Google کافی نیست؛ از تنظیمات دوباره وارد شوید');return}
  let items=[];try{items=JSON.parse(r.body).items||[]}catch(e){return}
  const when=t=>{if(!t)return null;if(t.dateTime){const D=new Date(t.dateTime);return{k:jk(g2d(D.getFullYear(),D.getMonth()+1,D.getDate())),t:p2(D.getHours())+':'+p2(D.getMinutes())}}
    if(t.date){const a=t.date.split('-').map(Number);return{k:jk(g2d(a[0],a[1],a[2])),t:null}}return null};
  let n=0;
  items.forEach(ev=>{
    const jm=ev.extendedProperties&&ev.extendedProperties.private&&ev.extendedProperties.private.jmid;
    const loc=S.meets.find(m=>m.gid==ev.id)||(jm&&S.meets.find(m=>m.id==jm));
    if(ev.status=='cancelled'){if(loc&&!loc.x){loc.x=true;loc.gid='';n++}return}
    const a=when(ev.start),b=when(ev.end);if(!a)return;
    const s=a.t||'00:00';let e=b&&b.t?b.t:(a.t?hm(Math.min(tmin(s)+60,1439)):'23:59');if(b&&b.k!=a.k&&a.t)e='23:59';if(tmin(e)<=tmin(s))e=hm(Math.min(tmin(s)+60,1439));
    const f={d:a.k,s,e,t:ev.summary||'(بدون عنوان)',loc:ev.location||'',n:ev.description||'',gid:ev.id,gupd:ev.updated,rsvp:rsvpOf(ev)};
    if(!loc){let c=S.cats.find(x=>x.n=='Google');if(!c){c={id:'cg',n:'Google',c:'#4285f4'};S.cats.push(c)}
      const o=ev.organizer||{};S.meets.push(Object.assign({id:'g'+Date.now()+Math.random().toString(36).slice(2,5),gimp:1,c:c.id,ppl:[],r:S.rem,x:false,from:o.self?'':(o.displayName||o.email||'')},f));n++}
    else if(!loc.gupd||ev.updated>loc.gupd){Object.assign(loc,f);loc.x=false;n++}
    else loc.rsvp=f.rsvp});
  S.g.lastSync=Date.now();save();if(n)toast(fa(n)+' جلسه از Google به‌روز شد');if(view=='cal'||view=='list')render()}
const gCard=()=>{const b=GB();let body;
  if(!b)body='<p style="margin:0;color:var(--mut);font-size:12px">اتصال به Google فقط در اپ اندروید کار می‌کند.</p>';
  else if(G.on)body=`<div style="margin-bottom:10px"><b>✅ ${esc(G.email)}</b><div style="color:var(--mut);font-size:12px">${esc(G.name||'')}</div></div>
    <label class="f" style="flex-direction:row;align-items:center;gap:8px"><input type="checkbox" id="gsync" ${S.g.sync!==false?'checked':''} style="width:20px;min-height:0;flex:none"><span style="font-size:13px;color:var(--tx)">جلسه‌ها در Google Calendar ثبت شوند و دعوت مهمانان (دارای ایمیل) را خود Google بفرستد</span></label>
    <div class="row"><button class="btn pri" id="gnow">🔄 همگام‌سازی الان</button><button class="btn bad" id="gout">خروج</button></div>
    <p style="margin:8px 0 0;font-size:12px;color:var(--mut)">آخرین همگام‌سازی: ${S.g.lastSync?fa(Math.max(0,Math.floor((Date.now()-S.g.lastSync)/60000)))+' دقیقه پیش':'—'}</p>`;
  else body=`<p style="margin:0 0 8px;color:var(--mut);font-size:12px">با حساب Google وارد شوید تا جلسات با Google Calendar همگام شود و دعوت‌ها از طریق Gmail برای مهمانان برود. مهمانی که با Google وارد اپ شود، جلسه را خودکار در اپ خودش می‌بیند.</p>
    <label class="f"><span>Client ID</span><input id="gcid" class="ltr" value="${esc(S.g.cid)}" placeholder="xxxx.apps.googleusercontent.com"></label>
    <label class="f"><span>Client Secret</span><input id="gsec" class="ltr" value="${esc(S.g.secret)}" placeholder="GOCSPX-..."></label>
    <button class="btn pri" id="gin" style="width:100%">ورود با Google</button>
    <details style="margin-top:10px;font-size:12px;color:var(--mut)"><summary style="cursor:pointer;color:var(--act)">راهنمای ساخت Client ID (یک‌بار)</summary><ol style="padding-right:18px;line-height:1.9">
    <li>در console.cloud.google.com یک پروژه بسازید.</li><li>APIs &amp; Services ← Library ← «Google Calendar API» را Enable کنید.</li>
    <li>OAuth consent screen ← External ← نام برنامه و ایمیل ← در Scopes گزینه‌ی <span dir="ltr">calendar.events</span> را اضافه کنید ← در Test users جی‌میل خودتان (و همکاران) را بیفزایید. برای اینکه هر هفته لازم نباشد دوباره وارد شوید، «Publish app» را بزنید.</li>
    <li>Credentials ← Create credentials ← OAuth client ID ← نوع <b>Desktop app</b> ← Client ID و Secret را اینجا بچسبانید.</li></ol></details>`;
  return `<div class="card"><h2>حساب Google (جی‌میل)</h2>${body}</div>`};
function gBind(){
  if($('#gin'))$('#gin').onclick=()=>{S.g.cid=$('#gcid').value.trim();S.g.secret=$('#gsec').value.trim();save();if(!S.g.cid||!S.g.secret){toast('Client ID و Secret را وارد کنید');return}toast('مرورگر باز می‌شود؛ بعد از ورود به اپ برگردید');GB().googleSignIn(S.g.cid,S.g.secret)};
  if($('#gout'))$('#gout').onclick=()=>{GB().googleSignOut();G.on=false;window.__gwas=false;vSet()};
  if($('#gnow'))$('#gnow').onclick=()=>{toast('در حال همگام‌سازی…');gPull()};
  if($('#gsync'))$('#gsync').onchange=e=>{S.g.sync=e.target.checked;save()}}

/* ---------- یادآوری پشتیبان‌گیری ---------- */
function backupNow(){S.lastBackup=Date.now();save();dl(new Blob([JSON.stringify(S)],{type:'application/json'}),`meetings-backup-${TK}.json`)}
const bkLine=()=>`<p style="margin:8px 0 0;font-size:12px;color:var(--mut)">آخرین پشتیبان: ${S.lastBackup?fa(Math.floor((Date.now()-S.lastBackup)/864e5))+' روز پیش':'هنوز پشتیبان نگرفته‌اید'}</p>`;
function backupNag(){if(!S.meets.length)return;if(Date.now()-(S.lastBackup||S.firstUse||Date.now())>30*864e5)toast('بیش از ۳۰ روز از آخرین پشتیبان‌گیری گذشته','پشتیبان بگیر',backupNow)}
(()=>{let t;$('#main').addEventListener('scroll',()=>{const f=$('#fab');f.classList.add('hide');clearTimeout(t);t=setTimeout(()=>f.classList.remove('hide'),700)},{passive:true})})();
gRefresh();window.__gwas=G.on;applyTheme();render();syncRem();setTimeout(window.__resume,300);setTimeout(backupNag,2000);
