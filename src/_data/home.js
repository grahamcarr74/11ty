const graphqlClient = require('./graphql-client');

module.exports = async function () {
  // GraphQL query to fetch the home page (url: "/")
  const query = `
    query GetHomePage {
      _Content(
        where: { _metadata: { url: { default: { eq: "/" } } } }
        limit: 1
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
          ... on BlankExperience {
            _metadata {
              key
            }
          }
        }
      }
    }
  `;

  const data = await graphqlClient.query(query);

  if (!data) {
    return {
      _metadata: {
        key: 'mock-home',
        displayName: 'Home Page',
        types: ['BlankExperience']
      },
      Title: 'Optimizely Content Graph + 11ty',
      Heading: 'Optimizely Content Graph + 11ty',
      MainBody: '<p>This is a proof of concept demonstrating how to use 11ty to build a static site with content from Optimizely SaaS CMS using Content Graph. (Mock Data)</p>'
    };
  }

  if (!data._Content || !data._Content.items || data._Content.items.length === 0) {
    // Return null if no home page found, so index.11ty.ts can fall back to default or show error
    return null;
  }

  return data._Content.items[0];
};
