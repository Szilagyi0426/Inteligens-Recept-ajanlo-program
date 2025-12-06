'use client';

import React, { useState, useEffect } from 'react';
import RecipeFilter from '@/components/RecipeFilter';
import RecipeCard from '@/components/RecipeCard';
import { RecipeBase, recipeApi } from '@/lib/api/recipe';
import RequireAuth from '@/components/auth/RequireAuth';

export default function SearchRecipesPage() {
  const [recipes, setRecipes] = useState<RecipeBase[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Kezdeti betöltés
    loadInitialRecipes();
  }, []);

  const loadInitialRecipes = async () => {
    try {
      setIsLoading(true);
      const data = await recipeApi.searchRecipes({ limit: 50 });
      setRecipes(data);
    } catch (error) {
      console.error('Hiba a receptek betöltésekor:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRecipesUpdate = (updatedRecipes: RecipeBase[]) => {
    setRecipes(updatedRecipes);
  };

  const handleFavoriteToggle = async (recipeId: number, isFavorite: boolean) => {
    try {
      await recipeApi.toggleFavorite(recipeId, isFavorite);
      // Frissítjük a receptet a listában
      setRecipes((prevRecipes) =>
        prevRecipes.map((recipe) =>
          recipe.id === recipeId ? { ...recipe, is_favorite: isFavorite } : recipe
        )
      );
    } catch (error) {
      console.error('Hiba a kedvenc állapot változtatásakor:', error);
      alert('Hiba történt a művelet során');
    }
  };

  const handleSelectToggle = async (recipeId: number, isSelected: boolean) => {
    try {
      await recipeApi.toggleSelected(recipeId, isSelected);
      // Frissítjük a receptet a listában
      setRecipes((prevRecipes) =>
        prevRecipes.map((recipe) =>
          recipe.id === recipeId ? { ...recipe, is_selected: isSelected } : recipe
        )
      );
    } catch (error) {
      console.error('Hiba a kiválasztás változtatásakor:', error);
      alert('Hiba történt a művelet során');
    }
  };

  return (
    <RequireAuth>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">Receptek keresése</h1>

          {/* Szűrő komponens */}
          <RecipeFilter
            onRecipesUpdate={handleRecipesUpdate}
            onLoadingChange={setIsLoading}
          />

          {/* Receptek listája */}
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : recipes.length > 0 ? (
            <>
              <div className="mb-4 text-gray-600">
                <p>{recipes.length} recept találat</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recipes.map((recipe) => (
                  <RecipeCard
                    key={recipe.id}
                    recipe={recipe}
                    onFavoriteToggle={handleFavoriteToggle}
                    onSelectToggle={handleSelectToggle}
                  />
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-xl text-gray-600">Nincs találat a keresési feltételeknek megfelelően</p>
              <p className="text-gray-500 mt-2">Próbálj meg más keresési feltételeket használni</p>
            </div>
          )}
        </div>
      </div>
    </RequireAuth>
  );
}
