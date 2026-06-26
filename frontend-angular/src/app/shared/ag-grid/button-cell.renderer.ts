import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-community';

@Component({
  selector: 'app-button-cell',
  standalone: true,
  imports: [MatButtonModule],
  template: `
    @if (show) {
      <button mat-button [color]="color" class="cell-btn" (click)="onClick()">{{ label }}</button>
    }
  `,
  styles: [`
    .cell-btn {
      min-width: 0;
      padding: 0 8px;
      line-height: 30px;
      font-size: 0.8125rem;
    }
  `]
})
export class ButtonCellRenderer implements ICellRendererAngularComp {
  label = 'View';
  color: 'primary' | 'warn' | '' = 'primary';
  show = true;
  private params!: ICellRendererParams & {
    label?: string;
    labelGetter?: (row: any) => string;
    color?: 'primary' | 'warn' | '';
    onClick?: (row: any) => void;
    visible?: (row: any) => boolean;
  };

  agInit(params: any): void {
    this.refresh(params);
  }

  refresh(params: any): boolean {
    this.params = params;
    this.label = params.labelGetter ? params.labelGetter(params.data) : (params.label ?? 'View');
    this.color = params.color ?? 'primary';
    this.show = params.visible ? params.visible(params.data) : true;
    return true;
  }

  onClick(): void {
    this.params.onClick?.(this.params.data);
  }
}
