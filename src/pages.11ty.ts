import { ComponentFactory, ContentItem } from './components/ComponentFactory';

interface PagesData {
    routes: ContentItem[];
    page: {
        url: string;
    };
    pagination: {
        items: ContentItem[];
    };
}

export const data = {
    pagination: {
        data: "routes",
        size: 1,
        alias: "contentItem",
        addAllPagesToCollections: true
    },
    layout: "base.11ty.ts",
    permalink: (data: any) => {
        const item = data.pagination.items[0];
        return item._metadata.url.default;
    },
    eleventyComputed: {
        title: (data: any) => {
            const item = data.pagination.items[0];
            return item.Title || item._metadata.displayName;
        }
    }
};

export function render(data: any): string {
    const item = data.pagination.items[0];
    return ComponentFactory(item);
}
