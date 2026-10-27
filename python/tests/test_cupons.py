import pytest
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
    assert validade >= date.today()
