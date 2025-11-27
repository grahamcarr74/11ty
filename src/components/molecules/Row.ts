import { Column } from './Column';

export interface RowProps {
  key: string;
  columns: any[];
  [key: string]: any;
}

export function Row(props: RowProps): string {
  const columnsHtml = props.columns?.map((col: any) => Column({
    key: col.key,
    elements: col.nodes // Map generic nodes to elements expected by Column
  })).join('') || '';

  return `
    <div class="row" data-epi-block-id="${props.key}">
      ${columnsHtml}
    </div>
  `;
}
