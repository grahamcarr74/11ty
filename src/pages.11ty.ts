import { readableDate, Page } from './_includes/helpers';

interface PagesData {
  pages: Page[];
}

export const data = {
  layout: "base.11ty.ts",
  title: "All Pages"
};

export function render({ pages }: PagesData): string {
  const pagesList = pages.length > 0
    ? `<div class="page-grid">
        ${pages.map(page => `
          <article class="card">
            <h2>${page.Title || page.Heading || page._metadata.displayName}</h2>
            <p class="meta">
              Type: ${page._metadata.types.join(", ")}<br>
              Published: ${readableDate(page._metadata.published)}<br>
              Last Modified: ${readableDate(page._metadata.lastModified)}
            </p>
            ${page.MainBody ? `<div class="content">${page.MainBody}</div>` : ''}
            ${page._metadata.url.default
              ? `<p><strong>URL:</strong> <a href="${page._metadata.url.default}">${page._metadata.url.default}</a></p>`
              : ''}
          </article>
        `).join('')}
      </div>`
    : `<p>No pages found. Make sure your Optimizely Content Graph is configured properly.</p>`;

  return `
<h1>All Pages</h1>

${pagesList}

<p><a href="/" class="btn">← Back to Home</a></p>
`;
}
