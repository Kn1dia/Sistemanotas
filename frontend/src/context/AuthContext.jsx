import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Verificar token ao carregar
  useEffect(() => {
    const token = localStorage.getItem('smartspend_token');
    if (token) {
      // Se existe token, restaura o usuário
      setUser({ 
        name: 'Vitor', 
        email: 'vitor@gmail.com' 
      });
    }
    setLoading(false);
  }, []);

  // Função de login com validação estrita
  const login = async (email, password) => {
    // Simular delay de API
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Validação ESTRITA
    if (email === 'vitor@gmail.com' && password === 'admin123') {
      // Salvar token no localStorage
      localStorage.setItem('smartspend_token', 'mock_token_' + Date.now());
      
      // Definir usuário
      setUser({ 
        name: 'Vitor', 
        email: email 
      });
      
      return true;
    } else {
      return false;
    }
  };

  // Função de logout
  const logout = () => {
    // Remover token do localStorage
    localStorage.removeItem('smartspend_token');
    
    // Resetar usuário
    setUser(null);
  };

  const value = {
    user,
    login,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
