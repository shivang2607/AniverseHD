import getAnime from "@/app/api/v1/anime/[id]/mainFunction";
import axios from "axios";
import AnimeClient from "./AnimeClient";

export async function generateMetadata({ params }, parent) {
  "use server";
  const { id } = await params;
  const anime = await getAnime(id);
  if (!anime || Object.keys(anime).length === 0) {
    return {
      title: "Anime Not Found",
      description: "The requested anime could not be found.",
      keywords: "anime, not found",
      openGraph: {
        images: [],
      },
    };
  }

//   console.log(anime.genres, anime.themes);

  // optionally access and extend (rather than replace) parent metadata
  // const previousImages = (await parent).openGraph?.images || []

  return {
    title: anime?.title_english || anime?.title || "Anime Details",
    description: anime?.synopsis || "Anime Details and Information",
    keywords: [
      ...anime?.genres,
      ...anime?.themes,
    ],
    openGraph: {
      images: [anime?.images?.webp?.image_url || anime?.images?.jpg?.image_url, 
                anime?.trailer?.images?.maximum_image_url || anime?.trailer?.images?.large_image_url || anime?.trailer?.images?.medium_image_url],
    },
  };
}

export default function AnimePage({ params }) {
  return <AnimeClient params={params} />;
}