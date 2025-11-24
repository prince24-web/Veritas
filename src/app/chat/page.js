'use client';

import ChatInterface from '@/components/ChatInterface';
import { createClient } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Orb from '@/components/Orb';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function ChatPage() {
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                router.push('/');
            } else {
                setLoading(false);
            }
        };
        checkSession();
    }, [router]);

    if (loading) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-[#FFFAF0]">
                <div className="flex flex-col items-center gap-4">
                    <Orb isThinking={true} size="medium" />
                    <p className="text-[#D4AF37] font-medium animate-pulse">Verifying access...</p>
                </div>
            </div>
        );
    }

    return <ChatInterface />;
}
