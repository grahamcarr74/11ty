const graphqlClient = require('./graphql-client');

module.exports = async function () {
    // Fetch all content items that have a URL
    // We fetch basic metadata and fields common to our known types
    const query = `
    query GetAllPages {
      _Content(
        where: { _metadata: { url: { default: { exist: true } } } }
        limit: 100
      ) {
        items {
          _metadata {
            key
            url {
              default
            }
            types
            displayName
            lastModified
          }
          ... on BlankExperience {
            _metadata {
              key
            }
          }
        }
      }
    }
  `;

    try {
        const data = await graphqlClient.query(query);

        if (!data || !data._Content || !data._Content.items) {
            console.warn('No pages found in Optimizely Graph.');
            return [];
        }

        // Filter out items without a default URL just in case
        // Also exclude the home page ('/') to avoid conflict with index.11ty.ts
        const pages = data._Content.items.filter(item =>
            item._metadata &&
            item._metadata.url &&
            item._metadata.url.default &&
            item._metadata.url.default !== '/'
        );

        console.log(`Fetched ${pages.length} pages from Optimizely Graph (excluding Home).`);
        return pages;
    } catch (error) {
        console.error('Error fetching all pages:', error);
        return [];
    }
};
