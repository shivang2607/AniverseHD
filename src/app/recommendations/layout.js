import FilterPanel from "@/components/utils/FilterPanel";


export const metadata = {
  title: {
    template: 'Recommendations | %s - AniverseHD',
    default: 'Anime Recommendations - AniverseHD',
  },
  description:
    'Discover your next favorite anime! Get personalized recommendations tailored to your preferences or based on descriptions you provide. Start exploring now.',
  openGraph: {
    title: 'Anime Recommendations - Find Your Next Favorite Show | AniverseHD',
    description:
      'Looking for your next anime to binge? Use AniverseHD’s recommendation engine to find the best anime tailored to your taste. Explore, stream, and enjoy today!',
    url: 'https://www.aniversehd.com/recommendations',
    images: [
      {
        url: 'https://www.aniversehd.com/assets/recommendations-og-image.jpg', // Replace with an actual image
        width: 1200,
        height: 630,
        alt: 'Personalized Anime Recommendations - AniverseHD',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Anime Recommendations - Find Your Next Favorite Show | AniverseHD',
    description:
      'Let AniverseHD help you discover the best anime suited to your style. Get personalized recommendations based on your taste or description.',
    images: [
      'https://www.aniversehd.com/assets/recommendations-og-image.jpg', // Replace with an actual image
    ],
  },
};


export default function RecommendationLayout({
    children, // will be a page or nested layout
  }) {
    return (
      <div className=" flex w-full gap-4 md:pt-28 pt-20 z-0">
        {children}
        <FilterPanel/>
      </div>
    )
  }