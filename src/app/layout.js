import { Inter } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/Navbar'
import 'react-loading-skeleton/dist/skeleton.css'
import { SkeletonTheme } from 'react-loading-skeleton'
import Footer from '@/components/Footer'
import GlobalLoader from '@/components/utils/GlobalLoader'
import TimeAgo from 'javascript-time-ago'
import Script from 'next/script'

import en from 'javascript-time-ago/locale/en'
import ru from 'javascript-time-ago/locale/ru'
import Notice from '@/components/Notice'

// Initialize Time Ago
TimeAgo.addDefaultLocale(en)
TimeAgo.addLocale(ru)

// Initialize the Inter font
const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: {
    template: 'AniverseHD | %s',
    default: 'AniverseHD : Stream Anime, Create & Share Watchlists - AniverseHD',
  },
  icons: '/logo-teal-stretched.png',
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
};

export default function RootLayout({ 
  children 
}) {
  return (
    <html 
      lang="en" 
      className='
        scrollbar-thumb-primary-200 
        scrollbar-thumb-rounded-full 
        scrollbar-track-rounded-full 
        scrollbar-track-cbg-200
      '
    >
      <head>
        {/* Favicon */}
        <link rel="icon" href="/favicon.ico" sizes="any" />

        {/* Umami Analytics */}
        <Script 
          defer 
          src="https://umami.aniversehd.com/script.js" 
          data-website-id="f2376715-c5ae-4187-9b7f-2c5177603eeb"
          strategy="afterInteractive"
        />

        {/* Cloudflare Web Analytics */}
        <Script 
          defer 
          src='https://static.cloudflareinsights.com/beacon.min.js' 
          data-cf-beacon='{"token": "fc05a7dc03db45c2aafe3bb385a757fb"}'
          strategy="afterInteractive"
        />

        {/* Cloudflare Web Analytics for Abhay */}
        <Script 
          defer 
          src='https://static.cloudflareinsights.com/beacon.min.js' 
          data-cf-beacon='{"token": "170d25d6bd5647b0b0211213bf548407"}'
          strategy="afterInteractive"
        />
      </head>
      
      <body 
        className={`
          ${inter.className} 
          bg-cbg-100 
          text-[#EEEEEE] 
          tracking-wide
        `}
      >
        <SkeletonTheme 
          baseColor="#39475b" 
          highlightColor="#535f70" 
          duration={1}
        >
          <div className="flex flex-col min-h-screen">
            <Notice />
            <Navbar />
            
            <main className="flex-grow">
              {children}
            </main>
            
            <GlobalLoader />
            <Footer />
          </div>
        </SkeletonTheme>
      </body>
    </html>
  )
}