import React, { useState, useEffect } from 'react';
import { ChefHat, Sparkles, Filter, Search, Flame, ArrowUpDown } from 'lucide-react';
import { api } from '../../services/api';
import { RecipeRecommendation } from '../../types';
import { RecipeCard } from './RecipeCard';
import { RecipeDetailModal } from './RecipeDetailModal';

interface RecipesPageProps {
  initialSearchQuery?: string;
}

export const RecipesPage: React.FC<RecipesPageProps> = ({ initialSearchQuery }) => {
  const [recipes, setRecipes] = useState<RecipeRecommendation[]>([]);
  const [filteredRecipes, setFilteredRecipes] = useState<RecipeRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRecipe, setSelectedRecipe] = useState<RecipeRecommendation | null>(null);
  const [search, setSearch] = useState(initialSearchQuery || '');
  const [selectedCuisine, setSelectedCuisine] = useState<string>('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('All');
  const [viewMode, setViewMode] = useState<'recommended' | 'all'>('recommended');

  const cuisinesList = ['All', 'Indian / Fusion', 'Italian', 'Spanish', 'Asian', 'Mediterranean', 'Breakfast / Cafe', 'Healthy / Breakfast'];
  const difficultiesList = ['All', 'Easy', 'Medium', 'Hard'];

  const fetchRecipes = async () => {
    setIsLoading(true);
    try {
      const data = await api.getRecipeRecommendations(25, 0);
      setRecipes(data);
      setFilteredRecipes(data);
    } catch (err) {
      console.error('Failed to load recipe recommendations', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRecipes();
  }, []);

  useEffect(() => {
    let list = [...recipes];

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          r.description?.toLowerCase().includes(q) ||
          r.ingredients.some((i) => i.ingredient_name.toLowerCase().includes(q))
      );
    }

    if (selectedCuisine !== 'All') {
      list = list.filter((r) => r.cuisine?.toLowerCase().includes(selectedCuisine.toLowerCase()));
    }

    if (selectedDifficulty !== 'All') {
      list = list.filter((r) => r.difficulty.toLowerCase() === selectedDifficulty.toLowerCase());
    }

    if (viewMode === 'recommended') {
      // Sort by recommendation score descending
      list.sort((a, b) => b.recommendation_score - a.recommendation_score);
    } else {
      // Sort by alphabetical
      list.sort((a, b) => a.title.localeCompare(b.title));
    }

    setFilteredRecipes(list);
  }, [search, selectedCuisine, selectedDifficulty, viewMode, recipes]);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="glass-panel p-5 rounded-3xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-gradient-to-tr from-purple-500 to-indigo-500 text-white shadow-lg shadow-purple-500/20">
            <ChefHat className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white">AI Recipe Assistant</h2>
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
                Zero Waste Engine
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Meals mathematically scored to prioritize your expiring food items and cooked leftovers.
            </p>
          </div>
        </div>

        {/* View Toggle */}
        <div className="flex items-center bg-slate-900/90 p-1 rounded-xl border border-slate-800 shrink-0">
          <button
            onClick={() => setViewMode('recommended')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              viewMode === 'recommended'
                ? 'bg-emerald-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Ranked</span>
          </button>
          <button
            onClick={() => setViewMode('all')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              viewMode === 'all'
                ? 'bg-emerald-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All Recipes
          </button>
        </div>
      </div>

      {/* Filters and Search Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Search */}
        <div className="relative md:col-span-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search recipes, ingredients..."
            className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder:text-slate-500 text-xs focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Cuisine Filter */}
        <div>
          <select
            value={selectedCuisine}
            onChange={(e) => setSelectedCuisine(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-emerald-500"
          >
            {cuisinesList.map((c) => (
              <option key={c} value={c} className="bg-slate-900">
                {c === 'All' ? 'All Cuisines' : c}
              </option>
            ))}
          </select>
        </div>

        {/* Difficulty Filter */}
        <div>
          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-emerald-500"
          >
            {difficultiesList.map((d) => (
              <option key={d} value={d} className="bg-slate-900">
                {d === 'All' ? 'All Difficulties' : `Difficulty: ${d}`}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Recipe Cards Grid */}
      {isLoading ? (
        <div className="py-24 text-center text-slate-400">Analyzing inventory & calculating recipes...</div>
      ) : filteredRecipes.length === 0 ? (
        <div className="glass-panel p-12 rounded-3xl text-center max-w-md mx-auto">
          <ChefHat className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white">No recipes match your filter</h3>
          <p className="text-xs text-slate-400 mt-1">Try resetting the search or cuisine filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredRecipes.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              onSelect={(r) => setSelectedRecipe(r)}
            />
          ))}
        </div>
      )}

      {/* Recipe Detail Modal */}
      <RecipeDetailModal
        isOpen={!!selectedRecipe}
        recipe={selectedRecipe}
        onClose={() => setSelectedRecipe(null)}
        onCookDone={fetchRecipes}
      />
    </div>
  );
};
