import React, { useRef, useState } from 'react';
import { ArrowLeft, Upload, Camera, FileText, X, CheckCircle, AlertCircle } from 'lucide-react';

const UploadModal = ({ 
  isOpen, 
  onClose, 
  onUploadSuccess,
  isUploading,
  error,
  success,
  uploadFile,
  resetStates
}) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  // Fecha com ESC
  React.useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleClose = () => {
    if (!isUploading) {
      onClose();
      setSelectedFile(null);
      resetStates();
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  const handleFileSelect = (file) => {
    if (file) {
      setSelectedFile(file);
      resetStates();
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleFileInputChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleCameraCapture = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    const result = await uploadFile(selectedFile);
    
    if (result) {
      // Sucesso - aguarda um momento e fecha
      setTimeout(() => {
        onUploadSuccess();
        handleClose();
      }, 1500);
    }
  };

  const getFileIcon = () => {
    if (!selectedFile) return <Upload className="w-12 h-12 text-purple-400" />;
    
    if (selectedFile.type.startsWith('image/')) {
      return (
        <div className="w-16 h-16 rounded-lg overflow-hidden">
          <img 
            src={URL.createObjectURL(selectedFile)} 
            alt="Preview" 
            className="w-full h-full object-cover"
          />
        </div>
      );
    }
    
    return <FileText className="w-12 h-12 text-purple-400" />;
  };

  const getFileName = () => {
    if (!selectedFile) return 'Nenhum arquivo selecionado';
    
    const name = selectedFile.name;
    if (name.length > 30) {
      return name.substring(0, 27) + '...';
    }
    return name;
  };

  const getFileSize = () => {
    if (!selectedFile) return '';
    
    const size = selectedFile.size;
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50"
      onClick={handleBackdropClick}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      
      {/* Modal Container - Mobile-first */}
      <div 
        className={`
          absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl
          transform transition-transform duration-300 ease-out
          max-h-[90vh] overflow-hidden
          ${isOpen ? 'translate-y-0' : 'translate-y-full'}
        `}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle para drag (mobile) */}
        <div className="flex justify-center pt-2 pb-1">
          <div className="w-12 h-1 bg-gray-300 rounded-full"></div>
        </div>

        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={handleClose}
              disabled={isUploading}
              className="p-2 -ml-2 rounded-lg hover:bg-purple-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Voltar"
            >
              <ArrowLeft className="w-6 h-6 text-white" />
            </button>
            
            <h2 className="text-xl font-bold text-white">Enviar Nota Fiscal</h2>
            
            <div className="w-10"></div> {/* Spacer */}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Upload Area */}
          <div
            className={`
              border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200
              ${isDragging 
                ? 'border-purple-500 bg-purple-50' 
                : 'border-purple-200 bg-purple-50/50 hover:border-purple-400 hover:bg-purple-50'
              }
              ${isUploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => !isUploading && fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,application/pdf"
              onChange={handleFileInputChange}
              className="hidden"
              disabled={isUploading}
            />

            <div className="flex flex-col items-center space-y-4">
              {getFileIcon()}
              
              <div>
                <p className="text-purple-900 font-medium mb-1">
                  {selectedFile ? 'Arquivo selecionado' : 'Arraste ou clique para selecionar'}
                </p>
                <p className="text-purple-600 text-sm">
                  {getFileName()}
                </p>
                {selectedFile && (
                  <p className="text-purple-500 text-xs mt-1">
                    {getFileSize()}
                  </p>
                )}
              </div>

              {!selectedFile && (
                <p className="text-purple-500 text-xs">
                  Aceitamos JPG, PNG e PDF (máx. 10MB)
                </p>
              )}
            </div>
          </div>

          {/* Camera Button */}
          <div className="flex space-x-3">
            <button
              onClick={() => !isUploading && cameraInputRef.current?.click()}
              disabled={isUploading}
              className="flex-1 bg-purple-100 text-purple-700 py-3 rounded-xl font-medium hover:bg-purple-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              <Camera className="w-5 h-5" />
              <span>Tirar Foto</span>
            </button>

            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleCameraCapture}
              className="hidden"
              disabled={isUploading}
            />
          </div>

          {/* Error/Success Messages */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-red-900 font-medium text-sm">Erro</p>
                <p className="text-red-700 text-sm mt-1">{error}</p>
              </div>
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-start space-x-3">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-green-900 font-medium text-sm">Sucesso</p>
                <p className="text-green-700 text-sm mt-1">{success}</p>
              </div>
            </div>
          )}

          {/* Upload Button */}
          <button
            onClick={handleUpload}
            disabled={!selectedFile || isUploading}
            className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white py-4 rounded-xl font-medium hover:from-purple-700 hover:to-purple-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {isUploading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Processando...</span>
              </>
            ) : (
              <>
                <Upload className="w-5 h-5" />
                <span>Enviar Nota Fiscal</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UploadModal;
