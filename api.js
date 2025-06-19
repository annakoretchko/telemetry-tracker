// api.js
export async function sendEvent(event) {
    try {
        const response = await fetch('https://jsonplaceholder.typicode.com/posts', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(event),
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        return await response.json(); // or whatever your API returns
    } catch (error) {
        console.error('Failed to send event:', error);
        throw error;
    }
}