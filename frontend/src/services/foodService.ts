// Open Food Facts API Integration

export interface FoodSearchResult {
  id: string;
  name: string;
  brand?: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  image_url?: string;
}

export const searchFoods = async (query: string): Promise<FoodSearchResult[]> => {
  if (!query || query.length < 2) return [];

  try {
    const response = await fetch(
      `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(
        query
      )}&search_simple=1&action=process&json=1&page_size=20`
    );

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const data = await response.json();
    
    // Map to our unified format
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return data.products.filter((p: any) => p.product_name).map((p: any) => {
      const nutriments = p.nutriments || {};
      
      // Calculate macros per 100g, fallback to 0 if not available
      return {
        id: p._id,
        name: p.product_name,
        brand: p.brands,
        calories: nutriments['energy-kcal_100g'] || nutriments['energy-kcal'] || 0,
        protein: nutriments['proteins_100g'] || 0,
        carbs: nutriments['carbohydrates_100g'] || 0,
        fat: nutriments['fat_100g'] || 0,
        image_url: p.image_front_thumb_url
      };
    });
  } catch (error) {
    console.error('Error searching foods:', error);
    return [];
  }
};
