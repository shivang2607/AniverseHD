async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function getSeasonNow(filter = '', sfw = false, unapproved = false, limit = 25) {
    const baseURL = 'https://api.jikan.moe/v4/seasons/now';
    let currentPage = 1;
    let hasNextPage = true;
    const allAnime = [];
    const notAiredYet = [];
    const today = new Date();

    while (hasNextPage) {
        const url = new URL(baseURL);
        url.searchParams.append('page', currentPage);
        url.searchParams.append('limit', limit);

        if (filter) url.searchParams.append('filter', filter);
        if (sfw) url.searchParams.append('sfw', '');
        if (unapproved) url.searchParams.append('unapproved', '');
        console.log("page:",currentPage);

        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();
            allAnime.push(...data.data);

            // Filter out anime that have not aired yet
            data.data.forEach(anime => {
                if (anime.aired && anime.aired.from) {
                    const airDate = new Date(anime.aired.from);
                    if (airDate > today && anime.episodes>1) {
                        notAiredYet.push(anime);
                    }
                }
            });

            hasNextPage = data.pagination.has_next_page;
            currentPage++;

            // Wait for 1 second before making the next request
            await sleep(1000);
        } catch (error) {
            console.error('Error fetching data:', error);
            break;
        }
    }

    return notAiredYet;
}

// Usage example:
getSeasonNow('', true, false, 25)
    .then(animeList => console.log(animeList))
    .catch(error => console.error(error));
