import { useState, useEffect } from 'react';
import { Bell, Plus, Trash2, Loader2, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../lib/AuthContext';

interface Alert {
  id: string;
  target_username: string;
  social_network: 'tiktok' | 'instagram';
  is_active: boolean;
  created_at: string;
}

const MAX_ALERTS = 5;

export default function AlertsManager() {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newNetwork, setNewNetwork] = useState<'tiktok' | 'instagram'>('tiktok');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadAlerts();
    }
  }, [user]);

  const loadAlerts = async () => {
    if (!user) return;

    setLoading(true);
    const { data, error } = await supabase
      .from('user_alerts')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading alerts:', error);
    } else {
      setAlerts(data || []);
    }
    setLoading(false);
  };

  const addAlert = async () => {
    if (!user || !newUsername.trim()) return;

    const cleanUsername = newUsername.trim().replace('@', '');

    if (alerts.length >= MAX_ALERTS) {
      setError(`Vous avez atteint la limite de ${MAX_ALERTS} alertes`);
      return;
    }

    const exists = alerts.some(
      a => a.target_username.toLowerCase() === cleanUsername.toLowerCase() && a.social_network === newNetwork
    );

    if (exists) {
      setError('Cette alerte existe déjà');
      return;
    }

    setAdding(true);
    setError(null);

    const { data, error } = await supabase
      .from('user_alerts')
      .insert({
        user_id: user.id,
        target_username: cleanUsername,
        social_network: newNetwork,
        is_active: true,
      })
      .select()
      .single();

    if (error) {
      setError('Erreur lors de l\'ajout de l\'alerte');
      console.error('Error adding alert:', error);
    } else if (data) {
      setAlerts([data, ...alerts]);
      setNewUsername('');
    }

    setAdding(false);
  };

  const deleteAlert = async (alertId: string) => {
    const { error } = await supabase
      .from('user_alerts')
      .delete()
      .eq('id', alertId);

    if (error) {
      console.error('Error deleting alert:', error);
    } else {
      setAlerts(alerts.filter(a => a.id !== alertId));
    }
  };

  const toggleAlert = async (alertId: string, isActive: boolean) => {
    const { error } = await supabase
      .from('user_alerts')
      .update({ is_active: !isActive })
      .eq('id', alertId);

    if (error) {
      console.error('Error toggling alert:', error);
    } else {
      setAlerts(alerts.map(a => a.id === alertId ? { ...a, is_active: !isActive } : a));
    }
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
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white">Alertes en temps réel</h3>
          <p className="text-slate-400 text-sm mt-1">
            Recevez une notification quand un compte visite votre profil
          </p>
        </div>
        <div className="px-3 py-1.5 rounded-full bg-rose-500/20 border border-rose-500/30">
          <span className="text-rose-300 text-sm font-medium">{alerts.length}/{MAX_ALERTS}</span>
        </div>
      </div>

      <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">@</span>
            <input
              type="text"
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              placeholder="nom_utilisateur"
              className="w-full pl-8 pr-4 py-3 bg-slate-900/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-rose-500/50 transition-colors"
            />
          </div>
          <select
            value={newNetwork}
            onChange={(e) => setNewNetwork(e.target.value as 'tiktok' | 'instagram')}
            className="px-4 py-3 bg-slate-900/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:border-rose-500/50 transition-colors"
          >
            <option value="tiktok">TikTok</option>
            <option value="instagram">Instagram</option>
          </select>
          <button
            onClick={addAlert}
            disabled={adding || !newUsername.trim() || alerts.length >= MAX_ALERTS}
            className="px-6 py-3 bg-gradient-to-r from-rose-500 to-orange-500 text-white font-medium rounded-lg hover:shadow-lg hover:shadow-rose-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {adding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            Ajouter
          </button>
        </div>

        {error && (
          <div className="mt-3 p-3 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
            <span className="text-red-400 text-sm">{error}</span>
          </div>
        )}
      </div>

      {alerts.length === 0 ? (
        <div className="text-center py-12 bg-slate-800/30 rounded-xl border border-slate-700/30">
          <Bell className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400">Aucune alerte configurée</p>
          <p className="text-slate-500 text-sm mt-1">Ajoutez des comptes pour être notifié de leurs visites</p>
        </div>
      ) : (
        <div className="space-y-3">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                alert.is_active
                  ? 'bg-slate-800/50 border-slate-700/50'
                  : 'bg-slate-800/20 border-slate-700/30 opacity-60'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  alert.social_network === 'tiktok' ? 'bg-slate-700' : 'bg-gradient-to-br from-pink-500 to-orange-500'
                }`}>
                  {alert.social_network === 'tiktok' ? (
                    <span className="text-white text-sm font-bold">TT</span>
                  ) : (
                    <span className="text-white text-sm font-bold">IG</span>
                  )}
                </div>
                <div>
                  <p className="text-white font-medium">@{alert.target_username}</p>
                  <p className="text-slate-400 text-sm capitalize">{alert.social_network}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleAlert(alert.id, alert.is_active)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    alert.is_active
                      ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                      : 'bg-slate-700/50 text-slate-400 hover:bg-slate-700'
                  }`}
                >
                  {alert.is_active ? 'Active' : 'Inactive'}
                </button>
                <button
                  onClick={() => deleteAlert(alert.id)}
                  className="p-2 text-slate-400 hover:text-red-400 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
