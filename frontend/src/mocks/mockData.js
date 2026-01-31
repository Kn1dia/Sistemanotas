export const mockNotaFiscal = {
  mercado: "SUPERMERCADO MODELO S.A.",
  data: "30/01/2026",
  total_nota: 154.50,
  itens: [
    { nome: "Arroz Branco 5kg", preco_total: 28.90, categoria: "alimentos" },
    { nome: "Detergente Ypê", preco_total: 2.99, categoria: "limpeza" },
    { nome: "Cerveja Heineken", preco_total: 45.00, categoria: "bebidas" }
  ],
  comparativo: {
    mensagem: "Você pagou 10% mais barato que a média da região!",
    status: "bom"
  }
};

export const mockChartData = [
  { name: "Alimentos", value: 400, color: "#10b981" },
  { name: "Limpeza", value: 150, color: "#8b5cf6" },
  { name: "Bebidas", value: 300, color: "#f59e0b" },
  { name: "Outros", value: 100, color: "#6b7280" }
];

export const mockPurchases = [
  {
    id: 1,
    mercado: "SUPERMERCADO MODELO S.A.",
    data: "30/01/2026",
    total: 154.50,
    categoria: "alimentos"
  },
  {
    id: 2,
    mercado: "CARREFOUR EXPRESS",
    data: "28/01/2026", 
    total: 89.90,
    categoria: "bebidas"
  },
  {
    id: 3,
    mercado: "ATACADÃO",
    data: "25/01/2026",
    total: 342.75,
    categoria: "alimentos"
  },
  {
    id: 4,
    mercado: "DROGARIA SÃO PAULO",
    data: "22/01/2026",
    total: 67.80,
    categoria: "limpeza"
  }
];

export const mockDashboardData = {
  totalGasto: 1254.80,
  economiaEstimada: 156.20,
  comprasMes: 12
};
