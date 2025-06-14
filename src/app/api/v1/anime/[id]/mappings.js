import axios from 'axios';

/**
 * Fetch mapping data by MAL ID from the external MAPPER_URL service.
 * @param {string|number} malId - The MyAnimeList ID.
 * @returns {Promise<Object|null>} - The mapping data or null on failure.
 */
export async function fetchMappingsByMalId(malId) {
  try {
    const res = await axios.get(
      `${process.env.MAPPER_URL}/anime/mappings/mal_id/${malId}`
    );
    return res.data;
  } catch (error) {
    console.error(`❌ Error fetching mappings for MAL ID ${malId}:`, error.message);
    return null;
  }
}
