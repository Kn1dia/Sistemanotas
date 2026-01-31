import React, { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import CategoryDetailsDrawer from './CategoryDetailsDrawer';

const SpendingChart = ({ categorias = [], compras = [], loading = false }) => {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Loading state - Skeleton circular
  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-purple-100 p-6">
        <div className="mb-6">
          <div className="h-6 bg-gray-200 rounded w-32 mb-2 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-48 animate-pulse"></div>
        </div>
        
        {/* Skeleton do gráfico */}
        <div className="h-64 w-full flex items-center justify-center">
          <div className="relative">
            <div className="w-40 h-40 rounded-full border-8 border-gray-200 animate-pulse"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-20 h-20 bg-gray-200 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
        
        {/* Skeleton das legendas */}
        <div className="mt-6 grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-3 bg-gray-200 rounded w-16 animate-pulse"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Empty state
  if (!categorias || categorias.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-purple-100 p-6">
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhum dado encontrado</h3>
          <p className="text-gray-600 text-sm">
            Faça upload de suas notas fiscais para ver seus gastos por categoria
          </p>
        </div>
      </div>
    );
  }

  // Calcular total geral para percentuais
  const totalGeral = categorias.reduce((sum, cat) => sum + (cat.value || 0), 0);

  const handlePieClick = (clickedData) => {
    if (clickedData && clickedData.name) {
      console.log('🔍 Categoria clicada:', clickedData.name);
      console.log('📦 Compras disponíveis:', compras);
      
      // ✅ CORRETO: Extrai PRODUTOS individuais de cada nota
     const categoryItems = compras
  .flatMap(purchase => {
    console.log('🔍 Purchase:', purchase);
    console.log('🔍 Purchase.itens:', purchase.itens);
    
    if (!purchase.itens || !Array.isArray(purchase.itens)) {
      console.warn('⚠️ Itens não é array:', purchase);
      return [];
    }
    
    return purchase.itens
      .filter(item => {
        const match = item.categoria?.toLowerCase() === clickedData.name?.toLowerCase();
        console.log(`🎯 ${item.nome}: ${item.categoria} === ${clickedData.name}? ${match}`);
        return match;
      })
      .map(item => ({
        nome: item.nome,
        valor: item.valor,
        quantidade: item.quantidade,
        mercado: purchase.mercado,
        data: purchase.data
      }));
  });

console.log('✅ Total de produtos encontrados:', categoryItems.length);
      setSelectedCategory({
        name: clickedData.name,
        value: clickedData.value || 0,
        percentual: totalGeral > 0 ? (clickedData.value / totalGeral) * 100 : 0,
        items: categoryItems
      });
      setIsDrawerOpen(true);
    }
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    setSelectedCategory(null);
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const percentual = totalGeral > 0 ? (payload[0].value / totalGeral) * 100 : 0;
      return (
        <div className="bg-white p-4 rounded-xl shadow-xl border border-purple-100 backdrop-blur-sm">
          <p className="text-purple-900 font-semibold mb-1">{payload[0].name}</p>
          <p className="text-purple-600 font-bold text-lg">
            R$ {payload[0].value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-purple-500 text-sm">
            {percentual.toFixed(1)}% do total
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-purple-100 p-6 hover:shadow-xl transition-shadow duration-300">
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-xl font-bold text-purple-900 mb-2 tracking-tight">Distribuição de Gastos</h3>
        <p className="text-purple-600 text-sm">Clique em uma categoria para ver detalhes</p>
      </div>

      {/* Gráfico */}
      <div className="w-full h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={categorias}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={85}
              fill="#8884d8"
              dataKey="value"
              animationBegin={0}
              animationDuration={1000}
              onClick={handlePieClick}
              style={{ cursor: 'pointer' }}
            >
              {categorias.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.color || '#8B5CF6'}
                  className="hover:opacity-80 transition-opacity duration-200"
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Legenda - Mobile Compacta */}
      <div className="mt-4 space-y-1">
        {categorias.map((item, index) => (
          <div 
            key={index}
            className="flex items-center justify-between p-2 rounded-lg hover:bg-purple-50 transition-colors duration-200 cursor-pointer"
            onClick={() => handlePieClick(item)}
          >
            <div className="flex items-center space-x-2">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: item.color || '#8B5CF6' }}
              />
              <span className="text-sm text-gray-700 truncate max-w-[120px]">{item.name}</span>
            </div>
            <span className="text-sm font-semibold text-gray-900">
              R$ {Number(item.value || 0).toFixed(2)}
            </span>
          </div>
        ))}
      </div>

      {/* Category Details Drawer */}
      <CategoryDetailsDrawer
        isOpen={isDrawerOpen}
        onClose={handleCloseDrawer}
        category={selectedCategory?.name}
        total={selectedCategory?.value || 0}
        percentual={selectedCategory?.percentual || 0}
        items={selectedCategory?.items || []}
      />
    </div>
  );
};

export default SpendingChart;