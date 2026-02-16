import { ContextType } from './contextConfig';

export interface Signal {
  title: string;
  preview: string;
  iconType: 'eye' | 'chart' | 'clock' | 'target' | 'gauge';
  intensity: 'low' | 'medium' | 'high';
}

export interface GeneratedSignals {
  signals: Signal[];
  personalizedTitle: { title: string; subtitle: string };
  interpretation: { main: string; prediction: string };
  lastVisit: string;
  userPrediction: number;
  userAnswer: string;
  visitsCount: number;
  interestScore: number;
}

function seededRandom(seed: string): () => number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }

  return () => {
    hash = (hash * 1103515245 + 12345) & 0x7fffffff;
    return hash / 0x7fffffff;
  };
}

export function generateSignals(
  username: string,
  contextType: ContextType,
  userAnswer: string,
  userPrediction: number
): GeneratedSignals {
  const seed = `${username}-${contextType}-${userAnswer}-${userPrediction}`;
  const random = seededRandom(seed);

  const isHighPrediction = userPrediction >= 15;
  const isMediumPrediction = userPrediction >= 5 && userPrediction < 15;

  const signal1 = getSignal1Intuition(contextType, username, userAnswer, isHighPrediction);
  const signal2 = getSignal2Frequency(contextType, username, isHighPrediction, isMediumPrediction);
  const signal3 = getSignal3KeyMoments(contextType, username, random);
  const signal4 = getSignal4IntentionType(contextType, username, random);
  const signal5 = getSignal5AttentionLevel(isHighPrediction, isMediumPrediction, random);
  const lastVisit = generateLastVisit(contextType, random);
  const personalizedTitle = getPersonalizedTitle(contextType, username, userAnswer, userPrediction);
  const interpretation = getInterpretation(contextType, username);
  
  // Generate consistent visits count (12-27)
  const visitsCount = Math.floor(random() * 16) + 12;
  
  // Calculate interest score (consistent across pages)
  // Base score from user's prediction (0-20 slider value)
  let interestScore = 55 + (userPrediction * 2); // Range: 55-95 based on prediction
  
  // Boost score based on positive answers
  const positiveAnswers = ['Oui je pense', 'Oui clairement', 'Oui bien', 'Concurrent', 'Client potentiel'];
  if (positiveAnswers.includes(userAnswer)) {
    interestScore += 8;
  }
  
  // Add variation based on signal intensities
  const signals = [signal1, signal2, signal3, signal4, signal5];
  const highIntensityCount = signals.filter(s => s.intensity === 'high').length;
  interestScore += highIntensityCount * 2;
  
  // Add small random variation based on username (consistent per user)
  const usernameHash = username.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const variation = (usernameHash % 10) - 5;
  interestScore += variation;
  
  // Ensure score is always relatively high (minimum 65) and cap at 97
  interestScore = Math.min(Math.max(Math.round(interestScore), 65), 97);

  return {
    signals,
    personalizedTitle,
    interpretation,
    lastVisit,
    userPrediction,
    userAnswer,
    visitsCount,
    interestScore,
  };
}

function getPersonalizedTitle(context: ContextType, username: string, userAnswer: string, prediction: number) {
  const isHighPrediction = prediction >= 15;

  if (context === 'ex_crush') {
    if (userAnswer === 'Oui je pense' && isHighPrediction) {
      return {
        title: 'Ton intuition était juste...',
        subtitle: `Nos algorithmes confirment une activité élevée de la part de @${username}. L'intensité détectée correspond à ce que tu soupçonnais.`,
      };
    }
    if (userAnswer === 'Oui je pense') {
      return {
        title: 'Tu avais raison de te poser la question...',
        subtitle: `@${username} semble garder un œil sur ton profil. Les signaux détectés confirment tes soupçons.`,
      };
    }
    if (userAnswer === "J'ai des doutes" && isHighPrediction) {
      return {
        title: 'Tes doutes étaient fondés...',
        subtitle: `L'analyse révèle une attention particulière de @${username} envers ton profil. Plus que ce que tu imaginais.`,
      };
    }
    return {
      title: 'Résultats intéressants pour',
      subtitle: `Notre analyse a détecté des signaux significatifs concernant @${username}. Découvre ce que ça révèle.`,
    };
  }

  if (context === 'friend') {
    if (userAnswer === 'Oui clairement' && isHighPrediction) {
      return {
        title: 'Tu avais remarqué quelque chose...',
        subtitle: `Le changement de comportement que tu as noté se confirme. @${username} te surveille plus qu'avant.`,
      };
    }
    if (userAnswer === 'Oui clairement') {
      return {
        title: 'Ton ressenti était correct...',
        subtitle: `@${username} a effectivement changé son comportement envers toi. Les données le confirment.`,
      };
    }
    if (userAnswer === 'Peut-être') {
      return {
        title: 'Ton instinct ne te trompait pas...',
        subtitle: `Il y a bien quelque chose. @${username} montre un intérêt inhabituel pour ton activité.`,
      };
    }
    return {
      title: 'Analyse terminée pour',
      subtitle: `Des patterns intéressants ont été détectés concernant l'activité de @${username}.`,
    };
  }

  if (context === 'business') {
    const businessTypeIntro = userAnswer === 'Concurrent'
      ? 'Veille concurrentielle confirmée...'
      : userAnswer === 'Client potentiel'
      ? 'Intérêt commercial détecté...'
      : userAnswer === 'Influenceur'
      ? 'Attention particulière identifiée...'
      : 'Surveillance active détectée...';

    return {
      title: businessTypeIntro,
      subtitle: isHighPrediction
        ? `@${username} suit de près ton activité. Le niveau de surveillance est supérieur à la moyenne.`
        : `@${username} garde un œil sur ton profil. Découvre les détails de cette veille.`,
    };
  }

  if (userAnswer === 'Oui bien' && isHighPrediction) {
    return {
      title: 'Cette personne te surveille...',
      subtitle: `Tu connais @${username} et visiblement, l'intérêt est réciproque. L'activité détectée est significative.`,
    };
  }
  if (userAnswer === 'Oui bien') {
    return {
      title: 'Un intérêt caché détecté...',
      subtitle: `@${username} que tu connais semble te surveiller discrètement. Les signaux sont clairs.`,
    };
  }
  if (userAnswer === 'Vaguement' && isHighPrediction) {
    return {
      title: 'Plus qu\'une simple connaissance...',
      subtitle: `@${username} s'intéresse à toi plus que tu ne le pensais. L'analyse révèle des visites fréquentes.`,
    };
  }

  return {
    title: 'Résultats pour',
    subtitle: `Notre algorithme a détecté des signaux significatifs concernant @${username}.`,
  };
}

function getSignal1Intuition(context: ContextType, username: string, userAnswer: string, isHighPrediction: boolean): Signal {
  if (context === 'ex_crush') {
    return {
      title: userAnswer === 'Oui je pense'
        ? 'Ton intuition était correcte'
        : userAnswer === "J'ai des doutes"
        ? 'Tes doutes se confirment'
        : 'Activité suspecte détectée',
      preview: userAnswer === 'Oui je pense'
        ? `Comme tu le soupçonnais, @${username} consulte régulièrement ton profil. ${isHighPrediction ? "L'intensité des visites correspond exactement à ce que tu imaginais." : "Les données confirment tes impressions."} Ton instinct ne te trompait pas.`
        : userAnswer === "J'ai des doutes"
        ? `Tes doutes étaient fondés. @${username} garde bien un œil sur ton activité. ${isHighPrediction ? "Et c'est plus fréquent que tu ne le pensais." : "Les signaux sont clairs."}`
        : `@${username} montre un intérêt pour ton profil. ${isHighPrediction ? "La fréquence est notable." : "Les patterns sont significatifs."}`,
      iconType: 'eye',
      intensity: 'high',
    };
  }

  if (context === 'friend') {
    return {
      title: userAnswer === 'Oui clairement'
        ? 'Tu avais remarqué juste'
        : userAnswer === 'Peut-être'
        ? 'Ton ressenti se confirme'
        : 'Changement détecté',
      preview: userAnswer === 'Oui clairement'
        ? `Tu avais raison, @${username} a bien changé son comportement envers toi. ${isHighPrediction ? "L'évolution est significative." : "Les données le confirment."} Tu n'as pas rêvé.`
        : userAnswer === 'Peut-être'
        ? `Ton intuition était bonne. @${username} montre effectivement un comportement différent. ${isHighPrediction ? "Plus marqué que tu ne le pensais." : "Les signaux sont présents."}`
        : `@${username} présente un changement de comportement sur ton profil. ${isHighPrediction ? "C'est notable." : "Les patterns le montrent."}`,
      iconType: 'eye',
      intensity: 'high',
    };
  }

  if (context === 'business') {
    return {
      title: userAnswer === 'Concurrent'
        ? 'Veille concurrentielle confirmée'
        : userAnswer === 'Client potentiel'
        ? 'Intérêt commercial validé'
        : userAnswer === 'Influenceur'
        ? 'Attention médiatique détectée'
        : 'Surveillance active confirmée',
      preview: userAnswer === 'Concurrent'
        ? `@${username} surveille bien ton activité professionnelle. ${isHighPrediction ? "La veille est sérieuse et structurée." : "Le suivi est régulier."} Tu avais raison de te poser la question.`
        : userAnswer === 'Client potentiel'
        ? `@${username} montre un réel intérêt pour ton offre. ${isHighPrediction ? "Les signaux d'intention d'achat sont présents." : "La phase de découverte est active."}`
        : `@${username} suit ton contenu attentivement. ${isHighPrediction ? "L'attention est supérieure à la moyenne." : "L'intérêt est marqué."}`,
      iconType: 'eye',
      intensity: 'high',
    };
  }

  return {
    title: userAnswer === 'Oui bien'
      ? 'Cette connaissance te surveille bien'
      : userAnswer === 'Vaguement'
      ? 'Plus qu\'une simple curiosité'
      : 'Intérêt caché confirmé',
    preview: userAnswer === 'Oui bien'
      ? `@${username} que tu connais garde effectivement un œil sur toi. ${isHighPrediction ? "L'intérêt est plus profond que tu ne le pensais." : "Les signaux sont clairs."} Ton intuition était bonne.`
      : userAnswer === 'Vaguement'
      ? `@${username} s'intéresse à toi plus que prévu. ${isHighPrediction ? "Même en le connaissant peu, cette personne te suit de près." : "L'attention est réelle."}`
      : `@${username} visite ton profil régulièrement. ${isHighPrediction ? "L'intérêt est marqué même sans vous connaître." : "La curiosité est persistante."}`,
    iconType: 'eye',
    intensity: 'high',
  };
}

function getSignal2Frequency(context: ContextType, username: string, isHighPrediction: boolean, isMediumPrediction: boolean): Signal {
  const frequencyLevel = isHighPrediction ? 'élevée' : isMediumPrediction ? 'modérée' : 'régulière';
  const frequencyDescription = isHighPrediction
    ? 'bien supérieure à la moyenne'
    : isMediumPrediction
    ? 'au-dessus de la normale'
    : 'notable et constante';

  const contextTexts: Record<ContextType, { title: string; preview: string }> = {
    ex_crush: {
      title: "Fréquence d'observation",
      preview: `${frequencyLevel} - @${username} consulte ton profil avec une fréquence ${frequencyDescription}. ${isHighPrediction ? "Plusieurs passages détectés par semaine." : isMediumPrediction ? "Visites régulières identifiées." : "Pattern de visites stable."} Ce niveau d'attention révèle un attachement persistant.`,
    },
    friend: {
      title: "Fréquence de visite",
      preview: `${frequencyLevel} - @${username} passe sur ton profil plus souvent que la normale pour une amitié classique. Fréquence ${frequencyDescription}. ${isHighPrediction ? "C'est significativement plus qu'un simple ami." : "L'attention dépasse le cadre amical habituel."}`,
    },
    business: {
      title: "Fréquence de surveillance",
      preview: `${frequencyLevel} - @${username} effectue une veille ${frequencyDescription} sur ton contenu. ${isHighPrediction ? "Comportement typique d'une stratégie de benchmark active." : "Suivi professionnel structuré."} Le monitoring est sérieux.`,
    },
    curiosity: {
      title: "Fréquence d'intérêt",
      preview: `${frequencyLevel} - @${username} revient sur ton profil avec une fréquence ${frequencyDescription}. ${isHighPrediction ? "Cette personne te suit de très près." : "L'intérêt est constant."} Ce n'est pas un simple passage hasardeux.`,
    },
  };

  return {
    ...contextTexts[context],
    iconType: 'chart',
    intensity: isHighPrediction ? 'high' : 'medium',
  };
}

function getSignal3KeyMoments(context: ContextType, username: string, random: () => number): Signal {
  const momentsByContext: Record<ContextType, { moments: string; detail: string }[]> = {
    ex_crush: [
      { moments: 'Soirée et nuit (21h-2h)', detail: 'Pics d\'activité tard le soir, typique d\'un moment de nostalgie ou de réflexion personnelle.' },
      { moments: 'Week-end principalement', detail: 'Activité concentrée les samedis et dimanches, quand le temps libre permet de penser à toi.' },
      { moments: 'Fin de journée (18h-22h)', detail: 'Visites après le travail, moment où les pensées personnelles reprennent le dessus.' },
    ],
    friend: [
      { moments: 'Début de soirée (19h-23h)', detail: 'Passages après la journée de travail, quand cette personne prend du temps personnel.' },
      { moments: 'Pause déjeuner et soirée', detail: 'Deux pics d\'activité détectés, intégration dans sa routine quotidienne.' },
      { moments: 'Week-end et jours fériés', detail: 'Plus d\'attention les jours de repos, quand le temps permet de checker ton activité.' },
    ],
    business: [
      { moments: 'Heures de bureau (9h-18h)', detail: 'Activité concentrée pendant les horaires professionnels, veille structurée et méthodique.' },
      { moments: 'Début de semaine (lundi-mardi)', detail: 'Pics en début de semaine, probablement intégré dans une routine de veille concurrentielle.' },
      { moments: 'Matinée principalement', detail: 'Visites entre 9h et 12h, comportement d\'analyse matinale du marché.' },
    ],
    curiosity: [
      { moments: 'Soirée (20h-minuit)', detail: 'Activité en fin de journée, quand cette personne prend le temps de te regarder.' },
      { moments: 'Aléatoire mais fréquent', detail: 'Pas de pattern fixe mais des visites régulières, signe d\'un intérêt spontané.' },
      { moments: 'Nuit et week-end', detail: 'Moments calmes propices à l\'exploration de ton profil en toute discrétion.' },
    ],
  };

  const options = momentsByContext[context];
  const selected = options[Math.floor(random() * options.length)];

  return {
    title: 'Moments clés',
    preview: `${selected.moments} - @${username} : ${selected.detail} Ces créneaux révélés permettent de mieux comprendre son comportement.`,
    iconType: 'clock',
    intensity: 'medium',
  };
}

function getSignal4IntentionType(context: ContextType, username: string, random: () => number): Signal {
  const intentionTypes = [
    { type: 'Curiosité discrète', description: 'Comportement d\'observation sans engagement direct. Cette personne regarde de loin sans se manifester.' },
    { type: 'Intérêt persistant', description: 'Attention soutenue et régulière sur la durée. Pas un simple passage mais un suivi réel.' },
    { type: 'Surveillance passive', description: 'Monitoring silencieux de ton activité. Cette personne veut savoir ce que tu fais sans interagir.' },
    { type: 'Retour d\'attention', description: 'Après une période d\'absence, un regain d\'intérêt marqué. Quelque chose a ravivé sa curiosité.' },
  ];

  let weightedIntentions: typeof intentionTypes[0][];

  if (context === 'ex_crush') {
    weightedIntentions = [
      intentionTypes[2],
      intentionTypes[3],
      intentionTypes[1],
      intentionTypes[3],
    ];
  } else if (context === 'friend') {
    weightedIntentions = [
      intentionTypes[0],
      intentionTypes[1],
      intentionTypes[1],
      intentionTypes[3],
    ];
  } else if (context === 'business') {
    weightedIntentions = [
      intentionTypes[2],
      intentionTypes[2],
      intentionTypes[1],
      intentionTypes[0],
    ];
  } else {
    weightedIntentions = [
      intentionTypes[0],
      intentionTypes[0],
      intentionTypes[1],
      intentionTypes[2],
    ];
  }

  const selected = weightedIntentions[Math.floor(random() * weightedIntentions.length)];

  return {
    title: "Type d'intention",
    preview: `${selected.type} - @${username} : ${selected.description}`,
    iconType: 'target',
    intensity: 'medium',
  };
}

function getSignal5AttentionLevel(isHighPrediction: boolean, isMediumPrediction: boolean, random: () => number): Signal {
  let level: string;
  let description: string;
  let intensity: 'low' | 'medium' | 'high';

  if (isHighPrediction) {
    const highLevels = [
      { level: 'Élevé', description: 'Le niveau d\'attention global est significativement au-dessus de la moyenne. Cette personne te suit activement.' },
      { level: 'Très élevé', description: 'Niveau d\'attention exceptionnel détecté. Tu occupes une place importante dans la routine de cette personne.' },
    ];
    const selected = highLevels[Math.floor(random() * highLevels.length)];
    level = selected.level;
    description = selected.description;
    intensity = 'high';
  } else if (isMediumPrediction) {
    level = 'Modéré';
    description = 'Niveau d\'attention au-dessus de la normale. Cette personne te remarque et revient régulièrement sur ton profil.';
    intensity = 'medium';
  } else {
    const lowLevels = [
      { level: 'Modéré', description: 'Un intérêt réel est présent, avec une attention régulière mais pas excessive.' },
      { level: 'Faible à modéré', description: 'Attention présente mais discrète. Cette personne te garde dans son radar sans obsession.' },
    ];
    const selected = lowLevels[Math.floor(random() * lowLevels.length)];
    level = selected.level;
    description = selected.description;
    intensity = 'medium';
  }

  return {
    title: "Niveau d'attention global",
    preview: `${level} - SYNTHÈSE : ${description} Cette évaluation prend en compte l'ensemble des signaux détectés.`,
    iconType: 'gauge',
    intensity,
  };
}

function generateLastVisit(context: ContextType, random: () => number): string {
  const days = ['Hier', 'Avant-hier', 'Il y a 3 jours', 'Il y a 2 jours'];
  const dayIndex = Math.floor(random() * days.length);
  const selectedDay = days[dayIndex];

  let hour: number;

  switch (context) {
    case 'ex_crush':
      const exHours = [21, 22, 23, 0, 1, 22, 23, 0];
      hour = exHours[Math.floor(random() * exHours.length)];
      break;
    case 'friend':
      const friendHours = [19, 20, 21, 22, 12, 13, 20, 21];
      hour = friendHours[Math.floor(random() * friendHours.length)];
      break;
    case 'business':
      const businessHours = [9, 10, 11, 14, 15, 16, 17, 10, 11];
      hour = businessHours[Math.floor(random() * businessHours.length)];
      break;
    default:
      const defaultHours = [18, 19, 20, 21, 22, 23, 14, 15];
      hour = defaultHours[Math.floor(random() * defaultHours.length)];
  }

  const minute = Math.floor(random() * 60);
  const formattedMinute = minute.toString().padStart(2, '0');
  const formattedHour = hour.toString().padStart(2, '0');

  return `${selectedDay} à ${formattedHour}h${formattedMinute}`;
}

function getInterpretation(context: ContextType, username: string) {
  const interpretations: Record<string, { main: string; prediction: string }> = {
    curiosity: {
      main: `L'analyse des patterns comportementaux de @${username} révèle un intérêt marqué pour votre profil. La fréquence des visites et le timing des interactions sont supérieurs à la moyenne, ce qui suggère que cette personne suit activement votre activité sur la plateforme.`,
      prediction: `Selon nos algorithmes, il y a une forte probabilité que @${username} continue à suivre votre activité. Si vous engagez la conversation, les chances d'une réponse positive sont estimées à plus de 75%.`,
    },
    ex_crush: {
      main: `Les données révèlent que @${username} maintient une surveillance discrète mais constante de votre profil. Ce comportement est typique d'une personne qui n'a pas complètement tourné la page et qui ressent encore un attachement émotionnel.`,
      prediction: `Les patterns détectés suggèrent que @${username} pourrait tenter de reprendre contact dans les prochaines semaines, surtout si vous publiez du contenu significatif.`,
    },
    friend: {
      main: `L'analyse confirme un changement de comportement de la part de @${username}. Les signaux d'engagement, la rapidité des réponses et l'attention portée à vos publications dépassent largement le cadre d'une simple amitié.`,
      prediction: `Nos algorithmes estiment à plus de 80% les chances que @${username} réponde favorablement à une approche de votre part. Le timing actuel est optimal.`,
    },
    business: {
      main: `L'analyse du comportement numérique de @${username} révèle une veille active et structurée. Son activité en ligne montre un suivi méthodique de votre contenu professionnel.`,
      prediction: `Les indicateurs suggèrent une attention soutenue. Cette personne continuera probablement à suivre votre activité professionnelle dans les prochaines semaines.`,
    },
  };

  return interpretations[context] || interpretations.curiosity;
}
