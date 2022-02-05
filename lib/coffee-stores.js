//initialize unsplash
import { createApi } from "unsplash-js";

// on your node server
const unsplashApi = createApi({
  accessKey: process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY,
  //...other fetch options
});

const options = {
  method: "GET",
  headers: {
    Accept: "application/json",
    Authorization: process.env.NEXT_PUBLIC_FOURSQUARE_API_KEY,
  },
};

const getCoffeeStorePhotos = async (limit = 10) => {
  const photos = await unsplashApi.search.getPhotos({
    query: "coffee shops",
    perPage: limit,
  });
  const unsplashResults = photos.response.results;
  return unsplashResults.map((result) => result.urls["small"]);
};

export const fetchCoffeeStores = async (
  latLong = "40.730610%2C-73.935242",
  limit = 9
) => {
  const photos = await getCoffeeStorePhotos(limit);
  const response = await fetch(
    `https://api.foursquare.com/v3/places/search?query=coffee&ll=${latLong}&limit=${limit}`,
    options
  );
  const data = await response.json();
  return data.results.map((result, idx) => {
    const neighborhood = result.location.locality;
    return {
      // ...result,
      fsq_id: result.fsq_id,
      address: result.location.address || "",
      name: result.name,
      neighbourhood: neighborhood ? neighborhood : result.location.crossStreet,
      imgUrl: photos[idx],
    };
  });
};
