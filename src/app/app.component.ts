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

    <!-- Search Row -->
    <section class="search-row">
      
      <!-- Upload -->
      <div class="form-group">
        <label>Upload:</label>
        <div class="inline">
          <input type="file" (change)="onFileSelect($event)" />
          <button class="upload-btn" (click)="uploadFile()">Upload</button>
        </div>
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

.login-box {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-width: 320px;
  margin: 80px auto;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background: #fafafa;
}
.login-box h2 {
  margin: 0 0 10px 0;
  font-size: 18px;
  color: #333;
}
.login-box input {
  padding: 8px 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
}
.login-btn {
  background-color: #2c9c3f;
  border: none;
  color: white;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
}
.login-btn:hover {
  background-color: #248233;
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
  min-width: 180px;
}

.upload-btn, .search-btn {
  background-color: #2c9c3f;
  border: none;
  color: white;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
}
.upload-btn:hover, .search-btn:hover {
  background-color: #248233;
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
  }

  uploadFile() {
    if (!this.selectedFile) {
      alert('Please select a file first.');
      return;
    }
    console.log('Uploading file:', this.selectedFile.name);
    alert(`File "${this.selectedFile.name}" selected for upload`);
  }

  runSearch() {
    console.log('Searching for Ship_To:', this.search.shipTo, 'Date:', this.search.date);
    this.results = [
      `Result for Ship_To: ${this.search.shipTo}, Date: ${this.search.date || 'n/a'}`
    ];
  }
}
