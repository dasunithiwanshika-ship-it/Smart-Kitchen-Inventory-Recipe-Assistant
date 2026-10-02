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

  const criticalItems = items.filter((i) => i.days_until_expiry <= 1);

  return (
    <div className="relative overflow-hidden rounded-2xl border border-amber-500/30 bg-gradient-to-r from-amber-950/40 via-slate-900/90 to-slate-900/90 p-4 md:p-5 shadow-xl backdrop-blur-md">
      {/* Subtle background glow */}
      <div className="absolute top-0 right-0 -mt-8 -mr-8 w-40 h-40 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Title and summary */}
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 shrink-0 mt-0.5">
            <AlertTriangle className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-base text-amber-200">
                {criticalItems.length > 0 ? 'Urgent Action Required' : 'Ingredients Expiring Soon'}
              </h3>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-500 text-slate-950">
                {items.length} {items.length === 1 ? 'item' : 'items'}
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1 max-w-xl">
              Cook these ingredients first to eliminate food waste. Smart Kitchen AI has automatically ranked recipes that make full use of them!
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={onCookClick}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all active:scale-95 cursor-pointer"
          >
            <ChefHat className="w-4 h-4" />
            <span>Generate Recipes</span>
          </button>
          <button
            onClick={onViewInventoryClick}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors cursor-pointer"
          >
            <span>View Items</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Pill items preview */}
      <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center gap-2 overflow-x-auto pb-1">
        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider shrink-0 flex items-center gap-1">
          <Clock className="w-3 h-3 text-amber-400" /> Approaching:
        </span>
        {items.map((item) => (
          <div
            key={item.id}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border shrink-0 ${
              item.days_until_expiry <= 1
                ? 'bg-rose-500/15 border-rose-500/30 text-rose-300'
                : 'bg-amber-500/15 border-amber-500/30 text-amber-300'
            }`}
          >
            <span>{item.food_name}</span>
            <span className="text-[10px] opacity-75 font-mono">({item.quantity} {item.unit})</span>
            <span className="text-[10px] px-1 py-0.2 rounded bg-slate-950/40 font-bold">
              {item.days_until_expiry <= 0 ? 'Today' : `${item.days_until_expiry}d`}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
