export interface ButtonBlockProps {
    text: string;
    url: string;
    key: string;
    displayName?: string;
    [key: string]: any;
}

export function ButtonBlock(props: ButtonBlockProps): string {
    const { text, url, key, displayName } = props;

    // Basic button rendering
    // Using data-epi-block-id for the block itself
    // Using data-epi-edit for editable fields if needed (though Text is usually a property on the block)

    return `
    <div class="button-block" data-epi-block-id="${key}">
      <a href="${url}" class="btn btn-primary" data-epi-edit="Text">${text || displayName || 'Button'}</a>
    </div>
  `;
}
