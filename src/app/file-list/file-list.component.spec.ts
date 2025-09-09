import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FileListComponent } from './file-list.component';
import 'jest';

const mockClient = {
  models: {
    File: {
      observeQuery: () => ({
        subscribe: ({ next }: any) => {
          next({
            items: [
              { id: '1', filename: 'test.txt', uploadedAt: '2025-09-08T12:00:00Z' }
            ]
          });
          return { unsubscribe: () => {} };
        }
      }),
      delete: jest.fn().mockResolvedValue(true)
    }
  }
};

jest.mock('aws-amplify/data', () => ({
  generateClient: () => mockClient
}));

describe('FileListComponent', () => {
  let component: FileListComponent;
  let fixture: ComponentFixture<FileListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FileListComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FileListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load files from observeQuery', () => {
    expect(component.files.length).toBe(1);
    expect(component.files[0].filename).toBe('test.txt');
  });

  it('should call delete and remove file from list', async () => {
    await component.delete('1');
    expect(mockClient.models.File.delete).toHaveBeenCalledWith({ id: '1' });
    expect(component.files.length).toBe(0);
  });
});
