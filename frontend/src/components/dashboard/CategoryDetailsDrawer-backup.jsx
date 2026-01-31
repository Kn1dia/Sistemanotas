import React, { useEffect } from 'react';
import { ArrowLeft, TrendingUp, DollarSign } from 'lucide-react';

const CategoryDetailsDrawer = ({ 
  isOpen, 
  onClose, 
  category = null,
  total = 0,
  percentual = 0
}) => {
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

  if (!isOpen || !category) return null;

  return (
    <div 
      className="fixed inset-0 z-50"
      onClick={handleBackdropClick}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      
      {/* Drawer Container - Mobile-first */}
      <div 
        className={`
          absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl
          transform transition-transform duration-300 ease-out
          max-h-[70vh] overflow-hidden
          ${isOpen ? 'translate-y-0' : 'translate-y-full'}
        `}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle para drag (mobile) */}
        <div className="flex justify-center pt-2 pb-1">
          <div className="w-12 h-1 bg-gray-300 rounded-full"></div>
        </div>

        {/* Header Roxo */}
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={onClose}
              className="p-2 -ml-2 rounded-lg hover:bg-purple-500/20 transition-colors"
              aria-label="Voltar"
            >
              <ArrowLeft className="w-6 h-6 text-white" />
            </button>
            
            <h2 className="text-xl font-bold text-white flex-1 text-center mr-8">
              {category}
            </h2>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Valor Principal */}
          <div className="text-center">
            <p className="text-gray-600 text-sm mb-2">Total gasto</p>
            <div className="flex items-center justify-center text-purple-700 font-bold text-3xl">
              <DollarSign className="w-8 h-8 mr-2" />
              <span>
                {total.toLocaleString('pt-BR', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                })}
              </span>
            </div>
          </div>

          {/* Percentual */}
          <div className="bg-purple-50 rounded-xl p-4 border border-purple-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-purple-600" />
                <span className="text-purple-900 font-medium">Representa</span>
              </div>
              <span className="text-purple-700 font-bold text-xl">
                {percentual.toFixed(1)}%
              </span>
            </div>
            <div className="mt-2">
              <div className="w-full bg-purple-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-full h-2 transition-all duration-500"
                  style={{ width: `${Math.min(percentual, 100)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Insights */}
          <div className="bg-gray-50 rounded-xl p-4">
            <h3 className="text-gray-900 font-semibold mb-2">Insights</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              {percentual > 30 
                ? `Esta categoria representa uma parte significativa dos seus gastos. Considere revisar seus hábitos de consumo em ${category.toLowerCase()}.`
                : percentual > 15
                ? `Seus gastos com ${category.toLowerCase()} estão equilibrados. Continue monitorando para manter o controle.`
                : `Seus gastos com ${category.toLowerCase()} estão dentro do esperado. Bom trabalho mantendo o equilíbrio!`
              }
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-100 px-6 py-4 bg-gray-50">
          <button
            onClick={onClose}
            className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white py-3 rounded-xl font-medium hover:from-purple-700 hover:to-purple-800 transition-colors duration-200"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};

export default CategoryDetailsDrawer;
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
      className="fixed inset-0 z-50"
      onClick={handleBackdropClick}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      
      {/* Drawer Container */}
      <div 
        className={`
          absolute right-0 top-0 h-full bg-white shadow-2xl
          transform transition-transform duration-300 ease-out
          w-full max-w-md
          ${isOpen ? 'translate-x-0' : 'translate-x-full'}
        `}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Roxo */}
        <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-purple-700 border-b border-purple-200 z-10">
          <div className="flex items-center justify-between p-4">
            <button
              onClick={onClose}
              className="p-2 -ml-2 rounded-lg hover:bg-purple-500/20 transition-colors"
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
        <div className="flex flex-col h-full bg-gradient-to-b from-purple-50 to-white">
          {/* Total Card */}
          <div className="p-4 bg-white border-b border-purple-100">
            <div className="flex items-center justify-between">
              <span className="text-purple-600 font-medium">Total da categoria</span>
              <div className="flex items-center text-green-600 font-bold text-xl">
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

          {/* Items List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {items.length === 0 ? (
              <div className="text-center py-12">
                <Package className="w-12 h-12 text-purple-300 mx-auto mb-4" />
                <p className="text-purple-500">Nenhum item encontrado</p>
                <p className="text-purple-400 text-sm mt-2">
                  Os detalhes aparecerão aqui quando você tiver dados nesta categoria
                </p>
              </div>
            ) : (
              items.map((item, index) => (
                <div 
                  key={index}
                  className="bg-white rounded-xl p-4 border border-purple-100 hover:border-purple-200 transition-colors"
                >
                  {/* Product Name */}
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="text-purple-900 font-medium mb-1">
                        {item.nome || 'Produto sem nome'}
                      </h3>
                      
                      {/* Market */}
                      {item.mercado && (
                        <div className="flex items-center text-purple-500 text-sm">
                          <Store className="w-3 h-3 mr-1" />
                          <span className="truncate">
                            {item.mercado}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    {/* Price */}
                    <div className="flex items-center text-purple-700 font-bold ml-4">
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
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                        {item.categoria}
                      </span>
                      {item.data && (
                        <span className="text-xs text-purple-400">
                          {item.data}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Footer com insights */}
          <div className="sticky bottom-0 bg-gradient-to-r from-purple-600 to-purple-700 border-t border-purple-200 p-4">
            <div className="flex items-center justify-between text-white">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5" />
                <span className="text-sm">Insights da categoria</span>
              </div>
              <button className="bg-white/20 hover:bg-white/30 px-3 py-1 rounded-lg text-sm transition-colors">
                Ver análise
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryDetailsDrawer;
