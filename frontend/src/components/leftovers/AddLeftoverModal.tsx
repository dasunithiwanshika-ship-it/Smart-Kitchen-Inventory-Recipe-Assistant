import React, { useState, useEffect } from 'react';
import { X, UtensilsCrossed, Plus, Calendar, Clock, MapPin } from 'lucide-react';
import { api } from '../../services/api';
import { InventoryItem, StorageType } from '../../types';

interface AddLeftoverModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLeftoverAdded: () => void;
  fromInventoryItem?: InventoryItem | null;
}

export const AddLeftoverModal: React.FC<AddLeftoverModalProps> = ({
  isOpen,
  onClose,
  onLeftoverAdded,
  fromInventoryItem,
}) => {
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState<number>(300);
  const [unit, setUnit] = useState<string>('g');
  const [preparedDate, setPreparedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [useBeforeDate, setUseBeforeDate] = useState<string>('');
  const [storageLocation, setStorageLocation] = useState<string>('Refrigerator');
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (fromInventoryItem) {
        setName(`${fromInventoryItem.food_name} (Cooked)`);
        setQuantity(fromInventoryItem.quantity);
        setUnit(fromInventoryItem.unit);
        setStorageLocation('Refrigerator');
        setNotes(`Converted from inventory item: ${fromInventoryItem.food_name}`);
      } else {
        setName('');
        setQuantity(350);
        setUnit('g');
        setStorageLocation('Refrigerator');
        setNotes('');
      }

      setPreparedDate(new Date().toISOString().split('T')[0]);
      // Leftovers typically good for 2 days
      const d = new Date();
      d.setDate(d.getDate() + 2);
      setUseBeforeDate(d.toISOString().split('T')[0]);
      setError(null);
    }
  }, [isOpen, fromInventoryItem]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter a meal name.');
      return;
    }
    if (!useBeforeDate) {
      setError('Please select a use-before date.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await api.createLeftover({
        inventory_item_id: fromInventoryItem?.id,
        name: name.trim(),
        quantity: Number(quantity),
        unit,
        prepared_date: preparedDate,
        use_before_date: useBeforeDate,
        storage_location: storageLocation,
        notes: notes.trim() || undefined,
      });

      onLeftoverAdded();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save leftover.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="glass-panel w-full max-w-lg rounded-3xl border border-slate-700/60 shadow-2xl p-6 relative max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <UtensilsCrossed className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Log Cooked Leftover</h3>
              <p className="text-xs text-slate-400">Keep track of prepared food & meal prep</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Meal / Dish Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Chicken Curry, Fried Rice, Roasted Veggies"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-white placeholder:text-slate-500 text-sm focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Quantity *</label>
              <input
                type="number"
                step="any"
                min="0.1"
                required
                value={quantity}
                onChange={(e) => setQuantity(parseFloat(e.target.value) || 0)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-white text-sm font-semibold focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Unit</label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-white text-sm focus:outline-none focus:border-amber-500"
              >
                <option value="g">g (grams)</option>
                <option value="kg">kg</option>
                <option value="ml">ml</option>
                <option value="portions">portions</option>
                <option value="servings">servings</option>
                <option value="boxes">boxes / containers</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Prepared Date</label>
              <input
                type="date"
                required
                value={preparedDate}
                onChange={(e) => setPreparedDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-white text-sm focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Use Before Date *</label>
              <input
                type="date"
                required
                value={useBeforeDate}
                onChange={(e) => setUseBeforeDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-white text-sm focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Storage Location</label>
            <select
              value={storageLocation}
              onChange={(e) => setStorageLocation(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-white text-sm focus:outline-none focus:border-amber-500"
            >
              <option value="Refrigerator">❄️ Refrigerator (Chilled)</option>
              <option value="Freezer">🧊 Freezer (Frozen meal prep)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Notes</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g., In blue glass container, needs reheating"
              className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700/80 text-white placeholder:text-slate-500 text-xs focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 active:scale-95 transition-all disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              <span>{isSubmitting ? 'Saving...' : 'Save Leftover'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
