import Footer from "@/components/Footer";
import Features from "@/components/landing/Features";
import HeroSection from "@/components/landing/Hero";
import HowItWorks from "@/components/landing/HowItWorks";
import Navbar from "@/components/Navbar";

export default function Home() {
  return (
        <div>
        <Navbar showMoreDetails={true}/>
        <HeroSection/>
        <Features/>
        <HowItWorks/>
        <Footer/>

    </div>
  );
}
