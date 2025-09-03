import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../../amplify/data/resource';

const client = generateClient<Schema>();

type FileEntry = Schema['FileEntry']['type'];

@Component({
  selector: 'app-file-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './file-list.component.html',
  styleUrls: ['./file-list.component.css'],
})
export class FileListComponent implements OnInit, OnDestroy {
  files: FileEntry[] = [];
  private filesSub: { unsubscribe: () => void } | null = null;

  ngOnInit(): void {
    this.filesSub = client.models.FileEntry.observeQuery().subscribe({
      next: ({ items }) => {
        this.files = items ?? [];
      },
      error: (err) => console.error('observeQuery error:', err),
    });
  }

  ngOnDestroy(): void {
    this.filesSub?.unsubscribe();
  }

  /** ✅ Delete a file entry */
  async deleteFile(id: string) {
    try {
      await client.models.FileEntry.delete({ id });
      console.log(`File entry with id ${id} deleted`);
    } catch (error) {
      console.error('Error deleting file:', error);
    }
  }

  trackById(_: number, f: FileEntry) {
    return f.id;
  }
}
