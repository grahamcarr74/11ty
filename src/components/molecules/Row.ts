import { Column } from './Column';

export interface RowProps {
  key: string;
  columns: any[];
  [key: string]: any;
}

export function Row(props: RowProps): string {
  const columnsHtml = props.columns?.map((col: any) => Column({
    key: col.key,
    elements: col.nodes
  })).join('') || '';

  return `
    <div class="row" data-epi-block-id="${props.key}">
      ${columnsHtml}
    </div>
  `;
}
