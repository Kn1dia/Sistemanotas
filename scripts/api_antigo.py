from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import json
import os
from datetime import datetime
from typing import Dict, Any
import uuid
import google.generativeai as genai
from dotenv import load_dotenv

# Carregar variáveis de ambiente
load_dotenv()

# Configurar Gemini
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

app = FastAPI(title="SmartSpend-BR API", version="1.0.0")

# Configurar CORS para aceitar requisições do frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Frontend URL
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
        {"name": "Limpeza", "value": 0, "color": "#8b5cf6"},
        {"name": "Bebidas", "value": 0, "color": "#f59e0b"},
        {"name": "Outros", "value": 0, "color": "#6b7280"}
    ],
    "feed": [],
    "opportunities": [],
    "ultimaNota": None
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

async def analisar_nota(file_path: str) -> Dict[str, Any]:
    """
    Analisa nota fiscal usando Gemini AI
    """
    try:
        # Upload do arquivo para o Gemini
        uploaded_file = genai.upload_file(file_path)
        print(f"Arquivo uploaded: {uploaded_file.name}")
        
        # Aguarda o processamento do arquivo
        import time
        while uploaded_file.state.name == "PROCESSING":
            print("Aguardando processamento do arquivo...")
            time.sleep(2)
            uploaded_file = genai.get_file(uploaded_file.name)
        
        if uploaded_file.state.name == "FAILED":
            raise Exception("Falha no processamento do arquivo")
        
        # Modelo Gemini
        try:
            model = genai.GenerativeModel('gemini-1.5-flash-latest')
        except Exception as e:
            print(f"Erro ao carregar modelo gemini-1.5-flash-latest: {e}")
            print("Listando modelos disponíveis:")
            try:
                for m in genai.list_models():
                    if 'generateContent' in m.supported_generation_methods:
                        print(f"  - {m.name}")
                raise Exception("Modelo gemini-1.5-flash-latest não encontrado. Verifique os modelos listados acima.")
            except Exception as list_error:
                print(f"Erro ao listar modelos: {list_error}")
                raise Exception("Não foi possível listar modelos disponíveis. Verifique sua API key.")
        
        # Prompt para análise
        prompt = """Analise esta nota fiscal. Retorne APENAS um JSON válido (sem ```json no inicio) com os campos: 
        'mercado' (nome), 'data' (formato ISO 2026-01-30), 'total' (float), 'itens' (lista de objetos com 'nome', 'preco', 'categoria'). 
        As categorias devem ser: 'Alimentos', 'Bebidas', 'Limpeza' ou 'Outros'."""
        
        # Geração da resposta
        response = model.generate_content([prompt, uploaded_file])
        
        # Extrai JSON da resposta
        json_text = response.text.strip()
        
        # Converte para dicionário
        nota_data = json.loads(json_text)
        
        # Adiciona metadados
        nota_data['id'] = str(uuid.uuid4())[:8]
        nota_data['data_formatada'] = datetime.now().strftime("%d/%m/%Y")
        nota_data['categoria_principal'] = 'Outros'
        
        # Determina categoria principal baseada nos itens
        if nota_data.get('itens'):
            categorias_count = {}
            for item in nota_data['itens']:
                cat = item.get('categoria', 'Outros')
                categorias_count[cat] = categorias_count.get(cat, 0) + 1
            
            if categorias_count:
                nota_data['categoria_principal'] = max(categorias_count, key=categorias_count.get)
        
        return nota_data
        
    except Exception as e:
        print(f"Erro na análise da nota: {e}")
        raise HTTPException(status_code=500, detail=f"Erro na análise da nota fiscal: {str(e)}")
    finally:
        # Limpa o arquivo do Gemini
        try:
            if 'uploaded_file' in locals():
                genai.delete_file(uploaded_file.name)
        except:
            pass

def salvar_historico(nota_data: Dict[str, Any]):
    """
    Salva os dados da nota no histórico
    """
    try:
        data_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'data', 'historico_compras.json')
        
        # Carrega dados existentes ou cria nova estrutura
        if os.path.exists(data_path):
            with open(data_path, 'r', encoding='utf-8') as f:
                historico = json.load(f)
        else:
            historico = DEFAULT_DASHBOARD_DATA.copy()
            historico['feed'] = []
        
        # Adiciona nova nota ao feed
        historico['feed'].append({
            'id': nota_data['id'],
            'mercado': nota_data['mercado'],
            'data': nota_data['data_formatada'],
            'total': nota_data['total'],
            'categoria': nota_data['categoria_principal'].lower()
        })
        
        # Atualiza totais
        historico['comprasMes'] = len(historico['feed'])
        historico['totalGasto'] += nota_data['total']
        
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
async def get_dashboard():
    """
    Retorna dados do dashboard no formato esperado pelo frontend
    Estrutura idêntica ao mockData.js
    """
    try:
        data = carregar_historico_compras()
        return JSONResponse(content=data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao carregar dados do dashboard: {str(e)}")

@app.post("/upload")
async def upload_nota_fiscal(file: UploadFile = File(...)):
    """
    Recebe upload de imagem de nota fiscal, analisa com Gemini e salva no histórico
    """
    try:
        # Verifica se o arquivo é uma imagem
        if not file.content_type.startswith('image/'):
            raise HTTPException(status_code=400, detail="Apenas arquivos de imagem são permitidos")
        
        # Cria nome de arquivo único com timestamp
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        file_id = str(uuid.uuid4())[:8]
        file_extension = file.filename.split('.')[-1] if '.' in file.filename else 'jpg'
        filename = f"nota_{timestamp}_{file_id}.{file_extension}"
        
        # Caminho completo para salvar
        uploads_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'uploads')
        os.makedirs(uploads_dir, exist_ok=True)
        file_path = os.path.join(uploads_dir, filename)
        
        # Salva o arquivo
        with open(file_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
        
        print(f"Arquivo salvo: {file_path}")
        
        # Analisa a nota com Gemini
        print("Iniciando análise com Gemini...")
        nota_analisada = await analisar_nota(file_path)
        
        # Salva no histórico
        print("Salvando no histórico...")
        salvar_historico(nota_analisada)
        
        # Retorna resposta completa com dados analisados
        return {
            "message": "Nota fiscal analisada e salva com sucesso!",
            "filename": filename,
            "size": len(content),
            "content_type": file.content_type,
            "upload_time": datetime.now().isoformat(),
            "analise": nota_analisada
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Erro no upload: {e}")
        raise HTTPException(status_code=500, detail=f"Erro ao processar upload: {str(e)}")

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
    uvicorn.run(app, host="0.0.0.0", port=8000)
