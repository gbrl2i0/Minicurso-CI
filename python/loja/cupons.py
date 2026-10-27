import csv


def carregar_cupons(caminho="dados/cupons.csv"):
    with open(caminho) as f:
        return {l["codigo"]: l for l in csv.DictReader(f)}


def aplicar_cupom(valor, cupom):
    taxa = int(cupom["desconto"]) / 100
    return valor * (1 - taxa)
