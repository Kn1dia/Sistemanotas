import Header from './components/layout/Header';
import HeroInsightCard from './components/dashboard/HeroInsightCard';

function App() {
  return (
    <div className="min-h-screen bg-brand-dark text-white">
      <Header />

      <main className="mx-auto max-w-md px-4 py-6">
        <HeroInsightCard />
      </main>
    </div>
  );
}

export default App;
