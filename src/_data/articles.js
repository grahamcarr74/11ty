const graphqlClient = require('./graphql-client');

module.exports = async function() {
  // GraphQL query to fetch articles from Optimizely Content Graph
  const query = `
    query GetPages {
      BlogPostPage (
        orderBy: { _metadata: { published: DESC } }
        limit: 20
      ) {
        items {
          _metadata {
            key
            published
            lastModified
            url {
              default
            }
            displayName
            types
          }
        }
        total
      }
    }
  `;

  const data = await graphqlClient.query(query);

  // If Content Graph is not configured, return mock data
  if (!data) {
    return [
      {
        _metadata: {
          key: 'mock-article-1',
          published: new Date('2024-01-15').toISOString(),
          lastModified: new Date('2024-01-15').toISOString(),
          url: { default: '/articles/getting-started' },
          displayName: 'Getting Started with Optimizely',
          types: ['Article']
        },
        Title: 'Getting Started with Optimizely',
        Heading: 'Getting Started with Optimizely',
        Summary: 'Learn the basics of Optimizely CMS and Content Graph.',
        MainBody: 'This is a comprehensive guide to getting started with Optimizely. This is mock content.',
        Author: 'Demo Author'
      },
      {
        _metadata: {
          key: 'mock-article-2',
          published: new Date('2024-01-20').toISOString(),
          lastModified: new Date('2024-01-20').toISOString(),
          url: { default: '/articles/content-graph-intro' },
          displayName: 'Introduction to Content Graph',
          types: ['Article']
        },
        Title: 'Introduction to Content Graph',
        Heading: 'Introduction to Content Graph',
        Summary: 'Discover how to use Optimizely Content Graph with your headless applications.',
        MainBody: 'Content Graph provides a powerful GraphQL API for accessing your content. This is mock content.',
        Author: 'Demo Author'
      }
    ];
  }

  return data.BlogPostPage?.items || [];
};
