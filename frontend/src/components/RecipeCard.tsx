'use client';

import React from 'react';
import { RecipeBase } from '@/lib/api/recipe';
import Link from 'next/link';

interface RecipeCardProps {
  recipe: RecipeBase;
  onFavoriteToggle?: (recipeId: number, isFavorite: boolean) => void;
  onSelectToggle?: (recipeId: number, isSelected: boolean) => void;
}

export default function RecipeCard({ recipe, onFavoriteToggle, onSelectToggle }: RecipeCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow">
      <div className="p-6">
        {/* Fejléc */}
        <div className="flex justify-between items-start mb-3">
          <Link href={`/recipe-page?id=${recipe.id}`} className="flex-1">
            <h3 className="text-xl font-bold text-gray-900 hover:text-blue-600 cursor-pointer">
              {recipe.name}
            </h3>
          </Link>
          <div className="flex gap-2 ml-2">
            {onFavoriteToggle && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  onFavoriteToggle(recipe.id, !recipe.is_favorite);
                }}
                className={`p-2 rounded-full ${
                  recipe.is_favorite
                    ? 'text-red-500 hover:bg-red-50'
                    : 'text-gray-400 hover:bg-gray-100'
                }`}
                title={recipe.is_favorite ? 'Kedvencek közül eltávolítás' : 'Hozzáadás a kedvencekhez'}
              >
                <svg
                  className="w-6 h-6"
                  fill={recipe.is_favorite ? 'currentColor' : 'none'}
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Szerző */}
        {recipe.author_name && (
          <p className="text-sm text-gray-600 mb-2">Készítette: {recipe.author_name}</p>
        )}

        {/* Leírás */}
        {recipe.description && (
          <p className="text-gray-700 mb-4 line-clamp-2">{recipe.description}</p>
        )}

        {/* Dietary tags és allergens */}
        <div className="mb-4 space-y-2">
          {recipe.dietary_tags && recipe.dietary_tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {recipe.dietary_tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
                >
                  {getDietaryTagLabel(tag)}
                </span>
              ))}
            </div>
          )}
          
          {recipe.allergens && recipe.allergens.length > 0 && (
            <div className="flex flex-wrap gap-1">
              <span className="text-xs text-gray-600 mr-1">Allergiás anyagok:</span>
              {recipe.allergens.map((allergen) => (
                <span
                  key={allergen}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800"
                >
                  {getAllergenLabel(allergen)}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Meta információk */}
        <div className="flex items-center justify-between text-sm text-gray-600 pt-3 border-t border-gray-200">
          <div className="flex items-center gap-4">
            {recipe.total_minutes && (
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                {recipe.total_minutes} perc
              </span>
            )}
            {recipe.servings && (
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
                {recipe.servings} adag
              </span>
            )}
          </div>
          
          {recipe.average_rating !== null && recipe.average_rating !== undefined && (
            <div className="flex items-center gap-1">
              <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span>{recipe.average_rating.toFixed(1)}</span>
              {recipe.reviews_count > 0 && (
                <span className="text-xs text-gray-500">({recipe.reviews_count})</span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Helper függvények a címkék fordításához
function getDietaryTagLabel(tag: string): string {
  const labels: Record<string, string> = {
    'vegetarian': 'Vegetáriánus',
    'vegan': 'Vegán',
    'gluten-free': 'Gluténmentes',
    'lactose-free': 'Laktózmentes',
    'low-carb': 'Alacsony szénhidráttartalmú',
    'halal': 'Halal',
    'kosher': 'Kóser',
    'pescatarian': 'Peszketáriánus',
  };
  return labels[tag] || tag;
}

function getAllergenLabel(allergen: string): string {
  const labels: Record<string, string> = {
    'gluten': 'Glutén',
    'lactose': 'Laktóz',
    'peanut': 'Földimogyoró',
    'tree-nut': 'Diófélék',
    'egg': 'Tojás',
    'soy': 'Szója',
    'fish': 'Hal',
    'shellfish': 'Rákfélék',
    'sesame': 'Szezám',
  };
  return labels[allergen] || allergen;
}
