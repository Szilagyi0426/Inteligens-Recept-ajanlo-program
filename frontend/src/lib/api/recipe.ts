import { apiClient } from './client';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://127.0.0.1:8000';

export interface RecipeBase {
  id: number;
  authorID?: number;
  author_name?: string;
  name: string;
  description?: string;
  servings?: number;
  total_minutes?: number;
  visibility?: string;
  dietary_tags?: string[];
  allergens?: string[];
  created_at?: string;
  updated_at?: string;
  average_rating?: number;
  is_favorite?: boolean;
  is_selected?: boolean;
  reviews_count: number;
}

export interface RecipeSearchParams {
  limit?: number;
  offset?: number;
  search_query?: string;
  use_user_profile?: boolean;
}

export const recipeApi = {
  /**
   * Receptek keresése és szűrése felhasználói profil alapján
   */
  searchRecipes: async (params: RecipeSearchParams = {}): Promise<RecipeBase[]> => {
    const queryParams = new URLSearchParams();
    
    if (params.limit !== undefined) queryParams.append('limit', params.limit.toString());
    if (params.offset !== undefined) queryParams.append('offset', params.offset.toString());
    if (params.search_query) queryParams.append('search_query', params.search_query);
    if (params.use_user_profile !== undefined) {
      queryParams.append('use_user_profile', params.use_user_profile.toString());
    }
    
    const url = `${API_BASE}/api/v1/recipe/search?${queryParams.toString()}`;
    const response = await apiClient.get(url);
    return response.data;
  },

  /**
   * Összes recept lekérése
   */
  getAllRecipes: async (userId?: number): Promise<RecipeBase[]> => {
    const url = userId 
      ? `${API_BASE}/api/v1/recipe/?user_id=${userId}`
      : `${API_BASE}/api/v1/recipe/`;
    const response = await apiClient.get(url);
    return response.data;
  },

  /**
   * Receptek rövid listája
   */
  getRecipesList: async (params: {
    limit?: number;
    offset?: number;
    random?: boolean;
    user_id?: number;
  } = {}): Promise<RecipeBase[]> => {
    const queryParams = new URLSearchParams();
    
    if (params.limit !== undefined) queryParams.append('limit', params.limit.toString());
    if (params.offset !== undefined) queryParams.append('offset', params.offset.toString());
    if (params.random) queryParams.append('random', 'true');
    if (params.user_id !== undefined) queryParams.append('user_id', params.user_id.toString());
    
    const url = `${API_BASE}/api/v1/recipe/list?${queryParams.toString()}`;
    const response = await apiClient.get(url);
    return response.data;
  },

  /**
   * Recept részleteinek lekérése
   */
  getRecipeDetails: async (recipeId: number): Promise<any> => {
    const url = `${API_BASE}/api/v1/recipe/${recipeId}`;
    const response = await apiClient.get(url);
    return response.data;
  },

  /**
   * Recept kedvencekhez adása/eltávolítása
   */
  toggleFavorite: async (recipeId: number, isFavorite: boolean): Promise<any> => {
    const url = `${API_BASE}/api/v1/recipe/${recipeId}/favorite`;
    const response = await apiClient.post(url, { is_favorite: isFavorite });
    return response.data;
  },

  /**
   * Recept kiválasztása/kiválasztás törlése
   */
  toggleSelected: async (recipeId: number, selected: boolean): Promise<any> => {
    const url = `${API_BASE}/api/v1/recipe/${recipeId}/selected`;
    const response = await apiClient.post(url, { selected });
    return response.data;
  },
};
