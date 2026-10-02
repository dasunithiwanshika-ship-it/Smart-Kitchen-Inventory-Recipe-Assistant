import React, { useState, useEffect } from 'react';
import { X, Save, Trash2, Calendar, MapPin, Tag } from 'lucide-react';
import { InventoryItem, StorageType, Category } from '../../types';
import { api } from '../../services/api';

interface EditFoodModalProps {
  isOpen: boolean;
  item: InventoryItem | null;
  onClose: () => void;
  onItemUpdated: () => void;
  onItemDeleted: () => void;
}

export const EditFoodModal: React.FC<EditFoodModalProps> = ({
  isOpen,
  item,
  onClose,
  onItemUpdated,
  onItemDeleted,
}) => {
  const [foodName, setFoodName] = useState('');
  const [categoryId, setCategoryId] = useState<number | undefined>(undefined);
  const [quantity, setQuantity] = useState<number>(1);
  const [unit, setUnit] = useState<string>('pieces');
  const [storageLocation, setStorageLocation] = useState<StorageType>('Refrigerator');
  const [expiryDate, setExpiryDate] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const unitsList = ['pieces', 'kg', 'g', 'L', 'ml', 'packets', 'bottles', 'cans', 'boxes'];
  const storageList: StorageType[] = ['Refrigerator', 'Freezer', 'Pantry', 'Outside'];

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
    if (item && isOpen) {
      setFoodName(item.food_name);
      setCategoryId(item.category_id);
      setQuantity(item.quantity);
      setUnit(item.unit);
      setStorageLocation(item.storage_location);
      setExpiryDate(item.expiry_date);
      setNotes(item.notes || '');
      setError(null);
    }
  }, [item, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!item) return;

    setIsSubmitting(true);
    setError(null);

    try {
      await api.updateInventoryItem(item.id, {
        food_name: foodName.trim(),
        category_id: categoryId,
        quantity: Number(quantity),
        unit,
        storage_location: storageLocation,
        expiry_date: expiryDate,
        notes: notes.trim() || undefined,
      });

      onItemUpdated();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to update item.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!item) return;
    if (!window.confirm(`Are you sure you want to delete "${item.food_name}" from your inventory?`)) {
      return;
    }

    setIsDeleting(true);
    try {
      await api.deleteInventoryItem(item.id);
      onItemDeleted();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to delete item.');
    } finally {
      setIsDeleting(false);
    }
  };

  if (!isOpen || !item) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="glass-panel w-full max-w-lg rounded-3xl border border-slate-700/60 shadow-2xl p-6 relative max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h3 className="text-lg font-bold text-white">Edit Inventory Item</h3>
            <p className="text-xs text-slate-400">Update quantity, storage location, or expiry</p>
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
            <label className="block text-xs font-semibold text-slate-300 mb-1">Food Name *</label>
            <input
              type="text"
              required
              value={foodName}
              onChange={(e) => setFoodName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-white text-sm focus:outline-none focus:border-emerald-500"
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
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-white text-sm font-semibold focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Unit</label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-white text-sm focus:outline-none focus:border-emerald-500"
              >
                {unitsList.map((u) => (
                  <option key={u} value={u} className="bg-slate-900">
                    {u}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Storage Location</label>
              <select
                value={storageLocation}
                onChange={(e) => setStorageLocation(e.target.value as StorageType)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-white text-sm focus:outline-none focus:border-emerald-500"
              >
                {storageList.map((loc) => (
                  <option key={loc} value={loc} className="bg-slate-900">
                    {loc}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Expiry Date *</label>
              <input
                type="date"
                required
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-white text-sm focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Notes</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700/80 text-white text-xs focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="pt-3 flex items-center justify-between border-t border-slate-800">
            <button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-semibold text-xs border border-rose-500/30 transition-colors cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              <span>{isDeleting ? 'Deleting...' : 'Delete'}</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 active:scale-95 transition-all disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{isSubmitting ? 'Saving...' : 'Save Changes'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
