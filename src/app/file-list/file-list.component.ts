import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../../amplify/data/resource';

const client = generateClient<Schema>();

@Component({
  selector: 'app-file-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="file-list">
      <h3>Files</h3>
      <p *ngIf="!files.length">No files uploaded yet.</p>
      <ul>
        <li *ngFor="let file of files; trackBy: trackById">
          <span>{{ file.filename }} ({{ file.uploadedAt || 'n/a' }})</span>
          <button (click)="delete(file.id!)" [disabled]="!file.id">Delete</button>
        </li>
      </ul>
    </div>
  `,
  styles: [`
    .file-list {
      margin-top: 20px;
    }
    ul {
      list-style-type: none;
      padding: 0;
    }
    li {
      display: flex;
      justify-content: space-between;
      padding: 8px;
      border: 1px solid #ddd;
      border-radius: 6px;
      margin-bottom: 8px;
    }
    button {
      background: #e53e3e;
      border: none;
      color: white;
      padding: 4px 10px;
      border-radius: 4px;
      cursor: pointer;
    }
    button:hover {
      background: #c53030;
    }
  `]
})
export class FileListComponent implements OnInit, OnDestroy {
  files: Schema['File']['type'][] = [];
  private filesSub?: { unsubscribe(): void };

  ngOnInit(): void {
    this.filesSub = client.models.File.observeQuery({}).subscribe({
      next: ({ items }) => {
        this.files = items.slice().sort((a, b) => {
          const at = a.uploadedAt ? new Date(a.uploadedAt).getTime() : 0;
          const bt = b.uploadedAt ? new Date(b.uploadedAt).getTime() : 0;
          return bt - at;
        });
      },
      error: (err) => console.error('observeQuery error:', err),
    });
  }

  ngOnDestroy(): void {
    this.filesSub?.unsubscribe();
  }

  async delete(id: string) {
    try {
      await client.models.File.delete({ id });
      this.files = this.files.filter(f => f.id !== id);
    } catch (err) {
      console.error('Delete failed:', err);
    }
  }

  trackById(index: number, file: Schema['File']['type']) {
    return file.id;
  }
}
