import Footer from "@/components/Footer";
import Features from "@/components/landing/Features";
import HeroSection from "@/components/landing/Hero";
import HowItWorks from "@/components/landing/HowItWorks";
import Navbar from "@/components/Navbar";
import { CopilotKit } from "@copilotkit/react-core";


export default function Home() {
  return (

    <div>
      <CopilotKit runtimeUrl="/api/copilotkit" agent="zeroleak-agent">
        <Navbar showMoreDetails={true} />
        <HeroSection />
        <Features />
        <HowItWorks />
        <Footer />
      </CopilotKit>
    </div>
  );
}
