import React from 'react';
import {
  LayoutDashboard,
  Boxes,
  ScanLine,
  ChefHat,
  UtensilsCrossed,
  BarChart3,
  Bot,
  Settings,
  Sparkles,
  LogOut,
  Leaf
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  urgentCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, setCurrentTab, urgentCount }) => {
  const { user, logout } = useAuth();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'inventory', label: 'Inventory', icon: Boxes, badge: urgentCount > 0 ? urgentCount : undefined },
    { id: 'scan', label: 'Scan Barcode', icon: ScanLine },
    { id: 'recipes', label: 'AI Recipes', icon: ChefHat, highlight: true },
    { id: 'leftovers', label: 'Leftovers', icon: UtensilsCrossed },
    { id: 'analytics', label: 'Food Waste', icon: BarChart3 },
    { id: 'assistant', label: 'AI Assistant', icon: Bot, isNew: true },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 bg-slate-900/90 border-r border-slate-800/80 p-4 h-screen sticky top-0 backdrop-blur-xl z-20">
      {/* Brand Header */}
      <div className="flex items-center gap-3 px-3 py-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/20 ring-1 ring-white/20">
          <Leaf className="w-6 h-6 text-slate-950 font-black" />
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <h1 className="font-bold text-lg tracking-tight text-white">Smart Kitchen</h1>
            <span className="text-xs px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-semibold border border-emerald-500/30">AI</span>
          </div>
          <p className="text-xs text-slate-400 font-medium">Zero Waste Cooking</p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 space-y-1.5 overflow-y-auto pr-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentTab(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 group ${
                isActive
                  ? 'bg-gradient-to-r from-emerald-500/20 to-teal-500/10 text-emerald-400 border border-emerald-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-5 h-5 transition-transform duration-200 group-hover:scale-110 ${
                    isActive ? 'text-emerald-400' : 'text-slate-400 group-hover:text-slate-200'
                  }`}
                />
                <span>{item.label}</span>
              </div>

              <div className="flex items-center gap-1.5">
                {item.badge !== undefined && (
                  <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse">
                    {item.badge}
                  </span>
                )}
                {item.isNew && (
                  <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    NEW
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </nav>

      {/* Bottom User Profile card */}
      <div className="mt-auto pt-4 border-t border-slate-800/80">
        <div className="glass-panel p-3 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-500 flex items-center justify-center font-bold text-xs text-white uppercase shrink-0">
              {user?.full_name ? user.full_name.charAt(0) : 'U'}
            </div>
            <div className="truncate">
              <p className="text-xs font-semibold text-slate-200 truncate">{user?.full_name || 'Kitchen Master'}</p>
              <p className="text-[11px] text-slate-400 truncate">{user?.email || 'chef@kitchen.ai'}</p>
            </div>
          </div>
          <button
            onClick={logout}
            title="Log out"
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
