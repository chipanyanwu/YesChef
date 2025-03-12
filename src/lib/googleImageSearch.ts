import axios from 'axios';

const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;
const CX = import.meta.env.VITE_GOOGLE_SEARCH_ENGINE_ID;

/**
 * Searches for images via the Google Custom Search API.
 * @param query The search terms (e.g., "melt butter").
 * @returns An array of image URLs, or empty array if none found.
 */
export async function googleImageSearch(query: string): Promise<string[]> {
  if (!GOOGLE_API_KEY || !CX) {
    console.error('Missing Google API key or Search Engine ID');
    return [];
  }

  try {
    const response = await axios.get('https://www.googleapis.com/customsearch/v1', {
      params: {
        key: GOOGLE_API_KEY,
        cx: CX,
        searchType: 'image',
        q: query,
        num: 8, 
      },
    });

    const items = response.data.items || [];
    return items.map((item: any) => item.link);
  } catch (error) {
    console.error('Error searching Google Images:', error);
    return [];
  }
}
