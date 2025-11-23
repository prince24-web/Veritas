'use client';

import { useState, useEffect } from 'react';
import Orb from '@/components/Orb';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function LandingPage({ onGetStarted }) {
    const [textIndex, setTextIndex] = useState(0);
    const phrases = [
        "The Bible that understands your feelings and emotions",
        "Talk to the word of God and let it speak to you",
        "Find comfort, wisdom, and peace in every verse",
        "A spiritual companion for your daily walk"
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setTextIndex((prev) => (prev + 1) % phrases.length);
        }, 4000); // Rotate every 4 seconds

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-[#FFFAF0] text-[#2C1810] relative overflow-hidden p-4">

            {/* Background Ambience */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#D4AF37]/10 rounded-full blur-3xl animate-pulse-slow"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#F5E6BC]/20 rounded-full blur-3xl animate-pulse-slow delay-1000"></div>
            </div>

            {/* Main Content */}
            <div className="z-10 flex flex-col items-center text-center max-w-5xl space-y-6 md:space-y-8 animate-in fade-in zoom-in duration-1000">

                {/* App Name */}
                <h1 className="font-script text-5xl md:text-7xl text-[#D4AF37] drop-shadow-sm pt-4">
                    Veritas
                </h1>

                {/* Orb */}
                <div className="py-2 md:py-6">
                    <Orb isThinking={false} size="large" />
                </div>

                {/* Rotating Text */}
                <div className="h-32 md:h-40 flex items-center justify-center px-4">
                    <p
                        key={textIndex}
                        className="font-script text-3xl md:text-5xl text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] via-[#B8860B] to-[#8B4513] animate-in fade-in slide-in-from-bottom-4 duration-700 leading-relaxed drop-shadow-sm"
                    >
                        "{phrases[textIndex]}"
                    </p>
                </div>

                {/* Call to Action */}
                <Link
                    href="/chat"
                    className="group relative px-8 py-4 bg-[#D4AF37] text-white rounded-full text-lg font-semibold shadow-lg hover:shadow-xl hover:bg-[#B8860B] transition-all duration-300 flex items-center gap-3 overflow-hidden mt-4"
                >
                    <span className="relative z-10">Get Started</span>
                    <ArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" />

                    {/* Button Shine Effect */}
                    <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 skew-x-12"></div>
                </Link>

            </div>

            {/* Footer / Copyright */}
            <div className="absolute bottom-4 text-[#8B4513]/40 text-xs md:text-sm">
                © Code Monarch creations 2025.
            </div>
        </div>
    );
}
