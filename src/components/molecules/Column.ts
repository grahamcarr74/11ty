import { ComponentFactory } from '../ComponentFactory';

export interface ColumnProps {
    key: string;
    elements?: any[];
    [key: string]: any;
}

export function Column(props: ColumnProps): string {
    // Placeholder for elements rendering using ComponentFactory
    // Currently elements might be empty or not yet fetched
    const elementsHtml = props.elements?.map((element: any) => ComponentFactory(element)).join('') || '';

    return `
    <div class="col" data-epi-block-id="${props.key}">
      ${elementsHtml}
    </div>
  `;
}
