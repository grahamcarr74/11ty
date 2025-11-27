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

This is an 11ty static site generator using TypeScript templates that fetches content from Optimizely Content Graph via the `@optimizely/cms-sdk`.

### Data Flow

1. **Content types** (`src/models/*.ts`) define the schema using the SDK's `contentType()` builder
2. **Routes data** (`src/_data/routes.js`) queries Optimizely Graph for all content with URLs
3. **Dynamic pages** (`src/pages.11ty.ts`) uses 11ty pagination to generate one page per route
4. **Component Factory** (`src/components/ComponentFactory.ts`) renders content items based on `__typename`
5. **Layout template** (`src/_includes/base.11ty.ts`) wraps all pages

### Content Type Definitions

Content types are defined in `src/models/` using the SDK's builder pattern:

```typescript
import { contentType } from '@optimizely/cms-sdk';

export const ButtonBlock = contentType({
    key: 'ButtonBlock',
    baseType: '_block',
    displayName: 'Button Block',
    properties: {
        Text: { type: 'string', displayName: 'Text' },
        Url: { type: 'url', displayName: 'Url' }
    }
});
```

The SDK discovers models via `optimizely.config.mjs`.

### Component Factory Pattern

The `ComponentFactory` (`src/components/ComponentFactory.ts`) dispatches rendering based on content type:

- Unwraps `CompositionComponentNode` wrappers from Visual Builder
- Routes to type-specific components (e.g., ButtonBlock → `atoms/ButtonBlock.ts`)
- Adds edit attributes (`data-epi-block-id`, `data-epi-edit`) in edit mode
- Provides fallback rendering for unknown types

### Component Hierarchy (Atomic Design)

```
src/components/
├── atoms/
│   └── ButtonBlock.ts          # Individual content blocks
├── molecules/
│   ├── Section.ts              # Contains rows
│   ├── Row.ts                  # Contains columns
│   └── Column.ts               # Contains elements (via ComponentFactory)
├── organisms/
│   ├── Header.ts               # Site navigation
│   └── Footer.ts               # Site footer
└── templates/
    └── BlankExperienceTemplate.ts  # Page layout for Visual Builder experiences
```

**Rendering chain for Visual Builder content:**
```
BlankExperienceTemplate → Sections → Rows → Columns → ComponentFactory → Atoms
```

### Key Files

- `.eleventy.js` - 11ty config, registers `.11ty.ts` extension
- `optimizely.config.mjs` - SDK configuration, specifies model locations
- `src/_data/routes.js` - Fetches all routable content from Optimizely Graph
- `src/pages.11ty.ts` - Dynamic page generation via pagination
- `src/components/ComponentFactory.ts` - Central rendering dispatcher
- `src/utils/queryBuilder.ts` - Generates GraphQL fragments from content type models
- `src/_includes/helpers.ts` - Shared TypeScript interfaces and helper functions

### Preview Server

The preview server (`src/preview/`) enables editors to see draft content in real-time:

- `server.ts` - Express server with preview routes
- `graphql-client-preview.ts` - HMAC-authenticated client for draft content
- `renderer.ts` - Preview rendering with context mode support

**Preview routes:**
- `GET /preview?key={contentKey}` - Preview by content key
- `GET /preview?url={path}` - Preview by URL path
- `GET /preview/:contentKey` - Preview by URL parameter
- `GET /preview-url/*` - Preview by URL path (alternative)
- `GET /preview/api/content` - API endpoint for AJAX content updates

**Context modes** (set via `?ctx=edit` or `?ctx=preview`):
- `edit` - Shows `data-epi-block-id` and `data-epi-edit` attributes for Visual Builder
- `preview` - Hides edit attributes

**Features:**
- Real-time content refresh via AJAX (listens for `optimizely:cms:contentSaved` events)
- Preview token handling for draft content
- Debounced 11ty rebuilds on content publish webhook

Configure in Optimizely CMS: Set preview URL to `https://your-domain/preview/{content_key}`

### Combined Server

The root `server.ts` runs both preview and 11ty servers:
- Main server on port 8080
- 11ty dev server spawned on port 8081
- Proxy middleware routes non-preview requests to 11ty
- Webhook endpoint at `/webhook/content-published` triggers rebuilds

### Environment Variables

Required in `.env` for real data (falls back to mock data if missing):
- `OPTIMIZELY_GRAPH_GATEWAY` - Graph endpoint (defaults to cg.optimizely.com)
- `OPTIMIZELY_GRAPH_SINGLE_KEY` - API key for build-time queries

Required for preview mode (HMAC auth for draft content):
- `OPTIMIZELY_GRAPH_APP_KEY`
- `OPTIMIZELY_GRAPH_SECRET`

Optional:
- `OPTIMIZELY_CMS_URL` - For injecting CMS communication scripts
- `WEBHOOK_SECRET` - Validation token for publish webhooks
