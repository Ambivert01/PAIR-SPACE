import { useNavigate } from "react-router-dom";
import HeroSection from "../../components/landing/HeroSection.jsx";
import ProblemSection from "../../components/landing/ProblemSection.jsx";
import SolutionSection from "../../components/landing/SolutionSection.jsx";
import FeaturesSection from "../../components/landing/FeaturesSection.jsx";
import DifferentiationSection from "../../components/landing/DifferentiationSection.jsx";
import HowItWorks from "../../components/landing/HowItWorks.jsx";
import EmotionalSection from "../../components/landing/EmotionalSection.jsx";
import FeatureDepthSection from "../../components/landing/FeatureDepthSection.jsx";
import DemoSection from "../../components/landing/DemoSection.jsx";
import CTASection from "../../components/landing/CTASection.jsx";
import Footer from "../../components/landing/Footer.jsx";

export default function LandingPage() {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate("/signup");
  };

  const handleWatchDemo = () => {
    // Scroll to demo section
    document.getElementById("demo")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="landing-page">
      <HeroSection
        onGetStarted={handleGetStarted}
        onWatchDemo={handleWatchDemo}
      />
      <ProblemSection />
      <SolutionSection />
      <FeaturesSection />
      <DifferentiationSection />
      <HowItWorks />
      <EmotionalSection />
      <FeatureDepthSection />
      <DemoSection />
      <CTASection onGetStarted={handleGetStarted} />
      <Footer />
    </div>
  );
}
