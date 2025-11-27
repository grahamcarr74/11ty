require('dotenv').config();

module.exports = async function () {
  // Import SDK dynamically
  const { GraphClient } = await import('@optimizely/cms-sdk');

  const client = new GraphClient(process.env.OPTIMIZELY_GRAPH_SINGLE_KEY, {
    graphUrl: process.env.OPTIMIZELY_GRAPH_GATEWAY || 'https://cg.optimizely.com/content/v2'
  });

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
                          nodes {
                            ... on CompositionComponentNode {
                              component {
                                __typename
                                ... on ButtonBlock {
                                  _metadata {
                                    key
                                    displayName
                                  }
                                  Text
                                  Url {
                                    default
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
            }
          }
        }
      }
    }
  `;

  try {
    const data = await client.request(query);

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
