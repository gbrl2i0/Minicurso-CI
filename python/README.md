# Minicurso de CI com GitHub Actions · trilha Python

Um CSV de cupons que o comercial edita direto no navegador, e testes que conferem **o dado**, não só o código.
O código lê o CSV e aplica o desconto; quando alguém põe um cupom de 150%, o `pytest` reprova a linha.

> **Onde o workflow roda.** O GitHub só executa workflows que estão em `.github/workflows/` na **raiz** do
> repositório. Esta pasta é uma trilha dentro do repositório Minicurso-CI: para o CI rodar de verdade,
> use o conteúdo de `python/` como raiz do **seu** repositório (copie a pasta para um repositório novo ou
> fork), como nos passos abaixo.

## Rodando

```bash
git clone https://github.com/kessleru/Minicurso-CI
cd Minicurso-CI/python
python -m venv .venv
source .venv/bin/activate        # no Windows: .venv\Scripts\activate
pip install -r requirements.txt
pytest -q
```

**Você deve ver:** `4 passed`. Os dados de hoje estão limpos, e é isso que o CI vai proteger.

## Os passos do exercício

1. **Rodar local** (acima).
2. **Criar o workflow:** `mkdir -p .github/workflows`, copie `passos/dados.yml` para
   `.github/workflows/dados.yml`, commite e dê push. Nada roda ainda, porque este workflow não escuta `push`:
   na aba **Actions**, escolha **Dados → Run workflow** para o primeiro run (verde).
3. **Editar o CSV no navegador e abrir o PR:** no GitHub, edite `dados/cupons.csv` (lápis) e cole no fim a
   linha de `passos/linha-com-erro.csv` (`BLACK150,150,2026-11-28`). Crie uma branch e abra o PR.
   **Você deve ver:** o check `validar` em vermelho, com `[BLACK150]` no nome do teste que falhou.
4. **Corrigir e exigir o check:** no PR, troque a linha pela de `passos/linha-corrigida.csv`
   (`BLACK50,50,2026-11-28`). Depois, em **Settings → Branches → Add rule**, marque **Require status checks to
   pass** e selecione `validar`.

## Estrutura

```
dados/cupons.csv          os cupons (o dado que o CI protege)
loja/cupons.py            lê o CSV e aplica o desconto
tests/test_cupons.py      um caso por cupom: desconto entre 1 e 100 e cupom não vencido
requirements.txt          pytest
pytest.ini                põe esta pasta no caminho, para "from loja.cupons import ..." funcionar
passos/
  dados.yml               o workflow, comentado
  linha-com-erro.csv      a linha com o erro proposital
  linha-corrigida.csv     a linha corrigida
```

## Atenção

O teste `test_cupom_nao_vencido` compara com a data de hoje: quando a validade dos cupons passar, ele falha de
verdade (é o que o `schedule` do workflow existe para avisar). Para reusar a trilha depois, atualize as datas
em `dados/cupons.csv` e em `passos/`.
