import React from 'react';
import { 
  Shield, Bug, KeyRound, EyeOff, AlertTriangle, Wrench
} from 'lucide-react';
import FeatureCard from './FeatureCard';

const Features = () => {
  const features = [
    {
      icon: <KeyRound className="w-full h-full" />,
      title: "API Key Detection",
      description: "Automatically detects leaked API keys in your GitHub repositories."
    },
    {
      icon: <Bug className="w-full h-full" />,
      title: "Secret Scanning",
      description: "Finds secrets, tokens, and other sensitive information hidden in code."
    },
    {
      icon: <EyeOff className="w-full h-full" />,
      title: "Privacy Protection",
      description: "Identifies exposed private data and helps you secure it quickly."
    },
    {
      icon: <AlertTriangle className="w-full h-full" />,
      title: "Risk Alerts",
      description: "Highlights high-risk vulnerabilities and prioritizes them for action."
    },
    {
      icon: <Shield className="w-full h-full" />,
      title: "Security Suggestions",
      description: "Recommends best practices to patch and prevent future leaks."
    },
    {
      icon: <Wrench className="w-full h-full" />,
      title: "Fix Guidance",
      description: "Offers clear remediation steps for every issue found."
    }
  ];

  return (
    <section id="features" className="py-24 bg-white">
      <div className="container mx-auto max-w-7xl px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block px-3 py-1 text-sm font-medium bg-red-100 text-red-800 rounded-full mb-4">Features</span>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Strengthen Your Codebase Security</h2>
          <p className="text-xl text-gray-700">
            Let Zero Leak continuously monitor and protect your GitHub repositories from credential exposure.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="flex flex-col h-full">
              <FeatureCard
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
                // delay={index * 100}
                className="animate-slide-up h-full"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;

