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
    <main>
      <!-- Search form -->
      <div class="search-container">
        <label>
          Upload:
          <input type="text" [(ngModel)]="search.upload" />
        </label>

        <label>
          Ship_To:
          <input type="text" [(ngModel)]="search.shipTo" />
        </label>

        <label>
          Date:
          <input type="date" [(ngModel)]="search.date" />
        </label>

        <button class="search-btn" (click)="runSearch()">Search</button>
      </div>

      <!-- Placeholder results -->
      <h3>Results</h3>
      <p *ngIf="!results.length">No results found.</p>
      <ul>
        <li *ngFor="let item of results">{{ item }}</li>
      </ul>
    </main>
  </ng-template>
</amplify-authenticator>
  `,
  styles: [`
.search-container {
  display: flex;
  align-items: center;
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
  min-width: 180px;
}

.search-btn {
  background-color: #2c9c3f;
  border: none;
  color: #fff;
  padding: 8px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
  height: fit-content;
  margin-top: 20px;
}

.search-btn:hover {
  background-color: #248233;
}
  `]
})
export class AppComponent {
  search = { upload: '', shipTo: '', date: '' };
  results: string[] = [];

  runSearch() {
    console.log('Search clicked:', this.search);
    // Demo: just push search values into results
    this.results = [
      `Upload: ${this.search.upload}`,
      `Ship_To: ${this.search.shipTo}`,
      `Date: ${this.search.date}`
    ];
  }
}
