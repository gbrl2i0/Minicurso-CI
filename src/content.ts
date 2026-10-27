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
export type Track = {
  id: 'node' | 'py';
  wf: string;
  pasta: string;
  repo: string;
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
  steps: { t: string; parts: Part[]; tela: string; dicas: string[] }[];
  erros: [title: string, text: string][];
  alem: [name: string, cmd: string, text: string][];
};

export const REPO_NODE = 'github.com/kessleru/Minicurso-CI';
// As duas trilhas moram no mesmo repositório: node/ e python/.
export const REPO_PY = REPO_NODE;

export const NODE_RUN: Run = [['Set up job', 2], ['actions/checkout@v4', 1], ['actions/setup-node@v4', 4], ['npm ci', 12], ['npx tsc --noEmit', 6], ['npm test', 13]];
export const PY_RUN: Run = [['Set up job', 2], ['actions/checkout@v4', 1], ['actions/setup-python@v5', 3], ['pip install -r requirements.txt', 8], ['pytest -q', 5]];

const NODE_FIX = `export function calcularPrecoFinal(
  valor: number,
  descontoPercentual: number
): number {
  const taxa = Math.min(descontoPercentual, 100) / 100;
  return valor * (1 - taxa);
}`;

export function NODE(repo: string): Track { return {
  id: 'node', wf: 'ci.yml', pasta: 'node', repo, check: 'test', run: NODE_RUN,
  projetoIntro: 'Uma API mínima: uma rota que chama uma função e devolve JSON, sem banco e sem login. O bug está na função de desconto, que não tem limite.',
  tree: `node/
├── .github/
│   └── workflows/
│       └── ci.yml
├── src/
│   ├── desconto.ts
│   ├── desconto.test.ts
│   ├── app.ts
│   ├── app.test.ts
│   └── server.ts
├── tsconfig.json
├── package.json
└── package-lock.json`,
  files: [
    ['src/desconto.ts', 'ts', `export function calcularPrecoFinal(
  valor: number,
  descontoPercentual: number
): number {
  return valor - valor * (descontoPercentual / 100);
}`],
    ['src/app.ts', 'ts', `import express from 'express';
import { calcularPrecoFinal } from './desconto';

export const app = express();
app.use(express.json());

app.post('/calcular', (req, res) => {
  const { valor, descontoPercentual } = req.body;
  res.json({
    precoFinal: calcularPrecoFinal(valor, descontoPercentual),
  });
});`],
    ['src/server.ts', 'ts', `import { app } from './app';

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
    ['src/desconto.test.ts', 'ts', `import { describe, it, expect } from 'vitest';
import { calcularPrecoFinal } from './desconto';

describe('calcularPrecoFinal', () => {
  it('aplica 10% sobre 200', () => {
    expect(calcularPrecoFinal(200, 10)).toBe(180);
  });
  it('aceita desconto zero', () => {
    expect(calcularPrecoFinal(200, 0)).toBe(200);
  });
  it('nunca devolve negativo', () => {
    expect(calcularPrecoFinal(100, 120)).toBe(0);
  });
});`],
    ['src/app.test.ts', 'ts', `import request from 'supertest';
import { it, expect } from 'vitest';
import { app } from './app';

it('POST /calcular sem negativo', async () => {
  const res = await request(app)
    .post('/calcular')
    .send({ valor: 100, descontoPercentual: 120 });
  expect(res.body.precoFinal).not.toBeLessThan(0);
});`],
  ],
  out: `$ npm test
 ✓ aplica 10% sobre 200
 ✓ aceita desconto zero
 ✗ nunca devolve negativo
 ✗ POST /calcular sem negativo
   → expected -20 to be 0
 Tests  2 passed | 2 failed`,
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
    ['  test:', 'Id do job. Vira o nome do check no PR e é o que você exige na proteção da branch.'],
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
 ❯ src/desconto.test.ts (3)
   ✗ nunca devolve negativo
   AssertionError: expected -20 to be 0
Error: Process completed with exit code 1`,
  logOk: `Run npm test
 ✓ src/desconto.test.ts (3)
 ✓ src/app.test.ts (1)
 Tests  4 passed`,
  steps: [
    { t: 'Clonar e ver o teste falhar', parts: [
      { kind: 'cmds', lang: 'sh', items: [
        [`git clone https://${repo}`, 'Baixa o repositório-base para a sua máquina.'],
        ['cd Minicurso-CI/node', 'Entra na pasta da trilha Node.js.'],
        ['npm install', 'Instala as dependências. Local pode ser install; no CI é npm ci.'],
        ['npm test', 'Roda o Vitest uma vez. O bug já está no código.'],
      ] },
    ], tela: '2 passed | 2 failed. O preço negativo aparece antes de qualquer CI: o CI não inventa erro.', dicas: ['Precisa de Node 20 ou mais novo. Confira com node -v.'] },
    { t: 'Criar o ci.yml e commitar', parts: [
      { kind: 'cmds', lang: 'sh', items: [
        ['mkdir -p .github/workflows', 'Cria a pasta. O caminho precisa ser exatamente este, com o ponto.'],
        ['code .github/workflows/ci.yml', 'Abre o arquivo no VS Code. Cole o workflow da seção 04.'],
        ['git add .github', 'Coloca o workflow no próximo commit.'],
        ['git commit -m "ci: testes em push e PR"', 'O workflow entra no histórico como qualquer código.'],
        ['git push', 'Envia para o GitHub. O push na main já dispara o primeiro run.'],
      ] },
      { kind: 'wf' },
    ], tela: 'A aba Actions mostra o run CI começando sozinho, e ele fica vermelho, porque o bug ainda está na main.', dicas: ['YAML só aceita espaços, dois por nível. Nada de tab.'] },
    { t: 'Abrir o PR e ver o check vermelho', parts: [
      { kind: 'cmds', lang: 'sh', items: [
        ['git switch -c fix/desconto', 'Cria uma branch nova para o PR.'],
        ['# faça qualquer mudança em src/desconto.ts', 'Um comentário basta: o commit precisa ter alguma alteração.'],
        ['git commit -am "wip: desconto sem limite"', 'Commita a alteração nos arquivos que o git já conhece.'],
        ['git push -u origin fix/desconto', 'Sobe a branch para o GitHub.'],
        ['gh pr create --fill', 'Abre o PR pela GitHub CLI, usando a mensagem do commit.'],
      ] },
    ], tela: 'Check test em vermelho no PR. Clique em Details para ver o log com expected -20 to be 0.', dicas: ['Sem a GitHub CLI? O git push imprime um link para abrir o PR no navegador.'] },
    { t: 'Corrigir e exigir o check no merge', parts: [
      { kind: 'code', block: ['src/desconto.ts · versão corrigida', 'ts', NODE_FIX] },
      { kind: 'cmds', lang: 'sh', items: [
        ['git commit -am "fix: limitar desconto a 100%"', 'Commita a correção na mesma branch.'],
        ['git push', 'O workflow roda de novo sozinho, no mesmo PR.'],
      ] },
      { kind: 'clicks', items: ['No GitHub: Settings → Branches → Add rule', 'Branch name pattern: main', 'Marque Require status checks to pass', 'Busque e selecione o check test'] },
    ], tela: 'Check verde e merge liberado. Daqui em diante, um check vermelho desabilita o botão de merge.', dicas: ['O check só aparece na busca depois de ter rodado pelo menos uma vez.'] },
  ],
  erros: [
    ['Tab no YAML', 'O YAML só aceita espaços, dois por nível. Um tab quebra o arquivo inteiro, e o workflow nem aparece na aba Actions.'],
    ['Arquivo no lugar errado', 'Fora de .github/workflows/ nada roda e nada avisa. Confira o caminho, inclusive o ponto no começo de .github.'],
    ['npm install no CI', 'Use npm ci. Ele instala exatamente o package-lock.json e falha se o lock estiver desatualizado; o install pode subir versões e mudar o resultado do teste.'],
    ['Passa local, falha no CI', 'Quase sempre é versão diferente do Node ou lock desatualizado. Compare node -v com o node-version do workflow e rode npm ci local.'],
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
  id: 'py', wf: 'dados.yml', pasta: 'python', repo, check: 'validar', run: PY_RUN,
  projetoIntro: 'O código lê um CSV de cupons e aplica o desconto. Quem edita o CSV é o comercial, direto no navegador. O código está certo; o dado, não.',
  tree: `python/
├── .github/
│   └── workflows/
│       └── dados.yml
├── dados/
│   └── cupons.csv
├── loja/
│   └── cupons.py
├── tests/
│   └── test_cupons.py
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
    ['  validar:', 'Id do job. Vira o nome do check no PR e é o que você exige na proteção da branch.'],
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
    ], tela: 'Depois do push, nada roda: este workflow não escuta push. O Run workflow dispara o primeiro run, verde.', dicas: ['YAML só aceita espaços, dois por nível. Nada de tab.'] },
    { t: 'Editar o CSV no navegador e abrir o PR', parts: [
      { kind: 'clicks', items: ['No GitHub, abra dados/cupons.csv', 'Clique no lápis (Edit this file)', 'Cole a linha abaixo no fim do arquivo', 'Commit changes → Create a new branch', 'Propose changes → Create pull request'] },
      { kind: 'cmds', lang: 'csv', items: [['BLACK150,150,2026-11-28', 'Cupom de 150%: o erro proposital.']] },
    ], tela: 'Check validar em vermelho, com [BLACK150] no nome do teste que falhou.', dicas: ['Ninguém abriu o terminal: é exatamente o caminho de quem não é dev.'] },
    { t: 'Corrigir, exigir o check e rodar na mão', parts: [
      { kind: 'clicks', items: ['No PR: Files changed → ⋯ → Edit file', 'Troque a linha do BLACK150 pela linha abaixo', 'Commit changes'] },
      { kind: 'cmds', lang: 'csv', items: [['BLACK50,50,2026-11-28', 'Desconto dentro do limite.']] },
      { kind: 'clicks', items: ['Settings → Branches → Add rule', 'Marque Require status checks e selecione validar', 'Actions → Dados → Run workflow'] },
    ], tela: 'Check verde e merge liberado. O Run workflow roda o mesmo job que o cron roda toda manhã.', dicas: ['Com paths e check obrigatório, PR que não toca em dados fica esperando o check para sempre. Em produção, tire o filtro ou use um job que sempre roda.'] },
  ],
  erros: [
    ['Tab no YAML', 'O YAML só aceita espaços, dois por nível. Um tab quebra o arquivo inteiro, e o workflow nem aparece na aba Actions.'],
    ['pytest fora do requirements.txt', 'Na sua máquina ele já estava instalado; no runner, não. Tudo que o CI usa precisa estar no requirements.txt.'],
    ['Esperar o push disparar', 'Este workflow escuta pull_request, schedule e o botão. Push direto na main não roda nada.'],
    ['Cron no horário errado', 'O schedule é em UTC e só roda na branch padrão. 12:00 UTC é 9h em Brasília. Em repositório sem atividade por 60 dias, o GitHub pausa o agendamento.'],
    ['Check obrigatório que nunca chega', 'Com paths, PR que não mexe em dados não roda o job, e o check obrigatório fica esperando. Tire o filtro ou crie um job que sempre roda.'],
  ],
  alem: [
    ['Ruff', 'ruff check .', 'lint e formatação, muito rápido'],
    ['mypy', 'mypy loja', 'tipos checados no CI'],
    ['Cobertura', 'pytest --cov=loja', 'quanto do código os testes exercitam'],
    ['Matrix', "python-version: ['3.11', '3.12', '3.13']", 'o mesmo job em várias versões'],
    ['Docker + CD', 'docker build -t cupons-loja .', 'imagem e deploy a cada merge'],
  ],
}; }
