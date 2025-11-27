import { Row } from './Row';

export interface SectionProps {
  key: string;
  rows: any[];
  [key: string]: any;
}

export function Section(props: SectionProps): string {
  const rowsHtml = props.rows?.map((row: any) => Row({
    key: row.key,
    columns: row.nodes // Map generic nodes to columns expected by Row
  })).join('') || '';

  return `
    <div class="section" data-epi-block-id="${props.key}">
      ${rowsHtml}
    </div>
  `;
}
