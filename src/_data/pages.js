const graphqlClient = require('./graphql-client');

module.exports = async function() {
  // GraphQL query to fetch pages from Optimizely Content Graph
  const query = `
query GetPages {
  BlankExperience (
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
          key: 'mock-page-1',
          published: new Date().toISOString(),
          lastModified: new Date().toISOString(),
          url: { default: '/home' },
          displayName: 'Home Page',
          types: ['StandardPage']
        },
        Title: 'Welcome to Our Site',
        Heading: 'Welcome to Our Site',
        MainBody: 'This is mock content. Configure your Optimizely Content Graph credentials to fetch real content.'
      },
      {
        _metadata: {
          key: 'mock-page-2',
          published: new Date().toISOString(),
          lastModified: new Date().toISOString(),
          url: { default: '/about' },
          displayName: 'About Us',
          types: ['StandardPage']
        },
        Title: 'About Us',
        Heading: 'About Us',
        MainBody: 'Learn more about our company. This is mock content for demonstration purposes.'
      }
    ];
  }
  return data.BlankExperience?.items || [];
};
