import React, { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import CategoryDetailsDrawer from './CategoryDetailsDrawer';

const SpendingChart = ({ data = [], purchasesData = [] }) => {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedCategoryItems, setSelectedCategoryItems] = useState([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Se não tiver dados, mostra um estado vazio para não quebrar o gráfico
  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-purple-100 p-6 flex items-center justify-center" style={{ minHeight: '400px' }}>
        <p className="text-gray-500">Sem dados para exibir no gráfico.</p>
      </div>
    );
  }

  const handlePieClick = (entry) => {
    if (!purchasesData || !entry) return;

    const categoryName = entry.name.toLowerCase();

    const items = purchasesData.flatMap(purchase => {
      const purchaseItems = purchase.itens || [];
      const matchingItems = purchaseItems.filter(item => {
        const itemCategory = item.categoria ? item.categoria.toLowerCase() : 'outros';
        return itemCategory === categoryName ||
               itemCategory.includes(categoryName) ||
               categoryName.includes(itemCategory);
      }).map(item => ({
        ...item,
        mercado: purchase.mercado,
        data: purchase.data
      }));
      
      if (matchingItems.length === 0 && (purchase.categoria || 'outros').toLowerCase() === categoryName) {
         return [{
           nome: purchase.mercado || 'Compra sem detalhes',
           valor: purchase.total || 0,
           quantidade: 1,
           mercado: purchase.mercado,
           data: purchase.data,
           categoria: purchase.categoria
         }];
      }
      return matchingItems;
    });

    setSelectedCategory(entry.name);
    setSelectedCategoryItems(items);
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    setSelectedCategory(null);
    setSelectedCategoryItems([]);
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-xl shadow-lg border border-purple-100">
          <p className="text-purple-900 font-medium">{payload[0].name}</p>
          <p className="text-green-600 font-bold">
            R$ {payload[0].value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </div>
      );
    }
    return null;
  };

  const CustomLegend = ({ payload }) => {
    return (
      <div className="flex flex-wrap justify-center gap-4 mt-6">
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }}></div>
            <span className="text-sm text-gray-500">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-purple-100 p-6">
      <h2 className="text-xl font-bold text-purple-900 mb-6">Distribuição de Gastos</h2>
      
      {/* Container com altura FIXA e EXPLICITA para o Recharts não se perder */}
      <div style={{ width: '100%', height: 300, minHeight: 300 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
              onClick={handlePieClick}
              style={{ cursor: 'pointer' }}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend content={<CustomLegend />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4">
        {data.map((item, index) => (
          <div key={index} className="text-center p-2 rounded-lg hover:bg-purple-50 transition-colors cursor-pointer" onClick={() => handlePieClick(item)}>
            <div className="w-4 h-4 rounded-full mx-auto mb-2" style={{ backgroundColor: item.color }}></div>
            <p className="text-xs text-gray-500">{item.name}</p>
            <p className="text-sm font-bold text-purple-900">
              {((item.value / data.reduce((sum, i) => sum + i.value, 0)) * 100).toFixed(1)}%
            </p>
          </div>
        ))}
      </div>

      <CategoryDetailsDrawer
        isOpen={isDrawerOpen}
        onClose={handleCloseDrawer}
        category={selectedCategory}
        items={selectedCategoryItems}
        total={selectedCategoryItems.reduce((total, item) => total + (item.valor || item.preco || 0), 0)}
      />
    </div>
  );
};

export default SpendingChart;