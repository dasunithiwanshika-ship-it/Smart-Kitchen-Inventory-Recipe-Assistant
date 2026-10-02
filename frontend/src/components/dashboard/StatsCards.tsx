import React from 'react';
import {
  Boxes,
  AlertTriangle,
  Flame,
  Refrigerator,
  Snowflake,
  Archive,
  ArrowUpRight
} from 'lucide-react';
import { InventoryStats } from '../../types';

interface StatsCardsProps {
  stats: InventoryStats | null;
  onFilterClick: (storage?: string, status?: string) => void;
}

export const StatsCards: React.FC<StatsCardsProps> = ({ stats, onFilterClick }) => {
  const expiringCount = (stats?.critical_items || 0) + (stats?.expiring_soon_items || 0);

  const cards = [
    {
      label: 'Total Food Items',
      value: stats?.total_items || 0,
      subValue: `${stats?.total_quantity || 0} total units`,
      icon: Boxes,
      color: 'from-emerald-500/20 to-teal-500/5',
      textColor: 'text-emerald-400',
      borderColor: 'border-emerald-500/20',
      onClick: () => onFilterClick('All', 'All')
    },
    {
      label: 'Expiring Soon',
      value: expiringCount,
      subValue: stats?.critical_items ? `${stats.critical_items} critical (0-1d)` : 'Within 3 days',
      icon: AlertTriangle,
      color: 'from-amber-500/20 to-orange-500/5',
      textColor: 'text-amber-400',
      borderColor: 'border-amber-500/30',
      badge: expiringCount > 0 ? 'Urgent' : undefined,
      onClick: () => onFilterClick('All', 'Expiring Soon')
    },
    {
      label: 'Expired Items',
      value: stats?.expired_items || 0,
      subValue: stats?.expired_items ? 'Action needed' : 'Zero waste!',
      icon: Flame,
      color: 'from-rose-500/20 to-red-500/5',
      textColor: 'text-rose-400',
      borderColor: 'border-rose-500/20',
      onClick: () => onFilterClick('All', 'Expired')
    },
    {
      label: 'Refrigerator',
      value: stats?.refrigerator_items || 0,
      subValue: 'Chilled produce & dairy',
      icon: Refrigerator,
      color: 'from-blue-500/20 to-cyan-500/5',
      textColor: 'text-cyan-400',
      borderColor: 'border-cyan-500/20',
      onClick: () => onFilterClick('Refrigerator')
    },
    {
      label: 'Freezer',
      value: stats?.freezer_items || 0,
      subValue: 'Frozen meats & stock',
      icon: Snowflake,
      color: 'from-indigo-500/20 to-purple-500/5',
      textColor: 'text-indigo-400',
      borderColor: 'border-indigo-500/20',
      onClick: () => onFilterClick('Freezer')
    },
    {
      label: 'Pantry',
      value: stats?.pantry_items || 0,
      subValue: 'Dry goods & spices',
      icon: Archive,
      color: 'from-purple-500/20 to-pink-500/5',
      textColor: 'text-purple-400',
      borderColor: 'border-purple-500/20',
      onClick: () => onFilterClick('Pantry')
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <button
            key={idx}
            onClick={card.onClick}
            className={`glass-card p-3.5 rounded-2xl border ${card.borderColor} bg-gradient-to-br ${card.color} text-left flex flex-col justify-between group transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg cursor-pointer`}
          >
            <div className="flex items-center justify-between w-full mb-2">
              <div className={`p-2 rounded-xl bg-slate-900/60 ${card.textColor} border border-white/5`}>
                <Icon className="w-4 h-4" />
              </div>
              {card.badge ? (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse">
                  {card.badge}
                </span>
              ) : (
                <ArrowUpRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-slate-300 transition-colors opacity-0 group-hover:opacity-100" />
              )}
            </div>

            <div>
              <span className="text-2xl font-extrabold text-white tracking-tight">{card.value}</span>
              <p className="text-xs font-semibold text-slate-300 truncate">{card.label}</p>
              <p className="text-[10px] text-slate-400 truncate mt-0.5">{card.subValue}</p>
            </div>
          </button>
        );
      })}
    </div>
  );
};
