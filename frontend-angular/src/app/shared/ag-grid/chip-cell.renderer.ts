import { Component } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-community';

export interface ChipColor {
  bg: string;
  fg: string;
}

@Component({
  selector: 'app-chip-cell',
  standalone: true,
  template: `
    @if (show) {
      <span class="chip" [style.background-color]="color.bg" [style.color]="color.fg">{{ label }}</span>
    }
  `,
  styles: [`
    .chip {
      display: inline-flex;
      align-items: center;
      height: 24px;
      padding: 0 10px;
      border-radius: 12px;
      font-size: 0.8125rem;
      font-weight: 400;
      line-height: 1;
      white-space: nowrap;
    }
  `]
})
export class ChipCellRenderer implements ICellRendererAngularComp {
  show = true;
  label = '';
  color: ChipColor = { bg: '#e0e0e0', fg: 'rgba(0, 0, 0, 0.87)' };

  agInit(params: ICellRendererParams & {
    visible?: (v: any) => boolean;
    labelGetter?: (v: any) => string;
    colorGetter?: (v: any) => ChipColor | null;
  }): void {
    this.refresh(params);
  }

  refresh(params: any): boolean {
    const v = params.value;
    this.show = params.visible ? params.visible(v) : true;
    this.label = params.labelGetter ? params.labelGetter(v) : (v?.name ?? '');
    const c = params.colorGetter ? params.colorGetter(v) : null;
    this.color = c ?? { bg: '#e0e0e0', fg: 'rgba(0, 0, 0, 0.87)' };
    return true;
  }
}
