export interface TextBlockProps {
    text: string;
    key: string;
    [key: string]: any;
}

export function TextBlock(props: TextBlockProps): string {
    const { text, key } = props;
    return `
    <div class="text-block" data-epi-block-id="${key}">
        <p data-epi-edit="Text">${text || ''}</p>
    </div>
    `;
}
