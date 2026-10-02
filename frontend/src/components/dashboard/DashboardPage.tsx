import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  ArrowRight,
  Clock,
  AlertTriangle,
  ChefHat,
  UtensilsCrossed,
  Boxes
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { InventoryStats, InventoryItem, Leftover, RecipeRecommendation } from '../../types';
import { StatsCards } from './StatsCards';
import { ExpiringSoonBanner } from './ExpiringSoonBanner';
import { QuickActions } from './QuickActions';
import { RecipeCard } from '../recipes/RecipeCard';
import { RecipeDetailModal } from '../recipes/RecipeDetailModal';

interface DashboardPageProps {
  onNavigateToTab: (tab: string, storageFilter?: string, statusFilter?: string) => void;
  onOpenScanner: () => void;
  onOpenAddFood: () => void;
  onOpenAddLeftover: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  onNavigateToTab,
  onOpenScanner,
  onOpenAddFood,
  onOpenAddLeftover,
}) => {
  const { user } = useAuth();
  const [stats, setStats] = useState<InventoryStats | null>(null);
  const [urgentItems, setUrgentItems] = useState<InventoryItem[]>([]);
  const [leftovers, setLeftovers] = useState<Leftover[]>([]);
  const [recommendedRecipes, setRecommendedRecipes] = useState<RecipeRecommendation[]>([]);
  const [selectedRecipe, setSelectedRecipe] = useState<RecipeRecommendation | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Time-based greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const [statsData, inventoryData, leftoversData, recipesData] = await Promise.all([
        api.getInventoryStats(),
        api.getInventory({ sort_by: 'expiry_date_asc' }),
        api.getLeftovers(false),
        api.getRecipeRecommendations(3, 0),
      ]);

      setStats(statsData);
      // Filter urgent items (<= 3 days left or expired)
      setUrgentItems(inventoryData.filter((i) => i.days_until_expiry <= 3));
      setLeftovers(leftoversData.slice(0, 4));
      setRecommendedRecipes(recipesData);
    } catch (err) {
      console.error('Failed to load dashboard data', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  return (
    <div className="space-y-6">
      {/* Welcome Hero Banner */}
      <div className="relative overflow-hidden glass-panel rounded-3xl p-6 md:p-8 border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900/90 to-emerald-950/30">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Smart Kitchen AI Active
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white">
              {getGreeting()}, {user?.full_name?.split(' ')[0] || 'Chef'} 👋
            </h1>
            <p className="text-xs md:text-sm text-slate-300 mt-1 max-w-xl">
              You have <span className="font-bold text-emerald-400">{stats?.total_items || 0} items</span> in your kitchen.
              {urgentItems.length > 0
                ? ` ${urgentItems.length} items require your attention soon to prevent food waste.`
                : ' All items are fresh and ready for cooking!'}
            </p>
          </div>

          <button
            onClick={() => onNavigateToTab('recipes')}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 active:scale-95 transition-all self-start md:self-auto cursor-pointer"
          >
            <ChefHat className="w-4 h-4" />
            <span>Recommended Meals</span>
          </button>
        </div>
      </div>

      {/* Stats Cards Row */}
      <StatsCards
        stats={stats}
        onFilterClick={(storage, status) => onNavigateToTab('inventory', storage, status)}
      />

      {/* Urgent Expiry Alert Banner */}
      <ExpiringSoonBanner
        items={urgentItems}
        onCookClick={() => onNavigateToTab('recipes')}
        onViewInventoryClick={() => onNavigateToTab('inventory', 'All', 'Expiring Soon')}
      />

      {/* Quick Action Buttons */}
      <QuickActions
        onScanBarcode={onOpenScanner}
        onAddFood={onOpenAddFood}
        onAddLeftover={onOpenAddLeftover}
        onViewRecipes={() => onNavigateToTab('recipes')}
      />

      {/* Two Columns: Leftovers & Top Recipe Suggestions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: Leftovers tracker */}
        <div className="lg:col-span-1 glass-panel p-5 rounded-3xl border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <UtensilsCrossed className="w-4 h-4 text-amber-400" />
                <h3 className="font-bold text-sm text-white">Active Leftovers</h3>
              </div>
              <button
                onClick={() => onNavigateToTab('leftovers')}
                className="text-[11px] font-semibold text-emerald-400 hover:underline flex items-center gap-0.5 cursor-pointer"
              >
                <span>View all</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {leftovers.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs">
                No active leftovers logged. Cooked dishes appear here with use-by countdowns.
              </div>
            ) : (
              <div className="space-y-2.5">
                {leftovers.map((lo) => (
                  <div
                    key={lo.id}
                    className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800/80 flex items-center justify-between"
                  >
                    <div>
                      <h4 className="text-xs font-bold text-white">{lo.name}</h4>
                      <span className="text-[10px] text-slate-400">
                        {lo.quantity} {lo.unit} in {lo.storage_location}
                      </span>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        lo.days_remaining <= 1
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                          : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                      }`}
                    >
                      {lo.days_remaining <= 0 ? 'Use Today' : `${lo.days_remaining}d Left`}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={onOpenAddLeftover}
            className="mt-4 w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700/60 transition-colors cursor-pointer"
          >
            + Log Cooked Leftover
          </button>
        </div>

        {/* Right column: Top AI Recommended Recipes */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ChefHat className="w-4 h-4 text-purple-400" />
              <h3 className="font-bold text-sm text-white">Top Zero-Waste Recipe Recommendations</h3>
            </div>
            <button
              onClick={() => onNavigateToTab('recipes')}
              className="text-[11px] font-semibold text-emerald-400 hover:underline flex items-center gap-0.5 cursor-pointer"
            >
              <span>Explore all</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recommendedRecipes.slice(0, 2).map((rec) => (
              <RecipeCard
                key={rec.id}
                recipe={rec}
                onSelect={(r) => setSelectedRecipe(r)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Recipe Detail Modal */}
      <RecipeDetailModal
        isOpen={!!selectedRecipe}
        recipe={selectedRecipe}
        onClose={() => setSelectedRecipe(null)}
        onCookDone={loadDashboardData}
      />
    </div>
  );
};
