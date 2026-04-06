import { Link, useLocation } from 'react-router-dom';
import { Home, DollarSign, Calendar, ShoppingBag } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { cn } from '../lib/utils';

export function BottomNav() {
  const location = useLocation();
  const { isAdmin } = useAuth();

  const navItems = [
    { path: '/', icon: Home, label: 'Início' },
    { path: '/finance', icon: DollarSign, label: 'Financeiro' },
    { path: '/events', icon: Calendar, label: 'Eventos' },
    { path: '/store', icon: ShoppingBag, label: 'Loja' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-blue-100 px-6 py-3 flex justify-between items-center z-50 shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
      {navItems.map((item) => {
        const isActive = location.pathname === item.path;
        const Icon = item.icon;
        
        return (
          <Link
            key={item.path}
            to={item.path}
            className={cn(
              "flex flex-col items-center gap-1 transition-colors duration-200",
              isActive ? "text-[#004d4d]" : "text-blue-300 hover:text-blue-400"
            )}
          >
            <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
            <span className="text-[10px] font-medium">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
