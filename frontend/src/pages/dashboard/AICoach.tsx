import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2 } from 'lucide-react';
import { aiApi } from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import { useNutritionStore } from '../../store/nutritionStore';
import { useWorkoutStore } from '../../store/workoutStore';

const AICoach = () => {
    const [messages, setMessages] = useState<{sender: 'ai' | 'user', text: string}[]>([
        { sender: 'ai', text: "Hey! Let's crush today's session. You've got Chest & Tris scheduled. How's the right shoulder feeling after yesterday's recovery mobility work?" }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    const formatMessageText = (text: string) => {
        return text.split('\n').map((line, i) => {
            const parts = line.split(/(\*\*.*?\*\*)/g);
            return (
                <span key={i}>
                    {parts.map((part, j) => {
                        if (part.startsWith('**') && part.endsWith('**')) {
                            return <strong key={j} className="text-white font-semibold">{part.slice(2, -2)}</strong>;
                        }
                        return <span key={j}>{part}</span>;
                    })}
                    {i !== text.split('\n').length - 1 && <br />}
                </span>
            );
        });
    };

    const { user } = useAuthStore();
    const { currentLog, goals } = useNutritionStore();
    const { workouts } = useWorkoutStore();

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isTyping) return;

        const currentInput = input;
        setMessages(prev => [...prev, { sender: 'user', text: currentInput }]);
        setInput('');
        setIsTyping(true);

        const geminiHistory = messages.map(m => ({ 
            role: m.sender === 'user' ? 'user' : 'model', 
            parts: [{ text: m.text }] 
        }));

        const context = `User: ${user?.name || 'Anonymous'}
Weight: ${user?.weight}kg, Height: ${user?.height}cm
Dietary Preference: ${user?.dietaryPreference}
Goal: ${user?.dailyCalorieGoal || goals.calories} kcal/day
Today's Meals Logged: ${currentLog?.meals ? Object.values(currentLog.meals).flat().length : 0} items
Total Workouts: ${workouts?.length || 0}`;

        try {
            const apiRes = await aiApi.chat(currentInput, geminiHistory, context);
            setMessages(prev => [...prev, { sender: 'ai', text: apiRes.text }]);
        } catch (error) {
            console.error("AI Chat Error:", error);
            setMessages(prev => [...prev, { sender: 'ai', text: "Sorry, I hit a snag connecting to my neural net. Can you say that again?" }]);
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-64px)] md:h-[calc(100vh-64px)] pb-16 md:pb-0 animate-fade-in relative z-10 w-full max-w-4xl mx-auto rounded-3xl overflow-hidden bg-dark-800 border border-white/10">
            <header className="px-6 py-4 border-b border-glass-border flex items-center gap-4 bg-dark-900/50 backdrop-blur">
                <div className="w-10 h-10 rounded-full bg-accent-purple/20 flex items-center justify-center border border-accent-purple/30 shadow-[0_0_15px_rgba(189,0,255,0.2)]">
                    <Bot className="w-5 h-5 text-accent-purple" />
                </div>
                <div>
                    <h2 className="font-bold text-lg leading-tight">Coach Nova</h2>
                    <p className="text-xs text-primary font-medium tracking-widest uppercase">Online • Real-Time Core</p>
                </div>
            </header>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {messages.map((msg, i) => (
                    <div key={i} className={`flex gap-4 max-w-[85%] ${msg.sender === 'user' ? 'ml-auto flex-row-reverse' : ''}`}>
                        <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center mt-1 border ${msg.sender === 'user' ? 'bg-dark-900 border-white/20' : 'bg-dark-900 border-accent-purple/40'}`}>
                            {msg.sender === 'user' ? <User className="w-4 h-4 text-gray-400" /> : <Bot className="w-4 h-4 text-accent-purple" />}
                        </div>
                        <div className={`p-4 rounded-2xl ${msg.sender === 'user' ? 'bg-white/10 text-white rounded-tr-sm' : 'bg-glass border border-glass-border text-gray-200 rounded-tl-sm'} leading-relaxed shadow-sm`}>
                            {formatMessageText(msg.text)}
                        </div>
                    </div>
                ))}
                {isTyping && (
                    <div className="flex gap-4 max-w-[85%] animate-fade-in">
                        <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center mt-1 border bg-dark-900 border-accent-purple/40">
                            <Bot className="w-4 h-4 text-accent-purple" />
                        </div>
                        <div className="p-4 rounded-2xl bg-glass border border-glass-border text-gray-200 rounded-tl-sm flex items-center gap-2 h-[42px]">
                            <div className="flex space-x-1.5">
                                <div className="w-2 h-2 rounded-full bg-accent-purple/70 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                <div className="w-2 h-2 rounded-full bg-accent-purple/70 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                <div className="w-2 h-2 rounded-full bg-accent-purple/70 animate-bounce" style={{ animationDelay: '300ms' }}></div>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Form */}
            <div className="p-4 bg-dark-900/50 border-t border-glass-border backdrop-blur">
                <form onSubmit={handleSend} className="relative flex items-center">
                    <input 
                        type="text" 
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Message your AI Coach..."
                        className="w-full bg-dark-800 border border-glass-border rounded-full py-4 pl-6 pr-14 outline-none focus:border-primary/50 transition-colors text-white placeholder:text-gray-500"
                    />
                    <button 
                        type="submit" 
                        disabled={!input.trim() || isTyping}
                        className="absolute right-2 w-10 h-10 rounded-full bg-primary flex items-center justify-center text-dark-900 hover:bg-primary-hover disabled:opacity-50 disabled:bg-gray-600 transition"
                    >
                        <Send className="w-5 h-5 ml-[-2px]" />
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AICoach;
