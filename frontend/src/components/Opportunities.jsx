import React from 'react';
import { TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';

const Opportunities = ({ opportunities = [], ultimaNota = null }) => {
  const comparativo = ultimaNota?.comparativo || {
    mensagem: "Nenhuma análise disponível",
    status: "neutro"
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'bom':
        return <CheckCircle className="w-5 h-5 text-brand-green" />;
      case 'ruim':
        return <AlertCircle className="w-5 h-5 text-red-400" />;
      default:
        return <TrendingUp className="w-5 h-5 text-yellow-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'bom':
        return 'border-brand-green bg-brand-green/10';
      case 'ruim':
        return 'border-red-400 bg-red-400/10';
      default:
        return 'border-yellow-400 bg-yellow-400/10';
    }
  };

  

  return (
    <div className="space-y-6">
      {/* Card Principal - Comparativo da Última Compra */}
      <div className={`card border-2 ${getStatusColor(comparativo.status)}`}>
        <div className="flex items-start space-x-4">
          <div className="p-3 rounded-xl bg-white/10">
            {getStatusIcon(comparativo.status)}
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-white mb-2">
              Inteligência de Preços
            </h3>
            <p className="text-gray-300 mb-3">
              {comparativo.mensagem}
            </p>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">
                Baseado em sua última compra: {ultimaNota?.mercado || 'N/A'}
              </span>
              <button className="text-brand-green hover:text-brand-green/80 text-sm font-medium transition-colors">
                Ver detalhes →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de Oportunidades */}
      <div>
        <h2 className="text-xl font-bold text-white mb-4">Oportunidades na Região</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {opportunities.map((opportunity, index) => (
            <div key={index} className="card hover:shadow-xl transition-all duration-300 hover:scale-105">
              <div className="flex items-start justify-between mb-3">
                <div className="p-2 rounded-lg bg-white/10">
                  {getStatusIcon(opportunity.status)}
                </div>
                <span className={`font-bold ${
                  opportunity.status === 'bom' ? 'text-brand-green' : 'text-red-400'
                }`}>
                  {opportunity.economia}
                </span>
              </div>
              <h4 className="font-semibold text-white mb-2">
                {opportunity.title}
              </h4>
              <p className="text-sm text-gray-400 mb-3">
                {opportunity.description}
              </p>
              <button className="text-brand-purple hover:text-brand-purple/80 text-sm font-medium transition-colors">
                Ver oferta →
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Opportunities;
