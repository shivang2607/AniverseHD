export function mergeAnimeEpisodesData(animeData) {
  const providerKeys = ['zoro', 'animepahe'];

  if (!animeData || typeof animeData !== 'object') return [];

  const output = {};
  const allKeysMap = new Map(); // key -> Set of providers using it
  const episodeMap = new Map(); // number -> merged episode object
  const missingEpisodesByProvider = {};

  // Step 1: Copy non-provider metadata
  for (const key in animeData) {
    if (!providerKeys.includes(key)) {
      output[key] = animeData[key];
    }
  }

  // Step 2: Collect keys from 1st episode of each provider
  for (const provider of providerKeys) {
    const [firstEpisode] = animeData[provider]?.episodes || [];
    if (firstEpisode) {
      for (const key of Object.keys(firstEpisode)) {
        if (!allKeysMap.has(key)) allKeysMap.set(key, new Set());
        allKeysMap.get(key).add(provider);
      }
    }
  }

  // Step 3: Identify truly common keys (same value across all)
  const commonKeys = new Set();

  for (const key of allKeysMap.keys()) {
    if (allKeysMap.get(key).size === providerKeys.length) {
      let baseValue;
      let isSame = true;

      for (const provider of providerKeys) {
        const val = animeData[provider]?.episodes?.[0]?.[key];
        if (baseValue === undefined) baseValue = val;
        else if (val !== baseValue) {
          isSame = false;
          break;
        }
      }

      if (isSame) {
        commonKeys.add(key);
      }
    }
  }

  // Step 4: Merge episode data
  for (const provider of providerKeys) {
    const episodes = animeData[provider]?.episodes || [];
    const providedNumbers = [];

    for (const episode of episodes) {
      const epNumber = episode.number;
      if (!epNumber) continue;

      providedNumbers.push(epNumber);

      if (!episodeMap.has(epNumber)) {
        episodeMap.set(epNumber, { number: epNumber });
      }

      const mergedEpisode = episodeMap.get(epNumber);

      for (const [key, value] of Object.entries(episode)) {
        if (key === 'number') continue;

        const shouldPrefix = !commonKeys.has(key);
        const finalKey = shouldPrefix ? `${provider}_${key}` : key;

        // Avoid overwriting existing common key if already set
        if (shouldPrefix || mergedEpisode[finalKey] === undefined) {
          mergedEpisode[finalKey] = value;
        }
      }

      mergedEpisode[`provider_${provider}`] = true;
    }

    // Step 5: Track missing episode numbers
    const total = animeData[provider]?.totalEpisodes;
    if (typeof total === 'number') {
      const missing = [];
      for (let i = 1; i <= total; i++) {
        if (!providedNumbers.includes(i)) {
          missing.push(i);
        }
      }
      if (missing.length > 0) {
        missingEpisodesByProvider[provider] = missing;
      }
    }
  }

  // Step 6: Add merged episodes and metadata
  output.episodesData = Array.from(episodeMap.values());

  output.totalEpisodesByProvider = {};
  for (const provider of providerKeys) {
    const total = animeData[provider]?.totalEpisodes;
    if (typeof total === 'number') {
      output.totalEpisodesByProvider[provider] = total;
    }
  }

  if (Object.keys(missingEpisodesByProvider).length > 0) {
    output.missingEpisodesByProvider = missingEpisodesByProvider;
  }

  return output;
}






//getting the absolute url path 
export const getAbsoluteURLPath = (pathname, searchParams)=>{

    
    const queryString = Array.from(searchParams.entries())
    .filter(par =>  par[0] !== "t")
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join("&");

  // Combine pathname and query string
  const absoluteURLPath = queryString ? `${pathname}?${queryString}` : pathname;

  return absoluteURLPath;
}