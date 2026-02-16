import { useNavigate } from 'react-router-dom';
import HeroSection from '../components/landing/HeroSection';
import FeaturesSection from '../components/landing/FeaturesSection';
import CTASection from '../components/landing/CTASection';
import Footer from '../components/landing/Footer';

export default function HomePage() {
  const navigate = useNavigate();
  
  const handleAnalyzeClick = () => {
    navigate('/analysis');
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <HeroSection onAnalyzeClick={handleAnalyzeClick} />
      <FeaturesSection />
      <CTASection onAnalyzeClick={handleAnalyzeClick} />
      <Footer />
    </div>
  );
}
