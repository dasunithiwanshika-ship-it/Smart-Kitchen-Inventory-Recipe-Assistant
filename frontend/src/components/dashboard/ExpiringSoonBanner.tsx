import React from 'react';
import { AlertTriangle, Clock, ChefHat, ArrowRight } from 'lucide-react';
import { InventoryItem } from '../../types';

interface ExpiringSoonBannerProps {
  items: InventoryItem[];
  onCookClick: () => void;
  onViewInventoryClick: () => void;
}

export const ExpiringSoonBanner: React.FC<ExpiringSoonBannerProps> = ({
  items,
  onCookClick,
  onViewInventoryClick,
}) => {
  if (items.length === 0) return null;

  const criticalItems = items.filter((i) => i.days_until_expiry !== null && i.days_until_expiry <= 1);

  return (
    <div className="bg-[#fff9e2] rounded-[14px] border border-[#f7d23a] p-4 sm:p-5">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-[#f7d23a] text-[#141a4a] shrink-0 mt-0.5">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-base text-[#141a4a]">
                {criticalItems.length > 0 ? 'Use These First: Expiring Very Soon' : 'Ingredients Expiring Soon'}
              </h3>
              <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-[#141a4a] text-white">
                {items.length} {items.length === 1 ? 'item' : 'items'}
              </span>
            </div>
            <p className="text-xs text-[#16193a]/75 mt-1 max-w-xl leading-relaxed">
              Cook with these ingredients first to avoid waste. Our AI recipe ranker automatically puts them at the top.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={onCookClick}
            className="flex items-center gap-2 px-4 py-2 rounded-[40px] bg-[#141a4a] hover:bg-[#3a49c9] text-white font-semibold text-xs transition-colors cursor-pointer"
          >
            <ChefHat className="w-4 h-4" />
            <span>Recipe Ideas</span>
          </button>
          <button
            type="button"
            onClick={onViewInventoryClick}
            className="flex items-center gap-1.5 px-4 py-2 rounded-[40px] bg-white hover:bg-[#141a4a] hover:text-white text-[#141a4a] font-semibold text-xs transition-colors cursor-pointer"
          >
            <span>View Items</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="mt-3.5 pt-3 border-t border-[#f7d23a]/60 flex items-center gap-2 overflow-x-auto pb-1">
        <span className="text-[11px] font-semibold text-[#141a4a] uppercase tracking-wider shrink-0 flex items-center gap-1">
          <Clock className="w-3.5 h-3.5" /> Soonest:
        </span>
        {items.map((item) => (
          <div
            key={item.id}
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium shrink-0 ${
              item.days_until_expiry !== null && item.days_until_expiry <= 1
                ? 'bg-rose-100 text-rose-900'
                : 'bg-white text-[#141a4a]'
            }`}
          >
            <span className="font-semibold">{item.food_name}</span>
            <span className="text-[10px] opacity-65">({item.quantity} {item.unit})</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full font-semibold bg-[#f7d23a]/70 text-[#141a4a]">
              {item.days_until_expiry === null
                ? 'Fresh'
                : item.days_until_expiry <= 0
                ? 'Today'
                : `${item.days_until_expiry}d left`}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
