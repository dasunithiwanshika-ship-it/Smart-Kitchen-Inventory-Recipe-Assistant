import React, { useState } from 'react';
import { X, Clock, ChefHat, Sparkles, Check, CheckCircle2, Flame, Heart, Share2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { RecipeRecommendation } from '../../types';

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

  if (!isOpen || !recipe) return null;

  const toggleIngredient = (id: number) => {
    setCheckedIngredients((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleFinishCooking = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#10B981', '#3B82F6', '#F59E0B', '#EC4899'],
    });
    onCookDone();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="glass-panel w-full max-w-2xl rounded-3xl border border-slate-700/60 shadow-2xl overflow-hidden relative max-h-[92vh] flex flex-col">
        {/* Header Hero with Image */}
        <div className="relative h-60 w-full bg-slate-950 shrink-0">
          {recipe.image_url ? (
            <img
              src={recipe.image_url}
              alt={recipe.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-slate-900 text-slate-700">
              <ChefHat className="w-16 h-16" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-slate-950/80 hover:bg-slate-900 text-slate-300 hover:text-white transition-colors border border-white/10 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Hero text */}
          <div className="absolute bottom-4 left-6 right-6">
            <div className="flex items-center gap-2 mb-1.5">
              {recipe.cuisine && (
                <span className="px-2.5 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
                  {recipe.cuisine}
                </span>
              )}
              <span className="px-2.5 py-0.5 rounded-lg bg-slate-900/80 text-slate-300 text-xs font-semibold border border-white/10">
                Difficulty: {recipe.difficulty}
              </span>
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight leading-tight">
              {recipe.title}
            </h2>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="glass-card p-3 rounded-2xl text-center border border-slate-800">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Prep Time</span>
              <p className="text-base font-bold text-white mt-0.5">{recipe.prep_time_minutes} min</p>
            </div>
            <div className="glass-card p-3 rounded-2xl text-center border border-slate-800">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Cook Time</span>
              <p className="text-base font-bold text-white mt-0.5">{recipe.cook_time_minutes} min</p>
            </div>
            <div className="glass-card p-3 rounded-2xl text-center border border-slate-800">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Servings</span>
              <p className="text-base font-bold text-white mt-0.5">{recipe.servings} portions</p>
            </div>
            <div className="glass-card p-3 rounded-2xl text-center border border-slate-800">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Calories</span>
              <p className="text-base font-bold text-emerald-400 mt-0.5">{recipe.calories || 350} kcal</p>
            </div>
          </div>

          {/* AI Recommendation Reason */}
          {recipe.recommendation_reason && (
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-emerald-200">Why Smart Kitchen AI recommended this:</h4>
                <p className="mt-1 leading-relaxed text-slate-300">{recipe.recommendation_reason}</p>
              </div>
            </div>
          )}

          {/* Nutrition Facts */}
          {(recipe.protein_g || recipe.carbs_g || recipe.fat_g) && (
            <div>
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Nutrition Profile (Per Serving)
              </h4>
              <div className="grid grid-cols-3 gap-3">
                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-center">
                  <span className="text-[11px] text-slate-400">Protein</span>
                  <p className="text-sm font-bold text-white mt-0.5">{recipe.protein_g || 0} g</p>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-center">
                  <span className="text-[11px] text-slate-400">Carbohydrates</span>
                  <p className="text-sm font-bold text-white mt-0.5">{recipe.carbs_g || 0} g</p>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-center">
                  <span className="text-[11px] text-slate-400">Fats</span>
                  <p className="text-sm font-bold text-white mt-0.5">{recipe.fat_g || 0} g</p>
                </div>
              </div>
            </div>
          )}

          {/* Ingredients Checklist */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Required Ingredients ({recipe.ingredients.length})
              </h4>
              <span className="text-[11px] text-slate-400">Tap to mark ready</span>
            </div>

            <div className="space-y-2">
              {recipe.ingredients.map((ing) => {
                const isChecked = checkedIngredients[ing.id];
                return (
                  <div
                    key={ing.id}
                    onClick={() => toggleIngredient(ing.id)}
                    className={`p-3 rounded-xl border flex items-center justify-between transition-colors cursor-pointer select-none ${
                      isChecked
                        ? 'bg-emerald-500/10 border-emerald-500/30 opacity-70'
                        : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                          isChecked
                            ? 'bg-emerald-500 border-emerald-500 text-slate-950'
                            : 'border-slate-600 bg-slate-950'
                        }`}
                      >
                        {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                      <span className={`text-sm font-medium ${isChecked ? 'line-through text-slate-400' : 'text-slate-100'}`}>
                        {ing.ingredient_name}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {ing.is_expiring_soon && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          Expiring Soon
                        </span>
                      )}
                      {ing.quantity && (
                        <span className="text-xs font-mono font-semibold text-slate-300">
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
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
              Step-by-Step Cooking Instructions
            </h4>
            <div className="space-y-3">
              {recipe.instructions.map((step, idx) => (
                <div key={idx} className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800">
                  <div className="w-7 h-7 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold text-xs shrink-0">
                    {idx + 1}
                  </div>
                  <p className="text-sm text-slate-200 leading-relaxed pt-0.5">
                    {step}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors cursor-pointer"
          >
            Close
          </button>

          <button
            onClick={handleFinishCooking}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 active:scale-95 transition-all cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>I Cooked This (Zero Waste!)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
