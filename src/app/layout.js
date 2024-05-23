import { Inter } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/Navbar'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: {
    template: 'AniverseHD/ %s',
    default: 'AniverseHD'
  },
  description: 'Anime Recommendations and streaming website',
}


export default function RootLayout({ children }) {
  return (
    <html lang="en" className='scrollbar-thumb-primary-100 scrollbar-thumb-rounded-full scrollbar-track-rounded-full scrollbar-track-cbg-200'>
      <link rel="icon" href="favicon.ico" sizes="any" />
      <body className={`${inter.className} bg-cbg-100 text-[#EEEEEE] tracking-wide`}>
        
          <Navbar/>
          {children}
          {/* <Footer/> */}
      </body>
      {/* <GoogleTagManager gtmId='GTM-PBQJWMRT'/> */}
    </html>
  )
}
