import { render as renderBase } from '../_includes/base.11ty';
import { readableDate, truncate } from '../_includes/helpers';
import type { ContentItem } from './graphql-client-preview';

// Context mode for Visual Builder - only render edit attributes in 'edit' mode
let currentContextMode: 'edit' | 'preview' | null = null;

export function setContextMode(mode: 'edit' | 'preview' | null): void {
  currentContextMode = mode;
}

export function getContextMode(): 'edit' | 'preview' | null {
  return currentContextMode;
}

// Helper to render data-epi-block-id attribute (only in edit mode)
export function epiBlockId(key: string): string {
  if (currentContextMode !== 'edit') return '';
  return `data-epi-block-id="${key}"`;
}

// Helper to render data-epi-edit attribute (only in edit mode)
export function epiEdit(propertyName: string): string {
  if (currentContextMode !== 'edit') return '';
  return `data-epi-edit="${propertyName}"`;
}

// Combined helper for block with editable property
export function epiEditable(key: string, propertyName: string): string {
  if (currentContextMode !== 'edit') return '';
  return `data-epi-block-id="${key}" data-epi-edit="${propertyName}"`;
}

export function renderArticleContent(article: ContentItem): string {
  const key = article._metadata.key;

  return `
    <article class="card article-item" ${epiBlockId(key)}>
      <h1 ${epiEdit('Title')}>${article.Title || article.Heading || article._metadata.displayName}</h1>
      <p class="meta">
        ${article.Author ? `<span ${epiEdit('Author')}>By ${article.Author}</span> | ` : ''}
        Published: ${readableDate(article._metadata.published)}
      </p>
      ${article.Summary ? `<p class="summary" ${epiEdit('Summary')}>${article.Summary}</p>` : ''}
      ${article.MainBody ? `<div class="content" ${epiEdit('MainBody')}>${article.MainBody}</div>` : ''}
    </article>
    <p><a href="/" class="btn">← Back to Home</a></p>
  `;
}

export function renderArticle(article: ContentItem): string {
  const content = renderArticleContent(article);

  return renderBase({
    title: `${article.Title || article._metadata.displayName} - Preview`,
    content,
  });
}

export function renderPageContent(page: ContentItem): string {
  const key = page._metadata.key;

  return `
    <article class="card" ${epiBlockId(key)}>
      <h1 ${epiEdit('Title')}>${page.Title || page.Heading || page._metadata.displayName}</h1>
      <p class="meta">
        Type: ${page._metadata.types.join(', ')}<br>
        Last Modified: ${readableDate(page._metadata.lastModified)}
      </p>
      ${page.MainBody ? `<div class="content" ${epiEdit('MainBody')}>${page.MainBody}</div>` : ''}
    </article>
    <p><a href="/" class="btn">← Back to Home</a></p>
  `;
}

export function renderPage(page: ContentItem): string {
  const content = renderPageContent(page);

  return renderBase({
    title: `${page.Title || page._metadata.displayName} - Preview`,
    content,
  });
}

export function renderPreviewBanner(): string {
  const cmsUrl = process.env.OPTIMIZELY_CMS_URL || '';

  return `
    ${cmsUrl ? `<script src="${cmsUrl}/util/javascript/communicationinjector.js"></script>` : '<!-- OPTIMIZELY_CMS_URL not configured -->'}
    <style>
      .preview-banner {
        background: linear-gradient(90deg, #f59e0b, #d97706);
        color: white;
        padding: 8px 16px;
        text-align: center;
        font-weight: 600;
        font-size: 14px;
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        z-index: 9999;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      }
      .preview-banner + header { margin-top: 40px; }
      body { padding-top: 40px; }
    </style>
    <div class="preview-banner">
      PREVIEW MODE - This content is not yet published
    </div>
    <script>
      // Refresh content via AJAX without full page reload
      async function refreshContent(newPreviewToken) {
        const currentParams = new URLSearchParams(window.location.search);
        const key = currentParams.get('key');
        const url = currentParams.get('url') || currentParams.get('path');
        const ctx = currentParams.get('ctx');

        // Build API URL
        const apiUrl = new URL('/preview/api/content', window.location.origin);
        if (key) apiUrl.searchParams.set('key', key);
        if (url) apiUrl.searchParams.set('url', url);
        if (newPreviewToken) apiUrl.searchParams.set('preview_token', newPreviewToken);
        if (ctx) apiUrl.searchParams.set('ctx', ctx);

        try {
          console.log('[Preview] Fetching updated content...');
          const response = await fetch(apiUrl.toString());

          if (!response.ok) {
            throw new Error('Failed to fetch content: ' + response.status);
          }

          const data = await response.json();
          console.log('[Preview] Content updated, version:', data.metadata?.version);

          // Update the content container without full page reload
          const container = document.getElementById('preview-content');
          if (container && data.html) {
            container.innerHTML = data.html;

            // Update browser URL with new token (without reload)
            if (newPreviewToken) {
              const newUrl = new URL(window.location.href);
              newUrl.searchParams.set('preview_token', newPreviewToken);
              window.history.replaceState({}, '', newUrl.toString());
            }
          }
        } catch (error) {
          console.error('[Preview] Error refreshing content:', error);
          // Fall back to full page reload on error
          if (newPreviewToken) {
            const currentUrl = new URL(window.location.href);
            currentUrl.searchParams.set('preview_token', newPreviewToken);
            window.location.href = currentUrl.toString();
          }
        }
      }

      // Listen for contentSaved events from Optimizely CMS
      // This event fires when content is saved and indexed in Optimizely Graph
      window.addEventListener('optimizely:cms:contentSaved', function(event) {
        console.log('[Preview] Content saved event received:', event.detail);

        const message = event.detail;
        if (message && message.previewUrl) {
          // Extract new preview token from the previewUrl
          // The token has a short lifetime so we must use the fresh one
          const urlParams = new URLSearchParams(message.previewUrl);
          const newPreviewToken = urlParams.get('preview_token');

          if (newPreviewToken) {
            // Refresh content via AJAX (no full page reload)
            refreshContent(newPreviewToken);
          }
        }
      });

      // Also listen for generic postMessage as fallback
      window.addEventListener('message', function(event) {
        if (event.data && typeof event.data === 'object' && event.data.previewUrl) {
          console.log('[Preview] PostMessage received with previewUrl');
          const urlParams = new URLSearchParams(event.data.previewUrl);
          const newPreviewToken = urlParams.get('preview_token');

          if (newPreviewToken) {
            refreshContent(newPreviewToken);
          }
        }
      });

      console.log('[Preview] Listening for CMS content changes...');
    </script>
  `;
}

// Render just the content fragment (for AJAX updates without full page refresh)
export function renderContentFragment(item: ContentItem): string {
  const types = item._metadata.types || [];

  if (types.includes('BlogPostPage')) {
    return renderArticleContent(item);
  } else {
    return renderPageContent(item);
  }
}

export function renderContent(item: ContentItem): string {
  const types = item._metadata.types || [];
  const contentFragment = renderContentFragment(item);

  // Wrap content in a container div for AJAX updates
  const content = `<div id="preview-content">${contentFragment}</div>`;

  let html: string;
  if (types.includes('BlogPostPage')) {
    html = renderBase({
      title: `${item.Title || item._metadata.displayName} - Preview`,
      content,
    });
  } else {
    html = renderBase({
      title: `${item.Title || item._metadata.displayName} - Preview`,
      content,
    });
  }

  // Inject preview banner after opening body tag
  return html.replace('<body>', '<body>' + renderPreviewBanner());
}

export function renderError(message: string, details?: string): string {
  const content = `
    <div class="error-container" style="text-align: center; padding: 60px 20px;">
      <h1 style="color: #dc2626;">Preview Error</h1>
      <p style="font-size: 18px; color: #666;">${message}</p>
      ${details ? `<pre style="background: #f3f4f6; padding: 20px; border-radius: 8px; text-align: left; overflow-x: auto;"><code>${details}</code></pre>` : ''}
      <p><a href="/" class="btn">← Back to Home</a></p>
    </div>
  `;

  return renderBase({
    title: 'Preview Error',
    content,
  });
}

export function renderNotFound(contentKey: string): string {
  return renderError(
    'Content Not Found',
    `No content found with key: ${contentKey}\n\nMake sure the content exists and you have the correct key.`
  );
}

export function renderConfigError(): string {
  return renderError(
    'Preview Not Configured',
    `Preview requires HMAC authentication.\n\nPlease configure the following environment variables:\n- OPTIMIZELY_GRAPH_APP_KEY\n- OPTIMIZELY_GRAPH_SECRET`
  );
}
