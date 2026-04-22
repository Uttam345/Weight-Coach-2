import React, { useState } from 'react';
import { X, Mail, Lock, User, Loader2, Eye, EyeOff, CheckCircle2, Circle } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useNavigate } from 'react-router-dom';
import Button from '../ui/Button';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultView?: 'login' | 'register';
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, defaultView = 'login' }) => {
  const [view, setView] = useState<'login' | 'register'>(defaultView);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const navigate = useNavigate();

  const { login, register, isLoading, error, clearError } = useAuthStore();

  if (!isOpen) return null;

  // Password strength logic
  const hasLength = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const isPasswordStrong = hasLength && hasUpper && hasNumber;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setLocalError(null);

    if (view === 'register') {
      if (!isPasswordStrong) {
        setLocalError('Please ensure your password meets all requirements.');
        return;
      }
      if (password !== confirmPassword) {
        setLocalError('Passwords do not match.');
        return;
      }
    }

    try {
      if (view === 'login') {
        await login(email, password);
      } else {
        await register(name, email, password);
      }
      onClose();
      navigate('/dashboard');
    } catch (err) {
      // Error is handled in the store and displayed via the `error` state
    }
  };

  const switchView = (newView: 'login' | 'register') => {
    clearError();
    setLocalError(null);
    setView(newView);
    setPassword('');
    setConfirmPassword('');
  };

  const displayError = localError || error;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-dark-800 border border-glass-border w-full max-w-md rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(204,255,0,0.1)] relative">
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full transition-colors z-10"
        >
          <X className="w-5 h-5 text-gray-400" />
        </button>

        <div className="p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-display font-bold mb-2">
              {view === 'login' ? 'Welcome Back' : 'Create Account'}
            </h2>
            <p className="text-gray-400 text-sm">
              {view === 'login' 
                ? 'Enter your credentials to access your dashboard.' 
                : 'Join NutriFlow and start your fitness journey.'}
            </p>
          </div>

          {displayError && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-500 px-4 py-3 rounded-xl mb-6 text-sm text-center">
              {displayError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {view === 'register' && (
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="text"
                  placeholder="Full Name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-dark-900 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-primary transition-colors"
                />
              </div>
            )}
            
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="email"
                placeholder="Email Address"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-dark-900 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-primary transition-colors"
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-dark-900 border border-white/10 rounded-xl py-3 pl-12 pr-12 text-white focus:outline-none focus:border-primary transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            {view === 'register' && (
              <>
                <div className="bg-dark-900 p-4 rounded-xl border border-white/5 space-y-2">
                  <p className="text-sm font-bold text-gray-300 mb-2">Password Requirements:</p>
                  <div className="flex flex-col gap-2 text-xs">
                    <div className={`flex items-center gap-2 ${hasLength ? 'text-primary' : 'text-gray-500'}`}>
                      {hasLength ? <CheckCircle2 className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
                      <span>At least 8 characters long</span>
                    </div>
                    <div className={`flex items-center gap-2 ${hasUpper ? 'text-primary' : 'text-gray-500'}`}>
                      {hasUpper ? <CheckCircle2 className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
                      <span>Contains an uppercase letter</span>
                    </div>
                    <div className={`flex items-center gap-2 ${hasNumber ? 'text-primary' : 'text-gray-500'}`}>
                      {hasNumber ? <CheckCircle2 className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
                      <span>Contains a number</span>
                    </div>
                  </div>
                </div>

                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Confirm Password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-dark-900 border border-white/10 rounded-xl py-3 pl-12 pr-12 text-white focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
              </>
            )}

            <Button type="submit" className="w-full mt-6" disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin mx-auto" />
              ) : (
                view === 'login' ? 'Sign In' : 'Sign Up'
              )}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-400">
            {view === 'login' ? (
              <p>
                Don't have an account?{' '}
                <button onClick={() => switchView('register')} className="text-primary hover:underline font-bold">
                  Sign up
                </button>
              </p>
            ) : (
              <p>
                Already have an account?{' '}
                <button onClick={() => switchView('login')} className="text-primary hover:underline font-bold">
                  Sign in
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
