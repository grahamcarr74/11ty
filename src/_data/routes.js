require('dotenv').config();

module.exports = async function () {
  // Import SDK dynamically
  const { GraphClient } = await import('@optimizely/cms-sdk');

  const client = new GraphClient(process.env.OPTIMIZELY_GRAPH_SINGLE_KEY, {
    graphUrl: process.env.OPTIMIZELY_GRAPH_GATEWAY || 'https://cg.optimizely.com/content/v2'
  });

  // Fetch all content items that have a URL
  // We fetch basic metadata and fields common to our known types
  // Import models and query builder
  // We need to import the TS models. Since we are in JS, we can try importing them if tsx handles it.
  // If not, we might need to compile them or use a different approach.
  // Assuming tsx handles .ts imports in .js files if run via tsx.
  // Use require for TS files since we are running with tsx/ts-node
  const { ButtonBlock } = require('../models/ButtonBlock.ts');
  const { generateBlockFragments } = require('../utils/queryBuilder.ts');

  const models = { ButtonBlock };
  const blockFragments = generateBlockFragments(models);

  // Fetch all content items that have a URL
  // We fetch basic metadata and fields common to our known types
  const query = `
    ${blockFragments}

    fragment ICompositionNode on ICompositionNode {
      __typename
      key
      type
      nodeType
      layoutType
      displayName
      displayTemplateKey
      displaySettings {
        key
        value
      }
      ... on CompositionStructureNode {
        nodes @recursive(depth: 10)
      }
      ... on CompositionComponentNode {
        nodeType
        component {
          ..._IComponent
        }
      }
    }

    fragment _IExperience on _IExperience {
      composition {
        nodes {
          ...ICompositionNode
        }
      }
    }

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
            ..._IExperience
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
