import { Section } from '../molecules/Section';

export interface BlankExperienceTemplateProps {
    title: string;
    types: string[];
    lastModified: string;
    key: string;
    composition?: {
        nodes: any[];
    };
    editable?: {
        title?: string;
    };
}

export function BlankExperienceTemplate(props: BlankExperienceTemplateProps): string {
    const compositionHtml = props.composition?.nodes?.map((node: any) => Section({
        key: node.key,
        rows: node.nodes // Map generic nodes to rows expected by Section
    })).join('') || '';

    return `
    <div class="blank-experience" data-epi-block-id="${props.key}">
        <h1 ${props.editable?.title ? `data-epi-edit="${props.editable.title}"` : ''}>${props.title}</h1>
        <div class="composition-area">
            ${compositionHtml}
        </div>
    </div>
    `;
}
