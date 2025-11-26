const getAllPages = require('./src/_data/routes');

(async () => {
    try {
        console.log('Fetching pages...');
        const pages = await getAllPages();
        console.log('Pages fetched:', pages.length);
        if (pages.length > 0) {
            console.log('First page sample:', JSON.stringify(pages[0], null, 2));
        }
    } catch (error) {
        console.error('Error:', error);
    }
})();
