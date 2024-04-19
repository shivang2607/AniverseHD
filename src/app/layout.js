import { Inter } from 'next/font/google'
import './globals.css'

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
    <html lang="en">
      <link rel="icon" href="favicon.ico" sizes="any" />
      <body className={`${inter.className} `}>
        {/* <ThemeProvider attribute="class" defaultTheme="light" enableSystem> */}
          {/* <Navbar/> */}
          {/* <ThemeSwitcher/> */}
          {children}
          {/* <Footer/> */}
        {/* </ThemeProvider> */}
      </body>
      {/* <GoogleTagManager gtmId='GTM-PBQJWMRT'/> */}
    </html>
  )
}
