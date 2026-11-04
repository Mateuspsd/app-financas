// Lógica compartilhada pelas funções da Vercel: banco, push e cálculo dos lembretes.
import { createClient } from "@supabase/supabase-js";
import webpush from "web-push";

export function admin() {
  return createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
}

let vapidOk = false;
function vapid() {
  if (!vapidOk) {
    webpush.setVapidDetails(process.env.VAPID_SUBJECT || "mailto:prumo@exemplo.com", process.env.VAPID_PUBLIC_KEY, process.env.VAPID_PRIVATE_KEY);
    vapidOk = true;
  }
}

// envia para todos os aparelhos de um usuário; remove inscrições que expiraram
export async function enviar(db, userId, payload) {
  vapid();
  const { data: subs } = await db.from("push_subs").select("endpoint, sub").eq("user_id", userId);
  let enviadas = 0;
  for (const s of subs || []) {
    try { await webpush.sendNotification(s.sub, JSON.stringify(payload), { TTL: 60 * 60 * 12 }); enviadas++; }
    catch (e) { if (e.statusCode === 404 || e.statusCode === 410) await db.from("push_subs").delete().eq("endpoint", s.endpoint); }
  }
  return enviadas;
}

// "hoje" no fuso do Brasil
export function hojeBR() {
  const p = Object.fromEntries(new Intl.DateTimeFormat("en-CA", { timeZone: "America/Bahia", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(new Date()).map(x => [x.type, x.value]));
  return { y: +p.year, m: +p.month - 1, d: +p.day, key: `${p.year}-${p.month}` };
}

const MESES = ["janeiro","fevereiro","março","abril","maio","junho","julho","agosto","setembro","outubro","novembro","dezembro"];
const brl = v => "R$ " + Math.round(v).toLocaleString("pt-BR");
const daysIn = (y, m) => new Date(Date.UTC(y, m + 1, 0)).getUTCDate();

// mesma regra do app: contas vencendo/atrasadas, limite do mês e orçamento por categoria
export function lembretes(S, H) {
  if (!S || S.exemplo) return null;
  const cfg = Object.assign({ diasAviso: 3, limite: 0, renda: 0, metaGuardar: 20 }, S.config || {});
  const K = H.key, hoje = Date.UTC(H.y, H.m, H.d);
  const linhas = []; let grave = false;
  const contas = (S.contas || []).filter(c => c.rec || (c.data && (c.data.slice(0, 7) === K || (!c.pago && c.data.slice(0, 7) < K))));
  let aPagar = 0;
  for (const c of contas) {
    const pago = c.rec ? !!(c.pagos && c.pagos[K]) : !!c.pago;
    if (pago) continue;
    aPagar += c.valor;
    let venc;
    if (c.rec) venc = Date.UTC(H.y, H.m, Math.min(c.dia, daysIn(H.y, H.m)));
    else { const [y, m, d] = c.data.split("-").map(Number); venc = Date.UTC(y, m - 1, d); }
    const diff = Math.round((venc - hoje) / 864e5);
    if (diff < 0) { linhas.push(`${c.nome} está atrasada (${brl(c.valor)})`); grave = true; }
    else if (diff === 0) linhas.push(`${c.nome} vence hoje (${brl(c.valor)})`);
    else if (diff <= cfg.diasAviso) linhas.push(`${c.nome} vence em ${diff} dia${diff > 1 ? "s" : ""} (${brl(c.valor)})`);
  }
  const doMes = (S.lanc || []).filter(t => t.data && t.data.slice(0, 7) === K);
  const gasto = doMes.filter(t => t.tipo === "gasto").reduce((a, t) => a + t.valor, 0);
  const renda = doMes.filter(t => t.tipo === "renda").reduce((a, t) => a + t.valor, 0) || cfg.renda;
  const limite = cfg.limite || renda * 0.8;
  if (limite && gasto + aPagar > limite) { linhas.unshift(`Alerta: você passou ${brl(gasto + aPagar - limite)} do limite do mês`); grave = true; }
  const porCat = {};
  doMes.filter(t => t.tipo === "gasto").forEach(t => porCat[t.cat] = (porCat[t.cat] || 0) + t.valor);
  for (const [cat, lim] of Object.entries(S.orc || {})) if (lim > 0 && (porCat[cat] || 0) > lim) { linhas.push(`${cat} passou do orçamento (${brl(porCat[cat])} de ${brl(lim)})`); grave = true; }

  // dia 1º: resumo do mês anterior
  let resumo = null;
  if (H.d === 1) {
    const pm = H.m === 0 ? 11 : H.m - 1, py = H.m === 0 ? H.y - 1 : H.y;
    const PK = `${py}-${String(pm + 1).padStart(2, "0")}`;
    const ant = (S.lanc || []).filter(t => t.data && t.data.slice(0, 7) === PK);
    if (ant.length) {
      const e = ant.filter(t => t.tipo === "renda").reduce((a, t) => a + t.valor, 0);
      const g = ant.filter(t => t.tipo === "gasto").reduce((a, t) => a + t.valor, 0);
      const s = ant.filter(t => t.tipo === "guardar").reduce((a, t) => a + t.valor, 0);
      resumo = { title: `Resumo de ${MESES[pm]}`, body: `Entrou ${brl(e)}, saiu ${brl(g)}, você guardou ${brl(s)}. Toque para ver os detalhes.`, url: "/#relatorio", tag: "prumo-resumo" };
    }
  }
  const aviso = linhas.length ? {
    title: grave ? "Prumo: atenção às suas contas" : "Prumo: lembrete de contas",
    body: linhas.slice(0, 4).join("\n") + (linhas.length > 4 ? `\n+${linhas.length - 4} avisos no app` : ""),
    url: "/#contas", tag: "prumo-dia"
  } : null;
  return { aviso, resumo };
}
