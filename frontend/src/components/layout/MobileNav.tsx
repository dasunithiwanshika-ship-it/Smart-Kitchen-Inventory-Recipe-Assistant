import React from 'react';
import {
  LayoutDashboard,
  Boxes,
  Camera,
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
    { id: 'scan', label: 'Scan', icon: Camera, isPrimary: true },
    { id: 'recipes', label: 'Recipes', icon: ChefHat },
    { id: 'assistant', label: 'Copilot', icon: Bot },
  ];

  return (
    <nav className="lg:hidden fixed bottom-3 left-3 right-3 z-30 bg-white rounded-[14px] border border-[#16193a]/10 px-2 py-2 shadow-lg">
      <div className="flex items-center justify-around">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;

          if (item.isPrimary) {
            return (
              <button
                key={item.id}
                onClick={() => setCurrentTab(item.id)}
                className="relative -top-3 flex flex-col items-center justify-center cursor-pointer"
              >
                <div className="w-11 h-11 rounded-full bg-[#141a4a] hover:bg-[#3a49c9] flex items-center justify-center text-white ring-4 ring-[#e9e7df] transition-transform active:scale-95">
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-semibold text-[#141a4a] mt-0.5">Scan</span>
              </button>
            );
          }

          return (
            <button
              key={item.id}
              onClick={() => setCurrentTab(item.id)}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-lg relative transition-all cursor-pointer ${
                isActive ? 'text-[#141a4a]' : 'text-[#16193a]/45 hover:text-[#16193a]'
              }`}
            >
              <div className="relative">
                <Icon className="w-5 h-5" />
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute -top-1.5 -right-2 px-1.5 py-0.2 text-[9px] font-semibold bg-[#f7d23a] text-[#141a4a] rounded-full">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className={`text-[11px] mt-0.5 ${isActive ? 'font-semibold text-[#141a4a]' : 'font-medium'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
