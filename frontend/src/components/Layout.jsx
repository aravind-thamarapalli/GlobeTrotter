import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, Map, PlusCircle, User, LayoutDashboard, Settings } from 'lucide-react';

const Layout = () => {
    const { logout, user } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="flex h-screen overflow-hidden">
            {/* Sidebar */}
            <aside className="w-64 glass-card m-4 mr-0 flex flex-col hidden md:flex">
                <div className="p-6">
                    <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-200">
                        GlobeTrotter
                    </h1>
                </div>

                <nav className="flex-1 px-4 space-y-2">
                    <Link to="/dashboard" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-white/10 transition-colors text-white/80 hover:text-white">
                        <LayoutDashboard size={20} />
                        <span>Dashboard</span>
                    </Link>
                    <Link to="/create-trip" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-white/10 transition-colors text-white/80 hover:text-white">
                        <PlusCircle size={20} />
                        <span>Plan Trip</span>
                    </Link>
                    {user?.role === 'admin' && (
                        <Link to="/admin" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-white/10 transition-colors text-yellow-200/80 hover:text-yellow-200">
                            <Settings size={20} />
                            <span>Admin</span>
                        </Link>
                    )}
                </nav>

                <div className="p-4 border-t border-white/10 space-y-2">
                    <Link to="/profile" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-white/10 transition-colors text-white/80 hover:text-white">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-blue-500 flex items-center justify-center font-bold text-sm">
                            {user?.name?.[0] || 'U'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{user?.name}</p>
                            <p className="text-xs text-white/50 truncate">View Profile</p>
                        </div>
                        <User size={16} className="text-white/40" />
                    </Link>
                    <button onClick={handleLogout} className="flex items-center space-x-3 p-3 w-full rounded-lg hover:bg-red-500/20 text-red-300 hover:text-red-100 transition-colors">
                        <LogOut size={20} />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto p-4 md:p-8">
                <Outlet />
            </main>
        </div>
    );
};

export default Layout;
