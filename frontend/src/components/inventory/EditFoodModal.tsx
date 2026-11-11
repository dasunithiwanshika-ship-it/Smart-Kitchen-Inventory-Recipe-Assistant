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
  const [noExpiryDate, setNoExpiryDate] = useState<boolean>(false);
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
      if (item.expiry_date) {
        setExpiryDate(item.expiry_date);
        setNoExpiryDate(false);
      } else {
        setExpiryDate('');
        setNoExpiryDate(true);
      }
      setNotes(item.notes || '');
      setError(null);
    }
  }, [item, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!item) return;

    if (!foodName.trim()) {
      setError('Food name is required.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await api.updateInventoryItem(item.id, {
        food_name: foodName.trim(),
        category_id: categoryId,
        quantity: Number(quantity),
        unit,
        storage_location: storageLocation,
        expiry_date: noExpiryDate ? undefined : expiryDate || undefined,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-2xl border border-slate-200 shadow-2xl p-5 sm:p-6 relative max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-lg font-bold text-slate-800 tracking-tight">Edit Inventory Item</h3>
            <p className="text-xs text-slate-500">Update quantity, storage location, or expiry details</p>
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

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Food Name *</label>
            <input
              type="text"
              required
              value={foodName}
              onChange={(e) => setFoodName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:bg-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Quantity *</label>
              <input
                type="number"
                step="any"
                min="0.1"
                required
                value={quantity}
                onChange={(e) => setQuantity(parseFloat(e.target.value) || 0)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm font-semibold focus:bg-white focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Unit</label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-sm focus:bg-white focus:outline-none focus:border-emerald-500"
              >
                {unitsList.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Storage Location</label>
              <select
                value={storageLocation}
                onChange={(e) => setStorageLocation(e.target.value as StorageType)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-sm focus:bg-white focus:outline-none focus:border-emerald-500"
              >
                {storageList.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Expiry Date</label>
              <input
                type="date"
                disabled={noExpiryDate}
                value={expiryDate}
                onChange={(e) => {
                  setExpiryDate(e.target.value);
                  if (e.target.value) setNoExpiryDate(false);
                }}
                className={`w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-sm focus:bg-white focus:outline-none focus:border-emerald-500 ${
                  noExpiryDate ? 'opacity-40 bg-slate-100 cursor-not-allowed' : ''
                }`}
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="editNoExpiry"
              checked={noExpiryDate}
              onChange={(e) => {
                setNoExpiryDate(e.target.checked);
                if (e.target.checked) setExpiryDate('');
              }}
              className="w-4 h-4 rounded text-emerald-600 accent-emerald-500 cursor-pointer"
            />
            <label htmlFor="editNoExpiry" className="text-xs text-slate-700 font-medium cursor-pointer">
              No printed expiry date (fresh produce / raw food)
            </label>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Notes</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs focus:bg-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="pt-3 flex items-center justify-between border-t border-slate-100">
            <button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 font-semibold text-xs border border-red-200 transition-colors cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              <span>{isDeleting ? 'Deleting...' : 'Delete'}</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-1.5 px-6 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-md shadow-emerald-500/20 active:scale-95 transition-all disabled:opacity-50"
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
