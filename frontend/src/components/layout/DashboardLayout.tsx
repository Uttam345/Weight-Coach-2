import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { LayoutDashboard, MessageSquare, PieChart, Dumbbell, LogOut, User, ChefHat, Heart } from 'lucide-react';
import { cn } from '../../lib/utils';

const DashboardLayout = () => {
    const { user, logout } = useAuthStore();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const navItems = [
        { name: 'Overview',  path: '/dashboard',           icon: LayoutDashboard },
        { name: 'AI Coach',  path: '/dashboard/ai-coach',   icon: MessageSquare },
        { name: 'Nutrition', path: '/dashboard/nutrition',  icon: PieChart },
        { name: 'Health',    path: '/dashboard/health',     icon: Heart },
        { name: 'Kitchen OS',path: '/dashboard/kitchen',    icon: ChefHat },
        { name: 'Workouts',  path: '/dashboard/workouts',   icon: Dumbbell },
    ];

    return (
        <div className="flex h-screen bg-dark-900 text-white overflow-hidden">
            {/* Sidebar Desktop */}
            <aside className="w-64 flex-shrink-0 bg-dark-800 border-r border-glass-border hidden md:flex flex-col">
                <div className="p-6 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent-blue flex items-center justify-center text-dark-900 shadow-md">
                        <Dumbbell className="w-5 h-5" strokeWidth={2.5} />
                    </div>
                    <span className="font-display font-bold text-lg">Weight Coach</span>
                </div>

                <div className="px-4 py-2 flex flex-col gap-2 flex-1">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-widest pl-2 mb-2">Menu</span>
                    {navItems.map((item) => (
                        <NavLink
                            key={item.name}
                            to={item.path}
                            end={item.path === '/dashboard'}
                            className={({ isActive }) =>
                                cn(
                                    'flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-colors duration-200',
                                    isActive
                                        ? 'bg-glass-hover text-white'
                                        : 'text-gray-400 hover:bg-glass hover:text-white'
                                )
                            }
                        >
                            <item.icon className="w-5 h-5" />
                            {item.name}
                        </NavLink>
                    ))}
                </div>

                <div className="p-4 border-t border-glass-border">
                    <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-glass mb-4">
                        <div className="w-10 h-10 rounded-full bg-dark-900 border border-primary/30 flex items-center justify-center">
                            <User className="w-5 h-5 text-gray-300" />
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <p className="text-sm font-bold truncate">{user?.name || 'Demo User'}</p>
                            <p className="text-xs text-primary truncate">Pro Coach Active</p>
                        </div>
                    </div>
                    
                    <button 
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-400 hover:bg-red-500/10 hover:text-red-400 transition-colors duration-200 font-medium"
                    >
                        <LogOut className="w-5 h-5" />
                        Logout
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col min-w-0 h-full overflow-y-auto bg-dark-900 relative">
                {/* Decorative glow top-right */}
                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
                
                <div className="flex-1 max-w-6xl w-full mx-auto p-4 md:p-8 z-10">
                    <Outlet />
                </div>
            </main>
            
            {/* Mobile Nav Bar - Bottom Fixed */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 bg-dark-800/90 backdrop-blur-xl border-t border-glass-border p-2 z-50 flex justify-around items-center">
                 {navItems.map((item) => (
                    <NavLink
                        key={item.name}
                        to={item.path}
                        end={item.path === '/dashboard'}
                        className={({ isActive }) =>
                            cn(
                                'flex flex-col items-center gap-1 p-2 rounded-lg transition-colors duration-200',
                                isActive ? 'text-primary' : 'text-gray-400'
                            )
                        }
                    >
                        <item.icon className="w-6 h-6" />
                        <span className="text-[10px] font-medium">{item.name}</span>
                    </NavLink>
                 ))}
            </div>
        </div>
    );
};

export default DashboardLayout;
