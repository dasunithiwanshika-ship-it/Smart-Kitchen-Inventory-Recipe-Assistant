import React, { useState } from 'react';
import {
  Calendar,
  AlertTriangle,
  Clock,
  CheckCircle,
  UtensilsCrossed,
  Edit2,
  Plus,
  Minus,
  Infinity,
  Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { InventoryItem, RecipeRecommendation } from '../../types';

interface InventoryCardProps {
  item: InventoryItem;
  onEdit: (item: InventoryItem) => void;
  onConsume: (item: InventoryItem, quantity?: number) => void;
  onConvertToLeftover: (item: InventoryItem) => void;
  onAdjustQuantity: (item: InventoryItem, newQty: number) => void;
  suggestedRecipe?: RecipeRecommendation;
  onTryRecipe?: (recipe: RecipeRecommendation) => void;
}

export const InventoryCard: React.FC<InventoryCardProps> = ({
  item,
  onEdit,
  onConsume,
  onConvertToLeftover,
  onAdjustQuantity,
  suggestedRecipe,
  onTryRecipe,
}) => {
  // Status visual configurations
  const getStatusBadge = () => {
    if (!item.expiry_date) {
      return {
        label: 'No Expiry Date',
        bg: 'bg-slate-100 text-slate-700 border-slate-200',
        dot: 'bg-slate-400',
        bar: 'bg-slate-300',
        progress: 100,
        hasExpiry: false,
      };
    }

    switch (item.status) {
      case 'Expired':
        return {
          label: 'Expired',
          bg: 'bg-red-50 text-red-700 border-red-200',
          dot: 'bg-red-500',
          bar: 'bg-red-500',
          progress: 100,
          hasExpiry: true,
        };
      case 'Critical':
        return {
          label: item.days_until_expiry === 0 ? 'Expires Today' : '1 Day Left',
          bg: 'bg-red-50 text-red-700 border-red-200',
          dot: 'bg-red-500 animate-ping',
          bar: 'bg-red-500',
          progress: 90,
          hasExpiry: true,
        };
      case 'Expiring Soon':
        return {
          label: `${item.days_until_expiry}d Left`,
          bg: 'bg-amber-50 text-amber-800 border-amber-200',
          dot: 'bg-amber-500',
          bar: 'bg-amber-500',
          progress: 65,
          hasExpiry: true,
        };
      default:
        return {
          label: item.days_until_expiry !== null && item.days_until_expiry !== undefined
            ? `${item.days_until_expiry}d Fresh`
            : 'Fresh',
          bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          dot: 'bg-emerald-500',
          bar: 'bg-emerald-500',
          progress: Math.max(10, Math.min(100, 100 - (item.days_until_expiry || 0) * 5)),
          hasExpiry: true,
        };
    }
  };

  const statusConfig = getStatusBadge();

  // Storage icon mapping
  const getStorageBadge = () => {
    switch (item.storage_location) {
      case 'Refrigerator':
        return { icon: '❄️', label: 'Fridge', color: 'text-cyan-700' };
      case 'Freezer':
        return { icon: '🧊', label: 'Freezer', color: 'text-indigo-700' };
      case 'Pantry':
        return { icon: '📦', label: 'Pantry', color: 'text-purple-700' };
      default:
        return { icon: '☀️', label: 'Outside', color: 'text-amber-700' };
    }
  };

  const storageConfig = getStorageBadge();

  const handleConsumeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (typeof confetti === 'function') {
      confetti({
        particleCount: 40,
        spread: 50,
        origin: { y: 0.8 },
        colors: ['#10B981', '#34D399', '#6EE7B7'],
      });
    }
    onConsume(item);
  };

  return (
    <div
      className={`bg-white rounded-2xl border p-4 shadow-sm transition-all duration-200 hover:shadow-md relative flex flex-col justify-between ${
        item.status === 'Critical' ? 'border-red-200 bg-red-50/20' : 'border-slate-200'
      }`}
    >
      {/* Top row: Category & Expiry status badge */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <span>{storageConfig.icon}</span>
            <span className={`font-semibold ${storageConfig.color}`}>{storageConfig.label}</span>
            {item.category && (
              <>
                <span className="text-slate-300">•</span>
                <span className="truncate text-slate-600">{item.category.name}</span>
              </>
            )}
          </div>

          <span
            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${statusConfig.bg}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot}`} />
            <span>{statusConfig.label}</span>
          </span>
        </div>

        {/* Item Title & Quantity */}
        <div className="flex items-start justify-between gap-2 mt-1">
          <div>
            <h4 className="font-bold text-base text-slate-800 tracking-tight leading-snug">
              {item.food_name}
            </h4>
            {item.notes && (
              <p className="text-xs text-slate-500 mt-0.5 line-clamp-1 italic">
                "{item.notes}"
              </p>
            )}
          </div>

          {/* Quantity Controls */}
          <div className="flex items-center gap-1 bg-slate-50 rounded-xl px-2 py-1 border border-slate-200 shrink-0">
            <button
              type="button"
              onClick={() => onAdjustQuantity(item, Math.max(0, item.quantity - 1))}
              className="w-5 h-5 rounded-md hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
              title="Decrease quantity"
            >
              <Minus className="w-3 h-3" />
            </button>
            <span className="text-xs font-bold text-slate-800 px-1">
              {item.quantity} <span className="text-[10px] text-slate-500 font-normal">{item.unit}</span>
            </span>
            <button
              type="button"
              onClick={() => onAdjustQuantity(item, item.quantity + 1)}
              className="w-5 h-5 rounded-md hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
              title="Increase quantity"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Expiry or Purchase Date info */}
        <div className="mt-3">
          <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
            {item.expiry_date ? (
              <span>
                Expires: {new Date(item.expiry_date).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
            ) : (
              <span className="flex items-center gap-1 text-slate-400">
                <Infinity className="w-3 h-3" /> Fresh produce (No expiry date)
              </span>
            )}
          </div>
          {item.expiry_date && (
            <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${statusConfig.bar}`}
                style={{ width: `${statusConfig.progress}%` }}
              />
            </div>
          )}
        </div>

        {suggestedRecipe && onTryRecipe && (
          <button
            type="button"
            onClick={() => onTryRecipe(suggestedRecipe)}
            className="mt-3 w-full flex items-center justify-between gap-2 px-3 py-1.5 rounded-xl bg-[#fff9e2] hover:bg-[#f7d23a] border border-[#f7d23a] text-[#141a4a] text-[11px] font-semibold transition-colors cursor-pointer text-left"
            title={`Try making ${suggestedRecipe.title}`}
          >
            <span className="flex items-center gap-1.5 min-w-0">
              <Sparkles className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">Try: {suggestedRecipe.title}</span>
            </span>
            <span className="text-[10px] opacity-75 shrink-0">
              {suggestedRecipe.prep_time_minutes + suggestedRecipe.cook_time_minutes}m
            </span>
          </button>
        )}
      </div>

      {/* Action Buttons */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-1.5">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onConvertToLeftover(item)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors cursor-pointer"
            title="Log cooked portion to leftovers"
          >
            <UtensilsCrossed className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => onEdit(item)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            title="Edit item"
          >
            <Edit2 className="w-4 h-4" />
          </button>
        </div>

        {/* Mark Consumed Button */}
        <button
          type="button"
          onClick={handleConsumeClick}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-bold transition-all active:scale-95 cursor-pointer"
        >
          <CheckCircle className="w-3.5 h-3.5" />
          <span>Consumed</span>
        </button>
      </div>
    </div>
  );
};
