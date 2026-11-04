# Prumo Finanças

App de finanças pessoais (PWA). Front em `index.html` + `app.js`; funções da Vercel em `api/`; banco no Supabase.

## Colocar no ar
1. **Supabase** (grátis): crie um projeto → SQL Editor → cole `supabase.sql` → Run.
   Authentication → Sign In / Providers → Email: desligue **Confirm email**.
   Authentication → URL Configuration: coloque o endereço da Vercel em Site URL.
2. **GitHub**: suba todos os arquivos desta pasta.
3. **Vercel**: importe o repositório, Framework Preset **Other**, sem build. Settings → Environment Variables:
   cadastre as 7 variáveis do arquivo de chaves e faça **Redeploy**.
4. **Celular**: abra o link, instale na tela de início, entre na conta e ative as notificações em Ajustes.

## Lembretes
`vercel.json` agenda `/api/cron-lembretes` todo dia às 11h UTC (8h em Brasília). No dia 1º vai também o resumo do mês.

## Atualizar
Ao publicar mudanças, aumente `CACHE` em `sw.js` e o `?v=` do `app.js` no `index.html` e no `sw.js`.
