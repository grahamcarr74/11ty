import { readableDate, Article } from './_includes/helpers';

interface ArticlesData {
  articles: Article[];
}

export const data = {
  layout: "base.11ty.ts",
  title: "All Articles"
};

export function render({ articles }: ArticlesData): string {
  const articlesList = articles.length > 0
    ? `<div class="article-list">
        ${articles.map(article => `
          <article class="card article-item">
            <h2>${article.Title || article.Heading || article._metadata.displayName}</h2>
            <p class="meta">
              ${article.Author ? `By ${article.Author} | ` : ''}
              Published: ${readableDate(article._metadata.published)}
            </p>
            ${article.Summary ? `<p class="summary">${article.Summary}</p>` : ''}
            ${article.MainBody ? `<div class="content">${article.MainBody}</div>` : ''}
            ${article._metadata.url.default
              ? `<p><a href="${article._metadata.url.default}" class="read-more">View on site →</a></p>`
              : ''}
          </article>
        `).join('')}
      </div>`
    : `<p>No articles found. Make sure your Optimizely Content Graph is configured properly.</p>`;

  return `
<h1>All Articles</h1>

${articlesList}

<p><a href="/" class="btn">← Back to Home</a></p>
`;
}
