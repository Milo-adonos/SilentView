import { useState, useEffect, useMemo } from 'react';
import {
  Eye,
  BarChart3,
  Clock,
  Target,
  Gauge,
  ArrowLeft,
  Share2,
  CheckCircle2,
  TrendingUp,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Heart,
  Activity,
  Calendar,
  Award,
  MessageCircle,
  Bookmark,
  RefreshCw
} from 'lucide-react';
import { GeneratedSignals, Signal } from '../../lib/signalGenerator';

interface Props {
  targetUsername: string;
  ownUsername: string;
  generatedSignals: GeneratedSignals;
  onBack: () => void;
}

const iconMap = {
  eye: Eye,
  chart: BarChart3,
  clock: Clock,
  target: Target,
  gauge: Gauge,
};

// Animated background
function AnimatedBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-emerald-500/8 rounded-full blur-[100px] animate-float-slow" />
      <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-teal-500/6 rounded-full blur-[120px] animate-float-slower" />
    </div>
  );
}

// Success celebration animation
function SuccessBadge() {
  const [show, setShow] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => setShow(true), 300);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={`transition-all duration-700 ${show ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}>
      <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/30">
        <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center">
          <CheckCircle2 className="w-4 h-4 text-white" />
        </div>
        <span className="text-emerald-300 font-medium">Analyse complète débloquée</span>
        <Award className="w-4 h-4 text-amber-400" />
      </div>
    </div>
  );
}

// Interest progress bar - Unlocked version
function ProfileSummary({ targetUsername, generatedSignals }: { targetUsername: string; generatedSignals: GeneratedSignals }) {
  // Use the pre-calculated interest score from generated signals
  const interestScore = generatedSignals.interestScore;
  
  const [displayedScore, setDisplayedScore] = useState(0);
  
  // Animate the progress bar
  useEffect(() => {
    const timer = setTimeout(() => {
      const duration = 2000;
      const startTime = Date.now();
      
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function for smooth animation
        const eased = 1 - Math.pow(1 - progress, 3);
        setDisplayedScore(Math.round(interestScore * eased));
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };
      
      requestAnimationFrame(animate);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [interestScore]);
  
  // Determine the level label and color based on score
  // High = Red (danger/attention), Moderate = Orange, Low = Green (safe)
  const getScoreInfo = (score: number) => {
    if (score >= 80) return { label: 'Très élevé', color: 'rose', emoji: '🔥' };
    if (score >= 65) return { label: 'Élevé', color: 'orange', emoji: '⚡' };
    if (score >= 50) return { label: 'Modéré', color: 'amber', emoji: '👀' };
    return { label: 'Faible', color: 'emerald', emoji: '💭' };
  };
  
  const scoreInfo = getScoreInfo(displayedScore);
  
  // Get dynamic colors based on score
  const getColors = () => {
    if (displayedScore >= 80) return {
      glow: 'from-rose-500/30 via-red-500/20 to-rose-500/30',
      border: 'border-rose-500/30',
      bg: 'from-rose-500/5 via-transparent to-red-500/5',
      avatar: 'from-rose-500 to-red-500',
      avatarShadow: 'shadow-rose-500/25',
      badge: 'bg-rose-500',
      gradient: 'from-rose-400 to-red-400',
      bar: 'from-rose-500 via-red-500 to-rose-400',
      text: 'text-rose-400'
    };
    if (displayedScore >= 65) return {
      glow: 'from-orange-500/30 via-amber-500/20 to-orange-500/30',
      border: 'border-orange-500/30',
      bg: 'from-orange-500/5 via-transparent to-amber-500/5',
      avatar: 'from-orange-500 to-amber-500',
      avatarShadow: 'shadow-orange-500/25',
      badge: 'bg-orange-500',
      gradient: 'from-orange-400 to-amber-400',
      bar: 'from-orange-500 via-amber-500 to-orange-400',
      text: 'text-orange-400'
    };
    if (displayedScore >= 50) return {
      glow: 'from-amber-500/30 via-yellow-500/20 to-amber-500/30',
      border: 'border-amber-500/30',
      bg: 'from-amber-500/5 via-transparent to-yellow-500/5',
      avatar: 'from-amber-500 to-yellow-500',
      avatarShadow: 'shadow-amber-500/25',
      badge: 'bg-amber-500',
      gradient: 'from-amber-400 to-yellow-400',
      bar: 'from-amber-500 via-yellow-500 to-amber-400',
      text: 'text-amber-400'
    };
    return {
      glow: 'from-emerald-500/30 via-green-500/20 to-emerald-500/30',
      border: 'border-emerald-500/30',
      bg: 'from-emerald-500/5 via-transparent to-green-500/5',
      avatar: 'from-emerald-500 to-green-500',
      avatarShadow: 'shadow-emerald-500/25',
      badge: 'bg-emerald-500',
      gradient: 'from-emerald-400 to-green-400',
      bar: 'from-emerald-500 via-green-500 to-emerald-400',
      text: 'text-emerald-400'
    };
  };
  
  const colors = getColors();

  return (
    <div className="relative mb-6">
      {/* Glow effect */}
      <div className={`absolute -inset-1 bg-gradient-to-r ${colors.glow} rounded-2xl blur-xl`} />
      
      <div className={`relative bg-slate-800/90 backdrop-blur-xl rounded-2xl ${colors.border} p-5 overflow-hidden`}>
        {/* Animated background gradient */}
        <div className={`absolute inset-0 bg-gradient-to-br ${colors.bg}`} />
        
        <div className="relative">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${colors.avatar} flex items-center justify-center text-white font-bold shadow-lg ${colors.avatarShadow}`}>
                  {targetUsername.charAt(0).toUpperCase()}
                </div>
                <div className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full ${colors.badge} border-2 border-slate-800 flex items-center justify-center`}>
                  <CheckCircle2 className="w-2 h-2 text-white" />
                </div>
              </div>
              <div>
                <span className="text-lg font-bold text-white">@{targetUsername}</span>
                <p className="text-xs text-slate-400">Niveau d'intérêt confirmé</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">{scoreInfo.emoji}</span>
              <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                scoreInfo.color === 'rose' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
                scoreInfo.color === 'orange' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' :
                scoreInfo.color === 'amber' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              }`}>
                {scoreInfo.label}
              </div>
            </div>
          </div>
          
          {/* Progress section */}
          <div className="space-y-3">
            {/* Score display */}
            <div className="flex items-end justify-between">
              <div className="flex items-baseline gap-1">
                <span className={`text-5xl font-bold bg-gradient-to-r ${colors.gradient} bg-clip-text text-transparent`}>
                  {displayedScore}
                </span>
                <span className="text-2xl text-slate-500 font-medium">/100</span>
              </div>
              
              <div className={`flex items-center gap-1.5 text-xs ${colors.text}`}>
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Analyse complète</span>
              </div>
            </div>
            
            {/* Progress bar */}
            <div className="relative">
              {/* Background track */}
              <div className="h-4 bg-slate-700/50 rounded-full overflow-hidden">
                {/* Animated gradient bar */}
                <div 
                  className={`h-full rounded-full transition-all duration-1000 ease-out relative overflow-hidden bg-gradient-to-r ${colors.bar}`}
                  style={{ width: `${displayedScore}%` }}
                >
                  {/* Shimmer effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
                </div>
              </div>
              
              {/* Scale markers */}
              <div className="flex justify-between mt-1.5 px-0.5">
                <span className="text-[10px] text-slate-600">0</span>
                <span className="text-[10px] text-slate-600">25</span>
                <span className="text-[10px] text-slate-600">50</span>
                <span className="text-[10px] text-slate-600">75</span>
                <span className="text-[10px] text-slate-600">100</span>
              </div>
            </div>
            
            {/* Info text */}
            <p className="text-xs text-slate-500 text-center">
              Score calculé à partir de <span className="text-emerald-400 font-medium">5 signaux</span> comportementaux vérifiés
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Animated number display
function AnimatedNumber({ value, suffix = '' }: { value: number; suffix?: string }) {
  const [displayValue, setDisplayValue] = useState(0);
  
  useEffect(() => {
    const duration = 1500;
    const steps = 30;
    const increment = value / steps;
    let current = 0;
    
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setDisplayValue(value);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(current));
      }
    }, duration / steps);
    
    return () => clearInterval(timer);
  }, [value]);
  
  return <>{displayValue}{suffix}</>;
}

// Key metrics grid - Enhanced version with equal card heights
function KeyMetrics({ generatedSignals }: { generatedSignals: GeneratedSignals }) {
  // Use the visits count and interest score from generated signals for consistency
  const visitsCount = generatedSignals.visitsCount;
  const interestLevel = generatedSignals.interestScore;
  const frequencyLevel = generatedSignals.signals[1]?.intensity === 'high' ? 'Élevée' : 'Modérée';
  const frequencyPercent = generatedSignals.signals[1]?.intensity === 'high' ? 85 : 60;
  
  // Determine if this is high intensity (red), moderate (orange), or low (green)
  const isHighIntensity = generatedSignals.signals[0]?.intensity === 'high';

  return (
    <div className="grid grid-cols-2 gap-3 mb-6">
      {/* Visits Card - Red for high intensity */}
      <div className="relative group h-[160px]">
        <div className="absolute inset-0 bg-gradient-to-br from-rose-500/20 to-red-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="relative h-full bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl rounded-2xl border border-rose-500/20 p-4 overflow-hidden flex flex-col">
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-rose-500/10 to-transparent rounded-full -translate-y-1/2 translate-x-1/2" />
          
          <div className="relative flex-1 flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-rose-500 to-red-500 flex items-center justify-center shadow-lg shadow-rose-500/25">
                <Eye className="w-4 h-4 text-white" />
              </div>
              <div className="flex items-center gap-1 px-2 py-0.5 bg-rose-500/10 rounded-full border border-rose-500/30">
                <span className="w-1.5 h-1.5 bg-rose-400 rounded-full animate-pulse" />
                <span className="text-[10px] text-rose-400 font-medium">Live</span>
              </div>
            </div>
            
            <span className="text-xs text-slate-400 font-medium">Visites</span>
            
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-3xl font-bold text-rose-400 animate-pulse-number">
                <AnimatedNumber value={visitsCount} />
              </span>
              <span className="text-sm text-rose-300/60">visites</span>
            </div>
            
            <div className="mt-auto pt-2">
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1.5 bg-slate-700/50 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-rose-500 to-red-400 rounded-full" style={{ width: '70%' }} />
                </div>
                <span className="text-[10px] text-rose-400 whitespace-nowrap">+{Math.floor(visitsCount * 0.3)}/sem</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Last Visit Card */}
      <div className="relative group h-[160px]">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-500/20 to-purple-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="relative h-full bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl rounded-2xl border border-violet-500/20 p-4 overflow-hidden flex flex-col">
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-violet-500/10 to-transparent rounded-full -translate-y-1/2 translate-x-1/2" />
          
          <div className="relative flex-1 flex flex-col">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center shadow-lg shadow-violet-500/25">
                <Clock className="w-4 h-4 text-white" />
              </div>
            </div>
            
            <span className="text-xs text-slate-400 font-medium">Dernière visite</span>
            
            <div className="mt-1">
              <div className="text-xl font-bold text-white leading-tight">
                {generatedSignals.lastVisit}
              </div>
            </div>
            
            <div className="mt-auto pt-2 flex items-center gap-1.5 text-[10px] text-slate-500">
              <Activity className="w-3 h-3 text-violet-400" />
              <span>Activité récente</span>
            </div>
          </div>
        </div>
      </div>

      {/* Interest Level Card */}
      <div className="relative group h-[160px]">
        <div className="absolute inset-0 bg-gradient-to-br from-rose-500/20 to-pink-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="relative h-full bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl rounded-2xl border border-rose-500/20 p-4 overflow-hidden flex flex-col">
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-rose-500/10 to-transparent rounded-full -translate-y-1/2 translate-x-1/2" />
          
          <div className="relative flex-1 flex flex-col">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center shadow-lg shadow-rose-500/25">
                <Heart className="w-4 h-4 text-white" />
              </div>
            </div>
            
            <span className="text-xs text-slate-400 font-medium">Niveau d'intérêt</span>
            
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-3xl font-bold text-white">
                <AnimatedNumber value={interestLevel} suffix="%" />
              </span>
            </div>
            
            <div className="mt-auto pt-2 flex items-center gap-2">
              <div className="relative w-8 h-8">
                <svg className="w-8 h-8 -rotate-90">
                  <circle cx="16" cy="16" r="14" stroke="currentColor" strokeWidth="3" fill="none" className="text-slate-700" />
                  <circle cx="16" cy="16" r="14" stroke="url(#rose-gradient)" strokeWidth="3" fill="none" strokeLinecap="round" strokeDasharray={`${interestLevel * 0.88} 88`} />
                  <defs>
                    <linearGradient id="rose-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#f43f5e" />
                      <stop offset="100%" stopColor="#ec4899" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
              <span className="text-[10px] text-slate-500">
                <span className="text-rose-400 font-medium">{interestLevel >= 70 ? 'Élevé' : 'Modéré'}</span> - attention
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Frequency Card */}
      <div className="relative group h-[160px]">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="relative h-full bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl rounded-2xl border border-amber-500/20 p-4 overflow-hidden flex flex-col">
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-amber-500/10 to-transparent rounded-full -translate-y-1/2 translate-x-1/2" />
          
          <div className="relative flex-1 flex flex-col">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/25">
                <Activity className="w-4 h-4 text-white" />
              </div>
            </div>
            
            <span className="text-xs text-slate-400 font-medium">Fréquence</span>
            
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xl font-bold text-white">{frequencyLevel}</span>
              <span className={`px-1.5 py-0.5 text-[10px] font-medium rounded-full ${
                frequencyLevel === 'Élevée' ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-700 text-slate-400'
              }`}>
                {frequencyLevel === 'Élevée' ? '↑' : '→'} Stable
              </span>
            </div>
            
            <div className="mt-auto pt-2">
              <div className="flex items-end gap-0.5 h-6">
                {[40, 65, 45, 80, 60, 90, frequencyPercent].map((height, i) => (
                  <div
                    key={i}
                    className="flex-1 bg-gradient-to-t from-amber-500 to-orange-400 rounded-sm"
                    style={{ height: `${height}%`, opacity: i === 6 ? 1 : 0.4 + (i * 0.1) }}
                  />
                ))}
              </div>
              <div className="flex justify-between mt-0.5 text-[9px] text-slate-600">
                <span>Lun</span>
                <span>Dim</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Signal card (expanded/collapsible)
function SignalCard({ signal, index, defaultExpanded = false }: { signal: Signal; index: number; defaultExpanded?: boolean }) {
  const Icon = iconMap[signal.iconType];
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  // Color scheme: High = Red (danger), Medium = Orange, Low = Green (safe)
  const intensityConfig = {
    high: {
      gradient: 'from-rose-500 to-red-500',
      shadow: 'shadow-rose-500/30',
      border: 'border-rose-500/30',
      bg: 'bg-rose-500/5',
      badge: 'bg-rose-500/20 text-rose-400',
      badgeText: 'Signal fort',
    },
    medium: {
      gradient: 'from-amber-500 to-orange-500',
      shadow: 'shadow-amber-500/20',
      border: 'border-amber-500/30',
      bg: 'bg-amber-500/5',
      badge: 'bg-amber-500/20 text-amber-400',
      badgeText: 'Signal modéré',
    },
    low: {
      gradient: 'from-emerald-500 to-green-500',
      shadow: 'shadow-emerald-500/20',
      border: 'border-emerald-500/30',
      bg: 'bg-emerald-500/5',
      badge: 'bg-emerald-500/20 text-emerald-400',
      badgeText: 'Signal faible',
    },
  };

  const config = intensityConfig[signal.intensity];

  return (
    <div 
      className={`rounded-2xl border ${config.border} ${config.bg} overflow-hidden transition-all duration-300`}
      style={{ animationDelay: `${index * 150}ms` }}
    >
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-5 flex items-center gap-4 text-left hover:bg-white/5 transition-colors"
      >
        {/* Icon */}
        <div className={`flex-shrink-0 w-14 h-14 rounded-xl bg-gradient-to-br ${config.gradient} flex items-center justify-center shadow-lg ${config.shadow}`}>
          <Icon className="w-7 h-7 text-white" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h3 className="font-semibold text-white text-lg">{signal.title}</h3>
            <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${config.badge}`}>
              {config.badgeText}
            </span>
          </div>
          {!isExpanded && (
            <p className="text-slate-400 text-sm truncate">
              {signal.preview.substring(0, 70)}...
            </p>
          )}
        </div>

        {/* Expand icon */}
        <div className="flex-shrink-0">
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-slate-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-slate-400" />
          )}
        </div>
      </button>

      {/* Expanded content */}
      {isExpanded && (
        <div className="px-5 pb-5">
          <div className="pl-[4.5rem] space-y-4">
            <p className="text-slate-300 leading-relaxed">
              {signal.preview}
            </p>

            {/* Progress bar for certain signals */}
            {(signal.iconType === 'gauge' || signal.iconType === 'chart') && (
              <div>
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="text-slate-500">Intensité du signal</span>
                  <span className={signal.intensity === 'high' ? 'text-rose-400 font-medium' : signal.intensity === 'low' ? 'text-emerald-400 font-medium' : 'text-amber-400 font-medium'}>
                    {signal.intensity === 'high' ? 'Élevée (85%)' : signal.intensity === 'low' ? 'Faible (30%)' : 'Modérée (55%)'}
                  </span>
                </div>
                <div className="h-2.5 bg-slate-700/50 rounded-full overflow-hidden">
                  <div
                    className={`h-full bg-gradient-to-r ${config.gradient} rounded-full transition-all duration-1000`}
                    style={{ width: signal.intensity === 'high' ? '85%' : signal.intensity === 'low' ? '30%' : '55%' }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Interpretation section
function InterpretationSection({ generatedSignals, targetUsername }: { generatedSignals: GeneratedSignals; targetUsername: string }) {
  return (
    <div className="space-y-4 mb-6">
      {/* Main interpretation */}
      <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h3 className="font-semibold text-white">Synthèse de l'analyse</h3>
            <p className="text-xs text-slate-400">Interprétation basée sur les signaux détectés</p>
          </div>
        </div>

        <p className="text-slate-300 leading-relaxed mb-4">
          {generatedSignals.interpretation.main}
        </p>

        <div className="pt-4 border-t border-slate-700/50">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="text-sm font-medium text-amber-300">Prédiction comportementale</span>
          </div>
          <p className="text-slate-300 leading-relaxed">
            {generatedSignals.interpretation.prediction}
          </p>
        </div>
      </div>

      {/* Quick insights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { icon: Calendar, label: 'Période analysée', value: '7 derniers jours' },
          { icon: MessageCircle, label: 'Probabilité contact', value: '75%+' },
          { icon: Bookmark, label: 'Profil sauvegardé', value: 'Peut-être' },
        ].map((insight, i) => (
          <div key={i} className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
            <div className="flex items-center gap-2 mb-1">
              <insight.icon className="w-4 h-4 text-slate-400" />
              <span className="text-xs text-slate-500">{insight.label}</span>
            </div>
            <div className="font-semibold text-white">{insight.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Actions section
function ActionsSection({ onBack }: { onBack: () => void }) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'SilentView - Analyse de profil',
          text: 'J\'ai découvert qui regarde mon profil avec SilentView !',
          url: window.location.origin,
        });
      } else {
        await navigator.clipboard.writeText(window.location.origin);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      // Silently fail
    }
  };

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6">
      <h3 className="font-semibold text-white mb-4 text-center">Que souhaitez-vous faire ?</h3>
      
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={onBack}
          className="flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-rose-500 to-orange-500 hover:from-rose-400 hover:to-orange-400 text-white font-semibold rounded-xl transition-all shadow-lg shadow-rose-500/20"
        >
          <RefreshCw className="w-5 h-5" />
          <span>Nouvelle analyse</span>
        </button>
        
        <button
          onClick={handleShare}
          className="flex items-center justify-center gap-2 py-3 px-4 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-xl transition-all"
        >
          <Share2 className="w-5 h-5" />
          <span>{copied ? 'Copié !' : 'Partager'}</span>
        </button>
      </div>
    </div>
  );
}

// Main component
export default function FullResults({ targetUsername, ownUsername, generatedSignals, onBack }: Props) {
  const { signals, personalizedTitle } = generatedSignals;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 relative">
      <AnimatedBackground />

      {/* Header */}
      <header className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur-xl border-b border-slate-800">
        <div className="max-w-2xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors p-2 -ml-2 rounded-lg hover:bg-slate-800"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="text-sm font-medium">Retour</span>
            </button>

            <div className="flex items-center gap-2">
              <img src="/silentview-logo.png" alt="SilentView" className="h-7 w-auto" />
              <span className="text-base font-bold hidden sm:inline">
                <span className="text-white">Silent</span>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-orange-500">View</span>
              </span>
            </div>

            <div className="w-20" /> {/* Spacer for centering */}
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 relative z-10">
        {/* Success badge */}
        <div className="text-center mb-6">
          <SuccessBadge />
        </div>

        {/* Title */}
        <div className="text-center mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
            {personalizedTitle.title}
          </h1>
          <p className="text-slate-400 text-sm max-w-md mx-auto">
            {personalizedTitle.subtitle}
          </p>
        </div>

        {/* Profile summary */}
        <ProfileSummary targetUsername={targetUsername} generatedSignals={generatedSignals} />

        {/* Key metrics */}
        <KeyMetrics generatedSignals={generatedSignals} />

        {/* Signals */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-white flex items-center gap-2">
              <Eye className="w-5 h-5 text-emerald-400" />
              Signaux détectés
            </h2>
            <span className="text-xs text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              5 signaux analysés
            </span>
          </div>

          <div className="space-y-3">
            {signals.map((signal, index) => (
              <SignalCard 
                key={index} 
                signal={signal} 
                index={index}
                defaultExpanded={index === 0}
              />
            ))}
          </div>
        </div>

        {/* Interpretation */}
        <InterpretationSection generatedSignals={generatedSignals} targetUsername={targetUsername} />

        {/* Actions */}
        <ActionsSection onBack={onBack} />

        {/* Footer */}
        <p className="text-center text-xs text-slate-600 mt-6">
          Outil de visualisation interprétative • Résultats basés sur l'analyse de données publiques
        </p>
      </main>
    </div>
  );
}
