import { BlankExperienceTemplate } from './templates/BlankExperienceTemplate';
import { readableDate } from '../_includes/helpers';

export interface ContentItem {
    __typename?: string;
    _metadata: {
        key: string;
        types: string[];
        displayName: string;
        lastModified: string;
        url: {
            default: string;
        };
    };
    Title?: string;
    Heading?: string;
    MainBody?: string;
    [key: string]: any;
}

export function ComponentFactory(content: ContentItem): string {
    const types = content._metadata.types || [];
    const typename = content.__typename || '';

    // Basic mapping logic
    if (types.includes('BlankExperience') || typename === 'BlankExperience') {
        return BlankExperienceTemplate({
            title: content.Title || content.Heading || content._metadata.displayName,
            types: types,
            lastModified: readableDate(content._metadata.lastModified),
            key: content._metadata.key,
            editable: {
                title: 'Title'
            }
        });
    }

    // Fallback for unknown types
    return `
    <div class="unknown-component" data-epi-block-id="${content._metadata.key}">
      <h1>${content.Title || content._metadata.displayName}</h1>
      <p>Unknown component type: ${typename}</p>
      <pre>${JSON.stringify(content, null, 2)}</pre>
    </div>
  `;
}
