import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowRight,
  ChefHat,
  UtensilsCrossed,
  Boxes,
  Camera,
  Plus,
  Bot,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { InventoryStats, InventoryItem, Leftover, RecipeRecommendation } from '../../types';
import { StatsCards } from './StatsCards';
import { ExpiringSoonBanner } from './ExpiringSoonBanner';
import { QuickActions } from './QuickActions';
import { RecipeCard } from '../recipes/RecipeCard';
import { RecipeDetailModal } from '../recipes/RecipeDetailModal';
import { OLLA_ASSETS } from '../../constants/ollaAssets';

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
  const [recentItems, setRecentItems] = useState<InventoryItem[]>([]);
  const [leftovers, setLeftovers] = useState<Leftover[]>([]);
  const [recommendedRecipes, setRecommendedRecipes] = useState<RecipeRecommendation[]>([]);
  const [selectedRecipe, setSelectedRecipe] = useState<RecipeRecommendation | null>(null);
  const [tryThisIdx, setTryThisIdx] = useState(0);
  const [cardBg, setCardBg] = useState('#f7d23a');
  const potsRef = useRef<HTMLVideoElement>(null);

  const findRecipeForItem = (foodName: string): RecipeRecommendation | undefined => {
    const key = foodName.trim().toLowerCase();
    if (!key) return undefined;
    return recommendedRecipes.find((rec) =>
      rec.matched_ingredients?.some((ing) => {
        const i = ing.trim().toLowerCase();
        return i.includes(key) || key.includes(i);
      })
    );
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const loadDashboardData = async () => {
    try {
      const [statsData, inventoryData, leftoversData, recipesData] = await Promise.all([
        api.getInventoryStats(),
        api.getInventory({ sort_by: 'expiry_date_asc' }),
        api.getLeftovers(false),
        api.getRecipeRecommendations(6, 0),
      ]);

      setStats(statsData);
      setUrgentItems(
        inventoryData.filter(
          (i) => i.expiry_date && i.days_until_expiry !== null && i.days_until_expiry <= 3
        )
      );
      setRecentItems(inventoryData.slice(0, 5));
      setLeftovers(leftoversData.slice(0, 4));
      setRecommendedRecipes(recipesData);
    } catch (err) {
      console.error('Failed to load dashboard data', err);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Sample exact yellow from cookware video so the feathered edge disappears
  useEffect(() => {
    const pots = potsRef.current;
    if (!pots) return;
    pots.src = OLLA_ASSETS.POTS_CLIP;
    pots.play().catch(() => {});

    const onLoaded = () => {
      try {
        const c = document.createElement('canvas');
        c.width = 8;
        c.height = 8;
        const ctx = c.getContext('2d', { willReadFrequently: true });
        if (!ctx || !pots.videoWidth || !pots.videoHeight) return;
        ctx.drawImage(pots, 0, 0, pots.videoWidth * 0.12, pots.videoHeight * 0.12, 0, 0, 8, 8);
        const data = ctx.getImageData(0, 0, 8, 8).data;
        let r = 0, g = 0, b = 0;
        for (let i = 0; i < data.length; i += 4) {
          r += data[i];
          g += data[i + 1];
          b += data[i + 2];
        }
        setCardBg(`rgb(${(r / 64) | 0}, ${(g / 64) | 0}, ${(b / 64) | 0})`);
      } catch {
        // Keep #f7d23a fallback
      }
    };

    pots.addEventListener('loadeddata', onLoaded, { once: true });
    return () => pots.removeEventListener('loadeddata', onLoaded);
  }, []);

  const firstName = user?.full_name?.split(' ')[0] || 'Chef';
  const totalItems = stats?.total_items || 0;
  const expiringCount = urgentItems.length;

  return (
    <div className="space-y-4 md:space-y-[1.19vw]">
      {/* olla Two-Panel Dashboard Hero Row */}
      <div className="flex flex-col lg:flex-row gap-3 md:gap-[1.19vw]">
        {/* Left Night-Sky Hero Summary Panel */}
        <div
          className="relative flex-none lg:flex-[0_0_68%] min-h-[270px] sm:min-h-[320px] rounded-[14px] overflow-hidden bg-[#0d1650] bg-center bg-cover bg-no-repeat p-6 sm:p-8 flex flex-col justify-between text-white"
          style={{ backgroundImage: `url("${OLLA_ASSETS.SKY}")` }}
        >
          {/* Decorative floating balloons on right side */}
          <div
            className="hidden sm:block pointer-events-none absolute right-6 -top-4 w-36 md:w-44 aspect-[1360/2048] bg-center bg-contain bg-no-repeat opacity-90"
            style={{ backgroundImage: `url("${OLLA_ASSETS.BALLOONS}")` }}
          />

          <div className="relative z-10 max-w-xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-[30px] bg-white/15 backdrop-blur-xs text-[11px] font-semibold tracking-wide uppercase">
              <Sparkles className="w-3 h-3 text-[#f7d23a]" />
              Stack-smart Kitchen Overview
            </span>

            <h1 className="mt-4 text-3xl sm:text-4xl font-medium tracking-[-0.02em] leading-[1.1]">
              {getGreeting()}, {firstName}.
            </h1>

            <p className="mt-2.5 text-sm sm:text-base text-white/85 leading-relaxed max-w-lg">
              {totalItems === 0
                ? 'Your kitchen is ready. Scan a grocery label or add your first item to start tracking freshness.'
                : expiringCount > 0
                ? `You have ${totalItems} items tracked, and ${expiringCount} ${
                    expiringCount === 1 ? 'item needs' : 'items need'
                  } attention in the next 3 days.`
                : `All ${totalItems} items in your kitchen look fresh today. Explore AI recipes tailored to your stock.`}
            </p>
          </div>

          <div className="relative z-10 mt-6 flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={onOpenScanner}
                className="flex items-center gap-2 px-5 py-2.5 rounded-[40px] bg-white hover:bg-[#f7d23a] text-[#141a4a] font-semibold text-xs transition-colors cursor-pointer"
              >
                <Camera className="w-4 h-4" />
                <span>Scan Packaging</span>
              </button>
              <button
                type="button"
                onClick={onOpenAddFood}
                className="flex items-center gap-2 px-5 py-2.5 rounded-[40px] bg-white/15 hover:bg-white hover:text-[#141a4a] text-white font-semibold text-xs transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Item</span>
              </button>
            </div>

            <span className="hidden md:block text-5xl font-medium tracking-[-0.035em] text-white/25 select-none leading-none">
              olla
            </span>
          </div>
        </div>

        {/* Right Yellow Spotlight Card */}
        <aside
          className="relative flex-1 min-h-[290px] sm:min-h-[320px] rounded-[14px] overflow-hidden text-[#141a4a] p-5 sm:p-6 flex flex-col justify-between"
          style={{ backgroundColor: cardBg }}
        >
          <div className="relative z-10">
            <span className="inline-grid place-items-center h-[26px] px-3.5 rounded-[30px] bg-white text-[11px] font-semibold tracking-[0.02em]">
              {expiringCount > 0 ? 'USE FIRST' : "TODAY'S FOCUS"}
            </span>

            <p className="mt-3 text-base font-medium leading-snug max-w-[240px]">
              {expiringCount > 0 ? (
                <>
                  Cook with <span className="font-semibold underline underline-offset-4">{urgentItems[0].food_name}</span>{' '}
                  {urgentItems[0].days_until_expiry === 0
                    ? 'today before it spoils.'
                    : urgentItems[0].days_until_expiry !== null && urgentItems[0].days_until_expiry < 0
                    ? '— check if still usable.'
                    : `within ${urgentItems[0].days_until_expiry}d.`}
                </>
              ) : leftovers.length > 0 ? (
                <>
                  Reheat <span className="font-semibold">{leftovers[0].name}</span> from your leftovers{' '}
                  {leftovers[0].days_remaining <= 0 ? 'today.' : `in ${leftovers[0].days_remaining}d.`}
                </>
              ) : (
                <>
                  Say hello to zero waste.
                  <br />
                  See recipes matched to your pantry.
                </>
              )}
            </p>
          </div>

          {/* Feathered Cookware Video Loop */}
          <video
            ref={potsRef}
            muted
            loop
            playsInline
            autoPlay
            crossOrigin="anonymous"
            className="pointer-events-none mx-auto my-1 w-44 h-44 object-cover"
            style={{
              WebkitMask: 'radial-gradient(closest-side, #000 72%, transparent 99%)',
              mask: 'radial-gradient(closest-side, #000 72%, transparent 99%)',
            }}
          />

          <button
            type="button"
            onClick={() =>
              totalItems === 0 ? onOpenAddFood() : onNavigateToTab('recipes')
            }
            className="relative z-10 w-full h-[40px] rounded-[40px] bg-white hover:bg-[#141a4a] text-[#141a4a] hover:text-white font-semibold text-xs transition-colors cursor-pointer grid place-items-center"
          >
            {totalItems === 0 ? '+ Add Your First Item' : 'Explore Zero-Waste Recipes'}
          </button>
        </aside>
      </div>

      {/* Primary 6-Card Kitchen Snapshot */}
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

      {/* Quick Actions Row */}
      <QuickActions
        onScanBarcode={onOpenScanner}
        onAddFood={onOpenAddFood}
        onAddLeftover={onOpenAddLeftover}
        onViewRecipes={() => onNavigateToTab('recipes')}
      />

      {/* Bento Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 md:gap-[1.19vw]">
        {/* Left 2 Columns: Current Inventory & Recipes */}
        <div className="lg:col-span-2 space-y-4 md:space-y-[1.19vw]">
          {/* Current Inventory Summary Card */}
          <div className="bg-white rounded-[14px] p-5 sm:p-6">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#e9e7df]">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-[#e9e7df] text-[#141a4a]">
                  <Boxes className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-semibold text-base text-[#16193a]">Current Inventory</h3>
                  <p className="text-xs text-[#16193a]/55">Items sorted by earliest expiry date</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onNavigateToTab('inventory')}
                className="text-xs font-semibold text-[#141a4a] hover:text-[#3a49c9] flex items-center gap-1 cursor-pointer"
              >
                <span>View all ({stats?.total_items || 0})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {recentItems.length === 0 ? (
              <div className="py-8 text-center text-[#16193a]/60 text-xs">
                <Boxes className="w-8 h-8 text-[#16193a]/25 mx-auto mb-2" />
                <p className="font-semibold text-[#16193a]">No food items added yet</p>
                <p className="text-[11px] text-[#16193a]/55 mt-0.5">
                  Scan a product package or add groceries manually to track freshness.
                </p>
                <button
                  type="button"
                  onClick={onOpenAddFood}
                  className="mt-3 px-4 py-2 rounded-[40px] bg-[#141a4a] text-white font-semibold text-xs hover:bg-[#3a49c9] transition-colors cursor-pointer"
                >
                  + Add First Food Item
                </button>
              </div>
            ) : (
              <>
                <div className="divide-y divide-[#e9e7df]">
                  {recentItems.map((item) => {
                    const isCritical =
                      item.expiry_date && item.days_until_expiry !== null && item.days_until_expiry <= 1;
                    const isSoon =
                      item.expiry_date &&
                      item.days_until_expiry !== null &&
                      item.days_until_expiry <= 3 &&
                      !isCritical;
                    const matchedRec = findRecipeForItem(item.food_name);
                    return (
                      <div
                        key={item.id}
                        onClick={() => onNavigateToTab('inventory')}
                        className="py-3 flex items-center justify-between gap-3 hover:bg-[#e9e7df]/35 px-2.5 rounded-xl transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                              !item.expiry_date
                                ? 'bg-[#16193a]/25'
                                : isCritical
                                ? 'bg-rose-500'
                                : isSoon
                                ? 'bg-[#f7d23a]'
                                : 'bg-emerald-500'
                            }`}
                          />
                          <div className="truncate">
                            <p className="font-semibold text-[#16193a] text-sm truncate">
                              {item.food_name}
                            </p>
                            <p className="text-xs text-[#16193a]/55">
                              {item.storage_location} · {item.quantity} {item.unit}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {matchedRec && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedRecipe(matchedRec);
                              }}
                              className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#fff9e2] hover:bg-[#f7d23a] border border-[#f7d23a] text-[#141a4a] text-[11px] font-semibold transition-colors cursor-pointer"
                              title={`Try ${matchedRec.title}`}
                            >
                              <Sparkles className="w-3 h-3" />
                              <span className="max-w-[130px] truncate">Try: {matchedRec.title}</span>
                            </button>
                          )}
                          <span
                            className={`text-xs font-semibold px-3 py-1 rounded-full ${
                              !item.expiry_date
                                ? 'bg-[#e9e7df] text-[#16193a]'
                                : isCritical
                                ? 'bg-rose-100 text-rose-800'
                                : isSoon
                                ? 'bg-[#f7d23a]/60 text-[#141a4a]'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {!item.expiry_date
                              ? 'Fresh produce'
                              : item.days_until_expiry === 0
                              ? 'Expires today'
                              : item.days_until_expiry !== null && item.days_until_expiry < 0
                              ? 'Expired'
                              : `${item.days_until_expiry}d left`}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* AI "Try This" Suggestion Strip for Current Inventory */}
                {recommendedRecipes.length > 0 && (() => {
                  const pick = recommendedRecipes[tryThisIdx % recommendedRecipes.length];
                  return (
                    <div className="mt-4 p-3.5 rounded-[14px] bg-[#fff9e2] border border-[#f7d23a] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-start gap-2.5 min-w-0">
                        <div className="p-2 rounded-xl bg-[#f7d23a] text-[#141a4a] shrink-0">
                          <Sparkles className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#141a4a] text-white">
                              Try This
                            </span>
                            <h4 className="text-sm font-semibold text-[#141a4a] truncate">
                              {pick.title}
                            </h4>
                            <span className="text-[11px] text-[#16193a]/60">
                              · {pick.prep_time_minutes + pick.cook_time_minutes} min
                            </span>
                          </div>
                          <p className="text-xs text-[#16193a]/75 mt-1 truncate">
                            Uses from your stock:{' '}
                            <span className="font-semibold text-[#141a4a]">
                              {pick.matched_ingredients?.slice(0, 4).join(', ') || 'current ingredients'}
                            </span>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {recommendedRecipes.length > 1 && (
                          <button
                            type="button"
                            onClick={() => setTryThisIdx((prev) => prev + 1)}
                            className="px-3 py-1.5 rounded-[40px] bg-white hover:bg-[#e9e7df] text-[#141a4a] text-xs font-semibold transition-colors cursor-pointer"
                          >
                            Next Idea
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => setSelectedRecipe(pick)}
                          className="px-4 py-1.5 rounded-[40px] bg-[#141a4a] hover:bg-[#3a49c9] text-white text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1"
                        >
                          <span>Try This Recipe</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })()}
              </>
            )}
          </div>

          {/* AI Recipe Suggestions */}
          <div className="bg-white rounded-[14px] p-5 sm:p-6">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#e9e7df]">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-[#f7d23a] text-[#141a4a]">
                  <ChefHat className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-semibold text-base text-[#16193a]">Zero-Waste Recipe Suggestions</h3>
                  <p className="text-xs text-[#16193a]/55">Ranked to use your soonest-expiring ingredients</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onNavigateToTab('recipes')}
                className="text-xs font-semibold text-[#141a4a] hover:text-[#3a49c9] flex items-center gap-1 cursor-pointer"
              >
                <span>Explore all</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

        {/* Right Column: Leftovers & Copilot Assistant Panel */}
        <div className="space-y-4 md:space-y-[1.19vw]">
          {/* Active Leftovers Card */}
          <div className="bg-white rounded-[14px] p-5 sm:p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#e9e7df]">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-[#e9e7df] text-[#141a4a]">
                    <UtensilsCrossed className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-[#16193a]">Active Leftovers</h3>
                    <p className="text-[11px] text-[#16193a]/55">Cooked meal portions</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onNavigateToTab('leftovers')}
                  className="text-xs font-semibold text-[#141a4a] hover:text-[#3a49c9] cursor-pointer"
                >
                  View all
                </button>
              </div>

              {leftovers.length === 0 ? (
                <div className="py-6 text-center text-[#16193a]/60 text-xs">
                  <p className="font-semibold text-[#16193a]">No active leftovers</p>
                  <p className="text-[11px] text-[#16193a]/55 mt-0.5">
                    Log cooked pasta, curry, or rice to track use-by dates.
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {leftovers.map((lo) => {
                    const isUrgent = lo.days_remaining <= 1;
                    return (
                      <div
                        key={lo.id}
                        className={`p-3 rounded-xl flex items-center justify-between ${
                          isUrgent ? 'bg-[#fff9e2] border border-[#f7d23a]' : 'bg-[#e9e7df]/45'
                        }`}
                      >
                        <div>
                          <h4 className="font-semibold text-[#16193a] text-xs">{lo.name}</h4>
                          <span className="text-[11px] text-[#16193a]/60">
                            {lo.quantity} {lo.unit} in {lo.storage_location}
                          </span>
                        </div>
                        <span
                          className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full ${
                            isUrgent ? 'bg-[#f7d23a] text-[#141a4a]' : 'bg-white text-[#141a4a]'
                          }`}
                        >
                          {lo.days_remaining <= 0 ? 'Use today' : `${lo.days_remaining}d left`}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={onOpenAddLeftover}
              className="mt-4 w-full py-2.5 rounded-[40px] bg-[#e9e7df] hover:bg-[#141a4a] text-[#141a4a] hover:text-white font-semibold text-xs transition-colors cursor-pointer"
            >
              + Log Cooked Dish
            </button>
          </div>

          {/* Kitchen Assistant Copilot Widget */}
          <div className="bg-[#141a4a] text-white rounded-[14px] p-5 sm:p-6">
            <div className="flex items-center gap-2.5 mb-2.5">
              <div className="p-2 rounded-xl bg-[#f7d23a] text-[#141a4a]">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">Kitchen Copilot</h3>
                <p className="text-[11px] text-white/60">Grounded in your live stock</p>
              </div>
            </div>

            <p className="text-xs text-white/85 leading-relaxed">
              {urgentItems.length > 0 ? (
                <>
                  You have <span className="font-semibold text-[#f7d23a]">{urgentItems[0].food_name}</span>{' '}
                  approaching its expiry date. Ask Copilot for a quick recipe using it tonight!
                </>
              ) : (
                <>
                  Your food stock is fresh. Ask Copilot anytime for zero-waste meal ideas built strictly from what you have.
                </>
              )}
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => onNavigateToTab('assistant')}
                className="text-xs bg-[#f7d23a] hover:bg-white text-[#141a4a] px-4 py-2 rounded-[40px] font-semibold transition-colors cursor-pointer"
              >
                Chat with Copilot
              </button>
              <button
                type="button"
                onClick={() => onNavigateToTab('recipes')}
                className="text-xs bg-white/15 hover:bg-white hover:text-[#141a4a] text-white px-4 py-2 rounded-[40px] font-semibold transition-colors cursor-pointer"
              >
                Show Recipes
              </button>
            </div>
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
