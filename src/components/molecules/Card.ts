import { Heading } from '../atoms/Typography';
import { Button } from '../atoms/Button';
import { readableDate, truncate } from '../../_includes/helpers';

export interface CardProps {
    title: string;
    summary?: string;
    mainBody?: string;
    published?: string;
    url?: string;
    author?: string;
    className?: string;
    editable?: {
        blockId?: string;
        title?: string;
        summary?: string;
        mainBody?: string;
        author?: string;
    };
}

export function Card({ title, summary, mainBody, published, url, author, className = 'card', editable = {} }: CardProps): string {
    const blockIdAttr = editable.blockId ? `data-epi-block-id="${editable.blockId}"` : '';
    const titleEdit = editable.title ? `data-epi-edit="${editable.title}"` : '';
    const summaryEdit = editable.summary ? `data-epi-edit="${editable.summary}"` : '';
    const mainBodyEdit = editable.mainBody ? `data-epi-edit="${editable.mainBody}"` : '';
    const authorEdit = editable.author ? `data-epi-edit="${editable.author}"` : '';

    const metaContent = [
        author ? `<span ${authorEdit}>By ${author}</span>` : '',
        published ? `Published: ${readableDate(published)}` : ''
    ].filter(Boolean).join(' | ');

    const content = summary
        ? `<p class="summary" ${summaryEdit}>${summary}</p>`
        : mainBody
            ? `<div class="content" ${mainBodyEdit}>${truncate(mainBody, 150)}</div>`
            : '';

    const button = url
        ? Button({ text: 'Read more →', href: url, className: 'read-more' })
        : '';

    return `
    <article class="${className}" ${blockIdAttr}>
      ${Heading({ level: 3, text: title, editable: titleEdit })}
      ${metaContent ? `<p class="meta">${metaContent}</p>` : ''}
      ${content}
      ${button}
    </article>
  `;
}
