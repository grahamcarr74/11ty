import { GraphClient } from '@optimizely/cms-sdk';
import { generateBlockFragments } from '../utils/queryBuilder';
import { ButtonBlock } from '../models/ButtonBlock';

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
    version?: string;
  };
  [key: string]: any;
}

class OptimizelyPreviewClient {
  private client: GraphClient;
  private previewToken: string | null = null;
  private blockFragments: string;

  constructor() {
    const singleKey = process.env.OPTIMIZELY_GRAPH_SINGLE_KEY || 'dummy'; // Preview often uses token, but client needs a key
    const gateway = process.env.OPTIMIZELY_GRAPH_GATEWAY || 'https://cg.optimizely.com/content/v2';

    this.client = new GraphClient(singleKey, {
      graphUrl: gateway
    });

    // Generate fragments once
    const models = { ButtonBlock };
    this.blockFragments = generateBlockFragments(models);
  }

  setPreviewToken(token: string | null): void {
    this.previewToken = token;
  }

  async getContentByKey(contentKey: string): Promise<ContentItem | null> {
    const query = `
      ${this.blockFragments}

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
            ... on BlankExperience {
              ..._IExperience
            }
          }
        }
      }
    `;

    try {
      // @ts-ignore - GraphClient request signature allows 3rd arg for preview token
      const data = await this.client.request(query, { key: contentKey }, this.previewToken);
      const items = data?._Content?.items || [];

      // Sort by lastModified descending
      const sorted = items.sort((a: any, b: any) => {
        const dateA = new Date(a._metadata?.lastModified || 0).getTime();
        const dateB = new Date(b._metadata?.lastModified || 0).getTime();
        return dateB - dateA;
      });

      return sorted[0] || null;
    } catch (e) {
      console.error('[Preview] Error fetching content by key:', e);
      return null;
    }
  }

  async getContentByUrl(urlPath: string): Promise<ContentItem | null> {
    let normalizedUrl = urlPath.startsWith('/') ? urlPath : '/' + urlPath;
    const urlVariants = [
      normalizedUrl,
      normalizedUrl.endsWith('/') ? normalizedUrl.slice(0, -1) : normalizedUrl + '/',
    ];

    const query = `
      ${this.blockFragments}

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
            ... on BlankExperience {
              ..._IExperience
            }
          }
        }
      }
    `;

    try {
      // @ts-ignore
      const data = await this.client.request(query, { urls: urlVariants }, this.previewToken);
      const items = data?._Content?.items || [];

      const sorted = items.sort((a: any, b: any) => {
        const dateA = new Date(a._metadata?.lastModified || 0).getTime();
        const dateB = new Date(b._metadata?.lastModified || 0).getTime();
        return dateB - dateA;
      });

      return sorted[0] || null;
    } catch (e) {
      console.error('[Preview] Error fetching content by URL:', e);
      return null;
    }
  }
}

export const previewClient = new OptimizelyPreviewClient();
export type { ContentItem };
