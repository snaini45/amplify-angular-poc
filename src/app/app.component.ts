import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
<div class="page">

  <!-- Username Page -->
  <div *ngIf="!usernameEntered" class="login-box">
    <h2>Enter Username</h2>
    <input type="text" [(ngModel)]="username" placeholder="Enter your username" />
    <button class="login-btn" (click)="enter()">Continue</button>
  </div>

  <!-- Main UI -->
  <div *ngIf="usernameEntered">
    <header class="header">
      <img src="https://assets.stickpng.com/images/6133755882b156000425b3c0.png" 
           alt="WM Logo" class="logo" />
      <span class="title">WMHS</span>
    </header>

    <!-- Row with Upload, Ship_To, Search, Date -->
    <section class="search-row">
      
      <!-- Upload -->
      <div class="form-group">
        <label>Upload:</label>
        <div class="inline">
          <input type="file" (change)="onFileSelect($event)" />
          <button class="upload-btn" (click)="uploadFile()">Upload</button>
          <button class="preview-btn" [disabled]="!fileContent" (click)="togglePreview()">
            {{ showPreview ? 'Hide Preview' : 'Preview' }}
          </button>
        </div>
      </div>

      <!-- Ship_To -->
      <div class="form-group">
        <label>Ship_To:</label>
        <input type="text" [(ngModel)]="search.shipTo" />
      </div>

      <!-- Search (moved right after Ship_To) -->
      <div class="form-group">
        <button class="search-btn" (click)="runSearch()">Search</button>
      </div>

      <!-- Date -->
      <div class="form-group">
        <label>Date:</label>
        <input type="date" [(ngModel)]="search.date" />
      </div>
    </section>

    <!-- File Preview -->
    <section *ngIf="showPreview" class="preview">
      <h3>File Preview: {{ selectedFile?.name }}</h3>
      <table *ngIf="parsedCsv.length" class="preview-table">
        <thead>
          <tr>
            <th *ngFor="let header of parsedCsv[0]">{{ header }}</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let row of parsedCsv.slice(1)">
            <td *ngFor="let col of row">{{ col }}</td>
          </tr>
        </tbody>
      </table>
      <pre *ngIf="!parsedCsv.length">{{ fileContent }}</pre>
    </section>

    <!-- Results -->
    <section class="results">
      <h3>Results</h3>
      <p *ngIf="!results.length">No results found.</p>
      <ul>
        <li *ngFor="let item of results">{{ item }}</li>
      </ul>
    </section>
  </div>
</div>
  `,
  styles: [`
.page {
  background: #fff; 
  min-height: 100vh;
  padding: 20px;
  font-family: Arial, sans-serif;
}
.header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
}
.logo {
  height: 40px;
}
.title {
  font-size: 20px;
  font-weight: bold;
  color: #2c9c3f; 
}
.search-row {
  display: flex;
  align-items: flex-end;
  gap: 20px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}
.inline {
  display: flex;
  gap: 10px;
  align-items: center;
}
.form-group {
  display: flex;
  flex-direction: column;
  font-size: 14px;
  color: #333;
}
input[type="text"], input[type="date"] {
  padding: 6px 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  min-width: 160px;
}
.login-btn, .upload-btn, .search-btn, .preview-btn {
  background-color: #2c9c3f;
  border: none;
  color: white;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
}
.login-btn:hover, .upload-btn:hover, .search-btn:hover, .preview-btn:hover {
  background-color: #248233;
}
.preview {
  margin-top: 20px;
  border-top: 1px solid #ccc;
  padding-top: 10px;
}
.preview-table {
  border-collapse: collapse;
  width: 100%;
}
.preview-table th, .preview-table td {
  border: 1px solid #ddd;
  padding: 8px;
}
.preview-table th {
  background-color: #f4f4f4;
}
.results {
  margin-top: 20px;
}
.results ul {
  padding-left: 20px;
}
  `]
})
export class AppComponent {
  username: string = '';
  usernameEntered = false;

  search = { shipTo: '', date: '' };
  results: string[] = [];
  selectedFile: File | null = null;
  fileContent: string | null = null;
  parsedCsv: string[][] = [];
  showPreview = false;

  enter() {
    if (!this.username.trim()) {
      alert('Please enter a username');
      return;
    }
    this.usernameEntered = true;
  }

  onFileSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    this.selectedFile = input.files?.[0] ?? null;
    this.fileContent = null;
    this.parsedCsv = [];
    this.showPreview = false;

    if (this.selectedFile) {
      const reader = new FileReader();
      reader.onload = () => {
        this.fileContent = reader.result as string;

        if (this.selectedFile?.name.endsWith('.csv')) {
          this.parsedCsv = this.fileContent
            .split('\n')
            .map(line => line.split(',').map(cell => cell.trim()));
        }
      };
      reader.readAsText(this.selectedFile);
    }
  }

  uploadFile() {
    if (!this.selectedFile) {
      alert('Please select a file first.');
      return;
    }
    console.log('Uploading file:', this.selectedFile.name);
    alert(`File "${this.selectedFile.name}" selected for upload`);
  }

  togglePreview() {
    this.showPreview = !this.showPreview;
  }

  runSearch() {
    console.log('Searching for Ship_To:', this.search.shipTo, 'Date:', this.search.date);
    this.results = [
      `Result for Ship_To: ${this.search.shipTo}, Date: ${this.search.date || 'n/a'}`
    ];
  }
}
