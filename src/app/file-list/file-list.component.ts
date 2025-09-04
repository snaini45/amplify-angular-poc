import { Component, OnDestroy, OnInit } from '@angular/core';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../../amplify/data/resource';

const client = generateClient<Schema>();

@Component({
  selector: 'app-file-list',
  template: `<div>
    <ul>
      <li *ngFor="let file of files">
        {{ file.name }} ({{ file.uploadedAt }})
        <button (click)="delete(file.id)">Delete</button>
      </li>
    </ul>
  </div>`
})
export class FileListComponent implements OnInit, OnDestroy {
  files: Schema['File']['type'][] = [];
  private filesSub?: { unsubscribe(): void };

  ngOnInit(): void {
    // NOTE: observeQuery expects an input/options arg; pass {} for all items
    this.filesSub = client.models.File.observeQuery({}).subscribe({
      next: ({ items }) => {
        // items is typed; no implicit any
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
    await client.models.File.delete({ id });
  }
}
