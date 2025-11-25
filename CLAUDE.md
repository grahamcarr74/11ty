# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build Commands

```bash
npm install          # Install dependencies
npm start            # Combined server (preview + 11ty) at http://localhost:8080
npm run build        # Build static site to _site/
npm run preview      # Preview server only at http://localhost:3001
npm run dev:11ty     # 11ty dev server only
npx tsc --noEmit     # Type-check TypeScript without emitting
```

## Architecture

This is an 11ty static site generator using TypeScript templates that fetches content from Optimizely Content Graph (GraphQL API).

### Data Flow

1. **Data files** (`src/_data/*.js`) execute GraphQL queries at build time via `graphql-client.js`
2. **Global data** from these files becomes available to all templates (e.g., `articles.js` → `articles` variable)
3. **TypeScript templates** (`*.11ty.ts`) render the data using template literals
4. **Layout template** (`src/_includes/base.11ty.ts`) wraps all pages

### TypeScript Template Pattern

Templates use 11ty's JavaScript template format with TypeScript:

```typescript
export const data = {
  layout: "base.11ty.ts",
  title: "Page Title"
};

export function render(data: DataType): string {
  return `<html>...</html>`;
}
```

The `tsx` package handles TypeScript compilation at runtime via the npm scripts.

### Key Files

- `.eleventy.js` - 11ty config, registers `.11ty.ts` extension
- `src/_data/graphql-client.js` - Optimizely Content Graph client with mock data fallback
- `src/_includes/helpers.ts` - Shared TypeScript interfaces (`Article`, `Page`) and helper functions

### Preview Server

The preview server (`src/preview/`) enables editors to see draft content in real-time:

- `server.ts` - Express server with preview routes
- `graphql-client-preview.ts` - HMAC-authenticated client for draft content
- `renderer.ts` - Reuses 11ty templates for server-side rendering

Preview routes:
- `GET /preview/:contentKey` - Preview by Optimizely content key
- `GET /preview-url/*` - Preview by URL path

Configure in Optimizely CMS: Set preview URL to `https://your-domain/preview/{content_key}`

### Environment Variables

Required in `.env` for real data (falls back to mock data if missing):
- `OPTIMIZELY_GRAPH_GATEWAY`
- `OPTIMIZELY_GRAPH_SINGLE_KEY`

Required for preview mode (HMAC auth for draft content):
- `OPTIMIZELY_GRAPH_APP_KEY`
- `OPTIMIZELY_GRAPH_SECRET`
