import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

const Layout = () => {
    return (
        <div className="min-h-screen bg-dark-900 flex flex-col relative w-full overflow-hidden">
            {/* Background Gradients */}
            <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] max-w-[800px] max-h-[800px] bg-primary/20 blur-[120px] rounded-full pointer-events-none opacity-40 mix-blend-screen animate-pulse-slow" />
            <div className="absolute top-[40%] right-[-5%] w-[40vw] h-[40vw] max-w-[600px] max-h-[600px] bg-accent-purple/20 blur-[120px] rounded-full pointer-events-none opacity-40 mix-blend-screen animate-pulse-slow" style={{ animationDelay: '2s' }} />

            <Navbar />
            <main className="flex-1 w-full max-w-[1440px] mx-auto z-10 p-4 pt-24">
                <Outlet />
            </main>

            {/* Global Footer */}
            <footer className="w-full bg-dark-900 border-t border-white/5 pt-16 pb-8 z-10 mt-auto relative">
                <div className="max-w-[1440px] mx-auto px-8 grid grid-cols-1 md:grid-cols-4 gap-12">
                    <div className="col-span-1 md:col-span-2">
                        <span className="text-2xl font-display font-bold tracking-tight text-white mb-4 block">
                            Weight Coach <span className="text-primary tracking-normal font-sans text-xs ml-2 px-2 py-1 bg-primary/10 rounded-full border border-primary/20">BETA</span>
                        </span>
                        <p className="text-gray-500 max-w-sm leading-relaxed">
                            The intelligent health platform giving Gen-Z athletes the ultimate edge through voice AI and predictive macro analytics.
                        </p>
                    </div>
                    <div>
                        <h4 className="font-bold text-white mb-4">Platform</h4>
                        <ul className="space-y-3 text-sm text-gray-500">
                            <li><a href="#features" className="hover:text-primary transition-colors">Features</a></li>
                            <li><a href="#workouts" className="hover:text-primary transition-colors">AI Workouts</a></li>
                            <li><a href="#nutrition" className="hover:text-primary transition-colors">Macro Precision</a></li>
                            <li><a href="#pricing" className="hover:text-primary transition-colors">Pricing</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold text-white mb-4">Legal & Default</h4>
                        <ul className="space-y-3 text-sm text-gray-500">
                            <li><a href="#" className="hover:text-accent-purple transition-colors">Terms of Service</a></li>
                            <li><a href="#" className="hover:text-accent-purple transition-colors">Privacy Policy</a></li>
                            <li><a href="#" className="hover:text-accent-purple transition-colors">Contact Support</a></li>
                        </ul>
                    </div>
                </div>
                <div className="max-w-[1440px] mx-auto px-8 mt-16 pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-gray-600">
                    <p>© 2026 Weight Coach AI. Engineered for Results.</p>
                    <div className="flex items-center gap-6">
                        <span>Built with Next-Gen Intelligence</span>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Layout;
