export interface HeadingProps {
    level: 1 | 2 | 3 | 4 | 5 | 6;
    text: string;
    className?: string;
    editable?: string; // For Optimizely OPE
}

export function Heading({ level, text, className = '', editable = '' }: HeadingProps): string {
    return `<h${level} class="${className}" ${editable}>${text}</h${level}>`;
}

export interface ParagraphProps {
    text: string;
    className?: string;
    editable?: string; // For Optimizely OPE
}

export function Paragraph({ text, className = '', editable = '' }: ParagraphProps): string {
    return `<p class="${className}" ${editable}>${text}</p>`;
}
