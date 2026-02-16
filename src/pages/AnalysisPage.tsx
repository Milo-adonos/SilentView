import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import UsernameInput from '../components/analysis/UsernameInput';
import ContextQuestions from '../components/analysis/ContextQuestions';
import AnalysisInProgress from '../components/analysis/AnalysisInProgress';
import { ContextType } from '../lib/contextConfig';
import { generateSignals, GeneratedSignals } from '../lib/signalGenerator';
import { saveAnalysisSession } from '../lib/supabase';

type FlowState = 'input' | 'questions' | 'analyzing';

export default function AnalysisPage() {
  const navigate = useNavigate();
  const [flowState, setFlowState] = useState<FlowState>('input');
  const [ownUsername, setOwnUsername] = useState('');
  const [targetUsername, setTargetUsername] = useState('');
  const [socialNetwork, setSocialNetwork] = useState<'tiktok' | 'instagram'>('tiktok');
  const [contextType, setContextType] = useState<ContextType>('curiosity');
  const [userAnswer, setUserAnswer] = useState('');
  const [userPrediction, setUserPrediction] = useState(10);

  const handleUsernameSubmit = (own: string, target: string, network: 'tiktok' | 'instagram') => {
    setOwnUsername(own);
    setTargetUsername(target);
    setSocialNetwork(network);
    setFlowState('questions');
  };

  const handleQuestionsComplete = async (
    context: ContextType,
    answer1: string,
    _answer2: string,
    prediction: number
  ) => {
    setContextType(context);
    setUserAnswer(answer1);
    setUserPrediction(prediction);
    setFlowState('analyzing');

    // Save session to database (non-blocking, errors are logged but don't break the flow)
    try {
      await saveAnalysisSession({
        own_username: ownUsername,
        target_username: targetUsername,
        social_network: socialNetwork,
        context_type: context,
        question_1_answer: answer1,
        question_2_answer: '',
        prediction_value: prediction,
      });
    } catch (error) {
      console.error('Failed to save analysis session:', error);
    }
  };

  const handleAnalysisComplete = () => {
    // Generate signals based on user input
    const signals: GeneratedSignals = generateSignals(
      targetUsername,
      contextType,
      userAnswer,
      userPrediction
    );
    
    // Navigate to dashboardfree with the results
    navigate('/dashboardfree', {
      state: {
        targetUsername,
        ownUsername,
        generatedSignals: signals
      }
    });
  };

  const handleBackToHome = () => {
    navigate('/landing');
  };

  // Username input step
  if (flowState === 'input') {
    return <UsernameInput onSubmit={handleUsernameSubmit} onBack={handleBackToHome} />;
  }

  // Context questions step
  if (flowState === 'questions') {
    return (
      <ContextQuestions
        targetUsername={targetUsername}
        socialNetwork={socialNetwork}
        onComplete={handleQuestionsComplete}
        onBack={() => setFlowState('input')}
      />
    );
  }

  // Analysis animation step
  if (flowState === 'analyzing') {
    return (
      <AnalysisInProgress
        username={targetUsername}
        onComplete={handleAnalysisComplete}
      />
    );
  }

  return null;
}
