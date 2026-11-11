import React from 'react';
import { Camera, Plus, UtensilsCrossed, ChefHat } from 'lucide-react';

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
      title: 'Scan Packaging',
      subtitle: 'Read MFD & EXP dates with camera',
      icon: Camera,
      iconBg: 'bg-[#141a4a] text-white group-hover:bg-[#3a49c9]',
      onClick: onScanBarcode,
    },
    {
      title: 'Add Groceries',
      subtitle: 'Quick entry for fresh produce',
      icon: Plus,
      iconBg: 'bg-[#f7d23a] text-[#141a4a]',
      onClick: onAddFood,
    },
    {
      title: 'Log Leftover',
      subtitle: 'Track cooked meals & use-by date',
      icon: UtensilsCrossed,
      iconBg: 'bg-[#e9e7df] text-[#141a4a]',
      onClick: onAddLeftover,
    },
    {
      title: 'AI Recipes',
      subtitle: 'Meals matched to your stock',
      icon: ChefHat,
      iconBg: 'bg-[#e9e7df] text-[#141a4a]',
      onClick: onViewRecipes,
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-[1.19vw]">
      {actions.map((act, i) => {
        const Icon = act.icon;
        return (
          <button
            key={i}
            type="button"
            onClick={act.onClick}
            className="group bg-white rounded-[14px] border border-transparent hover:border-[#141a4a]/25 p-4 flex items-center gap-3.5 text-left transition-colors duration-200 cursor-pointer"
          >
            <div
              className={`w-11 h-11 rounded-xl ${act.iconBg} flex items-center justify-center shrink-0 transition-colors`}
            >
              <Icon className="w-5 h-5 stroke-[1.75]" />
            </div>
            <div className="overflow-hidden">
              <h4 className="text-sm font-semibold text-[#16193a] truncate">
                {act.title}
              </h4>
              <p className="text-[11px] text-[#16193a]/55 truncate">{act.subtitle}</p>
            </div>
          </button>
        );
      })}
    </div>
  );
};
