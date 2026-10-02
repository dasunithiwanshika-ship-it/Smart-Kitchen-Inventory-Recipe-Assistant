import React from 'react';
import {
  LayoutDashboard,
  Boxes,
  ScanLine,
  ChefHat,
  Bot
} from 'lucide-react';

interface MobileNavProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  urgentCount: number;
}

export const MobileNav: React.FC<MobileNavProps> = ({ currentTab, setCurrentTab, urgentCount }) => {
  const items = [
    { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
    { id: 'inventory', label: 'Inventory', icon: Boxes, badge: urgentCount },
    { id: 'scan', label: 'Scan', icon: ScanLine, isPrimary: true },
    { id: 'recipes', label: 'Recipes', icon: ChefHat },
    { id: 'assistant', label: 'AI Chat', icon: Bot },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-slate-900/95 border-t border-slate-800/90 backdrop-blur-xl px-2 py-2 safe-area-pb">
      <div className="flex items-center justify-around">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;

          if (item.isPrimary) {
            return (
              <button
                key={item.id}
                onClick={() => setCurrentTab(item.id)}
                className="relative -top-4 flex flex-col items-center justify-center"
              >
                <div className="w-13 h-13 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 shadow-lg shadow-emerald-500/30 ring-4 ring-slate-950 transition-transform active:scale-95">
                  <Icon className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-bold text-emerald-400 mt-1">Scan</span>
              </button>
            );
          }

          return (
            <button
              key={item.id}
              onClick={() => setCurrentTab(item.id)}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-lg relative transition-all ${
                isActive ? 'text-emerald-400' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="relative">
                <Icon className="w-5 h-5" />
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute -top-1.5 -right-2 px-1.5 py-0.2 text-[9px] font-bold bg-amber-500 text-slate-950 rounded-full">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className={`text-[11px] mt-1 font-medium ${isActive ? 'font-bold text-emerald-400' : ''}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
