'use client';

import { Home, Clock, Settings, MessageSquare, Plus, LayoutGrid } from 'lucide-react';

export default function Sidebar() {
    return (
        <div className="hidden md:flex flex-col items-center w-20 py-8 bg-[#FFFAF0] border-r border-[#D4AF37]/20 h-screen fixed left-0 top-0 z-20">
            {/* Logo / Top Icon */}
            <div className="mb-8">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#D4AF37] to-[#B8860B] flex items-center justify-center text-white font-bold text-lg shadow-md">
                    B
                </div>
            </div>

            {/* Nav Items */}
            <nav className="flex-1 flex flex-col gap-6 w-full items-center">
                <button className="p-3 rounded-xl bg-white text-[#2C1810] shadow-sm border border-[#D4AF37]/10 transition-all hover:bg-[#F5E6BC] hover:scale-105">
                    <Plus className="w-5 h-5" />
                </button>

                <div className="flex flex-col gap-4 mt-4">
                    <button className="p-3 text-[#8B4513]/60 hover:text-[#D4AF37] transition-colors">
                        <Clock className="w-5 h-5" />
                    </button>
                    <button className="p-3 text-[#8B4513]/60 hover:text-[#D4AF37] transition-colors">
                        <LayoutGrid className="w-5 h-5" />
                    </button>
                    <button className="p-3 text-[#8B4513]/60 hover:text-[#D4AF37] transition-colors">
                        <MessageSquare className="w-5 h-5" />
                    </button>
                </div>
            </nav>

            {/* Bottom Items */}
            <div className="flex flex-col gap-4">
                <button className="p-3 text-[#8B4513]/60 hover:text-[#D4AF37] transition-colors">
                    <Settings className="w-5 h-5" />
                </button>
                <div className="w-8 h-8 rounded-full bg-[#F5E6BC] overflow-hidden border border-[#D4AF37]/30">
                    {/* Placeholder for user avatar if needed */}
                    <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="User" />
                </div>
            </div>
        </div>
    );
}
