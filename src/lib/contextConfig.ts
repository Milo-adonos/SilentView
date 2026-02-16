export type ContextType = 'ex_crush' | 'friend' | 'business' | 'curiosity';

export interface ContextOption {
  value: ContextType;
  label: string;
  icon: string;
}

export const contextOptions: ContextOption[] = [
  { value: 'ex_crush', label: "C'est un(e) ex ou un crush", icon: 'Heart' },
  { value: 'friend', label: "C'est un(e) ami(e) ou proche", icon: 'Users' },
  { value: 'business', label: "C'est un compte pro/business", icon: 'Briefcase' },
  { value: 'curiosity', label: 'Simple curiosité', icon: 'Search' },
];

export interface Question {
  question: string;
  options: string[];
}

export const contextQuestions: Record<ContextType, Question> = {
  ex_crush: {
    question: 'Tu penses qu\'il/elle regarde souvent ton profil ?',
    options: ['Oui je pense', "J'ai des doutes", 'Aucune idée'],
  },
  friend: {
    question: 'Tu as remarqué un changement dans son comportement en ligne ?',
    options: ['Oui clairement', 'Peut-être', 'Non pas vraiment'],
  },
  business: {
    question: "C'est quel type de compte ?",
    options: ['Concurrent', 'Client potentiel', 'Influenceur', 'Autre'],
  },
  curiosity: {
    question: 'Tu connais cette personne IRL ?',
    options: ['Oui bien', 'Vaguement', 'Non pas du tout'],
  },
};

export interface ResultTexts {
  title: string;
  subtitle: string;
  signals: {
    observer: string;
    recurring: string;
    keyMoment: string;
    suspicious: string;
  };
}

export const contextResults: Record<ContextType, ResultTexts> = {
  ex_crush: {
    title: 'Ton ex semble toujours te surveiller...',
    subtitle: 'Comportement nostalgique détecté',
    signals: {
      observer: 'Profil observateur nostalgique',
      recurring: 'Visites émotionnelles détectées',
      keyMoment: 'Pic après tes publications',
      suspicious: 'Comportement de surveillance',
    },
  },
  friend: {
    title: 'Cette personne suit ton activité de près...',
    subtitle: 'Intérêt marqué pour ton contenu',
    signals: {
      observer: 'Ami(e) très attentif(ve)',
      recurring: 'Visites régulières détectées',
      keyMoment: 'Réactions rapides à tes posts',
      suspicious: 'Curiosité inhabituelle',
    },
  },
  business: {
    title: 'Ce compte professionnel t\'observe...',
    subtitle: 'Veille concurrentielle identifiée',
    signals: {
      observer: 'Profil en veille active',
      recurring: 'Surveillance stratégique',
      keyMoment: 'Analyse de tes contenus',
      suspicious: 'Intérêt commercial détecté',
    },
  },
  curiosity: {
    title: 'Ce profil s\'intéresse à toi...',
    subtitle: 'Curiosité réciproque détectée',
    signals: {
      observer: 'Visiteur discret identifié',
      recurring: 'Passages réguliers notés',
      keyMoment: 'Attention particulière',
      suspicious: 'Intérêt caché détecté',
    },
  },
};
