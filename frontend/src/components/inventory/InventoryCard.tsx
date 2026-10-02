import React, { useState } from 'react';
import {
  Calendar,
  AlertTriangle,
  Clock,
  CheckCircle,
  UtensilsCrossed,
  Edit2,
  Trash2,
  Sparkles,
  Plus,
  Minus
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { InventoryItem } from '../../types';

interface InventoryCardProps {
  item: InventoryItem;
  onEdit: (item: InventoryItem) => void;
  onConsume: (item: InventoryItem, quantity?: number) => void;
  onConvertToLeftover: (item: InventoryItem) => void;
  onAdjustQuantity: (item: InventoryItem, newQty: number) => void;
}

export const InventoryCard: React.FC<InventoryCardProps> = ({
  item,
  onEdit,
  onConsume,
  onConvertToLeftover,
  onAdjustQuantity,
}) => {
  const [isConsuming, setIsConsuming] = useState(false);

  // Status visual configurations
  const getStatusBadge = () => {
    switch (item.status) {
      case 'Expired':
        return {
          label: 'Expired',
          bg: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
          dot: 'bg-rose-500',
          bar: 'bg-rose-500',
          progress: 100,
        };
      case 'Critical':
        return {
          label: item.days_until_expiry === 0 ? 'Expires Today' : '1 Day Left',
          bg: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
          dot: 'bg-rose-500 animate-ping',
          bar: 'bg-rose-500',
          progress: 90,
        };
      case 'Expiring Soon':
        return {
          label: `${item.days_until_expiry} Days Left`,
          bg: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
          dot: 'bg-amber-400',
          bar: 'bg-amber-400',
          progress: 65,
        };
      default:
        return {
          label: `${item.days_until_expiry} Days Fresh`,
          bg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
          dot: 'bg-emerald-400',
          bar: 'bg-emerald-400',
          progress: Math.max(10, Math.min(100, 100 - item.days_until_expiry * 5)),
        };
    }
  };

  const statusConfig = getStatusBadge();

  // Storage icon mapping
  const getStorageBadge = () => {
    switch (item.storage_location) {
      case 'Refrigerator':
        return { icon: '❄️', label: 'Fridge', color: 'text-cyan-400' };
      case 'Freezer':
        return { icon: '🧊', label: 'Freezer', color: 'text-indigo-400' };
      case 'Pantry':
        return { icon: '📦', label: 'Pantry', color: 'text-purple-400' };
      default:
        return { icon: '☀️', label: 'Outside', color: 'text-amber-400' };
    }
  };

  const storageConfig = getStorageBadge();

  const handleConsumeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Confetti celebration
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.8 },
      colors: ['#10B981', '#34D399', '#6EE7B7']
    });
    onConsume(item);
  };

  return (
    <div className={`glass-card rounded-2xl border p-4 transition-all duration-200 hover:-translate-y-1 hover:shadow-xl relative flex flex-col justify-between ${
      item.status === 'Critical' ? 'border-rose-500/40 bg-rose-950/10' : 'border-slate-800/90'
    }`}>
      {/* Top row: Category & Expiry status badge */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <span>{storageConfig.icon}</span>
            <span className={`font-semibold ${storageConfig.color}`}>{storageConfig.label}</span>
            {item.category && (
              <>
                <span className="text-slate-600">•</span>
                <span className="truncate">{item.category.name}</span>
              </>
            )}
          </div>

          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold border ${statusConfig.bg}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot}`} />
            <span>{statusConfig.label}</span>
          </span>
        </div>

        {/* Item Title & Quantity */}
        <div className="flex items-start justify-between gap-2 mt-1">
          <div>
            <h4 className="font-bold text-base text-white tracking-tight leading-snug">
              {item.food_name}
            </h4>
            {item.notes && (
              <p className="text-xs text-slate-400 mt-0.5 line-clamp-1 italic">
                "{item.notes}"
              </p>
            )}
          </div>

          {/* Quantity Controls */}
          <div className="flex items-center gap-1 bg-slate-900/90 rounded-xl px-1.5 py-1 border border-slate-700/60 shrink-0">
            <button
              onClick={() => onAdjustQuantity(item, Math.max(0, item.quantity - 1))}
              className="w-5 h-5 rounded-md hover:bg-slate-800 text-slate-400 hover:text-slate-200 flex items-center justify-center transition-colors cursor-pointer"
              title="Decrease quantity"
            >
              <Minus className="w-3 h-3" />
            </button>
            <span className="text-xs font-bold text-white px-1">
              {item.quantity} <span className="text-[10px] text-slate-400 font-normal">{item.unit}</span>
            </span>
            <button
              onClick={() => onAdjustQuantity(item, item.quantity + 1)}
              className="w-5 h-5 rounded-md hover:bg-slate-800 text-slate-400 hover:text-slate-200 flex items-center justify-center transition-colors cursor-pointer"
              title="Increase quantity"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Freshness Bar */}
        <div className="mt-3">
          <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
            <span>Expiry Date: {new Date(item.expiry_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${statusConfig.bar}`}
              style={{ width: `${statusConfig.progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-1.5">
        <div className="flex items-center gap-1">
          <button
            onClick={() => onConvertToLeftover(item)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-amber-300 hover:bg-amber-500/10 transition-colors cursor-pointer"
            title="Convert cooked portion to leftover"
          >
            <UtensilsCrossed className="w-4 h-4" />
          </button>
          <button
            onClick={() => onEdit(item)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer"
            title="Edit item"
          >
            <Edit2 className="w-4 h-4" />
          </button>
        </div>

        {/* Mark Consumed Button */}
        <button
          onClick={handleConsumeClick}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/30 text-xs font-bold transition-all active:scale-95 cursor-pointer"
        >
          <CheckCircle className="w-3.5 h-3.5" />
          <span>Consumed</span>
        </button>
      </div>
    </div>
  );
};
