export const providersConfig = {
  'zoro' : {
    id: 'zoro',
    name: 'Provider-Z',
    displayName: 'Zoro Provider',
    hasServersApi: true,
    hasMultipleIdsPerEpisode: false,
    serverApiUrl: (episodeId) =>   `/api/v1/zoro/servers/${episodeId}`,

  },
  'animepahe': {
    id: 'animepahe',
    name: 'Provider-A',
    displayName: 'Animepahe Provider',
    hasServersApi: false,
    hasMultipleIdsPerEpisode: false,
    serverApiUrl: null, // Animepahe does not have a servers API, it uses episode IDs directly,

  },
};