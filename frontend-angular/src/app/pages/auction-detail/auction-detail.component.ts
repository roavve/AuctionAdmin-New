import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { AuctionService } from '../../services/auction.service';
import { ProjectService } from '../../services/project.service';
import { DictionaryService } from '../../services/dictionary.service';
import { AuctionBidsTabComponent } from './auction-bids-tab.component';
import { AuctionInvitesTabComponent } from './auction-invitations-tab.component';
import { AuctionParticipantsTabComponent } from './auction-participants-tab.component';
import { AuctionCommentsTabComponent } from './auction-comments-tab.component';
import { AuctionFilesTabComponent } from './auction-files-tab.component';
import { AuctionRevisionsTabComponent } from './auction-revisions-tab.component';
import { AuctionFormComponent } from './auction-form.component';

@Component({
  selector: 'app-auction-detail',
  standalone: true,
  imports: [
    CommonModule, MatButtonModule, MatIconModule, MatTabsModule, MatProgressSpinnerModule,
    AuctionBidsTabComponent, AuctionInvitesTabComponent, AuctionParticipantsTabComponent,
    AuctionCommentsTabComponent, AuctionFilesTabComponent, AuctionRevisionsTabComponent, AuctionFormComponent,
  ],
  templateUrl: './auction-detail.component.html',
  styleUrl: './auction-detail.component.css',
})
export class AuctionDetailComponent implements OnInit {
  id: string | null = null;
  isNew = false;

  auction = signal<any>(null);
  loading = signal(true);
  error = signal('');
  actionMsg = signal('');
  editing = signal(false);
  tab = signal(0);

  projects = signal<any[]>([]);
  dictionaryItems = signal<any[]>([]);
  saving = signal(false);
  saveError = signal('');

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private auctionService: AuctionService,
    private projectService: ProjectService,
    private dictionaryService: DictionaryService,
  ) {}

  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get('id');
    this.isNew = !this.id || this.id === 'new';
    this.loadFormData();
    if (this.isNew) { this.editing.set(true); this.loading.set(false); }
    else { this.load(); }
  }

  loadFormData(): void {
    this.projectService.getAll().subscribe({ next: (p: any) => this.projects.set(p.content || p), error: () => {} });
    this.dictionaryService.getItems().subscribe({ next: d => this.dictionaryItems.set(d), error: () => {} });
  }

  load(): void {
    this.loading.set(true);
    this.auctionService.getById(this.id!).subscribe({
      next: a => { this.auction.set(a); this.loading.set(false); },
      error: () => { this.error.set('Failed to load auction'); this.loading.set(false); },
    });
  }

  get statusKey(): string { return this.auction()?.status?.key ?? ''; }

  fmt(d: any): string { return d ? new Date(d).toLocaleDateString() : '-'; }

  onTab(i: number): void { this.tab.set(i); }

  startEdit(): void { this.saveError.set(''); this.editing.set(true); }

  buildPayload(f: any): any {
    return {
      name: f.name, desc: f.desc, inviteText: f.inviteText,
      startBidValue: f.startBidValue, maxBidValue: f.maxBidValue, bidStep: f.bidStep, quantity: f.quantity,
      discussStartDate: f.discussStartDate, discussEndDate: f.discussEndDate,
      auctionStartDate: f.auctionStartDate, auctionEndDate: f.auctionEndDate,
      startTime: f.startTime, endTime: f.endTime,
      bidStartDate: f.bidStartDate, bidEndDate: f.bidEndDate, bidStartTime: f.bidStartTime, bidEndTime: f.bidEndTime,
      additionalMinute: f.additionalMinute, showLastBid: f.showLastBid,
      auctionType: f.auctionTypeKey ? { key: f.auctionTypeKey } : null,
      valueType: f.valueTypeKey ? { key: f.valueTypeKey } : null,
      uom: f.uomKey ? { key: f.uomKey } : null,
      currency: f.currencyKey ? { key: f.currencyKey } : null,
      project: f.projectId ? { id: f.projectId } : null,
    };
  }

  onFormSave(rawForm: any): void {
    const payload = this.buildPayload(rawForm);
    this.saving.set(true);
    this.saveError.set('');
    if (this.isNew) {
      this.auctionService.create(payload).subscribe({
        next: (res: any) => {
          this.saving.set(false);
          if (res?.id) this.router.navigate(['/auctions', res.id]);
          else this.saveError.set('Created but no ID returned');
        },
        error: (e: any) => { this.saveError.set(e.error?.error || e.message || 'Save failed'); this.saving.set(false); },
      });
    } else {
      this.auctionService.update(this.id!, payload).subscribe({
        next: () => { this.saving.set(false); this.editing.set(false); this.load(); this.actionMsg.set('Auction saved successfully'); },
        error: (e: any) => { this.saveError.set(e.error?.error || e.message || 'Save failed'); this.saving.set(false); },
      });
    }
  }

  onFormCancel(): void {
    if (this.isNew) { this.router.navigate(['/auctions']); return; }
    this.editing.set(false);
  }

  handleAction(action: 'activate' | 'close' | 'cancel'): void {
    const obs = action === 'activate' ? this.auctionService.activate(this.id!)
      : action === 'close' ? this.auctionService.close(this.id!)
        : this.auctionService.cancel(this.id!);
    obs.subscribe({
      next: () => { this.actionMsg.set('Action completed successfully'); this.load(); },
      error: (e: any) => this.actionMsg.set('Action failed: ' + (e.error?.error || e.message)),
    });
  }

  handleDelete(): void {
    if (!window.confirm('Delete this auction?')) return;
    this.auctionService.delete(this.id!).subscribe({
      next: () => this.router.navigate(['/auctions']),
      error: () => this.error.set('Delete failed'),
    });
  }

  back(): void { this.router.navigate(['/auctions']); }
}
