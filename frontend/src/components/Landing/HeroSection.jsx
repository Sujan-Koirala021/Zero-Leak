import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

const HeroSection = () => {
  return (
    <section className="hero-gradient min-h-screen pt-8 pb-16 px-4 flex items-center relative overflow-hidden">
      <div className="absolute inset-0 z-0 opacity-30">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-red-400 rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-1/3 left-1/3 w-64 h-64 bg-red-300 rounded-full filter blur-3xl"></div>
      </div>
      <div className="container mx-auto max-w-7xl z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8 animate-fade-in">
            <div>
              <span className="inline-flex items-center rounded-full px-3 py-1 text-sm font-medium bg-red-100 text-red-800 mb-4">
                AI-Powered GitHub Secret Scanner
              </span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight tracking-tight mb-4">
                Safeguard your <span className="text-red-600"> APIs </span>before leaks turn into nightmares 
              </h1>
              <p className="text-xl text-muted-foreground">
                Zero Leak scans your GitHub repositories for leaked secrets and gives you actionable fixes.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link to='/discover'>
                <button className=' px-8 py-4 bg-red-600 hover:bg-red-700 text-white shadow-lg hover:shadow-red-500/30 rounded-lg text-lg font-bold'>
                  Start Scanning 
                </button>
              </Link>
              <button className="text-lg px-8 py-4 border border-red-200 text-red-600 hover:bg-red-200 rounded-lg font-bold">
                <span className='flex justify-center items-center'>
                  Talk with Zero Leak <ChevronRight className="ml-2 h-5 w-5" />
                </span>
              </button>
            </div>
          </div>

          <div className="relative animate-float">
            {/* <div className="absolute z-0 -top-8 -right-8 w-64 h-64 rounded-full rotate-3 bg-gradient-to-r from-red-200 to-red-700 opacity-60 animate-pulse"></div> */}

            <div className="relative z-10 bg-red-200 p-6 rounded-xl shadow-2xl transform rotate-3 transition-all duration-500 hover:rotate-6 hover:scale-105 cursor-pointer">
              <div className="rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 ease-in-out">
                <img
                  src='https://t4.ftcdn.net/jpg/07/27/80/73/360_F_727807394_6OGlfwx3T5Hmly2qmzqWLt1zA1TmiocW.jpg'
                  alt="GitHub security"
                  className="w-full h-auto object-cover transform hover:scale-105 transition-transform duration-500 ease-in-out"
                  loading="lazy"
                />
              </div>
            </div>

            <div className="absolute -bottom-4 -left-4 z-0 bg-red-100 w-full h-full rounded-2xl shadow-inner"></div>
          </div>

        </div>
      </div>
    </section>
  );
}

export default HeroSection;
