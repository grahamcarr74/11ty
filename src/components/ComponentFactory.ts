import { BlankExperienceTemplate } from './templates/BlankExperienceTemplate';
import { ButtonBlock } from './atoms/ButtonBlock';
import { readableDate } from '../_includes/helpers';

export interface ContentItem {
    __typename?: string;
    _metadata: {
        key: string;
        types?: string[];
        displayName: string;
        lastModified?: string;
        url?: {
            default: string;
        };
    };
    Title?: string;
    Heading?: string;
    MainBody?: string;
    // ButtonBlock specific fields
    Text?: string;
    Url?: {
        default: string;
    };
    component?: any; // For CompositionComponentNode
    [key: string]: any;
}

export function ComponentFactory(content: ContentItem): string {
    // Handle CompositionComponentNode wrapper
    if (content.component) {
        return ComponentFactory(content.component);
    }

    const types = content._metadata?.types || [];
    const typename = content.__typename || '';

    // Basic mapping logic
    if (types.includes('BlankExperience') || typename === 'BlankExperience') {
        return BlankExperienceTemplate({
            title: content.Title || content.Heading || content._metadata.displayName,
            types: types,
            lastModified: readableDate(content._metadata.lastModified || ''),
            key: content._metadata.key,
            composition: content.composition,
            editable: {
                title: 'Title'
            }
        });
    }

    if (typename === 'ButtonBlock') {
        return ButtonBlock({
            text: content.Text || '',
            url: content.Url?.default || '#',
            key: content._metadata.key,
            displayName: content._metadata.displayName
        });
    }

    // Fallback for unknown types
    return `
    <div class="unknown-component" data-epi-block-id="${content._metadata?.key}">
      <h3>${content.Title || content._metadata?.displayName || 'Unknown'}</h3>
      <p>Unknown component type: ${typename}</p>
      <!-- <pre>${JSON.stringify(content, null, 2)}</pre> -->
    </div>
  `;
}
