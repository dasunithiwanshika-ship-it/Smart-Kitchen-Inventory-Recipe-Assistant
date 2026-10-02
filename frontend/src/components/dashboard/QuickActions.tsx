import React from 'react';
import { ScanLine, Plus, UtensilsCrossed, ChefHat, Sparkles } from 'lucide-react';

interface QuickActionsProps {
  onScanBarcode: () => void;
  onAddFood: () => void;
  onAddLeftover: () => void;
  onViewRecipes: () => void;
}

export const QuickActions: React.FC<QuickActionsProps> = ({
  onScanBarcode,
  onAddFood,
  onAddLeftover,
  onViewRecipes,
}) => {
  const actions = [
    {
      title: 'Scan Barcode',
      subtitle: 'Instant camera recognition',
      icon: ScanLine,
      color: 'from-emerald-500 to-teal-500',
      shadow: 'shadow-emerald-500/20',
      onClick: onScanBarcode,
      primary: true
    },
    {
      title: 'Add Food Item',
      subtitle: 'Manual entry (< 10 sec)',
      icon: Plus,
      color: 'from-blue-600 to-indigo-600',
      shadow: 'shadow-blue-500/20',
      onClick: onAddFood,
    },
    {
      title: 'Log Leftover',
      subtitle: 'Track cooked meals',
      icon: UtensilsCrossed,
      color: 'from-amber-600 to-orange-600',
      shadow: 'shadow-amber-500/20',
      onClick: onAddLeftover,
    },
    {
      title: 'AI Recipe Engine',
      subtitle: 'Zero-waste meal ideas',
      icon: ChefHat,
      color: 'from-purple-600 to-pink-600',
      shadow: 'shadow-purple-500/20',
      onClick: onViewRecipes,
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {actions.map((act, i) => {
        const Icon = act.icon;
        return (
          <button
            key={i}
            onClick={act.onClick}
            className={`glass-card p-4 rounded-2xl flex items-center gap-3.5 text-left group hover:-translate-y-0.5 transition-all duration-200 border border-white/5 hover:border-slate-700 cursor-pointer`}
          >
            <div
              className={`w-11 h-11 rounded-xl bg-gradient-to-tr ${act.color} flex items-center justify-center text-white shadow-lg ${act.shadow} shrink-0 group-hover:scale-105 transition-transform`}
            >
              <Icon className="w-5 h-5" />
            </div>
            <div className="overflow-hidden">
              <h4 className="text-sm font-bold text-slate-100 group-hover:text-emerald-400 transition-colors truncate">
                {act.title}
              </h4>
              <p className="text-[11px] text-slate-400 truncate">{act.subtitle}</p>
            </div>
          </button>
        );
      })}
    </div>
  );
};
