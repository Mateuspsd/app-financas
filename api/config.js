// Entrega ao app só as chaves públicas (nunca a chave secreta do Supabase).
export default function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  res.status(200).json({
    supabaseUrl: process.env.SUPABASE_URL || null,
    supabaseAnonKey: process.env.SUPABASE_ANON_KEY || null,
    vapidPublicKey: process.env.VAPID_PUBLIC_KEY || null
  });
}
