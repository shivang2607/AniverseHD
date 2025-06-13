export async function mergeAnimeEpisodesData(animeData) {
  console.log("🚀 Starting mergeAnimeEpisodesData function (INDEX-BASED MERGING)");
  console.log("📊 Input data keys:", Object.keys(animeData || {}));
  
  try {
    const providerKeys = ['zoro', 'animepahe'];

    // Input validation
    if (!animeData || typeof animeData !== 'object') {
      console.log("❌ Invalid input data - returning empty array");
      return [];
    }

    console.log("✅ Input validation passed");

    const output = {};
    const allKeysMap = new Map();
    const episodesByIndex = new Map(); // index -> merged episode object
    const missingEpisodesByProvider = {};

    // Step 1: Copy non-provider metadata
    console.log("📋 Step 1: Copying non-provider metadata");
    let metadataCount = 0;
    for (const key in animeData) {
      if (!providerKeys.includes(key)) {
        output[key] = animeData[key];
        metadataCount++;
      }
    }
    console.log(`✅ Copied ${metadataCount} metadata fields:`, Object.keys(output));

    // Step 2: Collect keys from 1st episode of each provider with validation
    console.log("🔍 Step 2: Analyzing provider data structure");
    
    for (const provider of providerKeys) {
      const providerData = animeData[provider];
      console.log(`📦 Checking provider: ${provider}`);
      
      if (!providerData) {
        console.log(`❌ Provider ${provider}: No data found`);
        continue;
      }
      
      if (!providerData.episodes) {
        console.log(`❌ Provider ${provider}: No episodes property found`);
        console.log(`   Available keys:`, Object.keys(providerData));
        continue;
      }
      
      if (!Array.isArray(providerData.episodes)) {
        console.log(`❌ Provider ${provider}: Episodes is not an array, type:`, typeof providerData.episodes);
        continue;
      }

      console.log(`✅ Provider ${provider}: Found ${providerData.episodes.length} episodes`);
      console.log(`   Total episodes claimed: ${providerData.totalEpisodes || 'not specified'}`);

      // Show episode number range for debugging
      const episodeNumbers = providerData.episodes.map(ep => ep.number).filter(n => n);
      if (episodeNumbers.length > 0) {
        const minEp = Math.min(...episodeNumbers);
        const maxEp = Math.max(...episodeNumbers);
        console.log(`   Episode number range: ${minEp} - ${maxEp}`);
      }

      const [firstEpisode] = providerData.episodes;
      if (firstEpisode && typeof firstEpisode === 'object') {
        const episodeKeys = Object.keys(firstEpisode);
        console.log(`   First episode keys:`, episodeKeys);
        console.log(`   First episode sample:`, JSON.stringify(firstEpisode, null, 2));
        
        for (const key of episodeKeys) {
          if (!allKeysMap.has(key)) allKeysMap.set(key, new Set());
          allKeysMap.get(key).add(provider);
        }
      } else {
        console.log(`❌ Provider ${provider}: First episode is invalid or empty`);
      }
    }
    
    console.log("🗝️ All collected keys:", Array.from(allKeysMap.keys()));
    console.log("📊 Key usage by provider:", Array.from(allKeysMap.entries()).map(([key, providers]) => ({
      key,
      providers: Array.from(providers)
    })));

    // Step 3: Identify truly common keys (same value across all)
    console.log("🔗 Step 3: Identifying common keys across providers");
    const commonKeys = new Set();

    for (const key of allKeysMap.keys()) {
      if (allKeysMap.get(key).size === providerKeys.length) {
        let baseValue;
        let isSame = true;

        for (const provider of providerKeys) {
          const episodes = animeData[provider]?.episodes;
          if (!Array.isArray(episodes) || episodes.length === 0) {
            isSame = false;
            break;
          }

          const val = episodes[0]?.[key];
          if (baseValue === undefined) {
            baseValue = val;
          } else if (val !== baseValue) {
            console.log(`🔄 Key "${key}" differs: ${provider}="${val}" vs base="${baseValue}"`);
            isSame = false;
            break;
          }
        }

        if (isSame) {
          commonKeys.add(key);
          console.log(`✅ Common key found: "${key}" = "${baseValue}"`);
        }
      }
    }
    
    console.log("🤝 Final common keys:", Array.from(commonKeys));
    console.log("🏷️ Keys that will be prefixed:", Array.from(allKeysMap.keys()).filter(k => !commonKeys.has(k)));

    // Step 4: Merge episode data using INDEX-BASED approach
    console.log("🔄 Step 4: Starting INDEX-BASED episode merging process");
    let processedCount = 0;
    let totalEpisodesProcessed = 0;
    const BATCH_SIZE = 100;

    // Find the maximum number of episodes across all providers
    let maxEpisodes = 0;
    for (const provider of providerKeys) {
      const episodes = animeData[provider]?.episodes || [];
      if (Array.isArray(episodes)) {
        maxEpisodes = Math.max(maxEpisodes, episodes.length);
      }
    }
    
    console.log(`📊 Maximum episodes across providers: ${maxEpisodes}`);

    // Process episodes by index position
    for (let index = 0; index < maxEpisodes; index++) {
      console.log(`\n📍 Processing episode at index ${index}`);
      
      // Create merged episode entry
      const mergedEpisode = {
        episodeIndex: index + 1 // 1-based index for display
      };

      let hasDataFromAnyProvider = false;

      // Merge data from each provider at this index
      for (const provider of providerKeys) {
        const episodes = animeData[provider]?.episodes || [];
        
        if (index < episodes.length) {
          const episode = episodes[index];
          
          if (!episode || typeof episode !== 'object') {
            console.log(`❌ ${provider}[${index}]: Invalid episode data:`, episode);
            continue;
          }

          console.log(`✅ ${provider}[${index}]: Found episode #${episode.number || 'no-number'}`);
          hasDataFromAnyProvider = true;

          let fieldsAdded = 0;
          for (const [key, value] of Object.entries(episode)) {
            const shouldPrefix = !commonKeys.has(key);
            const finalKey = shouldPrefix ? `${provider}_${key}` : key;

            if (shouldPrefix || mergedEpisode[finalKey] === undefined) {
              mergedEpisode[finalKey] = value;
              fieldsAdded++;
            }
          }

          mergedEpisode[`provider_${provider}`] = true;
          console.log(`   Added ${fieldsAdded} fields from ${provider}`);
        } else {
          console.log(`⚠️ ${provider}[${index}]: No episode at this index (has ${episodes.length} episodes)`);
        }
      }

      // Only add episode if we got data from at least one provider
      if (hasDataFromAnyProvider) {
        episodesByIndex.set(index, mergedEpisode);
        totalEpisodesProcessed++;
        
        if (index < 3 || index === maxEpisodes - 1) { // Log first 3 and last
          console.log(`📝 Merged episode at index ${index}:`, JSON.stringify(mergedEpisode, null, 2));
        }
      } else {
        console.log(`❌ Index ${index}: No data from any provider, skipping`);
      }

      // Yield control periodically
      processedCount++;
      if (processedCount % BATCH_SIZE === 0) {
        console.log(`⏱️ Processed ${processedCount} episodes, yielding control...`);
        await new Promise(resolve => setTimeout(resolve, 0));
      }
    }

    // Step 5: Track missing episodes by provider
    console.log("\n📊 Step 5: Analyzing missing episodes by provider");
    for (const provider of providerKeys) {
      const episodes = animeData[provider]?.episodes || [];
      const total = animeData[provider]?.totalEpisodes;
      
      if (typeof total === 'number' && total > 0) {
        const actualCount = episodes.length;
        if (actualCount < total) {
          const missing = total - actualCount;
          missingEpisodesByProvider[provider] = {
            expected: total,
            actual: actualCount,
            missing: missing,
            missingFromEnd: missing // Assuming missing episodes are from the end
          };
          console.log(`⚠️ ${provider}: Missing ${missing} episodes (has ${actualCount}/${total})`);
        } else {
          console.log(`✅ ${provider}: All episodes present (${actualCount}/${total})`);
        }
      } else {
        console.log(`ℹ️ ${provider}: No totalEpisodes specified`);
      }
    }

    console.log(`\n📈 Total merged episodes: ${totalEpisodesProcessed}`);
    console.log(`📊 Unique episode indices: ${episodesByIndex.size}`);

    // Step 6: Finalize output
    console.log("\n🏁 Step 6: Finalizing output");
    
    // Convert Map to array (already in index order)
    output.episodesData = Array.from(episodesByIndex.values());
    console.log(`📋 Created episodesData array with ${output.episodesData.length} episodes`);
    
    // Log sample of first merged episode
    if (output.episodesData.length > 0) {
      console.log("📝 Sample merged episode (first):", JSON.stringify(output.episodesData[0], null, 2));
    }

    output.totalEpisodesByProvider = {};
    for (const provider of providerKeys) {
      const episodes = animeData[provider]?.episodes || [];
      const total = animeData[provider]?.totalEpisodes;
      output.totalEpisodesByProvider[provider] = {
        claimed: total,
        actual: episodes.length
      };
    }
    console.log("📊 Episodes by provider:", output.totalEpisodesByProvider);

    if (Object.keys(missingEpisodesByProvider).length > 0) {
      output.missingEpisodesByProvider = missingEpisodesByProvider;
      console.log("⚠️ Missing episodes by provider:", missingEpisodesByProvider);
    }

    console.log("✅ Function completed successfully");
    console.log("📦 Final output keys:", Object.keys(output));
    console.log("🎯 Final episodesData length:", output.episodesData?.length || 0);
    
    return output;

  } catch (error) {
    console.error('💥 Error in mergeAnimeEpisodesData:', error);
    console.error('📍 Stack trace:', error.stack);
    console.error('📊 Input data structure:', JSON.stringify(animeData, null, 2));
    
    // Return a safe fallback
    return {
      episodesData: [],
      totalEpisodesByProvider: {},
      error: error.message
    };
  }
}

// Alternative version with timeout protection
export function mergeAnimeEpisodesDataWithTimeout(animeData, timeoutMs = 5000) {
  return Promise.race([
    mergeAnimeEpisodesData(animeData),
    new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Function timeout')), timeoutMs)
    )
  ]);
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