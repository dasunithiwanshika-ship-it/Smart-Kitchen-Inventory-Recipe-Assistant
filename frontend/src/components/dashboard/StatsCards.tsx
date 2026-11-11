import React from 'react';
import {
  Boxes,
  AlertTriangle,
  Flame,
  Refrigerator,
  Snowflake,
  Archive,
  ArrowUpRight,
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
      label: 'Total Items',
      value: stats?.total_items || 0,
      subValue: `${stats?.total_quantity || 0} units tracked`,
      icon: Boxes,
      iconBg: 'bg-[#e9e7df] text-[#141a4a]',
      accent: 'text-[#141a4a]',
      onClick: () => onFilterClick('All', 'All'),
    },
    {
      label: 'Use Soon',
      value: expiringCount,
      subValue: stats?.critical_items ? `${stats.critical_items} critical (0–1d)` : 'Next 3 days',
      icon: AlertTriangle,
      iconBg: expiringCount > 0 ? 'bg-[#f7d23a] text-[#141a4a]' : 'bg-[#e9e7df] text-[#141a4a]',
      accent: expiringCount > 0 ? 'text-amber-700' : 'text-[#141a4a]',
      badge: expiringCount > 0 ? 'Priority' : undefined,
      onClick: () => onFilterClick('All', 'Expiring Soon'),
    },
    {
      label: 'Expired',
      value: stats?.expired_items || 0,
      subValue: stats?.expired_items ? 'Needs cleanup' : 'Zero waste!',
      icon: Flame,
      iconBg: stats?.expired_items ? 'bg-rose-100 text-rose-700' : 'bg-[#e9e7df] text-[#141a4a]',
      accent: stats?.expired_items ? 'text-rose-600' : 'text-[#141a4a]',
      onClick: () => onFilterClick('All', 'Expired'),
    },
    {
      label: 'Refrigerator',
      value: stats?.refrigerator_items || 0,
      subValue: 'Chilled stock',
      icon: Refrigerator,
      iconBg: 'bg-[#e9e7df] text-[#141a4a]',
      accent: 'text-[#141a4a]',
      onClick: () => onFilterClick('Refrigerator'),
    },
    {
      label: 'Freezer',
      value: stats?.freezer_items || 0,
      subValue: 'Frozen stock',
      icon: Snowflake,
      iconBg: 'bg-[#e9e7df] text-[#141a4a]',
      accent: 'text-[#141a4a]',
      onClick: () => onFilterClick('Freezer'),
    },
    {
      label: 'Pantry',
      value: stats?.pantry_items || 0,
      subValue: 'Dry & spices',
      icon: Archive,
      iconBg: 'bg-[#e9e7df] text-[#141a4a]',
      accent: 'text-[#141a4a]',
      onClick: () => onFilterClick('Pantry'),
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-[1.19vw]">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <button
            key={idx}
            type="button"
            onClick={card.onClick}
            className="bg-white rounded-[14px] border border-transparent hover:border-[#3a49c9]/35 p-4 text-left flex flex-col justify-between group transition-colors duration-200 cursor-pointer"
          >
            <div className="flex items-center justify-between w-full mb-3">
              <div className={`p-2 rounded-xl ${card.iconBg} transition-colors`}>
                <Icon className="w-4 h-4 stroke-[1.75]" />
              </div>
              {card.badge ? (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#f7d23a] text-[#141a4a]">
                  {card.badge}
                </span>
              ) : (
                <ArrowUpRight className="w-3.5 h-3.5 text-[#16193a]/25 group-hover:text-[#3a49c9] transition-colors" />
              )}
            </div>

            <div>
              <span className={`text-2xl font-semibold ${card.accent} tracking-tight`}>
                {card.value}
              </span>
              <p className="text-xs font-semibold text-[#16193a] truncate mt-0.5">
                {card.label}
              </p>
              <p className="text-[11px] text-[#16193a]/55 truncate mt-0.5">{card.subValue}</p>
            </div>
          </button>
        );
      })}
    </div>
  );
};
