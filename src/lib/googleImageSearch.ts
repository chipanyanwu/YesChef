import axios from "axios"

const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_API_KEY
const CX = import.meta.env.VITE_GOOGLE_SEARCH_ENGINE_ID

const BLOCKED_DOMAINS = ["instagram.com", "facebook.com", "tiktok.com"]

interface SearchResponse {
  displayLink: string
  fileFormat: string
  htmlSnippet: string
  htmlTitle: string
  image: unknown
  kind: string
  link: string
  mime: string
  snippet: string
  title: string
}

function isBlockedDomain(url: string): boolean {
  try {
    const domain = new URL(url).hostname.toLowerCase()
    return BLOCKED_DOMAINS.some((blocked) => domain.includes(blocked))
  } catch {
    return true
  }
}

/**
 * Searches for images via the Google Custom Search API.
 * @param query The search terms (e.g., "melt butter").
 * @returns An array of image URLs, or empty array if none found.
 */
export async function googleImageSearch(query: string): Promise<string[]> {
  if (!GOOGLE_API_KEY || !CX) {
    console.error("Missing Google API key or Search Engine ID")
    return []
  }

  try {
    const response = await axios.get(
      "https://www.googleapis.com/customsearch/v1",
      {
        params: {
          key: GOOGLE_API_KEY,
          cx: CX,
          searchType: "image",
          q: query,
          num: 8,
        },
      }
    )

    const items: SearchResponse[] = response.data.items || []
    const itemLinks = items.map((item: SearchResponse) => item.link)
    const filteredLinks = itemLinks.filter((url) => !isBlockedDomain(url))

    console.log(query)
    console.log(filteredLinks)

    return filteredLinks
  } catch (error) {
    console.error("Error searching Google Images:", error)
    return []
  }
}
