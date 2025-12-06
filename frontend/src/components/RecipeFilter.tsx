'use client';

import React, { useState, useEffect } from 'react';
import { recipeApi, RecipeBase, RecipeSearchParams } from '@/lib/api/recipe';

interface RecipeFilterProps {
  onRecipesUpdate: (recipes: RecipeBase[]) => void;
  onLoadingChange?: (loading: boolean) => void;
}

export default function RecipeFilter({ onRecipesUpdate, onLoadingChange }: RecipeFilterProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [useUserProfile, setUseUserProfile] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async () => {
    try {
      setIsLoading(true);
      onLoadingChange?.(true);

      const params: RecipeSearchParams = {
        limit: 50,
        offset: 0,
        use_user_profile: useUserProfile,
      };

      if (searchQuery.trim()) {
        params.search_query = searchQuery.trim();
      }

      const recipes = await recipeApi.searchRecipes(params);
      onRecipesUpdate(recipes);
    } catch (error) {
      console.error('Hiba a receptek keresésekor:', error);
      alert('Hiba történt a receptek betöltésekor');
    } finally {
      setIsLoading(false);
      onLoadingChange?.(false);
    }
  };

  const handleReset = async () => {
    setSearchQuery('');
    setUseUserProfile(false);
    
    try {
      setIsLoading(true);
      onLoadingChange?.(true);
      const recipes = await recipeApi.searchRecipes({ limit: 50 });
      onRecipesUpdate(recipes);
    } catch (error) {
      console.error('Hiba a receptek betöltésekor:', error);
    } finally {
      setIsLoading(false);
      onLoadingChange?.(false);
    }
  };

  // Auto-search when profile filter changes
  useEffect(() => {
    handleSearch();
  }, [useUserProfile]);

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Receptek keresése és szűrése</h2>
      
      <div className="space-y-4">
        {/* Keresési mező */}
        <div>
          <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
            Keresés receptekben
          </label>
          <div className="flex gap-2">
            <input
              id="search"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Recept neve vagy összetevő..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              onClick={handleSearch}
              disabled={isLoading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Keresés...' : 'Keresés'}
            </button>
          </div>
        </div>

        {/* Profil alapú szűrés */}
        <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
          <input
            id="useProfile"
            type="checkbox"
            checked={useUserProfile}
            onChange={(e) => setUseUserProfile(e.target.checked)}
            className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <label htmlFor="useProfile" className="flex-1">
            <span className="block text-sm font-medium text-gray-900">
              Szűrés profilom alapján
            </span>
            <span className="block text-xs text-gray-600 mt-1">
              Csak olyan receptek megjelenítése, amelyek megfelelnek az étkezési preferenciáimnak és
              nem tartalmaznak olyan allergiát, amire érzékeny vagyok
            </span>
          </label>
        </div>

        {/* Visszaállítás gomb */}
        <div className="flex justify-end">
          <button
            onClick={handleReset}
            disabled={isLoading}
            className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors"
          >
            Szűrők törlése
          </button>
        </div>
      </div>

      {/* Aktív szűrők megjelenítése */}
      {(searchQuery || useUserProfile) && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-sm font-medium text-gray-700 mb-2">Aktív szűrők:</p>
          <div className="flex flex-wrap gap-2">
            {searchQuery && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                Keresés: "{searchQuery}"
              </span>
            )}
            {useUserProfile && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
                Profil alapú szűrés aktív
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
