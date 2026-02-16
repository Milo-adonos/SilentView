import { useState, useEffect } from 'react';
import { History, Loader2, Eye, Calendar, TrendingUp } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../lib/AuthContext';

interface AnalysisSession {
  id: string;
  target_username: string;
  social_network: 'tiktok' | 'instagram';
  context_type: string;
  prediction_value: number;
  created_at: string;
}

interface Props {
  onViewAnalysis?: (sessionId: string) => void;
}

export default function AnalysisHistory({ onViewAnalysis }: Props) {
  const { user } = useAuth();
  const [analyses, setAnalyses] = useState<AnalysisSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadAnalyses();
    }
  }, [user]);

  const loadAnalyses = async () => {
    if (!user) return;

    setLoading(true);
    const { data, error } = await supabase
      .from('analysis_sessions')
      .select('id, target_username, social_network, context_type, prediction_value, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading analyses:', error);
    } else {
      setAnalyses(data || []);
    }
    setLoading(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const getContextLabel = (type: string) => {
    const labels: Record<string, string> = {
      ex_crush: 'Ex / Crush',
      friend: 'Ami(e)',
      business: 'Professionnel',
      curiosity: 'Curiosité',
    };
    return labels[type] || type;
  };

  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-green-400';
    if (score >= 40) return 'text-orange-400';
    return 'text-red-400';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-rose-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-white">Historique des analyses</h3>
        <p className="text-slate-400 text-sm mt-1">
          Retrouvez toutes vos analyses passées
        </p>
      </div>

      {analyses.length === 0 ? (
        <div className="text-center py-12 bg-slate-800/30 rounded-xl border border-slate-700/30">
          <History className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400">Aucune analyse dans l'historique</p>
          <p className="text-slate-500 text-sm mt-1">Vos analyses apparaîtront ici</p>
        </div>
      ) : (
        <div className="space-y-3">
          {analyses.map((analysis) => (
            <div
              key={analysis.id}
              className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl border border-slate-700/50 hover:border-slate-600/50 transition-all"
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  analysis.social_network === 'tiktok' ? 'bg-slate-700' : 'bg-gradient-to-br from-pink-500 to-orange-500'
                }`}>
                  {analysis.social_network === 'tiktok' ? (
                    <span className="text-white font-bold">TT</span>
                  ) : (
                    <span className="text-white font-bold">IG</span>
                  )}
                </div>
                <div>
                  <p className="text-white font-medium">@{analysis.target_username}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-slate-400 text-sm flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatDate(analysis.created_at)}
                    </span>
                    <span className="text-slate-500 text-sm">
                      {getContextLabel(analysis.context_type)}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="flex items-center gap-1">
                    <TrendingUp className={`w-4 h-4 ${getScoreColor(analysis.prediction_value)}`} />
                    <span className={`text-lg font-bold ${getScoreColor(analysis.prediction_value)}`}>
                      {analysis.prediction_value}%
                    </span>
                  </div>
                  <span className="text-slate-500 text-xs">Score de visite</span>
                </div>
                {onViewAnalysis && (
                  <button
                    onClick={() => onViewAnalysis(analysis.id)}
                    className="p-2 text-slate-400 hover:text-rose-400 transition-colors"
                  >
                    <Eye className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
