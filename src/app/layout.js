import { Inter } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/Navbar'
import 'react-loading-skeleton/dist/skeleton.css'
import { SkeletonTheme } from 'react-loading-skeleton'
import Footer from '@/components/Footer'
import WatchlistBar from '@/components/WatchlistBar'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: {
    template: 'AniverseHD | %s',
    default: 'AniverseHD : Stream Anime, Create & Share Watchlists - AniverseHD',
  },

  icons:'logo-teal-stretched.png'
  ,
  description: 'Stream your favorite anime in HD, create and share personalized watchlists, and get smart recommendations. Explore a world of anime with AniverseHD.',
  keywords: [
    'anime streaming',
    'anime watchlist',
    'anime recommendations',
    'stream anime HD',
    'custom anime playlists',
    'share anime watchlists',
    'top anime streaming site',
  ],
  openGraph: {
    title: 'Stream Anime, Create & Share Watchlists - AniverseHD',
    description:
      'Dive into the ultimate anime experience with AniverseHD. Watch anime in HD, create custom watchlists, and get personalized recommendations.',
    url: 'https://www.aniversehd.com',
    images: [
      {
        url: 'https://www.aniversehd.com/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'AniverseHD - Stream Anime, Create & Share Watchlists',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Stream Anime, Create & Share Watchlists - AniverseHD',
    description:
      'Discover the best anime streaming platform with AniverseHD. Customize your anime experience and share it with friends.',
    image: 'https://www.aniversehd.com/twitter-image.jpg',
  },
  viewport: 'width=device-width, initial-scale=1.0',
};


//* SKELETON THEME COLORS HAS TO BE CHANGED MANUALLY EVERYTIME WHENEVER THE THEME IS CHANGED ACCORDINGLY IF NEEDED */



export default function RootLayout({ children }) {
  return (
    <html lang="en" className='scrollbar-thumb-primary-200 scrollbar-thumb-rounded-full scrollbar-track-rounded-full scrollbar-track-cbg-200'>
      <link rel="icon" href="favicon.ico" sizes="any" />
      <body className={`${inter.className} bg-cbg-100 text-[#EEEEEE] tracking-wide`}>
      <SkeletonTheme baseColor="#39475b" highlightColor="#535f70" duration={1}>
          <Navbar/>
          {children}
          </SkeletonTheme>
          <Footer/>

          {/* <!-- Cloudflare Web Analytics --> */}
          <script defer src='https://static.cloudflareinsights.com/beacon.min.js' data-cf-beacon='{"token": "fc05a7dc03db45c2aafe3bb385a757fb"}'></script>
          {/* <!-- End Cloudflare Web Analytics --> */}
          
      </body>
      {/* <GoogleTagManager gtmId='GTM-PBQJWMRT'/> */}
    </html>
  )
}
