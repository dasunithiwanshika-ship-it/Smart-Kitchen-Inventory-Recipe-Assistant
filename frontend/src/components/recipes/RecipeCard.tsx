import React from 'react';
import { Clock, ChefHat, Sparkles, AlertTriangle, ArrowRight } from 'lucide-react';
import { RecipeRecommendation } from '../../types';

interface RecipeCardProps {
  recipe: RecipeRecommendation;
  onSelect: (recipe: RecipeRecommendation) => void;
}

export const RecipeCard: React.FC<RecipeCardProps> = ({ recipe, onSelect }) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden flex flex-col justify-between group hover:shadow-md hover:border-slate-300 transition-all duration-150 shadow-sm">
      {/* Recipe Image & Score Badge */}
      <div className="relative h-44 w-full overflow-hidden bg-slate-100">
        {recipe.image_url ? (
          <img
            src={recipe.image_url}
            alt={recipe.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-400">
            <ChefHat className="w-10 h-10" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent" />

        {/* AI Match Score Badge */}
        <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-sm border border-slate-200 flex items-center gap-1.5 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          <span className="text-xs font-bold text-slate-800">
            {recipe.recommendation_score > 0
              ? `${Math.round(recipe.recommendation_score)} pts`
              : `${Math.round(recipe.match_percentage)}% match`}
          </span>
        </div>

        {/* Cuisine and Duration */}
        <div className="absolute bottom-2.5 left-3 flex items-center gap-2">
          {recipe.cuisine && (
            <span className="px-2 py-0.5 rounded-lg bg-slate-900/80 text-white text-[11px] font-medium backdrop-blur-xs">
              {recipe.cuisine}
            </span>
          )}
          <span className="px-2 py-0.5 rounded-lg bg-slate-900/80 text-white text-[11px] font-medium backdrop-blur-xs flex items-center gap-1">
            <Clock className="w-3 h-3 text-emerald-400" />
            {recipe.prep_time_minutes + recipe.cook_time_minutes} min
          </span>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-800 group-hover:text-emerald-700 transition-colors">
            {recipe.title}
          </h3>
          <p className="text-xs text-slate-500 mt-1 line-clamp-2">
            {recipe.description}
          </p>

          {/* AI Recommendation Reason Banner */}
          {recipe.recommendation_reason && (
            <div className="mt-3 p-2.5 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-800 text-xs flex items-start gap-2">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
              <p className="leading-snug text-[11px]">{recipe.recommendation_reason}</p>
            </div>
          )}

          {/* Expiring Ingredients Highlight */}
          {recipe.expiring_ingredients_used && recipe.expiring_ingredients_used.length > 0 && (
            <div className="mt-2.5 flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider flex items-center gap-1">
                <AlertTriangle className="w-3 h-3 text-amber-600" /> Rescues:
              </span>
              {recipe.expiring_ingredients_used.map((ing, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 rounded-md bg-amber-50 border border-amber-200 text-amber-800 text-[10px] font-semibold"
                >
                  {ing}
                </span>
              ))}
            </div>
          )}

          {/* Ingredients Availability Summary */}
          <div className="mt-3 pt-3 border-t border-slate-100">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span>Ingredients on hand</span>
              <span className="font-bold text-emerald-700">
                {recipe.matched_ingredients?.length || 0} / {recipe.ingredients?.length || 0}
              </span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
              <div
                className="h-full rounded-full bg-emerald-500"
                style={{ width: `${Math.min(100, recipe.match_percentage || 0)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={() => onSelect(recipe)}
          className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-50 hover:bg-emerald-500 text-slate-700 hover:text-white font-bold text-xs border border-slate-200 hover:border-emerald-500 transition-all cursor-pointer"
        >
          <span>View Ingredients & Steps</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
