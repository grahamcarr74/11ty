import { readableDate, truncate, Article, Page } from './_includes/helpers';

interface IndexData {
  articles: Article[];
  pages: Page[];
}

export const data = {
  layout: "base.11ty.ts",
  title: "Home - Optimizely + 11ty POC"
};

export function render({ articles, pages }: IndexData): string {
  const recentArticles = articles.slice(0, 3);

  const articlesSection = articles.length > 0
    ? `<div class="article-grid">
        ${recentArticles.map(article => `
          <article class="card">
            <h3>${article.Title || article.Heading || article._metadata.displayName}</h3>
            <p class="meta">Published: ${readableDate(article._metadata.published)}</p>
            ${article.Summary
              ? `<p>${article.Summary}</p>`
              : article.MainBody
                ? `<p>${truncate(article.MainBody, 150)}</p>`
                : ''}
            ${article._metadata.url.default
              ? `<a href="${article._metadata.url.default}" class="read-more">Read more →</a>`
              : ''}
          </article>
        `).join('')}
      </div>
      <p><a href="/articles/" class="btn">View All Articles →</a></p>`
    : `<p>No articles found. Configure your Optimizely Content Graph credentials to fetch content.</p>`;

  const pagesSection = pages.length > 0
    ? `<ul class="page-list">
        ${pages.map(page => `
          <li>
            <strong>${page.Title || page.Heading || page._metadata.displayName}</strong>
            ${page._metadata.url.default
              ? ` - <a href="${page._metadata.url.default}">${page._metadata.url.default}</a>`
              : ''}
            <br>
            <small>Last modified: ${readableDate(page._metadata.lastModified)}</small>
          </li>
        `).join('')}
      </ul>
      <p><a href="/pages/" class="btn">View All Pages →</a></p>`
    : `<p>No pages found. Configure your Optimizely Content Graph credentials to fetch content.</p>`;

  return `
<div class="hero">
  <h1>Optimizely Content Graph + 11ty</h1>
  <p>This is a proof of concept demonstrating how to use 11ty to build a static site with content from Optimizely SaaS CMS using Content Graph.</p>
</div>

<section class="content-section">
  <h2>Recent Articles</h2>
  ${articlesSection}
</section>

<section class="content-section">
  <h2>Pages</h2>
  ${pagesSection}
</section>
`;
}
