import React, { useState } from 'react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { Sparkles, Activity, Utensils, BrainCircuit, ArrowRight, Zap, Target } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { AuthModal } from '../components/auth/AuthModal';

const LandingPage = () => {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [authView, setAuthView] = useState<'login' | 'register'>('register');
    
    const handleStart = () => {
        if (user) {
            navigate('/dashboard');
        } else {
            setAuthView('register');
            setIsAuthModalOpen(true);
        }
    };

    const handleLoginClick = () => {
        setAuthView('login');
        setIsAuthModalOpen(true);
    };

    return (
        <div className="flex flex-col gap-24 pb-20">
            {/* Hero Section */}
            <section className="relative min-h-[80vh] flex flex-col justify-center items-center text-center px-4 pt-20">
                <div className="absolute top-4 right-4 z-50">
                    {!user && (
                        <Button variant="secondary" onClick={handleLoginClick}>Sign In</Button>
                    )}
                </div>

                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8 animate-fade-in">
                    <Sparkles className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium text-gray-300">AI-Powered Transformations</span>
                </div>

                <h1 className="text-6xl md:text-7xl lg:text-8xl font-display font-bold tracking-tight mb-8 animate-fade-in [animation-delay:200ms] text-balance">
                    Your Personal <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-white to-accent-blue">
                        Health Architect
                    </span>
                </h1>

                <p className="text-lg md:text-xl text-gray-400 max-w-2xl mb-12 text-balance animate-fade-in [animation-delay:400ms]">
                    Experience the future of fitness. Customizable nutrition, adaptive workouts,
                    and real-time AI coaching—all wrapped in a premium digital ecosystem.
                </p>

                <div className="flex flex-col sm:flex-row items-center gap-4 animate-fade-in [animation-delay:600ms]">
                    <Button size="lg" className="w-full sm:w-auto group" onClick={handleStart}>
                        {user ? 'Go to Dashboard' : 'Start Your Journey'}
                        <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Button>
                    <Button variant="secondary" size="lg" className="w-full sm:w-auto" onClick={handleStart}>
                        View Demo
                    </Button>
                </div>

                {/* Floating Elements (Decorative) */}
                <Card className="absolute left-[5%] top-[60%] hidden lg:flex items-center gap-4 p-4 animate-float opacity-80 rotate-[-6deg] w-[280px]">
                    <div className="w-12 h-12 rounded-full bg-accent-purple/20 flex items-center justify-center text-accent-purple">
                        <Utensils className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-400">Next Meal</p>
                        <p className="font-semibold">Grilled Salmon Bowl</p>
                    </div>
                </Card>

                <Card className="absolute right-[5%] top-[25%] hidden lg:flex items-center gap-4 p-4 animate-float opacity-80 rotate-[6deg] w-[280px]" style={{ animationDelay: '1s' }}>
                    <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                        <Activity className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-400">Daily Goal</p>
                        <p className="font-semibold">85% Completed</p>
                    </div>
                </Card>

                <Card className="absolute right-[15%] top-[65%] hidden xl:flex items-center gap-4 p-4 animate-float opacity-80 rotate-[-3deg] w-[320px] bg-dark-800/90 border border-green-500/20 cursor-pointer hover:border-green-500/50 hover:scale-[1.02] transition-all" style={{ animationDelay: '1.5s' }} onClick={handleStart}>
                    <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 flex-shrink-0">
                        <Utensils className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-xs text-green-400 font-bold uppercase tracking-wider mb-0.5">Kitchen OS</p>
                        <p className="font-semibold text-sm">Generating Recipe: Anabolic French Toast</p>
                    </div>
                </Card>
            </section>

            {/* Bento Grid Features */}
            <section id="features" className="container mx-auto px-4">
                <div className="mb-16 text-center">
                    <h2 className="text-4xl font-display font-bold mb-4">Engineered for Results</h2>
                    <p className="text-gray-400">Everything you need to sculpt your best self.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-auto md:h-[600px]">
                    {/* Large Featured Card */}
                    <Card hoverEffect className="md:col-span-2 md:row-span-2 flex flex-col justify-between overflow-hidden relative group">
                        <div className="relative z-10">
                            <div className="w-12 h-12 rounded-xl bg-accent-blue/20 flex items-center justify-center text-accent-blue mb-6">
                                <BrainCircuit className="w-6 h-6" />
                            </div>
                            <h3 className="text-2xl font-bold mb-2">Real-Time AI Coaching</h3>
                            <p className="text-gray-400 max-w-md">
                                Get instant feedback, form correction, and motivation from our advanced AI model.
                                It adapts to your progress in real-time, just like a premium personal trainer.
                            </p>
                        </div>
                        <div className="absolute right-[-20%] bottom-[-20%] w-[60%] h-[60%] bg-accent-blue/10 rounded-full blur-3xl group-hover:bg-accent-blue/20 transition-all duration-500" />
                        <div className="mt-8 relative z-10 border border-white/10 bg-black/40 rounded-xl p-4 backdrop-blur-md">
                            <div className="flex items-start gap-4">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-green-500 flex-shrink-0" />
                                <div className="space-y-2 w-full">
                                    <div className="h-2 w-3/4 bg-white/10 rounded" />
                                    <div className="h-2 w-1/2 bg-white/10 rounded" />
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Small Card 1 */}
                    <Card id="workouts" hoverEffect className="flex flex-col justify-center relative overflow-hidden group">
                        <div className="relative z-10">
                            <Zap className="w-10 h-10 text-primary mb-4" />
                            <h3 className="text-xl font-bold mb-2">Adaptive Workouts</h3>
                            <p className="text-sm text-gray-400">Routines that evolve with your strength levels.</p>
                        </div>
                        <div className="absolute right-[-10%] top-[-10%] w-[100px] h-[100px] bg-primary/10 rounded-full blur-2xl group-hover:bg-primary/20 transition-all duration-500" />
                    </Card>

                    {/* Small Card 2 */}
                    <Card id="nutrition" hoverEffect className="flex flex-col justify-center relative overflow-hidden group cursor-pointer" onClick={handleStart}>
                        <div className="relative z-10">
                            <Target className="w-10 h-10 text-accent-purple mb-4" />
                            <h3 className="text-xl font-bold mb-2">Kitchen OS</h3>
                            <p className="text-sm text-gray-400">Pantry sync, macro generation, and visual video recipes mapped to your daily goals.</p>
                        </div>
                        <div className="absolute right-[-10%] top-[-10%] w-[100px] h-[100px] bg-accent-purple/10 rounded-full blur-2xl group-hover:bg-accent-purple/20 transition-all duration-500" />
                    </Card>
                </div>
            </section>

            {/* How It Works Section */}
            <section className="container mx-auto px-4 py-24 border-t border-white/5">
                <div className="text-center mb-20">
                    <h2 className="text-4xl font-display font-bold mb-4">The Algorithm of You</h2>
                    <p className="text-gray-400">Three simple steps to unlock your genetic potential.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
                    {/* Connecting UI Line */}
                    <div className="hidden md:block absolute top-[32px] left-[15%] right-[15%] h-px bg-gradient-to-r from-primary/10 via-accent-purple/40 to-accent-blue/10 z-0" />
                    
                    {[
                        { step: "01", title: "Scan & Sync", desc: "Connect wearables, log baseline metrics, and let our engine map out your starting bio-profile." },
                        { step: "02", title: "Voice-First Training", desc: "Put your AirPods in. The AI coaches you through heavy lifts, tracks reps, and pushes form in real-time." },
                        { step: "03", title: "Instant Adaptation", desc: "Post-workout, everything from your next meal's macros to tomorrow's volume is recalculated instantly." }
                    ].map((item, i) => (
                        <div key={item.step} className="relative z-10 flex flex-col items-center text-center group">
                            <div className="w-16 h-16 rounded-2xl bg-dark-800 border border-white/10 text-white font-display font-bold text-xl flex items-center justify-center mb-6 group-hover:border-primary/50 group-hover:shadow-[0_0_20px_rgba(204,255,0,0.15)] transition-all duration-300">
                                <span className={i === 0 ? "text-primary" : i === 1 ? "text-accent-purple" : "text-accent-blue"}>{item.step}</span>
                            </div>
                            <h3 className="text-2xl font-bold mb-3">{item.title}</h3>
                            <p className="text-gray-400 max-w-[280px] leading-relaxed">{item.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Pricing Section */}
            <section id="pricing" className="container mx-auto px-4 pt-12 pb-20 border-t border-white/5">
                <div className="text-center mb-16">
                    <h2 className="text-4xl font-display font-bold mb-4">Simple, Transparent Pricing</h2>
                    <p className="text-gray-400">Unlock your AI Health Architect.</p>
                </div>
                <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
                    <Card hoverEffect className="flex flex-col items-center text-center p-8">
                        <h3 className="text-2xl font-bold mb-2">Free Core</h3>
                        <div className="text-4xl font-display font-bold text-primary mb-6">$0<span className="text-sm text-gray-400 font-normal">/mo</span></div>
                        <p className="text-gray-400 mb-8 flex-1">Basic macro tracking and standard workout templates.</p>
                        <Button variant="secondary" className="w-full" onClick={handleStart}>Get Started Free</Button>
                    </Card>
                    <Card hoverEffect className="flex flex-col items-center text-center p-8 border-primary/50 relative overflow-hidden">
                        <div className="absolute top-0 right-0 bg-primary text-dark-900 text-xs font-bold px-3 py-1 rounded-bl-lg">POPULAR</div>
                        <h3 className="text-2xl font-bold mb-2">Pro Coach</h3>
                        <div className="text-4xl font-display font-bold text-primary mb-6">$15<span className="text-sm text-gray-400 font-normal">/mo</span></div>
                        <p className="text-gray-400 mb-8 flex-1">Real-time AI coaching, adaptive scaling, and detailed analytics.</p>
                        <Button className="w-full" onClick={handleStart}>Upgrade to Pro</Button>
                    </Card>
                </div>
            </section>

            {/* Stats / Social Proof */}
            <section className="container mx-auto px-4 py-20 border-t border-white/5">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                    {[
                        { label: 'Active Users', value: '10k+' },
                        { label: 'Workouts Logged', value: '1M+' },
                        { label: 'AI Responses', value: '5M+' },
                        { label: 'App Store Rating', value: '4.9' },
                    ].map((stat) => (
                        <div key={stat.label}>
                            <div className="text-3xl md:text-4xl font-display font-bold text-white mb-2">{stat.value}</div>
                            <div className="text-sm text-gray-500 uppercase tracking-wider">{stat.label}</div>
                        </div>
                    ))}
                </div>
            </section>

            <AuthModal 
                isOpen={isAuthModalOpen} 
                onClose={() => setIsAuthModalOpen(false)} 
                defaultView={authView}
            />
        </div>
    );
};

export default LandingPage;
