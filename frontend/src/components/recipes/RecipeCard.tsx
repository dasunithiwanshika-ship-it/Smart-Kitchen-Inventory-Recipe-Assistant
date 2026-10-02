import React from 'react';
import { Clock, ChefHat, Sparkles, AlertTriangle, Check, X, ArrowRight } from 'lucide-react';
import { RecipeRecommendation } from '../../types';

interface RecipeCardProps {
  recipe: RecipeRecommendation;
  onSelect: (recipe: RecipeRecommendation) => void;
}

export const RecipeCard: React.FC<RecipeCardProps> = ({ recipe, onSelect }) => {
  return (
    <div className="glass-card rounded-3xl border border-slate-800/90 overflow-hidden flex flex-col justify-between group hover:-translate-y-1 hover:border-slate-700 transition-all duration-200 hover:shadow-2xl bg-slate-900/60">
      {/* Recipe Image & Score Badge */}
      <div className="relative h-48 w-full overflow-hidden bg-slate-950">
        {recipe.image_url ? (
          <img
            src={recipe.image_url}
            alt={recipe.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-slate-900 text-slate-700">
            <ChefHat className="w-12 h-12" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />

        {/* AI Match Score Badge */}
        <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-slate-950/80 backdrop-blur-md border border-emerald-500/40 flex items-center gap-1.5 shadow-lg">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-xs font-bold text-emerald-400 font-mono">
            {recipe.recommendation_score > 0 ? `${Math.round(recipe.recommendation_score)} pts` : `${Math.round(recipe.match_percentage)}% Match`}
          </span>
        </div>

        {/* Cuisine and Difficulty */}
        <div className="absolute bottom-3 left-3 flex items-center gap-2">
          {recipe.cuisine && (
            <span className="px-2.5 py-0.5 rounded-lg bg-slate-900/90 text-slate-300 text-[11px] font-semibold border border-white/10 backdrop-blur-sm">
              {recipe.cuisine}
            </span>
          )}
          <span className="px-2.5 py-0.5 rounded-lg bg-slate-900/90 text-slate-300 text-[11px] font-semibold border border-white/10 backdrop-blur-sm flex items-center gap-1">
            <Clock className="w-3 h-3 text-emerald-400" />
            {recipe.prep_time_minutes + recipe.cook_time_minutes} min
          </span>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors">
            {recipe.title}
          </h3>
          <p className="text-xs text-slate-400 mt-1 line-clamp-2">
            {recipe.description}
          </p>

          {/* AI Recommendation Reason Banner */}
          {recipe.recommendation_reason && (
            <div className="mt-3 p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <p className="leading-snug text-[11px]">{recipe.recommendation_reason}</p>
            </div>
          )}

          {/* Expiring Ingredients Highlight */}
          {recipe.expiring_ingredients_used && recipe.expiring_ingredients_used.length > 0 && (
            <div className="mt-2.5 flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] font-semibold text-amber-400 uppercase tracking-wider flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" /> Rescues:
              </span>
              {recipe.expiring_ingredients_used.map((ing, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 rounded-md bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[10px] font-bold"
                >
                  {ing}
                </span>
              ))}
            </div>
          )}

          {/* Ingredients Availability Summary */}
          <div className="mt-4 pt-3 border-t border-slate-800/80">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
              <span>Ingredients available</span>
              <span className="font-bold text-emerald-400">
                {recipe.matched_ingredients?.length || 0} / {recipe.ingredients?.length || 0}
              </span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400"
                style={{ width: `${Math.min(100, recipe.match_percentage || 0)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={() => onSelect(recipe)}
          className="mt-5 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-800 hover:bg-emerald-500 text-slate-200 hover:text-slate-950 font-bold text-xs transition-all active:scale-98 cursor-pointer group-hover:bg-slate-700"
        >
          <span>View Cooking Steps & Nutrition</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
