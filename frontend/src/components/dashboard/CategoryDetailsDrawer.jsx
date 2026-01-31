import React, { useEffect } from 'react';
import { ArrowLeft, TrendingUp, DollarSign, Package, Store } from 'lucide-react';

const CategoryDetailsDrawer = ({ 
  isOpen, 
  onClose, 
  category = null,
  total = 0,
  percentual = 0,
  items = []
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

          {/* Itens da Categoria */}
          <div className="space-y-3">
            <h3 className="text-gray-900 font-semibold flex items-center space-x-2">
              <Package className="w-5 h-5 text-purple-600" />
              <span>Notas Fiscais ({items.length})</span>
            </h3>
            
            {items && items.length > 0 ? (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {items.map((item, index) => (
                  <div 
                    key={item.id || index}
                    className="bg-gray-50 rounded-lg p-3 border border-gray-200 hover:border-purple-200 transition-colors duration-200"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h4 className="text-gray-900 font-medium text-sm truncate">
                          {item.nome || 'Nota Fiscal'}
                        </h4>
                        {item.mercado && (
                          <p className="text-gray-500 text-xs mt-1 flex items-center space-x-1">
                            <Store className="w-3 h-3" />
                            <span>{item.mercado}</span>
                          </p>
                        )}
                        {item.data && (
                          <p className="text-gray-500 text-xs mt-1">
                            Data: {new Date(item.data).toLocaleDateString('pt-BR')}
                          </p>
                        )}
                      </div>
                      <div className="text-right ml-3">
                        <p className="text-purple-700 font-semibold text-sm">
                          R$ {(item.valor || 0).toLocaleString('pt-BR', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
                <Package className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500 text-sm">
                  Nenhuma nota fiscal encontrada para esta categoria
                </p>
              </div>
            )}
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
