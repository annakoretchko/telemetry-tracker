// strava.js
const STRAVA_ACCESS_TOKEN = 'c4a537b73c99945aa6f2a784a5afc9e1c5c53dd7';

export async function getStravaActivities({ before, after, page = 1, perPage = 30 } = {}) {
    try {
        const params = new URLSearchParams();

        if (before) params.append('before', before);
        if (after) params.append('after', after);
        params.append('page', page);
        params.append('per_page', perPage);

        const url = `https://www.strava.com/api/v3/athlete/activities?${params.toString()}`;
        console.log('Fetching Strava activities from:', url);

        const response = await fetch(url, {
            headers: {
                Authorization: `Bearer ${STRAVA_ACCESS_TOKEN}`,
            },
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Strava API response error:', response.status, errorText);
            throw new Error('Failed to fetch Strava activities');
        }

        const data = await response.json();
        console.log('Fetched Strava activities:', data);

        return data;
    } catch (error) {
        console.error('Strava API Error:', error);
        return [];
    }
}
