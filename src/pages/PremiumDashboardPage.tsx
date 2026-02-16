import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, History, PlusCircle, LogOut, Sparkles, User } from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import AlertsManager from '../components/premium/AlertsManager';
import AnalysisHistory from '../components/premium/AnalysisHistory';

type Tab = 'alerts' | 'history';

export default function PremiumDashboardPage() {
  const navigate = useNavigate();
  const { user, isPremium, loading, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('alerts');

  // Redirect if not premium
  useEffect(() => {
    if (!loading && (!user || !isPremium)) {
      navigate('/landing');
    }
  }, [user, isPremium, loading, navigate]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/landing');
  };

  const handleNewAnalysis = () => {
    navigate('/analysis');
  };

  // Show loading while checking auth
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-rose-500/30 border-t-rose-500 rounded-full animate-spin" />
      </div>
    );
  }

  // Don't render if not authenticated/premium
  if (!user || !isPremium) {
    return null;
  }

  const tabs = [
    { id: 'alerts' as Tab, label: 'Alertes', icon: Bell },
    { id: 'history' as Tab, label: 'Historique', icon: History },
  ];

  return (
    <div className="min-h-screen bg-slate-950">
      <header className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur-xl border-b border-slate-800">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src="/silentview-logo.png"
                alt="SilentView"
                className="h-10 w-auto"
              />
              <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gradient-to-r from-rose-500/20 to-orange-500/20 border border-rose-500/30">
                <Sparkles className="w-3.5 h-3.5 text-rose-400" />
                <span className="text-rose-300 text-xs font-medium">Premium</span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-slate-400">
                <User className="w-4 h-4" />
                <span className="text-sm hidden sm:inline">{user?.email}</span>
              </div>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 px-3 py-2 text-slate-400 hover:text-white transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm hidden sm:inline">Déconnexion</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white mb-2">Tableau de bord Premium</h1>
          <p className="text-slate-400">Gérez vos alertes et consultez votre historique d'analyses</p>
        </div>

        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-rose-500 to-orange-500 text-white shadow-lg shadow-rose-500/25'
                  : 'bg-slate-800/50 text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
          <button
            onClick={handleNewAnalysis}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all whitespace-nowrap bg-slate-800/50 text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <PlusCircle className="w-4 h-4" />
            Nouvelle analyse
          </button>
        </div>

        <div className="bg-slate-900/50 rounded-2xl border border-slate-800 p-6">
          {activeTab === 'alerts' && <AlertsManager />}
          {activeTab === 'history' && <AnalysisHistory />}
        </div>
      </main>
    </div>
  );
}
