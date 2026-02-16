import { useState, useEffect, useRef } from 'react';
import { ArrowRight, Shield, ArrowLeft, Sparkles, Scan, MapPin, CheckCircle } from 'lucide-react';
import { detectLocationFromIP, getDetectionDelay, DetectedLocation } from '../../lib/locationDetection';
import LocationMap from './LocationMap';

interface Props {
  onSubmit: (ownUsername: string, targetUsername: string, network: 'tiktok' | 'instagram') => void;
  onBack: () => void;
}

type Step = 'network' | 'own' | 'target' | 'detecting';
type SocialNetwork = 'tiktok' | 'instagram' | null;

function FloatingOrbs() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-rose-500/10 rounded-full blur-3xl animate-float-slow" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl animate-float-slower" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-slate-700/20 rounded-full blur-3xl" />
    </div>
  );
}

function RadarPulse() {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
      <div className="relative w-[600px] h-[600px]">
        <div className="absolute inset-0 rounded-full border border-rose-500/10 animate-radar-pulse" />
        <div className="absolute inset-8 rounded-full border border-rose-500/10 animate-radar-pulse animation-delay-500" />
        <div className="absolute inset-16 rounded-full border border-rose-500/10 animate-radar-pulse animation-delay-1000" />
      </div>
    </div>
  );
}

function StepIndicator({ currentStep, showDetecting }: { currentStep: Step; showDetecting: boolean }) {
  const steps = showDetecting
    ? ['network', 'own', 'target', 'detecting'] as const
    : ['network', 'own', 'target'] as const;
  const currentIndex = steps.indexOf(currentStep as typeof steps[number]);

  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {steps.map((step, index) => (
        <div key={step} className="flex items-center">
          <div
            className={`w-2.5 h-2.5 rounded-full transition-all duration-500 ${
              index <= currentIndex
                ? 'bg-gradient-to-r from-rose-400 to-orange-500 scale-100'
                : 'bg-slate-600 scale-75'
            }`}
          />
          {index < steps.length - 1 && (
            <div
              className={`w-8 h-0.5 mx-1 transition-all duration-500 ${
                index < currentIndex ? 'bg-gradient-to-r from-rose-400 to-orange-500' : 'bg-slate-700'
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}

export default function UsernameInput({ onSubmit, onBack }: Props) {
  const [step, setStep] = useState<Step>('network');
  const [socialNetwork, setSocialNetwork] = useState<SocialNetwork>(null);
  const [ownUsername, setOwnUsername] = useState('');
  const [targetUsername, setTargetUsername] = useState('');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [detectedLocation, setDetectedLocation] = useState<DetectedLocation | null>(null);
  const [isDetecting, setIsDetecting] = useState(false);

  const handleNetworkSelect = (network: SocialNetwork) => {
    setSocialNetwork(network);
    transitionTo('own');
  };

  const transitionTo = (nextStep: Step) => {
    setIsTransitioning(true);
    setTimeout(() => {
      setStep(nextStep);
      setIsTransitioning(false);
    }, 300);
  };

  const handleOwnSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (ownUsername.trim()) {
      transitionTo('target');
    }
  };

  const handleTargetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (targetUsername.trim() && socialNetwork) {
      transitionTo('detecting');
    }
  };

  const handleDetectionComplete = () => {
    if (socialNetwork) {
      const cleanOwn = ownUsername.trim().replace('@', '');
      const cleanTarget = targetUsername.trim().replace('@', '');
      onSubmit(cleanOwn, cleanTarget, socialNetwork);
    }
  };

  const goBack = () => {
    if (step === 'own') {
      transitionTo('network');
      setSocialNetwork(null);
    } else if (step === 'target') {
      transitionTo('own');
    } else if (step === 'detecting') {
      setDetectedLocation(null);
      setIsDetecting(false);
      transitionTo('target');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 p-6 relative">
      <FloatingOrbs />
      <RadarPulse />

      {step !== 'detecting' && (
        <div className="absolute top-6 left-6 z-20">
          <button
            onClick={step === 'network' ? onBack : goBack}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors group px-4 py-2 rounded-xl hover:bg-slate-800/50"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-medium">Retour</span>
          </button>
        </div>
      )}

      <div className="w-full max-w-lg relative z-10">
        <StepIndicator currentStep={step} showDetecting={step === 'detecting'} />

        <div
          className={`transition-all duration-300 ${
            isTransitioning ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
          }`}
        >
          {step === 'network' && (
            <NetworkSelection onSelect={handleNetworkSelect} />
          )}

          {step === 'own' && (
            <OwnUsernameStep
              network={socialNetwork}
              value={ownUsername}
              onChange={setOwnUsername}
              onSubmit={handleOwnSubmit}
            />
          )}

          {step === 'target' && (
            <TargetUsernameStep
              network={socialNetwork}
              value={targetUsername}
              onChange={setTargetUsername}
              onSubmit={handleTargetSubmit}
            />
          )}

          {step === 'detecting' && (
            <LocationDetectionStep
              ownUsername={ownUsername.trim().replace('@', '')}
              targetUsername={targetUsername.trim().replace('@', '')}
              network={socialNetwork}
              detectedLocation={detectedLocation}
              setDetectedLocation={setDetectedLocation}
              isDetecting={isDetecting}
              setIsDetecting={setIsDetecting}
              onContinue={handleDetectionComplete}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function NetworkSelection({ onSelect }: { onSelect: (network: SocialNetwork) => void }) {
  const [hoveredNetwork, setHoveredNetwork] = useState<SocialNetwork>(null);

  return (
    <div className="text-center">
      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800/50 border border-slate-700/50 text-slate-300 text-sm mb-6">
        <Scan className="w-4 h-4 text-rose-400" />
        <span>Étape 1/3</span>
      </div>

      <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
        Choisis ton réseau
      </h2>
      <p className="text-slate-400 mb-10">
        Sur quelle plateforme veux-tu analyser ?
      </p>

      <div className="grid grid-cols-2 gap-4">
        <button
          onMouseEnter={() => setHoveredNetwork('tiktok')}
          onMouseLeave={() => setHoveredNetwork(null)}
          onClick={() => onSelect('tiktok')}
          className="group relative p-8 rounded-2xl border-2 border-slate-700/50 bg-slate-800/30 backdrop-blur-sm hover:border-rose-500/50 hover:bg-slate-800/50 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-rose-500/20"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-rose-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />
          <div className="relative flex flex-col items-center gap-4">
            <div className={`p-4 rounded-2xl transition-all duration-300 ${
              hoveredNetwork === 'tiktok'
                ? 'bg-gradient-to-br from-rose-500 to-orange-600 shadow-lg shadow-rose-500/30'
                : 'bg-slate-700/50'
            }`}>
              <svg viewBox="0 0 24 24" fill="currentColor" className={`w-10 h-10 transition-colors ${hoveredNetwork === 'tiktok' ? 'text-white' : 'text-slate-300'}`}>
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
              </svg>
            </div>
            <span className={`text-lg font-semibold transition-colors ${hoveredNetwork === 'tiktok' ? 'text-rose-400' : 'text-white'}`}>
              TikTok
            </span>
          </div>
        </button>

        <button
          onMouseEnter={() => setHoveredNetwork('instagram')}
          onMouseLeave={() => setHoveredNetwork(null)}
          onClick={() => onSelect('instagram')}
          className="group relative p-8 rounded-2xl border-2 border-slate-700/50 bg-slate-800/30 backdrop-blur-sm hover:border-pink-500/50 hover:bg-slate-800/50 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-pink-500/20"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />
          <div className="relative flex flex-col items-center gap-4">
            <div className={`p-4 rounded-2xl transition-all duration-300 ${
              hoveredNetwork === 'instagram'
                ? 'bg-gradient-to-br from-pink-500 to-orange-500 shadow-lg shadow-pink-500/30'
                : 'bg-slate-700/50'
            }`}>
              <svg viewBox="0 0 24 24" fill="currentColor" className={`w-10 h-10 transition-colors ${hoveredNetwork === 'instagram' ? 'text-white' : 'text-slate-300'}`}>
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            </div>
            <span className={`text-lg font-semibold transition-colors ${hoveredNetwork === 'instagram' ? 'text-pink-400' : 'text-white'}`}>
              Instagram
            </span>
          </div>
        </button>
      </div>
    </div>
  );
}

interface UsernameStepProps {
  network: SocialNetwork;
  value: string;
  onChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

function OwnUsernameStep({ network, value, onChange, onSubmit }: UsernameStepProps) {
  const [isFocused, setIsFocused] = useState(false);
  const networkColor = network === 'tiktok' ? 'rose' : 'pink';

  return (
    <div className="text-center">
      <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800/50 border border-slate-700/50 text-slate-300 text-sm mb-6`}>
        <Sparkles className={`w-4 h-4 text-${networkColor}-400`} />
        <span>Étape 2/3</span>
      </div>

      <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
        Ton profil
      </h2>
      <p className="text-slate-400 mb-8">
        Entre ton nom d'utilisateur {network === 'tiktok' ? 'TikTok' : 'Instagram'}
      </p>

      <form onSubmit={onSubmit} className="space-y-6">
        <div className={`relative group transition-all duration-300 ${isFocused ? 'scale-105' : ''}`}>
          <div className={`absolute -inset-0.5 bg-gradient-to-r ${
            network === 'tiktok'
              ? 'from-rose-500 to-orange-500'
              : 'from-pink-500 to-orange-500'
          } rounded-2xl opacity-0 group-hover:opacity-50 transition-opacity blur ${isFocused ? 'opacity-75' : ''}`} />
          <div className="relative bg-slate-800/80 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-1">
            <div className="flex items-center">
              <span className="pl-5 text-slate-400 text-xl font-medium">@</span>
              <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder="tonprofil"
                className="w-full px-2 py-5 bg-transparent text-white text-xl placeholder-slate-500 focus:outline-none"
                autoFocus
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={!value.trim()}
          className={`w-full py-4 font-bold rounded-xl transition-all text-lg flex items-center justify-center gap-3 ${
            value.trim()
              ? `bg-gradient-to-r ${network === 'tiktok' ? 'from-rose-500 to-orange-600 shadow-rose-500/30 hover:shadow-rose-500/50' : 'from-pink-500 to-orange-500 shadow-pink-500/30 hover:shadow-pink-500/50'} text-white shadow-xl hover:scale-[1.02] active:scale-[0.98]`
              : 'bg-slate-700/50 text-slate-500 cursor-not-allowed'
          }`}
        >
          <span>Continuer</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
}

function TargetUsernameStep({ network, value, onChange, onSubmit }: UsernameStepProps) {
  const [isFocused, setIsFocused] = useState(false);
  const networkColor = network === 'tiktok' ? 'rose' : 'pink';

  return (
    <div className="text-center">
      <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800/50 border border-slate-700/50 text-slate-300 text-sm mb-6`}>
        <Scan className={`w-4 h-4 text-${networkColor}-400`} />
        <span>Étape 3/3</span>
      </div>

      <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
        Qui veux-tu analyser ?
      </h2>
      <p className="text-slate-400 mb-8">
        Entre le profil que tu souhaites scanner
      </p>

      <form onSubmit={onSubmit} className="space-y-6">
        <div className={`relative group transition-all duration-300 ${isFocused ? 'scale-105' : ''}`}>
          <div className={`absolute -inset-0.5 bg-gradient-to-r ${
            network === 'tiktok'
              ? 'from-rose-500 to-orange-500'
              : 'from-pink-500 to-orange-500'
          } rounded-2xl opacity-0 group-hover:opacity-50 transition-opacity blur ${isFocused ? 'opacity-75' : ''}`} />
          <div className="relative bg-slate-800/80 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-1">
            <div className="flex items-center">
              <span className="pl-5 text-slate-400 text-xl font-medium">@</span>
              <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder="profil_a_analyser"
                className="w-full px-2 py-5 bg-transparent text-white text-xl placeholder-slate-500 focus:outline-none"
                autoFocus
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={!value.trim()}
          className={`w-full py-5 font-bold rounded-xl transition-all text-lg flex items-center justify-center gap-3 ${
            value.trim()
              ? `bg-gradient-to-r ${network === 'tiktok' ? 'from-rose-500 to-orange-600 shadow-rose-500/30 hover:shadow-rose-500/50' : 'from-pink-500 to-orange-500 shadow-pink-500/30 hover:shadow-pink-500/50'} text-white shadow-xl hover:scale-[1.02] active:scale-[0.98]`
              : 'bg-slate-700/50 text-slate-500 cursor-not-allowed'
          }`}
        >
          <Scan className="w-5 h-5" />
          <span>Scanner le profil</span>
        </button>

        <div className="flex items-center justify-center gap-2 text-slate-400 text-sm pt-2">
          <Shield className="w-4 h-4" />
          <span>Analyse 100% anonyme et sécurisée</span>
        </div>
      </form>
    </div>
  );
}

interface LocationDetectionStepProps {
  ownUsername: string;
  targetUsername: string;
  network: SocialNetwork;
  detectedLocation: DetectedLocation | null;
  setDetectedLocation: (location: DetectedLocation | null) => void;
  isDetecting: boolean;
  setIsDetecting: (value: boolean) => void;
  onContinue: () => void;
}

function LocationDetectionStep({
  ownUsername,
  network,
  detectedLocation,
  setDetectedLocation,
  isDetecting,
  setIsDetecting,
  onContinue,
}: LocationDetectionStepProps) {
  const [scanPhase, setScanPhase] = useState(0);
  const [progress, setProgress] = useState(0);
  const [currentMessage, setCurrentMessage] = useState(0);
  const networkColor = network === 'tiktok' ? 'rose' : 'pink';
  const locationRef = useRef<DetectedLocation | null>(null);

  useEffect(() => {
    // Skip if already detected
    if (detectedLocation) return;
    
    setIsDetecting(true);
    
    const startTime = Date.now();
    const totalDuration = 15000; // 15 seconds total
    let currentProgress = 0;
    let isComplete = false;
    
    // Phase timings (cumulative) with non-uniform progression
    const phaseTimings = [
      { end: 3000, targetProgress: 25, phase: 1, message: 0 },   // 0-3s: Connexion (fast)
      { end: 5500, targetProgress: 40, phase: 1, message: 1 },   // 3-5.5s: Slow down
      { end: 8000, targetProgress: 60, phase: 2, message: 1 },   // 5.5-8s: Analyse
      { end: 10500, targetProgress: 75, phase: 2, message: 2 },  // 8-10.5s: Localisation start
      { end: 12500, targetProgress: 90, phase: 3, message: 2 },  // 10.5-12.5s: Localisation
      { end: 15000, targetProgress: 100, phase: 3, message: 3 }, // 12.5-15s: Complete
    ];

    // Start location detection in parallel
    detectLocationFromIP().then(location => {
      locationRef.current = location;
    });

    // Use interval for more reliable updates
    const intervalId = setInterval(() => {
      if (isComplete) return;
      
      const elapsed = Date.now() - startTime;
      
      // Check if animation is complete
      if (elapsed >= totalDuration) {
        isComplete = true;
        setProgress(100);
        setScanPhase(4);
        setCurrentMessage(3);
        clearInterval(intervalId);
        
        // Complete the detection after a small delay
        setTimeout(() => {
          if (locationRef.current) {
            setDetectedLocation(locationRef.current);
          }
          setIsDetecting(false);
        }, 500);
        return;
      }

      // Find current phase
      let currentPhaseIndex = 0;
      for (let i = 0; i < phaseTimings.length; i++) {
        if (elapsed < phaseTimings[i].end) {
          currentPhaseIndex = i;
          break;
        }
      }

      const currentPhase = phaseTimings[currentPhaseIndex];
      const prevPhase = currentPhaseIndex > 0 ? phaseTimings[currentPhaseIndex - 1] : { end: 0, targetProgress: 0 };
      
      // Calculate progress within this phase
      const phaseElapsed = elapsed - prevPhase.end;
      const phaseDuration = currentPhase.end - prevPhase.end;
      const phaseProgressRange = currentPhase.targetProgress - prevPhase.targetProgress;
      
      const phaseRatio = Math.min(phaseElapsed / phaseDuration, 1);
      
      // Different easing for different phases
      let easedRatio;
      if (currentPhaseIndex === 0) {
        // Fast start (ease-out)
        easedRatio = 1 - Math.pow(1 - phaseRatio, 2);
      } else if (currentPhaseIndex === 2) {
        // Slower middle - pause effect
        easedRatio = phaseRatio * 0.7 + Math.sin(phaseRatio * Math.PI) * 0.15;
      } else if (currentPhaseIndex === 4 || currentPhaseIndex === 5) {
        // Accelerate towards end
        easedRatio = Math.pow(phaseRatio, 0.7);
      } else {
        // Linear with slight variation
        easedRatio = phaseRatio + Math.sin(elapsed / 300) * 0.02;
      }
      
      const newProgress = prevPhase.targetProgress + (phaseProgressRange * Math.min(easedRatio, 1));
      
      // Add micro-fluctuations and ensure progress never goes backwards
      const fluctuation = Math.sin(elapsed / 200) * 0.3;
      const finalProgress = Math.max(newProgress + fluctuation, currentProgress);
      
      currentProgress = Math.min(finalProgress, 100);
      setProgress(currentProgress);
      
      // Update phase and message
      setScanPhase(currentPhase.phase);
      setCurrentMessage(currentPhase.message);
    }, 50); // Update every 50ms for smooth animation

    // Cleanup
    return () => {
      clearInterval(intervalId);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const scanMessages = [
    'Connexion aux serveurs...',
    'Analyse des métadonnées...',
    'Localisation en cours...',
    'Localisation détectée !',
  ];

  return (
    <div className="text-center">
      <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${
        detectedLocation
          ? 'bg-emerald-500/20 border-emerald-500/30'
          : 'bg-slate-800/50 border-slate-700/50'
      } border text-slate-300 text-sm mb-6 transition-all duration-500`}>
        {detectedLocation ? (
          <>
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span className="text-emerald-300">Profil vérifié</span>
          </>
        ) : (
          <>
            <div className={`w-4 h-4 border-2 border-${networkColor}-400 border-t-transparent rounded-full animate-spin`} />
            <span>Verification en cours</span>
          </>
        )}
      </div>

      <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
        {detectedLocation ? 'Profil détecté' : 'Analyse de'}
        {' '}
        <span className={`text-transparent bg-clip-text bg-gradient-to-r ${
          network === 'tiktok' ? 'from-rose-400 to-orange-500' : 'from-pink-400 to-orange-500'
        }`}>
          @{ownUsername}
        </span>
      </h2>

      {!detectedLocation && (
        <p className="text-slate-400 mb-8">
          {scanMessages[currentMessage]}
        </p>
      )}

      <div className={`relative bg-slate-800/50 backdrop-blur-sm rounded-2xl border ${
        detectedLocation ? 'border-emerald-500/30' : 'border-slate-700/50'
      } p-8 mb-8 overflow-hidden transition-all duration-500`}>
        {!detectedLocation && (
          <div className="absolute inset-0 overflow-hidden">
            <div className={`absolute inset-0 bg-gradient-to-r ${
              network === 'tiktok' ? 'from-rose-500/5 via-orange-500/5' : 'from-pink-500/5 via-orange-500/5'
            } to-transparent animate-pulse`} />
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-rose-500/50 to-transparent animate-scan-line" />
          </div>
        )}

        <div className="relative">
          {!detectedLocation ? (
            <div className="space-y-4">
              <div className={`w-20 h-20 mx-auto rounded-full ${
                network === 'tiktok' ? 'bg-rose-500/20' : 'bg-pink-500/20'
              } flex items-center justify-center`}>
                <MapPin className={`w-10 h-10 ${
                  network === 'tiktok' ? 'text-rose-400' : 'text-pink-400'
                } animate-pulse`} />
              </div>

              <div className="space-y-2">
                <div className={`h-2 bg-slate-700 rounded-full overflow-hidden`}>
                  <div
                    className={`h-full bg-gradient-to-r ${
                      network === 'tiktok' ? 'from-rose-500 to-orange-500' : 'from-pink-500 to-orange-500'
                    } transition-all duration-150 ease-out`}
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-slate-500">
                  <span className={progress >= 5 ? 'text-slate-300' : ''}>Connexion</span>
                  <span className={progress >= 35 ? 'text-slate-300' : ''}>Analyse</span>
                  <span className={progress >= 65 ? 'text-slate-300' : ''}>Localisation</span>
                  <span className={progress >= 95 ? 'text-emerald-400' : ''}>Complete</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4 animate-fade-in">
              <LocationMap
                latitude={detectedLocation.latitude}
                longitude={detectedLocation.longitude}
                city={detectedLocation.city}
              />

              <div className="flex items-center justify-center gap-3 pt-2">
                <span className="text-4xl">{detectedLocation.flag}</span>
                <div className="text-left">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-emerald-400" />
                    <span className="text-xl font-bold text-white">{detectedLocation.city}</span>
                  </div>
                  <p className="text-sm text-slate-400">{detectedLocation.region}, {detectedLocation.country}</p>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-700/50">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-lg font-semibold text-emerald-400">Actif</div>
                    <div className="text-xs text-slate-500">Statut</div>
                  </div>
                  <div>
                    <div className="text-lg font-semibold text-white">Vérifié</div>
                    <div className="text-xs text-slate-500">Compte</div>
                  </div>
                  <div>
                    <div className="text-lg font-semibold text-white">Public</div>
                    <div className="text-xs text-slate-500">Profil</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {detectedLocation && (
        <div className="space-y-4 animate-fade-in">
          <button
            onClick={onContinue}
            className={`w-full py-5 font-bold rounded-xl transition-all text-lg flex items-center justify-center gap-3 bg-gradient-to-r ${
              network === 'tiktok'
                ? 'from-rose-500 to-orange-600 shadow-rose-500/30 hover:shadow-rose-500/50'
                : 'from-pink-500 to-orange-500 shadow-pink-500/30 hover:shadow-pink-500/50'
            } text-white shadow-xl hover:scale-[1.02] active:scale-[0.98]`}
          >
            <span>Continuer l'analyse</span>
            <ArrowRight className="w-5 h-5" />
          </button>

          <p className="text-slate-500 text-sm">
            Localisation basée sur les métadonnées publiques du compte
          </p>
        </div>
      )}
    </div>
  );
}
