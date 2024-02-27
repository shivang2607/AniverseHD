import "@/styles/globals.css";
import { createTheme, NextUIProvider } from "@nextui-org/react";
import Bar from "../Components/Navbar";
import { SSRProvider } from "@react-aria/ssr";
import { Analytics } from "@vercel/analytics/react";
import { FirebaseProvider } from "../context/firebaseContext";
import TimeAgo from "javascript-time-ago";

import en from "javascript-time-ago/locale/en.json";
import ru from "javascript-time-ago/locale/ru.json";


TimeAgo.addDefaultLocale(en);
TimeAgo.addLocale(ru);

export function reportWebVitals(metric) {
  // console.log(metric)
}

export default function App({ Component, pageProps }) {
  const theme = createTheme({
    type: "dark", // it could be "light" or "dark"
    theme: {
      colors: {
        // brand colors
        primaryLight: "$green200",
        primaryLightHover: "$green300",
        primaryLightActive: "$green400",
        primaryLightContrast: "$green600",
        primary: "#4ADE7B",
        primaryBorder: "$green500",
        primaryBorderHover: "$green600",
        primarySolidHover: "$green700",
        primarySolidContrast: "$white",
        primaryShadow: "$green500",

        gradient:
          "linear-gradient(112deg, $blue100 -25%, $pink500 -10%, $purple500 80%)",
        link: "#5E1DAD",

        // you can also create your own color
        myColor: "#ff4ecd",

        // ...  more colors
      },
      space: {},
      fonts: {},
    },
  });

  return (
    <FirebaseProvider>
        <SSRProvider>
        <NextUIProvider theme={theme}>
          <Bar />
          <Component {...pageProps} />
          <Analytics />
        </NextUIProvider>
    </SSRProvider>
      </FirebaseProvider>
  );
}
