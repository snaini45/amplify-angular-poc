import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AmplifyAuthenticatorModule } from '@aws-amplify/ui-angular';
import { uploadData, remove, getUrl, list } from 'aws-amplify/storage';

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
        <img src="https://www.companieslogo.com/img/orig/WM-c6b6879b.png?download=true" alt="WM Logo" class="logo" />
        <span class="title">WMHS</span>
      </header>

      <!-- Upload + Search Row -->
      <section class="top-row">
        <!-- File Upload -->
        <div class="upload-block">
          <label>Upload:</label>
          <input type="file" (change)="onFileSelect($event)" />
          <button class="btn" (click)="uploadFile()" [disabled]="!selectedFile">Upload</button>
        </div>

        <!-- Show selected file details -->
        <div class="file-info" *ngIf="selectedFile">
          <p><b>Selected:</b> {{ selectedFile.name }}</p>
          <p><b>Type:</b> {{ selectedFile.type || 'Unknown' }}</p>
          <p><b>Size:</b> {{ formatSize(selectedFile.size) }}</p>
        </div>
      </section>

      <!-- Search Row -->
      <section class="search-row">
        <!-- Ship_To Search -->
        <div class="inline">
          <label>Ship_To:</label>
          <input type="text" [(ngModel)]="filters.shipTo" />
          <button class="btn" (click)="filterByShipTo()">Search</button>
        </div>

        <!-- Date Search -->
        <div class="inline">
          <label>Date:</label>
          <input type="date" [(ngModel)]="filters.date" />
          <button class="btn" (click)="filterByDate()">Search</button>
        </div>
      </section>

      <!-- File List -->
      <section class="file-list">
        <h3>Your Files ({{ filteredFiles.length }})</h3>
        <p *ngIf="!filteredFiles.length">No files uploaded yet.</p>
        <table *ngIf="filteredFiles.length">
          <thead>
            <tr>
              <th>Filename</th>
              <th>Type</th>
              <th>Size</th>
              <th>Uploaded At</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let f of filteredFiles">
              <td>{{ f.filename }}</td>
              <td>{{ f.type }}</td>
              <td>{{ formatSize(f.size) }}</td>
              <td>{{ f.uploadedAt | date:'dd/MM/yyyy HH:mm' }}</td>
              <td>
                <a *ngIf="f.url" [href]="f.url" target="_blank">Open</a>
                <button class="btn small" (click)="preview(f)">Preview</button>
                <button class="btn small danger" (click)="delete(f)">Delete</button>
              </td>
            </tr>
          </tbody>
        </table>
      </section>

      <!-- Preview Modal -->
      <div class="modal" *ngIf="previewFile">
        <div class="modal-content">
          <span class="close" (click)="previewFile = null">&times;</span>
          <h3>Preview: {{ previewFile.filename }}</h3>
          <p><b>Type:</b> {{ previewFile.type }}</p>
          <p><b>Size:</b> {{ formatSize(previewFile.size) }}</p>
          <hr />

          <!-- CSV/TSV -->
          <table *ngIf="previewFile.type.includes('csv') || previewFile.type.includes('tsv')">
            <tr *ngFor="let row of previewContent">
              <td *ngFor="let cell of row">{{ cell }}</td>
            </tr>
          </table>

          <!-- JSON -->
          <pre *ngIf="previewFile.type.includes('json')">{{ previewContent | json }}</pre>

          <!-- Images -->
          <img *ngIf="previewFile.type.includes('image')" [src]="previewFile.url" style="max-width:100%;" />

          <!-- Other -->
          <p *ngIf="!previewFile.type.includes('csv') 
                   && !previewFile.type.includes('tsv') 
                   && !previewFile.type.includes('json') 
                   && !previewFile.type.includes('image')">
            Preview not supported. <a [href]="previewFile.url" target="_blank">Open file</a>.
          </p>
        </div>
      </div>
    </div>
  </ng-template>
</amplify-authenticator>
  `,
  styles: [`
.page { background:#fff; min-height:100vh; padding:20px; font-family:Arial,sans-serif; }
.header { display:flex; align-items:center; gap:12px; margin-bottom:20px; }
.logo { height:40px; }
.title { font-size:20px; font-weight:bold; color:#2c9c3f; }
.top-row { display:flex; gap:20px; margin-bottom:20px; align-items:flex-start; }
.search-row { display:flex; gap:40px; margin-bottom:20px; }
.inline { display:flex; gap:8px; align-items:center; }
.btn { background:#2c9c3f; border:none; color:#fff; padding:6px 14px; border-radius:4px; cursor:pointer; }
.btn.small { padding:4px 10px; font-size:12px; }
.btn.danger { background:#b91c1c; }
.file-list table { width:100%; border-collapse:collapse; margin-top:10px; }
.file-list th, .file-list td { border:1px solid #ddd; padding:8px; text-align:left; }
.file-list th { background:#f3f4f6; }
.modal { position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,.5); display:flex; justify-content:center; align-items:center; }
.modal-content { background:#fff; padding:20px; border-radius:8px; width:80%; max-height:80%; overflow:auto; }
.close { float:right; font-size:24px; cursor:pointer; }
  `]
})
export class AppComponent {
  selectedFile: File | null = null;
  files: any[] = [];
  filteredFiles: any[] = [];
  filters = { shipTo: '', date: '' };
  previewFile: any = null;
  previewContent: any = null;

  async ngOnInit() {
    await this.loadFiles();
  }

  onFileSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    this.selectedFile = input.files?.[0] ?? null;
  }

  async uploadFile() {
    if (!this.selectedFile) return;
    const file = this.selectedFile;
    const key = `${Date.now()}_${file.name}`;
    await uploadData({ key, data: file, options: { accessLevel: 'protected' } }).result;
    const urlRes = await getUrl({ key, options: { accessLevel: 'protected' } });

    this.files.push({
      key,
      filename: file.name,
      type: file.type,
      size: file.size,
      uploadedAt: new Date(),
      url: urlRes.url.toString(),
    });

    this.filteredFiles = this.files;
    this.selectedFile = null;
  }

  async loadFiles() {
    const listed = await list({ options: { accessLevel: 'protected' } });
    this.files = await Promise.all(listed.items.map(async (item) => {
      const url = (await getUrl({ key: item.key, options: { accessLevel: 'protected' } })).url.toString();
      return { ...item, filename: item.key, uploadedAt: item.lastModified, url };
    }));
    this.filteredFiles = this.files;
  }

  async delete(f: any) {
    await remove({ key: f.key, options: { accessLevel: 'protected' } });
    this.files = this.files.filter(x => x.key !== f.key);
    this.filteredFiles = this.files;
  }

  async preview(f: any) {
    this.previewFile = f;
    if (f.type?.includes('csv') || f.type?.includes('tsv')) {
      const resp = await fetch(f.url);
      const text = await resp.text();
      this.previewContent = text.split('\n').map(r => r.split(','));
    } else if (f.type?.includes('json')) {
      const resp = await fetch(f.url);
      this.previewContent = await resp.json();
    } else {
      this.previewContent = null;
    }
  }

  filterByShipTo() {
    this.filteredFiles = this.files.filter(f => f.filename.includes(this.filters.shipTo));
  }

  filterByDate() {
    if (!this.filters.date) {
      this.filteredFiles = this.files;
      return;
    }
    const selectedDate = new Date(this.filters.date).toISOString().split('T')[0];
    this.filteredFiles = this.files.filter(f => {
      const fileDate = new Date(f.uploadedAt).toISOString().split('T')[0];
      return fileDate === selectedDate;
    });
  }

  formatSize(bytes: number): string {
    if (!bytes) return '0 B';
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return (bytes / Math.pow(1024, i)).toFixed(1) + ' ' + sizes[i];
  }
}
