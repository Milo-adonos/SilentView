export default function Footer() {
  const currentYear = new Date().getFullYear();

  const links = {
    product: [
      { name: 'Fonctionnalités', href: '#features' },
      { name: 'Tarifs', href: '#pricing' },
      { name: 'Comment ça marche', href: '#demo' }
    ],
    legal: [
      { name: 'Conditions d\'utilisation', href: '#' },
      { name: 'Politique de confidentialité', href: '#' },
      { name: 'Mentions légales', href: '#' }
    ],
    company: [
      { name: 'À propos', href: '#' },
      { name: 'Contact', href: '#' },
      { name: 'FAQ', href: '#' }
    ]
  };

  return (
    <footer className="bg-slate-950 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <img
                src="/silentview-logo.png"
                alt="SilentView Logo"
                className="w-12 h-12 object-contain"
              />
              <span className="text-xl font-bold">
                <span className="text-white">Silent</span>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-orange-500">View</span>
              </span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed">
              Comprendre l'attention invisible autour de votre présence sociale.
            </p>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Produit</h3>
            <ul className="space-y-3">
              {links.product.map((link) => (
                <li key={link.name}>
                  <a href={link.href} className="text-slate-400 hover:text-rose-400 transition-colors text-sm">
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Légal</h3>
            <ul className="space-y-3">
              {links.legal.map((link) => (
                <li key={link.name}>
                  <a href={link.href} className="text-slate-400 hover:text-rose-400 transition-colors text-sm">
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Entreprise</h3>
            <ul className="space-y-3">
              {links.company.map((link) => (
                <li key={link.name}>
                  <a href={link.href} className="text-slate-400 hover:text-rose-400 transition-colors text-sm">
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-slate-500 text-sm">
              © {currentYear} SilentView. Tous droits réservés.
            </p>
            <p className="text-slate-500 text-sm text-center">
              Outil de visualisation interprétative · Aucune donnée privée utilisée
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
