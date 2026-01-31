import React, { useState, useRef } from 'react';
import { Receipt, Upload, User } from 'lucide-react';
import { apiService } from '../services/api';

const Header = ({ onUploadSuccess = null }) => {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    
    if (!file) return;

    // Validação de arquivo
    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecione apenas arquivos de imagem (JPG, PNG, etc.)');
      return;
    }

    // Validação de tamanho (máximo 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('O arquivo é muito grande. Por favor, selecione uma imagem com até 10MB.');
      return;
    }

    try {
      setUploading(true);
      
      // Envia para a API
      const response = await apiService.uploadNotaFiscal(file);
      
      // Sucesso
      alert('✅ Nota enviada para processamento!\n\n' + 
            `Arquivo: ${response.filename}\n` +
            `Tamanho: ${(response.size / 1024).toFixed(1)} KB\n` +
            `Horário: ${new Date(response.upload_time).toLocaleString('pt-BR')}`);
      
      // Limpa o input
      event.target.value = '';
      
      // Recarrega o dashboard se a função foi passada
      if (onUploadSuccess) {
        onUploadSuccess();
      }
      
    } catch (error) {
      console.error('Erro no upload:', error);
      
      let errorMessage = 'Ocorreu um erro ao enviar a nota fiscal.';
      
      if (error.message.includes('HTTP error! status: 400')) {
        errorMessage = 'Arquivo inválido. Verifique se é uma imagem válida.';
      } else if (error.message.includes('HTTP error! status: 413')) {
        errorMessage = 'Arquivo muito grande. Use uma imagem menor que 10MB.';
      } else if (error.message.includes('Failed to fetch')) {
        errorMessage = 'Não foi possível conectar ao servidor. Verifique se a API está rodando.';
      } else if (error.message) {
        errorMessage = `Erro: ${error.message}`;
      }
      
      alert('❌ ' + errorMessage);
      
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      <header className="bg-brand-card border-b border-gray-700/50 sticky top-0 z-50 backdrop-blur-lg bg-opacity-90">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="bg-brand-green p-2 rounded-xl">
                <Receipt className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gradient">
                SmartSpend-BR
              </h1>
            </div>

            {/* Botão Upload */}
            <button 
              className={`btn-primary flex items-center space-x-2 ${
                uploading ? 'opacity-75 cursor-not-allowed' : 'hover:scale-105'
              } transition-all duration-200`}
              onClick={handleUploadClick}
              disabled={uploading}
            >
              {uploading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Enviando...</span>
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5" />
                  <span>Upload de Nota</span>
                </>
              )}
            </button>

            {/* Avatar */}
            <div className="flex items-center space-x-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-white">Olá, Usuario</p>
                <p className="text-xs text-gray-400">usuario@email.com</p>
              </div>
              <div className="bg-gray-600 p-2 rounded-full">
                <User className="w-5 h-5 text-white" />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Input invisível para upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
        aria-label="Upload de nota fiscal"
      />
    </>
  );
};

export default Header;
