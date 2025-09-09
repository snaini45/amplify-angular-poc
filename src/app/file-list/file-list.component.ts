import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../../amplify/data/resource';

const client = generateClient<Schema>();

@Component({
  selector: 'app-file-list',
  standalone: true,
  imports: [FormsModule],
  template: `
    <!-- 🔍 Search Form -->
    <div class="search-form">
      <label>
        Upload:
        <input type="text" [(ngModel)]="search.upload" placeholder="Enter upload" />
      </label>

      <label>
        Ship_To:
        <input type="text" [(ngModel)]="search.shipTo" placeholder="Enter Ship_To" />
      </label>

      <label>
        Date:
        <input type="date" [(ngModel)]="search.date" />
      </label>

      <button class="search-btn" (click)="runSearch()">Search</button>
    </div>

    <!-- 📂 File List -->
    <h3>Recently Uploaded Files</h3>
    <ul>
      <li *ngFor="let file of files">
        {{ file.filename }} ({{ file.uploadedAt }})
        <button (click)="delete(file.id)">Delete</button>
      </li>
    </ul>

    <p *ngIf="!files.length">No files found.</p>
  `,
  styles: [`
    .search-form {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 20px;
    }

    .search-form label {
      display: flex;
      flex-direction: column;
      font-size: 14px;
      color: #333;
    }

    .search-form input {
      padding: 6px 8px;
      border: 1px solid #ccc;
      border-radius: 4px;
    }

    .search-btn {
      background-color: #2c9c3f; /* green */
      border: none;
      color: #fff;
      padding: 8px 20px;
      border-radius: 4px;
      cursor: pointer;
    }

    .search-btn:hover {
      background-color: #248233;
    }
  `]
})
export class FileListComponent implements OnInit, OnDestroy {
  files: Schema['File']['type'][] = [];
  private filesSub?: { unsubscribe(): void };

  // 🔎 search state
  search = {
    upload: '',
    shipTo: '',
    date: ''
  };

  ngOnInit(): void {
    // Default: subscribe to live updates for all files
    this.filesSub = client.models.File.observeQuery({}).subscribe({
      next: ({ items }) => {
        this.files = this.sortFiles(items);
      },
      error: (err) => console.error('observeQuery error:', err),
    });
  }

  ngOnDestroy(): void {
    this.filesSub?.unsubscribe();
  }

  async delete(id: string) {
    await client.models.File.delete({ id });
  }

  private sortFiles(items: Schema['File']['type'][]): Schema['File']['type'][] {
    return items.slice().sort((a, b) => {
      const at = a.uploadedAt ? new Date(a.uploadedAt).getTime() : 0;
      const bt = b.uploadedAt ? new Date(b.uploadedAt).getTime() : 0;
      return bt - at;
    });
  }

  async runSearch() {
    const predicates: any[] = [];

    if (this.search.upload) {
      predicates.push({ key: 'filename', operator: 'contains', operand: this.search.upload });
    }
    if (this.search.shipTo) {
      predicates.push({ key: 'shipTo', operator: 'eq', operand: this.search.shipTo });
    }
    if (this.search.date) {
      const start = new Date(this.search.date).toISOString();
      predicates.push({ key: 'uploadedAt', operator: 'ge', operand: start });
    }

    const result = await client.models.File.list({
      filter: predicates.length ? { and: predicates } : undefined
    });

    this.files = this.sortFiles(result.data);
  }
}
