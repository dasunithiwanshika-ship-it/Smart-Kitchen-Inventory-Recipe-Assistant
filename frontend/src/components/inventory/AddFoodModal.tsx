import React, { useState, useEffect } from 'react';
import { X, Plus, Calendar, Sparkles, Package, MapPin, Tag, Hash, FileText } from 'lucide-react';
import { StorageType, Category } from '../../types';
import { api } from '../../services/api';

interface AddFoodModalProps {
  isOpen: boolean;
  onClose: () => void;
  onItemAdded: () => void;
  initialData?: {
    food_name?: string;
    category_id?: number;
    barcode?: string;
    quantity?: number;
    unit?: string;
    storage_location?: StorageType;
    typical_shelf_life_days?: number;
    image_url?: string;
  };
}

export const AddFoodModal: React.FC<AddFoodModalProps> = ({
  isOpen,
  onClose,
  onItemAdded,
  initialData,
}) => {
  const [foodName, setFoodName] = useState('');
  const [categoryId, setCategoryId] = useState<number | undefined>(undefined);
  const [quantity, setQuantity] = useState<number>(1);
  const [unit, setUnit] = useState<string>('pieces');
  const [storageLocation, setStorageLocation] = useState<StorageType>('Refrigerator');
  const [purchaseDate, setPurchaseDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [expiryDate, setExpiryDate] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [imageUrl, setImageUrl] = useState<string>('');
  const [barcode, setBarcode] = useState<string>('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Units list
  const unitsList = ['pieces', 'kg', 'g', 'L', 'ml', 'packets', 'bottles', 'cans', 'boxes'];

  // Storage locations
  const storageList: { id: StorageType; label: string; icon: string }[] = [
    { id: 'Refrigerator', label: 'Refrigerator', icon: '❄️' },
    { id: 'Freezer', label: 'Freezer', icon: '🧊' },
    { id: 'Pantry', label: 'Pantry', icon: '📦' },
    { id: 'Outside', label: 'Outside', icon: '☀️' },
  ];

  useEffect(() => {
    const fetchCats = async () => {
      try {
        const cats = await api.getCategories();
        setCategories(cats);
      } catch (err) {
        console.error('Failed to load categories', err);
      }
    };
    if (isOpen) {
      fetchCats();
    }
  }, [isOpen]);

  // Set default expiry date based on shelf life
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFoodName(initialData.food_name || '');
        setCategoryId(initialData.category_id);
        setBarcode(initialData.barcode || '');
        setQuantity(initialData.quantity || 1);
        setUnit(initialData.unit || 'pieces');
        setStorageLocation(initialData.storage_location || 'Refrigerator');
        setImageUrl(initialData.image_url || '');

        const shelfLife = initialData.typical_shelf_life_days || 7;
        const defaultExpiry = new Date();
        defaultExpiry.setDate(defaultExpiry.getDate() + shelfLife);
        setExpiryDate(defaultExpiry.toISOString().split('T')[0]);
      } else {
        // Defaults
        setFoodName('');
        setCategoryId(undefined);
        setBarcode('');
        setQuantity(1);
        setUnit('pieces');
        setStorageLocation('Refrigerator');
        setNotes('');
        setImageUrl('');
        setPurchaseDate(new Date().toISOString().split('T')[0]);

        const defaultExpiry = new Date();
        defaultExpiry.setDate(defaultExpiry.getDate() + 7);
        setExpiryDate(defaultExpiry.toISOString().split('T')[0]);
      }
      setError(null);
    }
  }, [isOpen, initialData]);

  const setPresetExpiry = (days: number) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    setExpiryDate(d.toISOString().split('T')[0]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!foodName.trim()) {
      setError('Please enter a food name.');
      return;
    }
    if (!expiryDate) {
      setError('Please select an expiry date.');
      return;
    }
    if (quantity <= 0) {
      setError('Quantity must be greater than 0.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await api.createInventoryItem({
        food_name: foodName.trim(),
        category_id: categoryId,
        barcode: barcode.trim() || undefined,
        quantity: Number(quantity),
        unit,
        storage_location: storageLocation,
        purchase_date: purchaseDate,
        expiry_date: expiryDate,
        notes: notes.trim() || undefined,
        image_url: imageUrl.trim() || undefined,
      });

      onItemAdded();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save food item.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="glass-panel w-full max-w-lg rounded-3xl border border-slate-700/60 shadow-2xl p-6 relative max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Add Food Item</h3>
              <p className="text-xs text-slate-400">Quick 10-second kitchen logging</p>
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Food Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Food Name *</label>
            <div className="relative">
              <input
                type="text"
                required
                value={foodName}
                onChange={(e) => setFoodName(e.target.value)}
                placeholder="e.g., Organic Milk, Fresh Spinach, Chicken"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-white placeholder:text-slate-500 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Quantity and Unit */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Quantity *</label>
              <div className="flex items-center">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(0.5, quantity - 0.5))}
                  className="px-3 py-2.5 rounded-l-xl bg-slate-800 text-slate-300 hover:bg-slate-700 font-bold border-y border-l border-slate-700/80"
                >
                  -
                </button>
                <input
                  type="number"
                  step="any"
                  min="0.1"
                  required
                  value={quantity}
                  onChange={(e) => setQuantity(parseFloat(e.target.value) || 0)}
                  className="w-full py-2.5 bg-slate-900 border-y border-slate-700/80 text-white text-center text-sm font-semibold focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setQuantity(quantity + 0.5)}
                  className="px-3 py-2.5 rounded-r-xl bg-slate-800 text-slate-300 hover:bg-slate-700 font-bold border-y border-r border-slate-700/80"
                >
                  +
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Unit</label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-white text-sm focus:outline-none focus:border-emerald-500"
              >
                {unitsList.map((u) => (
                  <option key={u} value={u} className="bg-slate-900">
                    {u}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Storage Location */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Storage Location</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {storageList.map((loc) => (
                <button
                  key={loc.id}
                  type="button"
                  onClick={() => setStorageLocation(loc.id)}
                  className={`py-2 px-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                    storageLocation === loc.id
                      ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300 shadow-sm'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  <span>{loc.icon}</span>
                  <span>{loc.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Expiry Date with quick presets */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-300">Expiry Date *</label>
              <div className="flex items-center gap-1 text-[11px]">
                <button
                  type="button"
                  onClick={() => setPresetExpiry(3)}
                  className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 hover:text-emerald-400"
                >
                  +3d
                </button>
                <button
                  type="button"
                  onClick={() => setPresetExpiry(7)}
                  className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 hover:text-emerald-400"
                >
                  +1w
                </button>
                <button
                  type="button"
                  onClick={() => setPresetExpiry(14)}
                  className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 hover:text-emerald-400"
                >
                  +2w
                </button>
                <button
                  type="button"
                  onClick={() => setPresetExpiry(30)}
                  className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 hover:text-emerald-400"
                >
                  +1m
                </button>
              </div>
            </div>
            <input
              type="date"
              required
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-white text-sm focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Category */}
          {categories.length > 0 && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Category</label>
              <select
                value={categoryId || ''}
                onChange={(e) => setCategoryId(e.target.value ? Number(e.target.value) : undefined)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-white text-sm focus:outline-none focus:border-emerald-500"
              >
                <option value="">Select Category (Optional)</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id} className="bg-slate-900">
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Notes (Optional)</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g., Organic, store in airtight jar, open bottle"
              className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700/80 text-white placeholder:text-slate-500 text-xs focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Action Buttons */}
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
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 active:scale-95 transition-all disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              <span>{isSubmitting ? 'Saving...' : 'Save to Inventory'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
