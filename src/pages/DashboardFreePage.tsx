import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import ResultsPreview from '../components/results/ResultsPreview';
import AuthModal from '../components/auth/AuthModal';
import { GeneratedSignals } from '../lib/signalGenerator';
import { redirectToUnlockCheckout, checkPaymentCancelled, clearPaymentParams } from '../lib/stripe';
import { useAuth } from '../lib/AuthContext';
import { ArrowLeft, Search, CreditCard, Loader2, AlertCircle } from 'lucide-react';
import { User } from '@supabase/supabase-js';

interface LocationState {
  targetUsername: string;
  ownUsername: string;
  generatedSignals: GeneratedSignals;
}

const STORAGE_KEY = 'silentview_analysis_data';

export default function DashboardFreePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [analysisData, setAnalysisData] = useState<LocationState | null>(null);

  // Get data from navigation state or sessionStorage
  useEffect(() => {
    const state = location.state as LocationState | null;
    
    if (state?.generatedSignals) {
      // Save to sessionStorage for persistence
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      setAnalysisData(state);
    } else {
      // Try to load from sessionStorage
      const savedData = sessionStorage.getItem(STORAGE_KEY);
      if (savedData) {
        try {
          const parsed = JSON.parse(savedData) as LocationState;
          if (parsed.generatedSignals) {
            setAnalysisData(parsed);
          }
        } catch (e) {
          console.error('Failed to parse saved analysis data:', e);
        }
      }
    }
  }, [location.state]);

  // Check for cancelled payment
  useEffect(() => {
    if (checkPaymentCancelled()) {
      setPaymentError('Le paiement a été annulé. Vous pouvez réessayer.');
      clearPaymentParams();
    }
  }, []);

  const handleUnlockClick = () => {
    setPaymentError(null);
    
    // If user is already logged in, go directly to payment
    if (user) {
      handlePayment(user);
    } else {
      // Show auth modal first
      setShowAuthModal(true);
    }
  };

  const handleAuthSuccess = async (authenticatedUser: User) => {
    setShowAuthModal(false);
    // After successful auth, redirect to payment with the user data directly
    handlePayment(authenticatedUser);
  };

  const handlePayment = async (payingUser: User) => {
    if (!payingUser) {
      setPaymentError('Vous devez être connecté pour continuer');
      return;
    }

    setIsProcessingPayment(true);
    setPaymentError(null);

    try {
      await redirectToUnlockCheckout(payingUser.id, payingUser.email || '');
      // The function will redirect, so we won't reach here unless there's an error
    } catch (error) {
      console.error('Payment error:', error);
      setPaymentError('Une erreur est survenue lors de la redirection vers le paiement. Veuillez réessayer.');
      setIsProcessingPayment(false);
    }
  };

  const handleStartAnalysis = () => {
    navigate('/analysis');
  };

  // Show empty state if no data
  if (!analysisData) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center">
          <div className="bg-slate-800/60 backdrop-blur-xl rounded-3xl border border-slate-700/50 p-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-rose-500/20 to-orange-500/20 flex items-center justify-center mx-auto mb-6">
              <Search className="w-8 h-8 text-rose-400" />
            </div>
            
            <h2 className="text-2xl font-bold text-white mb-3">
              Aucune analyse en cours
            </h2>
            <p className="text-slate-400 mb-6">
              Lancez une analyse pour voir les résultats ici
            </p>
            
            <button
              onClick={handleStartAnalysis}
              className="w-full py-3 px-6 rounded-xl bg-gradient-to-r from-rose-500 to-orange-500 text-white font-semibold hover:opacity-90 transition-opacity"
            >
              Lancer une analyse
            </button>
            
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

  // Processing payment state
  if (isProcessingPayment) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-6">
        <div className="max-w-md w-full">
          <div className="bg-slate-800/60 backdrop-blur-xl rounded-3xl border border-rose-500/30 p-8 text-center">
            <div className="relative w-20 h-20 mx-auto mb-6">
              <div className="absolute inset-0 bg-gradient-to-br from-rose-500/20 to-orange-500/20 rounded-2xl blur-xl animate-pulse" />
              <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-rose-500 to-orange-500 flex items-center justify-center">
                <CreditCard className="w-10 h-10 text-white" />
              </div>
            </div>

            <h2 className="text-2xl font-bold text-white mb-2">Redirection vers le paiement...</h2>
            <p className="text-slate-400 mb-6">Vous allez être redirigé vers notre plateforme de paiement sécurisée</p>

            <div className="flex justify-center mb-6">
              <Loader2 className="w-8 h-8 text-rose-400 animate-spin" />
            </div>

            <div className="flex items-center justify-center gap-2 text-slate-500 text-sm">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <span>Paiement sécurisé par Stripe</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Payment error banner */}
      {paymentError && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 max-w-md w-full mx-4">
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-red-300 text-sm">{paymentError}</p>
            </div>
            <button 
              onClick={() => setPaymentError(null)}
              className="text-red-400 hover:text-red-300"
            >
              ×
            </button>
          </div>
        </div>
      )}

      <ResultsPreview
        targetUsername={analysisData.targetUsername}
        ownUsername={analysisData.ownUsername}
        generatedSignals={analysisData.generatedSignals}
        onUnlock={handleUnlockClick}
      />
      
      {showAuthModal && (
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          onSuccess={handleAuthSuccess}
          initialMode="signup"
        />
      )}
    </div>
  );
}
