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
      
      <header class="header">
        <img src="https://images.search.yahoo.com/search/images;_ylt=AwrhULWmoL9oDQIAEfpXNyoA;_ylu=Y29sbwNiZjEEcG9zAzEEdnRpZAMEc2VjA3BpdnM-?p=WM+Logo&fr2=piv-web&type=G210US1357G91958Mb04d938ffb2bcb05d9cfc7aedeabdd92&fr=mcafee#id=8&iurl=https%3A%2F%2Fassets.stickpng.com%2Fimages%2F6133755882b156000425b3c0.png&action=click" alt="WM Logo" class="logo" />
        <span class="title">WMHS</span>
      </header>

      <!-- Upload file section -->
      <section class="upload-section">
        <label for="fileUpload">Upload a file:</label>
        <input type="file" id="fileUpload" (change)="onFileSelect($event)" />
        <button class="upload-btn" (click)="uploadFile()">Upload</button>
      </section>

      <!-- Search form -->
      <section class="search-container">
        <label>
          Ship_To:
          <input type="text" [(ngModel)]="search.shipTo" />
        </label>

        <button class="search-btn" (click)="runSearch()">Search</button>
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
  </ng-template>
</amplify-authenticator>
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


.upload-section {
  margin-bottom: 20px;
}
.upload-btn {
  background-color: #2c9c3f;
  border: none;
  color: white;
  padding: 6px 14px;
  border-radius: 4px;
  cursor: pointer;
  margin-left: 10px;
}
.upload-btn:hover {
  background-color: #248233;
}

.search-container {
  display: flex;
  align-items: flex-end;
  gap: 20px;
  margin-bottom: 20px;
}
.search-container label {
  display: flex;
  flex-direction: column;
  font-size: 14px;
  color: #333;
}
.search-container input {
  padding: 6px 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  min-width: 200px;
}
.search-btn {
  background-color: #2c9c3f;
  border: none;
  color: white;
  padding: 8px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
}
.search-btn:hover {
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
  search = { shipTo: '' };
  results: string[] = [];
  selectedFile: File | null = null;

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
    // TODO: Add Amplify upload logic here
  }

  runSearch() {
    console.log('Searching for Ship_To:', this.search.shipTo);
    // TODO: Replace with real Amplify/DynamoDB query
    this.results = [`Result for Ship_To: ${this.search.shipTo}`];
  }
}
