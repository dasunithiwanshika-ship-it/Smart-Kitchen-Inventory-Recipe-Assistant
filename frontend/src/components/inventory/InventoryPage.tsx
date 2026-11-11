import React, { useState, useEffect } from 'react';
import {
  Boxes,
  Search,
  ArrowUpDown,
  Plus,
  Camera,
  UtensilsCrossed,
  Sparkles,
  AlertTriangle,
  RefreshCw,
  PackagePlus,
  ChefHat,
  Clock,
  ArrowRight
} from 'lucide-react';
import { api } from '../../services/api';
import { InventoryItem, RecipeRecommendation } from '../../types';
import { InventoryCard } from './InventoryCard';
import { AddFoodModal } from './AddFoodModal';
import { EditFoodModal } from './EditFoodModal';
import { ProductDateScannerModal, ScannedProductPayload } from './ProductDateScannerModal';
import { AddLeftoverModal } from '../leftovers/AddLeftoverModal';
import { RecipeDetailModal } from '../recipes/RecipeDetailModal';

interface InventoryPageProps {
  initialStorage?: string;
  initialStatus?: string;
  onOpenScanner?: () => void;
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
  const [isScannerModalOpen, setIsScannerModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [leftoverTargetItem, setLeftoverTargetItem] = useState<InventoryItem | null>(null);
  const [scannedInitialData, setScannedInitialData] = useState<any>(null);
  const [recommendations, setRecommendations] = useState<RecipeRecommendation[]>([]);
  const [selectedRecipe, setSelectedRecipe] = useState<RecipeRecommendation | null>(null);
  const [tryThisIdx, setTryThisIdx] = useState(0);

  const storageTabs = [
    { id: 'All', label: 'All Locations', icon: '🍽️' },
    { id: 'Refrigerator', label: 'Refrigerator', icon: '❄️' },
    { id: 'Freezer', label: 'Freezer', icon: '🧊' },
    { id: 'Pantry', label: 'Pantry', icon: '📦' },
    { id: 'Outside', label: 'Outside / Counter', icon: '☀️' },
  ];

  const statusPills = [
    { id: 'All', label: 'All Items' },
    { id: 'Expiring Soon', label: '⚠️ Expiring Soon' },
    { id: 'Expired', label: '🔴 Expired' },
    { id: 'Fresh', label: '🟢 Fresh' },
  ];

  const fetchItems = async () => {
    setIsLoading(true);
    try {
      const [data, recs] = await Promise.all([
        api.getInventory({
          storage_location: selectedStorage,
          status: selectedStatus,
          search: search.trim() || undefined,
          sort_by: sortBy,
        }),
        api.getRecipeRecommendations(10, 0).catch(() => [] as RecipeRecommendation[]),
      ]);
      setItems(data);
      setRecommendations(recs);
      setTryThisIdx(0);
    } catch (err) {
      console.error('Failed to load inventory', err);
    } finally {
      setIsLoading(false);
    }
  };

  const findRecipeForItem = (foodName: string): RecipeRecommendation | undefined => {
    const key = foodName.trim().toLowerCase();
    if (!key) return undefined;
    return recommendations.find((rec) =>
      rec.matched_ingredients?.some((ing) => {
        const i = ing.trim().toLowerCase();
        return i.includes(key) || key.includes(i);
      })
    );
  };

  // Match recommendations against currently visible items first
  const matchingRecsForVisible = recommendations.filter((rec) =>
    items.some((it) => {
      const k = it.food_name.trim().toLowerCase();
      return rec.matched_ingredients?.some((ing) => {
        const i = ing.trim().toLowerCase();
        return i.includes(k) || k.includes(i);
      });
    })
  );
  const activeTryThisPool = matchingRecsForVisible.length > 0 ? matchingRecsForVisible : recommendations;
  const activeTryThis = activeTryThisPool.length > 0
    ? activeTryThisPool[tryThisIdx % activeTryThisPool.length]
    : null;

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

  const handleProductScanned = (payload: ScannedProductPayload) => {
    setScannedInitialData({
      food_name: payload.food_name,
      purchase_date: payload.purchase_date,
      expiry_date: payload.expiry_date,
      no_expiry_date: payload.no_expiry_date,
      notes: payload.notes,
      image_url: payload.image_url,
      storage_location: payload.storage_location || 'Refrigerator',
    });
    setIsAddModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Top Filter & Control Card */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        {/* Search, Sort & Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search food by name, notes..."
              className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 placeholder:text-slate-400 text-xs focus:bg-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            {/* Sort Dropdown */}
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-600">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent text-xs text-slate-700 font-medium focus:outline-none cursor-pointer"
              >
                <option value="expiry_date_asc">Expiry (Earliest First)</option>
                <option value="name_asc">Name (A–Z)</option>
                <option value="quantity_desc">Quantity (High to Low)</option>
                <option value="recent">Recently Added</option>
              </select>
            </div>

            {/* Camera Date Scanner Button */}
            <button
              onClick={() => {
                if (onOpenScanner) {
                  onOpenScanner();
                } else {
                  setIsScannerModalOpen(true);
                }
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs border border-slate-200 transition-colors cursor-pointer"
              title="Camera Date Scanner"
            >
              <Camera className="w-4 h-4 text-emerald-600" />
              <span className="hidden sm:inline">Scan Product</span>
            </button>

            {/* Add Food Button */}
            <button
              onClick={() => {
                setScannedInitialData(null);
                setIsAddModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-sm active:scale-95 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Item</span>
            </button>
          </div>
        </div>

        {/* Storage Location Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 border-t border-slate-100">
          {storageTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedStorage(tab.id)}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedStorage === tab.id
                  ? 'bg-emerald-500 text-white shadow-sm'
                  : 'bg-slate-50 text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Status Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-0.5">
          {statusPills.map((pill) => (
            <button
              key={pill.id}
              onClick={() => setSelectedStatus(pill.id)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedStatus === pill.id
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {pill.label}
            </button>
          ))}
        </div>
      </div>

      {/* Inventory Items Grid & Clean Empty State */}
      {isLoading ? (
        <div className="py-24 text-center text-slate-400 flex flex-col items-center justify-center gap-2">
          <RefreshCw className="w-6 h-6 animate-spin text-emerald-500" />
          <span className="text-xs font-medium">Loading food inventory...</span>
        </div>
      ) : items.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-lg mx-auto shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4">
            <Boxes className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-800">Your inventory is empty</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Add groceries to start tracking freshness, preventing expiry, and generating zero-waste meal suggestions.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-6">
            <button
              onClick={() => setIsScannerModalOpen(true)}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs border border-slate-200 transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <Camera className="w-4 h-4 text-emerald-600" />
              <span>Scan Product Date</span>
            </button>
            <button
              onClick={() => {
                setScannedInitialData(null);
                setIsAddModalOpen(true);
              }}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Manual Entry</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-5">
          {activeTryThis && (
            <div className="rounded-[14px] bg-[#fff9e2] border border-[#f7d23a] p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5 min-w-0">
                {activeTryThis.image_url ? (
                  <img
                    src={activeTryThis.image_url}
                    alt={activeTryThis.title}
                    className="w-14 h-14 rounded-xl object-cover shrink-0 border border-[#f7d23a]"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-xl bg-[#f7d23a] text-[#141a4a] flex items-center justify-center shrink-0">
                    <ChefHat className="w-6 h-6" />
                  </div>
                )}

                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#141a4a] text-white text-[10px] font-semibold uppercase tracking-wider">
                      <Sparkles className="w-3 h-3 text-[#f7d23a]" /> Try This
                    </span>
                    <h3 className="text-sm sm:text-base font-semibold text-[#141a4a] truncate">
                      {activeTryThis.title}
                    </h3>
                    <span className="inline-flex items-center gap-1 text-[11px] text-[#16193a]/65">
                      <Clock className="w-3 h-3" />
                      {activeTryThis.prep_time_minutes + activeTryThis.cook_time_minutes} min
                    </span>
                  </div>
                  <p className="text-xs text-[#16193a]/75 mt-1 truncate">
                    Suggested for your current inventory · Uses{' '}
                    <span className="font-semibold text-[#141a4a]">
                      {activeTryThis.matched_ingredients?.slice(0, 4).join(', ') || 'your stock'}
                    </span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {activeTryThisPool.length > 1 && (
                  <button
                    type="button"
                    onClick={() => setTryThisIdx((prev) => prev + 1)}
                    className="px-3.5 py-2 rounded-[40px] bg-white hover:bg-[#e9e7df] text-[#141a4a] text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Next Idea
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setSelectedRecipe(activeTryThis)}
                  className="px-4 py-2 rounded-[40px] bg-[#141a4a] hover:bg-[#3a49c9] text-white text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <span>Try This Recipe</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {items.map((item) => (
              <InventoryCard
                key={item.id}
                item={item}
                onEdit={(it) => setEditingItem(it)}
                onConsume={handleConsume}
                onConvertToLeftover={(it) => setLeftoverTargetItem(it)}
                onAdjustQuantity={handleAdjustQuantity}
                suggestedRecipe={findRecipeForItem(item.food_name)}
                onTryRecipe={(rec) => setSelectedRecipe(rec)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Modals */}
      <AddFoodModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setScannedInitialData(null);
        }}
        onItemAdded={fetchItems}
        initialData={scannedInitialData}
      />

      <ProductDateScannerModal
        isOpen={isScannerModalOpen}
        onClose={() => setIsScannerModalOpen(false)}
        onProductScanned={handleProductScanned}
        onOpenManualEntry={() => {
          setIsScannerModalOpen(false);
          setScannedInitialData(null);
          setIsAddModalOpen(true);
        }}
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

      <RecipeDetailModal
        isOpen={!!selectedRecipe}
        recipe={selectedRecipe}
        onClose={() => setSelectedRecipe(null)}
        onCookDone={fetchItems}
      />
    </div>
  );
};
