const { createThemes } = require("tw-colors");

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
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "recommendation-box-banner": "url('/anime-all-characters-1.webp')",
      },
    },
  },
  plugins: [
    require("tailwind-scrollbar")({ preferredStrategy: "pseudoelements" }),
    require("@vidstack/react/tailwind.cjs"),
    createThemes({
      themeDefault: {
        primary: {
          100: "#57a6a1",
          200: "#6bb0ab",
          300: "#7fbab5",
          400: "#92c3bf",
          500: "#a4cdca",
          600: "#a4cdca",
        },
        cbg: {
          100: "#041C32",
          200: "#1f3146",
          300: "#39475b",
          400: "#535f70",
          500: "#6d7787",
          600: "#89919e",
        },
      },

      themeDarkOrange: {
        //goku theme vaala color
        cbg: {
          100: "#161617",
          200: "#1d1d1f",
          300: "#252528",
          400: "#2e2e32",
          500: "#38383d",
          600: "#434348",
        },
        primary: {
          100: "#c2442d",
          200: "#d8533a",
          300: "#e46d52",
          400: "#ec886c",
          500: "#f4a487",
          600: "#fac0a4",
        },
      },
      themeDarkPink: {
        cbg: {
          100: "#1a1b22",
          200: "#23242c",
          300: "#2e2f38",
          400: "#393a45",
          500: "#454652",
          600: "#51525e",
        },
        primary: {
          100: "#d46085",
          200: "#dd7294",
          300: "#e684a4",
          400: "#ee96b3",
          500: "#f6a9c3",
          600: "#fbbdd2",
        },
      },
      themeDarkPurple: {
        cbg: {
          100: "#181a24",
          200: "#202330",
          300: "#292d3d",
          400: "#323649",
          500: "#3c4055",
          600: "#464a61",
        },
        primary: {
          100: "#6f6dc6",
          200: "#7e7cd4",
          300: "#8f8de1",
          400: "#a1a0ec",
          500: "#b7b4f3",
          600: "#ceccf9",
        },
      },
      themeCalmGreen: {
        cbg: {
          100: "#141917",
          200: "#1b211f",
          300: "#232a27",
          400: "#2c332f",
          500: "#353c37",
          600: "#3f4640",
        },
        primary: {
          100: "#5c8c68",
          200: "#6e9e7a",
          300: "#81b18d",
          400: "#94c49f",
          500: "#a8d7b2",
          600: "#bceac5",
        },
      },

      themeDarkYellow: {
        primary: {
          100: "#f8d299", // soft amber
          200: "#f9dbab",
          300: "#fae3bd",
          400: "#fbeccf",
          500: "#fcf4e1",
          600: "#fefbf3", // very light cream
        },

        cbg: {
          100: "#0e0e0e", // near-black
          200: "#1a1a1a",
          300: "#1a1a1a",
          400: "#222222",
          500: "#2a2a2a",
          600: "#333333",
        },
      },
      

      themeTurquoiseDark: {
        primary: {
          100: '#50e6c1',
          200: '#42d3b0',
          300: '#33c1a0',
          400: '#25ae8f',
          500: '#189c7f',
          600: '#0b8a6e',
        },
        cbg: {
          100: "#0e0e0e", // near-black
          200: "#1a1a1a",
          300: "#1a1a1a",
          400: "#222222",
          500: "#2a2a2a",
          600: "#333333",
        },
      },

      themePurple: {
        primary: {
          100: "#7b5ea6",
          200: "#8a67b0",
          300: "#996fbb",
          400: "#a978c5",
          500: "#b880d0",
          600: "#ffffff",
        },
        cbg: {
          100: "#2f0f3d",
          200: "#3b1250",
          300: "#471563",
          400: "#531976",
          500: "#5f1b89",
          600: "#6b1e9c",
        },
      },
    }),
  ],
};
