import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, Dumbbell } from 'lucide-react';
import Button from '../ui/Button';
import { cn } from '../../lib/utils';
import { useAuthStore } from '../../store/authStore';

const Navbar = () => {
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const navigate = useNavigate();
    const { setUser } = useAuthStore();
    
    const handleLogin = () => {
        setUser({ _id: 'mock123', name: 'Demo User', email: 'demo@example.com', token: 'mock-token' });
        navigate('/dashboard');
    };

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navLinks = [
        { name: 'Features', href: '#features' },
        { name: 'Workouts', href: '#workouts' },
        { name: 'Nutrition', href: '#nutrition' },
        { name: 'Pricing', href: '#pricing' },
    ];

    return (
        <nav
            className={cn(
                'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
                scrolled ? 'bg-dark-900/80 backdrop-blur-xl border-b border-white/5 py-4' : 'bg-transparent py-6'
            )}
        >
            <div className="max-w-[1440px] mx-auto px-6 flex items-center justify-between">
                {/* Logo */}
                <Link to="/" className="flex items-center gap-2 group">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent-blue flex items-center justify-center text-dark-900 shadow-lg group-hover:shadow-[0_0_20px_-5px_rgba(204,255,0,0.6)] transition-all duration-300">
                        <Dumbbell className="w-6 h-6 rotate-[-15deg]" strokeWidth={2.5} />
                    </div>
                    <span className="text-xl font-display font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">
                        Weight Coach
                    </span>
                </Link>

                {/* Desktop Nav */}
                <div className="hidden md:flex items-center gap-8">
                    {navLinks.map((link) => (
                        <a
                            key={link.name}
                            href={link.href}
                            className="text-sm font-medium text-gray-400 hover:text-primary transition-colors duration-200"
                        >
                            {link.name}
                        </a>
                    ))}
                </div>

                {/* CTA */}
                <div className="hidden md:flex items-center gap-4">
                    <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white" onClick={handleLogin}>
                        Sign In
                    </Button>
                    <Button size="sm" variant="primary" onClick={handleLogin}>
                        Get Started
                    </Button>
                </div>

                {/* Mobile Menu Button */}
                <button
                    className="md:hidden text-gray-300 hover:text-white"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                    {mobileMenuOpen ? <X /> : <Menu />}
                </button>
            </div>

            {/* Mobile Menu Dropdown */}
            {mobileMenuOpen && (
                <div className="md:hidden absolute top-[100%] left-0 right-0 bg-dark-900/95 backdrop-blur-xl border-b border-white/10 p-6 flex flex-col gap-4 animate-fade-in shadow-2xl">
                    {navLinks.map((link) => (
                        <a
                            key={link.name}
                            href={link.href}
                            className="text-lg font-medium text-gray-300 hover:text-primary py-2"
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            {link.name}
                        </a>
                    ))}
                    <div className="h-px bg-white/10 my-2" />
                    <Button variant="secondary" className="w-full justify-center" onClick={handleLogin}>
                        Sign In
                    </Button>
                    <Button variant="primary" className="w-full justify-center" onClick={handleLogin}>
                        Get Started
                    </Button>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
