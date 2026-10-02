import React, { useState, useEffect } from 'react';
import { UtensilsCrossed, Plus, CheckCircle, Trash2, Clock, AlertTriangle, Sparkles, ChefHat } from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../../services/api';
import { Leftover } from '../../types';
import { AddLeftoverModal } from './AddLeftoverModal';

interface LeftoversPageProps {
  onFindRecipesForLeftover: (leftoverName: string) => void;
}

export const LeftoversPage: React.FC<LeftoversPageProps> = ({ onFindRecipesForLeftover }) => {
  const [leftovers, setLeftovers] = useState<Leftover[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterConsumed, setFilterConsumed] = useState(false);

  const fetchLeftovers = async () => {
    setIsLoading(true);
    try {
      const data = await api.getLeftovers(filterConsumed);
      setLeftovers(data);
    } catch (err) {
      console.error('Failed to load leftovers', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLeftovers();
  }, [filterConsumed]);

  const handleConsume = async (id: number) => {
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#F59E0B', '#10B981', '#3B82F6']
      });
      await api.consumeLeftover(id);
      fetchLeftovers();
    } catch (err) {
      console.error('Failed to mark leftover as consumed', err);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this leftover record?')) return;
    try {
      await api.deleteLeftover(id);
      fetchLeftovers();
    } catch (err) {
      console.error('Failed to delete leftover', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-5 rounded-3xl border border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <UtensilsCrossed className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Leftovers & Meal Prep</h2>
            <p className="text-xs text-slate-400">Keep track of cooked dishes to prevent good food from being forgotten</p>
          </div>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 active:scale-95 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Leftover</span>
        </button>
      </div>

      {/* List */}
      {isLoading ? (
        <div className="py-20 text-center text-slate-400">Loading leftovers...</div>
      ) : leftovers.length === 0 ? (
        <div className="glass-panel p-12 rounded-3xl text-center max-w-md mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center mx-auto mb-4">
            <UtensilsCrossed className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-white">No active leftovers!</h3>
          <p className="text-xs text-slate-400 mt-1">
            Whenever you cook extra pasta, curry, or rice, log it here to stay on top of your meal prep.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="mt-5 px-5 py-2.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs hover:bg-amber-400 transition-colors cursor-pointer"
          >
            Log First Leftover
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {leftovers.map((lo) => {
            const isCritical = lo.days_remaining <= 1;
            return (
              <div
                key={lo.id}
                className={`glass-card p-5 rounded-2xl border transition-all duration-200 hover:-translate-y-0.5 relative flex flex-col justify-between ${
                  isCritical ? 'border-amber-500/40 bg-amber-950/10' : 'border-slate-800'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-xs font-semibold text-slate-400">
                      {lo.storage_location === 'Freezer' ? '🧊 Freezer' : '❄️ Fridge'}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                        lo.days_remaining < 0
                          ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                          : lo.days_remaining <= 1
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse'
                          : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                      }`}
                    >
                      <Clock className="w-3 h-3" />
                      <span>
                        {lo.days_remaining < 0
                          ? 'Past Use-By'
                          : lo.days_remaining === 0
                          ? 'Use Today!'
                          : `${lo.days_remaining} Day${lo.days_remaining > 1 ? 's' : ''} Left`}
                      </span>
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white mt-1">{lo.name}</h3>
                  <p className="text-xs text-emerald-400 font-semibold mt-0.5">
                    {lo.quantity} {lo.unit}
                  </p>
                  {lo.notes && (
                    <p className="text-xs text-slate-400 mt-2 italic line-clamp-2">
                      "{lo.notes}"
                    </p>
                  )}

                  <div className="mt-3 pt-2 border-t border-slate-800/80 text-[11px] text-slate-400">
                    Prepared on {new Date(lo.prepared_date).toLocaleDateString()}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onFindRecipesForLeftover(lo.name)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-purple-400 hover:bg-purple-500/10 transition-colors"
                      title="Find repurposing recipe"
                    >
                      <ChefHat className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(lo.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                      title="Delete leftover"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <button
                    onClick={() => handleConsume(lo.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/30 text-xs font-bold transition-all active:scale-95 cursor-pointer"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Eaten</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      <AddLeftoverModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onLeftoverAdded={fetchLeftovers}
      />
    </div>
  );
};
