import React, { useState, useEffect } from 'react';
import { UtensilsCrossed, Plus, CheckCircle, Trash2, Clock, ChefHat } from 'lucide-react';
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
      if (typeof confetti === 'function') {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.8 },
          colors: ['#F59E0B', '#10B981', '#3B82F6'],
        });
      }
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-amber-50 text-amber-700">
            <UtensilsCrossed className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">Leftovers & Meal Prep</h2>
            <p className="text-xs text-slate-500">
              Keep track of cooked dishes to prevent good food from being forgotten
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-sm active:scale-95 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Leftover</span>
        </button>
      </div>

      {/* List */}
      {isLoading ? (
        <div className="py-20 text-center text-slate-400">Loading leftovers...</div>
      ) : leftovers.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center max-w-md mx-auto shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4">
            <UtensilsCrossed className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-800">No active leftovers</h3>
          <p className="text-xs text-slate-500 mt-1">
            Whenever you cook extra pasta, curry, or soup, log it here to stay on top of your meal prep.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="mt-5 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs transition-colors cursor-pointer"
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
                className={`bg-white p-5 rounded-2xl border shadow-sm transition-all duration-150 hover:shadow-md relative flex flex-col justify-between ${
                  isCritical ? 'border-amber-200 bg-amber-50/20' : 'border-slate-200'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-xs font-semibold text-slate-500">
                      {lo.storage_location === 'Freezer' ? '🧊 Freezer' : '❄️ Fridge'}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        lo.days_remaining < 0
                          ? 'bg-red-100 text-red-800'
                          : lo.days_remaining <= 1
                          ? 'bg-amber-100 text-amber-800 animate-pulse'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      <Clock className="w-3 h-3" />
                      <span>
                        {lo.days_remaining < 0
                          ? 'Past Use-By'
                          : lo.days_remaining === 0
                          ? 'Use Today!'
                          : `${lo.days_remaining}d Left`}
                      </span>
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-800 mt-1">{lo.name}</h3>
                  <p className="text-xs text-emerald-600 font-semibold mt-0.5">
                    {lo.quantity} {lo.unit}
                  </p>
                  {lo.notes && (
                    <p className="text-xs text-slate-500 mt-2 italic line-clamp-2">
                      "{lo.notes}"
                    </p>
                  )}

                  <div className="mt-3 pt-2 border-t border-slate-100 text-[11px] text-slate-400">
                    Prepared on {new Date(lo.prepared_date).toLocaleDateString()}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onFindRecipesForLeftover(lo.name)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-purple-600 hover:bg-purple-50 transition-colors cursor-pointer"
                      title="Find repurposing recipe"
                    >
                      <ChefHat className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(lo.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                      title="Delete leftover"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <button
                    onClick={() => handleConsume(lo.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-bold transition-all active:scale-95 cursor-pointer"
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
