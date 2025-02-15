import axios from "axios";
import convert from "xml-js";

// Recursive function to remove a prefix from keys, extract _text values,
// and convert numeric strings to numbers.
function removePrefixFromKeys(obj, prefix = "nyaa:") {
  if (Array.isArray(obj)) {
    return obj.map(item => removePrefixFromKeys(item, prefix));
  } else if (obj !== null && typeof obj === "object") {
    const keys = Object.keys(obj);
    // If the object only has the _text property, extract its value
    if (keys.length === 1 && keys[0] === "_text") {
      const textVal = obj._text;
      // Check if the value is a numeric string and convert if needed
      const numVal = Number(textVal);
      return !isNaN(numVal) && textVal.trim() !== "" ? numVal : textVal;
    }
    // Process each key-value pair in the object
    return Object.fromEntries(
      Object.entries(obj).map(([key, value]) => {
        const newKey = key.startsWith(prefix) ? key.slice(prefix.length) : key;
        return [newKey, removePrefixFromKeys(value, prefix)];
      })
    );
  } else if (typeof obj === "string") {
    // If it's a plain string, try converting it to a number
    const numVal = Number(obj);
    return !isNaN(numVal) && obj.trim() !== "" ? numVal : obj;
  }
  return obj;
}

export async function getTorrentData(qText = "") {
  try {
    const res = await axios.get(
      `https://api.allorigins.win/raw?url=${process.env.NEXT_PUBLIC_NYAA_URL}/?page=rss&f=0&c=1_0&q=${qText}&s=seeders&o=desc`
    );
    console.log("XML data =>", res.data);

    // Convert XML to JSON using compact mode
    const options = { compact: true, spaces: 2 };
    const jsonString = convert.xml2json(res.data, options);
    let jsonData = JSON.parse(jsonString);

    // Process the channel items and remove the 'nyaa:' prefix,
    // extract _text values, and convert numeric strings to numbers.
    jsonData = removePrefixFromKeys(jsonData.rss.channel.item, "nyaa:");
    const sortedJsonData = jsonData.sort((a, b) => b.seeders - a.seeders);
    console.log("Converted JSON =>", sortedJsonData);

    return sortedJsonData;
  } catch (error) {
    console.error("Error fetching or converting torrent data:", error);
    throw error;
  }
}
