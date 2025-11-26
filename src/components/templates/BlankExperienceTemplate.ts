export interface BlankExperienceTemplateProps {
    title: string;
    types: string[];
    lastModified: string;
    key: string;
    editable?: {
        title?: string;
    };
}

export function BlankExperienceTemplate({ title, types, lastModified, key, editable = {} }: BlankExperienceTemplateProps): string {
    const blockIdAttr = key ? `data-epi-block-id="${key}"` : '';
    const titleEdit = editable.title ? `data-epi-edit="${editable.title}"` : '';

    return `
    <div class="blank-experience" ${blockIdAttr}>
        <h1 ${titleEdit}>${title}</h1>
    </div>
    `;
}
