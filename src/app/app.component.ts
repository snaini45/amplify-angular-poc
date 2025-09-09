import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AmplifyAuthenticatorModule } from '@aws-amplify/ui-angular';

import { uploadData, list, getUrl, remove } from 'aws-amplify/storage';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule, AmplifyAuthenticatorModule],
  template: `
<amplify-authenticator>
  <ng-template amplifySlot="authenticated">
    <div class="page">

      <!-- Header -->
      <header class="header">
        <img src="assets/wm-logo.png" alt="WM Logo" class="logo" />
        <span class="title">WMHS</span>
      </header>

      <!-- Search Row -->
      <section class="search-row">

        <!-- File Upload -->
        <div class="inline">
          <input type="file" (change)="onFileSelect($event)" />
          <button class="btn" (click)="uploadFile()">Upload</button>
        </div>

        <!-- Ship_To -->
        <div class="inline">
          <input type="text" placeholder="Ship_To" [(ngModel)]="filters.shipTo" />
          <button class="btn" (click)="filterFiles()">Search</button>
        </div>

        <!-- Date -->
        <div class="inline">
          <input type="date" [(ngModel)]="filters.date" (change)="filterFiles()" />
        </div>
      </section>

      <!-- File List -->
      <section class="files">
        <h3>Your Files ({{ filteredFiles.length }})</h3>
        <ul>
          <li *ngFor="let f of filteredFiles">
            <b>{{ f.key }}</b> — {{ f.size }} bytes — Uploaded: {{ f.lastModified | date:'dd/MM/yyyy HH:mm' }}
            <a *ngIf="f.url" [href]="f.url" target="_blank">Open</a>
            <button (click)="deleteFile(f.key)">Delete</button>
          </li>
        </ul>
        <p *ngIf="!filteredFiles.length">No files uploaded yet.</p>
      </section>
    </div>
  </ng-template>
</amplify-authenticator>
  `,
  styles: [`
.page { background: #fff; min-height: 100vh; padding: 20px; font-family: Arial, sans-serif; }
.header { display: flex; align-items: center; gap: 12px; margin-bottom: 20px; }
.logo { height: 40px; }
.title { font-size: 20px; font-weight: bold; color: #2c9c3f; }
.search-row { display: flex; gap: 20px; margin-bottom: 20px; align-items: center; }
.inline { display: flex; gap: 8px; align-items: center; }
input[type="text"], input[type="date"], input[type="file"] {
  padding: 6px; border: 1px solid #ccc; border-radius: 4px;
}
.btn {
  background: #2c9c3f; color: white; padding: 6px 12px; border: none;
  border-radius: 4px; cursor: pointer; font-size: 14px;
}
.btn:hover { background: #248233; }
.files ul { list-style: none; padding: 0; margin: 0; }
.files li { margin: 6px 0; display: flex; gap: 10px; align-items: center; }
  `]
})
export class AppComponent {
  selectedFile: File | null = null;
  uploadedFiles: any[] = [];
  filteredFiles: any[] = [];

  filters = { shipTo: '', date: '' };

  async ngOnInit() {
    await this.loadFiles();
  }

  onFileSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    this.selectedFile = input.files?.[0] ?? null;
  }

  async uploadFile() {
    if (!this.selectedFile) return;
    const key = `${Date.now()}_${this.selectedFile.name}`;
    await uploadData({ key, data: this.selectedFile, options: { accessLevel: 'protected' } }).result;
    this.selectedFile = null;
    await this.loadFiles();
  }

  async loadFiles() {
    const listed = await list({ options: { accessLevel: 'protected' } });
    this.uploadedFiles = await Promise.all(listed.items.map(async (item) => {
      let url: string | null = null;
      try {
        const result = await getUrl({ key: item.key, options: { accessLevel: 'protected' } });
        url = result.url.toString();
      } catch {}
      return { ...item, url };
    }));
    this.filteredFiles = this.uploadedFiles;
  }

  async deleteFile(key: string) {
    await remove({ key, options: { accessLevel: 'protected' } });
    await this.loadFiles();
  }

  filterFiles() {
    this.filteredFiles = this.uploadedFiles.filter(f => {
      let matches = true;
      if (this.filters.date) {
        const fileDate = new Date(f.lastModified).toISOString().split('T')[0];
        if (fileDate !== this.filters.date) matches = false;
      }
      if (this.filters.shipTo) {
        matches = matches && f.key.includes(this.filters.shipTo);
      }
      return matches;
    });
  }
}
