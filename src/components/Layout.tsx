import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { BottomNav } from './BottomNav';
import { LogOut } from 'lucide-react';

export function Layout() {
  const { user, profile, loading, logout } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-blue-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#004d4d]"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!profile?.className) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-blue-50 pb-24 font-sans">
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-blue-100">
        <div className="max-w-md mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full overflow-hidden border border-blue-100 shadow-sm">
              <img 
                src="https://i.ibb.co/yFbrQtht/graduation.png" 
                alt="Logo" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1523050853063-91589436026e?auto=format&fit=crop&q=80&w=200";
                }}
              />
            </div>
            <span className="font-black text-[#004d4d] tracking-tight">Formando 9°B</span>
          </div>
          <button 
            onClick={logout}
            className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-all"
            title="Sair"
          >
            <LogOut size={20} />
          </button>
        </div>
      </header>
      <main className="max-w-md mx-auto px-4 pt-4">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}
