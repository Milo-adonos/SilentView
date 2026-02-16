import { Users, TrendingUp, Zap } from 'lucide-react';

export default function FeaturesSection() {
  const features = [
    {
      icon: Users,
      title: "Profils observateurs",
      description: "Identifie les personnes qui consultent ton profil sans liker, commenter ou s'abonner."
    },
    {
      icon: TrendingUp,
      title: "Visites répétées",
      description: "Analyse la fréquence et la régularité des visites sur ton profil."
    },
    {
      icon: Zap,
      title: "Quand ça arrive",
      description: "Les moments où ton profil attire de l'attention"
    }
  ];

  return (
    <section className="py-24 bg-gradient-to-b from-slate-900 to-slate-950">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Découvre ce que certaines personnes
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-orange-500 mt-2">
              préfèrent cacher.
            </span>
          </h2>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Analyse l'activité autour de ton profil, même quand personne n'interagit.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="group p-6 rounded-2xl bg-slate-800/50 border border-slate-700/50 hover:border-rose-500/50 hover:bg-gradient-to-br hover:from-rose-500/20 hover:to-orange-600/20 transition-all duration-300 backdrop-blur-sm hover:shadow-lg hover:shadow-rose-500/20"
              >
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-rose-500/20 to-orange-600/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Icon className="w-7 h-7 text-rose-400" />
                </div>
                <h3 className="text-2xl font-semibold text-white mb-3">{feature.title}</h3>
                <p className="text-slate-400 leading-relaxed">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
