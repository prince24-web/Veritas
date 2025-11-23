'use client';

import React from 'react';

export default function Orb({ isThinking = false, size = "large" }) {
    // Size classes based on prop
    const sizeClasses = size === "small"
        ? "w-8 h-8"
        : "w-32 h-32 md:w-40 md:h-40";

    return (
        <div className={`relative ${sizeClasses} flex items-center justify-center transition-all duration-700 ${isThinking && size === 'large' ? 'scale-110' : 'scale-100'}`}>
            {/* Core Orb - Gold/Cream Theme */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#D4AF37] via-[#F5F5DC] to-[#FFD700] blur-md opacity-80 animate-pulse-slow"></div>

            {/* Inner Swirls */}
            <div className="absolute inset-1 rounded-full bg-gradient-to-tr from-white via-transparent to-[#D4AF37] blur-sm animate-spin-slow opacity-90"></div>
            <div className="absolute inset-1 rounded-full bg-gradient-to-bl from-[#F5F5DC] via-transparent to-white blur-sm animate-reverse-spin opacity-90"></div>

            {/* Shine/Gloss */}
            <div className="absolute top-[15%] left-[20%] w-[30%] h-[15%] bg-white opacity-60 blur-md rounded-full transform -rotate-45"></div>

            {/* Thinking State Particles */}
            {isThinking && (
                <>
                    <div className="absolute inset-0 rounded-full border-2 border-[#D4AF37]/30 animate-ping-slow"></div>
                    <div className="absolute -inset-2 rounded-full border border-[#D4AF37]/40 animate-spin-slow dashed-border"></div>
                </>
            )}
        </div>
    );
}
