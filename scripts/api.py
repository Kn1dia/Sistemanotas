from fastapi import FastAPI, File, UploadFile, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import json
import os
from datetime import datetime
from typing import Dict, Any
import uuid
from google import genai
from dotenv import load_dotenv
import io
from PIL import Image
from sqlalchemy.orm import Session

# Importações do banco de dados
from database import get_db, init_db
from models import User, Nota

# Carregar variáveis de ambiente da pasta raiz
load_dotenv(os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env'))

# ✅ CARREGAMENTO INTELIGENTE DE CHAVES
def get_available_keys():
    """Varre ambiente buscando todas as chaves Gemini disponíveis"""
    available_keys = []
    
    # Busca GEMINI_API_KEY (padrão)
    main_key = os.getenv("GEMINI_API_KEY")
    if main_key and len(main_key.strip()) >= 10:
        available_keys.append(main_key.strip())
        print(f"✅ GEMINI_API_KEY encontrada: {main_key[:10]}...{main_key[-10:]}")
    
    # Busca GEMINI_KEY_1, GEMINI_KEY_2, etc.
    for i in range(1, 50):  # Busca até 50 chaves
        key = os.getenv(f"GEMINI_KEY_{i}")
        if key and len(key.strip()) >= 10:
            available_keys.append(key.strip())
            print(f"✅ GEMINI_KEY_{i} encontrada: {key[:10]}...{key[-10:]}")
    
    if not available_keys:
        raise ValueError("❌ Nenhuma chave Gemini encontrada! Configure GEMINI_API_KEY ou GEMINI_KEY_X no .env")
    
    print(f"🔑 Total de {len(available_keys)} chaves Gemini carregadas para rodízio")
    return available_keys

# Lista global de chaves disponíveis
AVAILABLE_KEYS = get_available_keys()

# ✅ CLIENTE GLOBAL (será recriado dinamicamente sem http_options)
client = genai.Client(api_key=AVAILABLE_KEYS[0])

# ✅ SISTEMA DE RODÍZIO DE CHAVES API (COMENTADO TEMPORARIAMENTE)
# def get_api_keys():
#     """Coleta todas as chaves GEMINI_KEY_ do .env"""
#     api_keys = []
#     for i in range(1, 20):  # Busca até 20 chaves (GEMINI_KEY_1 a GEMINI_KEY_20)
#         key = os.getenv(f"GEMINI_KEY_{i}")
#         if key and len(key.strip()) >= 10:
#             api_keys.append(key.strip())
#     
#     if not api_keys:
#         raise ValueError("❌ Nenhuma chave GEMINI_KEY_X encontrada no .env!")
#     
#     print(f"🔑 {len(api_keys)} chaves API carregadas (GEMINI_KEY_1 a GEMINI_KEY_{len(api_keys)})")
#     return api_keys

# # Lista global de chaves
# API_KEYS = get_api_keys()

# # ✅ FUNÇÃO PARA OBTER CLIENTE DINÂMICO
# def get_gemini_client(key_index: int):
#     """Retorna cliente genai com chave específica"""
#     if key_index >= len(API_KEYS):
#         raise ValueError(f"❌ Índice {key_index} inválido. Apenas {len(API_KEYS)} chaves disponíveis.")
#     
#     api_key = API_KEYS[key_index]
#     print(f"🔑 Processando com Chave {key_index + 1} de {len(API_KEYS)} ({api_key[:10]}...{api_key[-10:]})")
#     return genai.Client(api_key=api_key)

app = FastAPI(title="SmartSpend-BR API", version="1.0.0")

# Configurar CORS para aceitar requisições do frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # ✅ PERMITIR TODAS AS ORIGENS
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Estrutura de dados segura (padrão mockData.js)
DEFAULT_DASHBOARD_DATA = {
    "totalGasto": 0.0,
    "economiaEstimada": 0.0,
    "comprasMes": 0,
    "grafico": [
        {"name": "Alimentos", "value": 0, "color": "#10b981"},
        {"name": "Bebidas", "value": 0, "color": "#f59e0b"},
        {"name": "Limpeza", "value": 0, "color": "#8b5cf6"},
        {"name": "Farmácia", "value": 0, "color": "#ef4444"},
        {"name": "Combustível", "value": 0, "color": "#3b82f6"},
        {"name": "Restaurante", "value": 0, "color": "#f97316"},
        {"name": "Lazer", "value": 0, "color": "#ec4899"},
        {"name": "Serviços", "value": 0, "color": "#06b6d4"},
        {"name": "Outros", "value": 0, "color": "#6b7280"}
    ],
    "feed": [],
    "opportunities": [],
    "ultimaNota": None
}

# Cores por categoria (mantidas para compatibilidade)
CATEGORIAS_CORES = {
    "Alimentos": "#10b981",
    "Bebidas": "#f59e0b", 
    "Limpeza": "#8b5cf6",
    "Farmácia": "#ef4444",
    "Combustível": "#3b82f6",
    "Restaurante": "#f97316",
    "Lazer": "#ec4899",
    "Serviços": "#06b6d4",
    "Outros": "#6b7280"
}

# ✅ FUNÇÃO PARA PADRONIZAR CATEGORIAS
def padronizar_categoria(categoria: str) -> str:
    """
    Força categoria para primeira letra maiúscula
    """
    if not categoria:
        return "Outros"
    
    categoria_normalizada = categoria.strip().lower()
    
    # Mapeamento de categorias válidas
    categorias_validas = {
        "alimentos": "Alimentos",
        "bebidas": "Bebidas", 
        "limpeza": "Limpeza",
        "farmácia": "Farmácia",
        "farmacia": "Farmácia",
        "combustível": "Combustível",
        "combustivel": "Combustível",
        "restaurante": "Restaurante",
        "lazer": "Lazer",
        "serviços": "Serviços",
        "servicos": "Serviços",
        "outros": "Outros"
    }
    
    return categorias_validas.get(categoria_normalizada, "Outros")

# Inicializar banco de dados na startup
@app.on_event("startup")
async def startup_event():
    init_db()
    
    # ✅ DIAGNÓSTICO DE MODELOS NO STARTUP
    print("🔍 DIAGNÓSTICO: Listando modelos disponíveis...")
    try:
        if AVAILABLE_KEYS:
            # Usa primeira chave para diagnóstico (sem http_options)
            diagnostic_client = genai.Client(api_key=AVAILABLE_KEYS[0])
            
            # Lista todos os modelos disponíveis (sem config)
            models = diagnostic_client.models.list()
            
            print("📋 MODELOS DISPONÍVEIS:")
            for model in models:
                print(f"   MODELO: {model.name}")
            
            # Busca especificamente por modelos flash
            flash_models = [m for m in models if 'flash' in m.name.lower()]
            print(f"⚡ MODELOS FLASH ENCONTRADOS: {len(flash_models)}")
            for model in flash_models:
                print(f"   FLASH: {model.name}")
        else:
            print("❌ Nenhuma chave disponível para diagnóstico")
            
    except Exception as e:
        print(f"❌ ERRO NO DIAGNÓSTICO DE MODELOS: {type(e).__name__} - {str(e)}")
        import traceback
        print(f"❌ TRACEBACK: {traceback.format_exc()}")

# Funções auxiliares do banco
def get_or_create_default_user(db: Session) -> User:
    """Obtém ou cria o usuário padrão (ID=1)"""
    user = db.query(User).filter(User.id == 1).first()
    if not user:
        user = User(
            id=1,
            email="user@smartspend.com",
            nome="Usuário Padrão",
            password_hash="placeholder"
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    return user

def calcular_dashboard_data(notas: list) -> Dict[str, Any]:
    """Calcula dados do dashboard a partir das notas do usuário"""
    if not notas:
        return DEFAULT_DASHBOARD_DATA
    
    # Calcular totais
    total_gasto = sum(nota.total for nota in notas)
    
    # Economia estimada (10% do total - simplificado)
    economia_estimada = total_gasto * 0.1
    
    # Contar compras do mês
    compras_mes = len(notas)
    
    # ✅ CORREÇÃO: Agrupar por categoria de CADA ITEM (não da nota)
    categorias_valores = {}
    for nota in notas:
        # Desserializa itens da nota
        try:
            itens = json.loads(nota.itens) if isinstance(nota.itens, str) else nota.itens
        except:
            itens = []
        
        # Agrupa por categoria de CADA ITEM
        for item in itens:
            categoria_item = item.get('categoria', 'Outros')
            valor_item = float(item.get('valor', 0))
            
            if categoria_item not in categorias_valores:
                categorias_valores[categoria_item] = 0
            categorias_valores[categoria_item] += valor_item
    
    # Montar gráfico com cores
    grafico = []
    for categoria, valor in categorias_valores.items():
        if valor > 0:  # Apenas categorias com valor
            grafico.append({
                "name": categoria,
                "value": round(valor, 2),
                "color": CATEGORIAS_CORES.get(categoria, "#6b7280")
            })
    
    # ✅ CORREÇÃO: Montar compras com itens desserializados
    compras = []
    for nota in notas:
        # Desserializa JSON dos itens
        try:
            itens = json.loads(nota.itens) if isinstance(nota.itens, str) else nota.itens
        except:
            itens = []
        
        compras.append({
            "id": nota.id,
            "mercado": nota.mercado,
            "data": nota.data,
            "total": nota.total,
            "categoria": nota.categoria,
            "itens": itens  # ✅ AGORA TEM ITENS!
        })
    
    compras.sort(key=lambda x: x["data"], reverse=True)
    
    # ATRIBUIÇÃO EXPLÍCITA
    feed_data = compras  # Garante que a variável é a mesma
    
    return {
        "totalGasto": round(total_gasto, 2),
        "economiaEstimada": round(economia_estimada, 2),
        "comprasMes": compras_mes,
        
        "categorias": grafico,
        "grafico": grafico,  # Compatibilidade
        
        "compras": compras,  # Dados novos
        "feed": feed_data,   # DADOS LEGADOS (CRÍTICO: Deve ser igual a compras)
        
        "ultimaNota": compras[0] if compras else None
    }

def carregar_historico_compras() -> Dict[str, Any]:
    """Carrega dados do arquivo JSON ou retorna estrutura padrão"""
    try:
        # Caminho para o arquivo de dados
        data_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'data', 'historico_compras.json')
        
        if os.path.exists(data_path):
            with open(data_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
                # Garante que todos os campos necessários existam
                merged_data = {**DEFAULT_DASHBOARD_DATA, **data}
                
                # Verificação adicional para garantir que dados essenciais existam
                if not merged_data.get('totalGasto') and not merged_data.get('feed'):
                    print("Arquivo existe mas está vazio ou inválido, usando dados padrão")
                    return DEFAULT_DASHBOARD_DATA.copy()
                
                return merged_data
        else:
            # Retorna estrutura com dados de exemplo para evitar erro de "dados vazios"
            print("Arquivo de dados não encontrado, retornando dados de exemplo")
            example_data = DEFAULT_DASHBOARD_DATA.copy()
            example_data.update({
                "totalGasto": 1254.80,
                "economiaEstimada": 156.20,
                "comprasMes": 12,
                "grafico": [
                    {"name": "Alimentos", "value": 400, "color": "#10b981"},
                    {"name": "Limpeza", "value": 150, "color": "#8b5cf6"},
                    {"name": "Bebidas", "value": 300, "color": "#f59e0b"},
                    {"name": "Outros", "value": 100, "color": "#6b7280"}
                ],
                "feed": [
                    {
                        "id": 1,
                        "mercado": "SUPERMERCADO MODELO S.A.",
                        "data": "30/01/2026",
                        "total": 154.50,
                        "categoria": "alimentos"
                    }
                ],
                "opportunities": [
                    {
                        "title": "Oportunidade no Carrefour",
                        "description": "Heineken 12 unidades está 15% mais barato",
                        "economia": "R$ 12,50",
                        "status": "bom"
                    }
                ]
            })
            return example_data
            
    except Exception as e:
        print(f"Erro ao carregar dados: {e}")
        # Retorna dados de exemplo mesmo em caso de erro
        example_data = DEFAULT_DASHBOARD_DATA.copy()
        example_data.update({
            "totalGasto": 1254.80,
            "economiaEstimada": 156.20,
            "comprasMes": 12
        })
        return example_data

def categorizar_produto(nome_produto: str) -> str:
    """
    Categoriza um produto baseado em regras heurísticas
    """
    nome_lower = nome_produto.lower()
    
    # Bebidas alcoólicas
    bebidas_alcoolicas = ['cerveja', 'vinho', 'refrigerante', 'suco', 'água', 'bebida', 'drink']
    if any(bebida in nome_lower for bebida in bebidas_alcoolicas):
        return 'Bebidas'
    
    # Limpeza
    limpeza = ['sabão', 'detergente', 'limpa', 'papel', 'alvejante', 'desinfetante', 'vassoura', 'pano']
    if any(item in nome_lower for item in limpeza):
        return 'Limpeza'
    
    # Alimentos (padrão)
    return 'Alimentos'

async def analisar_nota(image_bytes: bytes) -> Dict[str, Any]:
    """
    Analisa nota fiscal usando Gemini AI com google-genai
    """
    try:
        print("🔍 Iniciando análise da nota fiscal...")
        
        # ✅ INICIALIZAR VARIÁVEL
        response = None
        
        # Converte bytes para imagem PIL
        image_pil = Image.open(io.BytesIO(image_bytes))
        print(f"📷 Imagem carregada: {image_pil.size}")
        
        # Prompt otimizado para análise
        prompt = """
Analise esta nota fiscal e extraia as informações em formato JSON.

Retorne APENAS um JSON válido (sem ```json no início) com esta estrutura exata:
{
    "mercado": "nome do estabelecimento",
    "data": "2026-01-30",
    "total": 123.45,
    "categoria": "Alimentos",
    "itens": [
        {
            "nome": "nome do produto",
            "valor": 12.34,
            "quantidade": 1,
            "categoria": "Alimentos"
        }
    ]
}

REGRAS OBRIGATÓRIAS:
1. CATEGORIA: Use uma destas: 'Alimentos', 'Bebidas', 'Limpeza', 'Farmácia', 'Combustível', 'Restaurante', 'Lazer', 'Serviços', 'Outros'
2. CAMPO VALOR: Use "valor" (NUNCA "preco") para cada item
3. VALORES: Retorne números (float) para valores
4. DATA: Formato YYYY-MM-DD
5. QUANTIDADE: Sempre inclua (padrão: 1)
        """
        
        # ✅ SISTEMA DE RODÍZIO DE CHAVES COM RESILIÊNCIA
        modelos_para_testar = [
            "gemini-2.5-flash",       # Tentativa 1: O mais novo disponível
            "gemini-flash-latest",    # Tentativa 2: O alias estável
            "gemini-2.0-flash-exp",   # Tentativa 3: Experimental
            "gemini-1.5-pro-latest"   # Tentativa 4: Backup robusto
        ]
        
        print(f"🔍 Iniciando análise com {len(AVAILABLE_KEYS)} chaves e {len(modelos_para_testar)} modelos")
        
        for key_index, api_key in enumerate(AVAILABLE_KEYS):
            for modelo in modelos_para_testar:
                try:
                    print(f"🔑 Chave {key_index + 1}/{len(AVAILABLE_KEYS)} (...{api_key[-4:]}) - Modelo: {modelo}")
                    
                    # ✅ TRATAMENTO DE PREFIXO
                    modelo_final = modelo
                    if modelo.startswith('models/'):
                        # Tenta sem prefixo primeiro
                        modelo_final = modelo.replace('models/', '')
                        print(f"🔄 Removendo prefixo 'models/': {modelo_final}")
                    
                    # Cria cliente dinâmico para esta chave (sem http_options)
                    current_client = genai.Client(api_key=api_key)
                    
                    print(f"✅ Conectado na API com sucesso!")
                    print(f"🤖 Enviando para Gemini {modelo_final}...")
                    
                    # ✅ CHAMADA DIRETA COM CLIENTE DINÂMICO
                    response = current_client.models.generate_content(
                        model=modelo_final,
                        contents=[prompt, image_pil]
                    )
                    
                    print(f"✅ SUCESSO! Chave {key_index + 1} + Modelo {modelo_final} funcionaram! Resposta: {len(response.text)} caracteres")
                    break  # Sai do loop de modelos
                    
                except Exception as e:
                    error_msg = str(e).lower()
                    print(f"❌ Erro com chave {key_index + 1} + modelo {modelo}: {type(e).__name__}")
                    
                    # Se for erro 404 (modelo não encontrado), tenta próximo modelo
                    if "404" in error_msg or "not found" in error_msg:
                        print(f"🔄 Modelo {modelo} não encontrado, tentando próximo modelo...")
                        continue
                    
                    # Verifica se é erro de cota ou servidor Google
                    if ("429" in error_msg or "quota" in error_msg or 
                        "resource has been exhausted" in error_msg or 
                        "500" in error_msg or "internal server error" in error_msg):
                        print(f"⚠️ Chave terminada em ...{api_key[-4:]} falhou. Tentando próxima chave...")
                        break  # Sai do loop de modelos e vai para próxima chave
                    
                    # Se for o último modelo e última chave, propaga erro
                    if (key_index == len(AVAILABLE_KEYS) - 1 and 
                        modelo == modelos_para_testar[-1]):
                        print(f"❌ TODAS AS {len(AVAILABLE_KEYS)} CHAVES E {len(modelos_para_testar)} MODELOS FALHARAM!")
                        print(f"❌ ERRO FINAL: {type(e).__name__}")
                        print(f"❌ MENSAGEM: {str(e)}")
                        import traceback
                        print(f"❌ TRACEBACK: {traceback.format_exc()}")
                        raise HTTPException(status_code=500, detail=f"Erro na análise: Todas as chaves/modelos esgotados. {str(e)}")
                    
                    continue  # Tenta próximo modelo
            
            # Se já conseguiu resposta com algum modelo, sai do loop de chaves
            if 'response' in locals() and response is not None:
                break
        
        # ✅ VERIFICA SE RESPONSE FOI ATRIBUÍDO
        if response is None:
            raise HTTPException(status_code=500, detail="Nenhuma chave Gemini funcionou. response não foi atribuído.")
        
        # Extrai JSON da resposta
        json_text = response.text.strip()
        
        # Remove markdown se presente
        if json_text.startswith('```json'):
            json_text = json_text[7:]
        if json_text.endswith('```'):
            json_text = json_text[:-3]
        json_text = json_text.strip()
        
        print(f"📄 JSON extraído: {json_text[:100]}...")
        
        # Converte para dicionário
        nota_data = json.loads(json_text)
        
        print(f"🎯 Análise concluída: {nota_data.get('mercado', 'N/A')} - R${nota_data.get('total', 0)}")
        
        return nota_data
        
    except Exception as e:
        print(f"❌ ERRO DETALHADO NA ANÁLISE: {type(e).__name__}")
        print(f"❌ Mensagem: {str(e)}")
        print(f"❌ Args: {e.args}")
        import traceback
        print(f"❌ Traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Erro na análise da nota fiscal: {str(e)}")

def salvar_historico(nota_data: Dict[str, Any]):
    """
    Salva os dados da nota no histórico
    """
    try:
        data_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'data', 'historico_compras.json')
        
        # Carrega dados existentes ou cria nova estrutura com blindagem
        if os.path.exists(data_path):
            with open(data_path, 'r', encoding='utf-8') as f:
                try:
                    historico = json.load(f)
                    # Se não for dicionário (ex: lista antiga), força reset
                    if not isinstance(historico, dict):
                        print("Arquivo JSON não é dicionário, resetando estrutura")
                        historico = DEFAULT_DASHBOARD_DATA.copy()
                        historico['feed'] = []  # Garante lista limpa
                    
                    # Se faltar chaves essenciais, cria elas
                    if 'feed' not in historico:
                        print("Chave 'feed' não encontrada, criando lista vazia")
                        historico['feed'] = []
                    if 'totalGasto' not in historico:
                        historico['totalGasto'] = 0.0
                    if 'comprasMes' not in historico:
                        historico['comprasMes'] = 0
                        
                except Exception as json_error:
                    print(f"JSON corrompido ou inválido: {json_error}")
                    print("Criando nova estrutura limpa")
                    # Se o JSON estiver corrompido, inicia um novo
                    historico = DEFAULT_DASHBOARD_DATA.copy()
                    historico['feed'] = []
        else:
            historico = DEFAULT_DASHBOARD_DATA.copy()
            historico['feed'] = []
        
        # Adiciona nova nota ao feed
        historico['feed'].append({
            'id': nota_data['id'],
            'mercado': nota_data['mercado'],
            'data': nota_data['data_formatada'],
            'total': nota_data['total'],
            'categoria': nota_data['categoria_principal'].lower(),
            'itens': nota_data.get('itens', [])  # <--- ADICIONAR ISSO
        })
        
        # Atualiza totais
        historico['comprasMes'] = len(historico['feed'])
        historico['totalGasto'] += nota_data['total']
        
        # Recalcula o gráfico de distribuição por categoria
        categorias_valores = {
            'alimentos': 0.0,
            'bebidas': 0.0, 
            'limpeza': 0.0,
            'farmácia': 0.0,
            'combustível': 0.0,
            'restaurante': 0.0,
            'lazer': 0.0,
            'serviços': 0.0,
            'outros': 0.0
        }
        
        # Percorre todo o feed somando valores por categoria
        for item in historico['feed']:
            categoria_item = item.get('categoria', '').lower()
            
            # Mapeamento inteligente com matching parcial
            if 'alimento' in categoria_item:
                categorias_valores['alimentos'] += item.get('total', 0)
            elif 'bebida' in categoria_item:
                categorias_valores['bebidas'] += item.get('total', 0)
            elif 'limpeza' in categoria_item:
                categorias_valores['limpeza'] += item.get('total', 0)
            elif 'farm' in categoria_item:
                categorias_valores['farmácia'] += item.get('total', 0)
            elif 'comb' in categoria_item:
                categorias_valores['combustível'] += item.get('total', 0)
            elif 'restaurante' in categoria_item or 'refeição' in categoria_item:
                categorias_valores['restaurante'] += item.get('total', 0)
            elif 'lazer' in categoria_item or 'entretenimento' in categoria_item:
                categorias_valores['lazer'] += item.get('total', 0)
            elif 'serviço' in categoria_item:
                categorias_valores['serviços'] += item.get('total', 0)
            else:
                categorias_valores['outros'] += item.get('total', 0)
        
        # Atualiza a lista do gráfico com todas as categorias e cores
        historico['grafico'] = [
            {"name": "Alimentos", "value": categorias_valores['alimentos'], "color": "#10b981"},
            {"name": "Bebidas", "value": categorias_valores['bebidas'], "color": "#f59e0b"},
            {"name": "Limpeza", "value": categorias_valores['limpeza'], "color": "#8b5cf6"},
            {"name": "Farmácia", "value": categorias_valores['farmácia'], "color": "#ef4444"},
            {"name": "Combustível", "value": categorias_valores['combustível'], "color": "#3b82f6"},
            {"name": "Restaurante", "value": categorias_valores['restaurante'], "color": "#f97316"},
            {"name": "Lazer", "value": categorias_valores['lazer'], "color": "#ec4899"},
            {"name": "Serviços", "value": categorias_valores['serviços'], "color": "#06b6d4"},
            {"name": "Outros", "value": categorias_valores['outros'], "color": "#6b7280"}
        ]
        
        print(f"Gráfico atualizado: Alimentos R${categorias_valores['alimentos']:.2f}, Bebidas R${categorias_valores['bebidas']:.2f}, Limpeza R${categorias_valores['limpeza']:.2f}, Farmácia R${categorias_valores['farmácia']:.2f}, Combustível R${categorias_valores['combustível']:.2f}, Restaurante R${categorias_valores['restaurante']:.2f}, Lazer R${categorias_valores['lazer']:.2f}, Serviços R${categorias_valores['serviços']:.2f}, Outros R${categorias_valores['outros']:.2f}")
        
        # Salva arquivo atualizado
        os.makedirs(os.path.dirname(data_path), exist_ok=True)
        with open(data_path, 'w', encoding='utf-8') as f:
            json.dump(historico, f, ensure_ascii=False, indent=2)
        
        print(f"Histórico atualizado: {len(historico['feed'])} compras")
        
    except Exception as e:
        print(f"Erro ao salvar histórico: {e}")
        raise HTTPException(status_code=500, detail=f"Erro ao salvar histórico: {str(e)}")

@app.get("/")
async def root():
    """Health check endpoint"""
    return {"message": "SmartSpend-BR API está rodando!", "status": "active"}

@app.get("/dashboard")
async def get_dashboard(db: Session = Depends(get_db)):
    """
    Retorna dados do dashboard calculados em tempo real do banco
    """
    try:
        # Obter usuário padrão
        user = get_or_create_default_user(db)
        
        # Buscar notas do usuário
        notas = db.query(Nota).filter(Nota.user_id == user.id).all()
        
        # ✅ LOG: Mostrar IDs do banco vs dashboard
        print(f"📊 Dashboard: {len(notas)} notas do banco")
        print(f"📋 IDs no banco: {[nota.id for nota in notas]}")
        
        # Calcular dados do dashboard
        dashboard_data = calcular_dashboard_data(notas)
        
        # ✅ LOG: Mostrar IDs no dashboard resultante
        compras_ids = [c.get('id') for c in dashboard_data.get('compras', [])]
        feed_ids = [f.get('id') for f in dashboard_data.get('feed', [])]
        print(f"📋 IDs no compras: {compras_ids}")
        print(f"📋 IDs no feed: {feed_ids}")
        
        return JSONResponse(content=dashboard_data)
        
    except Exception as e:
        print(f"Erro ao buscar dashboard: {e}")
        raise HTTPException(status_code=500, detail="Erro ao carregar dados do dashboard")

async def salvar_nota_no_banco(db: Session, nota_analisada: Dict[str, Any]):
    """
    Salva nota analisada no banco de dados SQLite
    """
    try:
        # Obter usuário padrão
        user = get_or_create_default_user(db)
        
        # ✅ CORREÇÃO: Serializa itens para JSON
        itens_json = json.dumps(nota_analisada.get('itens', []), ensure_ascii=False)
        
        # Criar nova nota
        nova_nota = Nota(
            id=nota_analisada.get('id', str(uuid.uuid4())),
            user_id=user.id,
            mercado=nota_analisada.get('mercado', 'Mercado não informado'),
            data=nota_analisada.get('data', datetime.now().strftime('%d/%m/%Y')),
            total=nota_analisada.get('total', 0.0),
            categoria=nota_analisada.get('categoria_principal', 'Outros'),
            itens=itens_json  # ✅ SALVA COMO STRING JSON
        )
        
        # Salvar no banco
        db.add(nova_nota)
        db.commit()
        db.refresh(nova_nota)
        
        print(f"✅ Nota salva no banco: ID={nova_nota.id}, Mercado={nova_nota.mercado}, Total={nova_nota.total}")
        
    except Exception as e:
        print(f"❌ Erro ao salvar nota no banco: {e}")
        db.rollback()
        raise HTTPException(status_code=500, detail="Erro ao salvar nota no banco")

@app.post("/upload")
async def upload_nota_fiscal(file: UploadFile = File(...), db: Session = Depends(get_db)):
    """
    Recebe upload de imagem de nota fiscal, analisa com Gemini e salva no banco
    """
    try:
        print("📥 RECEBENDO REQUISIÇÃO DE UPLOAD...")
        print(f"📁 Arquivo: {file.filename}")
        print(f"📄 Tipo: {file.content_type}")
        print(f"📏 Tamanho: {file.size if hasattr(file, 'size') else 'desconhecido'} bytes")
        
        # Verifica se o arquivo é uma imagem
        if not file.content_type.startswith('image/'):
            raise HTTPException(status_code=400, detail="Apenas arquivos de imagem são permitidos")
        
        # Lê o conteúdo do arquivo
        image_bytes = await file.read()
        
        if len(image_bytes) == 0:
            raise HTTPException(status_code=400, detail="Arquivo vazio")
        
        # Gera nome único para o arquivo
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"nota_{timestamp}_{file.filename}"
        
        # Diretório de uploads
        uploads_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'uploads')
        os.makedirs(uploads_dir, exist_ok=True)
        
        # Caminho completo do arquivo
        file_path = os.path.join(uploads_dir, filename)
        
        # Salva o arquivo localmente
        with open(file_path, "wb") as buffer:
            buffer.write(image_bytes)
        
        print(f"Arquivo salvo: {file_path}")
        print(f"Tamanho: {len(image_bytes)} bytes")
        
        # Analisa a nota com Gemini
        print("Iniciando análise com Gemini...")
        nota_analisada = await analisar_nota(image_bytes)
        
        # Salva no banco de dados
        print("Salvando no banco de dados...")
        await salvar_nota_no_banco(db, nota_analisada)
        
        # Retorna resposta completa com dados analisados
        return {
            "message": "Nota fiscal analisada e salva com sucesso!",
            "filename": filename,
            "size": len(image_bytes),
            "content_type": file.content_type,
            "upload_time": datetime.now().isoformat(),
            "analise": nota_analisada
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Erro no upload: {e}")
        raise HTTPException(status_code=500, detail=f"Erro ao processar upload: {str(e)}")

@app.delete("/compras/{compra_id}")
async def delete_compra(compra_id: str, db: Session = Depends(get_db)):
    """
    Exclui uma compra do banco de dados SQLite pelo ID
    """
    # Buscar nota no banco SQLite
    nota = db.query(Nota).filter(Nota.id == compra_id).first()

    if not nota:
        raise HTTPException(status_code=404, detail="Nota não encontrada")

    db.delete(nota)
    db.commit()

    print(f"✅ Nota {compra_id} deletada com sucesso!")

    return {"success": True}

@app.get("/health")
async def health_check():
    """Endpoint detalhado de saúde da API"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "version": "1.0.0",
        "endpoints": {
            "dashboard": "/dashboard",
            "upload": "/upload",
            "health": "/health"
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8080)
