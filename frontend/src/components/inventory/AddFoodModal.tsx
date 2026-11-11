import React, { useState, useEffect } from 'react';
import { X, Plus, Sparkles, Calendar, Tag, FileText, CheckCircle2 } from 'lucide-react';
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
    purchase_date?: string;
    expiry_date?: string | null;
    no_expiry_date?: boolean;
    image_url?: string;
    notes?: string;
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
  const [noExpiryDate, setNoExpiryDate] = useState<boolean>(false);
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
        setPurchaseDate(initialData.purchase_date || new Date().toISOString().split('T')[0]);
        setNotes(initialData.notes || '');

        if (initialData.no_expiry_date || initialData.expiry_date === null) {
          setNoExpiryDate(true);
          setExpiryDate('');
        } else if (initialData.expiry_date) {
          setNoExpiryDate(false);
          setExpiryDate(initialData.expiry_date);
        } else {
          setNoExpiryDate(false);
          setExpiryDate('');
        }
      } else {
        // Defaults for pure manual entry
        setFoodName('');
        setCategoryId(undefined);
        setBarcode('');
        setQuantity(1);
        setUnit('pieces');
        setStorageLocation('Refrigerator');
        setNotes('');
        setImageUrl('');
        setPurchaseDate(new Date().toISOString().split('T')[0]);
        setExpiryDate('');
        setNoExpiryDate(false);
      }
      setError(null);
    }
  }, [isOpen, initialData]);

  const setPresetExpiry = (days: number) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    setExpiryDate(d.toISOString().split('T')[0]);
    setNoExpiryDate(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!foodName.trim()) {
      setError('Please enter a product name.');
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
        purchase_date: purchaseDate || new Date().toISOString().split('T')[0],
        expiry_date: noExpiryDate ? undefined : expiryDate || undefined,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-2xl border border-slate-200 shadow-2xl p-5 sm:p-6 relative max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800 tracking-tight">Add Food Item</h3>
              <p className="text-xs text-slate-500">
                Log packaged groceries or fresh unpackaged produce
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Food Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Food / Product Name *
            </label>
            <input
              type="text"
              required
              value={foodName}
              onChange={(e) => setFoodName(e.target.value)}
              placeholder="e.g., Potatoes, Greek Yogurt, Red Onions, Fresh Milk"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 text-sm focus:bg-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
            />
          </div>

          {/* Quantity and Unit */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Quantity *</label>
              <div className="flex items-center">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(0.5, quantity - 0.5))}
                  className="px-3 py-2.5 rounded-l-xl bg-slate-100 text-slate-700 hover:bg-slate-200 font-bold border-y border-l border-slate-200"
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
                  className="w-full py-2.5 bg-slate-50 border-y border-slate-200 text-slate-900 text-center text-sm font-semibold focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setQuantity(quantity + 0.5)}
                  className="px-3 py-2.5 rounded-r-xl bg-slate-100 text-slate-700 hover:bg-slate-200 font-bold border-y border-r border-slate-200"
                >
                  +
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Unit</label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-sm focus:bg-white focus:outline-none focus:border-emerald-500"
              >
                {unitsList.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Storage Location */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Storage Location
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {storageList.map((loc) => (
                <button
                  key={loc.id}
                  type="button"
                  onClick={() => setStorageLocation(loc.id)}
                  className={`py-2 px-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                    storageLocation === loc.id
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-700 shadow-sm'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <span>{loc.icon}</span>
                  <span>{loc.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Dates Section: Purchase Date & Expiry Date */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Purchase / MFD Date */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Purchase / Mfg Date
                </label>
                <input
                  type="date"
                  value={purchaseDate}
                  onChange={(e) => setPurchaseDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white border border-slate-200 text-slate-800 text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Expiry Date */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-700">
                    Expiry / Use-By Date
                  </label>
                  {!noExpiryDate && (
                    <div className="flex items-center gap-1 text-[10px]">
                      <button
                        type="button"
                        onClick={() => setPresetExpiry(3)}
                        className="px-1.5 py-0.5 rounded bg-white border border-slate-200 text-slate-600 hover:text-emerald-600 hover:border-emerald-300"
                      >
                        +3d
                      </button>
                      <button
                        type="button"
                        onClick={() => setPresetExpiry(7)}
                        className="px-1.5 py-0.5 rounded bg-white border border-slate-200 text-slate-600 hover:text-emerald-600 hover:border-emerald-300"
                      >
                        +1w
                      </button>
                      <button
                        type="button"
                        onClick={() => setPresetExpiry(14)}
                        className="px-1.5 py-0.5 rounded bg-white border border-slate-200 text-slate-600 hover:text-emerald-600 hover:border-emerald-300"
                      >
                        +2w
                      </button>
                    </div>
                  )}
                </div>
                <input
                  type="date"
                  disabled={noExpiryDate}
                  value={expiryDate}
                  onChange={(e) => {
                    setExpiryDate(e.target.value);
                    if (e.target.value) setNoExpiryDate(false);
                  }}
                  className={`w-full px-3 py-2 rounded-lg bg-white border border-slate-200 text-slate-800 text-xs focus:outline-none focus:border-emerald-500 ${
                    noExpiryDate ? 'opacity-40 bg-slate-100 cursor-not-allowed' : ''
                  }`}
                />
              </div>
            </div>

            {/* "No expiry date" Checkbox */}
            <div className="flex items-center gap-2 pt-1 border-t border-slate-200">
              <input
                type="checkbox"
                id="modalNoExpiry"
                checked={noExpiryDate}
                onChange={(e) => {
                  setNoExpiryDate(e.target.checked);
                  if (e.target.checked) setExpiryDate('');
                }}
                className="w-4 h-4 rounded text-emerald-600 accent-emerald-500 cursor-pointer"
              />
              <label htmlFor="modalNoExpiry" className="text-xs text-slate-700 font-medium cursor-pointer">
                No printed expiry date (e.g. potatoes, onions, fresh unpackaged produce)
              </label>
            </div>
          </div>

          {/* Category */}
          {categories.length > 0 && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Category (Optional)
              </label>
              <select
                value={categoryId || ''}
                onChange={(e) => setCategoryId(e.target.value ? Number(e.target.value) : undefined)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-sm focus:bg-white focus:outline-none focus:border-emerald-500"
              >
                <option value="">Select Category (Optional)</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Notes (Optional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g., Kept in vegetable basket, opened, store dry"
              className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 placeholder:text-slate-400 text-xs focus:bg-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-md shadow-emerald-500/20 active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
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
