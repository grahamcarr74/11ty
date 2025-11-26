export interface ButtonProps {
    text: string;
    href: string;
    variant?: 'primary' | 'secondary';
    className?: string;
}

export function Button({ text, href, variant = 'primary', className = '' }: ButtonProps): string {
    const baseClass = 'btn';
    const variantClass = variant === 'secondary' ? 'btn-secondary' : '';

    return `<a href="${href}" class="${baseClass} ${variantClass} ${className}">${text}</a>`;
}
