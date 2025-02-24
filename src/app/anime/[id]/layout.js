export const metadata = {
    title: 'Anime Details | AniverseHD',
    description: 'Discover everything about your favorite anime, including episodes, cast, and streaming options on AniverseHD.',
    openGraph: {
      title: 'Anime Details | AniverseHD',
      description: 'Find detailed information about your favorite anime, including episodes and characters.',
      url: 'https://www.aniversehd.com/anime/details',
      images: [
        {
          url: 'https://www.aniversehd.com/assets/default-og-image.jpg', // Replace with a default anime-related image
          width: 1200,
          height: 630,
          alt: 'Anime Details - AniverseHD',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Anime Details | AniverseHD',
      description: 'Dive into the details of your favorite anime series on AniverseHD.',
       
    },
  };
  



export default function AnimeDetailsLayout({
    children, // will be a page or nested layout
  }) {
    return (
      <div>
        {children}
      </div>
    )
  }