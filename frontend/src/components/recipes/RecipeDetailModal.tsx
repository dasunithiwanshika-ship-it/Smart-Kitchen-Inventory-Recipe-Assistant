import React, { useEffect, useState } from 'react';
import { X, ChefHat, Sparkles, Check, CheckCircle2, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { RecipeRecommendation, CookRecipeResponse } from '../../types';
import { api } from '../../services/api';

interface RecipeDetailModalProps {
  isOpen: boolean;
  recipe: RecipeRecommendation | null;
  onClose: () => void;
  onCookDone: () => void;
}

export const RecipeDetailModal: React.FC<RecipeDetailModalProps> = ({
  isOpen,
  recipe,
  onClose,
  onCookDone,
}) => {
  const [checkedIngredients, setCheckedIngredients] = useState<Record<number, boolean>>({});
  const [isCooking, setIsCooking] = useState(false);
  const [cookError, setCookError] = useState<string | null>(null);
  const [cookResult, setCookResult] = useState<CookRecipeResponse | null>(null);

  useEffect(() => {
    if (isOpen && recipe) {
      const initial: Record<number, boolean> = {};
      recipe.ingredients.forEach((ing) => {
        if (ing.is_available) {
          initial[ing.id] = true;
        }
      });
      setCheckedIngredients(initial);
      setCookError(null);
      setCookResult(null);
      setIsCooking(false);
    }
  }, [isOpen, recipe?.id]);

  if (!isOpen || !recipe) return null;

  const toggleIngredient = (id: number) => {
    if (cookResult) return;
    setCheckedIngredients((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const selectedIds = recipe.ingredients
    .filter((ing) => checkedIngredients[ing.id])
    .map((ing) => ing.id);

  const handleFinishCooking = async () => {
    setIsCooking(true);
    setCookError(null);
    try {
      const idsToDeduct =
        selectedIds.length > 0
          ? selectedIds
          : recipe.ingredients.filter((i) => i.is_available).map((i) => i.id);

      const res = await api.cookRecipe(recipe.id, idsToDeduct);
      setCookResult(res);

      if (typeof confetti === 'function') {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#141a4a', '#f7d23a', '#10B981', '#3a49c9'],
        });
      }
      onCookDone();
    } catch (err: any) {
      setCookError(err?.message || 'Failed to update inventory after cooking.');
    } finally {
      setIsCooking(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#141a4a]/50 backdrop-blur-sm">
      <div className="bg-white w-full max-w-2xl rounded-[18px] border border-[#16193a]/10 shadow-2xl overflow-hidden relative max-h-[92vh] flex flex-col">
        {/* Header Hero with Image */}
        <div className="relative h-52 w-full bg-[#e9e7df] shrink-0">
          {recipe.image_url ? (
            <img
              src={recipe.image_url}
              alt={recipe.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-[#e9e7df] text-[#141a4a]/40">
              <ChefHat className="w-16 h-16" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#141a4a]/85 via-[#141a4a]/30 to-transparent" />

          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-black/45 hover:bg-black/75 text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="absolute bottom-4 left-6 right-6">
            <div className="flex items-center gap-2 mb-1">
              {recipe.cuisine && (
                <span className="px-2.5 py-0.5 rounded-full bg-[#f7d23a] text-[#141a4a] text-xs font-semibold">
                  {recipe.cuisine}
                </span>
              )}
              <span className="px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-xs text-white text-xs font-medium">
                Difficulty: {recipe.difficulty}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-semibold text-white tracking-tight leading-tight">
              {recipe.title}
            </h2>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-[#e9e7df]/55 p-3 rounded-xl text-center">
              <span className="text-[10px] font-semibold text-[#16193a]/55 uppercase tracking-wider">Prep Time</span>
              <p className="text-sm font-semibold text-[#141a4a] mt-0.5">{recipe.prep_time_minutes} min</p>
            </div>
            <div className="bg-[#e9e7df]/55 p-3 rounded-xl text-center">
              <span className="text-[10px] font-semibold text-[#16193a]/55 uppercase tracking-wider">Cook Time</span>
              <p className="text-sm font-semibold text-[#141a4a] mt-0.5">{recipe.cook_time_minutes} min</p>
            </div>
            <div className="bg-[#e9e7df]/55 p-3 rounded-xl text-center">
              <span className="text-[10px] font-semibold text-[#16193a]/55 uppercase tracking-wider">Servings</span>
              <p className="text-sm font-semibold text-[#141a4a] mt-0.5">{recipe.servings} portions</p>
            </div>
            <div className="bg-[#e9e7df]/55 p-3 rounded-xl text-center">
              <span className="text-[10px] font-semibold text-[#16193a]/55 uppercase tracking-wider">Calories</span>
              <p className="text-sm font-semibold text-[#141a4a] mt-0.5">{recipe.calories || 350} kcal</p>
            </div>
          </div>

          {/* Cook Deduction Result Banner */}
          {cookResult && (
            <div className="p-4 rounded-[14px] bg-emerald-50 border border-emerald-200 text-emerald-950 space-y-2">
              <div className="flex items-center gap-2 font-semibold text-sm text-emerald-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{cookResult.message}</span>
              </div>
              {cookResult.consumed_items.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {cookResult.consumed_items.map((item) => (
                    <span
                      key={item.inventory_item_id}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white border border-emerald-200 text-xs font-medium text-emerald-900"
                    >
                      <span className="font-semibold">
                        −{item.deducted_quantity} {item.unit}
                      </span>
                      <span>{item.food_name}</span>
                      <span className="text-[10px] text-emerald-700/75">
                        ({item.fully_consumed ? 'Consumed' : `${item.remaining_quantity} ${item.unit} left`})
                      </span>
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {cookError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{cookError}</span>
            </div>
          )}

          {/* AI Recommendation Reason */}
          {recipe.recommendation_reason && (
            <div className="p-3.5 rounded-xl bg-[#fff9e2] border border-[#f7d23a] text-[#141a4a] text-xs flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-[#141a4a] shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold">Why recommended:</h4>
                <p className="mt-0.5 leading-relaxed text-[#16193a]/80">{recipe.recommendation_reason}</p>
              </div>
            </div>
          )}

          {/* Ingredients Checklist */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-semibold text-[#16193a]/70 uppercase tracking-wider">
                Ingredients ({recipe.ingredients.length})
              </h4>
              <span className="text-[11px] text-[#16193a]/55">
                Checked items are deducted as consumed when cooked
              </span>
            </div>

            <div className="space-y-2">
              {recipe.ingredients.map((ing) => {
                const isChecked = !!checkedIngredients[ing.id];
                return (
                  <div
                    key={ing.id}
                    onClick={() => toggleIngredient(ing.id)}
                    className={`p-3 rounded-xl border flex items-center justify-between transition-colors cursor-pointer select-none ${
                      isChecked
                        ? 'bg-[#fff9e2]/70 border-[#f7d23a]'
                        : 'bg-white border-[#e9e7df] hover:border-[#141a4a]/25'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                          isChecked
                            ? 'bg-[#141a4a] border-[#141a4a] text-white'
                            : 'border-[#16193a]/25 bg-white'
                        }`}
                      >
                        {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                      <span className="text-sm text-[#16193a] font-medium">
                        {ing.ingredient_name}
                      </span>
                      {ing.is_available && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                          In stock
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {ing.is_expiring_soon && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#f7d23a] text-[#141a4a]">
                          Expiring Soon
                        </span>
                      )}
                      {ing.quantity && (
                        <span className="text-xs font-mono font-semibold text-[#16193a]/70">
                          {ing.quantity} {ing.unit}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Instructions Step-by-Step */}
          <div>
            <h4 className="text-xs font-semibold text-[#16193a]/70 uppercase tracking-wider mb-2.5">
              Step-by-Step Cooking Instructions
            </h4>
            <div className="space-y-2.5">
              {recipe.instructions.map((step, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 rounded-xl bg-[#e9e7df]/45">
                  <div className="w-6 h-6 rounded-lg bg-[#141a4a] text-white flex items-center justify-center font-semibold text-xs shrink-0 mt-0.5">
                    {idx + 1}
                  </div>
                  <p className="text-sm text-[#16193a]/85 leading-relaxed">
                    {step}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="p-4 bg-[#e9e7df]/45 border-t border-[#e9e7df] flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-[40px] bg-white hover:bg-[#e9e7df] text-[#141a4a] font-semibold text-xs transition-colors cursor-pointer"
          >
            {cookResult ? 'Done' : 'Close'}
          </button>

          {!cookResult && (
            <button
              type="button"
              disabled={isCooking}
              onClick={handleFinishCooking}
              className="flex items-center gap-2 px-6 py-2.5 rounded-[40px] bg-[#141a4a] hover:bg-[#3a49c9] text-white font-semibold text-xs transition-colors disabled:opacity-50 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isCooking ? 'Updating Inventory...' : 'I Cooked This'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
