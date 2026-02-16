import { useState, useEffect, useMemo } from 'react';
import {
  Eye,
  BarChart3,
  Clock,
  Target,
  Gauge,
  Lock,
  Unlock,
  ChevronRight,
  Sparkles,
  Shield,
  Users,
  Zap,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Heart,
  Activity,
  Bell,
  Crown
} from 'lucide-react';
import { GeneratedSignals, Signal } from '../../lib/signalGenerator';

interface Props {
  targetUsername: string;
  ownUsername: string;
  generatedSignals: GeneratedSignals;
  onUnlock: () => void;
}

const iconMap = {
  eye: Eye,
  chart: BarChart3,
  clock: Clock,
  target: Target,
  gauge: Gauge,
};

// Animated background with particles
function AnimatedBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Gradient orbs */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-rose-500/10 rounded-full blur-[100px] animate-float-slow" />
      <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-orange-500/8 rounded-full blur-[120px] animate-float-slower" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-purple-500/5 rounded-full blur-[150px]" />
      
      {/* Floating particles */}
      {[...Array(20)].map((_, i) => (
        <div
          key={i}
          className="absolute w-1 h-1 bg-rose-400/30 rounded-full animate-float-particle"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 5}s`,
            animationDuration: `${8 + Math.random() * 4}s`,
          }}
        />
      ))}
    </div>
  );
}

// Pulsing notification dot
function PulsingDot({ color = 'rose' }: { color?: string }) {
  const colorClasses = {
    rose: 'bg-rose-400',
    emerald: 'bg-emerald-400',
    amber: 'bg-amber-400',
  };
  
  return (
    <span className="relative flex h-2.5 w-2.5">
      <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${colorClasses[color as keyof typeof colorClasses]} opacity-75`} />
      <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${colorClasses[color as keyof typeof colorClasses]}`} />
    </span>
  );
}

// Animated counter component
function AnimatedCounter({ target, duration = 2000, suffix = '' }: { target: number; duration?: number; suffix?: string }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const steps = 40;
    const increment = target / steps;
    let current = 0;
    const stepDuration = duration / steps;

    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, stepDuration);

    return () => clearInterval(timer);
  }, [target, duration]);

  return <span>{count}{suffix}</span>;
}

// Interest progress bar based on onboarding answers
function InterestProgressCard({ targetUsername, generatedSignals }: { targetUsername: string; generatedSignals: GeneratedSignals }) {
  // Use the pre-calculated interest score from generated signals
  const interestScore = generatedSignals.interestScore;
  
  const [displayedScore, setDisplayedScore] = useState(0);
  const [isAnimating, setIsAnimating] = useState(true);
  
  // Animate the progress bar
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsAnimating(true);
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
        } else {
          setIsAnimating(false);
        }
      };
      
      requestAnimationFrame(animate);
    }, 500);
    
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
  
  return (
    <div className="relative mb-6">
      {/* Glow effect */}
      <div className="absolute -inset-1 bg-gradient-to-r from-rose-500/30 via-orange-500/20 to-rose-500/30 rounded-2xl blur-xl" />
      
      <div className="relative bg-slate-800/90 backdrop-blur-xl rounded-2xl border border-rose-500/30 p-5 overflow-hidden">
        {/* Animated background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-rose-500/5 via-transparent to-orange-500/5" />
        
        <div className="relative">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-orange-500 flex items-center justify-center text-white font-bold shadow-lg shadow-rose-500/25">
                {targetUsername.charAt(0).toUpperCase()}
              </div>
              <div>
                <span className="text-lg font-bold text-white">@{targetUsername}</span>
                <p className="text-xs text-slate-400">Niveau d'intérêt détecté</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">{scoreInfo.emoji}</span>
              <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                scoreInfo.color === 'rose' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
                scoreInfo.color === 'orange' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' :
                scoreInfo.color === 'amber' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                'bg-slate-500/20 text-slate-400 border border-slate-500/30'
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
                <span className={`text-5xl font-bold bg-gradient-to-r ${
                  displayedScore >= 80 ? 'from-rose-400 to-red-400' :
                  displayedScore >= 65 ? 'from-orange-400 to-amber-400' :
                  displayedScore >= 50 ? 'from-amber-400 to-yellow-400' :
                  'from-emerald-400 to-green-400'
                } bg-clip-text text-transparent`}>
                  {displayedScore}
                </span>
                <span className="text-2xl text-slate-500 font-medium">/100</span>
              </div>
              
              {isAnimating && (
                <div className="flex items-center gap-1.5 text-xs text-rose-400">
                  <div className="w-1.5 h-1.5 bg-rose-400 rounded-full animate-pulse" />
                  <span>Calcul en cours...</span>
                </div>
              )}
            </div>
            
            {/* Progress bar */}
            <div className="relative">
              {/* Background track */}
              <div className="h-4 bg-slate-700/50 rounded-full overflow-hidden">
                {/* Animated gradient bar - Red=High, Orange=Elevated, Amber=Moderate, Green=Low */}
                <div 
                  className={`h-full rounded-full transition-all duration-1000 ease-out relative overflow-hidden ${
                    displayedScore >= 80 ? 'bg-gradient-to-r from-rose-500 via-red-500 to-rose-400' :
                    displayedScore >= 65 ? 'bg-gradient-to-r from-orange-500 via-amber-500 to-orange-400' :
                    displayedScore >= 50 ? 'bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-400' :
                    'bg-gradient-to-r from-emerald-500 via-green-500 to-emerald-400'
                  }`}
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
              Basé sur l'analyse de <span className="text-rose-400 font-medium">5 signaux</span> comportementaux
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Stats grid showing key metrics - Enhanced version with equal card heights
function StatsGrid({ generatedSignals, onUnlock }: { generatedSignals: GeneratedSignals; onUnlock: () => void }) {
  // Use the visits count and interest score from generated signals for consistency
  const visitCount = generatedSignals.visitsCount;
  const interestLevel = generatedSignals.interestScore;

  return (
    <div className="grid grid-cols-2 gap-3 mb-6">
      {/* Visits Card - Visible teaser */}
      <div className="relative group h-[140px]">
        <div className="absolute inset-0 bg-gradient-to-br from-rose-500/20 to-orange-500/20 rounded-2xl blur-xl opacity-50 group-hover:opacity-70 transition-opacity" />
        <div className="relative h-full bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl rounded-2xl border border-rose-500/30 p-4 overflow-hidden flex flex-col">
          <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-rose-500/20 to-transparent rounded-full -translate-y-1/2 translate-x-1/2" />
          
          <div className="relative flex-1 flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-rose-500 to-orange-500 flex items-center justify-center shadow-lg shadow-rose-500/25">
                <Eye className="w-4 h-4 text-white" />
              </div>
              <div className="flex items-center gap-1 px-2 py-0.5 bg-rose-500/20 rounded-full border border-rose-500/30">
                <span className="w-1.5 h-1.5 bg-rose-400 rounded-full animate-pulse" />
                <span className="text-[10px] text-rose-400 font-medium">Détecté</span>
              </div>
            </div>
            
            <span className="text-xs text-slate-400 font-medium">Visites</span>
            
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-3xl font-bold text-rose-400 animate-pulse-number">
                <AnimatedCounter target={visitCount} />
              </span>
              <span className="text-sm text-rose-300/60 font-medium">visites</span>
            </div>
            
            <div className="mt-auto">
              <div className="h-1.5 bg-slate-700/50 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-rose-500 to-orange-400 rounded-full" style={{ width: '70%' }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Interest Level Card - Locked */}
      <div className="relative group h-[140px] cursor-pointer" onClick={onUnlock}>
        <div className="absolute inset-0 bg-gradient-to-br from-pink-500/20 to-rose-500/20 rounded-2xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity" />
        <div className="relative h-full bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl rounded-2xl border border-pink-500/20 p-4 overflow-hidden flex flex-col">
          <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-pink-500/10 to-transparent rounded-full -translate-y-1/2 translate-x-1/2" />
          
          {/* Lock overlay on hover */}
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-[3px] rounded-2xl z-10 flex flex-col items-center justify-center gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-300">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center shadow-lg animate-pulse">
              <Lock className="w-5 h-5 text-white" />
            </div>
            <span className="text-white text-sm font-medium">Débloquer</span>
          </div>
          
          <div className="relative flex-1 flex flex-col">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center shadow-lg shadow-pink-500/25">
                <Heart className="w-4 h-4 text-white" />
              </div>
            </div>
            
            <span className="text-xs text-slate-400 font-medium">Niveau d'intérêt</span>
            
            <div className="flex items-baseline gap-1 mt-0.5 blur-[5px]">
              <span className="text-3xl font-bold text-white">{interestLevel}%</span>
            </div>
            
            <div className="mt-auto flex items-center gap-2 blur-[4px]">
              <div className="w-6 h-6 rounded-full border-2 border-rose-500" />
              <span className="text-[10px] text-slate-400">Élevé</span>
            </div>
          </div>
          
          <div className="absolute bottom-2 right-2 w-5 h-5 rounded-full bg-slate-800/80 flex items-center justify-center border border-rose-500/30 z-20">
            <Lock className="w-2.5 h-2.5 text-rose-400" />
          </div>
        </div>
      </div>

      {/* Last Visit Card - Locked */}
      <div className="relative group h-[140px] cursor-pointer" onClick={onUnlock}>
        <div className="absolute inset-0 bg-gradient-to-br from-violet-500/20 to-purple-500/20 rounded-2xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity" />
        <div className="relative h-full bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl rounded-2xl border border-violet-500/20 p-4 overflow-hidden flex flex-col">
          <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-violet-500/10 to-transparent rounded-full -translate-y-1/2 translate-x-1/2" />
          
          {/* Lock overlay on hover */}
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-[3px] rounded-2xl z-10 flex flex-col items-center justify-center gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-300">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center shadow-lg animate-pulse">
              <Lock className="w-5 h-5 text-white" />
            </div>
            <span className="text-white text-sm font-medium">Débloquer</span>
          </div>
          
          <div className="relative flex-1 flex flex-col">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center shadow-lg shadow-violet-500/25">
                <Clock className="w-4 h-4 text-white" />
              </div>
            </div>
            
            <span className="text-xs text-slate-400 font-medium">Dernière visite</span>
            
            <div className="mt-0.5 blur-[5px]">
              <div className="text-lg font-bold text-white leading-tight">
                {generatedSignals.lastVisit}
              </div>
            </div>
            
            <div className="mt-auto flex items-center gap-1 text-[10px] text-slate-500 blur-[3px]">
              <Activity className="w-3 h-3" />
              <span>Récent</span>
            </div>
          </div>
          
          <div className="absolute bottom-2 right-2 w-5 h-5 rounded-full bg-slate-800/80 flex items-center justify-center border border-violet-500/30 z-20">
            <Lock className="w-2.5 h-2.5 text-violet-400" />
          </div>
        </div>
      </div>

      {/* Frequency Card - Locked */}
      <div className="relative group h-[140px] cursor-pointer" onClick={onUnlock}>
        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-2xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity" />
        <div className="relative h-full bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl rounded-2xl border border-amber-500/20 p-4 overflow-hidden flex flex-col">
          <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-amber-500/10 to-transparent rounded-full -translate-y-1/2 translate-x-1/2" />
          
          {/* Lock overlay on hover */}
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-[3px] rounded-2xl z-10 flex flex-col items-center justify-center gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-300">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg animate-pulse">
              <Lock className="w-5 h-5 text-white" />
            </div>
            <span className="text-white text-sm font-medium">Débloquer</span>
          </div>
          
          <div className="relative flex-1 flex flex-col">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/25">
                <Activity className="w-4 h-4 text-white" />
              </div>
            </div>
            
            <span className="text-xs text-slate-400 font-medium">Fréquence</span>
            
            <div className="mt-0.5 blur-[5px]">
              <div className="text-lg font-bold text-white">Modérée</div>
            </div>
            
            <div className="mt-auto blur-[4px]">
              <div className="flex items-end gap-0.5 h-5">
                {[40, 65, 45, 80, 55, 70, 60].map((height, i) => (
                  <div
                    key={i}
                    className="flex-1 bg-gradient-to-t from-amber-500 to-orange-400 rounded-sm"
                    style={{ height: `${height}%`, opacity: 0.5 + (i * 0.07) }}
                  />
                ))}
              </div>
            </div>
          </div>
          
          <div className="absolute bottom-2 right-2 w-5 h-5 rounded-full bg-slate-800/80 flex items-center justify-center border border-amber-500/30 z-20">
            <Lock className="w-2.5 h-2.5 text-amber-400" />
          </div>
        </div>
      </div>
    </div>
  );
}

// Locked signal card with hover effects
function LockedSignalCard({ signal, index, onUnlock }: { signal: Signal; index: number; onUnlock: () => void }) {
  const Icon = iconMap[signal.iconType];
  const [isHovered, setIsHovered] = useState(false);

  // Color scheme: High = Red (danger), Medium = Orange, Low = Green (safe)
  const intensityConfig = {
    high: {
      gradient: 'from-rose-500 to-red-500',
      shadow: 'shadow-rose-500/30',
      badge: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
      badgeText: 'Signal fort',
    },
    medium: {
      gradient: 'from-amber-500 to-orange-500',
      shadow: 'shadow-amber-500/20',
      badge: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
      badgeText: 'Signal modéré',
    },
    low: {
      gradient: 'from-emerald-500 to-green-500',
      shadow: 'shadow-emerald-500/20',
      badge: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      badgeText: 'Signal faible',
    },
  };

  const config = intensityConfig[signal.intensity];
  const blurLevel = index === 0 ? 'blur-[5px]' : index <= 2 ? 'blur-[7px]' : 'blur-[9px]';
  const previewLength = index === 0 ? 100 : index <= 2 ? 70 : 40;

  return (
    <div
      className="group relative cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onUnlock}
    >
      <div className={`relative bg-slate-800/60 backdrop-blur-sm rounded-2xl border transition-all duration-300 overflow-hidden ${
        isHovered ? 'border-rose-500/50 transform scale-[1.01]' : 'border-slate-700/50'
      }`}>
        {/* Hover overlay */}
        <div className={`absolute inset-0 bg-gradient-to-br from-rose-500/10 to-orange-500/10 transition-opacity duration-300 ${
          isHovered ? 'opacity-100' : 'opacity-0'
        }`} />
        
        {/* Unlock prompt on hover */}
        <div className={`absolute inset-0 z-20 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm transition-opacity duration-300 ${
          isHovered ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}>
          <div className="text-center">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-500 to-orange-500 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-rose-500/30 animate-pulse">
              <Unlock className="w-7 h-7 text-white" />
            </div>
            <p className="text-white font-semibold">Débloquer ce signal</p>
            <p className="text-slate-400 text-sm mt-1">Cliquez pour voir les détails</p>
          </div>
        </div>

        <div className="relative p-5">
          <div className="flex items-start gap-4">
            {/* Icon */}
            <div className={`flex-shrink-0 w-14 h-14 rounded-xl bg-gradient-to-br ${config.gradient} flex items-center justify-center shadow-lg ${config.shadow}`}>
              <Icon className="w-7 h-7 text-white" />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <h3 className="font-semibold text-white text-lg">{signal.title}</h3>
                <span className={`px-2 py-0.5 text-xs font-medium rounded-full border ${config.badge}`}>
                  {config.badgeText}
                </span>
              </div>

              {/* Blurred preview */}
              <div className="relative">
                <p className={`text-slate-400 text-sm leading-relaxed ${blurLevel} select-none`}>
                  {signal.preview.substring(0, previewLength)}...
                </p>
              </div>
            </div>

            {/* Lock icon */}
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-slate-700/50 flex items-center justify-center">
              <Lock className="w-5 h-5 text-slate-400" />
            </div>
          </div>

          {/* Progress indicator for certain signals */}
          {(signal.iconType === 'gauge' || signal.iconType === 'chart') && (
            <div className="mt-4 pt-4 border-t border-slate-700/50">
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="text-slate-500">Intensité du signal</span>
                <span className={`font-medium ${
                  signal.intensity === 'high' ? 'text-rose-400' : signal.intensity === 'low' ? 'text-emerald-400' : 'text-amber-400'
                }`}>
                  {signal.intensity === 'high' ? 'Élevée' : signal.intensity === 'low' ? 'Faible' : 'Modérée'}
                </span>
              </div>
              <div className="h-2 bg-slate-700/50 rounded-full overflow-hidden">
                <div
                  className={`h-full bg-gradient-to-r ${config.gradient} rounded-full blur-[2px]`}
                  style={{ width: signal.intensity === 'high' ? '85%' : signal.intensity === 'low' ? '30%' : '55%' }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Get daily count based on date (same logic as landing page)
function getDailyCount() {
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

  return Math.abs(hash) % 1701 + 800;
}

// Social proof with live updates
function SocialProofBanner() {
  const baseCount = useMemo(() => getDailyCount(), []);
  const [count, setCount] = useState(baseCount);
  const [recentUser, setRecentUser] = useState('Marie');
  
  const names = ['Thomas', 'Emma', 'Lucas', 'Léa', 'Hugo', 'Chloé', 'Nathan', 'Jade', 'Louis', 'Sarah'];

  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.6) {
        setCount(prev => prev + 1);
        setRecentUser(names[Math.floor(Math.random() * names.length)]);
      }
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-emerald-500/10 border-y border-emerald-500/20 py-3 mb-6">
      <div className="max-w-2xl mx-auto px-4">
        <div className="flex items-center justify-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="flex -space-x-2">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="w-7 h-7 rounded-full bg-gradient-to-br from-rose-400 to-orange-500 border-2 border-slate-900 flex items-center justify-center text-white text-xs font-bold"
                >
                  {['M', 'T', 'L', 'E'][i]}
                </div>
              ))}
            </div>
            <span className="text-emerald-300 text-sm">
              <span className="font-semibold">{count}</span> déblocages aujourd'hui
            </span>
          </div>
          <span className="text-slate-600">•</span>
          <span className="text-slate-400 text-sm">
            <span className="text-emerald-400">{recentUser}</span> vient de débloquer
          </span>
        </div>
      </div>
    </div>
  );
}

// Urgency notification
function UrgencyAlert({ targetUsername }: { targetUsername: string }) {
  const [timeAgo] = useState(() => {
    const minutes = Math.floor(Math.random() * 30) + 5;
    return minutes < 60 ? `${minutes} min` : `${Math.floor(minutes / 60)}h`;
  });

  return (
    <div className="relative mb-6 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/10 animate-pulse" />
      
      <div className="relative bg-slate-800/50 backdrop-blur-sm border border-amber-500/30 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0 animate-bounce">
            <Bell className="w-5 h-5 text-amber-400" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-semibold text-amber-300">Nouvelle activité détectée</h4>
              <span className="text-xs text-slate-500">il y a {timeAgo}</span>
            </div>
            <p className="text-sm text-slate-300">
              <span className="font-medium text-white">@{targetUsername}</span> a consulté ton profil récemment. 
              Les données sont fraîches et prêtes à être analysées.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Main CTA section
function UnlockCTA({ onUnlock, targetUsername }: { onUnlock: () => void; targetUsername: string }) {
  return (
    <div className="relative">
      {/* Animated glow */}
      <div className="absolute -inset-2 bg-gradient-to-r from-rose-500 via-orange-500 to-rose-500 rounded-3xl blur-xl opacity-30 animate-pulse" />

      <div className="relative bg-gradient-to-b from-slate-800 to-slate-900 rounded-2xl border border-rose-500/30 overflow-hidden">
        {/* Premium badge */}
        <div className="absolute top-4 right-4">
          <div className="flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-amber-500/20 to-orange-500/20 rounded-full border border-amber-500/30">
            <Crown className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-medium text-amber-300">Premium</span>
          </div>
        </div>

        <div className="p-6 pt-8">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-rose-500 to-orange-500 flex items-center justify-center mx-auto mb-4 shadow-xl shadow-rose-500/30">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">
              Débloque l'analyse complète
            </h3>
            <p className="text-slate-400 text-sm">
              Découvre tout ce que <span className="text-rose-400 font-medium">@{targetUsername}</span> fait sur ton profil
            </p>
          </div>

          {/* Features */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {[
              { icon: Eye, text: '5 signaux détaillés' },
              { icon: Clock, text: 'Dernière visite exacte' },
              { icon: TrendingUp, text: 'Analyse comportementale' },
              { icon: Target, text: 'Prédictions IA' },
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-2 p-3 bg-slate-800/50 rounded-xl border border-slate-700/50">
                <feature.icon className="w-4 h-4 text-emerald-400" />
                <span className="text-sm text-slate-300">{feature.text}</span>
              </div>
            ))}
          </div>

          {/* Price display */}
          <div className="text-center mb-6 py-4 bg-slate-800/30 rounded-xl border border-slate-700/50">
            <div className="text-sm text-slate-400 mb-1">À partir de</div>
            <div className="flex items-center justify-center gap-2">
              <span className="text-slate-500 line-through text-lg">12,99€</span>
              <span className="text-4xl font-bold text-white">6,99€</span>
            </div>
            <div className="text-xs text-emerald-400 mt-1">Offre limitée • -46%</div>
          </div>

          {/* CTA Button */}
          <button
            onClick={onUnlock}
            className="w-full py-4 px-6 bg-gradient-to-r from-rose-500 to-orange-500 hover:from-rose-400 hover:to-orange-400 text-white font-bold text-lg rounded-xl transition-all shadow-xl shadow-rose-500/25 hover:shadow-rose-500/40 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3"
          >
            <Unlock className="w-6 h-6" />
            <span>Débloquer maintenant</span>
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Trust badges */}
          <div className="flex items-center justify-center gap-6 mt-4">
            <div className="flex items-center gap-1.5 text-slate-500 text-xs">
              <Shield className="w-4 h-4" />
              <span>Paiement sécurisé</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-500 text-xs">
              <Zap className="w-4 h-4" />
              <span>Accès instantané</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-500 text-xs">
              <CheckCircle2 className="w-4 h-4" />
              <span>Satisfait ou remboursé</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Interpretation teaser
function InterpretationTeaser({ generatedSignals }: { generatedSignals: GeneratedSignals }) {
  return (
    <div className="bg-slate-800/40 backdrop-blur-sm rounded-xl border border-slate-700/50 p-5 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
          <TrendingUp className="w-4 h-4 text-purple-400" />
        </div>
        <h3 className="font-semibold text-white">Interprétation IA</h3>
        <div className="ml-auto flex items-center gap-1 text-slate-500">
          <Lock className="w-4 h-4" />
        </div>
      </div>

      <div className="relative">
        <p className="text-slate-400 text-sm leading-relaxed blur-[6px] select-none">
          {generatedSignals.interpretation.main.substring(0, 180)}...
        </p>
        
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-slate-900/90 backdrop-blur-sm px-4 py-2 rounded-lg border border-rose-500/30 shadow-lg">
            <span className="text-sm flex items-center gap-2 text-white">
              <Lock className="w-4 h-4 text-rose-400" />
              Débloquer l'interprétation complète
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Main component
export default function ResultsPreview({ targetUsername, ownUsername, generatedSignals, onUnlock }: Props) {
  const { signals, personalizedTitle } = generatedSignals;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 relative">
      <AnimatedBackground />

      {/* Header */}
      <header className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur-xl border-b border-slate-800">
        <div className="max-w-2xl mx-auto px-4 py-3">
          <div className="flex items-center justify-center gap-2">
            <img src="/silentview-logo.png" alt="SilentView" className="h-8 w-auto" />
            <span className="text-lg font-bold">
              <span className="text-white">Silent</span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-orange-500">View</span>
            </span>
          </div>
        </div>
      </header>

      <SocialProofBanner />

      <main className="max-w-2xl mx-auto px-4 pb-8 relative z-10">
        {/* Success badge */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm mb-4">
            <CheckCircle2 className="w-4 h-4" />
            <span>Analyse terminée avec succès</span>
          </div>

          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
            {personalizedTitle.title}
          </h1>
        </div>

        {/* Interest progress bar */}
        <InterestProgressCard targetUsername={targetUsername} generatedSignals={generatedSignals} />

        {/* Urgency alert */}
        <UrgencyAlert targetUsername={targetUsername} />

        {/* Stats grid */}
        <StatsGrid generatedSignals={generatedSignals} onUnlock={onUnlock} />

        {/* Signals section */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-white flex items-center gap-2">
              <Eye className="w-5 h-5 text-rose-400" />
              Signaux détectés
            </h2>
            <span className="text-xs text-slate-500 flex items-center gap-1">
              <Lock className="w-3.5 h-3.5" />
              5 signaux à débloquer
            </span>
          </div>

          <div className="space-y-3">
            {signals.map((signal, index) => (
              <LockedSignalCard 
                key={index} 
                signal={signal} 
                index={index}
                onUnlock={onUnlock}
              />
            ))}
          </div>
        </div>

        {/* Interpretation teaser */}
        <InterpretationTeaser generatedSignals={generatedSignals} />

        {/* Main CTA */}
        <UnlockCTA onUnlock={onUnlock} targetUsername={targetUsername} />

        {/* Footer */}
        <p className="text-center text-xs text-slate-600 mt-6">
          Outil de visualisation interprétative • Résultats basés sur l'analyse de données publiques
        </p>
      </main>
    </div>
  );
}
