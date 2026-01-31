import { useState, useEffect, useCallback } from 'react';
import { apiService } from '../services/api';

export function useDashboard() {
  const [data, setData] = useState({
    totalGasto: 0,
    economiaEstimada: 0,
    comprasMes: 0,
    categorias: [],
    compras: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiService.getDashboard();
      
      // 🔍 DEBUG: Payload bruto do backend
      console.log("📦 PAYLOAD BRUTO:", result);
      
      // 🧠 Adapter Corrigido - Verificação segura de dados
      const feedSource = result.compras || result.feed || [];
      console.log("📋 FEED SOURCE:", feedSource);
      
      setData({
        totalGasto: result.totalGasto || 0,
        economiaEstimada: result.economiaEstimada || 0,
        comprasMes: result.comprasMes || 0,
        
        // 🧠 Adapter Obrigatório - Mapeamento Explícito
        categorias: result.grafico?.map(item => ({
          name: item.name || 'Outros',
          value: item.value || 0,
          color: item.color || '#8B5CF6'
        })) || [],

        compras: feedSource.map(item => ({
          id: item.id,
          mercado: item.mercado || "Mercado Desconhecido",
          data: item.data,
          total: Number(item.total || 0),
          categoria: item.categoria,
          itens: item.itens || []
        }))
      });
      
      console.log("✅ DADOS PROCESSADOS:", {
        totalGasto: result.totalGasto,
        comprasCount: feedSource.length,
        categoriasCount: result.grafico?.length || 0
      });
      
    } catch (err) {
      console.error("❌ ERRO NA API:", err);
      setError('Não foi possível conectar ao servidor.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  return { data, loading, error, refetch: fetchDashboard };
}