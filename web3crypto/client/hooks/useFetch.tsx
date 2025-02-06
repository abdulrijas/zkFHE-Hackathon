import { useEffect, useState } from "react";
import PokemonCrying from "../assets/gifs/pokemon-crying.gif";

const APIKEY = process.env.NEXT_PUBLIC_GIPHY_API_KEY;

export default function useFetch({ keyword }: { keyword: string }) {
  const [gifUrl, setGifUrl] = useState<string>("");
  // transparent data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==
  useEffect(() => {
    const fetchGifs = async () => {
      try {
        const response = await fetch(
          `https://api.giphy.com/v1/gifs/search?api_key=${APIKEY}&q=${keyword
            .split(" ")
            .join("")}&limit=1`
        );
        const { data } = await response.json();

        setGifUrl(data[0]?.images?.downsized_medium.url);
      } catch (error) {
        setGifUrl(PokemonCrying.src);
      }
    };
    if (keyword) fetchGifs();
  }, [keyword]);

  return gifUrl;
}
