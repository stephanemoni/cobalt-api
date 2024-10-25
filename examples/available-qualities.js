const CobaltAPI = require('cobalt-api');

async function main() {
    const youtubeUrl = 'https://www.youtube.com/watch?v=OAr6AIvH9VY';
    
    const cobalt = new CobaltAPI(youtubeUrl);

    try {
        const qualities = await cobalt.getAvailableQualities();
        console.log('Available video qualities:', qualities);

        if (qualities.includes('2160')) {
            cobalt.setQuality('2160');
        } else if (qualities.includes('1080')) {
            cobalt.setQuality('1080');
        } else {
            cobalt.setQuality(qualities[0]);
        }

        const response = await cobalt.sendRequest();
        if (response.status) {
            console.log('Download link:', response.data.url);
        } else {
            console.error('Error:', response.text);
        }
    } catch (error) {
        console.error('An error occurred:', error.message);
    }
}

main();
