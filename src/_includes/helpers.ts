export function readableDate(dateObj: string | Date): string {
  return new Date(dateObj).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

export function truncate(str: string, length: number): string {
  if (!str) return '';
  if (str.length <= length) return str;
  return str.substring(0, length) + '...';
}

export interface ArticleMetadata {
  displayName: string;
  published: string;
  url: {
    default?: string;
  };
}

export interface Article {
  Title?: string;
  Heading?: string;
  Summary?: string;
  MainBody?: string;
  Author?: string;
  _metadata: ArticleMetadata;
}

export interface PageMetadata {
  displayName: string;
  published: string;
  lastModified: string;
  types: string[];
  url: {
    default?: string;
  };
}

export interface Page {
  Title?: string;
  Heading?: string;
  MainBody?: string;
  _metadata: PageMetadata;
}
