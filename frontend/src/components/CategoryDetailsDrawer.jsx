import React, { useEffect, useRef } from 'react';
import { ArrowLeft, Package, Store, DollarSign } from 'lucide-react';

const CategoryDetailsDrawer = ({ 
  isOpen, 
  onClose, 
  category, 
  items = [], 
  total = 0,
  className = "" 
}) => {
  const drawerRef = useRef(null);

  // Fecha com ESC
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Impede scroll do body quando drawer está aberto
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Fecha ao clicar no backdrop
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className={`fixed inset-0 z-50 ${className}`}
      onClick={handleBackdropClick}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      
      {/* Drawer Container */}
      <div 
        ref={drawerRef}
        className={`
          absolute right-0 top-0 h-full bg-brand-card shadow-2xl
          transform transition-transform duration-300 ease-out
          w-full max-w-md
          ${isOpen ? 'translate-x-0' : 'translate-x-full'}
        `}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-brand-card border-b border-gray-700/50 z-10">
          <div className="flex items-center justify-between p-4">
            <button
              onClick={onClose}
              className="p-2 -ml-2 rounded-lg hover:bg-gray-700/50 transition-colors"
              aria-label="Voltar"
            >
              <ArrowLeft className="w-6 h-6 text-white" />
            </button>
            
            <h2 className="text-xl font-bold text-white truncate flex-1 text-center mr-8">
              {category}
            </h2>
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-col h-full">
          {/* Items List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {items.length === 0 ? (
              <div className="text-center py-12">
                <Package className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                <p className="text-gray-400">Nenhum item encontrado</p>
              </div>
            ) : (
              items.map((item, index) => (
                <div 
                  key={index}
                  className="bg-brand-dark/50 rounded-xl p-4 border border-gray-700/30"
                >
                  {/* Product Name */}
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="text-white font-medium mb-1">
                        {item.nome || 'Produto sem nome'}
                      </h3>
                      
                      {/* Market */}
                      {item.mercado && (
                        <div className="flex items-center text-gray-400 text-sm">
                          <Store className="w-3 h-3 mr-1" />
                          <span className="truncate">
                            {item.mercado}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    {/* Price */}
                    <div className="flex items-center text-brand-green font-bold ml-4">
                      <DollarSign className="w-4 h-4 mr-1" />
                      <span className="text-lg">
                        {(item.preco || 0).toLocaleString('pt-BR', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2
                        })}
                      </span>
                    </div>
                  </div>
                  
                  {/* Category Badge */}
                  {item.categoria && (
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-700/50 text-gray-300">
                        {item.categoria}
                      </span>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Footer - Total */}
          {items.length > 0 && (
            <div className="sticky bottom-0 bg-brand-card border-t border-gray-700/50 p-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-400 font-medium">Total da categoria</span>
                <div className="flex items-center text-brand-green font-bold text-xl">
                  <DollarSign className="w-5 h-5 mr-1" />
                  <span>
                    {total.toLocaleString('pt-BR', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    })}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CategoryDetailsDrawer;
