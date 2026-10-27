# Minicurso de CI com GitHub Actions · trilha Node.js
API mínima em Express + TypeScript usada como exemplo do minicurso. Uma rota,
uma função de cálculo, dois arquivos de teste. É tudo.

## O que a API faz

`POST /calcular` recebe um valor e um percentual de desconto, devolve o preço final.

```
requisição HTTP  →  POST /calcular  →  calcularPrecoFinal()  →  { "precoFinal": 90 }
```

> **Onde o workflow roda.** O GitHub só executa workflows que estão em `.github/workflows/` na **raiz** do
> repositório. Esta pasta é uma trilha dentro do repositório Minicurso-CI: para o CI rodar de verdade,
> use o conteúdo de `node/` como raiz do **seu** repositório (copie a pasta para um repositório novo ou
> fork), como nos passos abaixo.

## Rodando

```bash
npm install
npm test        # roda os testes
npm run dev     # sobe a API em http://localhost:3000
```

Com a API no ar:

```bash
curl -X POST localhost:3000/calcular \
  -H "Content-Type: application/json" \
  -d '{"valor":100,"descontoPercentual":10}'
```

```json
{"precoFinal":90}
```

## Os 4 passos do exercício

Faça na sua cópia do repositório. Cada passo tem um resultado visível —
se você não vir o resultado descrito, pare e confira antes de seguir.

### Passo 1 — Rodar local

```bash
git clone https://github.com/kessleru/Minicurso-CI
cd Minicurso-CI/node
npm install
npm test
```

**Você deve ver:** 6 testes passando, todos verdes.

### Passo 2 — Criar o workflow

Crie o arquivo `.github/workflows/ci.yml` com o conteúdo de
`passos/test/test.yml`. Depois:

```bash
git add .github/workflows/ci.yml
git commit -m "ci: adiciona workflow de testes"
git push
```

**Você deve ver:** na aba **Actions** do repositório, um run chamado
`ci: adiciona workflow de testes` ficando verde em cerca de 40 segundos.

### Passo 3 — Quebrar de propósito

```bash
git checkout -b bug/desconto
```

Substitua o conteúdo de `src/desconto.ts` pelo de
`passos/test/desconto-com-bug.ts` — é a mesma função sem as validações.

```bash
git add src/desconto.ts
git commit -m "refactor: simplifica calculo de desconto"
git push -u origin bug/desconto
```

Abra um Pull Request de `bug/desconto` para `main`.

**Você deve ver:** o check `test` vermelho no PR, com o botão de merge
bloqueado. Clique em **Details** e leia o log: o Vitest aponta os dois testes
que falharam.

### Passo 4 — Consertar e proteger

Devolva as validações ao `src/desconto.ts` (conteúdo de
`passos/test/desconto-corrigido.ts`), commite e dê push na mesma branch.

**Você deve ver:** o PR reagindo sozinho — um novo run começa e o check fica verde.

Depois, em **Settings → Branches → Add branch protection rule**:

- Branch name pattern: `main`
- Marque **Require status checks to pass before merging**
- Procure e selecione o check `test`

**Você deve ver:** a partir de agora, nenhum PR entra na `main` sem o check verde.

## Estrutura

```
src/
  desconto.ts        lógica pura do cálculo, sem Express
  app.ts             o Express: uma rota, e exporta o app sem dar listen
  server.ts          o listen, separado para o teste não precisar de porta
  desconto.test.ts   testes de unidade
  app.test.ts        teste de integração com Supertest
passos/
  test/test.yml                    o workflow de testes, comentado linha a linha
  test/desconto-com-bug.ts         versão sem validação, para quebrar o CI
  test/desconto-corrigido.ts       versão correta, para consertar
  lint/                            o mesmo, para o workflow de lint
```

## Referências

- docs.github.com/actions
- vitest.dev/guide
- github.com/actions/setup-node
- docs.github.com/actions/using-workflows/events-that-trigger-workflows
