import { Inter } from 'next/font/google'
import './globals.css'
import Navbar from '@/Components/Navbar'
import 'react-loading-skeleton/dist/skeleton.css'
import { SkeletonTheme } from 'react-loading-skeleton'
import Footer from '@/Components/Footer'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: {
    template: 'AniverseHD/ %s',
    default: 'AniverseHD'
  },
  description: 'Anime Recommendations and streaming website',
}


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
      </body>
      {/* <GoogleTagManager gtmId='GTM-PBQJWMRT'/> */}
    </html>
  )
}
