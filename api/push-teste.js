// Botão "Enviar notificação de teste" em Ajustes.
import { admin, enviar, hojeBR, lembretes } from "../lib/prumo.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ erro: "use POST" });
  const token = (req.headers.authorization || "").replace(/^Bearer\s+/i, "");
  if (!token) return res.status(401).json({ erro: "faça login" });
  const db = admin();
  const { data: u, error } = await db.auth.getUser(token);
  if (error || !u?.user) return res.status(401).json({ erro: "sessão expirada, entre de novo" });
  const { data } = await db.from("estado").select("dados").eq("user_id", u.user.id).maybeSingle();
  const r = lembretes(data && data.dados, hojeBR());
  const payload = r && r.aviso
    ? { ...r.aviso, title: "Teste · " + r.aviso.title }
    : { title: "Prumo: teste", body: "As notificações estão funcionando. Os lembretes chegam todo dia às 8h.", url: "/#inicio", tag: "prumo-teste" };
  try {
    const enviadas = await enviar(db, u.user.id, payload);
    res.status(200).json({ enviadas });
  } catch (e) {
    res.status(500).json({ erro: "confira as chaves VAPID na Vercel" });
  }
}
