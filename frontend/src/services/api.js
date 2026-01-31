// API Service para SmartSpend-BR
// Conecta o frontend com o backend FastAPI

const API_BASE_URL = 'http://localhost:8080';

class ApiService {
  // Método genérico para fazer requisições
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const config = {
      ...defaultOptions,
      ...options,
      headers: {
        ...defaultOptions.headers,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`API Error (${endpoint}):`, error);
      throw error;
    }
  }

  // GET /dashboard - Obtém dados do dashboard
  async getDashboard() {
    return this.request('/dashboard');
  }

  // POST /upload - Faz upload de nota fiscal
  async uploadNotaFiscal(file) {
    const formData = new FormData();
    formData.append('file', file); 

    try {
      // Uso direto do fetch para evitar headers incorretos (como application/json)
      const response = await fetch(`${API_BASE_URL}/upload`, {
        method: 'POST',
        body: formData,
        // IMPORTANTE: Não definir headers aqui. O browser define o boundary sozinho.
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erro ${response.status}: ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erro no upload:', error);
      throw error;
    }
  }

  // GET /health - Verifica saúde da API
  async getHealth() {
    return this.request('/health');
  }

  // DELETE /compras/{id} - Exclui uma compra
  async deleteCompra(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/compras/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erro ${response.status}: ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erro ao excluir compra:', error);
      throw error;
    }
  }
}

// Exporta instância única do serviço
export const apiService = new ApiService();

// Exporta métodos individuais para facilitar uso
export const {
  getDashboard,
  uploadNotaFiscal,
  getHealth,
  deleteCompra
} = apiService;
