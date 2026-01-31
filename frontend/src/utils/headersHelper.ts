// frontend/src/utils/headersHelper.ts

export const headersGet = () => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  // Verifica se estamos no navegador antes de acessar o localStorage
  if (typeof window !== 'undefined') {
    // Ajuste a chave 'user_token' ou 'token' conforme o que você usa no seu AuthContext
    const token = localStorage.getItem('smartspend_token') || localStorage.getItem('token'); 
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  return headers;
};

export const headersPost = () => {
  // Geralmente é a mesma estrutura do GET (JSON + Token)
  return headersGet();
};