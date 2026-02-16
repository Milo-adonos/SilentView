import { useEffect, useState, useRef } from 'react';
import { Search, Activity, Eye, Clock, GitMerge, Target, FileText, Check } from 'lucide-react';

interface AnalysisStep {
  id: number;
  label: string;
  icon: React.ElementType;
  baseDuration: number;
  message: string;
  subMessages: string[];
  hasPause: boolean;
  pauseAt?: number; // Percentage where pause occurs
  pauseDuration?: number;
}

// Steps with variable timing for realism (total ~35-42 seconds)
const steps: AnalysisStep[] = [
  { 
    id: 1, 
    label: 'Recherche du compte', 
    icon: Search, 
    baseDuration: 4000, 
    message: 'Localisation des données publiques...',
    subMessages: ['Connexion aux serveurs...', 'Recherche en cours...', 'Compte localisé...'],
    hasPause: false
  },
  { 
    id: 2, 
    label: 'Analyse du comportement', 
    icon: Activity, 
    baseDuration: 5500, 
    message: 'Étude des patterns d\'interaction...',
    subMessages: ['Collecte des métadonnées...', 'Analyse des interactions...', 'Patterns identifiés...'],
    hasPause: true,
    pauseAt: 45,
    pauseDuration: 1200
  },
  { 
    id: 3, 
    label: 'Détection des visites', 
    icon: Eye, 
    baseDuration: 6000, 
    message: 'Identification des signaux récurrents...',
    subMessages: ['Scan des traces numériques...', 'Détection des visites...', 'Signaux confirmés...'],
    hasPause: true,
    pauseAt: 60,
    pauseDuration: 1800
  },
  { 
    id: 4, 
    label: 'Moments clés', 
    icon: Clock, 
    baseDuration: 5000, 
    message: 'Analyse temporelle des activités...',
    subMessages: ['Horodatage des événements...', 'Analyse des fréquences...', 'Moments clés extraits...'],
    hasPause: false
  },
  { 
    id: 5, 
    label: 'Croisement des signaux', 
    icon: GitMerge, 
    baseDuration: 6500, 
    message: 'Corrélation des données collectées...',
    subMessages: ['Synchronisation des données...', 'Corrélation en cours...', 'Vérification des résultats...'],
    hasPause: true,
    pauseAt: 35,
    pauseDuration: 2000
  },
  { 
    id: 6, 
    label: 'Évaluation attention', 
    icon: Target, 
    baseDuration: 5500, 
    message: 'Mesure du niveau d\'intérêt...',
    subMessages: ['Calcul du score d\'attention...', 'Évaluation de l\'intérêt...', 'Score finalisé...'],
    hasPause: true,
    pauseAt: 70,
    pauseDuration: 1500
  },
  { 
    id: 7, 
    label: 'Génération rapport', 
    icon: FileText, 
    baseDuration: 4500, 
    message: 'Compilation des résultats...',
    subMessages: ['Génération du rapport...', 'Mise en forme...', 'Rapport prêt...'],
    hasPause: false
  },
];

interface Props {
  username: string;
  onComplete: () => void;
}

function useMousePosition() {
  const [position, setPosition] = useState({ x: 0.5, y: 0.5 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setPosition({
        x: e.clientX / window.innerWidth,
        y: e.clientY / window.innerHeight,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return position;
}

function InteractiveRadar({ mousePosition, isTransitioning }: { mousePosition: { x: number; y: number }; isTransitioning: boolean }) {
  const [detectionPoints, setDetectionPoints] = useState<{ id: number; angle: number; distance: number }[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.6) {
        const newPoint = {
          id: Date.now(),
          angle: Math.random() * 360,
          distance: 0.3 + Math.random() * 0.6,
        };
        setDetectionPoints(prev => [...prev.slice(-8), newPoint]);
      }
    }, 800);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const cleanup = setInterval(() => {
      setDetectionPoints(prev => prev.filter(p => Date.now() - p.id < 3000));
    }, 1000);
    return () => clearInterval(cleanup);
  }, []);

  const offsetX = (mousePosition.x - 0.5) * 30;
  const offsetY = (mousePosition.y - 0.5) * 30;

  return (
    <div
      className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden"
      style={{
        transform: `translate(${offsetX}px, ${offsetY}px)`,
        transition: 'transform 0.3s ease-out',
      }}
    >
      <div className={`relative w-[600px] h-[600px] transition-all duration-500 ${isTransitioning ? 'scale-110 opacity-80' : 'scale-100 opacity-100'}`}>
        <div className="absolute inset-0 rounded-full border border-rose-500/20 animate-radar-pulse" />
        <div className="absolute inset-16 rounded-full border border-rose-500/15 animate-radar-pulse" style={{ animationDelay: '0.5s' }} />
        <div className="absolute inset-32 rounded-full border border-rose-500/10 animate-radar-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute inset-44 rounded-full border border-rose-400/20" />

        <div className="absolute inset-0 animate-radar-rotate">
          <div
            className="absolute top-1/2 left-1/2 w-1/2 h-0.5 origin-left"
            style={{
              background: 'linear-gradient(90deg, rgba(244, 63, 94, 0.8), transparent)',
              transform: 'translateY(-50%)',
            }}
          />
          <div
            className="absolute top-1/2 left-1/2 w-1/2 h-16 origin-left"
            style={{
              background: 'linear-gradient(90deg, rgba(244, 63, 94, 0.15), transparent)',
              transform: 'translateY(-50%) rotate(-15deg)',
              filter: 'blur(8px)',
            }}
          />
        </div>

        {detectionPoints.map((point) => {
          const radians = (point.angle * Math.PI) / 180;
          const x = 50 + Math.cos(radians) * point.distance * 45;
          const y = 50 + Math.sin(radians) * point.distance * 45;
          return (
            <div
              key={point.id}
              className="absolute w-2 h-2 rounded-full bg-rose-400"
              style={{
                left: `${x}%`,
                top: `${y}%`,
                transform: 'translate(-50%, -50%)',
                boxShadow: '0 0 10px rgba(244, 63, 94, 0.8)',
              }}
            >
              <div className="absolute inset-0 rounded-full bg-rose-400 animate-detection-ping" />
            </div>
          );
        })}

        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-3 h-3 rounded-full bg-rose-400" style={{ boxShadow: '0 0 20px rgba(244, 63, 94, 0.8)' }} />
        </div>
      </div>
    </div>
  );
}

function DataStream() {
  const streams = Array.from({ length: 12 }, (_, i) => ({
    id: i,
    left: `${5 + i * 8}%`,
    delay: `${i * 0.3}s`,
    duration: `${4 + Math.random() * 3}s`,
    chars: Array.from({ length: 15 }, () =>
      Math.random() > 0.5 ? String.fromCharCode(48 + Math.floor(Math.random() * 10)) : String.fromCharCode(65 + Math.floor(Math.random() * 26))
    ).join('\n'),
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
      {streams.map((stream) => (
        <div
          key={stream.id}
          className="absolute top-0 text-rose-400 text-xs font-mono whitespace-pre leading-6"
          style={{
            left: stream.left,
            animation: `data-stream ${stream.duration} linear infinite`,
            animationDelay: stream.delay,
          }}
        >
          {stream.chars}
        </div>
      ))}
    </div>
  );
}

function ScanLine() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div
        className="absolute left-0 w-full h-px bg-gradient-to-r from-transparent via-rose-400/50 to-transparent animate-scan-horizontal"
        style={{ top: '30%' }}
      />
    </div>
  );
}

function StepCard({ step, progress, signalsDetected, isExiting, isPaused, currentSubMessage }: {
  step: AnalysisStep;
  progress: number;
  signalsDetected: number;
  isExiting: boolean;
  isPaused: boolean;
  currentSubMessage: number;
}) {
  const Icon = step.icon;
  const [displayedMessage, setDisplayedMessage] = useState('');
  const currentMessage = step.subMessages[currentSubMessage] || step.message;

  useEffect(() => {
    setDisplayedMessage('');
    let index = 0;
    const speed = isPaused ? 80 : 35; // Slower typing during pause
    const interval = setInterval(() => {
      if (index < currentMessage.length) {
        setDisplayedMessage(currentMessage.slice(0, index + 1));
        index++;
      } else {
        clearInterval(interval);
      }
    }, speed);
    return () => clearInterval(interval);
  }, [currentMessage, isPaused]);

  return (
    <div className={`relative ${isExiting ? 'animate-card-exit' : 'animate-card-emerge'}`}>
      <div className={`relative bg-slate-800/60 backdrop-blur-xl rounded-3xl border p-8 md:p-10 transition-all duration-300 ${
        isPaused ? 'border-amber-500/50 animate-pulse' : 'border-rose-500/30 animate-glow-pulse'
      }`}>
        <div className={`absolute -top-1 -left-1 -right-1 -bottom-1 rounded-3xl blur-xl -z-10 transition-colors duration-300 ${
          isPaused ? 'bg-gradient-to-br from-amber-500/20 to-orange-500/20' : 'bg-gradient-to-br from-rose-500/20 to-orange-500/20'
        }`} />

        <div className="flex flex-col items-center text-center">
          <div className="relative mb-6">
            <div className={`w-24 h-24 rounded-2xl flex items-center justify-center transition-all duration-300 ${
              isPaused 
                ? 'bg-gradient-to-br from-amber-500 to-orange-600 animate-pulse' 
                : 'bg-gradient-to-br from-rose-500 to-orange-600 animate-icon-pulse'
            }`}>
              <Icon className="w-12 h-12 text-white" />
            </div>
            <div className={`absolute -inset-2 rounded-2xl blur-xl -z-10 transition-colors duration-300 ${
              isPaused ? 'bg-amber-500/20' : 'bg-rose-500/20'
            }`} />
            
            {/* Pause indicator */}
            {isPaused && (
              <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-amber-500 flex items-center justify-center animate-bounce">
                <div className="w-1.5 h-3 border-l-2 border-r-2 border-white" />
              </div>
            )}
          </div>

          <h3 className="text-2xl md:text-3xl font-bold text-white mb-3">
            {step.label}
          </h3>

          <p className={`mb-6 h-6 font-mono text-sm transition-colors duration-300 ${
            isPaused ? 'text-amber-400' : 'text-slate-400'
          }`}>
            {displayedMessage}
            <span className={`inline-block w-0.5 h-4 ml-1 ${
              isPaused ? 'bg-amber-400 animate-pulse' : 'bg-rose-400 animate-pulse'
            }`} />
          </p>

          <div className="w-full max-w-xs mb-4">
            <div className="h-2.5 bg-slate-700/50 rounded-full overflow-hidden relative">
              <div
                className={`h-full rounded-full transition-all duration-150 ease-out ${
                  isPaused 
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500' 
                    : 'bg-gradient-to-r from-rose-500 to-orange-500'
                }`}
                style={{ width: `${Math.max(progress, 0)}%` }}
              />
              {/* Shimmer effect on progress bar */}
              {!isPaused && (
                <div 
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                  style={{ 
                    transform: `translateX(${-100 + progress}%)`,
                    transition: 'transform 0.3s ease-out'
                  }}
                />
              )}
            </div>
            {isPaused && (
              <p className="text-amber-400/80 text-xs mt-2 animate-pulse">
                Vérification des données...
              </p>
            )}
          </div>

          <div className={`flex items-center gap-2 transition-colors duration-300 ${
            isPaused ? 'text-amber-400' : 'text-rose-400'
          }`}>
            <Activity className={`w-4 h-4 ${isPaused ? '' : 'animate-pulse'}`} />
            <span className="font-mono text-sm">
              {signalsDetected.toLocaleString()} signaux analysés
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function MilestoneBar({ currentStep, completedSteps }: { currentStep: number; completedSteps: number[] }) {
  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="relative flex items-center justify-between">
        <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-slate-700/50 -translate-y-1/2" />
        <div
          className="absolute left-0 top-1/2 h-0.5 bg-gradient-to-r from-rose-500 to-orange-500 -translate-y-1/2 transition-all duration-500"
          style={{ width: `${((completedSteps.length) / (steps.length - 1)) * 100}%` }}
        />

        {steps.map((step) => {
          const Icon = step.icon;
          const isCompleted = completedSteps.includes(step.id);
          const isActive = currentStep === step.id - 1;

          return (
            <div key={step.id} className="relative z-10 flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${
                  isCompleted
                    ? 'bg-gradient-to-br from-emerald-500 to-green-600 shadow-lg shadow-emerald-500/30 animate-milestone-complete'
                    : isActive
                    ? 'bg-gradient-to-br from-rose-500 to-orange-600 shadow-lg shadow-rose-500/30 scale-110'
                    : 'bg-slate-700/80'
                }`}
              >
                {isCompleted ? (
                  <Check className="w-5 h-5 text-white" />
                ) : (
                  <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function AnalysisInProgress({ username, onComplete }: Props) {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [stepProgress, setStepProgress] = useState(0);
  const [signalsDetected, setSignalsDetected] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentSubMessage, setCurrentSubMessage] = useState(0);
  const mousePosition = useMousePosition();
  const progressRef = useRef(0);
  const signalsRef = useRef(0);
  const animationFrameRef = useRef<number>();
  const pauseTimeoutRef = useRef<number>();
  const stepTimeoutRef = useRef<number>();
  const isPausedRef = useRef(false);
  const pauseStartTimeRef = useRef<number | null>(null);
  const totalPausedTimeRef = useRef(0);
  // Final signal count between 112 and 334
  const finalSignalCountRef = useRef(112 + Math.floor(Math.random() * 223));

  useEffect(() => {
    if (currentStep >= steps.length) {
      setTimeout(() => {
        onComplete();
      }, 500);
      return;
    }

    const step = steps[currentStep];
    // Add random variation to duration (+/- 15%)
    const durationVariation = 0.85 + Math.random() * 0.3;
    const totalDuration = step.baseDuration * durationVariation + (step.pauseDuration || 0);
    
    const startTime = Date.now();
    
    // Calculate signals for this step based on overall progress
    const totalSteps = steps.length;
    const stepStartProgress = currentStep / totalSteps;
    const stepEndProgress = (currentStep + 1) / totalSteps;
    const stepStartSignals = Math.floor(stepStartProgress * finalSignalCountRef.current);
    const stepEndSignals = Math.floor(stepEndProgress * finalSignalCountRef.current);
    
    let hasTriggeredPause = false;

    // Reset refs and state
    setCurrentSubMessage(0);
    progressRef.current = 0;
    isPausedRef.current = false;
    pauseStartTimeRef.current = null;
    totalPausedTimeRef.current = 0;
    setIsPaused(false);
    
    // Set initial signals for this step
    signalsRef.current = stepStartSignals;
    setSignalsDetected(stepStartSignals);

    // Sub-message cycling
    const subMessageInterval = setInterval(() => {
      setCurrentSubMessage(prev => {
        if (prev < step.subMessages.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, totalDuration / step.subMessages.length);

    const updateProgress = () => {
      const now = Date.now();
      
      // Handle pause state using ref
      if (isPausedRef.current && pauseStartTimeRef.current) {
        // During pause, add small micro-movements for realism
        const microProgress = Math.sin(now / 200) * 0.3;
        setStepProgress(progressRef.current + microProgress);
        animationFrameRef.current = requestAnimationFrame(updateProgress);
        return;
      }
      
      // Calculate elapsed time minus any paused time
      const elapsed = now - startTime - totalPausedTimeRef.current;
      const effectiveDuration = step.baseDuration * durationVariation;
      
      // Non-linear progress with easing for realism
      let rawProgress = elapsed / effectiveDuration;
      
      // Apply easing curve for non-uniform speed
      let easedProgress: number;
      if (rawProgress < 0.3) {
        // Fast start
        easedProgress = rawProgress * 1.2;
      } else if (rawProgress < 0.7) {
        // Slower middle section
        easedProgress = 0.36 + (rawProgress - 0.3) * 0.7;
      } else {
        // Speed up towards end
        easedProgress = 0.64 + (rawProgress - 0.7) * 1.2;
      }
      
      // Add small random fluctuations for realism
      const fluctuation = Math.sin(now / 150) * 0.5 + Math.random() * 0.3;
      const progress = Math.min(Math.max(easedProgress * 100 + fluctuation, progressRef.current), 100);
      
      progressRef.current = progress;
      setStepProgress(progress);

      // Update signals progressively within this step's range
      const signalProgress = progress / 100;
      const signalsInThisStep = stepEndSignals - stepStartSignals;
      const newSignals = stepStartSignals + Math.floor(signalProgress * signalsInThisStep);
      signalsRef.current = newSignals;
      setSignalsDetected(newSignals);

      // Trigger pause if needed and not yet triggered
      if (step.hasPause && !hasTriggeredPause && progress >= (step.pauseAt || 50)) {
        hasTriggeredPause = true;
        isPausedRef.current = true;
        pauseStartTimeRef.current = now;
        setIsPaused(true);
        
        pauseTimeoutRef.current = window.setTimeout(() => {
          totalPausedTimeRef.current += step.pauseDuration || 0;
          isPausedRef.current = false;
          pauseStartTimeRef.current = null;
          setIsPaused(false);
        }, step.pauseDuration || 1000);
      }

      if (progress < 100) {
        animationFrameRef.current = requestAnimationFrame(updateProgress);
      }
    };

    animationFrameRef.current = requestAnimationFrame(updateProgress);

    // Step completion
    stepTimeoutRef.current = window.setTimeout(() => {
      setIsTransitioning(true);

      setTimeout(() => {
        setCompletedSteps(prev => [...prev, step.id]);
        setCurrentStep(prev => prev + 1);
        setStepProgress(0);
        setIsTransitioning(false);
        setIsPaused(false);
        isPausedRef.current = false;
        progressRef.current = 0;
      }, 400);
    }, totalDuration);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (pauseTimeoutRef.current) {
        clearTimeout(pauseTimeoutRef.current);
      }
      if (stepTimeoutRef.current) {
        clearTimeout(stepTimeoutRef.current);
      }
      clearInterval(subMessageInterval);
    };
  }, [currentStep, onComplete]);

  const currentStepData = steps[currentStep];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 p-6 relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-rose-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl" />
      </div>

      <InteractiveRadar mousePosition={mousePosition} isTransitioning={isTransitioning} />
      <DataStream />
      <ScanLine />

      <div className="relative z-10 w-full max-w-lg flex flex-col items-center">
        <div className="text-center mb-8">
          <h2 className="text-xl md:text-2xl font-bold text-white mb-1">
            Scan de <span className="text-rose-400">@{username}</span>
          </h2>
          <p className="text-slate-500 text-sm">
            Étape {currentStep + 1} sur {steps.length}
          </p>
        </div>

        {currentStepData && (
          <StepCard
            step={currentStepData}
            progress={stepProgress}
            signalsDetected={signalsDetected}
            isExiting={isTransitioning}
            isPaused={isPaused}
            currentSubMessage={currentSubMessage}
          />
        )}

        <div className="mt-12 w-full px-4">
          <MilestoneBar currentStep={currentStep} completedSteps={completedSteps} />
        </div>

        <p className="text-center text-slate-600 text-xs mt-16">
          Veuillez ne pas quitter cette page
        </p>
      </div>
    </div>
  );
}
