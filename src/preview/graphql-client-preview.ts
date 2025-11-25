import https from 'https';
// @ts-ignore
import fetch from 'node-fetch';

interface GraphQLResponse<T = any> {
  data?: T;
  errors?: Array<{ message: string }>;
}

interface ContentItem {
  _metadata: {
    key: string;
    displayName: string;
    types: string[];
    published: string;
    lastModified: string;
    url: {
      default?: string;
    };
  };
  [key: string]: any;
}

interface ContentQueryResult {
  Content?: {
    items: ContentItem[];
    total: number;
  };
}

class OptimizelyPreviewClient {
  private gateway: string;
  private appKey: string;
  private secret: string;

  constructor() {
    this.gateway = process.env.OPTIMIZELY_GRAPH_GATEWAY || '';
    this.appKey = process.env.OPTIMIZELY_GRAPH_APP_KEY || '';
    this.secret = process.env.OPTIMIZELY_GRAPH_SECRET || '';
  }

  // Store the preview token for the current request
  private previewToken: string | null = null;

  setPreviewToken(token: string | null): void {
    this.previewToken = token;
  }

  async queryDraft<T = any>(graphqlQuery: string, variables: Record<string, any> = {}): Promise<T | null> {
    if (!this.gateway) {
      console.warn('Preview gateway not configured.');
      return null;
    }

    // Determine auth method:
    // 1. If preview_token is provided (from CMS iframe), use Bearer token
    // 2. Otherwise, fall back to Basic auth with app key/secret
    let authHeader: string;

    if (this.previewToken) {
      // Use preview token from CMS (JWT token for draft content)
      authHeader = `Bearer ${this.previewToken}`;
      // Log first and last 10 chars of token for debugging
      const tokenPreview = this.previewToken.length > 20
        ? `${this.previewToken.substring(0, 10)}...${this.previewToken.substring(this.previewToken.length - 10)}`
        : this.previewToken;
      console.log('[Preview] Using preview_token:', tokenPreview);
    } else if (this.appKey && this.secret) {
      // Fall back to Basic auth (only returns published content)
      authHeader = 'Basic ' + Buffer.from(`${this.appKey}:${this.secret}`).toString('base64');
      console.log('[Preview] Using Basic auth (published content only)');
    } else {
      console.warn('Preview credentials not configured. Requires preview_token or OPTIMIZELY_GRAPH_APP_KEY and OPTIMIZELY_GRAPH_SECRET.');
      return null;
    }

    try {
      // Add cache-busting parameters to get fresh content
      const url = new URL(this.gateway);
      url.searchParams.set('cache', 'false');
      url.searchParams.set('t', Date.now().toString());  // Unique timestamp per request

      console.log('[Preview] Fetching from:', url.toString());
      console.log('[Preview] Auth method:', this.previewToken ? 'Bearer token' : 'Basic auth');
      console.log('[Preview] Variables:', JSON.stringify(variables));

      // Create a fresh HTTPS agent for each request to prevent connection reuse/caching
      const agent = new https.Agent({
        keepAlive: false,
        maxSockets: 1,
      });

      const response = await fetch(url.toString(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authHeader,
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'X-Request-Id': `${Date.now()}-${Math.random().toString(36).substring(7)}`,
        },
        body: JSON.stringify({
          query: graphqlQuery,
          variables,
        }),
        agent,
        timeout: 30000,
      });

      console.log('[Preview] HTTP Status:', response.status, response.statusText);

      const responseText = await response.text();
      console.log('[Preview] Response:', responseText.substring(0, 1000));

      if (!response.ok) {
        return null;
      }

      const result = JSON.parse(responseText) as GraphQLResponse<T>;

      if (result.errors) {
        console.error('[Preview] GraphQL Errors:', result.errors);
        return null;
      }

      return result.data || null;
    } catch (error) {
      console.error('[Preview] Error fetching content:', error);
      return null;
    }
  }

  async getContentByKey(contentKey: string): Promise<ContentItem | null> {
    // Query for content by key - preview_token handles draft version access
    const query = `
      query GetContentByKey($key: String!) {
        _Content(
          where: { _metadata: { key: { eq: $key } } }
          limit: 10
        ) {
          items {
            __typename
            _metadata {
              key
              displayName
              types
              published
              lastModified
              version
              url {
                default
              }
            }
          }
          total
        }
      }
    `;

    interface ContentResult {
      _Content?: {
        items: ContentItem[];
        total: number;
      };
    }

    const data = await this.queryDraft<ContentResult>(query, { key: contentKey });
    const items = data?._Content?.items || [];

    // Log all returned versions for debugging
    if (items.length > 0) {
      console.log('[Preview] Versions returned:', items.map(i => ({
        version: i._metadata?.version,
        lastModified: i._metadata?.lastModified,
      })));
    }

    // Sort by lastModified descending to get the latest version
    const sorted = items.sort((a, b) => {
      const dateA = new Date(a._metadata?.lastModified || 0).getTime();
      const dateB = new Date(b._metadata?.lastModified || 0).getTime();
      return dateB - dateA;
    });

    console.log('[Preview] Selected version:', sorted[0]?._metadata?.version);
    return sorted[0] || null;
  }

  async getContentByUrl(urlPath: string): Promise<ContentItem | null> {
    // Normalize URL - ensure it starts with /
    let normalizedUrl = urlPath.startsWith('/') ? urlPath : '/' + urlPath;

    // Try multiple URL formats
    const urlVariants = [
      normalizedUrl,
      normalizedUrl.endsWith('/') ? normalizedUrl.slice(0, -1) : normalizedUrl + '/',
    ];

    console.log('[Preview] Searching for URL variants:', urlVariants);

    // Generic query that works with any content type
    const query = `
      query GetContentByUrl($urls: [String!]!) {
        _Content(
          where: { _metadata: { url: { default: { in: $urls } } } }
          limit: 10
        ) {
          items {
            __typename
            _metadata {
              key
              displayName
              types
              published
              lastModified
              version
              url {
                default
              }
            }
          }
          total
        }
      }
    `;

    interface ContentResult {
      _Content?: {
        items: ContentItem[];
        total: number;
      };
    }

    const data = await this.queryDraft<ContentResult>(query, { urls: urlVariants });
    const items = data?._Content?.items || [];

    // Log all returned versions for debugging
    if (items.length > 0) {
      console.log('[Preview] Versions returned:', items.map(i => ({
        version: i._metadata?.version,
        lastModified: i._metadata?.lastModified,
        url: i._metadata?.url?.default,
      })));
    }

    // Sort by lastModified descending to get the latest version
    const sorted = items.sort((a, b) => {
      const dateA = new Date(a._metadata?.lastModified || 0).getTime();
      const dateB = new Date(b._metadata?.lastModified || 0).getTime();
      return dateB - dateA;
    });

    console.log('[Preview] Selected version:', sorted[0]?._metadata?.version);
    return sorted[0] || null;
  }

  async listContent(limit: number = 10): Promise<ContentItem[]> {
    // List all content for debugging
    const query = `
      query ListContent($limit: Int!) {
        _Content(limit: $limit) {
          items {
            __typename
            _metadata {
              key
              displayName
              types
              published
              lastModified
              url {
                default
              }
            }
          }
          total
        }
      }
    `;

    interface ContentResult {
      _Content?: {
        items: ContentItem[];
        total: number;
      };
    }

    const data = await this.queryDraft<ContentResult>(query, { limit });
    return data?._Content?.items || [];
  }
}

export const previewClient = new OptimizelyPreviewClient();
export type { ContentItem };
