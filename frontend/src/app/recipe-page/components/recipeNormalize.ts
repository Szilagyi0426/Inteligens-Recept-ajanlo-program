export type RecipeLike = {
    id: string | number;
    title: string;
    description: string | null;
    time: number | null;
    calories: number | null;
    tags: string[];
    image: string | null;
    rating: number | null;
    author: string | null;
    is_favorite: boolean | null;
    is_selected: boolean | null
};

export function normalizeRecipe(r: any): RecipeLike | null {
    if (!r) return null;
    const id = r.id ?? null;
    if (id == null) return null;

    const title = r.name || "Untitled recipe";
    const description = r.description || null;
    const time = r.total_minutes || null;
    const calories = r.calories || r.kcal || r.energy || null;
    const tags = r.diets || r.tags || r.labels || r.categories || [];
    const image = r.image || null;
    const rating = r.average_rating || 0;
    const authorRaw = r.author_name;
    const author = authorRaw !== null && authorRaw !== undefined ? String(authorRaw) : null;
    const is_selected = r.is_selected || false;
    const is_favorite = r.is_favorite || false;
    return {
        id,
        title,
        description,
        time,
        calories,
        tags,
        image,
        rating,
        author,
        is_selected, 
        is_favorite, 
    };
}