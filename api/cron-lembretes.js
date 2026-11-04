// Roda todo dia às 8h (horário de Brasília) pela Vercel Cron e manda os lembretes.
import { admin, enviar, hojeBR, lembretes } from "../lib/prumo.js";

export default async function handler(req, res) {
  if (process.env.CRON_SECRET && req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ erro: "não autorizado" });
  }
  const db = admin();
  const H = hojeBR();
  const { data: subs, error } = await db.from("push_subs").select("user_id");
  if (error) return res.status(500).json({ erro: error.message });
  const usuarios = [...new Set((subs || []).map(s => s.user_id))];
  let enviadas = 0;
  for (const uid of usuarios) {
    const { data } = await db.from("estado").select("dados").eq("user_id", uid).maybeSingle();
    const r = lembretes(data && data.dados, H);
    if (!r) continue;
    if (r.resumo) enviadas += await enviar(db, uid, r.resumo);
    if (r.aviso) enviadas += await enviar(db, uid, r.aviso);
  }
  res.status(200).json({ ok: true, usuarios: usuarios.length, enviadas });
}
