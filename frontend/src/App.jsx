import React, { useState, useEffect } from "react";
import { Toaster, toast } from "react-hot-toast";
import { Plus } from "lucide-react";

import Header from "./components/layout/Header";
import HeroInsightCard from "./components/dashboard/HeroInsightCard";
import DashboardCards from "./components/DashboardCards";
import SpendingChart from "./components/dashboard/SpendingChart";
import PurchasesFeed from "./components/dashboard/PurchasesFeed";
import UploadModal from "./components/upload/UploadModal";
import Login from "./components/auth/Login";

import { useDashboard } from "./hooks/useDashboard";
import { useUpload } from "./hooks/useUpload";
import { apiService } from "./services/api";
import { AuthProvider, useAuth } from "./context/AuthContext";

/* =========================================================================
   1. COMPONENTE DASHBOARD (Onde vivem os Hooks pesados)
   Isolamos isso para que o React só carregue esses hooks se estiver logado.
   ========================================================================= */
function AuthenticatedDashboard() {
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const { logout } = useAuth(); // Pegamos o logout aqui

  // Hooks de Dados
  const { data, loading, error, refetch } = useDashboard();
  const {
    isUploading,
    error: uploadError,
    success,
    uploadFile,
    resetStates,
  } = useUpload();

  // Debug (Hook Seguro aqui dentro)
  useEffect(() => {
    if (data && !loading) {
      console.log("📊 Dashboard carregado:", data);
      console.log("🛒 Compras:", data?.compras?.length || 0);
    }
  }, [data, loading]);

  // Handlers
  const handleOpenUpload = () => { resetStates(); setIsUploadOpen(true); };
  const handleCloseUpload = () => { resetStates(); setIsUploadOpen(false); };
  
  const handleUploadSuccess = async () => {
    toast.success("Nota processada com sucesso!");
    await refetch();
  };

  const handleDeleteCompra = async (id) => {
    if (!window.confirm("Deseja realmente excluir esta nota?")) return;
    try {
      await apiService.deleteCompra(id);
      toast.success("Nota excluída");
    } catch (err) {
      console.error(err);
      toast.error("Erro ao excluir nota");
    } finally {
      await refetch();
    }
  };

  // Error Boundary Visual
  if (error) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <h2 className="text-xl font-semibold mb-2">Algo deu errado 😕</h2>
          <p className="text-gray-400 mb-4">{error}</p>
          <button onClick={() => window.location.reload()} className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 transition">
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  // Renderização do Dashboard
  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <Header onOpenUpload={handleOpenUpload} onLogout={logout} />

      <main className="max-w-lg mx-auto px-4 py-6 pb-24 space-y-6">
        <HeroInsightCard loading={loading} />
        
        <DashboardCards
          totalGasto={data?.totalGasto || 0}
          economiaEstimada={data?.economiaEstimada || 0}
          comprasMes={data?.comprasMes || 0}
          loading={loading}
        />
        
        <SpendingChart
          categorias={data?.categorias || []}
          compras={data?.compras || []}
          loading={loading}
        />
        
        <PurchasesFeed
          compras={data?.compras || []}
          loading={loading}
          onDelete={handleDeleteCompra}
        />
      </main>

      {/* FAB Mobile */}
      <button
        onClick={handleOpenUpload}
        className="fixed bottom-6 right-6 w-16 h-16 bg-purple-600 hover:bg-purple-700 text-white rounded-full shadow-2xl flex items-center justify-center transition-all duration-200 hover:scale-110 z-50"
      >
        <Plus className="w-8 h-8" />
      </button>

      <UploadModal
        isOpen={isUploadOpen}
        onClose={handleCloseUpload}
        onUploadSuccess={handleUploadSuccess}
        isUploading={isUploading}
        error={uploadError}
        success={success}
        uploadFile={uploadFile}
        resetStates={resetStates}
      />
      
      <Toaster position="top-right" toastOptions={{ style: { background: "#1f2933", color: "#fff" }}} />
    </div>
  );
}

/* =========================================================================
   2. ROTEAMENTO (O Guarda de Trânsito)
   Ele decide se mostra Login ou Dashboard, SEM Hooks complicados.
   ========================================================================= */
function AppContent() {
  const { user } = useAuth(); // Único Hook aqui

  if (!user) {
    return <Login />;
  }

  return <AuthenticatedDashboard />;
}

/* =========================================================================
   3. APP PRINCIPAL
   ========================================================================= */
function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;