import React, { useState, useEffect } from 'react';
import {
  Boxes,
  Search,
  Filter,
  ArrowUpDown,
  Plus,
  ScanLine,
  UtensilsCrossed,
  Sparkles,
  AlertTriangle,
  Flame,
  CheckCircle2
} from 'lucide-react';
import { api } from '../../services/api';
import { InventoryItem, StorageType, ItemStatus } from '../../types';
import { InventoryCard } from './InventoryCard';
import { AddFoodModal } from './AddFoodModal';
import { EditFoodModal } from './EditFoodModal';
import { AddLeftoverModal } from '../leftovers/AddLeftoverModal';

interface InventoryPageProps {
  initialStorage?: string;
  initialStatus?: string;
  onOpenScanner: () => void;
}

export const InventoryPage: React.FC<InventoryPageProps> = ({
  initialStorage = 'All',
  initialStatus = 'All',
  onOpenScanner,
}) => {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedStorage, setSelectedStorage] = useState<string>(initialStorage);
  const [selectedStatus, setSelectedStatus] = useState<string>(initialStatus);
  const [sortBy, setSortBy] = useState<string>('expiry_date_asc');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [leftoverTargetItem, setLeftoverTargetItem] = useState<InventoryItem | null>(null);

  const storageTabs = [
    { id: 'All', label: 'All Items', icon: '🍽️' },
    { id: 'Refrigerator', label: 'Refrigerator', icon: '❄️' },
    { id: 'Freezer', label: 'Freezer', icon: '🧊' },
    { id: 'Pantry', label: 'Pantry', icon: '📦' },
    { id: 'Outside', label: 'Outside', icon: '☀️' },
  ];

  const statusPills = [
    { id: 'All', label: 'All Status' },
    { id: 'Expiring Soon', label: '⚠️ Expiring Soon' },
    { id: 'Expired', label: '🔴 Expired' },
    { id: 'Fresh', label: '🟢 Fresh' },
  ];

  const fetchItems = async () => {
    setIsLoading(true);
    try {
      const data = await api.getInventory({
        storage_location: selectedStorage,
        status: selectedStatus,
        search: search.trim() || undefined,
        sort_by: sortBy,
      });
      setItems(data);
    } catch (err) {
      console.error('Failed to load inventory', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [selectedStorage, selectedStatus, sortBy, search]);

  const handleAdjustQuantity = async (item: InventoryItem, newQty: number) => {
    if (newQty <= 0) {
      if (window.confirm(`Did you finish consuming all of ${item.food_name}?`)) {
        await api.consumeInventoryItem(item.id, { action: 'consumed' });
        fetchItems();
      }
      return;
    }
    try {
      await api.updateInventoryItem(item.id, { quantity: newQty });
      fetchItems();
    } catch (err) {
      console.error('Failed to adjust quantity', err);
    }
  };

  const handleConsume = async (item: InventoryItem) => {
    try {
      await api.consumeInventoryItem(item.id, { action: 'consumed' });
      fetchItems();
    } catch (err) {
      console.error('Failed to consume item', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Controls & Search Bar */}
      <div className="glass-panel p-4 md:p-5 rounded-3xl border border-slate-800 space-y-4">
        {/* Search, Sort, and Quick Action buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search items, notes..."
              className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-white placeholder:text-slate-500 text-xs focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            {/* Sort Selector */}
            <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-700/80 rounded-xl px-2.5 py-2 text-xs text-slate-300">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent text-xs text-slate-200 focus:outline-none cursor-pointer"
              >
                <option value="expiry_date_asc" className="bg-slate-900">Expiry (Earliest)</option>
                <option value="name_asc" className="bg-slate-900">Name (A-Z)</option>
                <option value="quantity_desc" className="bg-slate-900">Quantity (High to Low)</option>
                <option value="recent" className="bg-slate-900">Recently Added</option>
              </select>
            </div>

            {/* Quick Actions */}
            <button
              onClick={onOpenScanner}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition-colors cursor-pointer"
            >
              <ScanLine className="w-4 h-4 text-emerald-400" />
              <span className="hidden md:inline">Scan</span>
            </button>

            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 active:scale-95 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Food</span>
            </button>
          </div>
        </div>

        {/* Storage Location Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 border-t border-slate-800/80">
          {storageTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedStorage(tab.id)}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedStorage === tab.id
                  ? 'bg-emerald-500 text-slate-950 shadow-sm'
                  : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Status Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {statusPills.map((pill) => (
            <button
              key={pill.id}
              onClick={() => setSelectedStatus(pill.id)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedStatus === pill.id
                  ? 'bg-slate-700 text-white border border-slate-600'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {pill.label}
            </button>
          ))}
        </div>
      </div>

      {/* Inventory Items Grid */}
      {isLoading ? (
        <div className="py-24 text-center text-slate-400">Loading food items...</div>
      ) : items.length === 0 ? (
        <div className="glass-panel p-12 rounded-3xl text-center max-w-md mx-auto">
          <Boxes className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white">No items found</h3>
          <p className="text-xs text-slate-400 mt-1">
            Try adjusting your search or filters, or add new groceries with the button below.
          </p>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="mt-4 px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs hover:bg-emerald-400 transition-colors cursor-pointer"
          >
            Add Food Item
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {items.map((item) => (
            <InventoryCard
              key={item.id}
              item={item}
              onEdit={(it) => setEditingItem(it)}
              onConsume={handleConsume}
              onConvertToLeftover={(it) => setLeftoverTargetItem(it)}
              onAdjustQuantity={handleAdjustQuantity}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      <AddFoodModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onItemAdded={fetchItems}
      />

      <EditFoodModal
        isOpen={!!editingItem}
        item={editingItem}
        onClose={() => setEditingItem(null)}
        onItemUpdated={fetchItems}
        onItemDeleted={fetchItems}
      />

      <AddLeftoverModal
        isOpen={!!leftoverTargetItem}
        fromInventoryItem={leftoverTargetItem}
        onClose={() => setLeftoverTargetItem(null)}
        onLeftoverAdded={fetchItems}
      />
    </div>
  );
};
