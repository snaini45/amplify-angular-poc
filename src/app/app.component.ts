import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AmplifyAuthenticatorModule } from '@aws-amplify/ui-angular';

import { uploadData, getUrl, remove } from 'aws-amplify/storage';
import { generateClient } from 'aws-amplify/api';
import type { GraphQLResult } from '@aws-amplify/api-graphql';

type FileItem = {
  id: string;
  key: string;
  filename: string;
  size?: number | null;
  type?: string | null;
  uploadedAt?: string | null;
  owner?: string | null;
  url?: string; // signed S3 URL
};

const client = generateClient();

const createFileMutation = /* GraphQL */ `
  mutation CreateFile($input: CreateFileInput!) {
    createFile(input: $input) {
      id
      key
      filename
      size
      type
      uploadedAt
      owner
    }
  }
`;

const deleteFileMutation = /* GraphQL */ `
  mutation DeleteFile($input: DeleteFileInput!) {
    deleteFile(input: $input) { id }
  }
`;

const listFilesQuery = /* GraphQL */ `
  query ListFiles($filter: ModelFileFilterInput, $limit: Int, $nextToken: String) {
    listFiles(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items { id key filename size type uploadedAt owner }
      nextToken
    }
  }
`;

import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, AmplifyAuthenticatorModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
<amplify-authenticator>
  <ng-template amplifySlot="authenticated">
    <div class="container">
      <header>
        <h1>My File Uploader</h1>
        <amplify-sign-out></amplify-sign-out>
      </header>

      <section class="upload">
        <h2>Upload a file</h2>
        <input type="file" (change)="onSelect($event)" />
        <button [disabled]="!selectedFile()" (click)="upload()">Upload</button>

        <p *ngIf="status()">{{ status() }}</p>
        <div class="progress" *ngIf="showProgress()">
          <div class="bar" [style.width.%]="progress()"></div>
        </div>
      </section>

      <section class="files">
        <div class="toolbar">
          <h2>Your uploads</h2>
          <button (click)="refresh()">Refresh</button>
        </div>

        <div *ngIf="files().length === 0" class="empty">No files yet.</div>
        <ul class="file-list">
          <li *ngFor="let f of files()">
            <div class="meta">
              <div class="name">{{ f.filename }}</div>
              <div class="sub">
                <span>Type: {{ f.type || 'n/a' }}</span>
                <span>Size: {{ f.size || 0 }} bytes</span>
                <span>Uploaded: {{ f.uploadedAt ? (f.uploadedAt | date:'medium') : 'n/a' }}</span>
              </div>
            </div>
            <div class="actions">
              <a *ngIf="f.url" [href]="f.url" target="_blank" rel="noopener">Open</a>
              <button (click)="delete(f)">Delete</button>
            </div>
          </li>
        </ul>
      </section>
    </div>
  </ng-template>
</amplify-authenticator>
  `,
  styles: [`
.container { max-width: 880px; margin: 0 auto; padding: 24px; font-family: Inter, system-ui, Arial, sans-serif; }
header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
h1 { font-size: 24px; margin: 0; }
.upload, .files { background: #fff; padding: 16px; border-radius: 16px; box-shadow: 0 2px 12px rgba(0,0,0,0.06); margin-bottom: 24px; }
.upload h2, .files h2 { margin-top: 0; }
button { padding: 8px 14px; border-radius: 10px; border: 1px solid #e5e7eb; background: #f8fafc; cursor: pointer; margin-left: 8px; }
button[disabled] { opacity: .5; cursor: not-allowed; }
.toolbar { display: flex; justify-content: space-between; align-items: center; }
.empty { color: #666; }
.file-list { list-style: none; padding: 0; margin: 0; display: grid; gap: 12px; }
.file-list li { display: flex; justify-content: space-between; align-items: center; padding: 12px; border: 1px solid #eee; border-radius: 12px; }
.meta .name { font-weight: 600; }
.meta .sub { font-size: 12px; color: #666; display: flex; gap: 12px; }
.actions { display: flex; gap: 8px; }
.actions a { text-decoration: none; border: 1px solid #e5e7eb; padding: 6px 10px; border-radius: 8px; }
.progress { width: 100%; height: 6px; background: #eee; border-radius: 4px; margin-top: 6px; }
.progress .bar { height: 100%; background: #2563eb; border-radius: 4px; transition: width 0.3s ease; }
  `]
})
export class AppComponent implements OnInit {
  selectedFile = signal<File | null>(null);
  status = signal<string>('');
  progress = signal<number>(0);
  files = signal<FileItem[]>([]);

  // Only show the bar when we're in-flight and between 0–100
  showProgress = computed(() => this.progress() > 0 && this.progress() < 100);

  ngOnInit(): void {
    this.refresh();
  }

  onSelect(evt: Event) {
    const input = evt.target as HTMLInputElement;
    this.selectedFile.set(input.files?.[0] ?? null);
  }

  async upload() {
    try {
      const file = this.selectedFile();
      if (!file) return;

      const key = `${Date.now()}_${file.name}`;

      this.status.set('Uploading…');
      this.progress.set(0);

      // Upload with progress
      await uploadData({
        key,
        data: file,
        options: {
          accessLevel: 'protected',
          contentType: file.type || 'application/octet-stream',
          onProgress: (p) => {
            if (p.totalBytes && p.totalBytes > 0) {
              const pct = Math.round((p.transferredBytes / p.totalBytes) * 100);
              this.progress.set(pct);
              this.status.set(`Uploading: ${pct}%`);
            }
          }
        }
      }).result;

      this.status.set('Saving metadata…');
      await client.graphql({
        query: createFileMutation,
        variables: {
          input: {
            key,
            filename: file.name,
            size: file.size,
            type: file.type || null,
            uploadedAt: new Date().toISOString()
          }
        }
      });

      this.status.set('Done ✅');
      this.selectedFile.set(null);
      this.progress.set(0);
      await this.refresh();
    } catch (e) {
      console.error(e);
      this.status.set('Upload failed.');
    } finally {
      setTimeout(() => this.status.set(''), 4000);
    }
  }

  async refresh() {
    // Fetch first page (adjust limit if you expect many)
    const result = await client.graphql({ query: listFilesQuery, variables: { limit: 100 } }) as GraphQLResult<any>;
    const items: FileItem[] = (result.data?.listFiles?.items ?? []);

    const withUrls = await Promise.all(items.map(async (it) => {
      try {
        const urlRes = await getUrl({
          key: it.key,
          options: { accessLevel: 'protected', expiresIn: 3600 }
        });
        return { ...it, url: urlRes.url.toString() };
      } catch {
        // If the user can’t access someone else’s protected file, skip URL
        return { ...it, url: undefined };
      }
    }));

    withUrls.sort((a, b) => {
      const at = a.uploadedAt ? new Date(a.uploadedAt).getTime() : 0;
      const bt = b.uploadedAt ? new Date(b.uploadedAt).getTime() : 0;
      return bt - at;
    });

    this.files.set(withUrls);
  }

  async delete(f: FileItem) {
    try {
      this.status.set(`Deleting ${f.filename}…`);

      await remove({ key: f.key, options: { accessLevel: 'protected' } });
      await client.graphql({ query: deleteFileMutation, variables: { input: { id: f.id } } });

      this.status.set('Deleted ✅');
      await this.refresh();
    } catch (e) {
      console.error(e);
      this.status.set('Delete failed.');
    } finally {
      setTimeout(() => this.status.set(''), 4000);
    }
  }
}
