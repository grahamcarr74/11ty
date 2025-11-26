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
            composition {
              nodes {
                ... on CompositionStructureNode {
                  key
                  # displayOption might be displaySettings or just not available on this type directly
                  # trying displaySettings based on error hint, or omitting if unsure
                  # rows are direct nodes, not items wrapper inside nodes
                  rows: nodes {
                    ... on CompositionStructureNode {
                      key
                      columns: nodes {
                        ... on CompositionStructureNode {
                          key
                        }
                      }
                    }
                  }
                }
              }
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
    const pages = data._Content.items.filter(item =>
      item._metadata &&
      item._metadata.url &&
      item._metadata.url.default
    );

    console.log(`Fetched ${pages.length} pages from Optimizely Graph.`);
    return pages;
  } catch (error) {
    console.error('Error fetching all pages:', error);
    return [];
  }
};
