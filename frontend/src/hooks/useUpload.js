import { useState } from 'react';
import { apiService } from '../services/api';

export const useUpload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const uploadFile = async (file) => {
    if (!file) {
      setError('Por favor, selecione um arquivo');
      return null;
    }

    // Validar tipo de arquivo
    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      setError('Formato inválido. Aceitamos apenas imagens (JPG, PNG) e PDF');
      return null;
    }

    // Validar tamanho (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      setError('Arquivo muito grande. Tamanho máximo: 10MB');
      return null;
    }

    try {
      setIsUploading(true);
      setError(null);
      setSuccess(null);

      const result = await apiService.uploadNotaFiscal(file);
      
      setSuccess('Nota fiscal processada com sucesso!');
      return result;
    } catch (err) {
      console.error('Erro no upload:', err);
      setError(err.message || 'Falha ao processar nota fiscal');
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const resetStates = () => {
    setError(null);
    setSuccess(null);
  };

  return {
    isUploading,
    error,
    success,
    uploadFile,
    resetStates
  };
};
