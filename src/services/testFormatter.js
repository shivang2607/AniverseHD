/**
 * Verification script for the Cloudflare Formatter
 */
import * as formatter from './cloudflareFormatter';

const mockCfUser = {
  userId: 'cf-user-id-123',
  userName: 'cf_username',
  displayName: 'CF Display Name',
  email: 'user@example.com',
  userProfileUrl: 'https://example.com/profile.jpg',
  userBannerUrl: 'https://example.com/banner.jpg',
  userBio: 'This is a bio',
  createdAt: '2023-01-01T00:00:00Z',
  updatedAt: '2023-01-01T00:00:00Z'
};

const mockCfWatchlist = {
  watchlistId: 'watchlist-abc',
  ownerUid: 'cf-user-id-123',
  ownerName: 'CF Owner',
  name: 'CF My Watchlist',
  visibility: 1, // public
  isStarter: 1,
  createdAt: '2023-01-01T00:00:00Z',
  updatedAt: '2023-01-01T00:00:00Z',
  animeList: [
    {
      anime_id: '456',
      title: 'Anime Title',
      type: 'TV',
      score: 8.5,
      url: 'https://myanimelist.net/anime/456',
      data: JSON.stringify({
        animePhoto: 'https://example.com/anime.jpg',
        animeGenre: ['Action', 'Comedy'],
        duration: '24 min'
      }),
      created_at: '2023-01-01T00:00:00Z',
      updated_at: '2023-01-01T00:00:00Z'
    }
  ]
};

console.log("--- Testing formatUser ---");
const formattedUser = formatter.formatUser(mockCfUser);
console.log(JSON.stringify(formattedUser, null, 2));
if (formattedUser.uid === 'cf-user-id-123' && formattedUser.userName === 'CF Display Name') {
  console.log("✅ formatUser passed");
} else {
  console.log("❌ formatUser failed");
}

console.log("\n--- Testing formatWatchlistDetail ---");
const formattedWatchlist = formatter.formatWatchlistDetail(mockCfWatchlist);
console.log(JSON.stringify(formattedWatchlist, null, 2));
if (formattedWatchlist.id === 'watchlist-abc' && formattedWatchlist.type === 'public' && formattedWatchlist.animeList[0].animeId === '456') {
  console.log("✅ formatWatchlistDetail passed");
} else {
  console.log("❌ formatWatchlistDetail failed");
}
