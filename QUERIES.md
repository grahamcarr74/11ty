# Optimizely Content Graph Query Examples

This document contains example GraphQL queries for Optimizely Content Graph that you can use in your 11ty data files.

## Basic Content Query

Fetch all content items:

```graphql
query GetAllContent {
  Content {
    items {
      _metadata {
        key
        displayName
        url {
          default
        }
        published
        types
      }
    }
    total
  }
}
```

## Filter by Content Type

Fetch specific content types:

```graphql
query GetPages {
  Content(
    where: {
      _metadata: {
        types: {
          in: ["StandardPage", "LandingPage"]
        }
      }
    }
  ) {
    items {
      _metadata {
        key
        displayName
        url { default }
      }
      ... on IContent {
        Title: _fulltext(highlight: { enabled: false }, fields: "Title")
        MainBody
      }
    }
  }
}
```

## Search by Text

Full-text search across content:

```graphql
query SearchContent($searchTerm: String!) {
  Content(
    where: {
      _fulltext: {
        contains: $searchTerm
      }
    }
  ) {
    items {
      _metadata {
        key
        displayName
        url { default }
      }
      ... on IContent {
        Title: _fulltext(highlight: { enabled: true })
      }
    }
  }
}
```

## Filter by Status

Fetch only published content:

```graphql
query GetPublishedContent {
  Content(
    where: {
      _metadata: {
        status: {
          eq: "Published"
        }
      }
    }
  ) {
    items {
      _metadata {
        key
        displayName
        published
      }
    }
  }
}
```

## Sort and Pagination

Fetch content with sorting and pagination:

```graphql
query GetRecentContent($limit: Int, $skip: Int) {
  Content(
    orderBy: {
      _metadata: {
        published: DESC
      }
    }
    limit: $limit
    skip: $skip
  ) {
    items {
      _metadata {
        key
        displayName
        published
      }
    }
    total
    cursor
  }
}
```

## Fetch Specific Properties

Query specific content type with custom properties:

```graphql
query GetArticles {
  ArticlePage {
    items {
      _metadata {
        key
        url { default }
        published
      }
      Title
      Author
      PublishDate
      Summary
      MainBody
      Image {
        url
        alt
      }
      Categories {
        items {
          Name
        }
      }
    }
  }
}
```

## Nested Content

Fetch content with nested content areas:

```graphql
query GetPageWithBlocks {
  StandardPage(
    where: {
      _metadata: {
        key: {
          eq: "your-page-key"
        }
      }
    }
  ) {
    items {
      Title
      MainContentArea {
        ... on HeroBlock {
          Heading
          SubHeading
          BackgroundImage { url }
        }
        ... on TextBlock {
          Content
        }
        ... on ImageBlock {
          Image { url alt }
          Caption
        }
      }
    }
  }
}
```

## Filter by Date Range

Fetch content within a date range:

```graphql
query GetContentByDateRange($startDate: DateTime!, $endDate: DateTime!) {
  Content(
    where: {
      _metadata: {
        published: {
          gte: $startDate
          lte: $endDate
        }
      }
    }
  ) {
    items {
      _metadata {
        key
        displayName
        published
      }
    }
  }
}
```

## Multiple Filters

Combine multiple filter conditions:

```graphql
query GetFilteredContent {
  Content(
    where: {
      _and: [
        {
          _metadata: {
            types: {
              in: ["ArticlePage"]
            }
          }
        },
        {
          _metadata: {
            published: {
              gte: "2024-01-01T00:00:00Z"
            }
          }
        },
        {
          _fulltext: {
            contains: "optimizely"
          }
        }
      ]
    }
  ) {
    items {
      _metadata {
        key
        displayName
      }
    }
  }
}
```

## Content References

Fetch content with references:

```graphql
query GetPageWithReferences {
  StandardPage {
    items {
      Title
      RelatedPages {
        ... on StandardPage {
          _metadata {
            key
            url { default }
          }
          Title
          Summary
        }
      }
    }
  }
}
```

## Using Variables

Example of using query variables in your data file:

```javascript
const graphqlClient = require('./graphql-client');

module.exports = async function() {
  const query = `
    query GetContent($type: [String!], $limit: Int) {
      Content(
        where: {
          _metadata: {
            types: { in: $type }
          }
        }
        limit: $limit
      ) {
        items {
          _metadata { key displayName }
        }
      }
    }
  `;

  const variables = {
    type: ["ArticlePage", "BlogPost"],
    limit: 10
  };

  const data = await graphqlClient.query(query, variables);
  return data.Content?.items || [];
};
```

## Facets and Aggregations

Get faceted results:

```graphql
query GetContentWithFacets {
  Content {
    items {
      _metadata {
        key
        displayName
      }
    }
    facets {
      _metadata {
        types {
          name
          count
        }
      }
    }
  }
}
```

## Tips

1. **Use Fragments** for reusable field selections
2. **Limit Fields** to only what you need to reduce payload size
3. **Use Variables** for dynamic queries
4. **Enable Highlighting** for search results
5. **Paginate** large result sets using `limit` and `skip`
6. **Cache Results** during build time (11ty does this automatically)

## Testing Queries

You can test these queries in:

1. **GraphQL Playground**: Available in Optimizely CMS admin
2. **Postman**: Import GraphQL collections
3. **GraphiQL**: Use the standalone tool

## Documentation

For more information, see:
- [Optimizely Content Graph Query Documentation](https://docs.developers.optimizely.com/content-cloud/v1.5.0-content-graph/docs/query-content)
- [GraphQL Best Practices](https://graphql.org/learn/best-practices/)
