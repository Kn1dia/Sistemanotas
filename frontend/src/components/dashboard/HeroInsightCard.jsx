import React from 'react';
import { Lightbulb, Sparkles } from 'lucide-react';

const HeroInsightCard = ({ loading, isAd = false }) => {
  // Frases aleatórias para dar vida (futuramente virão do backend/ads)
  const insights = [
    "Registrar suas compras ajuda a entender seus hábitos.",
    "Que tal definir uma meta de gastos para o próximo mês?",
    "Você sabia que comprar no atacado pode gerar 20% de economia?",
    "Identificamos uma oportunidade de economia em 'Bebidas'.",
  ];

  const randomInsight = insights[Math.floor(Math.random() * insights.length)];

  if (loading) {
    return (
      <div className="w-full h-24 bg-slate-800 rounded-2xl animate-pulse mb-6"></div>
    );
  }

  return (
    <div 
      className={`relative overflow-hidden rounded-2xl p-5 mb-6 shadow-lg transition-all duration-300
        ${isAd 
          ? 'bg-gradient-to-r from-amber-900/40 to-slate-900 border border-amber-500/30' 
          : 'bg-gradient-to-r from-purple-900/80 to-indigo-900/80 border border-purple-500/20'
        }
      `}
    >
      {/* Background Decorativo */}
      <div className="absolute top-0 right-0 -mt-2 -mr-2 w-24 h-24 bg-white/5 rounded-full blur-2xl"></div>

      <div className="relative z-10 flex items-start space-x-4">
        {/* Ícone */}
        <div className={`p-3 rounded-xl shrink-0 ${isAd ? 'bg-amber-500/20' : 'bg-purple-500/20'}`}>
          {isAd ? (
            <Sparkles className={`w-6 h-6 ${isAd ? 'text-amber-400' : 'text-purple-400'}`} />
          ) : (
            <Lightbulb className="w-6 h-6 text-purple-400" />
          )}
        </div>

        {/* Texto */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <h3 className={`text-sm font-bold uppercase tracking-wider ${isAd ? 'text-amber-400' : 'text-purple-300'}`}>
              {isAd ? 'Oferta Parceira' : 'Insight'}
            </h3>
            {isAd && (
              <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded border border-amber-500/20">
                Patrocinado
              </span>
            )}
          </div>
          
          <p className="text-white font-medium leading-relaxed text-sm sm:text-base">
            {randomInsight}
          </p>

          {/* Botão de Ação (Aparece se for Ad ou Dica acionável) */}
          {isAd && (
            <button className="mt-3 text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center transition-colors">
              Saber mais →
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default HeroInsightCard;