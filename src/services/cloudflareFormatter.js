/**
 * Cloudflare Response Formatter
 * 
 * Converts Cloudflare D1 response shapes into the Firebase format expected by 
 * frontend JSX components.
 */

// ---------------------------------------------------------------------------
// User
// ---------------------------------------------------------------------------

/**
 * Format a Cloudflare user object to match Firebase UserProfileModel shape.
 * @param {Object} cfUser - Raw user row from Cloudflare
 * @returns {Object} Firebase-compatible user profile
 */
export function formatUser(cfUser) {
  if (!cfUser) return null;

  return {
    uid: cfUser.userId,
    userName: cfUser.displayName || cfUser.userName, // Firebase: userName is display name
    email: cfUser.email,
    photoUrl: cfUser.userProfileUrl,
    coverUrl: cfUser.userBannerUrl,
    userBio: cfUser.userBio || '',
    createdAt: cfUser.createdAt,
    playerOptions: { 
      autoPlay: true,
      autoSkipIntro: false,
      autoNext: true,
    }
  };
}

// ---------------------------------------------------------------------------
// Watchlist
// ---------------------------------------------------------------------------

/**
 * Format a Cloudflare watchlist summary to match Firebase WatchListModel shape.
 * @param {Object} cfWatchlist - Raw watchlist row from Cloudflare
 * @returns {Object} Firebase-compatible watchlist summary
 */
export function formatWatchlist(cfWatchlist) {
  if (!cfWatchlist) return null;

  return {
    id: cfWatchlist.watchlistId,
    ownerUid: cfWatchlist.ownerUid,
    ownerName: cfWatchlist.ownerName || '',
    watchListName: cfWatchlist.name,
    type: cfWatchlist.visibility === 1 ? 'public' : 'private',
    isSpecialStarter: cfWatchlist.isStarter === 1,
    createdAt: cfWatchlist.createdAt,
    updatedAt: cfWatchlist.updatedAt,
    // Note: animeList at summary level in Firebase is typically empty or not present
    // It's fetched separately or parsed if embedded
    animeList: Array.isArray(cfWatchlist.animeList) ? cfWatchlist.animeList : []
  };
}

/**
 * Format a list of Cloudflare watchlists.
 */
export function formatWatchlists(cfWatchlists) {
  if (!Array.isArray(cfWatchlists)) return [];
  return cfWatchlists.map(formatWatchlist);
}

// ---------------------------------------------------------------------------
// Anime
// ---------------------------------------------------------------------------

/**
 * Format a Cloudflare anime row to match Firebase AnimeModel shape.
 * @param {Object} cfAnime - Raw anime row from Cloudflare
 * @returns {Object} Firebase-compatible anime item
 */
export function formatAnime(cfAnime) {
  if (!cfAnime) return null;

  let richData = {};
  if (cfAnime.data) {
    try {
      richData = typeof cfAnime.data === 'string' ? JSON.parse(cfAnime.data) : cfAnime.data;
    } catch (e) {
      console.warn("Failed to parse anime data JSON", e);
    }
  }

  return {
    animeId: cfAnime.anime_id,
    animeName: cfAnime.title || richData.animeName || '',
    animePhoto: richData.animePhoto || richData.images?.jpg?.image_url || null,
    animeGenre: richData.animeGenre || (richData.genres ? richData.genres.map(g => g.name) : []),
    animeType: cfAnime.type || richData.type || null,
    animeScore: cfAnime.score || richData.score || null,
    animeAgeRating: richData.animeAgeRating || richData.rating || null,
    animeStartYear: richData.animeStartYear || (richData.aired?.from ? new Date(richData.aired.from).getFullYear() : null),
    animeLength: cfAnime.episodes || richData.episodes || null,
    url: cfAnime.url || richData.url || null,
    duration: richData.duration || null,
    episodeTimestamp: cfAnime.episodeTimestamp || null,
    addedAt: cfAnime.created_at,
    updatedAt: cfAnime.updated_at
  };
}

/**
 * Format a detailed watchlist including full anime objects.
 */
export function formatWatchlistDetail(cfWatchlistDetail) {
  if (!cfWatchlistDetail) return null;

  const formatted = formatWatchlist(cfWatchlistDetail);
  
  if (Array.isArray(cfWatchlistDetail.animeList)) {
    formatted.animeList = cfWatchlistDetail.animeList.map(formatAnime);
  }

  // Preserve pagination if present
  if (cfWatchlistDetail.pagination) {
    formatted.pagination = cfWatchlistDetail.pagination;
  }

  return formatted;
}
