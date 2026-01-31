import os
import json
from datetime import datetime
from dotenv import load_dotenv
from google import genai
from google.genai import types
import PIL.Image

# Configuração da API
load_dotenv()
CHAVE_API = os.getenv("GEMINI_API_KEY")

if not CHAVE_API:
    print("❌ Erro: API Key não encontrada no arquivo .env!")
    exit(1)

# Inicializa o cliente Gemini
client = genai.Client(api_key=CHAVE_API)

# Categorias para classificação automática
CATEGORIAS = {
    "limpeza": ["sabao", "detergente", "amaciante", "desinfetante", "limpa", "cera", "esponja", "pano", "alvejante"],
    "bebidas": ["suco", "refrigerante", "agua", "cerveja", "vinho", "cafe", "cha", "leite", "achocolatado"],
    "alimentos": ["arroz", "feijao", "macarrao", "oleo", "sal", "acucar", "farinha", "pao", "bolo"],
    "higiene": ["sabonete", "shampoo", "condicionador", "creme", "pasta", "escova", "papel", "absorvente", "fralda"],
    "hortifruti": ["alface", "tomate", "batata", "cebola", "alho", "cenoura", "banana", "maca", "laranja"],
    "carnes": ["carne", "frango", "peixe", "linguica", "salsicha", "bacon", "presunto", "mortadela"],
    "frios": ["queijo", "requeijao", "iogurte", "manteiga", "margarina", "cream cheese"],
}

def categorizar_produto(nome_produto):
    """Classifica o produto em uma categoria baseado no nome"""
    nome_lower = nome_produto.lower()
    
    for categoria, palavras_chave in CATEGORIAS.items():
        for palavra in palavras_chave:
            if palavra in nome_lower:
                return categoria
    
    return "outros"

def analisar_nota(caminho_imagem="uploads/nota.jpg"):
    """Analisa uma nota fiscal e extrai os dados estruturados"""
    
    if not os.path.exists(caminho_imagem):
        print(f"❌ Erro: Foto não encontrada em: {caminho_imagem}")
        return None

    try:
        # Carrega a imagem como PIL Image
        img = PIL.Image.open(caminho_imagem)
        
        # Prompt otimizado para notas fiscais brasileiras
        prompt = """
Analise esta nota fiscal brasileira e extraia TODOS os dados no formato JSON PURO (sem markdown):
{
  "mercado": "Nome completo do estabelecimento",
  "cnpj": "Apenas números do CNPJ",
  "endereco": "Endereço completo se disponível",
  "data": "DD/MM/AAAA",
  "hora": "HH:MM se disponível",
  "itens": [
    {
      "codigo": "código do produto se houver",
      "nome": "Nome normalizado e limpo do produto",
      "quantidade": 1,
      "preco_unitario": 0.00,
      "preco_total": 0.00
    }
  ],
  "subtotal": 0.00,
  "descontos": 0.00,
  "total_nota": 0.00,
  "forma_pagamento": "dinheiro/cartão/pix etc"
}

IMPORTANTE:
- Normalize nomes: "ARR BRANCO 5KG" → "Arroz Branco 5kg"
- Extraia TODOS os produtos da nota
- Use valores numéricos sem símbolos (ex: 15.50 não R$ 15,50)
- Retorne APENAS o JSON, sem ```json ou qualquer texto extra
"""

        print("\n🚀 Processando nota fiscal com Gemini...")
        
        # ✅ MODELOS CORRETOS que existem na sua conta (verificado!)
        modelos_para_tentar = [
            'gemini-2.5-flash',           # Mais novo e rápido
            'gemini-flash-latest',         # Alias para o mais recente
            'gemini-2.0-flash',            # Versão 2.0
            'gemini-2.5-pro',              # Mais preciso (mas mais lento)
            'gemini-pro-latest',           # Alias pro
        ]
        
        response = None
        modelo_usado = None
        
        # Tenta cada modelo
        for modelo in modelos_para_tentar:
            try:
                print(f"  Tentando modelo: {modelo}...")
                
                # Sintaxe simples que funciona
                response = client.models.generate_content(
                    model=modelo,
                    contents=[prompt, img]
                )
                
                modelo_usado = modelo
                print(f"  ✅ Sucesso com: {modelo}")
                break
                
            except Exception as e:
                error_msg = str(e)
                print(f"  ⚠️  Erro com {modelo}: {error_msg[:150]}...")
                continue
        
        if not response:
            print("\n❌ Nenhum modelo disponível funcionou!")
            print("\n💡 Verifique se a imagem está no caminho correto:")
            print(f"   {os.path.abspath(caminho_imagem)}")
            return None
        
        # Extrai o texto da resposta
        texto_resposta = response.text.strip()
        
        # Remove possíveis marcadores markdown
        if texto_resposta.startswith("```json"):
            texto_resposta = texto_resposta[7:]
        if texto_resposta.startswith("```"):
            texto_resposta = texto_resposta[3:]
        if texto_resposta.endswith("```"):
            texto_resposta = texto_resposta[:-3]
        
        # Converte para JSON
        dados_nota = json.loads(texto_resposta.strip())
        
        # Adiciona categorização automática aos itens
        for item in dados_nota.get("itens", []):
            item["categoria"] = categorizar_produto(item["nome"])
        
        # Adiciona metadados
        dados_nota["data_processamento"] = datetime.now().strftime("%d/%m/%Y %H:%M:%S")
        dados_nota["modelo_usado"] = modelo_usado
        
        print(f"\n✅ DADOS EXTRAÍDOS COM SUCESSO! (modelo: {modelo_usado})\n")
        return dados_nota
        
    except json.JSONDecodeError as e:
        print(f"❌ Erro ao converter resposta em JSON: {e}")
        print(f"\nResposta recebida:\n{response.text if response else 'N/A'}")
        return None
    except Exception as e:
        print(f"❌ Erro ao processar: {e}")
        import traceback
        traceback.print_exc()
        return None

def salvar_compra(dados_nota, arquivo_historico="data/historico_compras.json"):
    """Salva a compra no histórico JSON"""
    
    # Cria diretório se não existir
    os.makedirs(os.path.dirname(arquivo_historico), exist_ok=True)
    
    # Carrega histórico existente
    historico = {"compras": []}
    if os.path.exists(arquivo_historico):
        try:
            with open(arquivo_historico, 'r', encoding='utf-8') as f:
                conteudo = f.read().strip()
                if conteudo:  # Só tenta carregar se não estiver vazio
                    historico = json.loads(conteudo)
        except (json.JSONDecodeError, ValueError) as e:
            print(f"⚠️  Arquivo histórico corrompido, criando novo.")
            # Faz backup do arquivo corrompido
            if os.path.exists(arquivo_historico):
                backup_path = arquivo_historico + '.backup'
                os.rename(arquivo_historico, backup_path)
                print(f"📦 Backup salvo em: {backup_path}")
    
    # Adiciona nova compra
    historico["compras"].append(dados_nota)
    
    # Salva atualizado
    with open(arquivo_historico, 'w', encoding='utf-8') as f:
        json.dump(historico, f, ensure_ascii=False, indent=2)
    
    print(f"💾 Compra salva no histórico: {arquivo_historico}")

def exibir_resumo_categorias(dados_nota):
    """Mostra resumo dos gastos por categoria"""
    
    categorias_total = {}
    
    for item in dados_nota.get("itens", []):
        categoria = item.get("categoria", "outros")
        preco = item.get("preco_total", 0)
        
        if categoria not in categorias_total:
            categorias_total[categoria] = 0
        categorias_total[categoria] += preco
    
    print("\n📊 RESUMO POR CATEGORIA:")
    print("-" * 40)
    for categoria, total in sorted(categorias_total.items(), key=lambda x: x[1], reverse=True):
        print(f"  {categoria.capitalize():15} R$ {total:7.2f}")
    print("-" * 40)
    print(f"  {'TOTAL':15} R$ {dados_nota.get('total_nota', 0):7.2f}")

def main():
    """Função principal"""
    
    # Analisa a nota
    dados = analisar_nota()
    
    if dados:
        # Mostra dados extraídos
        print(json.dumps(dados, ensure_ascii=False, indent=2))
        
        # Mostra resumo por categoria
        exibir_resumo_categorias(dados)
        
        # Salva no histórico
        salvar_compra(dados)
        
        print("\n✨ Processo concluído com sucesso!")
    else:
        print("\n❌ Não foi possível processar a nota fiscal.")

if __name__ == "__main__":
    main()