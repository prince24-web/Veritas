'use client';

import { useEffect, useRef, useState } from 'react';
import { Send, Mic, Plus } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import AuthButton from '@/components/AuthButton';
import Sidebar from '@/components/Sidebar';
import Orb from '@/components/Orb';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function ChatInterface() {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);
    const chatContainerRef = useRef(null);
    const [user, setUser] = useState(null);
    const [loadingSession, setLoadingSession] = useState(true);

    const handleManualSubmit = async (e) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage = { id: Date.now().toString(), role: 'user', content: input };
        const newMessages = [...messages, userMessage];

        setMessages(newMessages);
        setInput('');
        setIsLoading(true);

        // Scroll to bottom immediately after user sends
        setTimeout(scrollToBottom, 100);

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messages: newMessages }),
            });

            if (!response.ok) throw new Error('Failed to send message');

            // Create placeholder for assistant message
            const assistantMessageId = (Date.now() + 1).toString();
            setMessages(prev => [...prev, { id: assistantMessageId, role: 'assistant', content: '' }]);

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let done = false;
            let accumulatedResponse = '';

            while (!done) {
                const { value, done: doneReading } = await reader.read();
                done = doneReading;
                const chunkValue = decoder.decode(value, { stream: true });
                accumulatedResponse += chunkValue;

                setMessages(prev =>
                    prev.map(m =>
                        m.id === assistantMessageId
                            ? { ...m, content: accumulatedResponse }
                            : m
                    )
                );
            }
        } catch (error) {
            console.error("Error sending message:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null);
            setLoadingSession(false);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
        });

        return () => subscription.unsubscribe();
    }, []);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    if (loadingSession) return null;

    const firstName = user?.user_metadata?.full_name?.split(' ')[0] || 'Friend';

    return (
        <div className="flex h-screen bg-[#FFFAF0] text-[#2C1810] font-sans overflow-hidden">
            <Sidebar />

            <main className="flex-1 flex flex-col relative md:ml-20 transition-all duration-300">
                {/* Header / Auth */}
                <div className="absolute top-6 right-6 z-10">
                    <AuthButton user={user} />
                </div>

                {/* Main Content Area */}
                <div
                    ref={chatContainerRef}
                    className="flex-1 overflow-y-auto no-scrollbar flex flex-col items-center p-4 pb-32"
                >

                    {/* Hero Section (Visible when no messages) */}
                    {messages.length === 0 && (
                        <div className="flex flex-col items-center text-center space-y-8 max-w-2xl animate-in fade-in zoom-in duration-700 mt-20">
                            <Orb isThinking={isLoading} />

                            <div className="space-y-2">
                                <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-[#2C1810]">
                                    Hi there, <span className="font-script text-5xl md:text-6xl text-[#D4AF37]">{firstName}</span>
                                </h1>
                                <p className="text-xl md:text-2xl font-medium text-[#8B4513]/80">
                                    Ready to explore the Word?
                                </p>
                            </div>

                            {/* Suggestion Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full mt-8">
                                {[
                                    { icon: "📖", title: "Bible Study", desc: "Deep dive into scripture" },
                                    { icon: "🙏", title: "Prayer", desc: "Find comfort and peace" },
                                    { icon: "💡", title: "Theology", desc: "Understand complex topics" }
                                ].map((card, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setInput(`Tell me about ${card.title.toLowerCase()}`)}
                                        className="p-6 rounded-3xl bg-white/50 hover:bg-white hover:shadow-xl transition-all duration-300 text-left border border-[#D4AF37]/10 hover:border-[#D4AF37]/30 group"
                                    >
                                        <div className="w-10 h-10 rounded-full bg-[#FFFAF0] shadow-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform text-[#D4AF37]">
                                            <span className="text-xl">{card.icon}</span>
                                        </div>
                                        <h3 className="font-semibold text-[#2C1810]">{card.title}</h3>
                                        <p className="text-xs text-[#8B4513]/60 mt-1">{card.desc}</p>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Chat Messages */}
                    {messages.length > 0 && (
                        <div className="w-full max-w-3xl space-y-6 pt-10">
                            {messages.map((m) => (
                                <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start items-start gap-3'}`}>

                                    {/* Assistant Avatar (Orb) */}
                                    {m.role === 'assistant' && (
                                        <div className="mt-1 flex-shrink-0">
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#F5E6BC] flex items-center justify-center text-white text-xs font-bold shadow-sm">
                                                V
                                            </div>
                                        </div>
                                    )}

                                    <div className={`max-w-[85%] rounded-2xl px-6 py-4 text-sm leading-relaxed shadow-sm ${m.role === 'user'
                                        ? 'bg-[#2C1810] text-[#FFFAF0] rounded-br-none'
                                        : 'bg-white border border-[#D4AF37]/20 text-[#2C1810] rounded-bl-none'
                                        }`}>
                                        {/* Markdown Rendering */}
                                        <ReactMarkdown
                                            remarkPlugins={[remarkGfm]}
                                            components={{
                                                p: ({ node, ...props }) => <p className="mb-2 last:mb-0" {...props} />,
                                                ul: ({ node, ...props }) => <ul className="list-disc list-inside mb-2" {...props} />,
                                                ol: ({ node, ...props }) => <ol className="list-decimal list-inside mb-2" {...props} />,
                                                li: ({ node, ...props }) => <li className="mb-1" {...props} />,
                                                strong: ({ node, ...props }) => <strong className="font-semibold text-[#D4AF37]" {...props} />,
                                                blockquote: ({ node, ...props }) => (
                                                    <blockquote
                                                        className="border-l-4 border-[#D4AF37] pl-4 italic my-4 py-2 bg-[#D4AF37]/10 rounded-r-lg text-[#8B4513] font-serif text-lg"
                                                        {...props}
                                                    />
                                                ),
                                            }}
                                        >
                                            {m.content}
                                        </ReactMarkdown>
                                    </div>
                                </div>
                            ))}

                            {/* Loading Indicator (Side Orb) */}
                            {isLoading && (
                                <div className="flex justify-start items-center gap-3">
                                    <div className="mt-1 flex-shrink-0">
                                        <Orb isThinking={true} size="small" />
                                    </div>
                                    <div className="text-sm text-[#D4AF37] animate-pulse font-medium">
                                        Thinking...
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>
                    )}
                </div>

                {/* Floating Input Bar */}
                <div className="absolute bottom-8 left-0 right-0 px-4 flex justify-center z-20">
                    <div className="w-full max-w-2xl bg-white rounded-full shadow-2xl shadow-[#D4AF37]/10 border border-[#D4AF37]/20 p-2 flex items-center gap-2 transition-all focus-within:ring-2 focus-within:ring-[#D4AF37]/20">
                        <button className="p-3 rounded-full hover:bg-[#FFFAF0] text-[#D4AF37] transition-colors">
                            <Plus className="w-5 h-5" />
                        </button>

                        <form onSubmit={handleManualSubmit} className="flex-1 flex items-center">
                            <input
                                className="w-full bg-transparent border-none focus:ring-0 focus:outline-none text-[#2C1810] placeholder:text-[#8B4513]/40 text-sm px-2"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Ask anything..."
                                disabled={isLoading}
                            />
                        </form>

                        <button className="p-3 rounded-full hover:bg-[#FFFAF0] text-[#D4AF37] transition-colors">
                            <Mic className="w-5 h-5" />
                        </button>

                        <button
                            onClick={handleManualSubmit}
                            disabled={isLoading || !input.trim()}
                            className="p-3 rounded-full bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all disabled:opacity-50 disabled:hover:scale-100"
                        >
                            <Send className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
}
