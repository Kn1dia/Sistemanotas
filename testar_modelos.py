"""
Script para descobrir quais modelos Gemini estão disponíveis na sua conta
"""
import os
from dotenv import load_dotenv
from google import genai

# Carrega a API key
load_dotenv()
CHAVE_API = os.getenv("GEMINI_API_KEY")

if not CHAVE_API:
    print("❌ Erro: API Key não encontrada no arquivo .env!")
    exit(1)

# Inicializa o cliente
client = genai.Client(api_key=CHAVE_API)

print("=" * 60)
print("🔍 LISTANDO MODELOS GEMINI DISPONÍVEIS")
print("=" * 60)

try:
    models = client.models.list()
    
    print(f"\n✅ Encontrados {len(list(models))} modelos:\n")
    
    # Lista novamente porque o iterador já foi consumido
    for model in client.models.list():
        # Verifica se suporta generateContent
        suporta_generate = "generateContent" in getattr(model, 'supported_generation_methods', [])
        
        status = "✅ USAR ESTE" if suporta_generate else "❌ Não suporta"
        
        print(f"{status:20} | {model.name}")
        
    print("\n" + "=" * 60)
    print("💡 Use os modelos marcados com ✅ no seu código")
    print("=" * 60)
    
except Exception as e:
    print(f"❌ Erro ao listar modelos: {e}")
    print("\n💡 Possíveis causas:")
    print("  1. API Key inválida ou expirada")
    print("  2. Problema de conexão com a internet")
    print("  3. Serviço Gemini indisponível temporariamente")