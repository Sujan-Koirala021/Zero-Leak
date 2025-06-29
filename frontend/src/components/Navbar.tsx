"use client";

import React, { useState, useEffect } from 'react';
import { FileText, Menu, X } from "lucide-react";
import Image from 'next/image';
import Link from 'next/link';

const Navbar = ({ showMoreDetails = false }: { showMoreDetails: boolean }) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`top-0 w-full z-50 transition-all duration-300 ease-in-out min-h-16 flex justify-center md:px-24 ${scrolled ? 'py-5 bg-white' : 'py-8 bg-transparent'}`}>
      <div className="container mx-auto px-4 md:px-6 flex items-center justify-between">
        <div className="flex items-center">
          <Image src="/logo.png" alt="Logo Img" width="48" height="40" className='w-12 h-10 mr-3' />
          <Link href='/'><span className="text-xl font-bold tracking-tight text-gray-800">Zero<span className="text-red-600">Leak</span></span></Link>
        </div>

        <nav className="hidden md:flex items-center space-x-8">
          {showMoreDetails && (
            <>
              <a href="#features" className="text-md font-medium text-gray-700 hover:text-red-600 transition-colors">Features</a>
              <a href="#how-it-works" className="text-md font-medium text-gray-700 hover:text-red-600 transition-colors">How It Works</a>
            </>
          )}
          <Link href='/explore_kb' className="text-md font-medium text-gray-700 hover:text-red-600 transition-colors">Explore</Link>
          <Link href='/chat_agent' className="text-md font-medium text-gray-700 hover:text-red-600 transition-colors">Chat Now</Link>
        </nav>

        <div className="hidden md:flex items-center space-x-4">
          <Link href='/screen'>
            <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md font-medium text-md transition-colors shadow-sm">
              Get Started
            </button>
          </Link>
        </div>

        <button className="md:hidden text-gray-700 hover:text-red-600 transition-colors" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} aria-label="Toggle menu">
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      <div className={`absolute inset-0 top-[4.45rem] bg-white z-40 transform transition-transform duration-300 ease-in-out md:hidden ${mobileMenuOpen ? "translate-x-0" : "translate-x-full"}`}>
        <div className="container mx-auto px-4 py-10 flex flex-col gap-6 bg-white min-h-screen">
          {showMoreDetails && (
            <>
              <a href="#features" className="text-lg font-medium p-3 hover:bg-red-50 rounded-lg text-gray-700 hover:text-red-600 transition-colors" onClick={() => setMobileMenuOpen(false)}>Features</a>
              <a href="#how-it-works" className="text-lg font-medium p-3 hover:bg-red-50 rounded-lg text-gray-700 hover:text-red-600 transition-colors" onClick={() => setMobileMenuOpen(false)}>How It Works</a>
            </>
          )}
          <Link href='/faq' className="text-lg font-medium p-3 hover:bg-red-50 rounded-lg text-gray-700 hover:text-red-600 transition-colors" onClick={() => setMobileMenuOpen(false)}>FAQ</Link>
          <Link href='/screen' className="text-lg font-medium p-3 hover:bg-red-50 rounded-lg text-gray-700 hover:text-red-600 transition-colors" onClick={() => setMobileMenuOpen(false)}>Screen</Link>
          <div className="flex flex-col gap-3 mt-4">
            <Link href='/screen'>
              <button className="w-full justify-center bg-red-600 hover:bg-red-700 text-white py-3 px-4 rounded-md font-medium transition-colors shadow-sm">
                Get Started
              </button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;