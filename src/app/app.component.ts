import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AmplifyAuthenticatorModule } from '@aws-amplify/ui-angular';

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
        <!-- Upload -->
        <div class="form-group">
          <label>Upload:</label>
          <input type="file" (change)="onFileSelect($event)" />
          <button class="upload-btn" (click)="uploadFile()">Upload</button>
        </div>

        <!-- Ship_To -->
        <div class="form-group">
          <label>Ship_To:</label>
          <input type="text" [(ngModel)]="search.shipTo" />
        </div>

        <!-- Date -->
        <div class="form-group">
          <label>Date:</label>
          <input type="date" [(ngModel)]="search.date" />
        </div>

        <!-- Search -->
        <div class="form-group">
          <button class="search-btn" (click)="runSearch()">Search</button>
        </div>
      </section>

      <!-- Quick File Preview (on select) -->
      <section *ngIf="filePreview" class="preview">
        <h4>Quick Preview (Before Upload):</h4>
        <p><strong>Name:</strong> {{ selectedFile?.name }}</p>
        <p><strong>Size:</strong> {{ selectedFile?.size }} bytes</p>
        <p><strong>Type:</strong> {{ selectedFile?.type }}</p>
        <button class="clear-btn" (click)="clearFile()">❌ Clear</button>

        <!-- Image preview -->
        <img *ngIf="isImage" [src]="filePreview" class="preview-img" />

        <!-- Text preview (first 200 chars) -->
        <pre *ngIf="isText">{{ textContent }}</pre>
      </section>

      <!-- Results -->
      <section class="results">
        <h3>Results</h3>
        <p *ngIf="!results.length">No results found.</p>
        <ul>
          <li *ngFor="let item of results">
            {{ item.name }} ({{ item.date }})
            <button class="preview-btn" (click)="showFullPreview(item)">Preview</button>
          </li>
        </ul>
      </section>

      <!-- Full Preview Modal -->
      <div *ngIf="showModal" class="modal">
        <div class="modal-content">
          <span class="close" (click)="closeModal()">&times;</span>
          <h3>Full Preview: {{ modalFile?.name }}</h3>

          <!-- If image -->
          <img *ngIf="modalFile?.type?.startsWith('image/')" 
               [src]="modalFile?.content" 
               class="full-img" />

          <!-- If text -->
          <pre *ngIf="modalFile?.type?.startsWith('text/') || modalFile?.name.endsWith('.csv') || modalFile?.type === 'application/json'">
            {{ modalFile?.content }}
          </pre>
        </div>
      </div>
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
.form-group { display: flex; flex-direction: column; font-size: 14px; color: #333; }
.form-group input { padding: 6px 10px; border: 1px solid #ccc; border-radius: 4px; min-width: 180px; }
.upload-btn, .search-btn, .preview-btn, .clear-btn { background-color: #2c9c3f; border: none; color: white; padding: 6px 14px; border-radius: 4px; cursor: pointer; margin-top: 5px; }
.upload-btn:hover, .search-btn:hover, .preview-btn:hover, .clear-btn:hover { background-color: #248233; }
.preview { margin-top: 20px; padding: 10px; border: 1px solid #ccc; border-radius: 6px; background: #f9f9f9; }
.preview-img { max-width: 200px; margin-top: 10px; border: 1px solid #ddd; border-radius: 6px; }
.results { margin-top: 20px; }
.results ul { padding-left: 20px; }
.modal { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.7); display: flex; justify-content: center; align-items: center; }
.modal-content { background: white; padding: 20px; border-radius: 8px; width: 80%; max-height: 80%; overflow: auto; }
.close { float: right; font-size: 24px; cursor: pointer; }
.full-img { max-width: 100%; height: auto; border: 1px solid #ccc; border-radius: 6px; margin-top: 10px; }
  `]
})
export class AppComponent {
  search = { shipTo: '', date: '' };
  results: any[] = [];
  selectedFile: File | null = null;
  filePreview: string | null = null;
  textContent: string = '';
  isImage = false;
  isText = false;

  showModal = false;
  modalFile: any = null;

  onFileSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    this.selectedFile = input.files?.[0] ?? null;

    if (this.selectedFile) {
      const file = this.selectedFile;
      const reader = new FileReader();

      if (file.type.startsWith('image/')) {
        this.isImage = true;
        this.isText = false;
        reader.onload = () => (this.filePreview = reader.result as string);
        reader.readAsDataURL(file);
      } else if (file.type.startsWith('text/') || file.type === 'application/json' || file.name.endsWith('.csv')) {
        this.isImage = false;
        this.isText = true;
        reader.onload = () => {
          this.textContent = (reader.result as string).substring(0, 200) + '...';
          this.filePreview = 'text';
        };
        reader.readAsText(file);
      } else {
        this.isImage = false;
        this.isText = false;
        this.filePreview = 'generic';
      }
    }
  }

  clearFile() {
    this.selectedFile = null;
    this.filePreview = null;
    this.textContent = '';
    this.isImage = false;
    this.isText = false;
  }

  uploadFile() {
    if (!this.selectedFile) {
      alert('Please select a file first.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      this.results.push({
        name: this.selectedFile!.name,
        type: this.selectedFile!.type,
        date: new Date().toISOString().split('T')[0],
        content: reader.result
      });
      this.clearFile(); // reset quick preview
    };

    if (this.selectedFile.type.startsWith('image/')) {
      reader.readAsDataURL(this.selectedFile);
    } else {
      reader.readAsText(this.selectedFile);
    }
  }

  runSearch() {
    console.log('Searching with:', this.search);
  }

  showFullPreview(file: any) {
    this.modalFile = file;
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.modalFile = null;
  }
}
