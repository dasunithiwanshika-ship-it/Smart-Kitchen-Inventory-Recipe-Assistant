import React, { useRef, useState } from 'react';
import {
  Bell,
  Plus,
  AlertTriangle,
  CheckCircle2,
  X,
  ChevronDown,
  LogOut,
  Camera,
  UtensilsCrossed,
  Bot,
  Settings,
  PackagePlus,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { InventoryItem } from '../../types';

interface HeaderProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  onAddFoodClick: () => void;
  onOpenScanner: () => void;
  onOpenAddLeftover: () => void;
  urgentItems: InventoryItem[];
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  setCurrentTab,
  onAddFoodClick,
  onOpenScanner,
  onOpenAddLeftover,
  urgentItems,
}) => {
  const { user, logout } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);
  const closeTimerRef = useRef<number | null>(null);

  const navLinks = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'inventory', label: 'Inventory', badge: urgentItems.length > 0 ? urgentItems.length : undefined },
    { id: 'recipes', label: 'Recipes' },
    { id: 'leftovers', label: 'Leftovers' },
    { id: 'analytics', label: 'Waste Stats' },
    { id: 'assistant', label: 'Copilot' },
  ];

  const openTools = () => {
    if (closeTimerRef.current) window.clearTimeout(closeTimerRef.current);
    setToolsOpen(true);
  };

  const scheduleCloseTools = () => {
    if (closeTimerRef.current) window.clearTimeout(closeTimerRef.current);
    closeTimerRef.current = window.setTimeout(() => setToolsOpen(false), 160);
  };

  const quickTools = [
    {
      label: 'Scan Packaging',
      icon: Camera,
      action: () => {
        setToolsOpen(false);
        onOpenScanner();
      },
    },
    {
      label: 'Add Groceries',
      icon: PackagePlus,
      action: () => {
        setToolsOpen(false);
        onAddFoodClick();
      },
    },
    {
      label: 'Log Leftover',
      icon: UtensilsCrossed,
      action: () => {
        setToolsOpen(false);
        onOpenAddLeftover();
      },
    },
    {
      label: 'Kitchen Copilot',
      icon: Bot,
      action: () => {
        setToolsOpen(false);
        setCurrentTab('assistant');
      },
    },
    {
      label: 'Settings',
      icon: Settings,
      action: () => {
        setToolsOpen(false);
        setCurrentTab('settings');
      },
    },
  ];

  return (
    <>
      <header className="fixed left-1/2 -translate-x-1/2 top-[1.6vh] w-[calc(100vw-24px)] md:w-[87vw] h-[54px] bg-white rounded-[10px] px-4 md:px-[2.6vw] flex items-center justify-between z-40">
        {/* Brand */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => setCurrentTab('dashboard')}
            className="flex items-center gap-2 cursor-pointer"
          >
            <span className="text-[22px] font-semibold tracking-[-0.03em] text-[#16193a]">
              olla
            </span>
            <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full bg-[#f7d23a] text-[#141a4a] text-[10px] font-semibold tracking-wide">
              SMART KITCHEN
            </span>
          </button>
        </div>

        {/* Centered Navigation Links (Desktop) */}
        <nav className="hidden lg:flex items-center gap-[1.9vw] text-[14px] font-medium text-[#16193a]">
          <button
            type="button"
            onMouseEnter={openTools}
            onMouseLeave={scheduleCloseTools}
            onClick={() => setToolsOpen((v) => !v)}
            className={`olla-link flex items-center gap-1 cursor-pointer transition-opacity ${
              toolsOpen ? 'opacity-60' : ''
            }`}
          >
            <span>Quick Tools</span>
            <ChevronDown
              className={`w-3.5 h-3.5 transition-transform duration-300 ${
                toolsOpen ? 'rotate-180' : ''
              }`}
            />
          </button>

          {navLinks.map((link) => {
            const isActive = currentTab === link.id;
            return (
              <button
                key={link.id}
                type="button"
                onClick={() => setCurrentTab(link.id)}
                className={`olla-link flex items-center gap-1.5 cursor-pointer ${
                  isActive ? 'is-active font-semibold text-[#141a4a]' : 'text-[#16193a]/85 hover:text-[#16193a]'
                }`}
              >
                <span>{link.label}</span>
                {link.badge !== undefined && (
                  <span className="px-1.5 py-0.2 text-[10px] font-semibold rounded-full bg-[#f7d23a] text-[#141a4a]">
                    {link.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Right Controls */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          <button
            type="button"
            onClick={onAddFoodClick}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-[40px] bg-[#141a4a] hover:bg-[#3a49c9] text-white font-semibold text-xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Food</span>
          </button>

          {/* Notification Bell */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowNotifications((v) => !v)}
              className="p-2 rounded-full text-[#16193a] hover:bg-[#e9e7df]/70 transition-colors relative cursor-pointer"
              title="Kitchen Alerts"
            >
              <Bell className="w-4 h-4" />
              {urgentItems.length > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white" />
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white border border-[#16193a]/10 rounded-[14px] shadow-xl p-4 z-50">
                <div className="flex items-center justify-between pb-3 border-b border-[#e9e7df]">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-[#141a4a]" />
                    <h4 className="text-sm font-semibold text-[#16193a]">Kitchen Alerts</h4>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowNotifications(false)}
                    className="text-[#16193a]/50 hover:text-[#16193a] p-1 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="mt-3 max-h-72 overflow-y-auto space-y-2 pr-1">
                  {urgentItems.length === 0 ? (
                    <div className="py-6 text-center text-[#16193a]/60">
                      <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                      <p className="text-xs">Everything is fresh. No urgent alerts!</p>
                    </div>
                  ) : (
                    urgentItems.map((item) => {
                      const isCrit = item.days_until_expiry !== null && item.days_until_expiry <= 1;
                      return (
                        <div
                          key={item.id}
                          onClick={() => {
                            setShowNotifications(false);
                            setCurrentTab('inventory');
                          }}
                          className={`p-2.5 rounded-xl border flex items-start gap-2.5 cursor-pointer transition-colors ${
                            isCrit
                              ? 'bg-rose-50 border-rose-200 text-rose-900'
                              : 'bg-amber-50 border-amber-200 text-amber-900'
                          }`}
                        >
                          <AlertTriangle
                            className={`w-4 h-4 mt-0.5 shrink-0 ${
                              isCrit ? 'text-rose-500' : 'text-amber-600'
                            }`}
                          />
                          <div className="flex-1 text-xs">
                            <div className="font-semibold flex items-center justify-between">
                              <span>{item.food_name}</span>
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-white border border-black/10">
                                {item.quantity} {item.unit}
                              </span>
                            </div>
                            <p className="mt-0.5 opacity-80">
                              {item.days_until_expiry === null
                                ? 'Fresh'
                                : item.days_until_expiry < 0
                                ? 'Expired'
                                : item.days_until_expiry === 0
                                ? 'Expires TODAY'
                                : `Expires in ${item.days_until_expiry} day${item.days_until_expiry > 1 ? 's' : ''}`}{' '}
                              in {item.storage_location}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Pill + Logout */}
          <div className="hidden sm:flex items-center gap-1.5 bg-[#e9e7df]/75 rounded-full pl-2.5 pr-1.5 py-1">
            <span className="w-6 h-6 rounded-full bg-[#141a4a] text-white text-[11px] font-semibold flex items-center justify-center">
              {user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'C'}
            </span>
            <span className="text-xs font-medium text-[#16193a] pr-1">
              {user?.full_name?.split(' ')[0] || 'Chef'}
            </span>
            <button
              type="button"
              onClick={logout}
              title="Log out"
              className="p-1 rounded-full text-[#16193a]/60 hover:text-rose-600 hover:bg-white transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Clip-path Wipe Quick Tools Strip */}
      <div
        onMouseEnter={openTools}
        onMouseLeave={scheduleCloseTools}
        className={`olla-drop hidden lg:flex fixed left-1/2 -translate-x-1/2 w-[87vw] top-[calc(1.6vh+54px+0.8vh)] h-[84px] bg-white rounded-[10px] z-39 justify-center items-center gap-[5vw] ${
          toolsOpen ? 'is-open' : ''
        }`}
      >
        {quickTools.map((tool, idx) => {
          const Icon = tool.icon;
          return (
            <button
              key={tool.label}
              type="button"
              onClick={tool.action}
              style={{ transitionDelay: toolsOpen ? `${idx * 40}ms` : '0ms' }}
              className={`group flex flex-col items-center gap-1.5 text-xs font-medium text-[#16193a] transition-all duration-300 cursor-pointer ${
                toolsOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-1.5'
              }`}
            >
              <Icon className="w-6 h-6 stroke-[1.5] text-[#16193a] group-hover:text-[#3a49c9] transition-colors" />
              <span>{tool.label}</span>
            </button>
          );
        })}
      </div>
    </>
  );
};
