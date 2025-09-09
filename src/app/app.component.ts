import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AmplifyAuthenticatorModule } from '@aws-amplify/ui-angular';
import { uploadData } from 'aws-amplify/storage';
import { generateClient } from 'aws-amplify/api';
import type { GraphQLResult } from '@aws-amplify/api-graphql';

const client = generateClient();

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

      <!-- Upload Section -->
      <section class="upload-section">
        <label for="fileUpload">Upload a file:</label>
        <input type="file" id="fileUpload" (change)="onFileSelect($event)" />
        <button class="upload-btn" (click)="uploadFile()">Upload</button>
      </section>

      <!-- Search Section -->
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

  // Handle file selection
  onFileSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    this.selectedFile = input.files?.[0] ?? null;
  }

  // Upload file to S3
  async uploadFile() {
    if (!this.selectedFile) {
      alert('Please select a file first.');
      return;
    }
    try {
      const key = `${Date.now()}_${this.selectedFile.name}`;
      await uploadData({
        key,
        data: this.selectedFile,
        options: { contentType: this.selectedFile.type || 'application/octet-stream' }
      }).result;
      alert('Upload successful!');
    } catch (err) {
      console.error('Upload failed:', err);
      alert('Upload failed. Check console for details.');
    }
  }

  // Run search by Ship_To (replace with real schema fields)
  async runSearch() {
  try {
    const result = await client.graphql({
      query: /* GraphQL */ `
        query SearchFiles($shipTo: String) {
          listFiles(filter: { shipTo: { eq: $shipTo } }) {
            items { id filename uploadedAt shipTo }
          }
        }
      `,
      variables: { shipTo: this.search.shipTo }
    }) as GraphQLResult<any>;

    this.results = (result.data?.listFiles?.items ?? []).map(
      (f: any) => `${f.filename} (Ship_To: ${f.shipTo || 'n/a'})`
    );
  } catch (err) {
    console.error('Search failed:', err);
    alert('Search failed. Check console for details.');
  }
}
}
