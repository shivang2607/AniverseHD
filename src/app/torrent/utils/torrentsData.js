import axios from "axios";
import convert from "xml-js";
import { getSessionWithExpiry, setSessionWithExpiry } from "../../../components/utils/storage";

// Recursive function to remove a prefix from keys, extract _text values,
// and convert numeric strings to numbers.
function removePrefixFromKeys(obj, prefix = "nyaa:") {
  if (Array.isArray(obj)) {
    return obj.map((item) => removePrefixFromKeys(item, prefix));
  } else if (obj !== null && typeof obj === "object") {
    const keys = Object.keys(obj);
    // If the object only has the _text property, extract its value
    if (keys.length === 1 && keys[0] === "_text") {
      const textVal = obj._text;
      const numVal = Number(textVal);
      return !isNaN(numVal) && textVal.trim() !== "" ? numVal : textVal;
    }
    return Object.fromEntries(
      Object.entries(obj).map(([key, value]) => {
        const newKey = key.startsWith(prefix) ? key.slice(prefix.length) : key;
        return [newKey, removePrefixFromKeys(value, prefix)];
      })
    );
  } else if (typeof obj === "string") {
    const numVal = Number(obj);
    return !isNaN(numVal) && obj.trim() !== "" ? numVal : obj;
  }
  return obj;
}

export async function getTorrentData(qText = "") {
  const ttl = 1000 * 60 * 20; //ttl of 20 min
  const cachedData = getSessionWithExpiry(`torrent-of-${qText}`);
  if (cachedData) 
    return cachedData;

  // Function to properly encode URL for allOrigins
  const encodeForAllOrigins = (baseUrl, params) => {
    const url = new URL(baseUrl);
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });
    return `https://api.allorigins.win/raw?url=${encodeURIComponent(url.toString())}`;
  };

  // Define the query parameters
  const queryParams = {
    page: 'rss',
    f: '0',
    c: '1_0',
    q: qText,
    s: 'seeders',
    o: 'desc'
  };

  // Construct the URLs with proper encoding
  const rootUrl1 = process.env.NEXT_PUBLIC_NYAA_URL;
  const rootUrl2 = process.env.NEXT_PUBLIC_NYAA_URL_2;

  // Build URL list with proper encoding for DEV mode
  //*below urls were throwing CORS issue in prod
  // const urls = process.env.NEXT_PUBLIC_ENV === "DEV" 
  //   ? [
  //       encodeForAllOrigins(rootUrl1, queryParams),
  //       ...(rootUrl2 ? [encodeForAllOrigins(rootUrl2, queryParams)] : [])
  //     ]
  //   : [
  //       `${rootUrl1}/?${new URLSearchParams(queryParams)}`,
  //       ...(rootUrl2 ? [`${rootUrl2}/?${new URLSearchParams(queryParams)}`] : [])
  //     ];

      const urls = [
          encodeForAllOrigins(rootUrl1, queryParams),
          ...(rootUrl2 ? [encodeForAllOrigins(rootUrl2, queryParams)] : [])
        ];

  // Create a function to fetch data from a URL and validate the response
  const fetchFromUrl = async (url) => {
    try {
      const response = await axios.get(url, {
        headers: {
          'Accept': 'application/xml, text/xml, */*',
        }
      });
  
      // Check for various error conditions
      if (response.headers['content-type']?.includes("text/html")) {
        console.error("Received HTML content from URL:", url);
        return Promise.reject(new Error("Unexpected HTML content in response"));
      }
      
      if (typeof response.data === "string") {
        if (response.data.includes("429 Too Many Requests")) {
          console.error("Received 429 error from URL:", url);
          return Promise.reject(new Error("429 Too Many Requests"));
        }
        if (response.data.includes("404 Not Found")) {
          console.error("Received 404 error from URL:", url);
          return Promise.reject(new Error("404 Not Found"));
        }
        // Check if the response content type is HTML
        
      }
  
      if (!response?.data) {
        return Promise.reject(new Error("No data in response"));
      }
      
      return response.data;
    } catch (error) {
      console.error("Failed to fetch from URL:", url, error.message);
      return Promise.reject(error); // Instead of throwing, return a rejected promise
    }
  };
  

  // Create an array of fetch promises
  const fetchPromises = urls.map(url => fetchFromUrl(url)); //since there is no await in front of fetchFromUrl therefore both request will return simultaneously or kyunki fir aage Prmoise.any lagaya h mtlb jaise hi koi bhi ek success hogi usko return kr dega

  let xmlData;
  try {
    // Use Promise.any to get the first successful response
    xmlData = await Promise.any(fetchPromises);
  } catch (error) {
    // AggregateError is thrown when all promises reject
    const errorMessage = error.errors ? 
      error.errors.map(e => e.message).join(", ") : 
      "Unknown error";
    throw new Error("All URL requests failed: " + errorMessage);
  }

  try {
    // Convert XML to JSON using compact mode
    const options = { compact: true, spaces: 2 };
    const jsonString = convert.xml2json(xmlData, options);
    let jsonData = JSON.parse(jsonString);

    // Process the channel items
    jsonData = removePrefixFromKeys(jsonData.rss.channel?.item, "nyaa:");

    if (!jsonData) {
      console.log("No items found in the RSS feed.");
      return [];
    }

    // Ensure jsonData is always an array and sort by seeders
    const dataArray = Array.isArray(jsonData) ? jsonData : [jsonData];
    const sortedJsonData = dataArray.sort((a, b) => Number(b.seeders) - Number(a.seeders));

    console.log("Processed items count:", sortedJsonData.length);
    if (sortedJsonData.length > 0) {
      setSessionWithExpiry(`torrent-of-${qText}`, sortedJsonData, ttl);  //cache data for 20 min
    }
    return sortedJsonData;
  } catch (error) {
    console.error("Error processing XML data:", error);
    throw new Error("Failed to process XML data: " + error.message);
  }
}