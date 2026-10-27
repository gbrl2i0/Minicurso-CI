// Conteúdo das duas trilhas do minicurso (Node.js · API e Python · dados).
// Veio do material original; é aqui que se edita texto, código e roteiro.

export type Lang = 'ts' | 'py' | 'sh' | 'csv' | 'tree' | 'yaml' | 'out';
export type Block = [name: string, lang: Lang, code: string];
export type Run = [step: string, seconds: number][];
export type Part =
  | { kind: 'cmds'; lang: Lang; items: [cmd: string, why: string][] }
  | { kind: 'code'; block: Block }
  | { kind: 'clicks'; items: string[] }
  | { kind: 'wf' };
/** Captura de tela real do GitHub (em public/fotos). */
export type Foto = { src: string; w: number; h: number; alt: string; legenda: string };
export type Step = { t: string; parts: Part[]; tela: string; dicas: string[]; fotos?: Foto[] };
export type Track = {
  id: 'node' | 'py';
  wf: string;
  pasta: string;
  repo: string;
  /** Pasta da trilha no repositório, para o link do GitHub. */
  pastaUrl: string;
  check: string;
  run: Run;
  projetoIntro: string;
  tree: string;
  files: Block[];
  demoOut: string;
  bugNote: string;
  testesTitulo: string;
  testesIntro: string;
  tests: Block[];
  out: string;
  anatomia: { k: string; d: string }[];
  yml: [line: string, note: string][];
  logBug: string;
  logOk: string;
  steps: Step[];
  alem: [name: string, cmd: string, text: string][];
};

export const REPO_NODE = 'github.com/kessleru/Minicurso-CI';
// As duas trilhas moram no mesmo repositório: node/ e python/.
export const REPO_PY = REPO_NODE;

export const NODE_RUN: Run = [['Set up job', 2], ['actions/checkout@v4', 1], ['actions/setup-node@v4', 4], ['npm ci', 12], ['npx tsc --noEmit', 6], ['npm test', 13]];
export const PY_RUN: Run = [['Set up job', 2], ['actions/checkout@v4', 1], ['actions/setup-python@v5', 3], ['pip install -r requirements.txt', 8], ['pytest -q', 5]];

// Capturas da documentação do GitHub (docs.github.com, licença CC BY 4.0).
export const FOTOS = {
  actions: { src: 'aba-actions.webp', w: 1400, h: 302, alt: 'Aba Actions do GitHub: a lista de workflows na lateral e um run verde na lista de runs', legenda: 'A aba Actions: os workflows na lateral, cada run na lista, com o check verde ou o X vermelho.' },
  log: { src: 'log-do-job.webp', w: 1400, h: 995, alt: 'Log de um job do GitHub Actions com cada step marcado como concluído e o tempo de cada um', legenda: 'Clicando no job, cada step aparece com o tempo e o log. Um step vermelho mostra o erro aqui.' },
  checks: { src: 'checks-do-pr.webp', w: 1272, h: 1120, alt: 'Pull request no GitHub com a aba Checks destacada e a lista de commits do PR', legenda: 'No PR, a aba Checks mostra cada job que rodou, commit por commit.' },
  commits: { src: 'commits-com-status.webp', w: 703, h: 196, alt: 'Lista de commits no GitHub, com um X vermelho nos commits que reprovaram e um check verde no que passou', legenda: 'O feedback na prática: cada commit ganha um check verde ou um X vermelho.' },
  settings: { src: 'aba-settings.webp', w: 1400, h: 138, alt: 'Barra de abas de um repositório no GitHub com a aba Settings destacada', legenda: 'Settings fica no fim da barra de abas e só aparece para quem administra o repositório.' },
  merge: { src: 'botao-merge.webp', w: 934, h: 576, alt: 'Botão verde Merge pull request aberto, com as opções de merge commit, squash e rebase', legenda: 'Com o check verde, o botão Merge pull request volta a ficar verde.' },
  runWorkflow: { src: 'run-workflow.webp', w: 1384, h: 584, alt: 'Página de um workflow na aba Actions com o botão Run workflow destacado', legenda: 'O botão Run workflow aparece porque o workflow tem workflow_dispatch.' },
  editar: { src: 'editar-arquivo.webp', w: 1400, h: 446, alt: 'Arquivo aberto no GitHub com o ícone de lápis para editar destacado', legenda: 'O lápis abre o arquivo para editar ali mesmo, no navegador.' },
} satisfies Record<string, Foto>;

const RULESET = (check: string, extra?: string): Step => ({
  t: 'Proteger a main com um ruleset',
  parts: [
    { kind: 'clicks', items: [
      'No repositório: Settings → Rules → Rulesets',
      'New ruleset → New branch ruleset',
      'Ruleset Name: proteger-main · Enforcement status: Active',
      'Target branches → Add target → Include default branch',
      'Marque Require a pull request before merging',
      `Marque Require status checks to pass → Add checks → ${check}`,
      'Create',
    ] },
    { kind: 'cmds', lang: 'sh', items: [
      ['git switch main', 'Volta para a main.'],
      ['git pull', 'Traz o que já está no GitHub.'],
      ['git commit --allow-empty -m "teste: push direto"', 'Um commit vazio, só para testar a regra.'],
      ['git push', 'Tenta mandar direto para a main, sem PR.'],
    ] },
    { kind: 'code', block: ['terminal · o push é recusado', 'out', `remote: error: GH013: Repository rule violations found for refs/heads/main.
remote: - Changes must be made through a pull request.
remote: - Required status check "${check}" is expected.
 ! [remote rejected] main -> main (push declined due to repository rule violations)`] },
    { kind: 'cmds', lang: 'sh', items: [
      ['git reset --hard origin/main', 'Descarta o commit de teste que não subiu.'],
    ] },
  ],
  fotos: [FOTOS.settings],
  tela: `O push direto é recusado com GH013. No PR, o botão de merge fica travado enquanto o check ${check} estiver vermelho.`,
  dicas: [
    'Em repositório privado no plano Free o ruleset não vale: use um repositório público.',
    `O check ${check} só aparece no Add checks depois de ter rodado pelo menos uma vez.`,
    'Deixe a Bypass list vazia: assim nem você, dono do repositório, passa por cima da regra.',
    ...(extra ? [extra] : []),
  ],
});

const NODE_FIX = `export function calcularPrecoFinal(
  valor: number,
  descontoPercentual: number
): number {
  if (valor < 0) {
    throw new Error("valor nao pode ser negativo");
  }

  if (descontoPercentual < 0 || descontoPercentual > 100) {
    throw new Error("descontoPercentual deve estar entre 0 e 100");
  }

  const desconto = valor * (descontoPercentual / 100);
  return valor - desconto;
}`;

export function NODE(repo: string): Track { return {
  id: 'node', wf: 'ci.yml', pasta: 'node', repo, pastaUrl: `https://${repo}/tree/main/node`, check: 'test', run: NODE_RUN,
  projetoIntro: 'Uma API mínima: uma rota que chama uma função e devolve JSON, sem banco e sem login. O bug está na função de desconto, que não tem limite.',
  tree: `node/
├── passos/
│   ├── test/
│   └── lint/
├── src/
│   ├── desconto.ts
│   ├── desconto.test.ts
│   ├── app.ts
│   ├── app.test.ts
│   └── server.ts
├── eslint.config.js
├── tsconfig.json
├── package.json
└── package-lock.json`,
  files: [
    ['src/desconto.ts', 'ts', `export function calcularPrecoFinal(
  valor: number,
  descontoPercentual: number
): number {
  const desconto = valor * (descontoPercentual / 100);
  return valor - desconto;
}`],
    ['src/app.ts', 'ts', `import express from "express";
import { calcularPrecoFinal } from "./desconto.js";

export const app = express();
app.use(express.json());

app.post("/calcular", (req, res) => {
  const { valor, descontoPercentual } = req.body;

  try {
    const precoFinal = calcularPrecoFinal(valor, descontoPercentual);
    res.json({ precoFinal });
  } catch (erro) {
    res.status(400).json({ erro: (erro as Error).message });
  }
});`],
    ['src/server.ts', 'ts', `import { app } from "./app.js";

// separado do app.ts para o teste não precisar de porta
app.listen(3000);`],
    ['terminal · com o servidor rodando', 'sh', `$ curl -X POST localhost:3000/calcular \\
    -H "Content-Type: application/json" \\
    -d '{"valor":100,"descontoPercentual":120}'`],
  ],
  demoOut: '{"precoFinal":-20}',
  bugNote: 'A API responde um preço negativo, e nenhum check no PR reclama.',
  testesTitulo: 'Os testes que pegam o bug',
  testesIntro: 'Dois níveis. O de unidade testa só a função pura. O de integração bate na rota de verdade com o Supertest, que sobe o app em memória, sem ocupar porta.',
  tests: [
    ['src/desconto.test.ts', 'ts', `import { describe, it, expect } from "vitest";
import { calcularPrecoFinal } from "./desconto.js";

describe("calcularPrecoFinal", () => {
  it("aplica um desconto normal de 10%", () => {
    expect(calcularPrecoFinal(100, 10)).toBe(90);
  });

  it("com desconto de 0% devolve o valor original", () => {
    expect(calcularPrecoFinal(100, 0)).toBe(100);
  });

  it("com desconto de 100% o produto sai de graca", () => {
    expect(calcularPrecoFinal(100, 100)).toBe(0);
  });

  it("rejeita desconto acima de 100% em vez de devolver preco negativo", () => {
    expect(() => calcularPrecoFinal(100, 120)).toThrow();
  });
});`],
    ['src/app.test.ts', 'ts', `import { describe, it, expect } from "vitest";
import request from "supertest";
import { app } from "./app.js";

describe("POST /calcular", () => {
  it("responde com o preco ja com o desconto aplicado", async () => {
    const resposta = await request(app)
      .post("/calcular")
      .send({ valor: 100, descontoPercentual: 10 });

    expect(resposta.status).toBe(200);
    expect(resposta.body.precoFinal).toBe(90);
  });

  it("responde 400 quando o desconto passa de 100%", async () => {
    const resposta = await request(app)
      .post("/calcular")
      .send({ valor: 100, descontoPercentual: 120 });

    expect(resposta.status).toBe(400);
  });
});`],
  ],
  out: `$ npm test
 ❯ src/desconto.test.ts (4 tests | 1 failed)
   ✗ rejeita desconto acima de 100% em vez de devolver preco negativo
     → expected [Function] to throw an error
 ❯ src/app.test.ts (2 tests | 1 failed)
   ✗ responde 400 quando o desconto passa de 100%
     → expected 200 to be 400
 Tests  2 failed | 4 passed (6)`,
  anatomia: [
    { k: 'describe', d: 'Agrupa casos relacionados. É o título que aparece no relatório do Vitest.' },
    { k: 'it', d: 'Um caso, com nome em português comum. O nome é a documentação da regra.' },
    { k: 'expect', d: 'A afirmação. Se falha, o processo sai com código diferente de zero, e é esse número que pinta o check do PR.' },
  ],
  yml: [
    ['name: CI', 'Nome do workflow. É o que aparece na aba Actions.'],
    ['on:', 'Lista dos eventos que disparam o workflow.'],
    ['  push:', 'Roda a cada push...'],
    ['    branches: [main]', '...mas só na main. Protege a branch principal de quebrar sem ninguém ver.'],
    ['  pull_request:', 'Roda em todo PR aberto ou atualizado. É este resultado que vira o check do PR.'],
    ['jobs:', 'Os blocos de trabalho. Cada job roda numa máquina própria.'],
    ['  test:', 'Id do job. Vira o nome do check no PR e é o que você exige no ruleset da main.'],
    ['    runs-on: ubuntu-latest', 'A máquina (runner). Uma VM Linux limpa, criada do zero a cada run.'],
    ['    steps:', 'Tarefas do job, executadas em ordem. Se uma falha, as seguintes não rodam.'],
    ['      - uses: actions/checkout@v4', 'A VM chega vazia. Este step baixa o código do repositório.'],
    ['      - uses: actions/setup-node@v4', 'Instala o Node no runner.'],
    ['        with:', 'Parâmetros da action logo acima.'],
    ["          node-version: '20'", 'Use a mesma versão que o time usa local. Versão diferente é a causa número um de "passa aqui, falha lá".'],
    ["          cache: 'npm'", 'Guarda as dependências entre runs. O segundo run fica bem mais rápido.'],
    ['      - run: npm ci', 'Instala exatamente o que está no package-lock.json. No CI, nunca npm install.'],
    ['      - run: npx tsc --noEmit', 'Checa os tipos sem gerar arquivo. Erro de tipo reprova o job.'],
    ['      - run: npm test', 'Roda unidade e integração. Exit code diferente de zero pinta o check de vermelho.'],
  ],
  logBug: `Run npm test
 ❯ src/desconto.test.ts (4 tests | 1 failed)
   ✗ rejeita desconto acima de 100% em vez de devolver preco negativo
   AssertionError: expected [Function] to throw an error
 ❯ src/app.test.ts (2 tests | 1 failed)
   ✗ responde 400 quando o desconto passa de 100%
   AssertionError: expected 200 to be 400
Error: Process completed with exit code 1`,
  logOk: `Run npm test
 ✓ src/desconto.test.ts (4 tests)
 ✓ src/app.test.ts (2 tests)
 Tests  6 passed (6)`,
  steps: [
    { t: 'Clonar e ver o teste falhar', parts: [
      { kind: 'cmds', lang: 'sh', items: [
        [`git clone https://${repo}`, 'Baixa o repositório-base para a sua máquina.'],
        ['cd Minicurso-CI/node', 'Entra na pasta da trilha Node.js.'],
        ['npm install', 'Instala as dependências. Local pode ser install; no CI é npm ci.'],
        ['npm test', 'Roda o Vitest uma vez. O bug já está no código.'],
      ] },
    ], tela: '2 failed | 4 passed. A função aceita 120% e a rota responde 200 em vez de 400: o bug aparece antes de qualquer CI, e o CI não inventa erro.', dicas: ['Precisa de Node 20 ou mais novo. Confira com node -v.'] },
    { t: 'Criar o ci.yml e commitar', parts: [
      { kind: 'cmds', lang: 'sh', items: [
        ['mkdir -p .github/workflows', 'Cria a pasta. O caminho precisa ser exatamente este, com o ponto.'],
        ['code .github/workflows/ci.yml', 'Abre o arquivo no VS Code. Cole o workflow da seção 04.'],
        ['git add .github', 'Coloca o workflow no próximo commit.'],
        ['git commit -m "ci: testes em push e PR"', 'O workflow entra no histórico como qualquer código.'],
        ['git push', 'Envia para o GitHub. O push na main já dispara o primeiro run.'],
      ] },
      { kind: 'wf' },
    ], fotos: [FOTOS.actions], tela: 'A aba Actions mostra o run CI começando sozinho, e ele fica vermelho, porque o bug ainda está na main.', dicas: ['YAML só aceita espaços, dois por nível. Nada de tab.', 'O GitHub só roda workflows que estão em .github/workflows na raiz do repositório. Use o conteúdo da pasta como raiz do seu repositório (copie para um repositório novo ou fork); dentro de uma subpasta, o workflow não aparece na aba Actions.'] },
    { t: 'Abrir o PR e ver o check vermelho', parts: [
      { kind: 'cmds', lang: 'sh', items: [
        ['git switch -c fix/desconto', 'Cria uma branch nova para o PR.'],
        ['# faça qualquer mudança em src/desconto.ts', 'Um comentário basta: o commit precisa ter alguma alteração.'],
        ['git commit -am "wip: desconto sem limite"', 'Commita a alteração nos arquivos que o git já conhece.'],
        ['git push -u origin fix/desconto', 'Sobe a branch para o GitHub.'],
        ['gh pr create --fill', 'Abre o PR pela GitHub CLI, usando a mensagem do commit.'],
      ] },
    ], fotos: [FOTOS.checks, FOTOS.log], tela: 'Check test em vermelho no PR. Clique em Details para ver o log com expected 200 to be 400.', dicas: ['Sem a GitHub CLI? O git push imprime um link para abrir o PR no navegador.'] },
    RULESET('test'),
    { t: 'Corrigir e fazer o merge', parts: [
      { kind: 'code', block: ['src/desconto.ts · versão corrigida', 'ts', NODE_FIX] },
      { kind: 'cmds', lang: 'sh', items: [
        ['git switch fix/desconto', 'Volta para a branch do PR. Troque o src/desconto.ts pela versão acima.'],
        ['git commit -am "fix: limitar desconto a 100%"', 'Commita a correção na mesma branch do PR.'],
        ['git push', 'O workflow roda de novo sozinho, no mesmo PR.'],
      ] },
      { kind: 'clicks', items: ['Espere o check test ficar verde', 'Clique em Merge pull request', 'Confirm merge'] },
    ], fotos: [FOTOS.merge], tela: 'Check verde e merge liberado. Daqui em diante, nada entra na main sem PR e sem o check test verde.', dicas: ['Se o check ficar vermelho de novo, o botão de merge volta a travar sozinho.'] },
  ],
  alem: [
    ['ESLint + Prettier', 'npm run lint', 'estilo e erro bobo fora do review'],
    ['Cobertura', 'npx vitest run --coverage', 'quanto do código os testes exercitam'],
    ['Playwright', 'npx playwright test', 'E2E no navegador, com trace anexado ao run'],
    ['Auditoria', 'npm audit --audit-level=high', 'dependência com falha conhecida reprova'],
    ['Docker + CD', 'docker build -t api-desconto .', 'imagem e deploy a cada merge'],
  ],
}; }

export function PY(repo: string): Track { return {
  id: 'py', wf: 'dados.yml', pasta: 'python', repo, pastaUrl: `https://${repo}/tree/main/python`, check: 'validar', run: PY_RUN,
  projetoIntro: 'O código lê um CSV de cupons e aplica o desconto. Quem edita o CSV é o comercial, direto no navegador. O código está certo; o dado, não.',
  tree: `python/
├── dados/
│   └── cupons.csv
├── loja/
│   └── cupons.py
├── tests/
│   └── test_cupons.py
├── passos/
│   └── dados.yml
├── pytest.ini
└── requirements.txt`,
  files: [
    ['dados/cupons.csv', 'csv', `codigo,desconto,validade
BEMVINDO10,10,2026-12-31
FRETE15,15,2026-11-30
BLACK150,150,2026-11-28`],
    ['loja/cupons.py', 'py', `import csv

def carregar_cupons(caminho="dados/cupons.csv"):
    with open(caminho) as f:
        return {l["codigo"]: l for l in csv.DictReader(f)}

def aplicar_cupom(valor, cupom):
    taxa = int(cupom["desconto"]) / 100
    return valor * (1 - taxa)`],
    ['python · REPL', 'py', `$ python
>>> from loja.cupons import *
>>> cupons = carregar_cupons()
>>> aplicar_cupom(100, cupons["BLACK150"])`],
  ],
  demoOut: '-50.0',
  bugNote: 'O código faz exatamente o que o CSV manda. O dado está errado, e nenhum check olha para ele.',
  testesTitulo: 'O teste que pega o dado errado',
  testesIntro: 'Este teste não confere uma função: confere o arquivo de dados. O parametrize transforma cada linha do CSV em um caso, com o código do cupom no nome.',
  tests: [
    ['tests/test_cupons.py', 'py', `import pytest
from datetime import date
from loja.cupons import carregar_cupons

CUPONS = list(carregar_cupons().values())
codigo = lambda c: c["codigo"]

@pytest.mark.parametrize("cupom", CUPONS, ids=codigo)
def test_desconto_entre_1_e_100(cupom):
    assert 0 < int(cupom["desconto"]) <= 100

@pytest.mark.parametrize("cupom", CUPONS, ids=codigo)
def test_cupom_nao_vencido(cupom):
    validade = date.fromisoformat(cupom["validade"])
    assert validade >= date.today()`],
    ['requirements.txt', 'csv', 'pytest==8.3.3'],
  ],
  out: `$ pytest -q
..F...
FAILED tests/test_cupons.py::test_desconto_entre_1_e_100[BLACK150]
  assert 0 < 150 <= 100
1 failed, 5 passed in 0.04s`,
  anatomia: [
    { k: 'test_', d: 'O pytest acha sozinho todo arquivo e função com esse prefixo. Não há registro nem configuração.' },
    { k: 'assert', d: 'O assert comum do Python. Quando falha, o pytest mostra os valores, e o processo sai com código 1.' },
    { k: 'parametrize', d: 'Um caso por cupom. Com ids, o código do cupom aparece no relatório e no log do CI.' },
  ],
  yml: [
    ['name: Dados', 'Nome do workflow. É o que aparece na aba Actions.'],
    ['on:', 'Lista dos eventos que disparam o workflow. Aqui são três, e nenhum é push.'],
    ['  pull_request:', 'Roda em todo PR aberto ou atualizado...'],
    ["    paths: ['dados/**', 'tests/**']", '...mas só se o diff tocar em dados/ ou tests/. PR que muda o README não gasta runner.'],
    ['  schedule:', 'Roda pelo relógio, sem ninguém pedir. Dado envelhece: um cupom válido hoje vence amanhã.'],
    ["    - cron: '0 12 * * *'", 'Todo dia às 12:00 UTC, que é 9h em Brasília. O schedule só roda na branch padrão.'],
    ['  workflow_dispatch:', 'Cria o botão Run workflow na aba Actions, para rodar na mão.'],
    ['jobs:', 'Os blocos de trabalho. Cada job roda numa máquina própria.'],
    ['  validar:', 'Id do job. Vira o nome do check no PR e é o que você exige no ruleset da main.'],
    ['    runs-on: ubuntu-latest', 'A máquina (runner). Uma VM Linux limpa, criada do zero a cada run.'],
    ['    steps:', 'Tarefas do job, executadas em ordem. Se uma falha, as seguintes não rodam.'],
    ['      - uses: actions/checkout@v4', 'A VM chega vazia. Este step baixa o código e o CSV.'],
    ['      - uses: actions/setup-python@v5', 'Instala o Python no runner.'],
    ['        with:', 'Parâmetros da action logo acima.'],
    ["          python-version: '3.12'", 'Use a mesma versão que o time usa local.'],
    ["          cache: 'pip'", 'Guarda os pacotes entre runs. O segundo run fica mais rápido.'],
    ['      - run: pip install -r requirements.txt', 'Instala o pytest. Tudo que o CI usa precisa estar no requirements.txt.'],
    ['      - run: pytest -q', 'Um caso por linha do CSV. Uma linha errada devolve exit code 1 e o check fica vermelho.'],
  ],
  logBug: `Run pytest -q
FAILED tests/test_cupons.py::test_desconto_entre_1_e_100[BLACK150]
  assert 0 < 150 <= 100
1 failed, 5 passed in 0.04s
Error: Process completed with exit code 1`,
  logOk: `Run pytest -q
 ✓ 6 passed in 0.03s`,
  steps: [
    { t: 'Clonar e rodar o pytest local', parts: [
      { kind: 'cmds', lang: 'sh', items: [
        [`git clone https://${repo}`, 'Baixa o repositório-base para a sua máquina.'],
        ['cd Minicurso-CI/python', 'Entra na pasta da trilha Python.'],
        ['python -m venv .venv', 'Cria um ambiente isolado para as dependências.'],
        ['source .venv/bin/activate', 'Ativa o ambiente. No Windows: .venv\\Scripts\\activate'],
        ['pip install -r requirements.txt', 'Instala o pytest.'],
        ['pytest -q', 'Roda os testes de dados.'],
      ] },
    ], tela: '4 passed. Os dados de hoje estão limpos, e é isso que o CI vai proteger.', dicas: ['Precisa de Python 3.10 ou mais novo. Confira com python --version.'] },
    { t: 'Criar o dados.yml e commitar', parts: [
      { kind: 'cmds', lang: 'sh', items: [
        ['mkdir -p .github/workflows', 'Cria a pasta. O caminho precisa ser exatamente este, com o ponto.'],
        ['code .github/workflows/dados.yml', 'Abre o arquivo no VS Code. Cole o workflow da seção 04.'],
        ['git add .github', 'Coloca o workflow no próximo commit.'],
        ['git commit -m "ci: valida cupons em PR e todo dia"', 'O workflow entra no histórico como qualquer código.'],
        ['git push', 'Envia para o GitHub. Nada roda ainda, e está certo.'],
      ] },
      { kind: 'wf' },
      { kind: 'clicks', items: ['Abra a aba Actions do repositório', 'Escolha o workflow Dados', 'Clique em Run workflow'] },
    ], fotos: [FOTOS.runWorkflow], tela: 'Depois do push, nada roda: este workflow não escuta push. O Run workflow dispara o primeiro run, verde.', dicas: ['YAML só aceita espaços, dois por nível. Nada de tab.', 'O GitHub só roda workflows que estão em .github/workflows na raiz do repositório. Use o conteúdo da pasta como raiz do seu repositório (copie para um repositório novo ou fork); dentro de uma subpasta, o workflow não aparece na aba Actions.'] },
    { t: 'Editar o CSV no navegador e abrir o PR', parts: [
      { kind: 'clicks', items: ['No GitHub, abra dados/cupons.csv', 'Clique no lápis (Edit this file)', 'Cole a linha abaixo no fim do arquivo', 'Commit changes → Create a new branch', 'Propose changes → Create pull request'] },
      { kind: 'cmds', lang: 'csv', items: [['BLACK150,150,2026-11-28', 'Cupom de 150%: o erro proposital.']] },
    ], fotos: [FOTOS.editar, FOTOS.checks], tela: 'Check validar em vermelho, com [BLACK150] no nome do teste que falhou.', dicas: ['Ninguém abriu o terminal: é exatamente o caminho de quem não é dev.'] },
    RULESET('validar', 'Com paths e check obrigatório, PR que não toca em dados fica esperando o check para sempre. Em produção, tire o filtro ou use um job que sempre roda.'),
    { t: 'Corrigir, fazer o merge e rodar na mão', parts: [
      { kind: 'clicks', items: ['No PR: Files changed → ⋯ → Edit file', 'Troque a linha do BLACK150 pela linha abaixo', 'Commit changes'] },
      { kind: 'cmds', lang: 'csv', items: [['BLACK50,50,2026-11-28', 'Desconto dentro do limite.']] },
      { kind: 'clicks', items: ['Espere o check validar ficar verde', 'Merge pull request → Confirm merge', 'Actions → Dados → Run workflow'] },
    ], fotos: [FOTOS.merge], tela: 'Check verde e merge liberado. O Run workflow roda o mesmo job que o cron roda toda manhã.', dicas: ['Se o check ficar vermelho de novo, o botão de merge volta a travar sozinho.'] },
  ],
  alem: [
    ['Ruff', 'ruff check .', 'lint e formatação, muito rápido'],
    ['mypy', 'mypy loja', 'tipos checados no CI'],
    ['Cobertura', 'pytest --cov=loja', 'quanto do código os testes exercitam'],
    ['Matrix', "python-version: ['3.11', '3.12', '3.13']", 'o mesmo job em várias versões'],
    ['Docker + CD', 'docker build -t cupons-loja .', 'imagem e deploy a cada merge'],
  ],
}; }
