import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import FullResults from '../components/results/FullResults';
import { GeneratedSignals } from '../lib/signalGenerator';
import { checkPaymentSuccess, clearPaymentParams } from '../lib/stripe';
import { ArrowLeft, Lock, CheckCircle2, Sparkles } from 'lucide-react';

interface LocationState {
  targetUsername: string;
  ownUsername: string;
  generatedSignals: GeneratedSignals;
}

const STORAGE_KEY = 'silentview_analysis_data';
const UNLOCKED_KEY = 'silentview_unlocked';

export default function DashboardUnlockedPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [analysisData, setAnalysisData] = useState<LocationState | null>(null);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  // Get data from navigation state or sessionStorage
  useEffect(() => {
    const state = location.state as LocationState | null;
    
    // Check if returning from successful Stripe payment
    if (checkPaymentSuccess()) {
      // Mark as unlocked
      sessionStorage.setItem(UNLOCKED_KEY, 'true');
      setIsUnlocked(true);
      setShowSuccessMessage(true);
      clearPaymentParams();
      
      // Hide success message after 5 seconds
      setTimeout(() => setShowSuccessMessage(false), 5000);
    }
    
    if (state?.generatedSignals) {
      // Coming with state data
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      setAnalysisData(state);
      
      // Check if unlocked
      const wasUnlocked = sessionStorage.getItem(UNLOCKED_KEY) === 'true';
      setIsUnlocked(wasUnlocked);
    } else {
      // Try to load from sessionStorage
      const savedData = sessionStorage.getItem(STORAGE_KEY);
      const wasUnlocked = sessionStorage.getItem(UNLOCKED_KEY) === 'true';
      
      if (savedData) {
        try {
          const parsed = JSON.parse(savedData) as LocationState;
          if (parsed.generatedSignals) {
            setAnalysisData(parsed);
            setIsUnlocked(wasUnlocked);
          }
        } catch (e) {
          console.error('Failed to parse saved analysis data:', e);
        }
      }
    }
  }, [location.state]);

  const handleNewAnalysis = () => {
    // Clear storage for new analysis
    sessionStorage.removeItem(STORAGE_KEY);
    sessionStorage.removeItem(UNLOCKED_KEY);
    navigate('/analysis');
  };

  const handleStartAnalysis = () => {
    navigate('/analysis');
  };

  const handleGoToPayment = () => {
    navigate('/dashboardfree');
  };

  // Show empty state if no data or not unlocked
  if (!analysisData || !isUnlocked) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center">
          <div className="bg-slate-800/60 backdrop-blur-xl rounded-3xl border border-slate-700/50 p-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-rose-500/20 to-orange-500/20 flex items-center justify-center mx-auto mb-6">
              <Lock className="w-8 h-8 text-rose-400" />
            </div>
            
            <h2 className="text-2xl font-bold text-white mb-3">
              Analyse non débloquée
            </h2>
            <p className="text-slate-400 mb-6">
              {analysisData 
                ? "Vous devez effectuer le paiement pour accéder aux résultats complets"
                : "Vous devez d'abord lancer une analyse et effectuer le paiement pour accéder aux résultats complets"
              }
            </p>
            
            {analysisData ? (
              <button
                onClick={handleGoToPayment}
                className="w-full py-3 px-6 rounded-xl bg-gradient-to-r from-rose-500 to-orange-500 text-white font-semibold hover:opacity-90 transition-opacity"
              >
                Débloquer l'analyse - 6,99€
              </button>
            ) : (
              <button
                onClick={handleStartAnalysis}
                className="w-full py-3 px-6 rounded-xl bg-gradient-to-r from-rose-500 to-orange-500 text-white font-semibold hover:opacity-90 transition-opacity"
              >
                Lancer une analyse
              </button>
            )}
            
            <button
              onClick={() => navigate('/landing')}
              className="flex items-center justify-center gap-2 w-full mt-4 py-3 px-6 text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Retour à l'accueil
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Payment success message */}
      {showSuccessMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 max-w-md w-full mx-4 animate-fade-in">
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            </div>
            <div className="flex-1">
              <p className="text-emerald-300 font-medium">Paiement réussi !</p>
              <p className="text-emerald-400/70 text-sm">Votre analyse est maintenant débloquée</p>
            </div>
            <Sparkles className="w-5 h-5 text-emerald-400 animate-pulse" />
          </div>
        </div>
      )}

      <FullResults
        targetUsername={analysisData.targetUsername}
        ownUsername={analysisData.ownUsername}
        generatedSignals={analysisData.generatedSignals}
        onBack={handleNewAnalysis}
      />
    </div>
  );
}
