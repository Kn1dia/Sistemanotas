// Dados mock para fallback quando o backend não está disponível
export const mockDashboardData = {
  totalGasto: 1250.75,
  economiaEstimada: 180.50,
  comprasMes: 8,
  grafico: [
    { name: 'Alimentos', value: 450.30, color: '#8B5CF6' },
    { name: 'Bebidas', value: 220.15, color: '#3B82F6' },
    { name: 'Limpeza', value: 180.90, color: '#10B981' },
    { name: 'Higiene', value: 150.20, color: '#F59E0B' },
    { name: 'Outros', value: 249.20, color: '#6B7280' }
  ],
  compras: [
    {
      id: 1,
      mercado: 'Supermercado ABC',
      data: '25/01/2026',
      total: 245.80,
      categoria: 'Alimentos',
      itens: [
        { nome: 'Arroz 5kg', quantidade: 2, preco: 25.90 },
        { nome: 'Feijão 1kg', quantidade: 3, preco: 8.50 },
        { nome: 'Óleo de Soja', quantidade: 1, preco: 12.90 }
      ]
    },
    {
      id: 2,
      mercado: 'Mercado Central',
      data: '24/01/2026',
      total: 189.50,
      categoria: 'Bebidas',
      itens: [
        { nome: 'Refrigerante 2L', quantidade: 4, preco: 8.90 },
        { nome: 'Água Mineral 20L', quantidade: 2, preco: 15.00 }
      ]
    },
    {
      id: 3,
      mercado: 'Loja de Limpeza',
      data: '23/01/2026',
      total: 156.75,
      categoria: 'Limpeza',
      itens: [
        { nome: 'Detergente', quantidade: 3, preco: 4.50 },
        { nome: 'Sabão em Pó', quantidade: 2, preco: 18.90 }
      ]
    },
    {
      id: 4,
      mercado: 'Farmácia',
      data: '22/01/2026',
      total: 98.30,
      categoria: 'Higiene',
      itens: [
        { nome: 'Shampoo', quantidade: 1, preco: 25.90 },
        { nome: 'Sabonete', quantidade: 4, preco: 3.50 }
      ]
    },
    {
      id: 5,
      mercado: 'Atacadão',
      data: '21/01/2026',
      total: 560.40,
      categoria: 'Alimentos',
      itens: [
        { nome: 'Carne Bovina', quantidade: 5, preco: 89.90 },
        { nome: 'Frango Congelado', quantidade: 3, preco: 35.00 }
      ]
    }
  ],
  feed: [] // Legacy key
};
