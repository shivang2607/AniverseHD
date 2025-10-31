import axios from "axios";

class Kwik {
  constructor() {
    this.sources = [];
  }

  async extract(videoUrl) {
    try {
      const response = await axios.get(videoUrl.href, {
        headers: {
          Referer: "https://kwik.cx/",
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.116 Safari/537.36",
        },
      });
      const data = response.data;

      // Extract the encoded JavaScript code
      const match = data.match(/eval\((.*)\)/s);
      if (!match) throw new Error("No eval script found");

      // Evaluate the code to get the m3u8 URL
      const decodedCode = eval(match[1]);
      const source = decodedCode.match(/(https?:\/\/[^\s]+\.m3u8)/);

      if (source?.[0]) {
        this.sources.push({
          url: source[0],
          isM3U8: true,
        });
      }

      return this.sources;
    } catch (err) {
      throw new Error(err.message);
    }
  }
}

export default Kwik;