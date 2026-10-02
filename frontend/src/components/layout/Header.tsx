import React, { useState } from 'react';
import {
  Bell,
  Plus,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { InventoryItem } from '../../types';

interface HeaderProps {
  currentTab: string;
  onAddFoodClick: () => void;
  urgentItems: InventoryItem[];
}

export const Header: React.FC<HeaderProps> = ({ currentTab, onAddFoodClick, urgentItems }) => {
  const { user } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);

  const getTitle = () => {
    switch (currentTab) {
      case 'dashboard':
        return { title: 'Dashboard', sub: 'Overview of food stock, expiry risks & recommendations' };
      case 'inventory':
        return { title: 'Kitchen Inventory', sub: 'Manage, search, and track all your groceries' };
      case 'scan':
        return { title: 'Barcode Scanner', sub: 'Scan food packages to automatically populate details' };
      case 'recipes':
        return { title: 'AI Recipe Assistant', sub: 'Zero-waste recipe recommendations prioritized by expiry' };
      case 'leftovers':
        return { title: 'Leftovers Tracker', sub: 'Keep track of cooked meals and use-before dates' };
      case 'analytics':
        return { title: 'Food Waste Analytics', sub: 'Machine learning predictions and waste reduction metrics' };
      case 'assistant':
        return { title: 'AI Kitchen Copilot', sub: 'Ask questions about your live inventory and recipes' };
      case 'settings':
        return { title: 'Settings', sub: 'Manage notification alerts and kitchen preferences' };
      default:
        return { title: 'Smart Kitchen AI', sub: 'AI-Powered Smart Kitchen Assistant' };
    }
  };

  const { title, sub } = getTitle();

  return (
    <header className="sticky top-0 z-20 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80 px-4 md:px-8 py-3.5 flex items-center justify-between">
      {/* Title */}
      <div>
        <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
          {title}
        </h2>
        <p className="text-xs text-slate-400 hidden sm:block">{sub}</p>
      </div>

      {/* Action Buttons & Notification */}
      <div className="flex items-center gap-3">
        {/* Quick Add Button */}
        <button
          onClick={onAddFoodClick}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-semibold text-xs shadow-md shadow-emerald-500/20 active:scale-95 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Food</span>
        </button>

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800/80 transition-colors relative cursor-pointer"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            {urgentItems.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-slate-950 animate-pulse" />
            )}
          </button>

          {/* Notifications Dropdown Modal */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-4 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-emerald-400" />
                  <h4 className="text-sm font-bold text-white">Kitchen Alerts</h4>
                </div>
                <button
                  onClick={() => setShowNotifications(false)}
                  className="text-slate-400 hover:text-slate-200 p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="mt-3 max-h-72 overflow-y-auto space-y-2 pr-1">
                {urgentItems.length === 0 ? (
                  <div className="py-6 text-center text-slate-400">
                    <CheckCircle2 className="w-8 h-8 text-emerald-400/80 mx-auto mb-2" />
                    <p className="text-xs">No urgent alerts. Everything is fresh!</p>
                  </div>
                ) : (
                  urgentItems.map((item) => (
                    <div
                      key={item.id}
                      className={`p-2.5 rounded-xl border flex items-start gap-2.5 ${
                        item.days_until_expiry <= 1
                          ? 'bg-rose-500/10 border-rose-500/20 text-rose-200'
                          : 'bg-amber-500/10 border-amber-500/20 text-amber-200'
                      }`}
                    >
                      <AlertTriangle className={`w-4 h-4 mt-0.5 shrink-0 ${
                        item.days_until_expiry <= 1 ? 'text-rose-400' : 'text-amber-400'
                      }`} />
                      <div className="flex-1 text-xs">
                        <div className="font-semibold text-slate-100 flex items-center justify-between">
                          <span>{item.food_name}</span>
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-950/40">
                            {item.quantity} {item.unit}
                          </span>
                        </div>
                        <p className="mt-0.5 text-slate-300">
                          {item.days_until_expiry < 0
                            ? '🔴 Expired already'
                            : item.days_until_expiry === 0
                            ? '⚠️ Expires TODAY'
                            : `Expires in ${item.days_until_expiry} day${item.days_until_expiry > 1 ? 's' : ''}`}
                          {' '}in {item.storage_location}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
