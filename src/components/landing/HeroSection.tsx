import { useMemo } from 'react';
import { TrendingUp, ArrowRight } from 'lucide-react';

const getDailyAnalyses = () => {
  const frenchDate = new Date().toLocaleDateString('fr-FR', {
    timeZone: 'Europe/Paris',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });

  const seed = frenchDate.split('/').join('');
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash) + seed.charCodeAt(i);
    hash = hash & hash;
  }

  const random = Math.abs(hash) % 1701 + 800;
  return random;
};

interface Props {
  onAnalyzeClick: () => void;
}

export default function HeroSection({ onAnalyzeClick }: Props) {
  const dailyAnalyses = useMemo(() => getDailyAnalyses(), []);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    onAnalyzeClick();
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-950 via-slate-900 to-slate-800">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-800/20 via-slate-900/40 to-transparent"></div>

      <nav className="absolute top-0 left-0 right-0 z-50 bg-slate-800/40 backdrop-blur-md border-b border-slate-700/30">
        <div className="max-w-7xl mx-auto px-6 py-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img
                src="/silentview-logo.png"
                alt="SilentView Logo"
                className="w-12 h-12 object-contain"
              />
              <h2 className="text-lg font-bold">
                <span className="text-white">Silent</span>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-orange-500">View</span>
              </h2>
            </div>
            <button
              onClick={onAnalyzeClick}
              className="px-4 py-2 bg-gradient-to-r from-rose-500 to-orange-600 hover:from-rose-400 hover:to-orange-500 text-white font-semibold rounded-lg transition-all shadow-lg shadow-rose-500/20 text-sm"
            >
              ANALYSE
            </button>
          </div>
        </div>
      </nav>

      <div className="relative max-w-5xl mx-auto px-6 pt-28 pb-20 md:py-20 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800/50 border border-slate-700/50 text-slate-300 text-sm mb-8 backdrop-blur-sm">
          <TrendingUp className="w-4 h-4 text-green-500" />
          <span>+{dailyAnalyses} analyses aujourd'hui</span>
        </div>

        <h1 className="text-[2.25rem] md:text-7xl font-bold text-white mb-7 md:mb-6 tracking-tight leading-[1.15] md:leading-tight">
          Découvre qui regarde ton profil <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-orange-500">en secret</span>
        </h1>

        <p className="text-[0.95rem] md:text-lg text-slate-300 mb-10 md:mb-12 max-w-3xl mx-auto leading-relaxed text-center px-2">
          Un ex. Une personne curieuse. Ou quelqu'un d'inattendu.
        </p>

        <form onSubmit={handleAnalyze} className="max-w-xl mx-auto mb-8">
          <button
            type="submit"
            className="mx-auto px-8 py-4 bg-gradient-to-r from-rose-500 to-orange-600 hover:from-rose-400 hover:to-orange-500 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-rose-500/25"
          >
            <span>Lancer mon analyse gratuite</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </form>

        <p className="text-sm text-slate-500">
          Analyse 100% anonyme • Aucun accès au compte requis
        </p>

        <div className="mt-12 relative max-w-2xl mx-auto">
          <div className="absolute inset-0 bg-gradient-to-r from-rose-500/20 via-orange-500/20 to-rose-500/20 rounded-2xl blur-xl"></div>
          <div className="relative p-[1px] rounded-2xl bg-gradient-to-r from-rose-500/50 via-orange-500/50 to-rose-500/50">
            <div className="bg-slate-900/90 backdrop-blur-sm rounded-2xl p-8">
              <div className="grid grid-cols-3 gap-8 text-center">
                <div className="group">
                  <div className="text-2xl md:text-3xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-rose-400 group-hover:to-rose-300 transition-all">2.4M+</div>
                  <div className="text-sm text-slate-400">Profils analysés</div>
                </div>
                <div className="relative group">
                  <div className="absolute inset-0 -m-2 bg-gradient-to-b from-rose-500/10 to-orange-500/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative">
                    <div className="text-2xl md:text-3xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-orange-400 group-hover:to-orange-300 transition-all">98%</div>
                    <div className="text-sm text-slate-400">Satisfaction</div>
                  </div>
                </div>
                <div className="group">
                  <div className="text-2xl md:text-3xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-rose-400 group-hover:to-rose-300 transition-all">4.8/5</div>
                  <div className="text-sm text-slate-400">Note moyenne</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
