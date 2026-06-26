import { Component, EventEmitter, Input, OnInit, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

@Component({
  selector: 'app-auction-form',
  standalone: true,
  imports: [CommonModule, FormsModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule, MatSlideToggleModule],
  templateUrl: './auction-form.component.html',
  styleUrl: './auction-form.component.css',
})
export class AuctionFormComponent implements OnInit {
  @Input() initial: any = null;
  @Input() projects: any[] = [];
  @Input() dictionaryItems: any[] = [];
  @Input() saving = false;
  @Input() saveError = '';
  @Output() save = new EventEmitter<any>();
  @Output() cancelForm = new EventEmitter<void>();

  validationError = signal('');
  form: any = {};

  ngOnInit(): void {
    const i = this.initial;
    const cut = (d: any) => (d ? String(d).substring(0, 10) : '');
    this.form = i ? {
      name: i.name || '', desc: i.desc || '', inviteText: i.inviteText || '',
      startBidValue: i.startBidValue ?? '', maxBidValue: i.maxBidValue ?? '', bidStep: i.bidStep ?? '', quantity: i.quantity ?? '',
      discussStartDate: cut(i.discussStartDate), discussEndDate: cut(i.discussEndDate),
      auctionStartDate: cut(i.auctionStartDate), auctionEndDate: cut(i.auctionEndDate),
      startTime: i.startTime || '', endTime: i.endTime || '',
      bidStartDate: cut(i.bidStartDate), bidEndDate: cut(i.bidEndDate),
      bidStartTime: i.bidStartTime || '', bidEndTime: i.bidEndTime || '',
      additionalMinute: i.additionalMinute ?? '', showLastBid: i.showLastBid || false,
      auctionTypeKey: i.auctionType?.key || '', valueTypeKey: i.valueType?.key || '', uomKey: i.uom?.key || '', currencyKey: i.currency?.key || '',
      projectId: i.project?.id || '',
    } : {
      name: '', desc: '', inviteText: '',
      startBidValue: '', maxBidValue: '', bidStep: '', quantity: '',
      discussStartDate: '', discussEndDate: '', auctionStartDate: '', auctionEndDate: '',
      startTime: '', endTime: '', bidStartDate: '', bidEndDate: '', bidStartTime: '', bidEndTime: '',
      additionalMinute: '', showLastBid: false,
      auctionTypeKey: 'key.auctionType.buy', valueTypeKey: 'key.valueType.amount', uomKey: 'key.uom.piece', currencyKey: 'key.currency.lari',
      projectId: '',
    };
  }

  itemsForKey(prefix: string): any[] {
    return this.dictionaryItems.filter(d => d.key?.startsWith(prefix));
  }

  validate(): string {
    const f = this.form;
    const m: string[] = [];
    if (!f.name?.trim()) m.push('Name');
    if (!f.auctionTypeKey) m.push('Auction Type');
    if (!f.projectId) m.push('Project');
    if (!f.inviteText?.trim()) m.push('Invitation Text');
    if (!f.valueTypeKey) m.push('Value Type');
    if (!f.uomKey) m.push('Unit of Measure');
    if (!f.currencyKey) m.push('Currency');
    if (f.bidStep === '' || f.bidStep == null) m.push('Bid Step');
    if (f.startBidValue === '' || f.startBidValue == null) m.push('Start Bid Value');
    if (f.maxBidValue === '' || f.maxBidValue == null) m.push('Max Bid Value');
    if (f.additionalMinute === '' || f.additionalMinute == null) m.push('Additional Minutes');
    if (!f.discussStartDate) m.push('Discuss Start Date');
    if (!f.discussEndDate) m.push('Discuss End Date');
    if (!f.auctionStartDate) m.push('Auction Start Date');
    if (!f.auctionEndDate) m.push('Auction End Date');
    if (!f.startTime?.trim()) m.push('Start Time');
    if (!f.endTime?.trim()) m.push('End Time');
    if (!f.bidStartDate) m.push('Bid Start Date');
    if (!f.bidEndDate) m.push('Bid End Date');
    if (!f.bidStartTime?.trim()) m.push('Bid Start Time');
    if (!f.bidEndTime?.trim()) m.push('Bid End Time');
    if (m.length > 0) return 'Please fill in required fields: ' + m.join(', ');
    if (f.startBidValue && f.maxBidValue && Number(f.maxBidValue) <= Number(f.startBidValue)) {
      return 'Max Bid Value must be greater than Start Bid Value';
    }
    return '';
  }

  submit(): void {
    const err = this.validate();
    if (err) { this.validationError.set(err); return; }
    this.validationError.set('');
    this.save.emit({ ...this.form });
  }
}
