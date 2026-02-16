import { ArrowRight, CheckCircle2 } from 'lucide-react';

interface Props {
  onAnalyzeClick: () => void;
}

export default function CTASection({ onAnalyzeClick }: Props) {
  return (
    <section className="relative py-24 bg-gradient-to-b from-slate-950 to-slate-900">
      <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-white/5 to-transparent pointer-events-none"></div>
      <div className="max-w-4xl mx-auto px-6">
        <div className="relative p-12 rounded-3xl border-2 border-rose-500/30 bg-slate-800/30 backdrop-blur-sm shadow-xl shadow-rose-500/10">
          <div className="text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Prêt à voir qui s'intéresse à ton profil ?
            </h2>
            <p className="text-xl text-slate-300 mb-8">
              Lance ta première analyse gratuite en quelques secondes
            </p>

            <button
              onClick={onAnalyzeClick}
              className="px-8 py-4 bg-gradient-to-r from-rose-500 to-orange-600 hover:from-rose-400 hover:to-orange-500 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-rose-500/25 mx-auto mb-6"
            >
              <span>Lancer mon analyse gratuite</span>
              <ArrowRight className="w-5 h-5" />
            </button>

            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-slate-300">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <span>Gratuit</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <span>Sans inscription</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <span>Résultats immédiats</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
