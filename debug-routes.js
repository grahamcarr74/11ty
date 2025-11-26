const getAllPages = require('./src/_data/routes');

(async () => {
    try {
        console.log('Fetching pages...');
        const pages = await getAllPages();
        console.log('Pages fetched:', pages.length);
        if (pages.length > 0) {
            const pageWithContent = pages.find(p => p.composition && p.composition.nodes && p.composition.nodes.length > 0);
            if (pageWithContent) {
                console.log('Page with content found:', pageWithContent._metadata.displayName);
                console.log(JSON.stringify(pageWithContent, null, 2));
            } else {
                console.log('No pages with composition content found.');
                console.log('First page sample:', JSON.stringify(pages[0], null, 2));
            }
        }
    } catch (error) {
        console.error('Error:', error);
    }
})();
