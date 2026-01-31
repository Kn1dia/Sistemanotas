import React, { useState } from 'react';
import { Receipt, Calendar, ChevronRight, Trash2, Store } from 'lucide-react';
import CategoryDetailsDrawer from './CategoryDetailsDrawer';

const PurchasesFeed = ({ compras = [], onDelete, loading }) => {
  // Estado para guardar qual compra foi clicada
  const [selectedPurchase, setSelectedPurchase] = useState(null);

  // Loading State
  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-slate-800/50 h-20 rounded-2xl animate-pulse"></div>
        ))}
      </div>
    );
  }

  // Empty State
  if (!compras || compras.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-8 text-center border border-purple-100 shadow-sm">
        <div className="flex justify-center mb-4">
          <div className="bg-purple-100 p-4 rounded-full">
            <Receipt className="w-8 h-8 text-purple-500" />
          </div>
        </div>
        <h3 className="text-purple-900 font-semibold mb-2">Histórico vazio</h3>
        <p className="text-gray-500 text-sm">
          Suas compras processadas aparecerão aqui.
        </p>
      </div>
    );
  }

  // Função para pegar ícone baseado no nome do mercado ou categoria
  const getIcon = (compra) => {
    return '🛒'; // Ícone padrão de carrinho
  };

  return (
    <>
      <div className="space-y-4 pb-4">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-lg font-bold text-white">Últimas Compras</h2>
          <span className="text-xs text-gray-400 bg-slate-800 px-2 py-1 rounded-lg border border-slate-700">
            {compras.length} notas
          </span>
        </div>

        <div className="space-y-3">
          {compras.map((compra) => (
            <div 
              key={compra.id}
              onClick={() => setSelectedPurchase(compra)} // 🖱️ AQUI ACONTECE O CLIQUE
              className="bg-white rounded-2xl p-4 shadow-sm border border-purple-100 active:scale-[0.98] transition-transform cursor-pointer relative group hover:border-purple-300"
            >
              <div className="flex items-center justify-between">
                
                {/* Lado Esquerdo: Ícone + Info */}
                <div className="flex items-center space-x-3 overflow-hidden">
                  <div className="w-12 h-12 rounded-full bg-purple-50 flex items-center justify-center text-xl shrink-0 border border-purple-100">
                    {getIcon(compra)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-purple-900 truncate text-sm sm:text-base">
                      {compra.mercado || 'Mercado Desconhecido'}
                    </h4>
                    <div className="flex items-center text-xs text-gray-500 mt-1 space-x-2">
                      <span className="flex items-center">
                        <Calendar className="w-3 h-3 mr-1 text-purple-400" />
                        {compra.data}
                      </span>
                      {/* Badge de quantidade de itens */}
                      {compra.itens && compra.itens.length > 0 && (
                        <span className="bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded text-[10px] font-medium border border-purple-200">
                          {compra.itens.length} itens
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Lado Direito: Valor + Seta */}
                <div className="flex items-center space-x-2 shrink-0">
                  <div className="text-right">
                    <span className="block font-bold text-purple-900 text-base">
                      R$ {Number(compra.total).toFixed(2).replace('.', ',')}
                    </span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-purple-500 transition-colors" />
                </div>
              </div>

              {/* Botão de Excluir (Discreto) */}
              <button 
                onClick={(e) => {
                  e.stopPropagation(); // Impede abrir a gaveta ao clicar no lixo
                  onDelete(compra.id);
                }}
                className="absolute top-0 right-0 p-3 text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                title="Excluir nota"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 🚀 A MÁGICA ACONTECE AQUI:
         Reutilizamos seu Drawer Roxo para mostrar os detalhes da nota clicada!
      */}
      <CategoryDetailsDrawer
        isOpen={!!selectedPurchase}
        onClose={() => setSelectedPurchase(null)}
        category={selectedPurchase?.mercado} // Título vira o nome do Mercado
        items={selectedPurchase?.itens || []} // Passamos os itens da nota
        total={selectedPurchase?.total} // Total da nota
        percentual={0} // Passamos 0 pois é uma nota individual (esconde a barra de progresso se tiver lógica para isso)
      />
    </>
  );
};

export default PurchasesFeed;