/* Prumo Finanças — app.js */
(function(){
"use strict";
/* ================= utilidades ================= */
const $=s=>document.querySelector(s);
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const LS="prumo-financas-v1";
const lsGet=k=>{try{return localStorage.getItem(LS+k)}catch(e){return null}};
const lsSet=(k,v)=>{try{if(v==null) localStorage.removeItem(LS+k); else localStorage.setItem(LS+k,v)}catch(e){}};
let oculto=lsGet("-oculto")==="1";
const brl=v=>oculto?"R$ •••":(v<0?"-":"")+"R$ "+Math.abs(v).toLocaleString("pt-BR",{minimumFractionDigits:2,maximumFractionDigits:2});
const money=v=>{if(oculto) return `<span class="cur">R$</span>•••`; const [i,c]=Math.abs(v).toLocaleString("pt-BR",{minimumFractionDigits:2,maximumFractionDigits:2}).split(","); return `<span class="cur">${v<0?"-":""}R$</span>${i}<span class="cts">,${c}</span>`};
const brl0=v=>oculto?"R$ •••":(v<0?"-":"")+"R$ "+Math.abs(Math.round(v)).toLocaleString("pt-BR");
const uid=()=>Math.random().toString(36).slice(2,10)+Date.now().toString(36).slice(-4);
const r2=v=>Math.round(v*100)/100;
const today=new Date(); today.setHours(0,0,0,0);
const iso=d=>d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");
const mkey=d=>d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0");
const parseISO=s=>{const [y,m,d]=s.split("-").map(Number);return new Date(y,m-1,d||1)};
const MESES=["janeiro","fevereiro","março","abril","maio","junho","julho","agosto","setembro","outubro","novembro","dezembro"];
const cap=s=>s[0].toUpperCase()+s.slice(1);
const fmtDate=s=>{const d=parseISO(s);return d.getDate()+" "+MESES[d.getMonth()].slice(0,3)};
const icon=(id,cls="")=>`<svg class="${cls}" aria-hidden="true"><use href="#${id}"/></svg>`;
const daysIn=(y,m)=>new Date(y,m+1,0).getDate();
const addMonths=(isoStr,n)=>{const d=parseISO(isoStr);const t=new Date(d.getFullYear(),d.getMonth()+n,1);t.setDate(Math.min(d.getDate(),daysIn(t.getFullYear(),t.getMonth())));return iso(t)};
const MK=mkey(today);
const keyAdd=(k,n)=>mkey(new Date(+k.slice(0,4),+k.slice(5,7)-1+n,1));
const keyLabel=k=>MESES[+k.slice(5,7)-1];
const num=s=>{if(s==null) return NaN; s=String(s).trim().replace(/r\$\s*/i,"").replace(/\s/g,""); if(/,\d{1,2}$/.test(s)) s=s.replace(/\./g,"").replace(",","."); else if(/^-?\d{1,3}(\.\d{3})+$/.test(s)) s=s.replace(/\./g,""); else s=s.replace(/,/g,""); return parseFloat(s)};
const norm=s=>String(s||"").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"");

const CATS={"Moradia":"necessario","Mercado":"necessario","Contas":"necessario","Transporte":"necessario","Saúde":"necessario","Educação":"necessario","Trabalho":"necessario",
  "Delivery":"nao","Lazer":"nao","Compras":"nao","Assinaturas":"nao","Beleza":"nao","Outros":"nao"};
const GASTO_CATS=Object.keys(CATS).filter(c=>c!=="Trabalho");
const PRIO={super:{label:"Super importante",short:"Super",cls:"p-super"},importante:{label:"Importante",short:"Importante",cls:"p-importante"},relativa:{label:"Relativa",short:"Relativa",cls:"p-relativa"}};

/* ================= estado ================= */
function exampleState(){
  const y=today.getFullYear(),m=today.getMonth(),d=today.getDate();
  const day=n=>iso(new Date(y,m,Math.max(1,Math.min(n,daysIn(y,m)))));
  const rel=n=>iso(new Date(y,m,d+n));
  const prev=n=>iso(new Date(y,m-1,n));
  const g="g"+uid();
  const S0={exemplo:true,config:{renda:6500,limite:4200,metaGuardar:20,diasAviso:3},
    contas:[
      {id:uid(),nome:"Aluguel",valor:1450,dia:Math.min(d+2,28),prio:"super",rec:true,cat:"Moradia",pagos:{}},
      {id:uid(),nome:"Conta de luz (Cemig)",valor:186.4,dia:Math.max(1,d-2),prio:"super",rec:true,cat:"Contas",pagos:{}},
      {id:uid(),nome:"Internet",valor:119.9,dia:Math.min(d+6,28),prio:"importante",rec:true,cat:"Contas",pagos:{}},
      {id:uid(),nome:"Fatura do cartão",valor:980,dia:Math.min(d+10,28),prio:"super",rec:true,cat:"Contas",pagos:{}},
      {id:uid(),nome:"Plano de saúde",valor:410,dia:5,prio:"importante",rec:true,cat:"Saúde",pagos:{[MK]:true}},
      {id:uid(),nome:"Academia",valor:99,dia:Math.min(d+4,28),prio:"relativa",rec:true,cat:"Saúde",pagos:{}}
    ],
    lanc:[
      {id:uid(),tipo:"renda",valor:6500,desc:"Salário / clientes",cat:"Trabalho",nec:"necessario",data:day(1)},
      {id:uid(),tipo:"gasto",valor:410,desc:"Plano de saúde",cat:"Saúde",nec:"necessario",data:day(5)},
      {id:uid(),tipo:"gasto",valor:612.35,desc:"Mercado do mês",cat:"Mercado",nec:"necessario",data:rel(-6)},
      {id:uid(),tipo:"gasto",valor:240,desc:"Gasolina",cat:"Transporte",nec:"necessario",data:rel(-4)},
      {id:uid(),tipo:"gasto",valor:89.9,desc:"iFood",cat:"Delivery",nec:"nao",data:rel(-3)},
      {id:uid(),tipo:"gasto",valor:64,desc:"iFood",cat:"Delivery",nec:"nao",data:rel(-1)},
      {id:uid(),tipo:"gasto",valor:8,desc:"Café",cat:"Lazer",nec:"nao",data:rel(-2)},
      {id:uid(),tipo:"gasto",valor:8,desc:"Café",cat:"Lazer",nec:"nao",data:rel(0)},
      {id:uid(),tipo:"gasto",valor:180,desc:"Jogo do Galo",cat:"Lazer",nec:"nao",data:rel(-2)},
      {id:uid(),tipo:"guardar",valor:300,desc:"Reserva de emergência",cat:"Metas",nec:"necessario",data:day(2),meta:"m1"},
      {id:uid(),tipo:"renda",valor:6200,desc:"Salário / clientes",cat:"Trabalho",nec:"necessario",data:prev(1)},
      {id:uid(),tipo:"gasto",valor:1450,desc:"Aluguel",cat:"Moradia",nec:"necessario",data:prev(8)},
      {id:uid(),tipo:"gasto",valor:705,desc:"Mercado do mês",cat:"Mercado",nec:"necessario",data:prev(6)},
      {id:uid(),tipo:"gasto",valor:420,desc:"Delivery do mês",cat:"Delivery",nec:"nao",data:prev(20)},
      {id:uid(),tipo:"gasto",valor:310,desc:"Lazer do mês",cat:"Lazer",nec:"nao",data:prev(15)}
    ],
    metas:[{id:"m1",nome:"Reserva de emergência",alvo:15000,guardado:4300,prazo:iso(new Date(y+1,m+6,1))},{id:"m2",nome:"Notebook novo",alvo:6000,guardado:1250,prazo:iso(new Date(y,m+5,1))}],
    orc:{"Delivery":200,"Lazer":300,"Mercado":800},
    rec:[{id:uid(),tipo:"gasto",valor:55.9,desc:"Streaming",cat:"Assinaturas",nec:"nao",dia:12,lanc:{}}],
    ultimaCat:"Mercado",
    emp:{ativo:true,salario:3600,adiant:1800,diaAdiant:15,diaFech:30,noSaldo:false,pagos:{},itens:[{id:uid(),valor:50,desc:"Almoço",data:rel(-3)},{id:uid(),valor:120,desc:"Gasolina",data:rel(-2)},{id:uid(),valor:30,desc:"",data:rel(0)}]}
  };
  for(let i=0;i<6;i++) S0.lanc.push({id:uid(),tipo:"gasto",valor:i<5?100:99.9,desc:`Tênis Shopee (${i+1}/6)`,cat:"Compras",nec:"nao",data:addMonths(rel(-5),i),parc:{g,i:i+1,n:6}});
  return S0;
}
function emptyState(){return fixState({exemplo:false,config:{renda:0,limite:0,metaGuardar:20,diasAviso:3,nome:(S&&S.config&&S.config.nome)||""},contas:[],lanc:[],metas:[],orc:{},rec:[],ultimaCat:"Mercado"})}
const EMP0={ativo:false,salario:3600,adiant:1800,diaAdiant:15,diaFech:30,noSaldo:true,itens:[],pagos:{}};
function fixState(s){s.carteiras=s.carteiras||[];s.cartoes=s.cartoes||[];s.fat=s.fat||{};s.transf=s.transf||[];s.dividas=s.dividas||[];s.desafios=Object.assign({s52:{ativo:false,base:5,feitas:{},inicio:null,meta:null},arred:{ativo:false,passo:5,meta:null},semDelivery:{ativo:false},diasZero:{ativo:false}},s.desafios||{});s.emp=Object.assign({},EMP0,s.emp||{});s.emp.itens=s.emp.itens||[];s.emp.pagos=s.emp.pagos||{};s.orc=s.orc||{};s.rec=s.rec||[];s.metas=s.metas||[];s.contas=s.contas||[];s.lanc=s.lanc||[];s.config=Object.assign({renda:0,limite:0,metaGuardar:20,diasAviso:3},s.config||{});return s}

let S=fixState(exampleState());
let undoSnap=null, selMode=false, sel=new Set();
let route="inicio", VK=MK, lancFilter="todos", chat=[], notifOpen=false, contasView=lsGet("-contasview")||"lista", calDay=null;
{const loc=(()=>{try{const r=localStorage.getItem(LS);return r?JSON.parse(r):null}catch(e){return null}})(); if(loc) S=fixState(loc);}

/* ================= persistência local + nuvem ================= */
let sb=null, sess=null, cfg=null, pushT=null, pushing=false, again=false, dirty=lsGet("-dirty")==="1", syncMsg="";
function localSave(){try{localStorage.setItem(LS,JSON.stringify(S))}catch(e){}}
function persist(){if(typeof carimbar==="function") carimbar(); S.atualizado=new Date().toISOString(); localSave(); if(sb&&sess&&!S.exemplo){dirty=true;lsSet("-dirty","1");clearTimeout(pushT);pushT=setTimeout(pushCloud,800)} setSync()}
async function pushCloud(){
  if(!sb||!sess||S.exemplo) return;
  if(pushing){again=true;return}
  pushing=true;
  try{const {error}=await sb.from("estado").upsert({user_id:sess.user.id,dados:S,atualizado:S.atualizado||new Date().toISOString()}); if(error) throw error; dirty=false; lsSet("-dirty",null); syncMsg=""}
  catch(e){syncMsg=navigator.onLine?"Erro ao salvar na nuvem":"Sem internet, salvo no aparelho"}
  pushing=false; setSync(); if(again){again=false;pushCloud()}
}
async function pullCloud(){
  if(!sb||!sess) return;
  const {data,error}=await sb.from("estado").select("dados,atualizado").eq("user_id",sess.user.id).maybeSingle();
  if(error){syncMsg="Não consegui ler a nuvem";setSync();return}
  if(!data){ if(!S.exemplo) await pushCloud(); setSync(); return }
  const nuvem=data.dados, tN=Date.parse(data.atualizado)||0, tL=Date.parse(S.atualizado||0)||0;
  if(S.exemplo||!S.lanc.length&&!S.contas.length||tN>=tL&&!dirty){ S=fixState(nuvem); localSave(); runRecurring(); render(); }
  else if(tL>tN){ await pushCloud(); }
  else { try{localStorage.setItem(LS+"-antes-sync",JSON.stringify(S))}catch(e){} S=fixState(nuvem); localSave(); render(); }
  setSync();
}
function setSync(){
  const t=!sb?"Salvo neste aparelho":!sess?"Só neste aparelho · entre para salvar na nuvem":syncMsg||(dirty?"Salvando…":"Salvo na nuvem");
  const ok=sb&&sess&&!syncMsg&&!dirty;
  document.querySelectorAll(".sync").forEach(el=>el.innerHTML=`<i class="${ok?"":"off"}"></i><span>${esc(t)}</span>`);
}
async function initCloud(){
  try{
    let c=null;
    try{const r=await fetch("/api/config",{cache:"no-store"}); if(r.ok) c=await r.json(); if(c&&c.supabaseUrl) lsSet("-cfg",JSON.stringify(c))}catch(e){}
    if(!c||!c.supabaseUrl){try{c=JSON.parse(lsGet("-cfg"))}catch(e){c=null}}
    cfg=c;
    if(cfg&&cfg.supabaseUrl){try{cfg.supabaseUrl=new URL(String(cfg.supabaseUrl).trim()).origin}catch(e){}}
    if(!cfg||!cfg.supabaseUrl||!cfg.supabaseAnonKey||!window.supabase){setSync();return}
    sb=window.supabase.createClient(cfg.supabaseUrl,cfg.supabaseAnonKey,{auth:{persistSession:true,autoRefreshToken:true}});
    const {data:{session}}=await sb.auth.getSession(); sess=session;
    sb.auth.onAuthStateChange((ev,s)=>{sess=s;setSync(); if(route==="ajustes") render()});
    if(sess){ await pullCloud(); if(!meuNome()&&!S.exemplo&&!isLocked()) setTimeout(()=>{if(!$("#layer").innerHTML) sheetNome()},800) }
    else if(!lsGet("-semconta")&&!isLocked()) sheetLogin();
    setSync();
  }catch(e){setSync()}
}
window.addEventListener("online",()=>{if(dirty) pushCloud()});
document.addEventListener("visibilitychange",()=>{if(document.visibilityState==="visible"&&sess&&!dirty) pullCloud()});

/* ================= tema ================= */
let tema=lsGet("-tema")||"auto";
const escuroAgora=()=>tema==="escuro"||(tema==="auto"&&matchMedia("(prefers-color-scheme: dark)").matches);
function aplicarTema(){
  const r=document.documentElement;
  if(tema==="claro") r.setAttribute("data-theme","light"); else if(tema==="escuro") r.setAttribute("data-theme","dark"); else r.removeAttribute("data-theme");
  const m=document.getElementById("metaTheme"); if(m) m.setAttribute("content",escuroAgora()?"#0A0C11":"#F4F3EF");
}
try{matchMedia("(prefers-color-scheme: dark)").addEventListener("change",()=>{if(tema==="auto"){aplicarTema();render()}})}catch(e){}
aplicarTema();

/* ================= cálculos ================= */
const isCur=()=>VK===MK;
const vmY=()=>+VK.slice(0,4), vmM=()=>+VK.slice(5,7)-1;
function monthTx(k=VK){return S.lanc.filter(t=>t.data.slice(0,7)===k)}
function billDue(c,k=VK){ if(c.rec){const y=+k.slice(0,4),m=+k.slice(5,7)-1;return new Date(y,m,Math.min(c.dia,daysIn(y,m)))} return parseISO(c.data)}
function billPaid(c,k=VK){return c.rec?!!(c.pagos&&c.pagos[k]):!!c.pago}
function billStatus(c,k=VK){
  if(billPaid(c,k)) return {k:"paid",txt:"Paga"};
  const diff=Math.round((billDue(c,k)-today)/864e5);
  if(diff<0) return {k:"overdue",txt:"Atrasada "+(-diff)+(diff===-1?" dia":" dias"),diff};
  if(diff===0) return {k:"soon",txt:"Vence hoje",diff};
  if(diff<=S.config.diasAviso) return {k:"soon",txt:"Vence em "+diff+(diff===1?" dia":" dias"),diff};
  return {k:"open",txt:"Vence "+fmtDate(iso(billDue(c,k))),diff};
}
function visibleBills(k=VK){
  return S.contas.filter(c=>c.rec?true:(c.data.slice(0,7)===k||(k===MK&&!c.pago&&c.data.slice(0,7)<k)));
}
function totals(k=VK){
  const tx=monthTx(k);
  const renda=tx.filter(t=>t.tipo==="renda").reduce((a,t)=>a+t.valor,0);
  const gastos=tx.filter(t=>t.tipo==="gasto");
  const gasto=gastos.reduce((a,t)=>a+t.valor,0);
  const nec=gastos.filter(t=>t.nec==="necessario").reduce((a,t)=>a+t.valor,0);
  const nao=gasto-nec;
  const guardado=tx.filter(t=>t.tipo==="guardar").reduce((a,t)=>a+t.valor,0);
  const aPagar=visibleBills(k).filter(c=>!billPaid(c,k)).reduce((a,c)=>a+c.valor,0);
  const rendaRef=renda||S.config.renda;
  const livre=rendaRef-gasto-guardado-aPagar;
  const limite=S.config.limite||rendaRef*0.8||0;
  const uso=limite?(gasto+aPagar)/limite:0;
  const y=+k.slice(0,4),m=+k.slice(5,7)-1;
  const dimRest=k===MK?daysIn(y,m)-today.getDate()+1:k>MK?daysIn(y,m):0;
  const porDia=dimRest?Math.max(0,(limite-gasto-aPagar))/dimRest:0;
  return {renda,rendaRef,gasto,nec,nao,guardado,aPagar,livre,limite,uso,porDia,dimRest};
}
function catSpend(k=VK){const by={}; monthTx(k).filter(t=>t.tipo==="gasto").forEach(t=>by[t.cat]=(by[t.cat]||0)+t.valor); return by}
function budgetState(k=VK){
  const by=catSpend(k);
  return Object.entries(S.orc||{}).filter(([,v])=>v>0).map(([c,lim])=>({c,lim,g:by[c]||0,p:(by[c]||0)/lim})).sort((a,b)=>b.p-a.p);
}
function alerts(){
  const out=[]; const T=totals(MK);
  visibleBills(MK).forEach(c=>{const s=billStatus(c,MK); if(s.k==="overdue") out.push({lv:"bad",txt:`${c.nome} está atrasada (${brl(c.valor)}).`}); else if(s.k==="soon") out.push({lv:"warn",txt:`${c.nome}: ${s.txt.toLowerCase()}, ${brl(c.valor)}.`})});
  if(T.limite&&T.uso>=1) out.unshift({lv:"bad",txt:`Você passou do limite do mês em ${brl(T.gasto+T.aPagar-T.limite)}.`});
  else if(T.limite&&T.uso>=.85) out.unshift({lv:"warn",txt:`Você já comprometeu ${Math.round(T.uso*100)}% do limite do mês.`});
  budgetState(MK).forEach(b=>{ if(b.p>=1) out.push({lv:"bad",txt:`${b.c} passou do orçamento: ${brl0(b.g)} de ${brl0(b.lim)}.`}); else if(b.p>=.85) out.push({lv:"warn",txt:`${b.c} está em ${Math.round(b.p*100)}% do orçamento.`})});
  S.cartoes.forEach(k=>{[keyAdd(MK,-1),MK,keyAdd(MK,1)].forEach(key=>{const tot=fatTotal(k,key); if(!tot) return; const st=fatStatus(k,key); if(st.k==="overdue") out.push({lv:"bad",txt:`Fatura ${k.nome} venceu (${brl(tot)}).`}); else if(st.k==="soon") out.push({lv:"warn",txt:`Fatura ${k.nome}: ${st.txt.toLowerCase()}, ${brl(tot)}.`})})});
  S.dividas.forEach(d=>{ if(!d.restantes||divPaga(d)) return; const diff=Math.min(d.dia,daysIn(today.getFullYear(),today.getMonth()))-today.getDate(); if(diff<0) out.push({lv:"bad",txt:`Parcela de ${d.nome} atrasada (${brl(d.parcela)}).`}); else if(diff<=S.config.diasAviso) out.push({lv:"warn",txt:`Parcela de ${d.nome} vence ${diff?"em "+diff+" dia"+(diff>1?"s":""):"hoje"} (${brl(d.parcela)}).`}) });
  if(E().ativo){const R=empResumo(MK); if(R.deve) out.push({lv:"bad",txt:`Empréstimos da empresa passaram ${brl(R.deve)} do que você recebe no dia ${fechDay(MK)}.`}); else if(R.base&&R.pego+R.carry>=R.base*.8) out.push({lv:"warn",txt:`Empréstimos da empresa já somam ${brl(R.pego+R.carry)}. No dia ${fechDay(MK)} sobram ${brl(R.receber)}.`})}
  if(T.rendaRef&&T.nao/T.rendaRef>.3) out.push({lv:"warn",txt:`Gastos não necessários em ${Math.round(T.nao/T.rendaRef*100)}% da renda (o ideal é até 30%).`});
  return out;
}
function futuro(n=3){
  const out=[];
  for(let i=1;i<=n;i++){
    const k=keyAdd(MK,i);
    const parc=S.lanc.filter(t=>t.parc&&t.data.slice(0,7)===k).reduce((a,t)=>a+t.valor,0);
    const fixas=S.contas.filter(c=>c.rec).reduce((a,c)=>a+c.valor,0)+S.rec.filter(r=>r.tipo==="gasto").reduce((a,r)=>a+r.valor,0)+S.contas.filter(c=>!c.rec&&!c.pago&&c.data.slice(0,7)===k).reduce((a,c)=>a+c.valor,0);
    out.push({k,parc,fixas,total:parc+fixas});
  }
  return out;
}
function insights(k=VK){
  const T=totals(k), out=[]; const by=catSpend(k);
  const naoCats=Object.entries(by).filter(([c])=>CATS[c]==="nao").sort((a,b)=>b[1]-a[1]);
  if(naoCats.length){const [c,v]=naoCats[0]; const m=S.metas[0];
    out.push({ic:"tip",t:`Seu maior gasto não necessário é <b>${esc(c)}</b> (${brl(v)}). Cortar pela metade libera ${brl(v/2)} por mês${m?`. ${esc(m.nome)} chegaria ${mesesPara(m,v/2)}`:""}.`});}
  const prevT=totals(keyAdd(k,-1));
  if(prevT.gasto&&T.gasto&&k<=MK){const d=(T.gasto-prevT.gasto)/prevT.gasto; if(Math.abs(d)>.05) out.push({ic:d>0?"warn":"tip",t:`Você gastou ${Math.abs(Math.round(d*100))}% ${d>0?"a mais":"a menos"} que em ${keyLabel(keyAdd(k,-1))}${k===MK?" até agora":""}.`});}
  const alvo=T.rendaRef*(S.config.metaGuardar/100);
  if(T.rendaRef){ if(T.guardado<alvo) out.push({ic:"gold",t:`Faltam ${brl(alvo-T.guardado)} para guardar ${S.config.metaGuardar}% da renda em ${keyLabel(k)}. Guarde assim que o dinheiro entrar.`}); else out.push({ic:"gold",t:`Meta de guardar ${S.config.metaGuardar}% batida em ${keyLabel(k)}.`});}
  if(T.limite&&T.dimRest) out.push({ic:T.porDia<30?"bad":"tip",t:`Para fechar o mês dentro do limite, você pode gastar até <b>${brl(T.porDia)} por dia</b> nos próximos ${T.dimRest} dias.`});
  const f=futuro(1)[0]; if(k===MK&&f.parc) out.push({ic:"warn",t:`${cap(keyLabel(f.k))} já começa com ${brl(f.parc)} em parcelas. Pense duas vezes antes de parcelar mais.`});
  return out;
}
function mesesPara(m,extra){const falta=m.alvo-m.guardado; if(falta<=0) return "já está completa"; const n=Math.ceil(falta/extra); return n<=1?"no próximo mês":"em "+n+" meses só com essa economia"}
function resumo(k){
  const T=totals(k); const by=Object.entries(catSpend(k)).sort((a,b)=>b[1]-a[1]).slice(0,3);
  const prev=totals(keyAdd(k,-1));
  return {k,T,top:by,prev,bateu:T.rendaRef&&T.guardado>=T.rendaRef*S.config.metaGuardar/100,naoPagas:visibleBills(k).filter(c=>!billPaid(c,k)).length};
}

/* ================= empréstimos da empresa ================= */
const E=()=>S.emp;
const fechDay=k=>Math.min(E().diaFech,daysIn(+k.slice(0,4),+k.slice(5,7)-1));
const adiDay=k=>Math.min(E().diaAdiant,daysIn(+k.slice(0,4),+k.slice(5,7)-1));
const cicloDe=d=>{const k=d.slice(0,7);return +d.slice(8,10)>fechDay(k)?keyAdd(k,1):k};
const empItens=k=>E().itens.filter(i=>cicloDe(i.data)===k).sort((a,b)=>b.data.localeCompare(a.data));
const empPego=k=>empItens(k).reduce((a,i)=>a+i.valor,0);
function empCarry(k){ // dívida que vem do ciclo anterior
  const ks=E().itens.map(i=>cicloDe(i.data)).sort(); if(!ks.length||ks[0]>=k) return 0;
  let c=0; for(let x=ks[0];x<k;x=keyAdd(x,1)){const r=(E().salario-E().adiant)-empPego(x)-c; c=r<0?-r:0} return c;
}
function empResumo(k=VK){
  const pego=empPego(k), carry=empCarry(k), base=E().salario-E().adiant, rest=base-pego-carry;
  return {pego,carry,base,rest,receber:Math.max(0,rest),deve:rest<0?-rest:0,n:empItens(k).length};
}
function empTx(kind,k){return S.lanc.find(t=>t.emp===kind&&t.empK===k)}
function runEmpresa(){
  if(S.exemplo||!E().ativo||!E().noSaldo) return false;
  let mudou=false; const k=MK, P=E().pagos[k]=E().pagos[k]||{};
  if(today.getDate()>=adiDay(k)&&!P.a){S.lanc.push({id:uid(),tipo:"renda",valor:E().adiant,desc:`Salário · adiantamento dia ${adiDay(k)}`,cat:"Trabalho",nec:"necessario",data:`${k}-${String(adiDay(k)).padStart(2,"0")}`,emp:"a",empK:k});P.a=1;mudou=true}
  if(today.getDate()>=fechDay(k)&&!P.f){S.lanc.push({id:uid(),tipo:"renda",valor:empResumo(k).receber,desc:`Salário · dia ${fechDay(k)} (com desconto dos empréstimos)`,cat:"Trabalho",nec:"necessario",data:`${k}-${String(fechDay(k)).padStart(2,"0")}`,emp:"f",empK:k});P.f=1;mudou=true}
  return mudou;
}
function syncEmp(){ // mantém o salário do dia 30 e as entradas dos empréstimos em dia
  S.lanc.filter(t=>t.emp==="f").forEach(t=>{t.valor=empResumo(t.empK).receber});
  if(!E().noSaldo){S.lanc=S.lanc.filter(t=>t.emp!=="l");return}
  const ids=new Set(E().itens.map(i=>i.id));
  S.lanc=S.lanc.filter(t=>t.emp!=="l"||ids.has(t.empId));
  E().itens.forEach(i=>{let t=S.lanc.find(x=>x.emp==="l"&&x.empId===i.id); const desc="Empréstimo empresa"+(i.desc?": "+i.desc:"");
    if(!t) S.lanc.push({id:uid(),tipo:"renda",valor:i.valor,desc,cat:"Trabalho",nec:"necessario",data:i.data,emp:"l",empId:i.id}); else Object.assign(t,{valor:i.valor,desc,data:i.data})});
}
function addEmp(valor,desc,data){
  if(S.exemplo){S=emptyState()} E().ativo=true;
  const i={id:uid(),valor:r2(valor),desc:desc||"",data:data||iso(today)}; E().itens.push(i);
  runEmpresa(); syncEmp(); persist(); return i;
}

/* ================= lançamentos automáticos ================= */
function runRecurring(){
  if(S.exemplo) return;
  let mudou=runEmpresa(); if(mudou) syncEmp();
  S.rec.forEach(r=>{ r.lanc=r.lanc||{}; if(!r.lanc[MK]&&today.getDate()>=Math.min(r.dia,daysIn(today.getFullYear(),today.getMonth()))){
    S.lanc.push({id:uid(),tipo:r.tipo,valor:r.valor,desc:r.desc,cat:r.cat,nec:r.nec,data:iso(new Date(today.getFullYear(),today.getMonth(),Math.min(r.dia,daysIn(today.getFullYear(),today.getMonth())))),recId:r.id});
    r.lanc[MK]=true; mudou=true;
  }});
  if(mudou) persist();
}

/* ================= navegação ================= */
const ROUTES=[["inicio","Início","i-home"],["contas","Contas","i-bill"],["lancar","Lançar","i-plus"],["metas","Metas","i-goal"],["relatorio","Relatório","i-chart"]];
const MAIS=["lancamentos","metas","relatorio","ajustes","carteiras","dividas","casa"];
function renderNav(){
  const n=visibleBills(MK).filter(c=>["overdue","soon"].includes(billStatus(c,MK).k)).length;
  $("#railNav").innerHTML=ROUTES.map(([k0,l,i])=>{const k=k0==="lancar"?"lancamentos":k0; return `<button class="nav-btn" data-go="${k}" ${route===k?'aria-current="page"':""}>${icon(k0==="lancar"?"i-list":i)}${k0==="lancar"?"Lançamentos":l}${k==="contas"&&n?`<span class="dot">${n}</span>`:""}</button>`}).join("")
    +[["carteiras","Carteiras e cartões","i-card"],["empresa","Empréstimos empresa","i-brief"],["casa","Casa","i-users"],["dividas","Dívidas","i-doc"]].map(([k,l,i])=>`<button class="nav-btn" data-go="${k}" ${route===k?'aria-current="page"':""}>${icon(i)}${l}</button>`).join("")
    +`<button class="nav-btn" data-go="ajustes" ${route==="ajustes"?'aria-current="page"':""}>${icon("i-gear")}Ajustes</button>`;
  const T=(k,l,i,extra="")=>`<button class="tab" data-go="${k}" ${route===k?'aria-current="page"':""}>${icon(i)}${l}${extra}</button>`;
  $("#tabbar").innerHTML=T("inicio","Início","i-home")+T("contas","Contas","i-bill",n?`<span class="dot">${n}</span>`:"")
    +`<button class="tab plus" data-act="novo" aria-label="Novo lançamento"><span class="pbtn">${icon("i-plus")}</span></button>`
    +T("empresa","Empresa","i-brief")
    +`<button class="tab" data-act="mais" ${MAIS.includes(route)?'aria-current="page"':""}>${icon("i-more")}Mais</button>`;
}
function go(r){route=r; selMode=false; sel.clear(); closeSheet(); try{history.replaceState(null,"","#"+r)}catch(e){} render(); const m=$("main"); if(m) m.scrollTo({top:0})}
window.addEventListener("hashchange",()=>{const h=location.hash.slice(1); if(h==="novo"){go("inicio"); sheetLanc(); return} if(h&&h!==route){route=h;closeSheet();selMode=false;sel.clear();render()}});
{const h=location.hash.slice(1); if(h==="novo") setTimeout(()=>{if(!locked) sheetLanc()},300); if(["inicio","contas","lancamentos","metas","relatorio","ajustes","empresa","carteiras","dividas","casa"].includes(h)) route=h;}

/* ================= componentes ================= */
function monthSwitch(){
  return `<div class="msw" role="group" aria-label="Mês"><button data-mes="-1" aria-label="Mês anterior">${icon("i-left")}</button><span>${cap(keyLabel(VK))} ${VK.slice(0,4)}</span><button data-mes="1" aria-label="Próximo mês">${icon("i-right")}</button>${isCur()?"":`<button class="msw-hoje" data-mes="0">Hoje</button>`}</div>`;
}
function topBar(title,sub,meses=true){
  const n=alerts().length;
  return `<div class="top"><div class="hello">${title.startsWith("Bom")||title.startsWith("Boa")?`<span class="avatar" aria-hidden="true">${esc(inicial())}</span>`:""}<div style="min-width:0"><h1>${title}</h1><p>${sub}</p></div></div><div class="top-actions">
  ${meses?monthSwitch():""}
  <button class="btn btn-primary" data-act="novo">${icon("i-plus")}Novo</button>
  <button class="icon-btn" data-act="tema" aria-label="Tema: ${tema==="auto"?"automático":tema}">${icon(tema==="auto"?"i-auto":tema==="escuro"?"i-moon":"i-sun")}</button>
  <button class="icon-btn" data-act="olho" aria-label="${oculto?"Mostrar valores":"Esconder valores"}">${icon(oculto?"i-eyeoff":"i-eye")}</button>
  <button class="icon-btn" data-act="notif" aria-label="Avisos">${icon("i-bell")}${n?`<span class="badge">${n}</span>`:""}</button></div></div>`;
}
function exampleBanner(){return S.exemplo?`<div class="banner example">${icon("i-info")}<div class="grow"><b>Estes são dados de exemplo</b> para você ver o app funcionando. Quando quiser, comece com os seus.</div><button class="btn btn-sm btn-gold" data-act="limpar">Começar do zero</button></div>`:""}
function alertBanner(){
  if(!isCur()) return ""; const T=totals();
  if(T.limite&&T.uso>=1) return `<div class="banner red" role="alert">${icon("i-alert")}<div class="grow"><b>Alerta vermelho: gastos acima do limite.</b> Entre o que já gastou e as contas em aberto, você passou ${brl(T.gasto+T.aPagar-T.limite)} do limite de ${brl(T.limite)}. Segure os gastos não necessários até o fim do mês.</div></div>`;
  const over=budgetState().filter(b=>b.p>=1);
  if(over.length) return `<div class="banner red" role="alert">${icon("i-alert")}<div class="grow"><b>Orçamento estourado:</b> ${over.map(b=>`${esc(b.c)} (${brl0(b.g)} de ${brl0(b.lim)})`).join(", ")}.</div></div>`;
  if(T.limite&&T.uso>=.85) return `<div class="banner amber" role="status">${icon("i-alert")}<div class="grow"><b>Atenção:</b> ${Math.round(T.uso*100)}% do limite do mês já está comprometido. Sobram ${brl(T.limite-T.gasto-T.aPagar)}.</div></div>`;
  return "";
}
function vault(){
  const T=totals(); const pct=Math.min(100,Math.round(T.uso*100)); const cls=T.uso>=1?"bad":T.uso>=.85?"warn":"";
  const past=VK<MK;
  return `<section class="vault" aria-label="Resumo do mês"><div style="position:relative;z-index:1">
    <div class="v-label">${past?"Sobrou em ":"Livre para "}${keyLabel(VK)}</div>
    <div class="v-big ${T.livre<0?"neg":""}">${money(T.livre)}</div>
    <div class="v-sub">${past?`Entraram <b>${brl(T.rendaRef)}</b>, saíram <b>${brl(T.gasto)}</b> e você guardou <b>${brl(T.guardado)}</b>.`:`Já descontando <b>${brl(T.aPagar)}</b> em contas a pagar e <b>${brl(T.guardado)}</b> guardados.`}</div>
    <div class="meter"><div class="meter-row"><span>Limite do mês</span><span><b>${brl0(T.gasto+T.aPagar)}</b> de ${brl0(T.limite)} · ${oculto?"•••":pct+"%"}</span></div>
    <div class="track"><div class="fill ${cls}" style="width:${pct}%"></div></div></div></div>
    <div class="v-stats">
      <div class="v-stat"><div class="v-label">Entrou</div><div class="n">${brl0(T.renda)}</div></div>
      <div class="v-stat"><div class="v-label">Gastou</div><div class="n">${brl0(T.gasto)}</div></div>
      <div class="v-stat"><div class="v-label">${T.dimRest?"Por dia, até o fim":"Não necessários"}</div><div class="n">${brl0(T.dimRest?T.porDia:T.nao)}</div></div>
      <div class="v-stat"><div class="v-label">Guardado no mês</div><div class="n gold">${brl0(T.guardado)}</div></div>
    </div></section>`;
}
function frequentes(){
  const lim=iso(new Date(today.getFullYear(),today.getMonth(),today.getDate()-90)); const m={};
  S.lanc.filter(t=>t.tipo==="gasto"&&!t.parc&&!t.conta&&!t.recId&&t.data>=lim).forEach(t=>{const k=norm(t.desc)+"|"+t.valor; (m[k]=m[k]||{t,n:0}).n++; if(t.data>m[k].t.data) m[k].t=t});
  return Object.values(m).filter(x=>x.n>=2).sort((a,b)=>b.n-a.n).slice(0,6).map(x=>x.t);
}
function quickBox(){
  const log=chat.slice(-4).map(m=>m.me?`<div class="bubble">${esc(m.t)}</div>`:`<div class="reply ${m.err?"err":""}">${m.t}</div>`).join("");
  const fr=frequentes();
  const chips=fr.length?`<div class="chips"><span class="hint" style="align-self:center">Toque para lançar de novo:</span>${fr.map(t=>`<button class="chip chip-q" data-quick="${t.id}">${esc(t.desc)} · ${brl0(t.valor)}</button>`).join("")}</div>`
    :`<div class="chips">${["gastei 32 na farmácia","recebi 1200 do cliente","tênis 600 em 6x","conta de água 98 vence dia 15","uber 23,50"].map(c=>`<button class="chip" data-chip="${esc(c)}">${esc(c)}</button>`).join("")}</div>`;
  return `<section class="quick"><div class="quick-head"><h2>${icon("i-chat")}Lance como se fosse no WhatsApp</h2><span class="hint">Escreva do seu jeito, o Prumo entende e salva</span></div>
  ${log}<form class="chat-form" id="chatForm"><input id="chatIn" autocomplete="off" placeholder='Ex.: "gastei 45 no ifood" ou "tv 2400 em 10x"' aria-label="Mensagem"><button type="button" class="send cam" data-act="foto" aria-label="Ler foto do comprovante">${icon("i-camera")}</button><button class="send" aria-label="Enviar">${icon("i-send")}</button></form>${chips}</section>`;
}
function billRow(c){
  const s=billStatus(c), p=PRIO[c.prio];
  return `<div class="bill ${s.k}"><button class="check ${s.k==="paid"?"on":""}" data-pay="${c.id}" aria-label="${s.k==="paid"?"Desmarcar":"Marcar como paga"}: ${esc(c.nome)}">${icon("i-check")}</button>
  <div style="min-width:0"><div class="bill-name">${esc(c.nome)}</div><div class="bill-meta"><span class="pill ${p.cls}">${p.short}</span><span class="${s.k==="overdue"?"t-bad":s.k==="soon"?"t-warn":s.k==="paid"?"t-ok":""}">${s.txt}</span>${c.rec?"<span>· todo dia "+c.dia+"</span>":""}</div></div>
  <div class="bill-val">${brl(c.valor)}<small><button class="tx-del" data-editbill="${c.id}">editar</button></small></div></div>`;
}
function txRow(t){
  const lbl=t.tipo==="renda"?"in":t.tipo==="guardar"?"save":t.nec==="nao"?"nao":"";
  const sinal=t.tipo==="renda"?"+":t.tipo==="guardar"?"→":"-";
  const meta=t.tipo==="guardar"?"Guardado":t.tipo==="renda"?"Entrada":(t.nec==="nao"?"Não necessário":"Necessário");
  const tag=t.parc?` · <span class="t-warn">parcela ${t.parc.i}/${t.parc.n}</span>`:t.emp?" · empresa":t.recId?" · automático":t.imp?" · importado":"";
  const ck=selMode?`<span class="tx-ck ${sel.has(t.id)?"on":""}">${icon("i-check")}</span>`:"";
  return `<button class="tx ${selMode?"selecting":""} ${sel.has(t.id)?"sel":""}" data-edittx="${t.id}" aria-label="${selMode?"Selecionar":"Editar"}: ${esc(t.desc)}">${ck}<span class="tx-ic ${lbl}">${esc((t.cat||"?").slice(0,2).toUpperCase())}</span><span class="tx-mid"><span class="tx-desc">${esc(t.desc)}</span><span class="tx-meta">${esc(t.cat)} · ${meta} · ${fmtDate(t.data)}${tag}</span></span>
  <span class="tx-val ${t.tipo==="renda"?"in":""}">${sinal} ${brl(t.valor)}</span></button>`;
}
function splitBar(){
  const T=totals(); const base=T.rendaRef||1; const n=T.nec/base*100, o=T.nao/base*100, g=T.guardado/base*100;
  return `<div class="split" role="img" aria-label="Divisão da renda"><span style="width:${Math.min(n,100)}%;background:var(--accent)"></span><span style="width:${Math.min(o,100)}%;background:var(--warn)"></span><span style="width:${Math.min(g,100)}%;background:var(--gold)"></span></div>
  <div class="legend"><div><i style="background:var(--accent)"></i>Necessários<b>${Math.round(n)}%</b>ideal até 50%</div><div><i style="background:var(--warn)"></i>Não necessários<b class="${o>30?"t-bad":""}">${Math.round(o)}%</b>ideal até 30%</div><div><i style="background:var(--gold)"></i>Guardado<b>${Math.round(g)}%</b>ideal 20% ou mais</div></div>`;
}
function budgetBars(){
  const by=catSpend(); const cats=new Set([...Object.keys(by),...Object.keys(S.orc).filter(c=>S.orc[c]>0)]);
  const arr=[...cats].map(c=>({c,g:by[c]||0,lim:S.orc[c]||0})).sort((a,b)=>(b.lim?b.g/b.lim:0)-(a.lim?a.g/a.lim:0)||b.g-a.g);
  if(!arr.length) return `<div class="empty">Nenhum gasto lançado em ${keyLabel(VK)}.</div>`;
  const max=Math.max(...arr.map(x=>Math.max(x.g,x.lim)));
  return arr.map(x=>{const p=x.lim?x.g/x.lim:0; const cls=x.lim?(p>=1?"bad":p>=.85?"warn":"ok"):(CATS[x.c]==="nao"?"nao":"");
    return `<div class="cat-row"><span>${esc(x.c)}</span><div class="cat-bar" style="position:relative"><span class="${cls}" style="width:${(x.lim?Math.min(x.g,x.lim*1.5)/Math.max(x.lim*1.5,1):x.g/max)*100}%"></span>${x.lim?`<em class="cap" style="left:${100/1.5}%"></em>`:""}</div><span class="v">${brl0(x.g)}${x.lim?`<small class="${p>=1?"t-bad":p>=.85?"t-warn":""}"> / ${brl0(x.lim)}</small>`:""}</span></div>`}).join("");
}
function goalCard(m){
  const pct=m.alvo?Math.min(100,Math.round(m.guardado/m.alvo*100)):0; let ritmo="";
  if(m.prazo){const d=parseISO(m.prazo); const meses=Math.max(1,(d.getFullYear()-today.getFullYear())*12+d.getMonth()-today.getMonth()); const falta=Math.max(0,m.alvo-m.guardado); ritmo=falta?`Guarde ${brl0(falta/meses)}/mês para chegar até ${MESES[d.getMonth()].slice(0,3)}/${String(d.getFullYear()).slice(2)}`:"Meta concluída"}
  return `<div class="goal"><div class="goal-top"><span class="goal-name">${esc(m.nome)}</span><span class="goal-pct">${pct}%</span></div><div class="track"><div class="fill" style="width:${pct}%"></div></div>
  <div class="goal-meta">${brl0(m.guardado)} de ${brl0(m.alvo)}${ritmo?"<br>"+ritmo:""}</div>
  <div class="goal-actions"><button class="btn btn-sm btn-gold" data-deposit="${m.id}">Guardar</button><button class="btn btn-sm btn-ghost" data-withdraw="${m.id}">Retirar</button><button class="btn btn-sm btn-ghost" data-delgoal="${m.id}">Excluir</button></div></div>`;
}
const insightIcon=i=>`<span class="ic ${i.ic}">${i.ic==="gold"?"$":i.ic==="tip"?"i":"!"}</span>`;
function calendar(){
  const y=vmY(),m=vmM(),first=new Date(y,m,1).getDay(),n=daysIn(y,m);
  const bills=visibleBills(); const byDay={};
  bills.forEach(c=>{const d=billDue(c); if(d.getMonth()!==m||d.getFullYear()!==y) return; (byDay[d.getDate()]=byDay[d.getDate()]||[]).push(c)});
  let cells=""; for(let i=0;i<first;i++) cells+=`<div class="cal-c empty-c"></div>`;
  for(let d=1;d<=n;d++){
    const l=byDay[d]||[]; const isT=isCur()&&d===today.getDate(); const tot=l.filter(c=>!billPaid(c)).reduce((a,c)=>a+c.valor,0);
    const dots=l.map(c=>{const s=billStatus(c);return `<i class="${s.k==="paid"?"d-ok":s.k==="overdue"?"d-bad":"d-"+c.prio}"></i>`}).join("");
    cells+=`<button class="cal-c ${isT?"hoje":""} ${calDay===d?"sel":""} ${l.length?"tem":""}" data-calday="${d}" aria-label="Dia ${d}${l.length?", "+l.length+" conta(s)":""}"><span class="cal-n">${d}</span><span class="cal-dots">${dots}</span>${tot&&!oculto?`<span class="cal-v">${tot>=1000?(tot/1000).toFixed(1).replace(".",",")+"k":Math.round(tot)}</span>`:""}</button>`;
  }
  const sel=calDay&&byDay[calDay]?byDay[calDay]:null;
  return `<div class="cal-h">${["D","S","T","Q","Q","S","S"].map(x=>`<span>${x}</span>`).join("")}</div><div class="cal">${cells}</div>
  <div class="cal-leg"><span><i class="d-super"></i>Super</span><span><i class="d-importante"></i>Importante</span><span><i class="d-relativa"></i>Relativa</span><span><i class="d-bad"></i>Atrasada</span><span><i class="d-ok"></i>Paga</span></div>
  ${calDay?`<div class="group-title">Dia ${calDay}</div>${sel?sel.map(billRow).join(""):`<div class="empty">Nenhuma conta neste dia.</div>`}`:""}`;
}

/* ================= nome ================= */
const meuNome=()=>(S.config.nome||"").trim();
const inicial=()=>(meuNome()[0]||(sess&&sess.user.email[0])||"P").toUpperCase();

/* ================= carteiras ================= */
const carteira=id=>S.carteiras.find(c=>c.id===id);
function saldoCarteira(c){
  let v=c.inicial||0;
  S.lanc.forEach(t=>{ if(t.carteira!==c.id||t.cartao) return; if(t.tipo==="renda") v+=t.valor; else v-=t.valor });
  S.transf.forEach(x=>{ if(x.para===c.id) v+=x.valor; if(x.de===c.id) v-=x.valor });
  Object.values(S.fat).forEach(f=>{ if(f&&f.carteira===c.id) v-=f.valor||0 });
  return r2(v);
}
const saldoTotal=()=>S.carteiras.reduce((a,c)=>a+saldoCarteira(c),0);
function carimbar(){ // movimentos novos entram na carteira padrão
  const pad=S.carteiras.length&&carteira(S.carteiraPadrao)?S.carteiraPadrao:null;
  S.lanc.forEach(t=>{ if(t.carteira===undefined) t.carteira=t.cartao?null:pad });
}
function pagOpts(t){
  const cur=t?(t.cartao?"k:"+t.cartao:t.carteira?"c:"+t.carteira:""):(S.ultimaPag||(S.carteiraPadrao?"c:"+S.carteiraPadrao:""));
  if(!S.carteiras.length&&!S.cartoes.length) return "";
  return `<div class="field"><label for="fPag">Pago com / entrou em</label><select id="fPag"><option value="">Não informar</option>${S.carteiras.map(c=>`<option value="c:${c.id}" ${cur==="c:"+c.id?"selected":""}>${esc(c.nome)}</option>`).join("")}${S.cartoes.map(k=>`<option value="k:${k.id}" ${cur==="k:"+k.id?"selected":""}>Cartão ${esc(k.nome)}</option>`).join("")}</select></div>`;
}
function lerPag(t){
  const el=$("#fPag"); if(!el) return; const v=el.value; S.ultimaPag=v;
  t.carteira=v.startsWith("c:")?v.slice(2):null; t.cartao=v.startsWith("k:")&&t.tipo==="gasto"?v.slice(2):null; if(t.cartao) t.carteira=null;
}

/* ================= cartões ================= */
const cartao=id=>S.cartoes.find(c=>c.id===id);
function fatKey(k,dataIso){
  const d=parseISO(dataIso); let off=d.getDate()>k.fecha?1:0; if(k.vence<=k.fecha) off+=1;
  return mkey(new Date(d.getFullYear(),d.getMonth()+off,1));
}
const fatItens=(k,key)=>S.lanc.filter(t=>t.tipo==="gasto"&&t.cartao===k.id&&fatKey(k,t.data)===key);
const fatTotal=(k,key)=>r2(fatItens(k,key).reduce((a,t)=>a+t.valor,0));
const fatPaga=(k,key)=>!!S.fat[k.id+"|"+key];
const fatVenc=(k,key)=>new Date(+key.slice(0,4),+key.slice(5,7)-1,Math.min(k.vence,daysIn(+key.slice(0,4),+key.slice(5,7)-1)));
function fatUsado(k){const keys=new Set(S.lanc.filter(t=>t.cartao===k.id).map(t=>fatKey(k,t.data))); let u=0; keys.forEach(key=>{if(!fatPaga(k,key)) u+=fatTotal(k,key)}); return r2(u)}
const fatAberta=k=>fatKey(k,iso(today));
function fatStatus(k,key){
  if(fatPaga(k,key)) return {k:"paid",txt:"Paga"};
  const diff=Math.round((fatVenc(k,key)-today)/864e5);
  if(diff<0) return {k:"overdue",txt:`Venceu há ${-diff} dia${diff===-1?"":"s"}`};
  if(diff===0) return {k:"soon",txt:"Vence hoje"};
  if(diff<=S.config.diasAviso) return {k:"soon",txt:`Vence em ${diff} dia${diff===1?"":"s"}`};
  const fecha=new Date(fatVenc(k,key)); fecha.setMonth(fecha.getMonth()-(k.vence<=k.fecha?1:0)); fecha.setDate(Math.min(k.fecha,daysIn(fecha.getFullYear(),fecha.getMonth())));
  return {k:"open",txt:fecha>=today?`Fecha dia ${k.fecha}`:`Fechada · vence ${fmtDate(iso(fatVenc(k,key)))}`};
}
function fatRow(k,key){
  const s=fatStatus(k,key), tot=fatTotal(k,key);
  return `<div class="bill ${s.k}"><button class="check ${s.k==="paid"?"on":""}" data-payfat="${k.id}|${key}" aria-label="${s.k==="paid"?"Desmarcar":"Pagar"} fatura ${esc(k.nome)}">${icon("i-check")}</button>
  <div style="min-width:0"><div class="bill-name">Fatura ${esc(k.nome)} · ${keyLabel(key)}</div><div class="bill-meta"><span class="pill" style="background:${k.cor}22;color:${k.cor}">Cartão</span><span class="${s.k==="overdue"?"t-bad":s.k==="soon"?"t-warn":s.k==="paid"?"t-ok":""}">${s.txt}</span><span>· vence dia ${k.vence}</span></div></div>
  <div class="bill-val">${brl(tot)}<small><button class="tx-del" data-vercartao="${k.id}">ver compras</button></small></div></div>`;
}

/* ================= dívidas ================= */
function pvDivida(d){const i=(d.juros||0)/100,n=d.restantes; if(!i) return d.parcela*n; return d.parcela*(1-Math.pow(1+i,-n))/i}
function simAdiantar(d,x){
  const i=(d.juros||0)/100, pv=pvDivida(d); if(x<=0) return null; if(x>=pv) return {quita:true,economia:r2(d.parcela*d.restantes-x),meses:d.restantes};
  let n2=i?Math.ceil(-Math.log(1-(pv-x)*i/d.parcela)/Math.log(1+i)):Math.ceil((pv-x)/d.parcela);
  return {quita:false,meses:d.restantes-n2,economia:r2(d.parcela*d.restantes-(d.parcela*n2+x))};
}
const divPaga=d=>!!(d.pagos&&d.pagos[MK]);

/* ================= previsão do mês ================= */
function previsao(){
  const k=MK, T=totals(k), y=today.getFullYear(), m=today.getMonth(), n=daysIn(y,m), dia=today.getDate();
  const tx=monthTx(k);
  const variavel=tx.filter(t=>t.tipo==="gasto"&&!t.conta&&!t.recId&&!t.parc&&!t.divida&&!t.imp);
  const media=variavel.reduce((a,t)=>a+t.valor,0)/Math.max(1,dia);
  const projVar=media*(n-dia);
  let pendRenda=0, pendGasto=T.aPagar;
  S.rec.forEach(r=>{ if(!(r.lanc||{})[k]){ if(r.tipo==="renda") pendRenda+=r.valor; else pendGasto+=r.valor } });
  if(E().ativo&&E().noSaldo){ const P=E().pagos[k]||{}; if(!P.a) pendRenda+=E().adiant; if(!P.f) pendRenda+=empResumo(k).receber }
  S.dividas.forEach(d=>{ if(d.restantes>0&&!divPaga(d)) pendGasto+=d.parcela });
  const rendaBase=T.renda+pendRenda||S.config.renda;
  const fim=rendaBase-T.gasto-T.guardado-pendGasto-projVar;
  // série diária
  const serie=[]; let acc=0; const byDay={};
  tx.forEach(t=>{const dd=+t.data.slice(8,10); byDay[dd]=(byDay[dd]||0)+(t.tipo==="renda"?t.valor:-t.valor)});
  for(let i=1;i<=dia;i++){acc+=byDay[i]||0; serie.push(acc)}
  return {fim,media,projVar,pendRenda,pendGasto,serie,dia,n,rendaBase};
}
function previsaoCard(){
  const P=previsao(); const cls=P.fim<0?"t-bad":P.fim<P.rendaBase*.05?"t-warn":"t-ok";
  const W=320,H=70, pts=P.serie, allv=[...pts,P.fim,0], mx=Math.max(...allv), mn=Math.min(...allv), sp=mx-mn||1;
  const X=i=>i/(P.n-1)*W, Y=v=>H-6-(v-mn)/sp*(H-12);
  const line=pts.map((v,i)=>`${i?"L":"M"}${X(i).toFixed(1)},${Y(v).toFixed(1)}`).join("");
  const last=pts.length?pts[pts.length-1]:0;
  const proj=`M${X(P.dia-1).toFixed(1)},${Y(last).toFixed(1)}L${X(P.n-1).toFixed(1)},${Y(P.fim).toFixed(1)}`;
  return `<section class="card prev"><div class="card-head"><div><div class="eyebrow">Previsão</div><h2>No ritmo atual, ${keyLabel(MK)} fecha com</h2></div><b class="prev-v ${cls}">${brl(P.fim)}</b></div>
  ${oculto?"":`<svg viewBox="0 0 ${W} ${H}" class="prev-svg" preserveAspectRatio="none" role="img" aria-label="Saldo do mês até hoje e projeção"><line x1="0" x2="${W}" y1="${Y(0)}" y2="${Y(0)}" stroke="var(--line)" stroke-dasharray="2 4"/><path d="${line}" fill="none" stroke="var(--accent)" stroke-width="2.2" stroke-linejoin="round"/><path d="${proj}" fill="none" stroke="${P.fim<0?"var(--bad)":"var(--gold)"}" stroke-width="2" stroke-dasharray="5 5"/><circle cx="${X(P.n-1)}" cy="${Y(P.fim)}" r="4" fill="${P.fim<0?"var(--bad)":"var(--gold)"}"/></svg>`}
  <p class="hint" style="margin:0">Você gasta em média <b>${brl(P.media)}</b> por dia com gastos do dia a dia. Somando isso aos ${brl(P.pendGasto)} que ainda vão vencer${P.pendRenda?` e aos ${brl(P.pendRenda)} que ainda vão entrar`:""}, a conta acima é onde você chega no dia ${P.n}.${P.fim<0?" <b class='t-bad'>Para não fechar no negativo, segure "+brl(-P.fim/Math.max(1,P.n-P.dia))+" por dia.</b>":""}</p></section>`;
}

/* ================= etiquetas e busca ================= */
let buscaQ="";
const tagsDe=t=>(t.desc.match(/#[\wÀ-ú]+/g)||[]).map(x=>x.toLowerCase());
function tagTotals(k=VK){const o={}; monthTx(k).filter(t=>t.tipo==="gasto").forEach(t=>tagsDe(t).forEach(g=>o[g]=(o[g]||0)+t.valor)); return Object.entries(o).sort((a,b)=>b[1]-a[1])}
function buscar(q){
  q=norm(q.trim()); if(!q) return [];
  const nq=num(q);
  return S.lanc.filter(t=>norm(t.desc).includes(q)||norm(t.cat).includes(q)||(!isNaN(nq)&&Math.abs(t.valor-nq)<0.005)).sort((a,b)=>b.data.localeCompare(a.data)).slice(0,200);
}

/* ================= desafios ================= */
function semana52(){const D=S.desafios.s52; if(!D.inicio) return 0; return Math.min(52,Math.max(1,Math.floor((today-parseISO(D.inicio))/(7*864e5))+1))}
function trocoMes(k=MK){const p=S.desafios.arred.passo||5; let t=0; monthTx(k).filter(x=>x.tipo==="gasto"&&!x.conta&&!x.divida).forEach(x=>{const r=Math.ceil(x.valor/p)*p-x.valor; t+=r>0.001?r:0}); const ja=monthTx(k).filter(x=>x.troco===k).reduce((a,x)=>a+x.valor,0); return Math.max(0,r2(t-ja))}
function diasZero(k=MK){const n=k===MK?today.getDate():daysIn(+k.slice(0,4),+k.slice(5,7)-1); const s=new Set(monthTx(k).filter(t=>t.tipo==="gasto"&&t.nec==="nao").map(t=>+t.data.slice(8,10))); let z=0; for(let i=1;i<=n;i++) if(!s.has(i)) z++; return {z,n}}
function desafiosHtml(){
  const D=S.desafios, metaSel=id=>`<select data-dmeta="${id}" class="mini-sel">${S.metas.map(m=>`<option value="${m.id}" ${D[id].meta===m.id?"selected":""}>${esc(m.nome)}</option>`).join("")||"<option value=''>Crie uma meta primeiro</option>"}</select>`;
  const s52=D.s52, w=semana52(), feitas=Object.keys(s52.feitas||{}).length, ja=Object.keys(s52.feitas||{}).reduce((a,n)=>a+n*s52.base,0);
  const del=monthTx(MK).filter(t=>t.tipo==="gasto"&&t.cat==="Delivery"); const dz=diasZero(); const tr=trocoMes();
  const card=(id,titulo,desc,corpo)=>`<div class="desafio ${D[id].ativo?"on":""}"><div class="d-top"><div><b>${titulo}</b><small>${desc}</small></div><button class="btn btn-sm ${D[id].ativo?"btn-ghost":"btn-gold"}" data-desafio="${id}">${D[id].ativo?"Parar":"Começar"}</button></div>${D[id].ativo?corpo:""}</div>`;
  return `<section class="card"><div class="card-head"><div><div class="eyebrow">Desafios</div><h2>Guarde mais sem perceber</h2></div></div><div class="desafios">
  ${card("s52","52 semanas",`Toda semana você guarda um pouco mais. Com base de ${brl0(s52.base)}, chega a ${brl0(1378*s52.base)} em um ano.`,
   `<div class="d-meta"><span>Semana ${w} de 52 · ${feitas} feitas · ${brl0(ja)} guardados</span>${metaSel("s52")}</div><div class="s52">${Array.from({length:52},(_,i)=>i+1).map(n=>`<button class="s52-c ${s52.feitas&&s52.feitas[n]?"ok":""} ${n===w?"now":""}" data-s52="${n}" aria-label="Semana ${n}, ${brl0(n*s52.base)}">${n}</button>`).join("")}</div><span class="hint">Toque na semana para marcar que guardou ${brl0(w*s52.base)} desta semana. Lança na meta escolhida.</span>`)}
  ${card("arred","Arredondar o troco",`Cada gasto é arredondado para cima (de ${brl0(D.arred.passo)} em ${brl0(D.arred.passo)}) e a diferença vai para o cofrinho.`,
   `<div class="d-meta"><span>Troco acumulado em ${keyLabel(MK)}: <b>${brl(tr)}</b></span>${metaSel("arred")}</div><div><button class="btn btn-sm btn-gold" data-act="guardartroco" ${tr>0?"":"disabled"}>Guardar ${brl(tr)}</button></div>`)}
  ${card("semDelivery","Mês sem delivery","Ficar o mês inteiro sem pedir comida.",
   `<div class="d-meta"><span>${del.length?`<b class="t-bad">Quebrado</b>: ${del.length} pedido${del.length>1?"s":""} em ${keyLabel(MK)} (${brl(del.reduce((a,t)=>a+t.valor,0))})`:`<b class="t-ok">${today.getDate()} dias</b> sem delivery em ${keyLabel(MK)}. Segue firme.`}</span></div>`)}
  ${card("diasZero","Dias no zero","Dias sem nenhum gasto não necessário.",
   `<div class="d-meta"><span><b>${dz.z}</b> de ${dz.n} dias de ${keyLabel(MK)} sem gasto não necessário.</span></div><div class="track" style="background:var(--surface-2);height:8px"><div class="fill" style="width:${dz.z/dz.n*100}%"></div></div>`)}
  </div></section>`;
}

/* ================= imposto de renda ================= */
function irDados(ano){
  const l=S.lanc.filter(t=>t.tipo==="gasto"&&t.data.slice(0,4)===String(ano)&&(t.cat==="Saúde"||t.cat==="Educação"));
  const saude=l.filter(t=>t.cat==="Saúde"), edu=l.filter(t=>t.cat==="Educação");
  return {l,saude,edu,ts:saude.reduce((a,t)=>a+t.valor,0),te:edu.reduce((a,t)=>a+t.valor,0)};
}

/* ================= PDF ================= */
function carregar(src){return new Promise((ok,err)=>{const s=document.createElement("script");s.src=src;s.onload=ok;s.onerror=err;document.head.appendChild(s)})}
async function gerarPDF(k=VK){
  try{ if(!window.jspdf) { toast("Preparando o PDF…"); await carregar("https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js") } }
  catch(e){ toast("Não consegui gerar o PDF. Confira a internet e tente de novo.",true); return }
  const {jsPDF}=window.jspdf; const doc=new jsPDF({unit:"pt",format:"a4"}); const W=595, M=44; let y=0;
  const R=v=>"R$ "+v.toLocaleString("pt-BR",{minimumFractionDigits:2,maximumFractionDigits:2});
  const T=totals(k);
  doc.setFillColor(20,23,31); doc.rect(0,0,W,120,"F");
  doc.setTextColor(201,162,83); doc.setFont("helvetica","bold"); doc.setFontSize(10); doc.text("PRUMO FINANÇAS",M,40);
  doc.setTextColor(243,241,234); doc.setFontSize(24); doc.text(`Resumo de ${keyLabel(k)} de ${k.slice(0,4)}`,M,72);
  doc.setFont("helvetica","normal"); doc.setFontSize(10); doc.setTextColor(162,166,178); doc.text(`${meuNome()||""}${meuNome()?" · ":""}gerado em ${today.toLocaleDateString("pt-BR")}`,M,96);
  y=156;
  const box=(x,lab,val,cor)=>{doc.setDrawColor(228,226,219);doc.roundedRect(x,y,120,58,8,8);doc.setFontSize(8);doc.setTextColor(138,140,150);doc.text(lab.toUpperCase(),x+12,y+20);doc.setFontSize(14);doc.setFont("helvetica","bold");doc.setTextColor(...cor);doc.text(val,x+12,y+42);doc.setFont("helvetica","normal")};
  box(M,"Entrou",R(T.renda),[28,133,82]); box(M+128,"Saiu",R(T.gasto),[22,23,28]); box(M+256,"Guardou",R(T.guardado),[164,124,44]); box(M+384,"Sobrou",R(T.renda-T.gasto-T.guardado),T.renda-T.gasto-T.guardado<0?[195,56,45]:[22,23,28]);
  y+=92;
  const h=(t)=>{doc.setFontSize(13);doc.setFont("helvetica","bold");doc.setTextColor(22,23,28);doc.text(t,M,y);doc.setFont("helvetica","normal");y+=18};
  const linha=(a,b,c,bold)=>{if(y>790){doc.addPage();y=56} doc.setFontSize(10);doc.setTextColor(77,79,90);if(bold)doc.setFont("helvetica","bold");doc.text(a,M,y);if(c)doc.text(c,M+300,y);doc.text(b,W-M,y,{align:"right"});doc.setFont("helvetica","normal");doc.setDrawColor(238,237,231);doc.line(M,y+6,W-M,y+6);y+=20};
  h("Gastos por categoria");
  Object.entries(catSpend(k)).sort((a,b)=>b[1]-a[1]).forEach(([c,v])=>linha(c,R(v),S.orc[c]?"limite "+R(S.orc[c]):""));
  y+=6; doc.setFontSize(10); doc.setTextColor(77,79,90); doc.text(`Necessários: ${R(T.nec)}   ·   Não necessários: ${R(T.nao)}${T.rendaRef?` (${Math.round(T.nao/T.rendaRef*100)}% da renda)`:""}`,M,y); y+=26;
  if(E().ativo){const ER=empResumo(k); h("Empréstimos da empresa"); linha("Total pego no mês",R(ER.pego)); linha(`Recebido no dia ${fechDay(k)}`,R(ER.receber)); if(ER.deve) linha("Ficou devendo para o mês seguinte",R(ER.deve)); y+=6}
  h("Lançamentos");
  monthTx(k).sort((a,b)=>a.data.localeCompare(b.data)).forEach(t=>linha(`${t.data.slice(8,10)}/${t.data.slice(5,7)}  ${t.desc}`.slice(0,58),(t.tipo==="renda"?"+ ":"- ")+R(t.valor),t.tipo==="gasto"?t.cat:t.tipo==="renda"?"Entrada":"Guardado"));
  doc.save(`prumo-${k}.pdf`); toast("PDF baixado.");
}

/* ================= foto do comprovante ================= */
async function lerComprovante(file){
  toast("Lendo o comprovante… isso leva alguns segundos.");
  try{ if(!window.Tesseract) await carregar("https://cdn.jsdelivr.net/npm/tesseract.js@5.1.1/dist/tesseract.min.js") }
  catch(e){ toast("Não consegui carregar o leitor de imagem. Confira a internet.",true); return }
  try{
    const r=await window.Tesseract.recognize(file,"por");
    const txt=r.data.text||""; const linhas=txt.split(/\n/).map(l=>l.trim()).filter(Boolean);
    const vals=[...txt.matchAll(/R\$\s*([\d.]{1,9},\d{2})/gi)].map(m=>num(m[1])).filter(v=>v>0);
    const chave=linhas.find(l=>/valor|total|pago|pix/i.test(l)&&/\d+,\d{2}/.test(l));
    let valor=chave?num((chave.match(/([\d.]{1,9},\d{2})/)||[])[1]):NaN; if(!(valor>0)) valor=vals.length?Math.max(...vals):NaN;
    const dm=txt.match(/(\d{2})\/(\d{2})\/(\d{4})/); const data=dm?`${dm[3]}-${dm[2]}-${dm[1]}`:iso(today);
    let nome=""; const iN=linhas.findIndex(l=>/^(para|destino|favorecido|recebedor|quem recebeu|nome)\b/i.test(norm(l)));
    if(iN>=0){nome=linhas[iN].replace(/^(para|destino|favorecido|recebedor|quem recebeu|nome)\s*:?/i,"").trim()||linhas[iN+1]||""}
    if(!nome) nome=linhas.find(l=>/[a-z]{3}/i.test(l)&&!/comprovante|transfer|pix|valor|data|hora|banco|r\$/i.test(l))||"";
    nome=nome.replace(/[^\wÀ-ú .&-]/g,"").replace(/\s+/g," ").trim().slice(0,40);
    sheetLanc(); setTimeout(()=>{ if(valor>0) $("#fVal").value=String(valor).replace(".",","); if(nome) $("#fDesc").value=nome[0].toUpperCase()+nome.slice(1).toLowerCase(); $("#fData").value=data; const c=guessCat(nome); if(c!=="Outros"&&$("#fCat")) $("#fCat").value=c; },40);
    toast(valor>0?"Pronto. Confira os dados antes de salvar.":"Não achei o valor na foto. Preencha à mão.",!(valor>0));
  }catch(e){ toast("Não consegui ler essa foto. Tente uma imagem mais nítida.",true) }
}
function escolherFoto(){const i=document.createElement("input"); i.type="file"; i.accept="image/*"; i.onchange=()=>i.files[0]&&lerComprovante(i.files[0]); i.click()}

/* ================= casa (casal) ================= */
let casa={id:null,info:null,membros:[],gastos:[],carregado:false,erro:null,canal:null};
async function carregarCasa(){
  if(!sb||!sess) return;
  try{
    const {data:mm,error}=await sb.from("casa_membros").select("casa_id").eq("user_id",sess.user.id).limit(1);
    if(error) throw error;
    if(!mm||!mm.length){casa={...casa,id:null,info:null,membros:[],gastos:[],carregado:true,erro:null}; return}
    const id=mm[0].casa_id;
    const [i,m,g]=await Promise.all([sb.from("casas").select("*").eq("id",id).single(),sb.from("casa_membros").select("user_id,nome").eq("casa_id",id),sb.from("casa_gastos").select("*").eq("casa_id",id).order("data",{ascending:false}).limit(500)]);
    casa={...casa,id,info:i.data,membros:m.data||[],gastos:g.data||[],carregado:true,erro:null};
    if(!casa.canal){ try{casa.canal=sb.channel("casa-"+id).on("postgres_changes",{event:"*",schema:"public",table:"casa_gastos",filter:"casa_id=eq."+id},()=>{carregarCasa().then(()=>{if(route==="casa") render()})}).subscribe()}catch(e){} }
  }catch(e){casa.erro=/relation|does not exist|schema cache/i.test(e.message||"")?"tabelas":"rede"; casa.carregado=true}
}
const nomeMembro=uid_=>{const m=casa.membros.find(x=>x.user_id===uid_); return m&&m.nome?m.nome:(uid_===sess?.user.id?"Você":"Outra pessoa")};
function casaSaldos(){
  const ids=casa.membros.map(m=>m.user_id), n=Math.max(1,ids.length), s={}; ids.forEach(i=>s[i]=0);
  casa.gastos.forEach(g=>{const v=+g.valor; s[g.pago_por]=(s[g.pago_por]||0)+v;
    if(g.divisao==="metade") ids.forEach(i=>s[i]-=v/n);
    else if(g.divisao==="pagador") s[g.pago_por]-=v;
    else if(g.divisao==="outro") ids.filter(i=>i!==g.pago_por).forEach(i=>s[i]-=v/Math.max(1,n-1));
  });
  return s;
}
function vCasa(){
  const head=topBar("Casa",casa.info?esc(casa.info.nome||"Finanças do casal"):"Despesas da casa, divididas entre vocês",false);
  if(!sb) return head+`<section class="card"><div class="empty">A nuvem não está configurada neste site.</div></section>`;
  if(!sess) return head+`<section class="card"><h2>Entre na sua conta</h2><p class="hint" style="margin:0">A área da casa fica na nuvem para os dois verem as mesmas despesas.</p><div><button class="btn btn-primary" data-act="login">Entrar</button></div></section>`;
  if(!casa.carregado){ carregarCasa().then(()=>{if(route==="casa") render()}); return head+`<section class="card"><div class="empty">Carregando…</div></section>` }
  if(casa.erro==="tabelas") return head+`<section class="card"><h2>Falta um passo no Supabase</h2><p class="hint" style="margin:0">Rode o arquivo <b>supabase-casa.sql</b> no SQL Editor do Supabase e abra esta tela de novo.</p><div><button class="btn btn-ghost" data-act="casarecarregar">Tentar de novo</button></div></section>`;
  if(casa.erro) return head+`<section class="card"><div class="empty">Não consegui carregar. Confira a internet.</div><div><button class="btn btn-ghost" data-act="casarecarregar">Tentar de novo</button></div></section>`;
  if(!casa.id) return head+`<section class="card"><div class="eyebrow">Finanças do casal</div><h2>Dividam as despesas da casa</h2>
  <p class="hint" style="margin:0">Cada um continua com as próprias finanças. Aqui ficam só as despesas da casa: quem pagou, como dividir e quanto um deve ao outro. Tudo atualiza na hora nos dois celulares.</p>
  <div class="row"><div class="field"><label for="cNome">Nome da casa</label><input id="cNome" placeholder="Ex.: Casa Mateus e Ana"></div><div class="field"><label for="cMeu">Seu nome</label><input id="cMeu" value="${esc(meuNome())}" placeholder="Ex.: Mateus"></div></div>
  <div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn btn-primary" data-act="casacriar">Criar a casa</button></div>
  <div class="group-title">Ou entre na casa criada pela outra pessoa</div>
  <div class="row"><div class="field"><label for="cCod">Código de convite</label><input id="cCod" placeholder="Ex.: A1B2C3" autocapitalize="characters"></div><div class="field"><label for="cMeu2">Seu nome</label><input id="cMeu2" value="${esc(meuNome())}"></div></div>
  <div><button class="btn btn-ghost" data-act="casaentrar">Entrar com o código</button></div></section>`;
  const sal=casaSaldos(), me=sess.user.id, eu=r2(sal[me]||0), outro=casa.membros.find(m=>m.user_id!==me);
  const mes=casa.gastos.filter(g=>g.data.slice(0,7)===VK), totMes=mes.reduce((a,g)=>a+ +g.valor,0);
  const porQuem={}; mes.forEach(g=>porQuem[g.pago_por]=(porQuem[g.pago_por]||0)+ +g.valor);
  return head+`<section class="vault casa-hero"><div style="position:relative;z-index:1"><div class="v-label">${!outro?"Esperando a outra pessoa entrar":Math.abs(eu)<0.01?"Vocês estão quites":eu>0?`${esc(nomeMembro(outro.user_id))} te deve`:`Você deve para ${esc(nomeMembro(outro.user_id))}`}</div>
  <div class="v-big">${money(Math.abs(eu))}</div><div class="v-sub">${outro?`Considerando todas as despesas da casa e os acertos já feitos.`:`Mande o código <b class="casa-cod">${esc(casa.info.codigo)}</b> para ela. No app dela: Mais → Casa → Entrar com o código.`}</div>
  ${outro&&Math.abs(eu)>=0.01?`<div style="margin-top:16px"><button class="btn btn-gold" data-act="casaacerto">Registrar acerto de ${brl(Math.abs(eu))}</button></div>`:""}</div>
  <div class="v-stats"><div class="v-stat"><div class="v-label">Casa em ${keyLabel(VK)}</div><div class="n">${brl0(totMes)}</div></div>${casa.membros.map(m=>`<div class="v-stat"><div class="v-label">${esc(nomeMembro(m.user_id))} pagou</div><div class="n">${brl0(porQuem[m.user_id]||0)}</div></div>`).join("")}</div></section>
  <section class="card"><div class="card-head"><h2>Nova despesa da casa</h2>${monthSwitch()}</div>
  <form id="casaForm" style="display:flex;flex-direction:column;gap:12px"><div class="row"><div class="field"><label for="hVal">Valor</label><input id="hVal" inputmode="decimal" placeholder="0,00"></div><div class="field"><label for="hDesc">Descrição</label><input id="hDesc" placeholder="Ex.: Mercado, luz, aluguel"></div></div>
  <div class="row"><div class="field"><label for="hQuem">Quem pagou</label><select id="hQuem">${casa.membros.map(m=>`<option value="${m.user_id}" ${m.user_id===me?"selected":""}>${esc(nomeMembro(m.user_id))}${m.user_id===me?" (você)":""}</option>`).join("")}</select></div>
  <div class="field"><label for="hDiv">Como dividir</label><select id="hDiv"><option value="metade">Metade para cada</option><option value="pagador">Só de quem pagou</option><option value="outro">Tudo da outra pessoa</option></select></div></div>
  <label class="tg"><input type="checkbox" id="hMeu" checked> Se fui eu que paguei, lançar também nas minhas finanças</label>
  <div><button class="btn btn-primary">${icon("i-plus")}Adicionar</button></div></form></section>
  <section class="card"><div class="card-head"><h2>Despesas de ${keyLabel(VK)}</h2><span class="hint">${mes.length} no mês</span></div>
  <div class="tx-list">${mes.length?mes.map(g=>`<button class="tx" data-casadel="${g.id}"><span class="tx-ic ${g.divisao==="outro"&&/acerto/i.test(g.descr||"")?"in":"save"}">${icon("i-users","rep-ic")}</span><span class="tx-mid"><span class="tx-desc">${esc(g.descr||"Despesa")}</span><span class="tx-meta">${esc(nomeMembro(g.pago_por))} pagou · ${g.divisao==="metade"?"metade para cada":g.divisao==="pagador"?"só de quem pagou":"da outra pessoa"} · ${fmtDate(g.data)}</span></span><span class="tx-val">${brl(+g.valor)}</span></button>`).join(""):`<div class="empty">Nenhuma despesa da casa em ${keyLabel(VK)}.</div>`}</div>
  <p class="hint" style="margin:0">Toque numa despesa para excluir.</p></section>
  <section class="card"><h2 style="font-size:17px">Convite</h2><p class="hint" style="margin:0">Código da casa: <b class="casa-cod">${esc(casa.info.codigo)}</b>. Quem tiver o código entra em Mais → Casa.</p><div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn btn-ghost" data-act="casacopiar">Copiar código</button><button class="btn btn-ghost" data-act="casasair" style="color:var(--bad)">Sair da casa</button></div></section>`;
}

/* ================= carteiras e cartões: tela ================= */
const CORES=["#8A05BE","#FF7A00","#EC0000","#0B5FFF","#111111","#00A868","#C9A253"];
function vCarteiras(){
  const tot=saldoTotal();
  return topBar("Carteiras e cartões",S.carteiras.length?`${brl(tot)} somando todas as carteiras`:"Saldo de cada conta e fatura de cada cartão",false)+
  `<section class="card"><div class="card-head"><div><div class="eyebrow">Carteiras</div><h2>Onde está seu dinheiro</h2></div><div style="display:flex;gap:6px;flex-wrap:wrap">${S.carteiras.length>1?`<button class="btn btn-sm btn-ghost" data-act="transf">Transferir</button>`:""}<button class="btn btn-sm btn-primary" data-act="novacart">${icon("i-plus")}Nova carteira</button></div></div>
  ${S.carteiras.length?`<div class="wallets">${S.carteiras.map(c=>{const v=saldoCarteira(c);return `<button class="wallet" data-editcart="${c.id}" style="--wc:${c.cor||"#0E6B5B"}"><span class="w-top"><span class="w-dot"></span>${esc(c.nome)}${S.carteiraPadrao===c.id?`<span class="w-pad">padrão</span>`:""}</span><b class="${v<0?"t-bad":""}">${brl(v)}</b><small>${c.tipo==="dinheiro"?"Dinheiro":c.tipo==="poupanca"?"Poupança / investimento":"Conta"}</small></button>`}).join("")}</div>
  <p class="hint" style="margin:0">Os lançamentos novos entram na carteira padrão, a não ser que você escolha outra ao lançar. Toque numa carteira para ajustar o saldo.</p>`
  :`<div class="empty">Cadastre suas contas (Nubank, Inter, dinheiro…) com o saldo de hoje. A partir daí, cada lançamento mexe no saldo certo.</div>`}</section>
  <section class="card"><div class="card-head"><div><div class="eyebrow">Cartões de crédito</div><h2>Faturas</h2></div><button class="btn btn-sm btn-primary" data-act="novocartao">${icon("i-plus")}Novo cartão</button></div>
  ${S.cartoes.length?S.cartoes.map(k=>{const u=fatUsado(k), ab=fatAberta(k), pct=k.limite?Math.min(100,u/k.limite*100):0; return `<div class="ccard" style="--cc:${k.cor}"><div class="cc-face"><div class="cc-top"><b>${esc(k.nome)}</b><button class="tx-del" data-editcartao="${k.id}" style="color:inherit;opacity:.8">editar</button></div><div class="cc-mid"><small>Fatura aberta · ${keyLabel(ab)}</small><span>${brl(fatTotal(k,ab))}</span></div><div class="cc-bot"><span>Fecha dia ${k.fecha} · vence dia ${k.vence}</span><span>${k.limite?`Disponível ${brl0(Math.max(0,k.limite-u))}`:""}</span></div></div>
  ${k.limite?`<div class="track" style="background:var(--surface-2);height:6px;margin-top:10px"><div class="fill ${pct>=90?"bad":pct>=70?"warn":""}" style="width:${pct}%"></div></div><span class="hint">${brl0(u)} usados de ${brl0(k.limite)}</span>`:""}
  <div class="cc-list">${[keyAdd(ab,-1),ab,keyAdd(ab,1)].filter(key=>fatTotal(k,key)>0||key===ab).map(key=>fatRow(k,key)).join("")}</div></div>`}).join(""):`<div class="empty">Cadastre seu cartão com o dia de fechamento e de vencimento. As compras no cartão caem sozinhas na fatura certa, inclusive as parceladas.</div>`}</section>`;
}
function sheetCarteira(c){
  form={tipo:c?c.tipo:"conta",cor:c?c.cor:CORES[0],edit:c?c.id:null};
  sheet(`<h3>${c?"Editar carteira":"Nova carteira"}</h3>
  <div class="field"><label for="wNome">Nome</label><input id="wNome" value="${c?esc(c.nome):""}" placeholder="Ex.: Nubank, Carteira, Poupança"></div>
  <div class="field"><label for="wSaldo">${c?"Saldo de hoje (para corrigir)":"Saldo de hoje"}</label><input id="wSaldo" inputmode="decimal" value="${c?String(saldoCarteira(c)).replace(".",","):""}" placeholder="0,00"></div>
  <div class="field"><label>Tipo</label>${opts("tipo",[["conta","Conta"],["dinheiro","Dinheiro"],["poupanca","Poupança"]],form.tipo)}</div>
  <div class="field"><label>Cor</label><div class="opts">${CORES.map(x=>`<button type="button" class="opt swatch" data-opt="cor" data-v="${x}" aria-pressed="${form.cor===x}" style="--sw:${x}" aria-label="Cor"></button>`).join("")}</div></div>
  <label class="tg"><input type="checkbox" id="wPad" ${!S.carteiras.length||(c&&S.carteiraPadrao===c.id)?"checked":""}> Usar como carteira padrão</label>
  <div class="sheet-actions">${c?`<button class="btn btn-danger" style="margin-right:auto" data-act="delcart" data-id="${c.id}">${icon("i-trash")}Excluir</button>`:""}<button class="btn btn-ghost" data-close="1">Cancelar</button><button class="btn btn-primary" data-act="salvarcart">Salvar</button></div>`);
}
function sheetCartao(k){
  form={cor:k?k.cor:CORES[0],edit:k?k.id:null};
  sheet(`<h3>${k?"Editar cartão":"Novo cartão de crédito"}</h3>
  <div class="field"><label for="kNome">Nome</label><input id="kNome" value="${k?esc(k.nome):""}" placeholder="Ex.: Nubank"></div>
  <div class="row"><div class="field"><label for="kFecha">Dia que fecha</label><input id="kFecha" inputmode="numeric" value="${k?k.fecha:""}" placeholder="Ex.: 3"></div><div class="field"><label for="kVence">Dia que vence</label><input id="kVence" inputmode="numeric" value="${k?k.vence:""}" placeholder="Ex.: 10"></div></div>
  <div class="field"><label for="kLim">Limite (opcional)</label><input id="kLim" inputmode="decimal" value="${k&&k.limite?k.limite:""}" placeholder="0,00"></div>
  <div class="field"><label>Cor</label><div class="opts">${CORES.map(x=>`<button type="button" class="opt swatch" data-opt="cor" data-v="${x}" aria-pressed="${form.cor===x}" style="--sw:${x}" aria-label="Cor"></button>`).join("")}</div></div>
  <span class="hint">Para lançar no cartão, escolha "Cartão ${k?esc(k.nome):"…"}" em "Pago com", ou escreva "no cartão ${k?esc(k.nome.toLowerCase()):"nubank"}" na caixa de mensagem.</span>
  <div class="sheet-actions">${k?`<button class="btn btn-danger" style="margin-right:auto" data-act="delcartao" data-id="${k.id}">${icon("i-trash")}Excluir</button>`:""}<button class="btn btn-ghost" data-close="1">Cancelar</button><button class="btn btn-primary" data-act="salvarcartao">Salvar</button></div>`);
}
function sheetFatura(id,key){
  const k=cartao(id); const it=fatItens(k,key).sort((a,b)=>b.data.localeCompare(a.data)); const pago=fatPaga(k,key);
  sheet(`<h3>Fatura ${esc(k.nome)} · ${keyLabel(key)}</h3><p class="hint" style="margin:0">Vence ${fmtDate(iso(fatVenc(k,key)))} · ${it.length} compra${it.length===1?"":"s"} · ${brl(fatTotal(k,key))}</p>
  <div class="tx-list" style="max-height:45vh;overflow:auto">${it.map(txRow).join("")||`<div class="empty">Sem compras.</div>`}</div>
  ${!pago&&S.carteiras.length?`<div class="field"><label for="pCart">Pagar com</label><select id="pCart">${S.carteiras.map(c=>`<option value="${c.id}" ${S.carteiraPadrao===c.id?"selected":""}>${esc(c.nome)} (${brl0(saldoCarteira(c))})</option>`).join("")}</select></div>`:""}
  <div class="sheet-actions"><button class="btn btn-ghost" data-close="1">Fechar</button><button class="btn ${pago?"btn-ghost":"btn-primary"}" data-act="pagarfat" data-id="${id}|${key}">${pago?"Desmarcar pagamento":"Marcar como paga"}</button></div>`);
}
function sheetTransf(){
  sheet(`<h3>Transferir entre carteiras</h3><div class="row"><div class="field"><label for="tDe">De</label><select id="tDe">${S.carteiras.map(c=>`<option value="${c.id}">${esc(c.nome)}</option>`).join("")}</select></div><div class="field"><label for="tPara">Para</label><select id="tPara">${S.carteiras.map((c,i)=>`<option value="${c.id}" ${i===1?"selected":""}>${esc(c.nome)}</option>`).join("")}</select></div></div>
  <div class="field"><label for="tVal">Valor</label><input id="tVal" inputmode="decimal" placeholder="0,00"></div>
  <div class="sheet-actions"><button class="btn btn-ghost" data-close="1">Cancelar</button><button class="btn btn-primary" data-act="salvartransf">Transferir</button></div>`);
}

/* ================= dívidas: tela ================= */
function vDividas(){
  const tot=S.dividas.reduce((a,d)=>a+d.parcela*d.restantes,0), mesTot=S.dividas.filter(d=>d.restantes>0).reduce((a,d)=>a+d.parcela,0);
  return topBar("Dívidas e financiamentos",S.dividas.length?`${brl(tot)} ainda a pagar · ${brl(mesTot)} por mês`:"Saiba quanto falta e quanto dá para economizar",false)+
  `<section class="card"><div class="card-head"><h2>Suas dívidas</h2><button class="btn btn-sm btn-primary" data-act="novadivida">${icon("i-plus")}Nova</button></div>
  ${S.dividas.length?S.dividas.map(d=>{const falta=d.parcela*d.restantes, pv=pvDivida(d), feito=d.total?Math.min(100,(d.total-d.restantes)/d.total*100):0, paga=divPaga(d);
    const fim=new Date(today.getFullYear(),today.getMonth()+d.restantes-(paga?0:1),1);
    return `<div class="divida"><div class="d-top"><div><b>${esc(d.nome)}</b><small>${d.restantes} parcela${d.restantes===1?"":"s"} de ${brl(d.parcela)} · dia ${d.dia}${d.juros?` · ${String(d.juros).replace(".",",")}% ao mês`:""}</small></div><button class="tx-del" data-editdiv="${d.id}">editar</button></div>
    <div class="track" style="background:var(--surface-2);height:8px"><div class="fill" style="width:${feito}%"></div></div>
    <div class="d-grid"><div><small>Falta pagar</small><b>${brl0(falta)}</b></div><div><small>Para quitar hoje*</small><b>${brl0(pv)}</b></div><div><small>Termina em</small><b>${d.restantes?MESES[fim.getMonth()].slice(0,3)+"/"+String(fim.getFullYear()).slice(2):"Quitada"}</b></div></div>
    ${d.juros&&d.restantes?`<div class="sim"><label for="sim_${d.id}">Se eu adiantar</label><input id="sim_${d.id}" data-sim="${d.id}" inputmode="decimal" placeholder="R$ 0,00"><span id="simr_${d.id}" class="hint"></span></div>`:""}
    <div style="display:flex;gap:8px;flex-wrap:wrap">${d.restantes?`<button class="btn btn-sm ${paga?"btn-ghost":"btn-primary"}" data-pagadiv="${d.id}" ${paga?"disabled":""}>${paga?`Parcela de ${keyLabel(MK)} paga`:`Paguei a parcela de ${keyLabel(MK)}`}</button>`:`<span class="pill" style="background:var(--accent-soft);color:var(--accent);padding:8px 12px">Quitada</span>`}</div></div>`}).join("")
    +`<p class="hint" style="margin:0">* Estimativa com os juros informados. O valor exato para quitar quem passa é o banco ou a loja.</p>`
  :`<div class="empty">Cadastre financiamentos, empréstimos ou acordos. O Prumo mostra quanto falta, quando termina e quanto você economiza adiantando parcelas.</div>`}</section>`;
}
function sheetDivida(d){
  sheet(`<h3>${d?"Editar dívida":"Nova dívida"}</h3>
  <div class="field"><label for="dNome">Nome</label><input id="dNome" value="${d?esc(d.nome):""}" placeholder="Ex.: Financiamento do carro"></div>
  <div class="row"><div class="field"><label for="dPar">Valor da parcela</label><input id="dPar" inputmode="decimal" value="${d?String(d.parcela).replace(".",","):""}" placeholder="0,00"></div><div class="field"><label for="dRest">Parcelas que faltam</label><input id="dRest" inputmode="numeric" value="${d?d.restantes:""}"></div></div>
  <div class="row"><div class="field"><label for="dDia">Dia do vencimento</label><input id="dDia" inputmode="numeric" value="${d?d.dia:""}"></div><div class="field"><label for="dJur">Juros ao mês (%)</label><input id="dJur" inputmode="decimal" value="${d&&d.juros?String(d.juros).replace(".",","):""}" placeholder="Ex.: 1,8"></div></div>
  <span class="hint">Os juros ficam no contrato ou no app do banco (taxa mensal). Sem eles, o app não calcula a economia de adiantar.</span>
  <div class="sheet-actions">${d?`<button class="btn btn-danger" style="margin-right:auto" data-act="deldiv" data-id="${d.id}">${icon("i-trash")}Excluir</button>`:""}<button class="btn btn-ghost" data-close="1">Cancelar</button><button class="btn btn-primary" data-act="salvardiv" data-id="${d?d.id:""}">Salvar</button></div>`);
}
function sheetNome(){
  const sug=meuNome()||((sess&&/mateus/i.test(sess.user.email))?"Mateus":"");
  sheet(`<h3>Como você quer ser chamado?</h3><p class="hint" style="margin:0">O nome aparece na saudação e na área da casa.</p><div class="field"><label for="nNome">Seu nome</label><input id="nNome" value="${esc(sug)}" placeholder="Ex.: Mateus"></div><div class="sheet-actions"><button class="btn btn-primary" data-act="salvarnome">Salvar</button></div>`);
}


/* ================= telas ================= */
function vInicio(){
  const bills=visibleBills().filter(c=>!billPaid(c)).sort((a,b)=>billDue(a)-billDue(b)).slice(0,5);
  const last=monthTx().sort((a,b)=>b.data.localeCompare(a.data)).slice(0,6);
  const hr=new Date().getHours(); const saud=hr<12?"Bom dia":hr<18?"Boa tarde":"Boa noite";
  const fut=futuro(3);
  return topBar(saud+(meuNome()?", "+esc(meuNome()):""),isCur()?`${today.getDate()} de ${MESES[today.getMonth()]} · veja como está o seu mês`:`Vendo ${keyLabel(VK)} de ${VK.slice(0,4)}`)+exampleBanner()+alertBanner()+vault()+(S.carteiras.length?`<div class="wstrip">${S.carteiras.map(c=>`<button class="wchip" data-go="carteiras" style="--wc:${c.cor||"#0E6B5B"}"><span class="w-dot"></span><span>${esc(c.nome)}</span><b>${brl0(saldoCarteira(c))}</b></button>`).join("")}${S.cartoes.map(k=>`<button class="wchip" data-go="carteiras" style="--wc:${k.cor}"><span class="w-dot sq"></span><span>${esc(k.nome)}</span><b>${brl0(fatTotal(k,fatAberta(k)))}</b></button>`).join("")}</div>`:"")+(isCur()?quickBox()+previsaoCard():"")+
  `<div class="grid2"><section class="card"><div class="card-head"><h2>${isCur()?"Próximas contas":"Contas em aberto"}</h2><button class="link" data-go="contas">Ver todas</button></div>
  ${bills.length?bills.map(billRow).join(""):`<div class="empty">Tudo pago por aqui.</div>`}</section>
  <section class="card"><div class="card-head"><h2>Para onde vai seu dinheiro</h2></div>${splitBar()}<div style="display:flex;flex-direction:column;gap:10px">${insights().slice(0,3).map(i=>`<div class="insight">${insightIcon(i)}<span>${i.t}</span></div>`).join("")}</div></section></div>
  ${E().ativo?(()=>{const R=empResumo();return `<button class="card emp-mini" data-go="empresa"><span class="tx-ic save">${icon("i-brief","rep-ic")}</span><span class="tx-mid"><span class="tx-desc">Empréstimos empresa</span><span class="tx-meta">${brl(R.pego+R.carry)} pegos · dia ${fechDay(VK)} você recebe ${R.deve?"nada":brl(R.receber)}</span></span><span class="tx-val ${R.deve?"t-bad":""}">${R.deve?"-"+brl0(R.deve):brl0(R.receber)}</span></button>`})():""}
  ${isCur()?`<section class="card"><div class="card-head"><h2>Já comprometido nos próximos meses</h2><span class="hint">parcelas + contas fixas</span></div><div class="fut">${fut.map(f=>`<div class="fut-m"><span class="v-label" style="color:var(--ink-3)">${cap(keyLabel(f.k))}</span><b>${brl0(f.total)}</b><span class="hint">${f.parc?brl0(f.parc)+" em parcelas":"sem parcelas"}</span><div class="track" style="background:var(--surface-2);height:6px"><div class="fill ${S.config.renda&&f.total/S.config.renda>.7?"bad":S.config.renda&&f.total/S.config.renda>.5?"warn":""}" style="width:${S.config.renda?Math.min(100,f.total/S.config.renda*100):0}%;background:${S.config.renda&&f.total/S.config.renda>.7?"var(--bad)":S.config.renda&&f.total/S.config.renda>.5?"var(--warn)":"var(--accent)"}"></div></div></div>`).join("")}</div></section>`:""}
  <section class="card"><div class="card-head"><h2>Últimos lançamentos</h2><button class="link" data-go="lancamentos">Ver todos</button></div>${last.length?last.map(txRow).join(""):`<div class="empty">Nada lançado em ${keyLabel(VK)}.</div>`}</section>`;
}
function vContas(){
  const all=visibleBills().sort((a,b)=>billDue(a)-billDue(b));
  const aberto=all.filter(c=>!billPaid(c)), pagas=all.filter(c=>billPaid(c));
  const tot=aberto.reduce((a,c)=>a+c.valor,0);
  const grp=k=>{const l=aberto.filter(c=>c.prio===k); return l.length?`<div class="group-title">${PRIO[k].label} · ${brl0(l.reduce((a,c)=>a+c.valor,0))}</div>`+l.map(billRow).join(""):""};
  return topBar("Contas a pagar",`${aberto.length} em aberto · ${brl(tot)} em ${keyLabel(VK)}`)+exampleBanner()+
  `<section class="card"><div class="card-head"><div class="seg" role="group" aria-label="Visualização"><button data-cview="lista" aria-pressed="${contasView==="lista"}">Lista</button><button data-cview="cal" aria-pressed="${contasView==="cal"}">${icon("i-cal","seg-ic")}Calendário</button></div><button class="btn btn-sm btn-primary" data-act="novaconta">${icon("i-plus")}Nova conta</button></div>
  ${contasView!=="cal"&&S.cartoes.some(k=>fatTotal(k,VK)>0)?`<div class="group-title">Faturas de cartão</div>`+S.cartoes.filter(k=>fatTotal(k,VK)>0).map(k=>fatRow(k,VK)).join(""):""}
  ${contasView==="cal"?calendar():(aberto.length?grp("super")+grp("importante")+grp("relativa"):`<div class="empty">Nenhuma conta em aberto em ${keyLabel(VK)}.</div>`)+(pagas.length?`<div class="group-title">Pagas em ${keyLabel(VK)}</div>`+pagas.map(billRow).join(""):"")}</section>
  <div class="banner example" style="background:var(--surface-2)">${icon("i-info")}<div class="grow">Ao marcar uma conta como paga, o Prumo lança o gasto sozinho. Super importantes e importantes contam como <b>necessárias</b>; relativas, como <b>não necessárias</b>.</div></div>`;
}
function lancList(){
  let l=monthTx().sort((a,b)=>b.data.localeCompare(a.data));
  if(lancFilter==="necessario") l=l.filter(t=>t.tipo==="gasto"&&t.nec==="necessario");
  if(lancFilter==="nao") l=l.filter(t=>t.tipo==="gasto"&&t.nec==="nao");
  if(lancFilter==="renda") l=l.filter(t=>t.tipo==="renda");
  if(lancFilter==="guardar") l=l.filter(t=>t.tipo==="guardar");
  if(lancFilter==="parc") l=l.filter(t=>t.parc);
  return l;
}
function listaHtml(l){
  if(buscaQ.trim()){const r=buscar(buscaQ); return r.length?`<div class="hint" style="padding:6px 0">${r.length} resultado${r.length>1?"s":""} · ${brl(r.filter(t=>t.tipo==="gasto").reduce((a,t)=>a+t.valor,0))} em gastos</div>`+r.map(txRow).join(""):`<div class="empty">Nada encontrado para "${esc(buscaQ)}".</div>`}
  return l.length?l.map(txRow).join(""):`<div class="empty">Nada neste filtro.</div>`;
}
function vLanc(){
  const l=lancList();
  const F=[["todos","Todos"],["necessario","Necessários"],["nao","Não necessários"],["renda","Entradas"],["guardar","Guardado"],["parc","Parcelas"]];
  const bar=selMode?`<div class="selbar"><span><b>${sel.size}</b> selecionado${sel.size===1?"":"s"}</span><div style="display:flex;gap:6px;flex-wrap:wrap"><button class="btn btn-sm btn-ghost" data-act="selall">${sel.size===l.length&&l.length?"Desmarcar todos":"Marcar todos"}</button><button class="btn btn-sm btn-ghost" data-act="selsair">Cancelar</button><button class="btn btn-sm btn-danger" data-act="seldel" ${sel.size?"":"disabled"}>Excluir ${sel.size||""}</button></div></div>`:"";
  return topBar("Lançamentos",`Tudo o que entrou, saiu e foi guardado em ${keyLabel(VK)}`)+(isCur()&&!selMode?quickBox():"")+
  `<section class="card"><div class="card-head"><div class="seg seg-scroll" role="group" aria-label="Filtrar">${F.map(([k,t])=>`<button data-filter="${k}" aria-pressed="${lancFilter===k}">${t}</button>`).join("")}</div>
  ${selMode?"":`<div style="display:flex;gap:6px;flex-wrap:wrap"><button class="btn btn-sm btn-ghost" data-act="selon">${icon("i-check")}Selecionar</button><button class="btn btn-sm btn-ghost" data-act="importar">${icon("i-upload")}Importar</button><button class="btn btn-sm btn-ghost" data-act="csv">Exportar</button></div>`}</div>
  ${selMode?"":`<div class="busca">${icon("i-search")}<input id="busca" type="search" placeholder="Buscar em todos os meses: gasolina, #viagem, 45…" value="${esc(buscaQ)}" autocomplete="off"></div>`}
  ${!selMode&&tagTotals().length?`<div class="chips">${tagTotals().slice(0,8).map(([g,v])=>`<button class="chip chip-q" data-tag="${esc(g)}">${esc(g)} · ${brl0(v)}</button>`).join("")}</div>`:""}
  ${bar}${selMode?"":`<p class="hint" style="margin:0">Toque num lançamento para editar ou excluir. Para apagar vários de uma vez, use Selecionar. Escreva #etiqueta na descrição para agrupar gastos.</p>`}
  <div class="tx-list" id="txlist">${listaHtml(l)}</div></section>`;
}
function vMetas(){
  const tot=S.metas.reduce((a,m)=>a+m.guardado,0);
  return topBar("Metas e cofrinhos",`${brl(tot)} guardados no total`,false)+exampleBanner()+
  `<section class="card"><div class="card-head"><h2>Seus cofrinhos</h2><button class="btn btn-sm btn-gold" data-act="novameta">${icon("i-plus")}Nova meta</button></div>
  ${S.metas.length?`<div class="goals">${S.metas.map(goalCard).join("")}</div>`:`<div class="empty">Crie sua primeira meta. Comece por uma reserva de emergência de 6 meses de gastos.</div>`}</section>
  ${desafiosHtml()}
  <section class="card"><h2 style="font-size:17px">Como guardar sem sofrer</h2>
  <div class="insight"><span class="ic gold">1</span><span><b>Pague-se primeiro.</b> No dia em que o dinheiro entrar, guarde ${S.config.metaGuardar}% antes de qualquer gasto. Dá para criar isso como lançamento automático em Ajustes.</span></div>
  <div class="insight"><span class="ic gold">2</span><span><b>Reserva antes de sonhos.</b> Monte 6 meses de gastos necessários (${brl0(totals(MK).nec*6||0)}) numa aplicação com liquidez diária.</span></div>
  <div class="insight"><span class="ic gold">3</span><span><b>Fuja do parcelado.</b> Cada parcela é um pedaço do salário do mês que vem que já foi gasto.</span></div></section>`;
}
function vRel(){
  const months=[]; for(let i=5;i>=0;i--) months.push(keyAdd(VK,-i));
  const data=months.map(k=>{const tx=monthTx(k); return {k,l:keyLabel(k).slice(0,3),g:tx.filter(t=>t.tipo==="gasto").reduce((a,t)=>a+t.valor,0),r:tx.filter(t=>t.tipo==="renda").reduce((a,t)=>a+t.valor,0)}});
  const max=Math.max(1,...data.map(d=>Math.max(d.g,d.r)));
  const W=640,H=220,pad=40,bw=(W-pad*2)/data.length;
  const chart=oculto?`<div class="empty">Valores escondidos. Toque no olho para mostrar.</div>`:`<div style="overflow-x:auto"><svg viewBox="0 0 ${W} ${H+30}" style="width:100%;height:auto" role="img" aria-label="Entradas e gastos dos últimos 6 meses">
  ${[0,.5,1].map(f=>{const t=max*f,y=H-f*(H-20);return `<line x1="${pad}" x2="${W-8}" y1="${y}" y2="${y}" stroke="var(--line)"/><text x="${pad-6}" y="${y+4}" text-anchor="end" font-size="10" fill="var(--ink-3)">${t>=1000?(t/1000).toFixed(1).replace(".",",")+"k":Math.round(t)}</text>`}).join("")}
  ${data.map((d,i)=>{const x=pad+i*bw+bw*.18,w=bw*.3,hr=(d.r/max)*(H-20),hg=(d.g/max)*(H-20);return `<rect x="${x}" y="${H-hr}" width="${w}" height="${hr}" rx="4" fill="var(--accent)"/><rect x="${x+w+4}" y="${H-hg}" width="${w}" height="${hg}" rx="4" fill="${d.r&&d.g>d.r?"var(--bad)":"var(--warn)"}"/><text x="${x+w+2}" y="${H+18}" text-anchor="middle" font-size="11" fill="${d.k===VK?"var(--ink)":"var(--ink-3)"}" font-weight="${d.k===VK?700:400}">${d.l}</text>`}).join("")}
  </svg></div><div class="legend" style="grid-template-columns:auto auto;justify-content:start;gap:18px"><div><i style="background:var(--accent)"></i>Entradas</div><div><i style="background:var(--warn)"></i>Gastos (vermelho quando passou da entrada)</div></div>`;
  return topBar("Relatório",`${cap(keyLabel(VK))} de ${VK.slice(0,4)}`)+
  `<section class="card"><div class="card-head"><h2>Últimos 6 meses</h2><div style="display:flex;gap:6px;flex-wrap:wrap"><button class="btn btn-sm btn-ghost" data-act="resumo">Resumo de ${keyLabel(keyAdd(VK,isCur()?-1:0))}</button><button class="btn btn-sm btn-primary" data-act="pdf">${icon("i-doc")}PDF de ${keyLabel(VK)}</button></div></div>${chart}</section>
  <div class="grid2"><section class="card"><div class="card-head"><h2>Orçamento por categoria</h2><button class="link" data-act="orc">Definir limites</button></div>${budgetBars()}<span class="hint">O traço marca o limite da categoria. Sem limite, laranja = não necessário.</span></section>
  <section class="card"><h2 style="font-size:17px">Sugestões do Prumo</h2>${insights().map(i=>`<div class="insight">${insightIcon(i)}<span>${i.t}</span></div>`).join("")||`<div class="empty">Lance alguns gastos para ver sugestões.</div>`}</section></div>
  <div class="grid2"><section class="card"><div class="card-head"><h2>Por etiqueta</h2><span class="hint">${keyLabel(VK)}</span></div>${tagTotals().length?tagTotals().map(([g,v])=>`<button class="cat-row tagrow" data-tag="${esc(g)}"><span>${esc(g)}</span><div class="cat-bar"><span style="width:${v/tagTotals()[0][1]*100}%;background:var(--gold)"></span></div><span class="v">${brl0(v)}</span></button>`).join(""):`<div class="empty">Escreva #etiqueta na descrição, como "jantar #aniversario", para ver aqui quanto custou cada coisa.</div>`}</section>
  ${(()=>{const ano=+VK.slice(0,4), I=irDados(ano); return `<section class="card"><div class="card-head"><div><div class="eyebrow">Imposto de Renda</div><h2>Gastos dedutíveis de ${ano}</h2></div><button class="btn btn-sm btn-ghost" data-act="ir" data-ano="${ano}">Ver lista</button></div>
  <div class="sum-grid"><div><span class="hint">Saúde</span><b>${brl0(I.ts)}</b><span class="hint">${I.saude.length} lançamentos</span></div><div><span class="hint">Educação</span><b>${brl0(I.te)}</b><span class="hint">${I.edu.length} lançamentos</span></div></div>
  <p class="hint" style="margin:0">Consultas, exames, dentista e plano de saúde costumam ser dedutíveis sem limite. Educação (escola, faculdade) tem limite anual por pessoa. Farmácia e academia normalmente não entram. Guarde os comprovantes e confira com o seu contador.</p></section>`})()}</div>`;
}
function vEmpresa(){
  const e=E(), R=empResumo(), itens=empItens(VK), fd=fechDay(VK), ad=adiDay(VK);
  const cur=isCur(), passou15=cur?today.getDate()>=ad:VK<MK, passou30=cur?today.getDate()>=fd:VK<MK;
  const pct=R.base?Math.min(100,Math.round((R.pego+R.carry)/R.base*100)):0, cls=R.deve?"bad":pct>=80?"warn":"";
  const porDia={}; itens.forEach(i=>(porDia[i.data]=porDia[i.data]||[]).push(i));
  const hist=[]; for(let i=5;i>=0;i--){const k=keyAdd(VK,-i); const r=empResumo(k); if(r.pego||k===VK) hist.push({k,...r})}
  return topBar("Empréstimos empresa",`Descontados no dia ${fd} · salário de ${brl0(e.salario)}`)+
  `<section class="vault emp-hero" aria-label="Resumo da empresa"><div style="position:relative;z-index:1">
    <div class="v-label">${passou30?"Você recebeu no dia "+fd:"Você recebe no dia "+fd}</div>
    <div class="v-big ${R.deve?"neg":""}">${money(R.receber)}</div>
    <div class="v-sub">${R.deve?`<b style="color:#F38A7E">Os empréstimos passaram ${brl(R.deve)} do valor do dia ${fd}.</b> Essa diferença será descontada no próximo mês.`:`${brl(R.base)} menos <b>${brl(R.pego+R.carry)}</b> em empréstimos${R.carry?` (inclui ${brl(R.carry)} do mês anterior)`:""}.`}</div>
    <div class="meter"><div class="meter-row"><span>Já pego do dia ${fd}</span><span><b>${brl0(R.pego+R.carry)}</b> de ${brl0(R.base)} · ${oculto?"•••":pct+"%"}</span></div><div class="track"><div class="fill ${cls}" style="width:${pct}%"></div></div></div></div>
    <div class="v-stats">
      <div class="v-stat"><div class="v-label">Dia ${ad} · livre</div><div class="n">${brl0(e.adiant)}</div><div class="v-ok">${passou15?"Recebido":"A receber"}</div></div>
      <div class="v-stat"><div class="v-label">Pego em ${keyLabel(VK)}</div><div class="n">${brl0(R.pego)}</div><div class="v-ok">${R.n} ${R.n===1?"vez":"vezes"}</div></div>
      <div class="v-stat"><div class="v-label">Salário do mês</div><div class="n">${brl0(e.salario)}</div></div>
      <div class="v-stat"><div class="v-label">${R.carry?"Dívida anterior":"Média por vez"}</div><div class="n gold">${brl0(R.carry||(R.n?R.pego/R.n:0))}</div></div>
    </div></section>
  <section class="card emp-form"><h2 style="font-size:17px">Peguei da empresa</h2>
  <form id="empForm" class="emp-grid"><div class="field"><label for="eVal">Valor</label><input id="eVal" inputmode="decimal" placeholder="0,00" autocomplete="off"></div>
  <div class="field"><label for="eDesc">Para quê (opcional)</label><input id="eDesc" placeholder="Ex.: almoço, gasolina" autocomplete="off"></div>
  <div class="field"><label for="eData">Data</label><input id="eData" type="date" value="${cur?iso(today):VK+"-01"}"></div>
  <button class="btn btn-primary emp-go">${icon("i-plus")}Lançar</button></form>
  <div class="chips">${[20,50,100,150,200].map(v=>`<button class="chip" data-empv="${v}">R$ ${v}</button>`).join("")}</div>
  <p class="hint" style="margin:0">Também dá para escrever na caixa de mensagem da tela inicial: "peguei 50 da empresa".</p></section>
  <section class="card"><div class="card-head"><h2>Empréstimos de ${keyLabel(VK)}</h2><span class="emp-tot">Total <b>${brl(R.pego)}</b></span></div>
  ${itens.length?Object.entries(porDia).map(([d,l])=>`<div class="group-title">${fmtDate(d)}${l.length>1?" · "+brl0(l.reduce((a,i)=>a+i.valor,0)):""}</div>`+l.map(i=>`<button class="tx" data-editemp="${i.id}" aria-label="Editar: ${esc(i.desc||"Empréstimo")}"><span class="tx-ic save">${icon("i-brief","rep-ic")}</span><span class="tx-mid"><span class="tx-desc">${esc(i.desc||"Empréstimo")}</span><span class="tx-meta">${fmtDate(i.data)} · toque para editar ou excluir</span></span><span class="tx-val">${brl(i.valor)}</span></button>`).join("")).join("")
    :`<div class="empty">Nenhum empréstimo em ${keyLabel(VK)}. Lance o primeiro acima.</div>`}</section>
  <div class="grid2"><section class="card"><h2 style="font-size:17px">Últimos meses</h2>
  <div class="emp-hist"><div class="eh-h"><span>Mês</span><span>Pego</span><span>Dia ${e.diaFech}</span></div>${hist.map(h=>`<div class="eh-r ${h.k===VK?"cur":""}"><span>${cap(keyLabel(h.k))}</span><span>${brl0(h.pego)}</span><span class="${h.deve?"t-bad":"t-ok"}">${h.deve?"-"+brl0(h.deve):brl0(h.receber)}</span></div>`).join("")}</div></section>
  <section class="card"><h2 style="font-size:17px">Como está configurado</h2>
  <p class="hint" style="margin:0">Salário de ${brl(e.salario)}. Dia ${e.diaAdiant} você recebe ${brl(e.adiant)} livre. Dia ${e.diaFech} recebe ${brl(e.salario-e.adiant)} menos os empréstimos do mês. Empréstimos feitos depois do dia ${e.diaFech} entram no mês seguinte.${e.noSaldo?" Os dois pagamentos e os empréstimos entram sozinhos no seu saldo.":""}</p>
  <div><button class="btn btn-ghost" data-act="empcfg">${icon("i-gear")}Ajustar salário e datas</button></div></section></div>`;
}
function vAjustes(){
  const c=S.config, pin=!!lsGet("-pin"), perm=notifPerm(), pushOn=lsGet("-push")==="1";
  return topBar("Ajustes","Conta, renda, limites, segurança e avisos",false)+
  `<section class="card"><div class="card-head"><h2>Sua conta</h2><div class="sync"></div></div>
  ${!sb?`<p class="hint" style="margin:0">A nuvem ainda não foi configurada neste site. Seus dados ficam só neste aparelho. Faça backup de vez em quando.</p>`
    :sess?`<p style="margin:0">Conectado como <b>${esc(sess.user.email)}</b>. Seus dados ficam salvos na nuvem e aparecem em qualquer aparelho em que você entrar.</p><div><button class="btn btn-ghost" data-act="sair">Sair da conta</button></div>`
    :`<p class="hint" style="margin:0">Entre para salvar na nuvem, usar em mais de um aparelho e receber lembretes com o app fechado.</p><div><button class="btn btn-primary" data-act="login">Entrar ou criar conta</button></div>`}</section>
  <section class="card"><div class="card-head"><h2>Seu nome</h2><button class="btn btn-sm btn-ghost" data-act="editnome">${meuNome()?"Trocar":"Definir"}</button></div><p class="hint" style="margin:0">${meuNome()?`Você aparece como <b>${esc(meuNome())}</b> na saudação e na área da casa.`:"Defina como você quer ser chamado."}</p></section>
  <section class="card"><h2 style="font-size:17px">Aparência</h2><p class="hint" style="margin:0">No automático, o app acompanha o tema do seu celular.</p>
  <div class="theme-seg" role="group" aria-label="Tema">${[["auto","Automático","i-auto"],["claro","Claro","i-sun"],["escuro","Escuro","i-moon"]].map(([k,t,i])=>`<button data-tema="${k}" aria-pressed="${tema===k}">${icon(i)}${t}</button>`).join("")}</div></section>
  <section class="card"><form id="cfgForm" style="display:flex;flex-direction:column;gap:14px"><h2 style="font-size:17px">Renda e limites</h2>
  <div class="row"><div class="field"><label for="cRenda">Renda mensal esperada</label><input id="cRenda" inputmode="decimal" value="${c.renda||""}" placeholder="Ex.: 5000"></div>
  <div class="field"><label for="cLim">Limite de gastos do mês</label><input id="cLim" inputmode="decimal" value="${c.limite||""}" placeholder="Ex.: 3500"></div></div>
  <div class="row"><div class="field"><label for="cMeta">Quanto guardar por mês (%)</label><input id="cMeta" inputmode="numeric" value="${c.metaGuardar}"></div>
  <div class="field"><label for="cAviso">Avisar contas com quantos dias de antecedência</label><input id="cAviso" inputmode="numeric" value="${c.diasAviso}"></div></div>
  <p class="hint" style="margin:0">Sem limite definido, o Prumo usa 80% da renda. O alerta vermelho dispara quando gastos + contas em aberto passam do limite.</p>
  <div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn btn-primary">Salvar</button><button type="button" class="btn btn-ghost" data-act="orc">Limites por categoria</button></div></form></section>
  <section class="card"><div class="card-head"><h2>Lançamentos automáticos</h2><button class="btn btn-sm btn-primary" data-act="novorec">${icon("i-plus")}Novo</button></div>
  <p class="hint" style="margin:0">Entram sozinhos todo mês no dia escolhido. Bom para salário, assinaturas debitadas e o valor que você guarda.</p>
  ${S.rec.length?S.rec.map(r=>`<div class="tx"><div class="tx-ic ${r.tipo==="renda"?"in":r.tipo==="guardar"?"save":r.nec==="nao"?"nao":""}">${icon("i-repeat","rep-ic")}</div><div style="min-width:0"><div class="tx-desc">${esc(r.desc)}</div><div class="tx-meta">${r.tipo==="renda"?"Entrada":r.tipo==="guardar"?"Guardar":esc(r.cat)} · todo dia ${r.dia}</div></div><div class="tx-val">${brl(r.valor)}<br><button class="tx-del" data-delrec="${r.id}">remover</button></div></div>`).join(""):`<div class="empty">Nenhum ainda.</div>`}</section>
  <section class="card"><h2 style="font-size:17px">Notificações</h2>
  <p class="hint" style="margin:0">${sess&&cfg&&cfg.vapidPublicKey?"Com a conta conectada, os lembretes chegam todo dia às 8h, mesmo com o app fechado: contas que vencem, atrasadas, orçamento estourado e o resumo no dia 1º.":"Sem a conta conectada, os avisos aparecem quando você abre o app."} No iPhone, instale o app na tela de início antes de ativar.</p>
  <div style="display:flex;gap:8px;flex-wrap:wrap">${perm==="granted"&&(pushOn||!sess)?`<span class="pill" style="background:var(--accent-soft);color:var(--accent);padding:8px 12px">Ativadas</span>${pushOn?`<button class="btn btn-sm btn-ghost" data-act="pushteste">Enviar notificação de teste</button>`:""}`:`<button class="btn btn-primary" data-act="notifon">${icon("i-bell")}Ativar notificações</button>`}</div></section>
  <section class="card"><h2 style="font-size:17px">Segurança</h2>
  <p class="hint" style="margin:0">O PIN protege o app neste aparelho. Ele é pedido ao abrir e depois de 3 minutos fora do app. O botão de olho no topo esconde os valores quando tiver alguém por perto.</p>
  <div style="display:flex;gap:8px;flex-wrap:wrap">${pin?`<button class="btn btn-ghost" data-act="pintrocar">${icon("i-lock")}Trocar PIN</button><button class="btn btn-ghost" data-act="pinremover">Remover PIN</button>`:`<button class="btn btn-primary" data-act="pincriar">${icon("i-lock")}Criar PIN de 4 dígitos</button>`}</div></section>
  <section class="card"><h2 style="font-size:17px">Seus dados</h2><p class="hint" style="margin:0">${sess?"Além da nuvem, você pode baixar uma cópia.":"Ficam só neste aparelho. Faça backup de vez em quando."}${(()=>{const b=lsGet("-backup"); return b?" Último backup: "+fmtDate(b)+".":""})()}</p>
  <div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn btn-gold" data-act="backup">Baixar backup</button><label class="btn btn-ghost" for="fRest" style="cursor:pointer">Restaurar backup</label><input id="fRest" type="file" accept="application/json,.json" hidden><button class="btn btn-ghost" data-act="importar">Importar extrato</button><button class="btn btn-ghost" data-act="csv">Exportar planilha</button><button class="btn btn-ghost" data-act="limparconfirm" style="color:var(--bad)">Apagar tudo</button></div></section>
  <section class="card"><h2 style="font-size:17px">Ainda por vir</h2><div class="roadmap">
   <div class="road"><b>Lançar pelo WhatsApp</b>Com a nuvem ligada, falta só um número conectado (Evolution API ou Z-API) que grave as mensagens na sua conta.</div>
   <div class="road"><b>Bancos (Open Finance)</b>Puxar extrato direto exige um agregador autorizado pelo Banco Central, como Pluggy ou Belvo. Até lá, use Importar extrato.</div></div></section>`;
}
function render(){
  renderNav();
  const v={inicio:vInicio,contas:vContas,lancamentos:vLanc,metas:vMetas,relatorio:vRel,ajustes:vAjustes,empresa:vEmpresa,carteiras:vCarteiras,dividas:vDividas,casa:vCasa}[route]||vInicio;
  $("#view").innerHTML=v(); setSync(); if(notifOpen) renderNotif();
}

/* ================= toasts e avisos ================= */
let toastT;
function toast(msg,bad,undo){
  document.querySelector(".toast")?.remove();
  const el=document.createElement("div"); el.className="toast"+(bad?" bad":""); el.setAttribute("role","status");
  el.innerHTML=`<span>${msg}</span>${undo?`<button class="toast-undo" data-undo="${undo}">Desfazer</button>`:""}`; document.body.appendChild(el);
  clearTimeout(toastT); toastT=setTimeout(()=>el.remove(),undo?6000:4200);
}
function feedback(base,cat){
  const T=totals(MK); const b=cat&&S.orc[cat]?budgetState(MK).find(x=>x.c===cat):null;
  if(T.limite&&T.uso>=1) return toast(`${base} Passou do limite do mês em ${brl(T.gasto+T.aPagar-T.limite)}.`,true);
  if(b&&b.p>=1) return toast(`${base} ${esc(cat)} passou do orçamento (${brl0(b.g)} de ${brl0(b.lim)}).`,true);
  if(b&&b.p>=.85) return toast(`${base} ${esc(cat)} já está em ${Math.round(b.p*100)}% do orçamento.`);
  if(T.limite) return toast(`${base} Restam ${brl(Math.max(0,T.limite-T.gasto-T.aPagar))} no limite do mês.`);
  toast(base);
}
function renderNotif(){
  const a=alerts(); let el=document.querySelector(".notif-panel");
  if(!el){el=document.createElement("div");el.className="notif-panel";el.setAttribute("role","dialog");el.setAttribute("aria-label","Avisos");document.body.appendChild(el)}
  el.innerHTML=`<div style="display:flex;justify-content:space-between;align-items:center"><h3>Avisos</h3><button class="link" data-act="notif">Fechar</button></div>`+(a.length?a.map(x=>`<div class="notif ${x.lv}">${esc(x.txt)}</div>`).join(""):`<div class="notif">Nada pendente. Tudo em dia.</div>`);
}

/* ================= modais ================= */
function sheet(html){ $("#layer").innerHTML=`<div class="sheet-bg" data-close="1"><div class="sheet" role="dialog" aria-modal="true">${html}</div></div>`; const f=$("#layer input:not([type=file]):not([type=checkbox])"); if(f) setTimeout(()=>f.focus(),30)}
function closeSheet(){ $("#layer").innerHTML="" }
let form={};
function opts(name,list,cur){return `<div class="opts">${list.map(([k,t,c])=>`<button type="button" class="opt ${c||""}" data-opt="${name}" data-v="${k}" aria-pressed="${k===cur}">${t}</button>`).join("")}</div>`}
function sheetLanc(rec){
  form={tipo:"gasto",nec:CATS[S.ultimaCat]||"necessario",repete:!!rec,rec:!!rec};
  sheet(`<div class="sheet-h"><h3>${rec?"Novo lançamento automático":"Novo lançamento"}</h3>${rec?"":`<button class="btn btn-sm btn-ghost" data-act="foto">${icon("i-camera")}Ler comprovante</button>`}</div>
  ${opts("tipo",[["gasto","Gasto"],["renda","Entrada"],["guardar","Guardar"]],"gasto")}
  <div class="row"><div class="field"><label for="fVal">Valor ${rec?"":"total"}</label><input id="fVal" inputmode="decimal" placeholder="0,00"></div>
  <div class="field" id="wrapParc"${rec?" hidden":""}><label for="fParc">Parcelas</label><select id="fParc">${Array.from({length:24},(_,i)=>`<option value="${i+1}">${i?(i+1)+"x":"À vista"}</option>`).join("")}</select></div>
  ${rec?`<div class="field"><label for="fDia">Todo dia</label><input id="fDia" inputmode="numeric" value="${today.getDate()}"></div>`:""}</div>
  <div class="field"><label for="fDesc">Descrição</label><input id="fDesc" placeholder="Ex.: Mercado da semana"></div>
  <div class="row"><div class="field" id="wrapCat"><label for="fCat">Categoria</label><select id="fCat">${GASTO_CATS.map(c=>`<option ${c===S.ultimaCat?"selected":""}>${c}</option>`).join("")}</select></div>
  ${rec?"":`<div class="field"><label for="fData">Data</label><input id="fData" type="date" value="${isCur()?iso(today):VK+"-01"}"></div>`}</div>
  <div class="field" id="wrapMeta" hidden><label for="fMeta">Para qual meta</label><select id="fMeta">${S.metas.map(m=>`<option value="${m.id}">${esc(m.nome)}</option>`).join("")||"<option value=''>Sem metas criadas</option>"}</select></div>
  <div class="field" id="wrapNec"><label>Esse gasto é…</label>${opts("nec",[["necessario","Necessário"],["nao","Não necessário"]],form.nec)}<span class="hint">Pergunta honesta: você conseguiria viver sem ele este mês?</span></div>
  ${pagOpts()}
  ${rec?"":`<label class="tg"><input type="checkbox" id="fRep"> Repetir todo mês neste dia</label>`}
  <div class="sheet-actions"><button class="btn btn-ghost" data-close="1">Cancelar</button><button class="btn btn-primary" data-act="salvarlanc">Salvar</button></div>`);
}
function sheetConta(c){
  const e=c||{nome:"",valor:"",dia:today.getDate(),prio:"importante",rec:true,cat:"Contas"};
  form={prio:e.prio,rec:e.rec?"1":"0",edit:c?c.id:null};
  sheet(`<h3>${c?"Editar conta":"Nova conta a pagar"}</h3>
  <div class="field"><label for="bNome">Nome</label><input id="bNome" value="${esc(e.nome)}" placeholder="Ex.: Conta de luz"></div>
  <div class="row"><div class="field"><label for="bVal">Valor</label><input id="bVal" inputmode="decimal" value="${e.valor}" placeholder="0,00"></div>
  <div class="field"><label for="bDia">Dia do vencimento</label><input id="bDia" inputmode="numeric" value="${e.dia||(e.data?parseISO(e.data).getDate():"")}"></div></div>
  <div class="field"><label for="bCat">Categoria</label><select id="bCat">${GASTO_CATS.map(x=>`<option ${x===(e.cat||"Contas")?"selected":""}>${x}</option>`).join("")}</select></div>
  <div class="field"><label>Prioridade</label>${opts("prio",Object.entries(PRIO).map(([k,p])=>[k,p.label,"o-"+k]),e.prio)}
  <span class="hint">Super importante: atrasar gera juros, corte ou nome sujo. Importante: essencial mas negociável. Relativa: dá para pausar.</span></div>
  <div class="field"><label>Repete</label>${opts("rec",[["1","Todo mês"],["0","Só uma vez"]],form.rec)}</div>
  <div class="sheet-actions">${c?`<button class="btn btn-ghost" style="color:var(--bad);margin-right:auto" data-delbill="${c.id}">Excluir</button>`:""}<button class="btn btn-ghost" data-close="1">Cancelar</button><button class="btn btn-primary" data-act="salvarconta">Salvar</button></div>`);
}
function sheetMeta(){
  sheet(`<h3>Nova meta</h3><div class="field"><label for="mNome">Nome</label><input id="mNome" placeholder="Ex.: Viagem de férias"></div>
  <div class="row"><div class="field"><label for="mAlvo">Valor da meta</label><input id="mAlvo" inputmode="decimal" placeholder="0,00"></div><div class="field"><label for="mPrazo">Até quando</label><input id="mPrazo" type="month"></div></div>
  <div class="field"><label for="mJa">Já tem guardado</label><input id="mJa" inputmode="decimal" placeholder="0,00"></div>
  <div class="sheet-actions"><button class="btn btn-ghost" data-close="1">Cancelar</button><button class="btn btn-gold" data-act="salvarmeta">Criar meta</button></div>`);
}
function sheetValor(title,act,id){sheet(`<h3>${title}</h3><div class="field"><label for="vVal">Valor</label><input id="vVal" inputmode="decimal" placeholder="0,00"></div><div class="sheet-actions"><button class="btn btn-ghost" data-close="1">Cancelar</button><button class="btn btn-gold" data-act="${act}" data-id="${id}">Confirmar</button></div>`)}
function sheetConfirm(){sheet(`<h3>Apagar tudo?</h3><p style="margin:0;color:var(--ink-2)">Todas as contas, lançamentos e metas serão apagados${sess?", aqui e na nuvem":""}. Isso não tem volta.</p><div class="sheet-actions"><button class="btn btn-ghost" data-close="1">Cancelar</button><button class="btn" style="background:var(--bad);color:#fff" data-act="limpar">Apagar tudo</button></div>`)}
function sheetOrc(){
  const by=catSpend(MK);
  sheet(`<h3>Limite por categoria</h3><p class="hint" style="margin:0">Deixe em branco para não ter limite. Você recebe aviso a partir de 85% e alerta vermelho ao passar.</p>
  <div class="orc-list">${GASTO_CATS.map(c=>`<div class="orc-row"><label for="o_${c}">${c}<small>gasto em ${keyLabel(MK)}: ${brl0(by[c]||0)}</small></label><input id="o_${c}" data-orc="${c}" inputmode="decimal" placeholder="sem limite" value="${S.orc[c]||""}"></div>`).join("")}</div>
  <div class="sheet-actions"><button class="btn btn-ghost" data-close="1">Cancelar</button><button class="btn btn-primary" data-act="salvarorc">Salvar limites</button></div>`);
}
function sheetDelParc(id){
  const t=S.lanc.find(x=>x.id===id);
  sheet(`<h3>Apagar parcela</h3><p style="margin:0;color:var(--ink-2)">${esc(t.desc)} faz parte de uma compra em ${t.parc.n}x.</p><div class="sheet-actions"><button class="btn btn-ghost" data-close="1">Cancelar</button><button class="btn btn-ghost" data-act="delparc1" data-id="${id}">Só esta</button><button class="btn" style="background:var(--bad);color:#fff" data-act="delparcall" data-id="${id}">Todas as parcelas</button></div>`);
}
function sheetResumo(k){
  const R=resumo(k), T=R.T; lsSet("-resumo",k);
  const d=R.prev.gasto?(T.gasto-R.prev.gasto)/R.prev.gasto:null;
  sheet(`<span class="v-label" style="color:var(--gold)">Resumo do mês</span><h3>${cap(keyLabel(k))} de ${k.slice(0,4)}</h3>
  <div class="sum-grid"><div><span class="hint">Entrou</span><b class="t-ok">${brl0(T.renda)}</b></div><div><span class="hint">Saiu</span><b>${brl0(T.gasto)}</b></div><div><span class="hint">Guardou</span><b style="color:var(--gold)">${brl0(T.guardado)}</b></div><div><span class="hint">Sobrou</span><b class="${T.renda-T.gasto-T.guardado<0?"t-bad":""}">${brl0(T.renda-T.gasto-T.guardado)}</b></div></div>
  ${R.top.length?`<div><span class="hint">Onde mais gastou</span>${R.top.map(([c,v],i)=>`<div class="sum-row"><span>${i+1}. ${esc(c)}</span><b>${brl0(v)}</b></div>`).join("")}</div>`:""}
  <div class="insight"><span class="ic ${R.bateu?"gold":"warn"}">${R.bateu?"$":"!"}</span><span>${R.bateu?`Você guardou ${S.config.metaGuardar}% ou mais da renda. Mandou bem.`:`A meta de guardar ${S.config.metaGuardar}% não foi batida. Neste mês, guarde assim que o dinheiro entrar.`}</span></div>
  ${d!=null?`<div class="insight"><span class="ic ${d>0?"warn":"tip"}">${d>0?"↑":"↓"}</span><span>Gastou ${Math.abs(Math.round(d*100))}% ${d>0?"a mais":"a menos"} que em ${keyLabel(keyAdd(k,-1))}.</span></div>`:""}
  ${T.nao?`<div class="insight"><span class="ic warn">!</span><span>${brl0(T.nao)} foram gastos não necessários (${T.rendaRef?Math.round(T.nao/T.rendaRef*100):0}% da renda).</span></div>`:""}
  <div class="sheet-actions"><button class="btn btn-primary" data-close="1">Fechar</button></div>`);
}
function sheetMais(){
  sheet(`<h3>Mais</h3><div class="mais">${[["lancamentos","Lançamentos","i-list","Editar, excluir, buscar, importar"],["carteiras","Carteiras e cartões","i-card","Saldos e faturas"],["casa","Casa","i-users","Despesas divididas com sua esposa"],["dividas","Dívidas","i-doc","Financiamentos e parcelas"],["metas","Metas e desafios","i-goal","Cofrinhos e desafios de economia"],["relatorio","Relatório","i-chart","Meses, etiquetas, IR e PDF"],["ajustes","Ajustes","i-gear","Nome, aparência, conta, PIN"]].map(([k,t,i,h])=>`<button class="mais-i" data-go="${k}">${icon(i)}<span><b>${t}</b><small>${h}</small></span></button>`).join("")}</div>`);
}
function sheetEditTx(id){
  const t=S.lanc.find(x=>x.id===id); if(!t) return;
  if(t.emp==="l") return sheetEditEmp(t.empId);
  form={tipo:t.tipo,nec:t.nec||"necessario",edit:id};
  const auto=t.emp==="a"||t.emp==="f";
  sheet(`<h3>Editar lançamento</h3>
  ${t.parc?`<p class="hint" style="margin:0">Parcela ${t.parc.i} de ${t.parc.n}. A mudança vale só para esta parcela.</p>`:""}${auto?`<p class="hint" style="margin:0">Este valor vem da aba Empréstimos empresa e é recalculado sozinho.</p>`:""}
  ${t.conta?`<p class="hint" style="margin:0">Lançado ao marcar uma conta como paga. Excluir desmarca a conta.</p>`:""}
  ${opts("tipo",[["gasto","Gasto"],["renda","Entrada"],["guardar","Guardar"]],t.tipo)}
  <div class="row"><div class="field"><label for="fVal">Valor</label><input id="fVal" inputmode="decimal" value="${String(t.valor).replace(".",",")}"></div>
  <div class="field"><label for="fData">Data</label><input id="fData" type="date" value="${t.data}"></div></div>
  <div class="field"><label for="fDesc">Descrição</label><input id="fDesc" value="${esc(t.desc)}"></div>
  <div class="field" id="wrapCat" ${t.tipo!=="gasto"?"hidden":""}><label for="fCat">Categoria</label><select id="fCat">${GASTO_CATS.map(c=>`<option ${c===t.cat?"selected":""}>${c}</option>`).join("")}</select></div>
  <div class="field" id="wrapMeta" hidden></div>
  <div class="field" id="wrapNec" ${t.tipo!=="gasto"?"hidden":""}><label>Esse gasto é…</label>${opts("nec",[["necessario","Necessário"],["nao","Não necessário"]],form.nec)}</div>
  ${pagOpts(t)}
  <div class="sheet-actions"><button class="btn btn-danger" style="margin-right:auto" data-act="deltx" data-id="${id}">${icon("i-trash")}Excluir</button><button class="btn btn-ghost" data-close="1">Cancelar</button><button class="btn btn-primary" data-act="salvaredit">Salvar</button></div>`);
}
function sheetEditEmp(id){
  const i=E().itens.find(x=>x.id===id); if(!i) return;
  sheet(`<h3>Editar empréstimo</h3>
  <div class="row"><div class="field"><label for="gVal">Valor</label><input id="gVal" inputmode="decimal" value="${String(i.valor).replace(".",",")}"></div><div class="field"><label for="gData">Data</label><input id="gData" type="date" value="${i.data}"></div></div>
  <div class="field"><label for="gDesc">Para quê</label><input id="gDesc" value="${esc(i.desc)}" placeholder="Ex.: almoço"></div>
  <div class="sheet-actions"><button class="btn btn-danger" style="margin-right:auto" data-act="delemp" data-id="${id}">${icon("i-trash")}Excluir</button><button class="btn btn-ghost" data-close="1">Cancelar</button><button class="btn btn-primary" data-act="salvaremp" data-id="${id}">Salvar</button></div>`);
}
function sheetEmpCfg(){
  const e=E(); form={nosaldo:e.noSaldo?"1":"0"};
  sheet(`<h3>Salário e datas</h3>
  <div class="row"><div class="field"><label for="cSal">Salário do mês</label><input id="cSal" inputmode="decimal" value="${e.salario}"></div><div class="field"><label for="cAdi">Valor livre do adiantamento</label><input id="cAdi" inputmode="decimal" value="${e.adiant}"></div></div>
  <div class="row"><div class="field"><label for="cDA">Dia do adiantamento</label><input id="cDA" inputmode="numeric" value="${e.diaAdiant}"></div><div class="field"><label for="cDF">Dia do desconto</label><input id="cDF" inputmode="numeric" value="${e.diaFech}"></div></div>
  <span class="hint">Em meses mais curtos, o dia do desconto vira o último dia do mês.</span>
  <div class="field"><label>Lançar o salário e os empréstimos no saldo do mês</label>${opts("nosaldo",[["1","Sim, automático"],["0","Não, só controlar aqui"]],form.nosaldo)}<span class="hint">Com "Sim", o Prumo lança sozinho os pagamentos dos dias ${e.diaAdiant} e ${e.diaFech} como entradas. Não cadastre o salário também em Lançamentos automáticos, senão ele conta duas vezes.</span></div>
  <div class="sheet-actions"><button class="btn btn-ghost" data-close="1">Cancelar</button><button class="btn btn-primary" data-act="salvarempcfg">Salvar</button></div>`);
}
function sheetLogin(msg){
  sheet(`<h3>Entre no Prumo</h3><p class="hint" style="margin:0">Com uma conta, seus dados ficam salvos na nuvem, aparecem em qualquer aparelho e os lembretes chegam com o app fechado.</p>
  <form id="loginForm" style="display:flex;flex-direction:column;gap:12px"><div class="field"><label for="lEmail">E-mail</label><input id="lEmail" type="email" autocomplete="email" required></div>
  <div class="field"><label for="lSenha">Senha</label><input id="lSenha" type="password" autocomplete="current-password" minlength="6" required><span class="hint">Mínimo de 6 caracteres.</span></div>
  <div class="login-msg ${msg&&msg.bad?"t-bad":""}" id="lMsg">${msg?esc(msg.t):""}</div>
  <div class="sheet-actions" style="justify-content:stretch"><button class="btn btn-primary" style="flex:1;justify-content:center" data-mode="entrar">Entrar</button><button class="btn btn-ghost" style="flex:1;justify-content:center" data-mode="criar">Criar conta</button></div></form>
  <button class="link" data-act="semconta" style="align-self:center">Usar só neste aparelho por enquanto</button>`);
}
const AUTH_ERR=m=>/invalid login/i.test(m)?"E-mail ou senha incorretos.":/already registered|already been registered/i.test(m)?"Já existe uma conta com esse e-mail. Toque em Entrar.":/not confirmed/i.test(m)?"Confirme seu e-mail pelo link que enviamos e tente de novo.":/password/i.test(m)?"A senha precisa ter pelo menos 6 caracteres.":/network|fetch/i.test(m)?"Sem conexão. Tente de novo quando tiver internet.":m;

/* ================= PIN ================= */
let locked=false, lockBuf="", pinMode=null, pinFirst="", hiddenAt=0;
const isLocked=()=>locked;
async function hashPin(p,salt){const b=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(salt+":"+p));return [...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,"0")).join("")}
function lockScreen(title,sub){
  $("#lock").innerHTML=`<div class="lock"><div class="lock-in"><svg viewBox="0 0 28 28" width="44" height="44" aria-hidden="true"><rect width="28" height="28" rx="8" fill="var(--accent)"/><path d="M14 6v10" stroke="#fff" stroke-width="2.2" stroke-linecap="round"/><path d="M9.5 16h9L14 22z" fill="var(--gold)"/></svg>
  <h2>${title}</h2><p class="lock-sub" id="lockSub">${sub}</p><div class="pin-dots">${[0,1,2,3].map(i=>`<i class="${lockBuf.length>i?"on":""}"></i>`).join("")}</div>
  <div class="keys">${[1,2,3,4,5,6,7,8,9].map(n=>`<button data-key="${n}">${n}</button>`).join("")}<button data-key="x" class="k-sm">${pinMode==="unlock"?"Esqueci":"Cancelar"}</button><button data-key="0">0</button><button data-key="b" class="k-sm" aria-label="Apagar">⌫</button></div></div></div>`;
}
function lockNow(){ if(!lsGet("-pin")) return; locked=true; pinMode="unlock"; lockBuf=""; lockScreen("Prumo bloqueado","Digite seu PIN") }
async function keyPress(k){
  if(k==="b"){lockBuf=lockBuf.slice(0,-1)}
  else if(k==="x"){
    if(pinMode==="unlock"){ $("#lockSub").innerHTML=`Para redefinir, ${sess?"você vai sair da conta e entrar de novo com sua senha.":"o PIN será removido e os dados deste aparelho apagados."} <button class="link" data-key="reset">Confirmar</button>`; return }
    $("#lock").innerHTML=""; pinMode=null; return;
  }
  else if(k==="reset"){ lsSet("-pin",null); locked=false; $("#lock").innerHTML=""; if(sess){await sb.auth.signOut(); sess=null; S=emptyState(); localSave(); sheetLogin({t:"Entre com seu e-mail e senha para continuar."})} else {S=emptyState(); localSave(); toast("PIN removido e dados deste aparelho apagados.")} render(); return }
  else if(lockBuf.length<4) lockBuf+=k;
  if(lockBuf.length<4){ document.querySelectorAll(".pin-dots i").forEach((el,i)=>el.classList.toggle("on",i<lockBuf.length)); return }
  const typed=lockBuf; lockBuf="";
  if(pinMode==="unlock"){
    const p=JSON.parse(lsGet("-pin")); if(await hashPin(typed,p.salt)===p.hash){locked=false;$("#lock").innerHTML="";afterUnlock()}
    else {lockScreen("Prumo bloqueado","PIN incorreto. Tente de novo."); document.querySelector(".pin-dots").classList.add("shake")}
  } else if(pinMode==="novo"){ pinFirst=typed; pinMode="confirma"; lockScreen("Confirme o PIN","Digite os mesmos 4 números") }
  else if(pinMode==="confirma"){
    if(typed!==pinFirst){pinMode="novo";lockScreen("Crie um PIN","Os PINs não bateram. Comece de novo.");return}
    const salt=uid(); lsSet("-pin",JSON.stringify({salt,hash:await hashPin(typed,salt)})); $("#lock").innerHTML=""; pinMode=null; toast("PIN criado. Ele será pedido ao abrir o app."); render();
  }
}
function afterUnlock(){ if(sb&&!sess&&!lsGet("-semconta")) sheetLogin(); else maybeResumo() }
document.addEventListener("visibilitychange",()=>{ if(document.visibilityState==="hidden") hiddenAt=Date.now(); else { if(hiddenAt&&Date.now()-hiddenAt>180000) lockNow(); checkNotify() } });

/* ================= ações ================= */
function snap(){undoSnap=JSON.stringify(S)}
function restoreSnap(){if(!undoSnap) return; S=fixState(JSON.parse(undoSnap)); undoSnap=null; persist(); render(); toast("Desfeito.")}
function leaveExample(){ if(S.exemplo){S=emptyState(); toast("Começamos com os seus dados. Os exemplos saíram.")} }
function addTx(t,parcelas){
  leaveExample();
  const n=Math.max(1,parcelas|0); const ids=[];
  if(n>1&&t.tipo==="gasto"){
    const g="g"+uid(), base=r2(t.valor/n);
    for(let i=0;i<n;i++){const v=i===n-1?r2(t.valor-base*(n-1)):base; const x={...t,id:uid(),valor:v,desc:`${t.desc} (${i+1}/${n})`,data:addMonths(t.data,i),parc:{g,i:i+1,n}}; S.lanc.push(x); ids.push(x.id)}
  } else { t.id=uid(); S.lanc.push(t); ids.push(t.id); if(t.tipo==="guardar"&&t.meta){const m=S.metas.find(x=>x.id===t.meta); if(m) m.guardado+=t.valor} }
  if(t.tipo==="gasto") S.ultimaCat=t.cat;
  persist(); render(); return ids;
}
function removeTx(id){
  const t=S.lanc.find(x=>x.id===id); if(!t) return;
  if(t.tipo==="guardar"&&t.meta){const m=S.metas.find(x=>x.id===t.meta); if(m) m.guardado=Math.max(0,m.guardado-t.valor)}
  if(t.divida){const dv=S.dividas.find(x=>x.id===t.divida); if(dv){dv.restantes++; if(dv.pagos) delete dv.pagos[t.data.slice(0,7)]}}
  if(t.s52){ if(S.desafios.s52.feitas) delete S.desafios.s52.feitas[t.s52] }
  if(t.conta){const c=S.contas.find(x=>x.id===t.conta); if(c){if(c.rec) delete c.pagos[t.data.slice(0,7)]; else c.pago=false}}
  S.lanc=S.lanc.filter(x=>x.id!==id);
}
function togglePay(id){
  const c=S.contas.find(x=>x.id===id); if(!c) return;
  if(S.exemplo){leaveExample(); render(); return}
  const paid=billPaid(c);
  if(c.rec){ c.pagos=c.pagos||{}; if(paid) delete c.pagos[VK]; else c.pagos[VK]=true } else c.pago=!paid;
  if(!paid){ S.lanc.push({id:uid(),tipo:"gasto",valor:c.valor,desc:c.nome,cat:c.cat||"Contas",nec:c.prio==="relativa"?"nao":"necessario",data:isCur()?iso(today):iso(billDue(c)),conta:c.id}) }
  else { const i=S.lanc.findIndex(t=>t.conta===c.id&&t.data.slice(0,7)===VK); if(i>-1) S.lanc.splice(i,1) }
  persist(); render(); if(!paid) feedback(`${esc(c.nome)} paga.`,c.cat);
}

/* ================= interpretar mensagem ================= */
const KW=[
  [/ifood|i food|rappi|delivery|pizza|lanche|hamburguer|acai|marmita/,"Delivery"],
  [/mercado|supermercado|feira|padaria|acougue|sacolao|hortifruti|atacad/,"Mercado"],
  [/uber|\b99\b|gasolina|combustivel|onibus|metro|estacionamento|pedagio|passagem|posto/,"Transporte"],
  [/farmacia|remedio|medico|consulta|dentista|exame|academia|drogaria/,"Saúde"],
  [/aluguel|condominio|iptu/,"Moradia"],
  [/\bluz\b|\bagua\b|energia|cemig|copasa|internet|celular|telefone|\bgas\b|fatura|boleto/,"Contas"],
  [/netflix|spotify|prime|disney|hbo|\bmax\b|youtube|assinatura|globoplay|icloud|google one/,"Assinaturas"],
  [/cinema|\bbar\b|cerveja|show|jogo|galo|festa|viagem|role|balada|restaurante|cafe/,"Lazer"],
  [/roupa|tenis|shopee|shein|amazon|mercado livre|loja|presente|eletronico|celular novo|\btv\b|magalu/,"Compras"],
  [/curso|escola|faculdade|livro|mensalidade/,"Educação"],
  [/salao|cabelo|barbearia|unha|estetica|perfume/,"Beleza"]
];
const guessCat=t=>{t=norm(t); for(const [re,c] of KW) if(re.test(t)) return c; return "Outros"};
function localParse(txt){
  const t=norm(txt);
  const px=t.match(/(?:em\s*)?(\d{1,2})\s*x\b|(\d{1,2})\s*parcelas/); const parcelas=px?+(px[1]||px[2]):1;
  const clean=px?t.replace(px[0]," "):t;
  const m=clean.match(/(?:r\$\s*)?(\d{1,3}(?:\.\d{3})+(?:,\d{1,2})?|\d+(?:[.,]\d{1,2})?)(\s*(mil|k)\b)?/);
  if(!m) return null;
  let v=num(m[1]); if(m[3]) v*=1000; if(!(v>0)) return null;
  const dia=t.match(/(?:vence|vencimento|dia)\s*(?:dia\s*)?(\d{1,2})/);
  if(/vence|vencimento|boleto|pagar\b|conta de/.test(t)&&dia){
    const nome=txt.replace(/r\$\s*/i,"").replace(m[1],"").replace(/vence(?:\s*dia)?\s*\d{1,2}|vencimento\s*(dia)?\s*\d{1,2}|dia\s*\d{1,2}/ig,"").replace(/\s+/g," ").trim().replace(/^./,c=>c.toUpperCase())||"Conta";
    let prio="importante"; if(/aluguel|luz|agua|cartao|fatura|energia|condom/.test(t)) prio="super"; if(/streaming|netflix|spotify|academia|assinatura/.test(t)) prio="relativa";
    return {kind:"conta",nome,valor:v,dia:Math.min(31,Math.max(1,+dia[1])),prio,cat:guessCat(t)==="Outros"?"Contas":guessCat(t)};
  }
  if(/empresa|emprestimo|\bvale\b|adiantamento/.test(t)&&/peguei|pegar|emprest|\bvale\b|adiant/.test(t)){
    const desc=txt.replace(/r\$\s*/i,"").replace(m[1],"").replace(/\b(peguei|pegar|emprestado|emprestimo|empréstimo|vale|da|na|de|do|empresa|com|reais|para|pra)(?![\wÀ-ú])/ig," ").replace(/\s+/g," ").trim();
    return {kind:"emp",valor:v,desc:desc?desc[0].toUpperCase()+desc.slice(1):"",data:iso(/ontem/.test(t)?new Date(today.getFullYear(),today.getMonth(),today.getDate()-1):today)};
  }
  let tipo="gasto";
  if(/recebi|ganhei|entrou|salario|pagaram|pix de|caiu|vendi|cliente pagou/.test(t)) tipo="renda";
  if(/guardei|poupei|investi|reservei|cofrinho|separei/.test(t)) tipo="guardar";
  let cat=tipo==="renda"?"Trabalho":tipo==="guardar"?"Metas":guessCat(t);
  let desc=txt.replace(/r\$\s*/i,"").replace(m[1],"").replace(px?new RegExp(px[0].trim().replace(/\s+/g,"\\s*"),"i"):/^$/,"").replace(/\b(gastei|paguei|comprei|recebi|ganhei|guardei|poupei|investi|reservei|separei|com|no|na|de|do|da|em|reais|mil|k|ontem|hoje)\b/ig," ").replace(/\s+/g," ").trim();
  desc=desc?desc[0].toUpperCase()+desc.slice(1):(tipo==="renda"?"Entrada":cat);
  let cartaoId=null, carteiraId; const kk=S.cartoes.find(k=>t.includes(norm(k.nome))); if(kk&&tipo==="gasto"&&/cart|credito|\bno\b|\bna\b/.test(t)) cartaoId=kk.id; else if(tipo==="gasto"&&/cartao|credito/.test(t)&&S.cartoes.length===1) cartaoId=S.cartoes[0].id;
  const cw=S.carteiras.find(c=>t.includes(norm(c.nome))); if(cw&&!cartaoId) carteiraId=cw.id;
  if(cartaoId||cw){ const nm=(cartaoId?cartao(cartaoId).nome:cw.nome); desc=desc.replace(new RegExp("\\b(no |na )?(cart[aã]o( de cr[eé]dito)?\\s*)?"+nm.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")+"\\b","i"),"").replace(/\b(no|na|cart[aã]o|cr[eé]dito)\s*$/i,"").trim()||desc }
  let meta=null; if(tipo==="guardar"&&S.metas.length) meta=(S.metas.find(x=>t.includes(norm(x.nome).split(" ").pop()))||S.metas[0]).id;
  const d=new Date(today); if(/ontem/.test(t)) d.setDate(d.getDate()-1);
  return {kind:"lanc",tipo,valor:v,desc,cat,nec:CATS[cat]||"necessario",data:iso(d),meta,parcelas,cartao:cartaoId,carteira:carteiraId,certeza:cat!=="Outros"||tipo!=="gasto"};
}
function handleChat(txt){
  if(!txt.trim()) return;
  chat.push({me:true,t:txt});
  const p=localParse(txt);
  if(!p){chat.push({t:'Não achei um valor. Tente algo como "gastei 45 no mercado".',err:true}); render(); focusChat(); return}
  if(p.kind==="emp"){
    addEmp(p.valor,p.desc,p.data); const R=empResumo(cicloDe(p.data));
    chat.push({t:`Empréstimo de <b>${brl(p.valor)}</b> anotado${p.desc?" ("+esc(p.desc)+")":""}. No mês já são ${brl(R.pego+R.carry)}; ${R.deve?`<span class="t-bad">passou ${brl(R.deve)} do valor do dia ${fechDay(cicloDe(p.data))}.</span>`:`no dia ${fechDay(cicloDe(p.data))} você recebe ${brl(R.receber)}.`}`});
    render(); focusChat(); return;
  }
  if(p.kind==="conta"){
    leaveExample(); S.contas.push({id:uid(),nome:p.nome,valor:p.valor,dia:p.dia,prio:p.prio,rec:true,cat:p.cat,pagos:{}}); persist();
    chat.push({t:`Conta <b>${esc(p.nome)}</b> de ${brl(p.valor)} salva, todo dia ${p.dia} (${PRIO[p.prio].label}). Aviso ${S.config.diasAviso} dias antes.`});
  } else {
    const nt={tipo:p.tipo,valor:p.valor,desc:p.desc,cat:p.cat,nec:p.nec,data:p.data,meta:p.meta||undefined}; if(p.cartao){nt.cartao=p.cartao;nt.carteira=null} else if(p.carteira) nt.carteira=p.carteira;
    addTx(nt,p.parcelas);
    const T=totals(MK); let r;
    if(p.tipo==="renda") r=`Entrada de <b>${brl(p.valor)}</b> anotada. Sugestão: guarde ${brl(p.valor*S.config.metaGuardar/100)} agora (${S.config.metaGuardar}%).`;
    else if(p.tipo==="guardar") r=`Boa! <b>${brl(p.valor)}</b> guardados${p.meta?" em "+esc(S.metas.find(m=>m.id===p.meta)?.nome||""):""}.`;
    else {
      r=p.parcelas>1?`Anotado: <b>${esc(p.desc)}</b> em ${p.parcelas}x de ${brl(r2(p.valor/p.parcelas))}, até ${keyLabel(keyAdd(MK,p.parcelas-1))}.`:`Anotado: <b>${esc(p.desc)}</b>, ${brl(p.valor)} em ${esc(p.cat)} (${p.nec==="nao"?"não necessário":"necessário"}).`;
      const b=S.orc[p.cat]?budgetState(MK).find(x=>x.c===p.cat):null;
      if(T.limite&&T.uso>=1) r+=` <span class="t-bad"><b>Alerta vermelho:</b> você passou do limite do mês.</span>`;
      else if(b&&b.p>=1) r+=` <span class="t-bad"><b>${esc(p.cat)} passou do orçamento.</b></span>`;
      else if(T.limite) r+=` Restam ${brl(T.limite-T.gasto-T.aPagar)} no limite.`;
      if(p.cartao){const k=cartao(p.cartao); r+=` Caiu na fatura ${esc(k.nome)} de ${keyLabel(fatKey(k,p.data))}.`}
      if(!p.certeza) r+=` <span class="hint">Não reconheci a categoria, ficou em Outros.</span>`;
    }
    chat.push({t:r});
  }
  render(); focusChat();
}
function focusChat(){const i=$("#chatIn"); if(i) i.focus()}

/* ================= importar extrato ================= */
let impRows=[], impInv=false;
function readFile(file){return new Promise(res=>{const r=new FileReader(); r.onload=()=>{let t=r.result; if(t.includes("\uFFFD")){const r2_=new FileReader(); r2_.onload=()=>res(r2_.result); r2_.readAsText(file,"ISO-8859-1")} else res(t)}; r.readAsText(file,"UTF-8")})}
function parseDate(s){
  s=String(s).trim(); let m;
  if(m=s.match(/^(\d{4})(\d{2})(\d{2})/)) return `${m[1]}-${m[2]}-${m[3]}`;
  if(m=s.match(/^(\d{4})-(\d{2})-(\d{2})/)) return `${m[1]}-${m[2]}-${m[3]}`;
  if(m=s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})/)) return `${m[3].length===2?"20"+m[3]:m[3]}-${m[2].padStart(2,"0")}-${m[1].padStart(2,"0")}`;
  return null;
}
function parseOFX(t){
  return t.split(/<STMTTRN>/i).slice(1).map(b=>{const g=tag=>{const m=b.match(new RegExp("<"+tag+">([^<\\r\\n]*)","i"));return m?m[1].trim():""};
    return {data:parseDate(g("DTPOSTED")),valor:num(g("TRNAMT").replace(",",".")),desc:(g("MEMO")||g("NAME")||"Lançamento").replace(/\s+/g," ")}}).filter(r=>r.data&&!isNaN(r.valor));
}
function splitCSV(line,d){const out=[];let cur="",q=false;for(let i=0;i<line.length;i++){const ch=line[i];if(ch==='"'){if(q&&line[i+1]==='"'){cur+='"';i++}else q=!q}else if(ch===d&&!q){out.push(cur);cur=""}else cur+=ch}out.push(cur);return out.map(s=>s.trim())}
function parseCSV(t){
  const lines=t.replace(/^\uFEFF/,"").split(/\r?\n/).filter(l=>l.trim());
  if(lines.length<2) return {rows:[]};
  const d=(lines[0].match(/;/g)||[]).length>=(lines[0].match(/,/g)||[]).length?";":",";
  let hi=lines.findIndex(l=>/data|date/i.test(l)&&/valor|amount|value|quantia/i.test(norm(l)));
  if(hi<0) hi=0;
  const h=splitCSV(lines[hi],d).map(norm);
  const ci=re=>h.findIndex(x=>re.test(x));
  const iD=ci(/^data|date/), iV=ci(/valor|amount|value|quantia/), iT=ci(/descri|title|histor|memo|estabelec|lancamento|detalhe|nome/);
  if(iD<0||iV<0) return {rows:[],erro:"Não encontrei as colunas de data e valor nesse arquivo."};
  const cartao=h.includes("title")&&h.includes("amount");
  const rows=lines.slice(hi+1).map(l=>{const c=splitCSV(l,d); return {data:parseDate(c[iD]||""),valor:num(c[iV]),desc:(iT>=0?c[iT]:"")||"Lançamento"}}).filter(r=>r.data&&!isNaN(r.valor)&&r.valor!==0);
  return {rows,cartao};
}
async function importFile(file){
  const txt=await readFile(file); let rows=[],cartao=false,erro=null;
  if(/<OFX>|<STMTTRN>/i.test(txt)) rows=parseOFX(txt); else ({rows,cartao,erro}=parseCSV(txt));
  if(!rows.length){toast(erro||"Não encontrei lançamentos nesse arquivo. Use o OFX ou CSV exportado pelo app do banco.",true);return}
  const exist=new Set(S.lanc.map(t=>t.data+"|"+Math.abs(t.valor).toFixed(2)+"|"+norm(t.desc)));
  impInv=cartao;
  impRows=rows.map(r=>({...r,cat:guessCat(r.desc),dup:exist.has(r.data+"|"+Math.abs(r.valor).toFixed(2)+"|"+norm(r.desc)),on:true}));
  impRows.forEach(r=>r.on=!r.dup);
  sheetImport();
}
function sheetImport(){
  const sign=v=>impInv?-v:v;
  const sel=impRows.filter(r=>r.on); const g=sel.filter(r=>sign(r.valor)<0).reduce((a,r)=>a+Math.abs(r.valor),0), e=sel.filter(r=>sign(r.valor)>0).reduce((a,r)=>a+r.valor,0);
  sheet(`<h3>Importar extrato</h3><p class="hint" style="margin:0">${impRows.length} lançamentos encontrados. Confira e desmarque o que não quiser. ${impRows.some(r=>r.dup)?"Os que já existem no Prumo vieram desmarcados.":""}</p>
  <label class="tg"><input type="checkbox" data-impinv ${impInv?"checked":""}> É fatura de cartão (compras vêm com valor positivo)</label>
  <div class="imp-list">${impRows.map((r,i)=>{const v=sign(r.valor);return `<label class="imp-row ${r.dup?"dup":""}"><input type="checkbox" data-imp="${i}" ${r.on?"checked":""}><span class="imp-d"><b>${esc(r.desc)}</b><small>${fmtDate(r.data)} · ${v<0?esc(r.cat):"Entrada"}${r.dup?" · já existe":""}</small></span><span class="${v>0?"t-ok":""}">${v>0?"+":"-"} ${brl(Math.abs(v))}</span></label>`}).join("")}</div>
  <p class="hint" style="margin:0">Selecionados: ${sel.length} · ${brl(g)} em gastos · ${brl(e)} em entradas</p>
  <div class="sheet-actions"><button class="btn btn-ghost" data-close="1">Cancelar</button><button class="btn btn-primary" data-act="importok">Importar ${sel.length}</button></div>`);
}

/* ================= arquivos ================= */
function baixar(nome,conteudo,tipo){const blob=new Blob([conteudo],{type:tipo}); const url=URL.createObjectURL(blob); const a=document.createElement("a"); a.href=url; a.download=nome; document.body.appendChild(a); a.click(); a.remove(); setTimeout(()=>URL.revokeObjectURL(url),2000)}
function exportCSV(){
  const rows=[["Data","Tipo","Descrição","Categoria","Necessidade","Valor"]].concat([...S.lanc].sort((a,b)=>a.data.localeCompare(b.data)).map(t=>[t.data,t.tipo,t.desc,t.cat,t.tipo==="gasto"?(t.nec==="nao"?"Não necessário":"Necessário"):"",String(t.valor).replace(".",",")]));
  baixar(`prumo-${VK}.csv`,"\ufeff"+rows.map(r=>r.map(c=>`"${String(c).replace(/"/g,'""')}"`).join(";")).join("\n"),"text/csv;charset=utf-8"); toast("Planilha baixada.");
}
function backup(){baixar(`prumo-backup-${iso(today)}.json`,JSON.stringify(S),"application/json"); lsSet("-backup",iso(today)); toast("Backup baixado."); render()}
function restaurar(file){const r=new FileReader(); r.onload=()=>{try{const d=JSON.parse(r.result); if(!d||!Array.isArray(d.lanc)||!Array.isArray(d.contas)) throw 0; S=fixState(d); persist(); render(); toast("Backup restaurado.")}catch(e){toast("Esse arquivo não é um backup do Prumo.",true)}}; r.readAsText(file)}

/* ================= notificações ================= */
function notifPerm(){return "Notification" in window?Notification.permission:"indisponivel"}
const b64u=s=>{const p="=".repeat((4-s.length%4)%4);const b=atob((s+p).replace(/-/g,"+").replace(/_/g,"/"));return Uint8Array.from([...b].map(c=>c.charCodeAt(0)))};
async function ativarNotif(){
  if(!("Notification" in window)||!("serviceWorker" in navigator)){toast("Este navegador não mostra notificações. No iPhone, instale o app na tela de início primeiro.",true);return}
  const p=await Notification.requestPermission();
  if(p!=="granted"){toast("Notificações bloqueadas. Libere nas configurações do celular.",true);render();return}
  if(sb&&sess&&cfg&&cfg.vapidPublicKey){
    try{
      const reg=await navigator.serviceWorker.ready;
      let sub=await reg.pushManager.getSubscription();
      if(!sub) sub=await reg.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:b64u(cfg.vapidPublicKey)});
      const j=sub.toJSON();
      const {error}=await sb.from("push_subs").upsert({endpoint:j.endpoint,user_id:sess.user.id,sub:j});
      if(error) throw error;
      lsSet("-push","1"); toast("Pronto. Os lembretes chegam todo dia às 8h, mesmo com o app fechado.");
    }catch(e){toast("Não consegui ativar os lembretes com o app fechado. Os avisos ao abrir continuam funcionando.",true)}
  } else toast("Notificações ativadas. Entre na sua conta para recebê-las também com o app fechado.");
  lsSet("-notif",null); checkNotify(true); render();
}
async function pushTeste(){
  if(!sess) return;
  try{const r=await fetch("/api/push-teste",{method:"POST",headers:{Authorization:"Bearer "+sess.access_token}}); const j=await r.json().catch(()=>({})); if(!r.ok) throw new Error(j.erro||"falhou"); toast(j.enviadas?"Notificação de teste enviada.":"Nenhum aparelho com notificação ativada.",!j.enviadas)}
  catch(e){toast("O teste falhou: "+esc(e.message),true)}
}
async function checkNotify(force){
  if(notifPerm()!=="granted"||(lsGet("-push")==="1"&&!force)) return;
  if(!force&&lsGet("-notif")===iso(today)) return;
  const a=alerts(); if(!a.length) return;
  const corpo=a.slice(0,4).map(x=>x.txt).join("\n"); const titulo=a.some(x=>x.lv==="bad")?"Prumo: atenção às suas contas":"Prumo: lembrete de contas";
  try{const reg=await navigator.serviceWorker?.getRegistration(); if(reg) await reg.showNotification(titulo,{body:corpo,icon:"/icon-192.png",badge:"/icon-192.png",tag:"prumo-dia"}); else new Notification(titulo,{body:corpo})}catch(e){}
  lsSet("-notif",iso(today));
}
function maybeResumo(){
  const pk=keyAdd(MK,-1);
  if(today.getDate()<=7&&lsGet("-resumo")!==pk&&monthTx(pk).length&&!S.exemplo&&!$("#layer").innerHTML) sheetResumo(pk);
}

/* ================= eventos ================= */
document.addEventListener("click",async e=>{
  const key=e.target.closest("[data-key]"); if(key){keyPress(key.dataset.key);return}
  const el=e.target.closest("[data-go],[data-act],[data-pay],[data-deltx],[data-filter],[data-chip],[data-quick],[data-undo],[data-opt],[data-editbill],[data-delbill],[data-deposit],[data-withdraw],[data-delgoal],[data-close],[data-mes],[data-cview],[data-calday],[data-delrec],[data-mode],[data-edittx],[data-editemp],[data-empv],[data-tema],[data-payfat],[data-vercartao],[data-editcart],[data-editcartao],[data-tag],[data-desafio],[data-s52],[data-pagadiv],[data-editdiv],[data-casadel]");
  if(!el){ if(notifOpen&&!e.target.closest(".notif-panel")){notifOpen=false;document.querySelector(".notif-panel")?.remove()} return }
  if(el.dataset.close&&e.target!==el) return;
  const d=el.dataset;
  if(d.go) return go(d.go);
  if(d.mes!=null){VK=d.mes==="0"?MK:keyAdd(VK,+d.mes); calDay=null; render(); return}
  if(d.cview){contasView=d.cview; lsSet("-contasview",contasView); render(); return}
  if(d.calday){calDay=calDay===+d.calday?null:+d.calday; render(); return}
  if(d.chip){const i=$("#chatIn"); i.value=d.chip; i.focus(); return}
  if(d.quick){const t=S.lanc.find(x=>x.id===d.quick); if(!t) return; const ids=addTx({tipo:"gasto",valor:t.valor,desc:t.desc,cat:t.cat,nec:t.nec,data:iso(today)}); feedback(`${esc(t.desc)} lançado.`,t.cat); const tt=document.querySelector(".toast"); if(tt) {const b=document.createElement("button");b.className="toast-undo";b.dataset.undo=ids[0];b.textContent="Desfazer";tt.appendChild(b)} return}
  if(d.undo){if(d.undo==="snap") restoreSnap(); else {removeTx(d.undo); persist(); render()} document.querySelector(".toast")?.remove(); return}
  if(d.edittx){ if(selMode){sel.has(d.edittx)?sel.delete(d.edittx):sel.add(d.edittx); render(); return} return sheetEditTx(d.edittx)}
  if(d.editemp) return sheetEditEmp(d.editemp);
  if(d.payfat){const [id,key]=d.payfat.split("|"); return sheetFatura(id,key)}
  if(d.vercartao){return sheetFatura(d.vercartao,fatAberta(cartao(d.vercartao)))}
  if(d.editcart) return sheetCarteira(carteira(d.editcart));
  if(d.editcartao) return sheetCartao(cartao(d.editcartao));
  if(d.tag){buscaQ=d.tag; if(route!=="lancamentos") go("lancamentos"); else render(); return}
  if(d.desafio){const D=S.desafios[d.desafio]; if(S.exemplo) S=emptyState(); const X=S.desafios[d.desafio]; X.ativo=!X.ativo; if(d.desafio==="s52"&&X.ativo&&!X.inicio){const seg=new Date(today); seg.setDate(seg.getDate()-((seg.getDay()+6)%7)); X.inicio=iso(seg)} if((d.desafio==="s52"||d.desafio==="arred")&&!X.meta&&S.metas[0]) X.meta=S.metas[0].id; persist(); render(); toast(X.ativo?"Desafio começou. Boa!":"Desafio pausado."); return}
  if(d.s52){const n=+d.s52, X=S.desafios.s52; X.feitas=X.feitas||{}; if(X.feitas[n]){const t=S.lanc.find(x=>x.s52===n); if(t) removeTx(t.id); delete X.feitas[n]; persist(); render(); return}
    X.feitas[n]=1; const m=S.metas.find(x=>x.id===X.meta); const v=n*X.base; S.lanc.push({id:uid(),tipo:"guardar",valor:v,desc:`52 semanas · semana ${n}`,cat:"Metas",nec:"necessario",data:iso(today),meta:m?m.id:undefined,s52:n}); if(m) m.guardado+=v; persist(); render(); toast(`${brl(v)} guardados${m?" em "+esc(m.nome):""}.`); return}
  if(d.pagadiv){const dv=S.dividas.find(x=>x.id===d.pagadiv); if(!dv||!dv.restantes) return; dv.pagos=dv.pagos||{}; dv.pagos[MK]=1; dv.restantes--; S.lanc.push({id:uid(),tipo:"gasto",valor:dv.parcela,desc:`Parcela ${dv.nome}${dv.total?` (${dv.total-dv.restantes}/${dv.total})`:""}`,cat:"Contas",nec:"necessario",data:iso(today),divida:dv.id}); persist(); render(); feedback(`Parcela de ${esc(dv.nome)} paga. ${dv.restantes?`Faltam ${dv.restantes}.`:"Dívida quitada!"}`,"Contas"); return}
  if(d.editdiv) return sheetDivida(S.dividas.find(x=>x.id===d.editdiv));
  if(d.casadel){sheet(`<h3>Excluir despesa da casa?</h3><p style="margin:0;color:var(--ink-2)">Ela some para os dois.</p><div class="sheet-actions"><button class="btn btn-ghost" data-close="1">Cancelar</button><button class="btn btn-danger" data-act="casadelok" data-id="${d.casadel}">Excluir</button></div>`); return}
  if(d.tema){tema=d.tema; lsSet("-tema",tema==="auto"?null:tema); aplicarTema(); render(); return}
  if(d.empv){const i=$("#eVal"); i.value=d.empv; i.focus(); return}
  if(d.pay) return togglePay(d.pay);
  if(d.filter){lancFilter=d.filter; render(); return}
  if(d.opt){form[d.opt]=d.v; document.querySelectorAll(`[data-opt="${d.opt}"]`).forEach(b=>b.setAttribute("aria-pressed",b.dataset.v===d.v));
    if(d.opt==="tipo"&&$("#wrapNec")){const h=(id,v)=>{const el=$(id); if(el) el.hidden=v}; h("#wrapNec",d.v!=="gasto"); h("#wrapCat",d.v!=="gasto"); h("#wrapMeta",d.v!=="guardar"); if(!form.rec) h("#wrapParc",d.v!=="gasto")} return}
  if(d.editbill) return sheetConta(S.contas.find(x=>x.id===d.editbill));
  if(d.delbill){snap(); S.contas=S.contas.filter(x=>x.id!==d.delbill); persist(); closeSheet(); render(); toast("Conta excluída.",false,"snap"); return}
  if(d.delrec){snap(); S.rec=S.rec.filter(x=>x.id!==d.delrec); persist(); render(); toast("Lançamento automático removido.",false,"snap"); return}
  if(d.deposit) return sheetValor("Guardar na meta","dep",d.deposit);
  if(d.withdraw) return sheetValor("Retirar da meta","wd",d.withdraw);
  if(d.delgoal){snap(); S.metas=S.metas.filter(x=>x.id!==d.delgoal); persist(); render(); toast("Meta excluída.",false,"snap"); return}
  if(d.mode){ e.preventDefault(); return doLogin(d.mode) }
  if(d.close){closeSheet(); return}
  switch(d.act){
    case "novo": return sheetLanc();
    case "mais": return sheetMais();
    case "foto": closeSheet(); return escolherFoto();
    case "pdf": return gerarPDF(VK);
    case "ir": {const I=irDados(+d.ano); sheet(`<h3>Dedutíveis de ${d.ano}</h3><div class="tx-list" style="max-height:50vh;overflow:auto">${I.l.sort((a,b)=>a.data.localeCompare(b.data)).map(txRow).join("")||`<div class="empty">Nenhum gasto de Saúde ou Educação em ${d.ano}.</div>`}</div><p class="hint" style="margin:0">Saúde ${brl(I.ts)} · Educação ${brl(I.te)}</p><div class="sheet-actions"><button class="btn btn-ghost" data-close="1">Fechar</button><button class="btn btn-primary" data-act="ircsv" data-ano="${d.ano}">Baixar planilha</button></div>`); return}
    case "ircsv": {const I=irDados(+d.ano); baixar(`prumo-ir-${d.ano}.csv`,"\ufeff"+[["Data","Categoria","Descrição","Valor"]].concat(I.l.map(t=>[t.data,t.cat,t.desc,String(t.valor).replace(".",",")])).map(r=>r.map(c=>`"${String(c).replace(/"/g,'""')}"`).join(";")).join("\n"),"text/csv;charset=utf-8"); toast("Planilha do IR baixada."); return}
    case "guardartroco": {const v=trocoMes(); if(!(v>0)) return; const m=S.metas.find(x=>x.id===S.desafios.arred.meta); S.lanc.push({id:uid(),tipo:"guardar",valor:v,desc:"Troco arredondado",cat:"Metas",nec:"necessario",data:iso(today),meta:m?m.id:undefined,troco:MK}); if(m) m.guardado+=v; persist(); render(); toast(`${brl(v)} de troco guardados.`); return}
    case "novacart": return sheetCarteira();
    case "novocartao": return sheetCartao();
    case "transf": return sheetTransf();
    case "salvarcart": {
      const nome=$("#wNome").value.trim(), sv=num($("#wSaldo").value)||0; if(!nome){toast("Dê um nome para a carteira.",true);return}
      if(S.exemplo) S=emptyState();
      if(!S.carteiras.length) S.lanc.forEach(t=>{if(t.carteira===undefined) t.carteira=null});
      let c=form.edit?carteira(form.edit):null;
      if(c){ const atual=saldoCarteira(c); c.inicial=r2((c.inicial||0)+(sv-atual)); Object.assign(c,{nome,tipo:form.tipo,cor:form.cor}) }
      else { c={id:uid(),nome,tipo:form.tipo,cor:form.cor,inicial:sv}; S.carteiras.push(c) }
      if($("#wPad").checked||!S.carteiraPadrao) S.carteiraPadrao=c.id;
      persist(); closeSheet(); render(); toast("Carteira salva."); return}
    case "delcart": {snap(); S.carteiras=S.carteiras.filter(c=>c.id!==d.id); S.lanc.forEach(t=>{if(t.carteira===d.id) t.carteira=null}); if(S.carteiraPadrao===d.id) S.carteiraPadrao=S.carteiras[0]?.id||null; persist(); closeSheet(); render(); toast("Carteira excluída.",false,"snap"); return}
    case "salvarcartao": {
      const nome=$("#kNome").value.trim(), fe=parseInt($("#kFecha").value,10), ve=parseInt($("#kVence").value,10), li=num($("#kLim").value)||0;
      if(!nome||!(fe>=1&&fe<=31)||!(ve>=1&&ve<=31)){toast("Preencha o nome e os dias de fechamento e vencimento (1 a 31).",true);return}
      if(S.exemplo) S=emptyState();
      const k=form.edit?cartao(form.edit):null; if(k) Object.assign(k,{nome,fecha:fe,vence:ve,limite:li,cor:form.cor}); else S.cartoes.push({id:uid(),nome,fecha:fe,vence:ve,limite:li,cor:form.cor});
      persist(); closeSheet(); render(); toast("Cartão salvo."); return}
    case "delcartao": {snap(); S.cartoes=S.cartoes.filter(k=>k.id!==d.id); S.lanc.forEach(t=>{if(t.cartao===d.id) t.cartao=null}); persist(); closeSheet(); render(); toast("Cartão excluído. As compras continuam nos lançamentos.",false,"snap"); return}
    case "pagarfat": {const [id,key]=d.id.split("|"); const k=cartao(id), kk=id+"|"+key; if(S.fat[kk]) delete S.fat[kk]; else S.fat[kk]={valor:fatTotal(k,key),data:iso(today),carteira:$("#pCart")?$("#pCart").value:null}; persist(); closeSheet(); render(); toast(S.fat[kk]?`Fatura ${esc(k.nome)} paga.`:"Pagamento desmarcado."); return}
    case "salvartransf": {const de=$("#tDe").value, para=$("#tPara").value, v=num($("#tVal").value); if(de===para||!(v>0)){toast("Escolha carteiras diferentes e um valor.",true);return} S.transf.push({id:uid(),de,para,valor:r2(v),data:iso(today)}); persist(); closeSheet(); render(); toast("Transferência feita."); return}
    case "novadivida": return sheetDivida();
    case "salvardiv": {
      const nome=$("#dNome").value.trim(), par=num($("#dPar").value), rest=parseInt($("#dRest").value,10), dia=parseInt($("#dDia").value,10), jur=num($("#dJur").value)||0;
      if(!nome||!(par>0)||!(rest>=0)||!(dia>=1&&dia<=31)){toast("Preencha nome, parcela, quantas faltam e o dia.",true);return}
      if(S.exemplo) S=emptyState();
      const dv=d.id?S.dividas.find(x=>x.id===d.id):null; if(dv) Object.assign(dv,{nome,parcela:par,restantes:rest,dia,juros:jur,total:Math.max(dv.total||0,rest)}); else S.dividas.push({id:uid(),nome,parcela:par,restantes:rest,total:rest,dia,juros:jur,pagos:{}});
      persist(); closeSheet(); render(); toast("Dívida salva."); return}
    case "deldiv": {snap(); S.dividas=S.dividas.filter(x=>x.id!==d.id); persist(); closeSheet(); render(); toast("Dívida excluída.",false,"snap"); return}
    case "salvarnome": {const n=$("#nNome").value.trim(); if(!n){toast("Escreva seu nome.",true);return} S.config.nome=n; persist(); closeSheet(); render(); if(casa.id) sb.from("casa_membros").update({nome:n}).eq("casa_id",casa.id).eq("user_id",sess.user.id).then(()=>carregarCasa()); toast(`Prazer, ${esc(n)}!`); return}
    case "editnome": return sheetNome();
    case "casarecarregar": casa.carregado=false; render(); return;
    case "casacriar": case "casaentrar": {
      const nomeEu=($(d.act==="casacriar"?"#cMeu":"#cMeu2").value||"").trim(); if(!nomeEu){toast("Escreva seu nome.",true);return}
      if(!S.config.nome){S.config.nome=nomeEu; persist()}
      const r=d.act==="casacriar"?await sb.rpc("criar_casa",{p_nome:($("#cNome").value||"").trim()||"Nossa casa",p_meu_nome:nomeEu}):await sb.rpc("entrar_casa",{p_codigo:($("#cCod").value||"").trim().toUpperCase(),p_meu_nome:nomeEu});
      if(r.error){toast(/nao encontrado|não encontrad/i.test(r.error.message)?"Código não encontrado. Confira as letras e números.":/function|schema/i.test(r.error.message)?"Falta rodar o supabase-casa.sql no Supabase.":"Não deu certo: "+esc(r.error.message),true);return}
      casa.carregado=false; await carregarCasa(); render(); toast(d.act==="casacriar"?"Casa criada. Agora mande o código para ela.":"Você entrou na casa."); return}
    case "casaacerto": {const sal=casaSaldos(), me=sess.user.id, eu=r2(sal[me]||0), outro=casa.membros.find(m=>m.user_id!==me); if(!outro||!eu) return;
      const pagador=eu<0?me:outro.user_id; const {error}=await sb.from("casa_gastos").insert({id:uid(),casa_id:casa.id,user_id:me,pago_por:pagador,valor:Math.abs(eu),descr:"Acerto de contas",data:iso(today),divisao:"outro"});
      if(error){toast("Não consegui registrar. Confira a internet.",true);return} await carregarCasa(); render(); toast("Acerto registrado. Vocês estão quites."); return}
    case "casadelok": {const {error}=await sb.from("casa_gastos").delete().eq("id",d.id); closeSheet(); if(error){toast("Não consegui excluir.",true);return} await carregarCasa(); render(); toast("Despesa excluída."); return}
    case "casacopiar": {try{await navigator.clipboard.writeText(casa.info.codigo); toast("Código copiado.")}catch(e){toast("Código: "+casa.info.codigo)} return}
    case "casasair": {sheet(`<h3>Sair da casa?</h3><p style="margin:0;color:var(--ink-2)">Você deixa de ver as despesas da casa. Para voltar, use o código de novo.</p><div class="sheet-actions"><button class="btn btn-ghost" data-close="1">Cancelar</button><button class="btn btn-danger" data-act="casasairok">Sair</button></div>`); return}
    case "casasairok": {await sb.from("casa_membros").delete().eq("casa_id",casa.id).eq("user_id",sess.user.id); try{casa.canal&&sb.removeChannel(casa.canal)}catch(e){} casa={id:null,info:null,membros:[],gastos:[],carregado:false,erro:null,canal:null}; closeSheet(); render(); toast("Você saiu da casa."); return}
    case "tema": {const seq=["auto","claro","escuro"]; tema=seq[(seq.indexOf(tema)+1)%3]; lsSet("-tema",tema==="auto"?null:tema); aplicarTema(); render(); toast(`Tema ${tema==="auto"?"automático (segue o celular)":tema}.`); return}
    case "empcfg": return sheetEmpCfg();
    case "selon": selMode=true; sel.clear(); render(); return;
    case "selsair": selMode=false; sel.clear(); render(); return;
    case "selall": {const l=lancList(); if(sel.size===l.length) sel.clear(); else l.forEach(t=>sel.add(t.id)); render(); return}
    case "seldel": {if(!sel.size) return; snap(); const n=sel.size; [...sel].forEach(id=>{const t=S.lanc.find(x=>x.id===id); if(t&&t.emp==="l"){E().itens=E().itens.filter(i=>i.id!==t.empId)} removeTx(id)}); syncEmp(); sel.clear(); selMode=false; persist(); render(); toast(`${n} lançamento${n>1?"s":""} excluído${n>1?"s":""}.`,false,"snap"); return}
    case "deltx": {const t=S.lanc.find(x=>x.id===d.id); if(!t) return; if(t.parc) return sheetDelParc(t.id); snap(); removeTx(d.id); persist(); closeSheet(); render(); toast("Lançamento excluído.",false,"snap"); return}
    case "salvaredit": {
      const t=S.lanc.find(x=>x.id===form.edit); if(!t) return; const v=num($("#fVal").value); if(!(v>0)){toast("Informe um valor maior que zero.",true);return}
      if(t.tipo==="guardar"&&t.meta){const m=S.metas.find(x=>x.id===t.meta); if(m) m.guardado=Math.max(0,m.guardado-t.valor)}
      t.tipo=form.tipo; t.valor=r2(v); t.data=$("#fData").value||t.data; t.desc=$("#fDesc").value.trim()||t.desc;
      if(t.tipo==="gasto"){t.cat=$("#fCat").value; t.nec=form.nec} else if(t.tipo==="renda"){t.cat="Trabalho"; t.nec="necessario"} else {t.cat="Metas"; t.nec="necessario"; t.meta=t.meta||(S.metas[0]&&S.metas[0].id)}
      if(t.tipo==="guardar"&&t.meta){const m=S.metas.find(x=>x.id===t.meta); if(m) m.guardado+=t.valor}
      lerPag(t); persist(); closeSheet(); render(); toast("Lançamento atualizado."); return}
    case "delemp": {snap(); E().itens=E().itens.filter(i=>i.id!==d.id); syncEmp(); persist(); closeSheet(); render(); toast("Empréstimo excluído.",false,"snap"); return}
    case "salvaremp": {const i=E().itens.find(x=>x.id===d.id); const v=num($("#gVal").value); if(!i||!(v>0)){toast("Informe um valor maior que zero.",true);return} i.valor=r2(v); i.data=$("#gData").value||i.data; i.desc=$("#gDesc").value.trim(); syncEmp(); persist(); closeSheet(); render(); toast("Empréstimo atualizado."); return}
    case "salvarempcfg": {
      const e=E(), sal=num($("#cSal").value), adi=num($("#cAdi").value), da=parseInt($("#cDA").value,10), df=parseInt($("#cDF").value,10);
      if(!(sal>0)||!(adi>=0)||adi>sal||!(da>=1&&da<=31)||!(df>=1&&df<=31)){toast("Confira os valores: o adiantamento não pode ser maior que o salário e os dias vão de 1 a 31.",true);return}
      if(S.exemplo) S=emptyState();
      Object.assign(E(),{salario:sal,adiant:adi,diaAdiant:da,diaFech:df,noSaldo:form.nosaldo==="1",ativo:true});
      S.lanc.filter(t=>t.emp==="a").forEach(t=>t.valor=adi); runEmpresa(); syncEmp(); persist(); closeSheet(); render(); toast("Configuração salva."); return}
    case "novorec": return sheetLanc(true);
    case "novaconta": return sheetConta();
    case "novameta": return sheetMeta();
    case "orc": return sheetOrc();
    case "resumo": return sheetResumo(isCur()?keyAdd(VK,-1):VK);
    case "importar": {const inp=document.createElement("input"); inp.type="file"; inp.accept=".ofx,.csv,.txt,text/csv,application/x-ofx"; inp.onchange=()=>inp.files[0]&&importFile(inp.files[0]); inp.click(); return}
    case "olho": oculto=!oculto; lsSet("-oculto",oculto?"1":null); render(); return;
    case "notif": notifOpen=!notifOpen; if(notifOpen) renderNotif(); else document.querySelector(".notif-panel")?.remove(); e.stopPropagation(); return;
    case "csv": return exportCSV();
    case "backup": return backup();
    case "notifon": return ativarNotif();
    case "pushteste": return pushTeste();
    case "login": return sheetLogin();
    case "semconta": lsSet("-semconta","1"); closeSheet(); maybeResumo(); return;
    case "sair": await sb.auth.signOut(); sess=null; lsSet("-push",null); render(); toast("Você saiu. Os dados continuam neste aparelho."); return;
    case "pincriar": case "pintrocar": pinMode="novo"; lockBuf=""; lockScreen("Crie um PIN","Escolha 4 números"); return;
    case "pinremover": lsSet("-pin",null); render(); toast("PIN removido."); return;
    case "limparconfirm": return sheetConfirm();
    case "limpar": S=emptyState(); chat=[]; persist(); if(sb&&sess) pushCloud(); closeSheet(); render(); toast("Pronto. Comece definindo sua renda em Ajustes."); return;
    case "delparc1": snap(); removeTx(d.id); persist(); closeSheet(); render(); toast("Parcela excluída.",false,"snap"); return;
    case "delparcall": {snap(); const g=S.lanc.find(x=>x.id===d.id)?.parc?.g; const n=S.lanc.filter(x=>x.parc&&x.parc.g===g).length; S.lanc=S.lanc.filter(x=>!(x.parc&&x.parc.g===g)); persist(); closeSheet(); render(); toast(`${n} parcelas excluídas.`,false,"snap"); return}
    case "importok": {
      const sel=impRows.filter(r=>r.on); if(!sel.length){toast("Nenhum lançamento selecionado.",true);return}
      leaveExample();
      sel.forEach(r=>{const v=impInv?-r.valor:r.valor; S.lanc.push(v<0?{id:uid(),tipo:"gasto",valor:r2(Math.abs(v)),desc:r.desc,cat:r.cat,nec:CATS[r.cat]||"nao",data:r.data,imp:1}:{id:uid(),tipo:"renda",valor:r2(v),desc:r.desc,cat:"Trabalho",nec:"necessario",data:r.data,imp:1})});
      persist(); closeSheet(); render(); toast(`${sel.length} lançamentos importados. Confira as categorias marcadas como Outros.`); return}
    case "salvarorc": {
      leaveExample(); const o={}; document.querySelectorAll("[data-orc]").forEach(i=>{const v=num(i.value); if(v>0) o[i.dataset.orc]=v}); S.orc=o; persist(); closeSheet(); render(); toast("Limites salvos."); return}
    case "salvarlanc":{
      const v=num($("#fVal").value); if(!(v>0)){toast("Informe um valor maior que zero.",true);return}
      const tipo=form.tipo; const cat=tipo==="renda"?"Trabalho":tipo==="guardar"?"Metas":$("#fCat").value;
      const desc=$("#fDesc").value.trim()||(tipo==="renda"?"Entrada":tipo==="guardar"?"Guardado":cat);
      const meta=tipo==="guardar"?($("#fMeta").value||undefined):undefined;
      const nec=tipo==="gasto"?form.nec:"necessario";
      if(form.rec){
        const dia=parseInt($("#fDia").value,10); if(!(dia>=1&&dia<=31)){toast("Escolha um dia entre 1 e 31.",true);return}
        leaveExample(); S.rec.push({id:uid(),tipo,valor:v,desc,cat,nec,dia,lanc:{}}); closeSheet(); runRecurring(); persist(); render(); toast(`Lançamento automático criado para todo dia ${dia}.`); return;
      }
      const data=$("#fData").value||iso(today); const parc=tipo==="gasto"?+$("#fParc").value:1; const rep=$("#fRep")?.checked;
      const nt={tipo,valor:v,desc,cat,nec,data,meta}; lerPag(nt); closeSheet(); addTx(nt,parc);
      if(rep){S.rec.push({id:uid(),tipo,valor:v,desc,cat,nec,dia:parseISO(data).getDate(),lanc:{[data.slice(0,7)]:true}}); persist()}
      feedback(parc>1?`Compra em ${parc}x salva.`:tipo==="gasto"?"Gasto salvo.":tipo==="renda"?"Entrada salva.":"Valor guardado.",tipo==="gasto"?cat:null); return}
    case "salvarconta":{
      const nome=$("#bNome").value.trim(), v=num($("#bVal").value), dia=parseInt($("#bDia").value,10), cat=$("#bCat").value, rec=form.rec==="1";
      if(!nome||!(v>0)||!(dia>=1&&dia<=31)){toast("Preencha nome, valor e um dia entre 1 e 31.",true);return}
      leaveExample();
      const umaVez=iso(new Date(today.getFullYear(),today.getMonth()+(dia<today.getDate()?1:0),dia));
      if(form.edit){const c=S.contas.find(x=>x.id===form.edit); if(c){Object.assign(c,{nome,valor:v,prio:form.prio,rec,cat}); if(rec){c.dia=dia;c.pagos=c.pagos||{}} else c.data=umaVez}}
      else S.contas.push(rec?{id:uid(),nome,valor:v,dia,prio:form.prio,rec:true,cat,pagos:{}}:{id:uid(),nome,valor:v,data:umaVez,prio:form.prio,rec:false,cat,pago:false});
      persist(); closeSheet(); render(); toast(`Conta salva. Aviso ${S.config.diasAviso} dias antes do vencimento.`); return}
    case "salvarmeta":{
      const nome=$("#mNome").value.trim(), alvo=num($("#mAlvo").value), ja=num($("#mJa").value)||0, pr=$("#mPrazo").value;
      if(!nome||!(alvo>0)){toast("Dê um nome e um valor para a meta.",true);return}
      leaveExample(); S.metas.push({id:uid(),nome,alvo,guardado:ja,prazo:pr?pr+"-01":null}); persist(); closeSheet(); render(); toast("Meta criada."); return}
    case "dep": case "wd":{
      const v=num($("#vVal").value); if(!(v>0)){toast("Informe um valor maior que zero.",true);return}
      if(S.exemplo){leaveExample(); closeSheet(); render(); return}
      const m=S.metas.find(x=>x.id===el.dataset.id); if(!m) return;
      if(d.act==="dep"){S.lanc.push({id:uid(),tipo:"guardar",valor:v,desc:"Guardado: "+m.nome,cat:"Metas",nec:"necessario",data:iso(today),meta:m.id}); m.guardado+=v} else m.guardado=Math.max(0,m.guardado-v);
      persist(); closeSheet(); render(); toast(d.act==="dep"?`${brl(v)} guardados em ${esc(m.nome)}.`:`${brl(v)} retirados de ${esc(m.nome)}.`); return}
  }
});
document.addEventListener("input",e=>{
  if(e.target.id==="busca"){buscaQ=e.target.value; const l=$("#txlist"); if(l) l.innerHTML=listaHtml(lancList()); return}
  if(e.target.dataset.sim){const dv=S.dividas.find(x=>x.id===e.target.dataset.sim); const x=num(e.target.value); const out=$("#simr_"+dv.id); const r=simAdiantar(dv,x); out.innerHTML=!r?"":r.quita?`Com isso você quita tudo e economiza cerca de <b class="t-ok">${brl(r.economia)}</b>.`:`Termina <b>${r.meses} ${r.meses===1?"mês":"meses"} antes</b> e economiza cerca de <b class="t-ok">${brl(Math.max(0,r.economia))}</b>.`}
});
document.addEventListener("change",e=>{
  if(e.target.dataset.dmeta){S.desafios[e.target.dataset.dmeta].meta=e.target.value; persist(); return}
  if(e.target.id==="fRest"&&e.target.files[0]) restaurar(e.target.files[0]);
  if(e.target.dataset.imp!=null){impRows[+e.target.dataset.imp].on=e.target.checked; const sc=$(".imp-list").scrollTop; sheetImport(); $(".imp-list").scrollTop=sc}
  if(e.target.dataset.impinv!=null){impInv=e.target.checked; sheetImport()}
});
async function doLogin(mode){
  const email=$("#lEmail").value.trim(), senha=$("#lSenha").value, msg=$("#lMsg");
  if(!email||senha.length<6){msg.className="login-msg t-bad";msg.textContent="Preencha o e-mail e uma senha com pelo menos 6 caracteres.";return}
  msg.className="login-msg"; msg.textContent=mode==="criar"?"Criando sua conta…":"Entrando…";
  try{
    const r=mode==="criar"?await sb.auth.signUp({email,password:senha}):await sb.auth.signInWithPassword({email,password:senha});
    if(r.error) throw r.error;
    if(!r.data.session){msg.textContent="Conta criada. Abra o e-mail de confirmação e depois toque em Entrar.";return}
    sess=r.data.session; lsSet("-semconta",null); closeSheet(); await pullCloud(); render(); if(!meuNome()) setTimeout(sheetNome,600);
    toast(mode==="criar"?"Conta criada. Seus dados agora ficam salvos na nuvem.":"Pronto, você entrou.");
    if(!S.exemplo) pushCloud();
  }catch(err){msg.className="login-msg t-bad"; msg.textContent=AUTH_ERR(err.message||String(err))}
}
document.addEventListener("submit",e=>{
  e.preventDefault();
  if(e.target.id==="loginForm") return doLogin("entrar");
  if(e.target.id==="casaForm"){(async()=>{const v=num($("#hVal").value); if(!(v>0)){toast("Informe o valor.",true);return} const desc=$("#hDesc").value.trim()||"Despesa da casa", quem=$("#hQuem").value, div=$("#hDiv").value, data=isCur()?iso(today):VK+"-01";
    const {error}=await sb.from("casa_gastos").insert({id:uid(),casa_id:casa.id,user_id:sess.user.id,pago_por:quem,valor:r2(v),descr:desc,data,divisao:div});
    if(error){toast("Não consegui salvar. Confira a internet.",true);return}
    if($("#hMeu").checked&&quem===sess.user.id) addTx({tipo:"gasto",valor:r2(v),desc:desc+" #casa",cat:guessCat(desc)==="Outros"?"Moradia":guessCat(desc),nec:"necessario",data});
    await carregarCasa(); render(); toast("Despesa da casa adicionada.")})(); return}
  if(e.target.id==="empForm"){const v=num($("#eVal").value); if(!(v>0)){toast("Informe o valor que você pegou.",true);return} const d=$("#eData").value||iso(today); addEmp(v,$("#eDesc").value.trim(),d); const k=cicloDe(d); if(k!==VK) VK=k; render(); const R=empResumo(k); toast(`${brl(v)} anotado. ${R.deve?"Passou "+brl(R.deve)+" do valor do dia "+fechDay(k)+".":"No dia "+fechDay(k)+" você recebe "+brl(R.receber)+"."}`,!!R.deve); return}
  if(e.target.id==="chatForm"){const i=$("#chatIn"); const v=i.value; i.value=""; handleChat(v)}
  if(e.target.id==="cfgForm"){
    leaveExample();
    S.config.renda=num($("#cRenda").value)||0; S.config.limite=num($("#cLim").value)||0;
    S.config.metaGuardar=Math.min(90,Math.max(0,parseInt($("#cMeta").value,10)||20));
    S.config.diasAviso=Math.min(15,Math.max(0,parseInt($("#cAviso").value,10)||3));
    persist(); render(); toast("Ajustes salvos.");
  }
});
document.addEventListener("keydown",e=>{
  if(locked||pinMode){ if(/^\d$/.test(e.key)) keyPress(e.key); else if(e.key==="Backspace") keyPress("b"); return }
  if(e.key==="Escape"){closeSheet(); if(notifOpen){notifOpen=false;document.querySelector(".notif-panel")?.remove()}}
});
if("serviceWorker" in navigator) window.addEventListener("load",()=>navigator.serviceWorker.register("/sw.js").catch(()=>{}));

/* ================= início ================= */
runRecurring();
if(location.hash==="#novo"){route="inicio"; try{history.replaceState(null,"","#inicio")}catch(e){}}
render();
if(lsGet("-pin")) lockNow();
initCloud().then(()=>{ if(!locked&&(!sb||sess||lsGet("-semconta"))) maybeResumo(); checkNotify() });
})();
