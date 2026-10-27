# Minicurso de CI com GitHub Actions

Material de apoio do minicurso, publicado em **kessleru.com.br/ci** (rota escondida do portfólio:
sem link, fora do sitemap e com `noindex`).

Mesmas ferramentas e visual do portfólio, na versão limpa: React 19 + TypeScript + Vite 7 +
Tailwind v4 + Catppuccin (Mocha no escuro, Latte creme no claro).

- Duas trilhas (Node.js · API e Python · dados), salvas no navegador; `?trilha=python` abre direto na de Python.
- Workflow linha a linha, simulação do check no PR, roteiro com progresso salvo e comandos para copiar.
- Texto, código e roteiro ficam em `src/content.ts`.
- O código da prática mora aqui mesmo, em `node/` (API Express + Vitest) e `python/` (CSV de cupons + pytest),
  cada pasta com o próprio README. O GitHub só roda workflows na raiz do repositório: para o CI rodar de verdade,
  o aluno usa o conteúdo da pasta como raiz do repositório dele.

## Rodando

```bash
pnpm install
pnpm dev      # http://localhost:5173/ci/
pnpm build
```

## Como vira kessleru.com.br/ci

Este repositório é um projeto próprio na Vercel. O `vercel.json` do portfólio repassa `/ci` e `/ci/*`
para ele, sem o `/ci`; por isso o Vite usa `base: '/ci/'` (os arquivos são pedidos em `/ci/assets/...`).
