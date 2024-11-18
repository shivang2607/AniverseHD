/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
 
    // Or if using `src` directory:
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    
    extend: {
      colors:{
        primary: {  //manual color in suggested.jsx, in toaster components
          100 : '#57a6a1',
          200 : '#6bb0ab',
          300 : '#7fbab5',
          400 : '#92c3bf',
          500 : '#a4cdca',
          600 : '#ffffff',
        },
        cbg: {
          100 : '#041C32',
          200 : '#1f3146',
          300 : '#39475b',
          400 : '#535f70',
          500 : '#6d7787',
          600 : '#89919e',
        }
        // cbg: {
        //   100 : '#121212',
        //   200 : '#181818',
        //   300 : '#282828',
        //   400 : '#404040',
        //   500 : '#B3B3B3',
        //   600 : '#89919e',
        // }
      
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'recommendation-box-banner': "url('/anime-all-characters-1.webp')"
      }
    },
  },
  plugins: [
    require('tailwind-scrollbar')({ preferredStrategy: 'pseudoelements' }),
    require('@vidstack/react/tailwind.cjs'),
  ],
}

