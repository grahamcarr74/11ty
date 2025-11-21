# 11ty + Optimizely Content Graph POC

This is a proof of concept demonstrating how to use [11ty](https://www.11ty.dev/) (Eleventy) as a static site generator with content from [Optimizely SaaS CMS](https://www.optimizely.com/) using Content Graph (GraphQL API).

## Features

- Static site generation with 11ty
- Content fetching from Optimizely Content Graph via GraphQL
- Responsive design with modern CSS
- Mock data fallback for development without Content Graph access
- Example queries for pages and articles

## Prerequisites

- Node.js 16.x or higher
- npm or yarn
- Optimizely SaaS CMS account with Content Graph access (optional for demo)

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Copy the `.env.example` file to `.env`:

```bash
cp .env.example .env
```

Edit the `.env` file with your Optimizely Content Graph credentials:

```env
OPTIMIZELY_GRAPH_GATEWAY=https://cg.optimizely.com/content/v2
OPTIMIZELY_GRAPH_SINGLE_KEY=your_single_key_here
OPTIMIZELY_GRAPH_APP_KEY=your_app_key_here
OPTIMIZELY_GRAPH_SECRET=your_secret_here
```

#### Getting Your Credentials

1. Log in to your Optimizely CMS admin panel
2. Navigate to **Settings** → **API Clients** → **Content Graph**
3. Create a new API client or use an existing one
4. Copy the **Single Key** or **App Key** and **Secret**

### 3. Run Development Server

```bash
npm start
```

The site will be available at `http://localhost:8080`

### 4. Build for Production

```bash
npm run build
```

The static files will be generated in the `_site` directory.

## Project Structure

```
11ty-optimizely-contentgraph-poc/
├── src/
│   ├── _data/              # Data files (GraphQL queries)
│   │   ├── graphql-client.js  # GraphQL client
│   │   ├── pages.js           # Fetch pages
│   │   └── articles.js        # Fetch articles
│   ├── _includes/          # Layout templates
│   │   └── base.njk           # Base layout
│   ├── css/                # Stylesheets
│   │   └── style.css
│   ├── index.njk           # Homepage
│   ├── pages.njk           # Pages listing
│   └── articles.njk        # Articles listing
├── .eleventy.js            # 11ty configuration
├── .env.example            # Example environment variables
├── .gitignore
├── package.json
└── README.md
```

## How It Works

### Data Fetching

11ty uses "global data files" in the `src/_data/` directory to fetch data at build time. Each JavaScript file in this directory becomes available as a global variable in templates.

**Example: `src/_data/articles.js`**

```javascript
module.exports = async function() {
  const data = await graphqlClient.query(query);
  return data.Content?.items || [];
};
```

This data is then accessible in templates as `{{ articles }}`.

### GraphQL Queries

The POC includes example queries for:

- **Pages**: Fetches Standard Pages, Landing Pages, etc.
- **Articles**: Fetches Article Pages, Blog Posts, etc.

You can customize these queries in `src/_data/pages.js` and `src/_data/articles.js` to match your content types.

### Templates

Templates use Nunjucks (`.njk`) syntax to render the content:

```njk
{% for article in articles %}
  <h2>{{ article.Title }}</h2>
  <p>{{ article.Summary }}</p>
{% endfor %}
```

## Customization

### Adding New Content Types

1. Create a new data file in `src/_data/`, e.g., `products.js`
2. Write a GraphQL query to fetch your content type
3. Create a template in `src/` to display the data

**Example: `src/_data/products.js`**

```javascript
const graphqlClient = require('./graphql-client');

module.exports = async function() {
  const query = `
    query GetProducts {
      Content(
        where: {
          _metadata: { types: { in: ["ProductPage"] } }
        }
      ) {
        items {
          _metadata { key displayName url { default } }
          Name
          Price
          Description
        }
      }
    }
  `;

  const data = await graphqlClient.query(query);
  return data.Content?.items || [];
};
```

### Modifying Queries

Edit the GraphQL queries in `src/_data/*.js` to:

- Filter content by specific criteria
- Fetch different properties
- Change sort order
- Adjust the number of items fetched

### Styling

Modify `src/css/style.css` to customize the appearance of your site.

## Content Graph API

### Authentication

The POC uses Single Key authentication for simplicity. For production, consider:

- App Key + Secret authentication with token refresh
- Implementing proper credential management
- Using different keys for different environments

### Query Examples

Refer to the [Optimizely Content Graph documentation](https://docs.developers.optimizely.com/content-cloud/v1.5.0-content-graph/docs/query-content) for more advanced query examples.

## Mock Data

If Content Graph credentials are not configured, the application will use mock data. This allows you to:

- Develop and test the site structure
- See the layout and design
- Test template logic

To use real data, configure your `.env` file with valid credentials.

## Deployment

Since 11ty generates static HTML, you can deploy to any static hosting service:

- **Vercel**: `vercel deploy`
- **Netlify**: Connect your Git repository
- **Azure Static Web Apps**: Use Azure CLI or GitHub Actions
- **AWS S3 + CloudFront**: Upload `_site` folder

Make sure to configure your environment variables in your hosting provider's settings.

## Troubleshooting

### No Content Appears

1. Check your `.env` file has correct credentials
2. Verify your Content Graph API key has proper permissions
3. Check the browser console for GraphQL errors
4. Ensure your content types match the query filters

### Build Errors

1. Ensure Node.js version is 16.x or higher
2. Delete `node_modules` and run `npm install` again
3. Check for syntax errors in custom data files

## Resources

- [11ty Documentation](https://www.11ty.dev/docs/)
- [Optimizely Content Graph Documentation](https://docs.developers.optimizely.com/content-cloud/v1.5.0-content-graph/)
- [Nunjucks Templating](https://mozilla.github.io/nunjucks/templating.html)
- [GraphQL Documentation](https://graphql.org/learn/)

## License

MIT
