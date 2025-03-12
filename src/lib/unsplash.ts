import { createApi } from "unsplash-js"

const unsplash = createApi({
  accessKey: import.meta.env.VITE_UNSPLASH_API_KEY,
})

export const getPhoto = (query: string) => {
  unsplash.search.getPhotos({ query }).then((result) => {
    if (result.errors) {
      console.log("Error searching for image: ", result.errors[0])
    } else {
      const response = result.response
      return response.results[0].links
    }
  })
}
