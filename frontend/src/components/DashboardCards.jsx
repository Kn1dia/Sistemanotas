import React from 'react';
import { Wallet, TrendingUp, ShoppingBag } from 'lucide-react';

const DashboardCards = ({ totalGasto = 0, economiaEstimada = 0, comprasMes = 0, loading = false }) => {
  
  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-3 animate-pulse">
        <div className="h-28 bg-slate-800 rounded-xl"></div>
        <div className="h-28 bg-slate-800 rounded-xl"></div>
      </div>
    );
  }

  // Formatar valor para mobile: R$ 88,<small>50</small>
  const formatarValor = (valor) => {
    const [reais, centavos] = Number(valor).toFixed(2).split('.');
    return (
      <>
        R$ {reais}<span className="text-lg text-gray-400">.{centavos}</span>
      </>
    );
  };

  return (
    <div className="grid grid-cols-2 gap-3 mb-6">
      
      {/* Card 1: Total Gasto */}
      <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 shadow-lg relative overflow-hidden flex flex-col">
        <div className="absolute top-0 right-0 p-2 opacity-10">
          <Wallet className="w-12 h-12 text-purple-500" />
        </div>
        <p className="text-gray-400 text-xs font-medium uppercase tracking-wider mb-2">Total Gasto</p>
        <h3 className="text-2xl sm:text-3xl font-bold text-white leading-tight flex-1 flex items-center">
          {formatarValor(totalGasto)}
        </h3>
        <p className="text-xs text-purple-400 mt-2 flex items-center">
          <ShoppingBag className="w-3 h-3 mr-1" />
          {comprasMes} {comprasMes === 1 ? 'compra' : 'compras'}
        </p>
      </div>

      {/* Card 2: Economia */}
      <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 shadow-lg relative overflow-hidden flex flex-col">
        <div className="absolute top-0 right-0 p-2 opacity-10">
          <TrendingUp className="w-12 h-12 text-green-500" />
        </div>
        <p className="text-gray-400 text-xs font-medium uppercase tracking-wider mb-2">Economia</p>
        <h3 className="text-2xl sm:text-3xl font-bold text-emerald-400 leading-tight flex-1 flex items-center">
          {formatarValor(economiaEstimada)}
        </h3>
        <p className="text-xs text-green-500/70 mt-2">
          Estimada no mês
        </p>
      </div>
    </div>
  );
};

export default DashboardCards;