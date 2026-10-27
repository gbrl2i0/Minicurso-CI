# Minicurso CI

Material de apoio do minicurso de CI do Otávio Kessler Ustra, servido em kessleru.com.br/ci
(o portfólio, repo `kessleru/Portfolio-Kessleru`, repassa a rota para o deploy deste repo na Vercel).

- `pnpm dev` / `pnpm build`. Vite com `base: '/ci/'`: não tire, senão os arquivos somem atrás do proxy.
- Conteúdo das trilhas em `src/content.ts`; o resto é apresentação.
- `node/` e `python/` são os projetos da prática (não fazem parte do site): rode `npm ci && npm test` em `node/` e
  `pytest -q` em `python/` (com `pip install -r requirements.txt`). Não crie `.github/workflows` na raiz deste repo:
  os workflows de exemplo ficam dentro das pastas e em `passos/`.
- Visual igual à versão simples do portfólio: tokens Catppuccin (`text-ctp-*`), uma coluna,
  `prose-text` em parágrafos, mono só em rótulos, código e datas. Textos em português do Brasil.
- Commits em português (`tipo: descrição`), sem coautoria, autor
  `Otávio Kessler Ustra <90390195+kessleru@users.noreply.github.com>`, direto na `main`.
