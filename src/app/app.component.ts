import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AmplifyAuthenticatorModule } from '@aws-amplify/ui-angular';

import { uploadData, getUrl, remove, list } from 'aws-amplify/storage';

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
        <img src="https://southfayettepa.com/ImageRepository/Document?documentID=5497" alt="WM Logo" class="logo" />
        <span class="title">WMHS</span>
      </header>

      <!-- Upload + Search Row -->
      <section class="search-row">
        <!-- Upload -->
        <div class="form-group">
          <label>Upload:</label>
          <div class="inline">
            <input type="file" (change)="onFileSelect($event)" />
            <button class="upload-btn" (click)="uploadFile()">Upload</button>
            <button *ngIf="selectedFile" class="preview-btn" (click)="previewFile()">Preview</button>
          </div>
        </div>

        <!-- Ship_To -->
        <div class="form-group">
          <label>Ship_To:</label>
          <input type="text" [(ngModel)]="search.shipTo" />
          <button class="search-btn" (click)="runSearch()">Search</button>
        </div>

        <!-- Date -->
        <div class="form-group">
          <label>Date:</label>
          <input type="date" [(ngModel)]="search.date" />
        </div>
      </section>

      <!-- File Preview -->
      <section *ngIf="filePreview" class="preview">
        <h3>File Preview: {{ filePreview.name }}</h3>
        <p><b>Type:</b> {{ filePreview.type }} | <b>Size:</b> {{ filePreview.size }} bytes</p>

        <!-- If CSV, render as table -->
        <table *ngIf="filePreview.type?.includes('csv')" border="1" class="preview-table">
          <tr>
            <th *ngFor="let header of filePreview.headers">{{ header }}</th>
          </tr>
          <tr *ngFor="let row of filePreview.rows">
            <td *ngFor="let col of row">{{ col }}</td>
          </tr>
        </table>

        <!-- If text/JSON -->
        <pre *ngIf="!filePreview.type?.includes('csv')">{{ filePreview.content }}</pre>
      </section>

      <!-- File List -->
      <section class="files">
        <h3>Your Files</h3>
        <ul>
          <li *ngFor="let f of uploadedFiles">
            {{ f.key }} ({{ f.size }} bytes)
            <a *ngIf="f.url" [href]="f.url" target="_blank">Open</a>
            <button (click)="deleteFile(f.key)">Delete</button>
          </li>
        </ul>
        <p *ngIf="!uploadedFiles.length">No files uploaded yet.</p>
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
.search-row { display: flex; align-items: flex-end; gap: 20px; margin-bottom: 20px; flex-wrap: wrap; }
.inline { display: flex; gap: 10px; align-items: center; }
.form-group { display: flex; flex-direction: column; font-size: 14px; }
.upload-btn, .search-btn, .preview-btn { background: #2c9c3f; color: white; padding: 6px 12px; border: none; border-radius: 4px; cursor: pointer; }
.preview { margin-top: 20px; }
.preview-table { border-collapse: collapse; margin-top: 10px; }
.preview-table th, .preview-table td { padding: 4px 8px; }
.files { margin-top: 20px; }
.files ul { list-style: none; padding: 0; }
.files li { display: flex; gap: 10px; align-items: center; margin: 6px 0; }
  `]
})
export class AppComponent {
  search = { shipTo: '', date: '' };
  selectedFile: File | null = null;
  filePreview: any = null;
  uploadedFiles: any[] = [];

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

  async previewFile() {
    if (!this.selectedFile) return;

    const reader = new FileReader();
    reader.onload = () => {
      const text = reader.result as string;
      if (this.selectedFile!.type.includes('csv')) {
        const rows = text.split('\n').map(r => r.split(','));
        this.filePreview = {
          name: this.selectedFile!.name,
          size: this.selectedFile!.size,
          type: this.selectedFile!.type,
          headers: rows[0],
          rows: rows.slice(1)
        };
      } else {
        this.filePreview = {
          name: this.selectedFile!.name,
          size: this.selectedFile!.size,
          type: this.selectedFile!.type,
          content: text
        };
      }
    };
    reader.readAsText(this.selectedFile);
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
  }

  async deleteFile(key: string) {
    await remove({ key, options: { accessLevel: 'protected' } });
    await this.loadFiles();
  }

  runSearch() {
    console.log('Searching for:', this.search);
    // TODO: Hook this into DynamoDB/AppSync search
  }
}
