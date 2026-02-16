import { useState } from 'react';
import { ArrowLeft, Heart, Users, Briefcase, Search, ArrowRight, Sparkles } from 'lucide-react';
import { ContextType, contextOptions, contextQuestions } from '../../lib/contextConfig';

interface Props {
  targetUsername: string;
  socialNetwork: 'tiktok' | 'instagram';
  onComplete: (contextType: ContextType, answer1: string, answer2: string, prediction: number) => void;
  onBack: () => void;
}

type QuestionStep = 'context' | 'question1' | 'prediction';

function FloatingOrbs() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-rose-500/10 rounded-full blur-3xl animate-float-slow" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl animate-float-slower" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-slate-700/20 rounded-full blur-3xl" />
    </div>
  );
}

function StepIndicator({ currentStep }: { currentStep: QuestionStep }) {
  const steps: QuestionStep[] = ['context', 'question1', 'prediction'];
  const currentIndex = steps.indexOf(currentStep);

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

const iconMap = {
  Heart,
  Users,
  Briefcase,
  Search,
};

export default function ContextQuestions({ targetUsername, socialNetwork, onComplete, onBack }: Props) {
  const [step, setStep] = useState<QuestionStep>('context');
  const [contextType, setContextType] = useState<ContextType | null>(null);
  const [answer1, setAnswer1] = useState('');
  const [prediction, setPrediction] = useState(10);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const networkColor = socialNetwork === 'tiktok' ? 'rose' : 'pink';

  const transitionTo = (nextStep: QuestionStep) => {
    setIsTransitioning(true);
    setTimeout(() => {
      setStep(nextStep);
      setIsTransitioning(false);
    }, 300);
  };

  const handleContextSelect = (type: ContextType) => {
    setContextType(type);
    transitionTo('question1');
  };

  const handleAnswer1Select = (answer: string) => {
    setAnswer1(answer);
    transitionTo('prediction');
  };

  const handlePredictionSubmit = () => {
    if (contextType) {
      onComplete(contextType, answer1, '', prediction);
    }
  };

  const goBack = () => {
    if (step === 'question1') {
      transitionTo('context');
      setContextType(null);
    } else if (step === 'prediction') {
      transitionTo('question1');
      setAnswer1('');
    } else {
      onBack();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 p-6 relative">
      <FloatingOrbs />

      <div className="absolute top-6 left-6 z-20">
        <button
          onClick={goBack}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors group px-4 py-2 rounded-xl hover:bg-slate-800/50"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-medium">Retour</span>
        </button>
      </div>

      <div className="w-full max-w-lg relative z-10">
        <StepIndicator currentStep={step} />

        <div
          className={`transition-all duration-300 ${
            isTransitioning ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
          }`}
        >
          {step === 'context' && (
            <ContextSelection onSelect={handleContextSelect} targetUsername={targetUsername} />
          )}

          {step === 'question1' && contextType && (
            <Question1Step
              contextType={contextType}
              networkColor={networkColor}
              onSelect={handleAnswer1Select}
            />
          )}

          {step === 'prediction' && (
            <PredictionStep
              targetUsername={targetUsername}
              prediction={prediction}
              setPrediction={setPrediction}
              networkColor={networkColor}
              onSubmit={handlePredictionSubmit}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function ContextSelection({ onSelect, targetUsername }: { onSelect: (type: ContextType) => void; targetUsername: string }) {
  const [hoveredOption, setHoveredOption] = useState<ContextType | null>(null);

  return (
    <div className="text-center">
      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800/50 border border-slate-700/50 text-slate-300 text-sm mb-6">
        <Sparkles className="w-4 h-4 text-rose-400" />
        <span>Question 1/3</span>
      </div>

      <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
        Qui est @{targetUsername} ?
      </h2>
      <p className="text-slate-400 mb-8">
        Aide-nous à personnaliser ton analyse
      </p>

      <div className="grid grid-cols-1 gap-3">
        {contextOptions.map((option) => {
          const Icon = iconMap[option.icon as keyof typeof iconMap];
          const isHovered = hoveredOption === option.value;

          return (
            <button
              key={option.value}
              onMouseEnter={() => setHoveredOption(option.value)}
              onMouseLeave={() => setHoveredOption(null)}
              onClick={() => onSelect(option.value)}
              className="group relative p-5 rounded-2xl border-2 border-slate-700/50 bg-slate-800/30 backdrop-blur-sm hover:border-rose-500/50 hover:bg-slate-800/50 transition-all duration-300 hover:scale-[1.02] text-left"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-rose-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />
              <div className="relative flex items-center gap-4">
                <div className={`p-3 rounded-xl transition-all duration-300 ${
                  isHovered
                    ? 'bg-gradient-to-br from-rose-500 to-orange-600 shadow-lg shadow-rose-500/30'
                    : 'bg-slate-700/50'
                }`}>
                  <Icon className={`w-6 h-6 transition-colors ${isHovered ? 'text-white' : 'text-slate-300'}`} />
                </div>
                <span className={`text-lg font-medium transition-colors ${isHovered ? 'text-rose-400' : 'text-white'}`}>
                  {option.label}
                </span>
                <ArrowRight className={`w-5 h-5 ml-auto transition-all ${isHovered ? 'text-rose-400 translate-x-1' : 'text-slate-500'}`} />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

interface Question1StepProps {
  contextType: ContextType;
  networkColor: string;
  onSelect: (answer: string) => void;
}

function Question1Step({ contextType, networkColor, onSelect }: Question1StepProps) {
  const [hoveredOption, setHoveredOption] = useState<string | null>(null);
  const question = contextQuestions[contextType];

  return (
    <div className="text-center">
      <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800/50 border border-slate-700/50 text-slate-300 text-sm mb-6`}>
        <Sparkles className={`w-4 h-4 text-${networkColor}-400`} />
        <span>Question 2/3</span>
      </div>

      <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
        {question.question}
      </h2>
      <p className="text-slate-400 mb-8">
        Sélectionne la réponse qui te correspond
      </p>

      <div className="grid grid-cols-1 gap-3">
        {question.options.map((option) => {
          const isHovered = hoveredOption === option;

          return (
            <button
              key={option}
              onMouseEnter={() => setHoveredOption(option)}
              onMouseLeave={() => setHoveredOption(null)}
              onClick={() => onSelect(option)}
              className={`group relative p-5 rounded-2xl border-2 border-slate-700/50 bg-slate-800/30 backdrop-blur-sm hover:border-${networkColor}-500/50 hover:bg-slate-800/50 transition-all duration-300 hover:scale-[1.02]`}
            >
              <div className={`absolute inset-0 bg-gradient-to-r from-${networkColor}-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl`} />
              <div className="relative flex items-center justify-between">
                <span className={`text-lg font-medium transition-colors ${isHovered ? `text-${networkColor}-400` : 'text-white'}`}>
                  {option}
                </span>
                <ArrowRight className={`w-5 h-5 transition-all ${isHovered ? `text-${networkColor}-400 translate-x-1` : 'text-slate-500'}`} />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

interface PredictionStepProps {
  targetUsername: string;
  prediction: number;
  setPrediction: (value: number) => void;
  networkColor: string;
  onSubmit: () => void;
}

function PredictionStep({ targetUsername, prediction, setPrediction, networkColor, onSubmit }: PredictionStepProps) {
  const getEmoji = () => {
    if (prediction <= 5) return '...';
    if (prediction <= 15) return 'Hmm...';
    if (prediction <= 30) return 'Intéressant !';
    if (prediction <= 45) return 'Wow !';
    return 'Incroyable !';
  };

  return (
    <div className="text-center">
      <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800/50 border border-slate-700/50 text-slate-300 text-sm mb-6`}>
        <Sparkles className={`w-4 h-4 text-${networkColor}-400`} />
        <span>Question 3/3</span>
      </div>

      <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
        Selon toi, combien de fois<br />
        <span className={`text-${networkColor}-400`}>@{targetUsername}</span> a visité ton profil ?
      </h2>
      <p className="text-slate-400 mb-8">
        Cette semaine uniquement
      </p>

      <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-8 mb-6">
        <div className="text-6xl font-bold text-white mb-2">
          {prediction}{prediction >= 50 ? '+' : ''}
        </div>
        <div className={`text-${networkColor}-400 font-medium text-lg mb-6`}>
          {getEmoji()}
        </div>

        <div className="relative">
          <input
            type="range"
            min="0"
            max="50"
            value={prediction}
            onChange={(e) => setPrediction(parseInt(e.target.value))}
            className="w-full h-3 bg-slate-700 rounded-full appearance-none cursor-pointer slider-thumb"
            style={{
              background: `linear-gradient(to right, ${networkColor === 'rose' ? '#f43f5e' : '#ec4899'} 0%, ${networkColor === 'rose' ? '#f43f5e' : '#ec4899'} ${prediction * 2}%, #334155 ${prediction * 2}%, #334155 100%)`,
            }}
          />
          <div className="flex justify-between text-slate-500 text-sm mt-2">
            <span>0</span>
            <span>25</span>
            <span>50+</span>
          </div>
        </div>
      </div>

      <button
        onClick={onSubmit}
        className={`w-full py-5 font-bold rounded-xl transition-all text-lg flex items-center justify-center gap-3 bg-gradient-to-r ${
          networkColor === 'rose'
            ? 'from-rose-500 to-orange-600 shadow-rose-500/30 hover:shadow-rose-500/50'
            : 'from-pink-500 to-orange-500 shadow-pink-500/30 hover:shadow-pink-500/50'
        } text-white shadow-xl hover:scale-[1.02] active:scale-[0.98]`}
      >
        <span>Voir les résultats</span>
        <ArrowRight className="w-5 h-5" />
      </button>
    </div>
  );
}
